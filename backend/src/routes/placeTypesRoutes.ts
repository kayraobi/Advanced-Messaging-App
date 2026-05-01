import { Router, Request, Response } from 'express';
import { PLACE_TYPES_SEED } from '../data/placeTypesSeed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: PLACE_TYPES_SEED });
});

export default router;
