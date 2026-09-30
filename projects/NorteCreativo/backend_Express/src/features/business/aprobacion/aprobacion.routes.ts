import { Router } from 'express';
import { AprobacionController } from './aprobacion.controller';

// SIN AUTH. La aprobación es un registro de auditoría: no hay PUT, PATCH ni DELETE.
const router = Router();

router.get('/', AprobacionController.getAll);
router.post('/', AprobacionController.create);
router.get('/:id', AprobacionController.getOne);

export default router;
