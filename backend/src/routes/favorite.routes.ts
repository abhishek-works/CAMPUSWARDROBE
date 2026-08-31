import { Router } from "express";
import { toggleFavorite, getMyFavorites } from "../controllers/favorite.controller";
import { authenticate } from "../middleware/auth";

const router = Router();

router.post("/toggle", authenticate, toggleFavorite);
router.get("/my", authenticate, getMyFavorites);

export default router;
