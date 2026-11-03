import { Router } from 'express';
import { authenticate, authorize } from '../../auth/access';
import { FacturasController } from './facturas.controller';

// JWT + RBAC: authenticate (401 sin token válido) y authorize (403 sin concesión activa para este method + path).
// La factura es un registro contable: no hay PUT, PATCH ni DELETE (una anulación queda fuera de alcance).
const router = Router();
const protegido = [authenticate, authorize];
const controller = new FacturasController();

router.get('/', ...protegido, controller.getAll.bind(controller));
router.post('/', ...protegido, controller.create.bind(controller));
router.get('/:id', ...protegido, controller.getOne.bind(controller));

export default router;
