"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rsvpToEvent = exports.createEvent = exports.getEventById = exports.getEvents = void 0;
const eventService_1 = require("../services/eventService");
const getEvents = async (req, res) => {
    try {
        const events = await eventService_1.eventService.fetchAllEvents();
        res.status(200).json({ success: true, data: events });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEvents = getEvents;
const getEventById = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const event = await eventService_1.eventService.fetchEventById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Event not found' });
        }
        res.status(200).json({ success: true, data: event });
    }
    catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};
exports.getEventById = getEventById;
const createEvent = async (req, res) => {
    try {
        const newEvent = await eventService_1.eventService.addEvent(req.body);
        res.status(201).json({ success: true, data: newEvent });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.createEvent = createEvent;
const rsvpToEvent = async (req, res) => {
    try {
        const eventId = parseInt(req.params.id);
        const userId = 1; // Şimdilik mock user id
        const result = await eventService_1.eventService.processRsvp(eventId, userId);
        res.status(200).json({ success: true, message: result });
    }
    catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};
exports.rsvpToEvent = rsvpToEvent;
//# sourceMappingURL=eventController.js.map