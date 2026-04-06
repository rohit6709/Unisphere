import cron from 'node-cron';
import mongoose from 'mongoose';
import { Event } from '../models/event.model.js';
import { Club } from '../models/club.model.js';
import { Registration } from '../models/registration.model.js';
import { EventGroup } from '../models/eventGroup.model.js';
import { ApprovalLog } from '../models/approvalLog.model';
import { ApiError } from '../utils/ApiError.js';
import { ApiResponse } from '../utils/ApiResponse.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { scheduleGroupDissolution, cancelGroupDissolution } from '../queues/queue.js';

const createLog = async ({
    eventId,
    clubId,
    action,
    performedBy = null,
    performedByModel = null,
    fromStatus = null,
    toStatus = null,
    reason = null,
    metaData = null
}) => {
    try {
        await ApprovalLog.create({
            eventId: eventId,
            club: clubId,
            action,
            performedBy,
            performedByModel,
            fromStatus,
            toStatus,
            reason,
            metaData
        })
    } catch (error) {
        console.error(`[AUDIT_LOG] Failed to log ${action} for event ${eventId}: `, error.message);
    }
}

const detectConflicts = async (event, excludeId = null) => {
    const filter = {
        "venue.name": event.venue.name,
        status: { $in: ["approved", "live"] },
        startsAt: { $lt: event.endsAt },
        endsAt: { $gt: event.startsAt }
    };
    if(excludeId){
        filter._id = { $ne: excludeId };
    }

    return await Event.findOne(filter).populate("club", "name").select("title startsAt endsAt club") || null;
}

const validateEventDates = (startsAt,endsAt, registrationDeadline, checkFuture = true) => {
    const start = new Date(startsAt);
    const end = new Date(endsAt);
    const deadline = new Date(registrationDeadline);

    if(isNaN(start) || isNaN(end) || isNaN(deadline)){
        throw new ApiError(400, "Invalid date format");
    }
    if(checkFuture && start < new Date()){
        throw new ApiError(400, "Event start time must be in the future");
    }
    if(start >= end){
        throw new ApiError(400, "Event start time must be before end time");
    }
    if(deadline >= start){
        throw new ApiError(400, "Registration deadline must be before event start time");
    }
    return { start, end, deadline };
}

const resolvePerformerModel = (role) => {
    if(["admin", "superadmin"].includes(role)){
        return "Admin";
    }
    if(["faculty", "hod"].includes(role)){
        return "Faculty";
    }
    return "Student";
}

const validateObjectId = (id, label = "ID") => {
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400, `Invalid ${label} format`);
    }
}

// Club scoped controllers
//creates event group and auto adds president, vice president and advisors
const createEventGroup = async (event, club) => {
    try {
        const automembers = [];
        if(club.president){
            automembers.push({
                user: club.president,
                userModel: "Student",
                role: "president",
                joinedAt: new Date()
            })
        }
        if(club.vicePresident){
            automembers.push({
                user: club.vicePresident,
                userModel: "Student",
                role: "vicePresident",
                joinedAt: new Date()
            })
        }
        for(const advisorId of club.advisors){
            automembers.push({
                user: advisorId,
                userModel: "Faculty",
                role: "advisor",
                joinedAt: new Date()
            })
        }

        const group = await EventGroup.create({
            event: event._id,
            club: club._id,
            name: `${event.title} - Group`,
            members: automembers,
            status: "active"
        })

        console.log(`Created event group ${group._id} for event ${event._id}`);
        return group;
    } catch (error) {
        if(error.code === 11000){
            return await EventGroup.findOne({ event: event._id });
        }
        console.error(`Error creating event group for event ${event._id}:`, error.message);
        return null;
    }
}

//President, Vice president, Admin : create event
const createEvent = asyncHandler(async (req, res) => {
    const { title, description, eventType, visibility, startsAt, endsAt, duration, registrationDeadline, venue, maxParticipants, posterUrl } = req.body;
    if(!title || !description || !startsAt || !endsAt || !registrationDeadline || !venue?.name || !maxParticipants){
        throw new ApiError(400, "Missing required fields");
    }

    const { start, end, deadline } = validateEventDates(startsAt, endsAt, registrationDeadline, true);
    const performerModel = resolvePerformerModel(req.user.role);

    const event = await Event.create({
        title: title.trim(),
        description: description.trim(),
        eventType: eventType || "other",
        visibility: visibility || "club_only",
        club: req.club._id,
        submittedBy: req.user._id,
        submittedByModel: performerModel,
        startsAt: start,
        endsAt: end,
        duration: duration || Math.round((end - start) / (1000 * 60)),
        registrationDeadline: deadline,
        venue: {
            name: venue.name.trim(),
            building: venue.building? venue.building.trim() : null,
            capacity: venue.capacity || null
        },
        maxParticipants,
        posterUrl: posterUrl || null,
        status: "draft"
    });

    await createLog({
        eventId: event._id,
        clubId: req.club._id,
        action: "created",
        performedBy: req.user._id,
        performedByModel: performerModel,
        toStatus: "draft"
    });

    return res.status(201).json(new ApiResponse(201, event, "Event created as draft"));
})

//President, Vice president, admin : submit event for approval
const submitEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const event = await Event.findOne({ _id: eventId, club: req.club._id });
    if(!event){
        throw new ApiError(404, "Event not found in this club");
    }
    if(!["draft", "rejected"].includes(event.status)){
        throw new ApiError(400, `Event cannot be submitted from ${event.status} status`);
    }

    const isResubmission = event.status === "rejected";
    const fromStatus = event.status;

    event.status = "pending_approval";
    event.rejectionReason = null;
    await event.save();

    await createLog({
        eventId: event._id,
        clubId: req.club._id,
        action: isResubmission ? "resubmitted" : "submitted",
        performedBy: req.user._id,
        performedByModel: resolvePerformerModel(req.user.role),
        fromStatus,
        toStatus: "pending_approval"
    });

    return res.status(200).json(new ApiResponse(200, event, `Event ${isResubmission ? "resubmitted" : "submitted"} for approval`));
})

//President, Vice president, admin : update event
const updateEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const allowedFields = ["title", "description", "eventType", "visibility", "startsAt", "endsAt", "duration", "registrationDeadline", "venue", "maxParticipants", "posterUrl"];

    const updates = {};
    for(const field of allowedFields){
        if(req.body[field] !== undefined){
            updates[field] = req.body[field];
        }
    }

    if(!Object.keys(updates).length){
        throw new ApiError(400, "No valid fields provided for update");
    }
    const event = await Event.findOne({ _id: eventId, club: req.club._id });
    if(!event){
        throw new ApiError(404, "Event not found in this club");
    }
    if(!["draft", "rejected"].includes(event.status)){
        throw new ApiError(400, "Only events in draft or rejected status can be edited");
    }
    if(updates.startsAt || updates.endsAt || updates.registrationDeadline){
        validateEventDates(
            updates.startsAt ||event.startsAt,
            updates.endsAt || event.endsAt,
            updates.registrationDeadline || event.registrationDeadline,
            true
        )
    }

    if(updates.maxParticipants !== undefined){
        if(updates.maxParticipants < 1){
            throw new ApiError(400, "Max participants must be at least 1");
        }
        const currentParticipants = await Registration.countDocuments({
            event: eventId,
            status: "registered"
        })
        if(updates.maxParticipants < currentParticipants){
            throw new ApiError(400, `Cannot reduce max participants to ${updates.maxParticipants}. ` +
                `${currentParticipants} students are already registered`);
        }
    }
    if(updates.title){
        updates.title = updates.title.trim();
    }
    if(updates.description){
        updates.description = updates.description.trim();
    }
    if(updates.venue?.name){
        updates.venue.name = updates.venue.name.trim();
    }
    if(updates.venue?.building){
        updates.venue.building = updates.venue.building.trim();
    }

    if(updates.startsAt || updates.endsAt){
        const start = new Date(updates.startsAt || event.startsAt);
        const end = new Date(updates.endsAt || event.endsAt);
        updates.duration = Math.round((end - start) / (1000 * 60));
    }
    const updatedEvent = await Event.findByIdAndUpdate(
        eventId,
        { $set: updates },
        { new: true, runValidators: true }
    );
    return res.status(200).json(new ApiResponse(200, updatedEvent, "Event updated successfully"));
})

//Advisor, Admin : Review event, approve or reject
// on approve : create group and auto adds president/VP/advisors
const reviewEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const { action, rejectionReason } = req.body;

    if(!["approve", "reject"].includes(action)){
        throw new ApiError(400, "Action must be either approve or reject");
    }

    const event = await Event.findOne({ _id: eventId, club: req.club._id });
    if(!event){
        throw new ApiError(404, "Event not found in this club");
    }
    if(event.status !== "pending_approval"){
        throw new ApiError(400, `Event cannot be reviewed from ${event.status} status`);
    }
    const  fromStatus = event.status;
    const performerModel = resolvePerformerModel(req.user.role);
    if(action === "approve"){
        const conflict = await detectConflicts(event, event._id);
        if(conflict){
            event.hasConflict = true;
            event.conflictsDetails = `Venue "${event.venue.name}" is already booked by "${conflict.title}" ` +
                `(${conflict.club?.name}) from ${conflict.startsAt.toISOString()} ` +
                `to ${conflict.endsAt.toISOString()}`;

                await createLog({
                    eventId: event._id,
                    clubId: req.club._id,
                    action: "conflict_flagged",
                    performedBy: req.user._id,
                    performedByModel: performerModel,
                    metaData: { conflictWith: conflict._id, details: event.conflictsDetails }
                });
        }
        event.status = "approved";
        event.reviewedBy = req.user._id;
        event.reviewedAt = new Date();
        event.rejectionReason = null;
        await event.save();

        const club = await Club.findById(req.club._id).select("president vicePresident advisors");

        const group = await createEventGroup(event, club);

        if(group){
            try {
                const jobId = await scheduleGroupDissolution({
                    eventGroupId: group._id.toString(),
                    eventId: event._id.toString(),
                    clubId: req.club._id.toString(),
                    endsAt: event.endsAt
                })

                group.disolveJobId = jobId;
                await group.save();
            } catch (error) {
                console.error(`Failed to schedule group dissolution for event ${event._id}:`, error.message);
            }
        }

        await createLog({
            eventId: event._id,
            clubId: req.club._id,
            action: "approved",
            performedBy: req.user._id,
            performedByModel: performerModel,
            fromStatus,
            toStatus: "approved",
            metaData: { hasConflict: !!conflict, eventGroupId: group?._id || null }
        })

        return res.status(200).json(new ApiResponse(200, { event, eventGroup: group ? { id: group._id, name: group.name, memberCount: group.members.length } : null }, conflict ? "Event approved with conflicts" : "Event approved successfully"));
    }
    else{
        if(!rejectionReason || rejectionReason.trim() === ""){
            throw new ApiError(400, "Rejection reason is required when rejecting an event");
        }
        event.status = "rejected";
        event.reviewedBy = req.user._id;
        event.reviewedAt = new Date();
        event.rejectionReason = rejectionReason.trim();
        await event.save();

        await createLog({
            eventId: event._id,
            clubId: req.club._id,
            action: "rejected",
            performedBy: req.user._id,
            performedByModel: performerModel,
            fromStatus,
            toStatus: "rejected",
            reason: rejectionReason.trim()
        });

        return res.status(200).json(new ApiResponse(200, event, "Event rejected successfully. President can edit the event details and resubmit for approval."));

    }
})

//President, VicePreident, Admin, advisor : cancel event
const cancelEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const { cancellationReason } = req.body;
    if(!cancellationReason || cancellationReason.trim() === ""){
        throw new ApiError(400, "Cancellation reason is required when cancelling an event");
    }

    const event = await Event.findOne({ _id: eventId, club: req.club._id });
    if(!event){
        throw new ApiError(404, "Event not found in this club");
    }

    if(!["completed", "archived", "cancelled"].includes(event.status)){
        throw new ApiError(400, `Event cannot be cancelled from ${event.status} status`);
    }
    const fromStatus = event.status;
    const performerModel = resolvePerformerModel(req.user.role);

    event.status = "cancelled";
    event.cancellationReason = cancellationReason.trim();
    event.cancelledBy = req.user._id;
    event.cancelledByModel = performerModel;
    await event.save();

    if(["approved", "live"].includes(fromStatus)){
        const group = await EventGroup.findOne({ event: eventId });
        if(group){
            if(group.disolveJobId){
                await cancelGroupDissolution(group.disolveJobId);
            }
            group.status = "dissolved";
            group.dissolvedAt = new Date();
            group.disolveJobId = null;
            await group.save();
        }
    }

    await createLog({
        eventId: event._id,
        clubId: req.club._id,
        action: "cancelled",
        performedBy: req.user._id,
        performedByModel: performerModel,
        fromStatus,
        toStatus: "cancelled",
        reason: cancellationReason.trim()
    })

    return res.status(200).json(new ApiResponse(200, event, "Event cancelled successfully"));
})

// Advisor, president, vice president, admin : get all events for this club
const getClubEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, eventType, search } = req.query;
    const filter = { club: req.club._id };
    if(status){
        filter.status = status;
        }
        if(eventType){
            filter.eventType = eventType;
        }
        if(search){
                filter.$or = [
                    { title: { $regex: search, $options: "i" } },
                    { description: { $regex: search, $options: "i" } }
                ]
            }
            
            const skip = (Number(page) - 1) * Number(limit);

            const [events, total, statusSummary] = await Promise.all([
                Event.find(filter)
                    .populate("submittedBy", "name rollNo")
                    .populate("reviewedBy", "name employeeId")
                    .sort({ createdAt: -1 })
                        .skip(skip)
                        .limit(Number(limit)),
                Event.countDocuments(filter),
                Event.aggregate([
                    { $match: { club: req.club._id } },
                    { $group: { _id: "$status", count: { $sum: 1 } } },
                ])
            ])

            const summary = statusSummary.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})

            return res.status(200).json(new ApiResponse(200, { events, summary, pagination: {
                total,
                page: Number(page),
                limit: Number(limit),
                totalPages: Math.ceil(total / Number(limit))
            }}, "Events retrieved successfully"));   
})

//Advisor, admin : get pending events
const getPendingEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10 } = req.query;

    const filter = { club: req.club._id, status: "pending_approval" };
    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate("submittedBy", "name rollNo")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Event.countDocuments(filter)
    ])

    return res.status(200)
        .json(new ApiResponse(200, {events, pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        }}, "Pending events retrieved successfully"));   
})

//All club roles : single event details
const getEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const event = await Event.findOne({ _id: eventId, club: req.club._id })
        .populate("submittedBy", "name rollNo employeeId")
        .populate("reviewedBy", "name employeeId")
        .populate("registeredMembers.student", "name email rollNo");

        if(!event){
            throw new ApiError(404, "Event not found in this club");
        }
        if(event.status === "draft" && req.clubRole === "member"){
            throw new ApiError(403, "Members cannot view draft events");
        }

        return res.status(200)
            .json(new ApiResponse(200, event, "Event details retrieved successfully"));
})

//Advisor, admin : get approval log for an event
const getEventLogs = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const event = await Event.findOne({ _id: eventId, club: req.club._id });
    if(!event){
        throw new ApiError(404, "Event not found in this club");
    }

    const logs = await ApprovalLog.find({ eventId: eventId })
        .populate("performedBy", "name employeeId rollNo")
        .sort({ createdAt: 1 });

    return res.status(200)
        .json(new ApiResponse(200, logs, "Event logs retrieved successfully"));

})

//flat controllers

//Admin: all events across clubs all clubs
const getAllEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status, clubId, eventType, visibility, search } = req.query;
    const filter = {};
    if(status){
        filter.status = status;
    }
    if(clubId){
        validateObjectId(clubId, "club ID");
        filter.club = clubId;
    }
    if(eventType){
        filter.eventType = eventType;
    }
    if(visibility){
        filter.visibility = visibility;
    }
    if(search){
        filter.$or = [
            { title: { $regex: search, $options: "i" } },
            { description: { $regex: search, $options: "i" } }
        ]
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate("club", "name department")
            .populate("submittedBy", "name rollNo employeeId")
            .populate("reviewedBy", "name employeeId")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Event.countDocuments(filter)
    ])

    return res.status(200)
        .json(new ApiResponse(200, { events, pagination: {
            total,
            page: Number(page),
            limit: Number(limit),
            totalPages: Math.ceil(total / Number(limit))
        }}, "Events retrieved successfully"));
})

//Student see open events + club_only events for clubs they belong to
const getPublicEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, eventType, search, featured } = req.query;
    
    const studentClubs = await Club.find({ members: req.user._id }).select("_id");
    const clubIds = studentClubs.map(c => c._id);

    const filter = {
        status: { $in: ["approved", "live"] },
        $or: [
            { visibility: "open" },
            { visibility: "club_only", club: { $in: clubIds } }
        ]
    }

    if(eventType){
        filter.eventType = eventType;
    }
    if(featured === "true"){
        filter.isFeatured = true;
    }
    if(search){
        filter.$and = [{
            $or: [
                { title: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } }
            ]
        }]
    }

    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate("club", "name department")
            .populate("-conflictDetails -hasConflict")
            .sort({ isFeatured: -1, startsAt: 1 })
            .skip(skip)
            .limit(Number(limit)),
        Event.countDocuments(filter)
    ])

    return res.status(200)
        .json(new ApiResponse(200, { events, pagination: {
            total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit))
        }}, "Events retrieved successfully"));
})

//President/ Vice President: events they submitted accross clubs
const getMySubmittedEvents = asyncHandler(async (req, res) => {
    const { page = 1, limit = 10, status } = req.query;

    const filter = { submittedBy: req.user._id };
    if(status){
        filter.status = status;
    }
    const skip = (Number(page) - 1) * Number(limit);

    const [events, total] = await Promise.all([
        Event.find(filter)
            .populate("club", "name")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit)),
        Event.countDocuments(filter)
    ])

    return res.status(200)
        .json(new ApiResponse(200, { events, pagination: {
            total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit))
        }}, "Submitted events retrieved successfully"));
})


const toggleFeatured = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const event = await Event.findById(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }
    if(!["approved", "live"].includes(event.status)){
        throw new ApiError(400, "Only approved or live events can be featured");
    }

    event.isFeatured = !event.isFeatured;
    await event.save();

    await createLog({
        eventId: event._id,
        clubId: event.club,
        action: "featured",
        performedBy: req.user._id,
        performedByModel: "Admin",
        metaData: { isFeatured: event.isFeatured }
    })

    return res.status(200)
        .json(new ApiResponse(200, { isFeatured: event.isFeatured }, `Event ${event.isFeatured ? "marked as featured" : "removed from featured"}`));
})

const deleteEvent = asyncHandler(async (req, res) => {
    const { eventId } = req.params;
    validateObjectId(eventId, "event ID");

    const event = await Event.findById(eventId);
    if(!event){
        throw new ApiError(404, "Event not found");
    }
    if(!["draft", "rejected"].includes(event.status)){
        throw new ApiError(400, "Only events in draft or rejected status can be deleted");
    }

    await Event.findByIdAndDelete(eventId);

    await ApprovalLog.deleteMany({ event: eventId });

    return res.status(200)
        .json(new ApiResponse(200, {}, "Event deleted successfully"));
})

export const initEventCron = () => {
    // Approved - Live every minute
    cron.schedule("* * * * *", async () => {
        try{
            const now = new Date();
            const isActivate = await Event.find({

                status: "approved",
                startsAt: { $lte: now }
            }).select("_id club");

            for(const event of isActivate){
                await Event.findByIdAndUpdate(event._id, { status: "live" });
                await createLog({
                    eventId: event._id,
                    clubId: event.club,
                    action: "auto_live",
                    fromStatus: "approved",
                    toStatus: "live",
                })
            }
        }
        catch(err){
            console.error("[CRON][auto_live] failed: ", err.message);
        }
    })
    // Live - Completed every minute
    cron.schedule("* * * * *", async () => {
        try {
            const now = new Date();
            const isComplete = await Event.find({
                status: "live",
                endsAt: { $lte: now }
            }).select("_id club");

            for(const event of isComplete){
                await Event.findByIdAndUpdate(event._id, { status: "completed" });
                await createLog({
                    eventId: event._id,
                    clubId: event.club,
                    action: "auto_completed",
                    fromStatus: "live",
                    toStatus: "completed",
                })
            }
        } catch (error) {
            console.error("[CRON][auto_completed] failed: ", error.message);
        }
    })
    //Completed - Archived every day at midnight
    cron.schedule("0 0 * * *", async () => {
        try {
            const ninetyDaysAgo = new Date();
            ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

            const isArchive = await Event.find({
                status: "completed",
                endsAt: { $lte: ninetyDaysAgo }
             }).select("_id club");
            
            for(const event of isArchive){
                await Event.findByIdAndUpdate(event._id, { status: "archived" });
                await createLog({
                    eventId: event._id,
                    clubId: event.club,
                    action: "auto_archived",
                    fromStatus: "completed",
                    toStatus: "archived",
                })
            }
        } catch (error) {
            console.error("[CRON][auto_archived] failed: ", error.message);
        }
    })

    console.log("Event cron jobs initialized");
}

export {
    createEvent,
    submitEvent,
    updateEvent,
    reviewEvent,
    cancelEvent,
    getClubEvents,
    getPendingEvents,
    getEvent,
    getEventLogs,
    getAllEvents,
    getPublicEvents,
    getMySubmittedEvents,
    toggleFeatured,
    deleteEvent
}