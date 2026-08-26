import { Router } from "express";
import { requireAuth } from "../middleware/auth.js";
import {
  listConversations,
  createNewConversation,
  getConversation,
  renameConversationHandler,
  deleteConversationHandler,
} from "../controllers/conversations.controller.js";
import { sendMessage } from "../controllers/chat.controller.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);

conversationsRouter.get("/", listConversations);
conversationsRouter.post("/", createNewConversation);
conversationsRouter.get("/:id", getConversation);
conversationsRouter.patch("/:id", renameConversationHandler);
conversationsRouter.delete("/:id", deleteConversationHandler);
conversationsRouter.post("/:id/messages", sendMessage);
