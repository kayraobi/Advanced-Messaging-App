import { Router, Request, Response } from 'express';
import { PLACES_SEED } from '../data/placesSeed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: PLACES_SEED });
});

router.get('/featured', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		data: PLACES_SEED.filter((p) => p.featured),
	});
});

router.get('/by-place-type/:typeId', (req: Request, res: Response) => {
	const { typeId } = req.params;
	const data = PLACES_SEED.filter((p) => {
		const id =
			typeof p.placeType === 'object' && p.placeType
				? (p.placeType as { _id: string })._id
				: p.placeType;
		return id === typeId;
	});
	res.status(200).json({ success: true, data });
});

router.get('/:id', (req: Request, res: Response) => {
	const found = PLACES_SEED.find((p) => p._id === req.params.id);
	if (!found) {
		res.status(404).json({ success: false, message: 'Place not found.' });
		return;
	}
	res.status(200).json({ success: true, data: found });
});

export default router;
