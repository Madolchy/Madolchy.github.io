import type { Request, Response, NextFunction } from 'express';

export const VisitCounter = (req: Request, res: Response, next: NextFunction) => {
    let visits = req.cookies?.visits;
    console.log(visits)
    if (!visits) {
        visits = 0;
    }
    visits++;

    res.cookie('visits', visits, { maxAge: 1000 * 60 * 60})
    req.visitCounts = visits;
    next();

}