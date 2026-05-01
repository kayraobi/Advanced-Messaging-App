import { Router, Request, Response } from 'express';

const router = Router();

// Geçici mock auth rotası
router.post('/login', (req: Request, res: Response) => {
  const identifier = (req.body?.email ?? req.body?.username ?? req.body?.emailOrUsername ?? '').toLowerCase();
  const { password } = req.body;

  const validUsers = [
    { email: 'test@sarajevo.com', password: '123', user: { id: 1, name: 'Test User' } },
    { email: 'admin@sarajevoexpats.com', password: 'admin123', user: { id: 2, name: 'Admin User' } },
  ];

  const matched = validUsers.find((u) => u.email === identifier && u.password === password);
  if (matched) {
    return res.status(200).json({ success: true, token: 'mock-jwt-token-123', user: matched.user });
  }
  res.status(401).json({ success: false, message: 'Invalid credentials' });
});

router.post('/register', (req: Request, res: Response) => {
  res.status(201).json({ success: true, message: 'User registered successfully (Mock)' });
});

export default router;
