import { Router } from 'express';
import { authenticate } from '../access';
import { RefreshTokensController } from './refresh-tokens.controller';

// Modalidad JWT: solo authenticate (sin authorize). Cada usuario opera ÚNICAMENTE sobre sus propias sesiones.
const router = Router();
const controller = new RefreshTokensController();

router.get('/', authenticate, controller.getAll.bind(controller));
// La ruta literal va ANTES que /:id para que el parámetro no la capture.
router.patch('/deactivate-all', authenticate, controller.revokeAll.bind(controller));
router.patch('/:id/deactivate', authenticate, controller.revokeOne.bind(controller));
router.get('/:id', authenticate, controller.getOne.bind(controller));
router.delete('/', authenticate, controller.purge.bind(controller));

export default router;
