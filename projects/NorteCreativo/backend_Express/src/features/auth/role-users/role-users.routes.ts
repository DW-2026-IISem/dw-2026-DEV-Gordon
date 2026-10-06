import { Router } from 'express';
import { RoleUsersController } from './role-users.controller';

// SIN AUTH (temporal): se protegen en ISS-18 y ISS-21. Sin PUT/PATCH/DELETE: se asigna, se retira (lógico) y se reactiva.
const router = Router();
const controller = new RoleUsersController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.assign.bind(controller));
router.patch('/:id/deactivate', controller.deactivate.bind(controller));
router.patch('/:id/reactivate', controller.reactivate.bind(controller));
router.get('/:id', controller.getOne.bind(controller));

export default router;
