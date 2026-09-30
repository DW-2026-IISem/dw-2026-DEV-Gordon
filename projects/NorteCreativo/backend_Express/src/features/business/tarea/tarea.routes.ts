import { Router } from 'express';
import { TareaController } from './tarea.controller';

// SIN AUTH: ningún endpoint de tarea exige autenticación.
const router = Router();

router.get('/', TareaController.getAll);
router.post('/', TareaController.create);
router.patch('/:id/deactivate', TareaController.deleteLogical);
router.get('/:id', TareaController.getOne);
router.put('/:id', TareaController.updatePut);
router.patch('/:id', TareaController.updatePatch);
router.delete('/:id', TareaController.deletePhysical);

export default router;
