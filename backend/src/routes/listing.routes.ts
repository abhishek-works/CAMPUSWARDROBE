import { Router } from "express";
import {
  createListing,
  getListings,
  getListingById,
  updateListing,
  deleteListing,
  getMyListings,
} from "../controllers/listing.controller";
import { authenticate } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.get("/", getListings);
router.get("/my", authenticate, getMyListings);
router.get("/:id", getListingById);
router.post("/", authenticate, upload.array("images", 5), createListing);
router.put("/:id", authenticate, upload.array("images", 5), updateListing);
router.delete("/:id", authenticate, deleteListing);

export default router;
