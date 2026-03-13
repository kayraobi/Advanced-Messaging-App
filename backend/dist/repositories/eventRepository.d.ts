export declare const eventRepository: {
    getAll: () => Promise<{
        id: number;
        title: string;
        date: string;
        capacity: number;
        currentRSVP: number;
    }[]>;
    getById: (id: number) => Promise<{
        id: number;
        title: string;
        date: string;
        capacity: number;
        currentRSVP: number;
    } | undefined>;
    create: (eventData: any) => Promise<any>;
    incrementRSVP: (id: number) => Promise<{
        id: number;
        title: string;
        date: string;
        capacity: number;
        currentRSVP: number;
    } | null>;
};
//# sourceMappingURL=eventRepository.d.ts.map