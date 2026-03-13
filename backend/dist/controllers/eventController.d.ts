import { Request, Response } from 'express';
export declare const getEvents: (req: Request, res: Response) => Promise<void>;
export declare const getEventById: (req: Request, res: Response) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const createEvent: (req: Request, res: Response) => Promise<void>;
export declare const rsvpToEvent: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=eventController.d.ts.map