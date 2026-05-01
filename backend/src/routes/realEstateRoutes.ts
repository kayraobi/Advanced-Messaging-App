import { Router, Request, Response } from 'express';
import { REAL_ESTATE_SEED } from '../data/realEstateSeed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: REAL_ESTATE_SEED });
});

router.get('/featured', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		data: REAL_ESTATE_SEED.filter((x) => x.featured),
	});
});

router.get('/by-type/:typeId', (req: Request, res: Response) => {
	const { typeId } = req.params;
	const data = REAL_ESTATE_SEED.filter((x) => {
		const id =
			typeof x.realEstateType === 'object' && x.realEstateType
				? (x.realEstateType as { _id: string })._id
				: x.realEstateType;
		return id === typeId;
	});
	res.status(200).json({ success: true, data });
});

router.get('/:id', (req: Request, res: Response) => {
	const found = REAL_ESTATE_SEED.find((x) => x._id === req.params.id);
	if (!found) {
		res.status(404).json({ success: false, message: 'Listing not found.' });
		return;
	}
	res.status(200).json({ success: true, data: found });
});

export default router;
