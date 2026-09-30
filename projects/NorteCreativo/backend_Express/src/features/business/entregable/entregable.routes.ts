import { Router } from 'express';
import { EntregableController } from './entregable.controller';

// SIN AUTH: ningún endpoint de entregable exige autenticación.
const router = Router();

router.get('/', EntregableController.getAll);
router.post('/', EntregableController.create);
router.patch('/:id/deactivate', EntregableController.deleteLogical);
router.get('/:id', EntregableController.getOne);
router.put('/:id', EntregableController.updatePut);
router.patch('/:id', EntregableController.updatePatch);
router.delete('/:id', EntregableController.deletePhysical);

export default router;
