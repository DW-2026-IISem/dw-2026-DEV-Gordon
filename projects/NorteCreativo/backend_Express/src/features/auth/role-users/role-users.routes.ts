import { Router } from 'express';
import { authenticate, authorize } from '../access';
import { RoleUsersController } from './role-users.controller';

// JWT + RBAC: authenticate (401 sin token válido) y authorize (403 sin concesión activa para este method + path).
const router = Router();
const protegido = [authenticate, authorize];
const controller = new RoleUsersController();

router.get('/', ...protegido, controller.getAll.bind(controller));
router.post('/', ...protegido, controller.assign.bind(controller));
router.patch('/:id/deactivate', ...protegido, controller.deactivate.bind(controller));
router.patch('/:id/reactivate', ...protegido, controller.reactivate.bind(controller));
router.get('/:id', ...protegido, controller.getOne.bind(controller));

export default router;
