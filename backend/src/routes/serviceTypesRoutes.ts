import { Router, Request, Response } from 'express';
import { SERVICE_TYPES_SEED } from '../data/serviceTypesSeed';

const router = Router();

router.get('/', (_req: Request, res: Response) => {
	res.status(200).json({ success: true, data: SERVICE_TYPES_SEED });
});

export default router;
