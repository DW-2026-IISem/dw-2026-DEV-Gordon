import { Router, Request, Response } from 'express';
import clienteRoutes from '../features/business/clientes/clientes.routes';
import campaniaRoutes from '../features/business/campanias/campanias.routes';
import hitoRoutes from '../features/business/hitos/hitos.routes';
import tareaRoutes from '../features/business/tareas/tareas.routes';
import entregableRoutes from '../features/business/entregables/entregables.routes';
import aprobacionRoutes from '../features/business/aprobaciones/aprobaciones.routes';
import usuariosRoutes from '../features/auth/users/users.routes';
import versionEntregableRoutes from '../features/business/version-entregables/version-entregables.routes';

const router = Router();

router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

router.use('/clientes', clienteRoutes);
router.use('/campanias', campaniaRoutes);
router.use('/hitos', hitoRoutes);
router.use('/tareas', tareaRoutes);
router.use('/entregables', entregableRoutes);
router.use('/version-entregables', versionEntregableRoutes);
router.use('/aprobaciones', aprobacionRoutes);
router.use('/usuarios', usuariosRoutes);

export default router;
