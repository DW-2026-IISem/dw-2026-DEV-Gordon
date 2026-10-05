import { Router } from 'express';
import { AprobacionesController } from './aprobaciones.controller';

// SIN AUTH. La aprobación es un registro de auditoría: no hay PUT, PATCH ni DELETE.
const router = Router();
const controller = new AprobacionesController();

router.get('/', controller.getAll.bind(controller));
router.post('/', controller.create.bind(controller));
router.get('/:id', controller.getOne.bind(controller));

export default router;
