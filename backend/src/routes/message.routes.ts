import { Router } from "express";
import {
  sendMessage,
  getConversations,
  getMessagesWithUser,
} from "../controllers/message.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/", authenticate, sendMessage);
router.get("/conversations", authenticate, getConversations);
router.get("/:peerId", authenticate, getMessagesWithUser);

export default router;
