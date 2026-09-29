import { Router } from 'express';
import { ClienteController } from './cliente.controller';

// SIN AUTH: ningún endpoint de cliente exige autenticación.
const router = Router();

router.get('/', ClienteController.getAll);
router.post('/', ClienteController.create);
router.patch('/:id/deactivate', ClienteController.deleteLogical);
router.get('/:id', ClienteController.getOne);
router.put('/:id', ClienteController.updatePut);
router.patch('/:id', ClienteController.updatePatch);
router.delete('/:id', ClienteController.deletePhysical);

export default router;
