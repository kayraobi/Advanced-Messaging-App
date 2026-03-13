"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const eventController_1 = require("../controllers/eventController");
const router = (0, express_1.Router)();
// GET /api/events - Tüm etkinlikleri getir
router.get('/', eventController_1.getEvents);
// GET /api/events/:id - Tekil etkinlik detayı getir
router.get('/:id', eventController_1.getEventById);
// POST /api/events - Yeni etkinlik oluştur
router.post('/', eventController_1.createEvent);
// POST /api/events/:id/rsvp - Etkinliğe bilet al (RSVP)
router.post('/:id/rsvp', eventController_1.rsvpToEvent);
exports.default = router;
//# sourceMappingURL=eventRoutes.js.map