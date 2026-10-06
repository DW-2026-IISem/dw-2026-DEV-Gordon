import { Router } from 'express';
import { authenticate, authorize } from '../access';
import { RolesController } from './roles.controller';

// JWT + RBAC: authenticate (401 sin token válido) y authorize (403 sin concesión activa para este method + path).
const router = Router();
const protegido = [authenticate, authorize];
const controller = new RolesController();

router.get('/', ...protegido, controller.getAll.bind(controller));
router.post('/', ...protegido, controller.create.bind(controller));
router.patch('/:id/deactivate', ...protegido, controller.deleteLogical.bind(controller));
router.get('/:id', ...protegido, controller.getOne.bind(controller));
router.put('/:id', ...protegido, controller.updatePut.bind(controller));
router.patch('/:id', ...protegido, controller.updatePatch.bind(controller));
router.delete('/:id', ...protegido, controller.deletePhysical.bind(controller));

export default router;
