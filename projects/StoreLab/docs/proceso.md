# Proceso

**Semana**: 04 - Fundamentos web, dominio y arquitectura
**Asignatura**: Desarrollo Web y Base de Datos II - 2026-II

Bitacora tecnica: registro de decisiones y de uso de IA autorizada.
Una entrada por consulta a IA o por decision que cambie el proyecto.

**Regla**: aqui nunca se pegan `.env`, contrasenas, tokens, IPs privadas ni datos reales de usuarios.

---

## PASO 1 - Identificacion del proyecto

**Proyecto**: Norte Creativo - Agencia de campanas (Proyecto 36)  
**Estudiante**: Carlos H. Zarate  
**GitHub**: DEV-Gordon  
**Repositorio**: dw-2026-DEV-Gordon  
**Fecha de inicio**: 02.09.26  

---

## PASO 2 - Arranque de la SDD

- **Issue / AC**: #01 - AC-S04-01 (documentar problema, actores y requisitos del dominio)
- **Herramienta**: Claude (Anthropic), interfaz web
- **Contexto**: narrativa del Proyecto 36, planeacion metodologica Semana 04,
  manual de prompts M4 del docente, enlace al repositorio
- **Que pedi**: explicacion de la metodologia MIRIA y de la cadena de trazabilidad;
  orientacion sobre por donde empezar a aplicarla al proyecto asignado
- **Que devolvio**:
  - MIRIA como ciclo de seis momentos agrupados en antes / durante / despues de clase.
  - La cadena OBJ -> SPEC -> REQ -> AC -> Issue -> Evidencia -> Gate, y que las
    secciones 3 a 18 de la planeacion son vistas distintas de los mismos seis items.
  - Tabla de correspondencia entre las entidades de StoreLab y las de Norte Creativo,
    necesaria porque el manual de prompts esta escrito para StoreLab.
  - Propuesta de capacidad integrada: CerrarHito.
  - Esqueleto de docs/sdd.md.
- **Decision**:
  - ACEPTO la traduccion StoreLab -> Norte Creativo. Sin ella el manual de prompts
    no es aplicable a mi proyecto.
  - ACEPTO incluir las seis entidades de identidad y RBAC (User, Role, RoleUser,
    Resource, ResourceRole, RefreshToken) ademas de las diez de la narrativa. La
    narrativa exige RBAC con cinco roles pero no lista esas entidades; sin ellas no
    hay como implementarlo. Total: 16 entidades.
  - ACEPTO CerrarHito como capacidad integrada de la semana. Recorre casi toda la
    cadena del dominio (Cliente -> Campania -> Hito -> Tarea -> Entregable ->
    VersionEntregable -> Aprobacion -> Factura) y materializa la unica regla dura
    que enuncia la narrativa: ningun entregable rechazado puede cerrar un hito.
  - SEPARO contenidos: el analisis de OBJ-S04, actores y entidades va en docs/sdd.md,
    no aqui. Este archivo queda solo como bitacora de decisiones.
  - HALLAZGO PROPIO pendiente de resolver en la SDD: la tabla de entidades de la
    narrativa usa atributos de plantilla. Aprobacion no tiene campo de veredicto,
    Factura no tiene FK a Campania ni forma de saber que hitos cubre, y Hito / Tarea
    no declaran su FK al padre.
  - ACOTO el alcance a los seis AC de la semana. El manual de prompts incluye JWT,
    RBAC completo y las once entidades de StoreLab, pero la planeacion de la Semana 04
    declara esos temas fuera de alcance. Se sigue la planeacion.
  - NO ACEPTO codigo todavia: no se ha generado ni ejecutado ninguna linea.
- **Verificacion**: ninguna aun; este paso es diseno y comprension, no implementacion.
- **Bloqueo**: docs/ y backend/ no existen todavia en el repositorio, aunque el README
  ya las anuncia. Siguiente paso: crear docs/ y llenar las secciones de problema y
  actores en sdd.md.
- **Commit**: pendiente

---

## PASO 3 - <!-- titulo -->

- **Issue / AC**:
- **Herramienta**:
- **Contexto**:
- **Que pedi**:
- **Que devolvio**:
- **Decision**:
- **Verificacion**:
- **Bloqueo**:
- **Commit**: