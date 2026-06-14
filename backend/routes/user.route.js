import express from "express";
import { getUserSavedPosts, getSavedPostsFull, savePost } from "../controllers/user.controller.js"

const router = express.Router();

router.get("/saved", getUserSavedPosts)
router.get("/saved-posts", getSavedPostsFull)
router.patch("/save", savePost)

export default router;