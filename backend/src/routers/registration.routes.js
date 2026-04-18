import { Router } from "express";
import { registerForEvent, unregisterFromEvent, getEventRegistrations, getMyRegistrations } from "../controllers/registration.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import { verifyRole } from "../middlewares/role.middleware.js"; 

const registrationRouter = Router();

registrationRouter.route("/my-registrations").get(verifyJWT, verifyRole("student"), getMyRegistrations);

registrationRouter.route("/:eventId/register").post(verifyJWT, verifyRole("student"), registerForEvent);
registrationRouter.route("/:eventId/unregister").delete(verifyJWT, verifyRole("student"), unregisterFromEvent);

registrationRouter.route("/:eventId/registrations").get(verifyJWT, verifyRole("admin", "superadmin", "faculty", "hod"), getEventRegistrations);

export default registrationRouter;