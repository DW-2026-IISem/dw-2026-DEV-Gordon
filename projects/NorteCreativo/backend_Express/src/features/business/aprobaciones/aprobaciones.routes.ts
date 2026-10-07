import { Router } from 'express';
import { authenticate, authorize } from '../../auth/access';
import { AprobacionesController } from './aprobaciones.controller';

// JWT + RBAC: authenticate (401 sin token válido) y authorize (403 sin concesión activa para este method + path).
// La aprobación es un registro de auditoría: no hay PUT, PATCH ni DELETE.
const router = Router();
const protegido = [authenticate, authorize];
const controller = new AprobacionesController();

router.get('/', ...protegido, controller.getAll.bind(controller));
router.post('/', ...protegido, controller.create.bind(controller));
router.get('/:id', ...protegido, controller.getOne.bind(controller));

export default router;
