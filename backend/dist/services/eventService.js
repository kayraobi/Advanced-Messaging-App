"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventService = void 0;
const eventRepository_1 = require("../repositories/eventRepository");
exports.eventService = {
    fetchAllEvents: async () => {
        return await eventRepository_1.eventRepository.getAll();
    },
    fetchEventById: async (id) => {
        return await eventRepository_1.eventRepository.getById(id);
    },
    addEvent: async (eventData) => {
        if (!eventData.title || !eventData.capacity) {
            throw new Error("Missing required event fields");
        }
        return await eventRepository_1.eventRepository.create(eventData);
    },
    processRsvp: async (eventId, userId) => {
        const event = await eventRepository_1.eventRepository.getById(eventId);
        if (!event)
            throw new Error("Event not found");
        if (event.currentRSVP >= event.capacity) {
            // Bekleme listesi mantığı buraya eklenecek
            throw new Error("Event is fully booked. Waitlist logic will apply here.");
        }
        const updatedEvent = await eventRepository_1.eventRepository.incrementRSVP(eventId);
        return `Successfully RSVP'd to ${updatedEvent?.title}. Current RSVP: ${updatedEvent?.currentRSVP}`;
    }
};
//# sourceMappingURL=eventService.js.map