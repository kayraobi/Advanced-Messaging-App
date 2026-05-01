import { eventRepository } from '../repositories/eventRepository';

export const eventService = {
  fetchAllEvents: async () => {
    return await eventRepository.getAll();
  },

  fetchEventById: async (id: number) => {
    return await eventRepository.getById(id);
  },

  addEvent: async (eventData: any) => {
    if (!eventData.title || !eventData.capacity) {
      throw new Error("Missing required event fields");
    }
    return await eventRepository.create(eventData);
  },

  processRsvp: async (eventId: number, userId: number) => {
    const event = await eventRepository.getById(eventId);
    if (!event) throw new Error("Event not found");

    if (event.currentRSVP >= event.capacity) {
      // Bekleme listesi mantığı buraya eklenecek
      throw new Error("Event is fully booked. Waitlist logic will apply here.");
    }

    const updatedEvent = await eventRepository.incrementRSVP(eventId);
    return `Successfully RSVP'd to ${updatedEvent?.title}. Current RSVP: ${updatedEvent?.currentRSVP}`;
  }
};
