export declare const eventService: {
    fetchAllEvents: () => Promise<{
        id: number;
        title: string;
        date: string;
        capacity: number;
        currentRSVP: number;
    }[]>;
    fetchEventById: (id: number) => Promise<{
        id: number;
        title: string;
        date: string;
        capacity: number;
        currentRSVP: number;
    } | undefined>;
    addEvent: (eventData: any) => Promise<any>;
    processRsvp: (eventId: number, userId: number) => Promise<string>;
};
//# sourceMappingURL=eventService.d.ts.map