import { Router, Request, Response } from 'express';
import { SERVICES_SEED } from '../data/servicesSeed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: SERVICES_SEED });
});

router.get('/popular', (_req: Request, res: Response) => {
	res.status(200).json({
		success: true,
		data: SERVICES_SEED.filter((s) => s.popular),
	});
});

router.get('/:id', (req: Request, res: Response) => {
	const found = SERVICES_SEED.find((s) => s._id === req.params.id);
	if (!found) {
		res.status(404).json({ success: false, message: 'Service not found.' });
		return;
	}
	res.status(200).json({ success: true, data: found });
});

export default router;
