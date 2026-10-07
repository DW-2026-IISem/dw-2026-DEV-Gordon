import { Router } from 'express';
import { authenticate } from '../access';
import { SessionController } from './session.controller';

const controller = new SessionController();

// /api/sesion — login, refresh y logout son OPEN (la credencial va en el body); perfil es JWT (solo authenticate).
const router = Router();
router.post('/login', controller.login.bind(controller));
router.post('/refresh', controller.refresh.bind(controller));
router.post('/logout', controller.logout.bind(controller));
router.get('/perfil', authenticate, controller.profile.bind(controller));

// /api/permisos — modalidad JWT: las concesiones efectivas del usuario autenticado (herramienta de depuración RBAC).
export const permisosRouter = Router();
permisosRouter.get('/', authenticate, controller.myPermissions.bind(controller));

export default router;
