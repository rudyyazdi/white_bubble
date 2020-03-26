import { Request, Response, Router } from 'express';
import { OK } from 'http-status-codes';

// Init shared
const router = Router();

router.get('/', async (req: Request, res: Response) => {
    return res.status(OK).send('<3');
});

export default router;
