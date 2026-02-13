import express from "express";
import { sendMessage, getMessages,getConversations, } from "../controllers/message.controller.js";

const router = express.Router();

router.post("/send", sendMessage);

router.get("/conversations/:userId", getConversations);

router.get("/:user1/:user2", getMessages);



export default router;
