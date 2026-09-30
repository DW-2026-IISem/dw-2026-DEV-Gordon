import { Router } from 'express';
import { VersionEntregableController } from './version-entregable.controller';

// SIN AUTH: ningún endpoint de versión de entregable exige autenticación.
const router = Router();

router.get('/', VersionEntregableController.getAll);
router.post('/', VersionEntregableController.create);
router.patch('/:id/deactivate', VersionEntregableController.deleteLogical);
router.get('/:id', VersionEntregableController.getOne);
router.put('/:id', VersionEntregableController.updatePut);
router.patch('/:id', VersionEntregableController.updatePatch);
router.delete('/:id', VersionEntregableController.deletePhysical);

export default router;
