> **Workspace:** `frontend` (Norte Creativo) · **Pista:** Fase I — Fundamentos y Business (ISS-00 a ISS-07) · **Guía base:** `guia_front.docx` + https://tecnogua.com/academic/site/frontend2026/express/ · **Backend:** `backend_Express` (puerto 3012)

# ISS-01 — Bootstrap Angular 22 con CLI, Tailwind y PrimeNG (incluye 01A y 01B)

**Naturaleza:** práctico
**Issue GitHub:** `#NN`
**Responsable (desarrollador):** Carlos H. Zárate (DEV-Gordon)
**Revisor humano:** Carlos H. Zárate
**Dependencias:** ISS-00 en **Hecho**
**Página del docente:** https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-01-bootstrap-angular-22/ (guía Word §1; 01A y 01B solo están en el sitio)
**Commit esperado:** `feat(front-iss-01): bootstrap angular 22 esqueleto y menu Refs #NN`

---

## 1. SDD

**OBJ:** Al finalizar, existirá el proyecto Angular 22 de Norte Creativo con Tailwind y PrimeNG (Aura), un ejemplo de signals, el esqueleto Header/Aside/contenido/Footer y el menú del dominio, sin llamadas a la API.

**SPEC (qué debe quedar):**
- **Bootstrap (guía §1.1–1.8)**
  - Dentro de `projects/NorteCreativo/frontend/` (que ya tiene `docs/`): `ng new front-norte-creativo --directory . --style=tailwind --routing --ssr=false --skip-git --package-manager=npm --defaults`. No usar `ng new .` (el nombre no es válido para npm).
  - `npm install primeng @primeuix/themes primeicons @angular/cdk`.
  - `src/styles.css`: capas `theme, base, primeng, utilities`, `@import 'tailwindcss'` y PrimeIcons.
  - `app.config.ts`: router con `withComponentInputBinding`; `providePrimeNG` con preset Aura, `darkModeSelector: '.app-dark'` y capa `primeng`; `MessageService` y `ConfirmationService`.
  - `index.html`: `lang="es"`, título `Norte Creativo · Angular 22` y descripción.
  - `angular.json`: presupuesto `initial` de producción 750 kB aviso / 1 MB error.
  - `src/app/demo/ejemplo/`: tarjeta de un entregable ("Video de lanzamiento 30 s", total 1500000). `signal` guarda el objeto, `computed` calcula el total con IVA 19 % y `effect` registra cada cambio en consola. Botones ±100000, estado (`EN_PROCESO` / `ENTREGADO`), nombre y reiniciar.
- **01A · Esqueleto**
  - `ng generate component layout/header|aside|footer --skip-tests --defaults`.
  - Composición `flex min-h-screen flex-col`: Header `h-16` con `title = 'Norte Creativo'`, Aside `w-64 shrink-0` con `<nav aria-label="Navegación principal">`, `<main id="contenido" class="min-w-0">` y Footer "Norte Creativo · Agencia de campañas". CSS de `layout/` vacíos.
- **01B · Menú e interacción**
  - `ng generate component features/construir --skip-tests --defaults`. El esqueleto pasa a vivir en `Construir`, y `app.html` queda en `<router-outlet />` (guía §1.5).
  - `p-panelmenu` en el Aside y `p-drawer` en móvil, con: Inicio, Clientes, Campañas, Hitos, Tareas, Entregables, Versiones y Aprobaciones.
  - `Construir` es el único componente con estado: `mobileOpen`, `sidebarCollapsed` y `title` como `signal()`. Pasa `items` al Aside con `input()`; el Header emite `menuRequested` y el Aside emite `navigated` con `output()`.
  - Elegir una opción cambia el título y cierra el Drawer; la URL no cambia. Desde `lg` (1024 px) el botón alterna el Aside fijo; por debajo abre el Drawer.
  - `app.routes.ts`: `/construir` con `loadComponent`; `''` y `**` redirigen a `/construir`.

**REQ (restricciones):**
- Sin llamadas a `/api`.
- Sin PrimeFlex, sin `::ng-deep`, sin selectores `.p-*` ni CSS propio en `layout/`.
- No se adelantan environment, modelos, servicios ni Shell (ISS-02).

**AC:**
- [ ] **AC-1** `package.json`, `angular.json` y `src/` quedan en la raíz de `frontend/`, sin subcarpeta, y `docs/` sigue intacto.
- [ ] **AC-2** `npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0` muestra PrimeNG 22.x y themes 3.x, sin `invalid` ni `UNMET`; `styles.css` importa Tailwind y PrimeIcons; `providePrimeNG` usa Aura y `.app-dark`.
- [ ] **AC-3** Con el ejemplo montado, los botones cambian total, total con IVA, estado y nombre sin recargar, y la consola registra cada cambio desde el `effect`.
- [ ] **AC-4** A 1280 px se ven Header, Aside con las 8 opciones, contenido y Footer; el botón oculta el Aside sin abrir el Drawer.
- [ ] **AC-5** A 390 px el Aside no se ve, el botón abre el Drawer, elegir una opción cambia el título y lo cierra, y no hay scroll horizontal.
- [ ] **AC-6** `ng build` termina con código 0, la pestaña dice "Norte Creativo · Angular 22", la consola no muestra errores rojos y Network no muestra peticiones `/api`.

**Checklist interno (IA, En curso):**
- [ ] `ng new` + dependencias PrimeNG
- [ ] `styles.css`, `app.config.ts`, `index.html`, presupuesto
- [ ] ejemplo con signal / computed / effect
- [ ] esqueleto `layout/`
- [ ] `construir` con PanelMenu, Drawer, input / output
- [ ] ruta diferida

---

## 2. Revisión de AC

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

---

## 3. IA usada

**Herramienta / modelo:** Claude Code - Sonnet 5.5

**Fecha:**

**Prompt enviado**:

```text
Naturaleza: PRACTICO. Eres asistente SOLO de ISS-01 (con 01A y 01B) del frontend, no del frontend entero.

Implementa los AC de projects/NorteCreativo/frontend/docs/trazabilidad_NC/ISS-01.md dentro de
projects/NorteCreativo/frontend/ (la carpeta ya tiene docs/, no la borres).
Sigue la guia del docente (https://tecnogua.com/academic/site/frontend2026/express/construir/ISS-01-bootstrap-angular-22/)
adaptada a Norte Creativo.

1) Bootstrap: ng new front-norte-creativo --directory . --style=tailwind --routing --ssr=false --skip-git
   --package-manager=npm --defaults ; luego npm install primeng @primeuix/themes primeicons @angular/cdk.
   styles.css con capas theme, base, primeng, utilities + tailwindcss + primeicons. app.config.ts con
   withComponentInputBinding, providePrimeNG (preset Aura, darkModeSelector .app-dark, capa primeng),
   MessageService y ConfirmationService. index.html lang="es" y titulo "Norte Creativo · Angular 22".
   Presupuesto initial de produccion 750kB aviso / 1MB error.
   Componente src/app/demo/ejemplo: tarjeta de entregable "Video de lanzamiento 30 s", total 1500000;
   signal para el objeto, computed total con IVA 19%, effect que registra en consola; botones +-100000,
   estado EN_PROCESO/ENTREGADO, nombre y reiniciar.
2) 01A: ng generate component layout/header, layout/aside, layout/footer (--skip-tests --defaults).
   flex min-h-screen flex-col, header h-16 con title "Norte Creativo", aside w-64 shrink-0 con nav aria-label,
   main id="contenido" min-w-0, footer "Norte Creativo · Agencia de campañas". CSS de layout vacios.
3) 01B: ng generate component features/construir (--skip-tests --defaults). El esqueleto pasa a Construir y
   app.html queda en <router-outlet />. p-panelmenu en el aside y p-drawer en movil con: Inicio, Clientes,
   Campañas, Hitos, Tareas, Entregables, Versiones, Aprobaciones. Construir es el unico con estado
   (signals mobileOpen, sidebarCollapsed, title); items al aside con input(); header emite menuRequested y
   aside emite navigated con output(). La URL no cambia.
   app.routes.ts: /construir con loadComponent; '' y ** redirigen a /construir.

Sin llamadas a /api, sin PrimeFlex, sin ::ng-deep, sin selectores .p-* ni CSS propio. No adelantes environment,
modelos, servicios ni Shell (ISS-02). Verifica con ng build.
NO toques docs/proceso.md ni docs/trazabilidad_NC/. NO hagas commit ni push: lo hago yo.

Al final entrega tres listas: archivos tocados; como verifico cada AC (comandos y pasos exactos en el
navegador); que quedo fuera de alcance.
```

---

## 4. EVI

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | estructura en la raíz | AC-1 | ver docs/proceso.md, sección ISS - 01 | `ls -A projects/NorteCreativo/frontend` |
|       | dependencias y tema | AC-2 | ver docs/proceso.md, sección ISS - 01 | `npm ls primeng @primeuix/themes primeicons @angular/cdk --depth=0` + `grep -R "providePrimeNG\|@import 'tailwindcss'" src` |
|       | ejemplo signals | AC-3 | ver docs/proceso.md, sección ISS - 01 | montar `<app-ejemplo />` en `/construir` un momento, `npm start`, pulsar los botones con la consola abierta |
|       | escritorio | AC-4 | ver docs/proceso.md, sección ISS - 01 | `npm start` + `localhost:4200` a 1280 px |
|       | móvil | AC-5 | ver docs/proceso.md, sección ISS - 01 | DevTools en modo dispositivo a 390 px |
|       | build, consola y Network | AC-6 | ver docs/proceso.md, sección ISS - 01 | `npx ng build; echo $?` + Console + Network filtrando `api` |

**Commit (hash):** `feat(front-iss-01): bootstrap angular 22 esqueleto y menu Refs #NN`
**Autoevaluación de AC:** pendiente

---

## 5. Revisión humana del resultado

Preguntas guía: «¿Qué pone el tema de PrimeNG y qué pone Tailwind en la pantalla?». «Recorre `signal → computed → effect` en el ejemplo: ¿qué se recalcula solo y qué solo se observa?». «¿Qué dato viaja por `input()` al Aside y qué aviso vuelve por `output()`?»

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       | Carlos Z | Revisor | OBJ, SPEC, REQ, AC | este archivo |          | pendiente |

**Respuesta del autor (ajuste o justificación):**

el tema de primeng, aura, pone como se ven los componentes, los colores, los bordes, la tipografia, los estados de un boton o de una tabla y el modo oscuro con .app-dark, tailwind no pinta componentes, solo acomoda, pone el espacio, los margenes, el flex y el grid de la pagina, por eso en styles.css van por capas, theme, base, primeng y utilities, asi las utilidades de tailwind ganan cuando hace falta ajustar el layout sin pelear con el tema, y por eso no se escribe css propio ni se tocan clases .p-*, si algo se ve mal se corrige con el tema o con una utilidad, no con css suelto

en el ejemplo el signal guarda el entregable, el computed calcula el total con iva leyendo ese signal, entonces cada vez que cambio el total con los botones el total con iva se recalcula solo sin que yo llame nada, y el effect solo observa, no devuelve ningun valor, se ejecuta cuando cambia el signal y lo registra en la consola, el signal es el dato, el computed es un dato derivado que se recalcula solo y el effect es un efecto secundario, nunca se usa un effect para calcular algo que se puede hacer con computed

por input() viaja hacia el aside la lista de opciones del menu, los items, el aside no decide que opciones hay, solo las muestra, y por output() vuelven avisos hacia construir, el header emite menuRequested cuando se pulsa el boton del menu y el aside emite navigated cuando se elige una opcion, construir es el unico que tiene estado, recibe esos avisos y cambia sus signals, abre o cierra el drawer y cambia el titulo, asi los datos bajan por input y los eventos suben por output

---

## 6. Gate

**Estado:** pendiente
**Conclusión:**
**Trazabilidad final:**
