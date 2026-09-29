import { Router, Request, Response } from 'express';
import clienteRoutes from '../features/business/cliente/cliente.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/clientes', clienteRoutes);

export default router;
