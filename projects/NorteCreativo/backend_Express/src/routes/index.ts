import { Router, Request, Response } from 'express';
import clienteRoutes from '../features/business/cliente/cliente.routes';
import campaniaRoutes from '../features/business/campania/campania.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/clientes', clienteRoutes);
router.use('/campanias', campaniaRoutes);

export default router;
