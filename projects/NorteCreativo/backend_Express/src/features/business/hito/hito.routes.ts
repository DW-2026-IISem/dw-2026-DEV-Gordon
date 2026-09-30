import { Router } from 'express';
import { HitoController } from './hito.controller';

// SIN AUTH: ningún endpoint de hito exige autenticación.
const router = Router();

router.get('/', HitoController.getAll);
router.post('/', HitoController.create);
router.patch('/:id/deactivate', HitoController.deleteLogical);
router.get('/:id', HitoController.getOne);
router.put('/:id', HitoController.updatePut);
router.patch('/:id', HitoController.updatePatch);
router.delete('/:id', HitoController.deletePhysical);

export default router;
