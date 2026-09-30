import { Router } from 'express';
import { CampaniaController } from './campania.controller';

// SIN AUTH: ningún endpoint de campaña exige autenticación.
const router = Router();

router.get('/', CampaniaController.getAll);
router.post('/', CampaniaController.create);
router.patch('/:id/deactivate', CampaniaController.deleteLogical);
router.get('/:id', CampaniaController.getOne);
router.put('/:id', CampaniaController.updatePut);
router.patch('/:id', CampaniaController.updatePatch);
router.delete('/:id', CampaniaController.deletePhysical);

export default router;
