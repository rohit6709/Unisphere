import { Notification } from "../models/notification.model.js";

const PRIORITY_LABEL = { low: "LOW", normal: "NORMAL", high: "HIGH", critical: "CRITICAL" };

const send = async ({
    recipients,
    type,
    title,
    body,
    data = {},
    priority = "normal",
}) => {
    if(!recipients.length){
        return;
    }

    const docs = recipients.map(({ id, model }) =>({
        recipient: id,
        recipientModel: model,
        type,
        title,
        body,
        data,
        priority,
        isRead: false,
        createdAt: now,
        updatedAt: now,
    }))

    const saved = await Notification.insertMany(docs, { ordered: false });

    console.log(`Saved ${saved.length} notifications for type ${type} with priority ${PRIORITY_LABEL[priority]}`);

    try{
        const { getIo } = await import("../sockets/socket.js");
        const io = getIo();

        for(const notification of saved){
            io.to(`user:${notification.recipient.toString()}`).emit("notification", {
                _id: notification._id,
                type: notification.type,
                title: notification.title,
                body: notification.body,
                data: notification.data,
                priority: notification.priority,
                isRead: false,
                createdAt: notification.createdAt,
            })
        }
    }
    catch(err){
        console.error("Error emitting notifications via socket.io:", err);
    }
}

const notifyEventSubmitted = ({ clubName, eventTitle, recipients, data = {} }) => {
    send({
        recipients,
        type: "event_submitted",
        title: `New Event awaiting approval`,
        body: `${eventTitle} has been submitted for approval in ${clubName}.`,
        data,
        priority: "normal",
    })
}

const notifyEventApproved = ({ eventTitle, clubName, recipients, data = {} }) => {
    send({
        recipients,
        type: "event_approved",
        title: "Event approved!",
        body: `${eventTitle} has been approved in ${clubName}.`,
        data,
        priority: "high"
    })
}

const notifyEventRejected = ({ eventTitle, clubName, recipients, data = {} }) => {
    send({
        recipients,
        type: "event_rejected",
        title: "Event rejected",
        body: `${eventTitle} has been rejected in ${clubName}.`,
        data,
        priority: "high"
    })
}

const notifyEventLive = ({ eventTitle, recipients, data = {} }) => {
    send({
        recipients,
        type: "event_live",
        title: "Event is live now!",
        body: `${eventTitle} is now live! Join in!`,
        data,
        priority: "high"
    })
}

const notifyEventCancelled = ({ eventTitle, reason, recipients, data = {} }) => {
    send({
        recipients,
        type: "event_cancelled",
        title: "Event cancelled",
        body: `${eventTitle} has been cancelled. Reason: ${reason}`,
        data,
        priority: "critical"
    })
}

const notifyClubRequestApproved = ({ clubName, recipients }) => {
    send({
        recipients,
        type: "club_request_approved",
        title: "Club request approved!",
        body: `Your request to create "${clubName}" has been approved`,
        data: {},
        priority: "high"
    })
}

const notifyClubRequestRejected = ({ clubName, reason, recipients }) => {
    send({
        recipients,
        type: "club_request_rejected",
        title: "Club request rejected",
        body: `Your request to create "${clubName}" has been rejected. Reason: ${reason}`,
        data: {},
        priority: "high"
    })
}

const notifyMemberRemoved = ({ clubName, recipients }) => {
    send({
        recipients,
        type: "club_member_removed",
        title: "Removed from club",
        body: `You have been removed from "${clubName}".`,
        data: {},
        priority: "critical"
    })
}

const notifyRoleAssigned = ({ clubName, role, recipients, data = {} }) => {
    send({
        recipients,
        type: "club_role_assigned",
        title: `You are now ${role} of ${clubName}!`,
        body: `Congratulations! You have been assigned the role of ${role} in ${clubName}.`,
        data,
        priority: "high"
    })
}

const notifyRegistrationConfirmed = ({ eventTitle, recipients, data = {} }) => {
    send({
        recipients,
        type: "registration_confirmed",
        title: "Registration confirmed",
        body: `You are registered for ${eventTitle}`,
        data,
        priority: "normal"
    });
}

const notifyNewMessage = ({ senderName, roomName, recipients, data = {} }) => {
    send({
        recipients,
        type: "new_message",
        title: `New message in ${roomName}`,
        body: `${senderName} sent a message`,
        data,
        priority: "low"
    });
}

export const notificationService = {
    send,
    notifyEventSubmitted,
    notifyEventApproved,
    notifyEventRejected,
    notifyEventLive,
    notifyEventCancelled,
    notifyClubRequestApproved,
    notifyClubRequestRejected,
    notifyMemberRemoved,
    notifyRoleAssigned,
    notifyRegistrationConfirmed,
    notifyNewMessage
}