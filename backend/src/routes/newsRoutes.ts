import { Router } from "express";
import {
	getNewsAllOrPaged,
	getNewsSlides,
	getNewsLatest,
	getNewsById,
} from "../controllers/newsController";

const router = Router();

router.get("/slides", getNewsSlides);
router.get("/latest", getNewsLatest);
router.get("/", getNewsAllOrPaged);
router.get("/:id", getNewsById);

export default router;
