import mongoose from "mongoose";
import { Message } from "../models/message.model.js";
import { EventGroup } from "../models/eventGroup.model.js";
import { Club } from "../models/club.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { verifyRoomAccess } from "../utils/roomAccess.js";

const restError = (msg, status = 400) => new ApiError(status, msg);

const validateObjectId = (id, label = "ID") => {
    if(!mongoose.Types.ObjectId.isValid(id)){
        throw new ApiError(400, `Invalid ${label}`);
    }
}

const getMessageHistory = asyncHandler(async (req, res) => {
    const { roomType, roomId } = req.params;
    const { before, limit = 50 } = req.query;

    validateObjectId(roomId, "room ID");
    if(!["EventGroup", "Club"].includes(roomType)){
        throw new ApiError(400, "Room type must be either EventGroup or Club");
    }
    if(roomType === "EventGroup"){
        const group = await EventGroup.findById(roomId).select("status members");
        if(!group){
            throw new ApiError(404, "Event group not found");
        }

        const isAdmin = ["admin", "superadmin"].includes(req.user.role);
        if(!isAdmin){
            const isMember = group.members.some(member => member.user.toString() === req.user._id.toString());
            if(!isMember){
                throw new ApiError(403, "You are not a member of this event group");
            }
        }
    }
    else{
        // Club
        await verifyRoomAccess(req.user, roomType, roomId, restError);
    }
    const filter = { room: roomId, roomType };
    if(before){
        validateObjectId(before, "cursor ID");
        filter._id = { $lt: new mongoose.Types.ObjectId(before) };
    }

    const parsedLimit = Math.min(Number(limit), 50);

    const messages = await Message.find(filter)
        .populate("sender", "name rollNo employeeId")
        .sort({ _id: -1 })
        .limit(parsedLimit);

        messages.reverse();

        const hasMore = messages.length === parsedLimit;
        const nextCursor = messages.length > 0 ? messages[0]._id : null;

        return res.status(200)
            .json(new ApiResponse(200, { messages, nextCursor, hasMore }, "Messages retrieved successfully"));
})

const deleteMessage = asyncHandler(async (req, res) => {
    const { roomType, roomId, messageId } = req.params;

    validateObjectId(roomId, "room ID");
    validateObjectId(messageId, "message ID");

    if(!["EventGroup", "Club"].includes(roomType)){
        throw new ApiError(400, "Room type must be either EventGroup or Club");
    }

    const message = await Message.findOne({ _id: messageId, room: roomId, roomType });
    if(!message){
        throw new ApiError(404, "Message not found");
    }
    if(message.isDeleted){
        throw new ApiError(400, "Message already deleted");
    }

    const isSender = message.sender?.toString() === req.user._id.toString();
    const isAdmin = ["admin", "superadmin"].includes(req.user.role);

    let isAdvisor = false;
    if(roomType === "EventGroup"){
        const group = await EventGroup.findById(roomId).select("members");
        isAdvisor = group?.members.some(member => member.user.toString() === req.user._id.toString() && member.role === "advisor")
    }
    else{
        const club = await Club.findById(roomId).select("advisors");
        isAdvisor = club?.advisors.some(id => id.toString() === req.user._id.toString());
    }

    if(!isSender && !isAdmin && !isAdvisor){
        throw new ApiError(403, "You do not have permission to delete this message");
    }

    const resolveModel = (role) => {
        if(["admin", "superadmin"].includes(role)){
            return "Admin";
        }
        if(["faculty", "hod"].includes(role)){
            return "Faculty";
        }
        return "Student";
    }

    message.isDeleted = true;
    message.deletedAt = new Date();
    message.deletedBy = req.user._id;
    message.deletedByModel = resolveModel(req.user.role);
    message.content = null;
    message.fileUrl = null;
    message.fileName = null;
    message.fileType = null;
    message.fileSize = null;

    await message.save();

    try {
        const { getIO } = await import("../sockets/socket.js");
        const { getRoomKey } = await import("../utils/roomAccess.js");

        const io = getIO();
        const roomKey = getRoomKey(roomType, roomId);

        io.to(roomKey).emit("message_deleted", { messageId: message._id, deletedAt: message.deletedAt });
    } catch (error) {
        console.error("Error occurred while emitting message_deleted event:", error);
    }

    return res.status(200).json(new ApiResponse(200, { messageId: message._id }, "Message deleted successfully"));

})

export { getMessageHistory, deleteMessage };