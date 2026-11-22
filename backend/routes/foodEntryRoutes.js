import { Router } from "express";
import {
  createFoodEntry,
  deleteFoodEntry,
  getFoodEntries,
  updateFoodEntry
} from "../controllers/foodEntryController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.use(requireAuth);
router.get("/", getFoodEntries);
router.post("/", createFoodEntry);
router.patch("/:id", updateFoodEntry);
router.delete("/:id", deleteFoodEntry);

export default router;
