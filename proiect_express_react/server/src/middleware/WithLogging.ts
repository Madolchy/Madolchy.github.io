import type { Request, Response, NextFunction } from 'express';

export const WithLogging = (req: Request, res: Response, next: NextFunction) => {
    
    
    next();

}