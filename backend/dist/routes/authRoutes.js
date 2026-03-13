"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const router = (0, express_1.Router)();
// Geçici mock auth rotası
router.post('/login', (req, res) => {
    const { email, password } = req.body;
    if (email === 'test@sarajevo.com' && password === '123') {
        return res.status(200).json({ success: true, token: 'mock-jwt-token-123', user: { id: 1, name: 'Test User' } });
    }
    res.status(401).json({ success: false, message: 'Invalid credentials' });
});
router.post('/register', (req, res) => {
    res.status(201).json({ success: true, message: 'User registered successfully (Mock)' });
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map