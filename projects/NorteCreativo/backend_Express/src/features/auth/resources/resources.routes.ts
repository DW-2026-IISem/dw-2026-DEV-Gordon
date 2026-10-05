import { Router } from 'express';
import { ResourcesController } from './resources.controller';

// SIN AUTH (temporal): se protegen en ISS-18 y ISS-21.
const router = Router();
const controller = new ResourcesController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id/deactivate', controller.deleteLogical.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.put('/:id', controller.updatePut.bind(controller));
router.patch('/:id', controller.updatePatch.bind(controller));
router.delete('/:id', controller.deletePhysical.bind(controller));

export default router;
