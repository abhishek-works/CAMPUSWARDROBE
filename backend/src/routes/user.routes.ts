import { Router } from "express";
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  getWallet,
  getPublicProfile,
} from "../controllers/user.controller";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { updateProfileSchema } from "../utils/validators";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/profile", authenticate, getProfile);
router.put("/profile", authenticate, validate(updateProfileSchema), updateProfile);
router.post("/upload-avatar", authenticate, upload.single("avatar"), uploadAvatar);
router.get("/wallet", authenticate, getWallet);
router.get("/:id/public", authenticate, getPublicProfile);

export default router;
