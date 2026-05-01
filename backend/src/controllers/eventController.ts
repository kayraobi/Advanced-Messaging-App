import { Request, Response } from 'express';
import { eventService } from '../services/eventService';

export const getEvents = async (req: Request, res: Response) => {
  try {
    const events = await eventService.fetchAllEvents();
    res.status(200).json({ success: true, data: events });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEventById = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const event = await eventService.fetchEventById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.status(200).json({ success: true, data: event });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createEvent = async (req: Request, res: Response) => {
  try {
    const newEvent = await eventService.addEvent(req.body);
    res.status(201).json({ success: true, data: newEvent });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};

export const rsvpToEvent = async (req: Request, res: Response) => {
  try {
    const eventId = parseInt(req.params.id);
    const userId = 1; // Şimdilik mock user id
    const result = await eventService.processRsvp(eventId, userId);
    res.status(200).json({ success: true, message: result });
  } catch (error: any) {
    res.status(400).json({ success: false, message: error.message });
  }
};
