import { Router } from "express";
import { getMessageHistory, deleteMessage } from "../controllers/chat.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const chatRouter = Router();

chatRouter.route("/:roomType/:roomId/messages").get(verifyJWT, getMessageHistory);
chatRouter.route("/:roomType/:roomId/messages/:messageId").delete(verifyJWT, deleteMessage);

export default chatRouter;