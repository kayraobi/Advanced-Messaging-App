import { Router, Request, Response } from 'express';
import { TRIPS_SEED } from '../data/tripsSeed';

const router = Router();

/** Demo availability calendars keyed by trip _id */
const AVAILABLE_DATES: Record<string, string[]> = {
	trip_mostar: ['2026-07-12', '2026-07-19', '2026-07-26'],
	trip_jahorina: ['2026-08-03', '2026-08-10', '2026-08-17'],
};

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: TRIPS_SEED });
});

router.get('/:id/available-dates', (req: Request, res: Response) => {
	const dates = AVAILABLE_DATES[req.params.id] ?? [];
	res.status(200).json({ success: true, data: dates });
});

router.post('/:id/apply', (req: Request, res: Response) => {
	const exists = TRIPS_SEED.some((t) => t._id === req.params.id);
	if (!exists) {
		res.status(404).json({ success: false, message: 'Trip not found.' });
		return;
	}
	res.status(200).json({ success: true, message: 'Application recorded (demo).' });
});

router.get('/:id', (req: Request, res: Response) => {
	const found = TRIPS_SEED.find((t) => t._id === req.params.id);
	if (!found) {
		res.status(404).json({ success: false, message: 'Trip not found.' });
		return;
	}
	res.status(200).json({ success: true, data: found });
});

export default router;
