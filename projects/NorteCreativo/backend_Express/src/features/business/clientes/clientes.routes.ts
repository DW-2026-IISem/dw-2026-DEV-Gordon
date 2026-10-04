import { Router } from 'express';
import { ClientesController } from './clientes.controller';

// SIN AUTH: ningún endpoint de cliente exige autenticación.
const router = Router();
const controller = new ClientesController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.patch('/:id/deactivate', controller.deleteLogical.bind(controller));
router.get('/:id', controller.getOne.bind(controller));
router.put('/:id', controller.updatePut.bind(controller));
router.patch('/:id', controller.updatePatch.bind(controller));
router.delete('/:id', controller.deletePhysical.bind(controller));

export default router;
