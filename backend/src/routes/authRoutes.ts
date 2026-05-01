import { Router, Request, Response } from 'express';

const router = Router();

// Geçici mock auth rotası
router.post('/login', (req: Request, res: Response) => {
  const { email, password } = req.body;
  if (email === 'test@sarajevo.com' && password === '123') {
    return res.status(200).json({ success: true, token: 'mock-jwt-token-123', user: { id: 1, name: 'Test User' } });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.post('/register', (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'User registered successfully (Mock)' });
});

export default router;
