import express, {
  type Application,
  type Request,
  type Response,
} from 'express';
import { router } from './routes';

const app: Application = express();

app.use(express.json());

app.use(router);

app.use((_req: Request, res: Response) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export { app };
