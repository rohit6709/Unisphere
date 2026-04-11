import { Router } from "express";
import { createEvent, submitEvent, updateEvent, reviewEvent, cancelEvent, getClubEvents, getPendingEvents, getEvent, getEventLogs, getAllEvents, getPublicEvents, getMySubmittedEvents, toggleFeatured, deleteEvent } from "../controllers/event.controller.js";
import { verifyJWT } from "../middleware/auth.middleware.js";
import { verifyRole } from "../middleware/role.middleware.js";
import { verifyClubAccess, requireClubRole } from "../middleware/clubAccess.middleware.js";
import eventGroupRouter from "./eventGroup.routes.js";


export const clubEventRouter = Router({ mergeParams: true });

clubEventRouter.use(verifyJWT, verifyClubAccess);

clubEventRouter.use("/:eventId/group", eventGroupRouter);

clubEventRouter.route("/pending").get(requireClubRole("advisor", "admin"), getPendingEvents);

clubEventRouter.route("/").get(getClubEvents).post(requireClubRole("president", "vicePresident", "admin"), createEvent);

clubEventRouter.route("/:eventId/submit").patch(requireClubRole("president", "vicePresident", "admin"), submitEvent);
clubEventRouter.route("/:eventId/update").patch(requireClubRole("president", "vicePresident", "admin"), updateEvent);

clubEventRouter.route("/:eventId/review").patch(requireClubRole("advisor", "admin"), reviewEvent);
clubEventRouter.route("/:eventId/logs").get(requireClubRole("advisor", "admin"), getEventLogs);

clubEventRouter.route("/:eventId/cancel").patch(requireClubRole("president", "vicePresident", "advisor", "admin"), cancelEvent);

clubEventRouter.route("/:eventId").get(getEvent);

const eventRouter = Router();

eventRouter.route("/all-events").get(verifyJWT, verifyRole("admin", "superadmin"), getAllEvents);
eventRouter.route("/my-submitted").get(verifyJWT, verifyRole("club_president", "club_vice_president", "admin", "superadmin"), getMySubmittedEvents);

eventRouter.route("/public").get(verifyJWT, getPublicEvents);

eventRouter.route("/:eventId/toggle-featured").patch(verifyJWT, verifyRole("admin", "superadmin"), toggleFeatured);

eventRouter.route("/:eventId").delete(verifyJWT, verifyRole("admin", "superadmin"), deleteEvent);

export default eventRouter;
