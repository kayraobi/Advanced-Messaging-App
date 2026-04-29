import { Request, Response } from "express";
import { NEWS_SEED } from "../data/newsSeed";

function paginate<T>(items: T[], page: number, limit: number) {
	const totalItems = items.length;
	const totalPages = Math.max(1, Math.ceil(totalItems / limit));
	const safePage = Math.min(Math.max(page, 1), totalPages);
	const start = (safePage - 1) * limit;
	const slice = items.slice(start, start + limit);
	return {
		data: slice,
		currentPage: safePage,
		totalPages,
		totalItems,
		itemsPerPage: limit,
		hasNextPage: safePage < totalPages,
		hasPrevPage: safePage > 1,
	};
}

/** GET /api/news?page=&limit= */
export const getNewsList = (req: Request, res: Response) => {
	const page = parseInt(String(req.query.page ?? "1"), 10) || 1;
	const limit = Math.min(parseInt(String(req.query.limit ?? "10"), 10) || 10, 50);
	const sorted = [...NEWS_SEED].sort((a, b) =>
		a.createdAt < b.createdAt ? 1 : -1,
	);
	res.json(paginate(sorted, page, limit));
};

/** GET /api/news/slides */
export const getNewsSlides = (_req: Request, res: Response) => {
	const slides = NEWS_SEED.filter((n) => n.showInSlider).sort(
		(a, b) => (a.slidePriority ?? 999) - (b.slidePriority ?? 999),
	);
	res.json(slides);
};

/** GET /api/news/latest */
export const getNewsLatest = (_req: Request, res: Response) => {
	const sorted = [...NEWS_SEED].sort((a, b) =>
		a.createdAt < b.createdAt ? 1 : -1,
	);
	res.json(sorted);
};

/** GET /api/news — no query: return array for simpler clients */
export const getNewsAllOrPaged = (req: Request, res: Response) => {
	if (req.query.page !== undefined || req.query.limit !== undefined) {
		return getNewsList(req, res);
	}
	const sorted = [...NEWS_SEED].sort((a, b) =>
		a.createdAt < b.createdAt ? 1 : -1,
	);
	res.json(sorted);
};

/** GET /api/news/:id */
export const getNewsById = (req: Request, res: Response) => {
	const { id } = req.params;
	const found = NEWS_SEED.find((n) => n._id === id);
	if (!found) {
		res.status(404).json({ message: "News not found." });
		return;
	}
	res.json(found);
};
