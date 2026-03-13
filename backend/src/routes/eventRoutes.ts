import { Router } from 'express';
import { getEvents, getEventById, createEvent, rsvpToEvent } from '../controllers/eventController';

const router = Router();

// GET /api/events - Tüm etkinlikleri getir
router.get('/', getEvents);

// GET /api/events/:id - Tekil etkinlik detayı getir
router.get('/:id', getEventById);

// POST /api/events - Yeni etkinlik oluştur
router.post('/', createEvent);

// POST /api/events/:id/rsvp - Etkinliğe bilet al (RSVP)
router.post('/:id/rsvp', rsvpToEvent);

export default router;
