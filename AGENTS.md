# gr-gate-ui — contexto para agentes

Microfrontend de portería (épica `GR-16` en Jira, historias GR-76 a GR-82). Next.js 16 (App Router). VIGILANTE registra entrada/salida de visitantes y consulta el aforo en tiempo real; ADMINISTRACION configura el total de cupos, ve el histórico completo y las visitas abiertas.

## Convención de código

Sin comentarios en el código, salvo que el nombre no baste para explicarlo.

## Backend

Todo pasa por el gateway (`BACKEND_API_URL`, `http://localhost:4000` en local). El dominio vive en `gr-gate-microservice` bajo `/api/v1/porteria`.

### Endpoints

- `GET /porteria/aforo` (vigilante o admin) — `AforoDto`.
- `PUT /porteria/aforo/total` (admin) — body `{ total: number }`, `1..10000`.
- `GET /porteria/aforo/cambios?page=&size=` (admin) — histórico de cambios del total.
- `POST /porteria/visitas` (vigilante o admin) — body `IngresoInput`, devuelve `{ visita, aforo }`.
- `GET /porteria/visitas/abiertas?documento=&torre=&numero=&conVehiculo=` (vigilante o admin)
- `GET /porteria/visitas?desde=&hasta=&torre=&numero=&documento=&page=&size=` (**solo admin** — el vigilante NO tiene acceso al histórico completo, solo a las abiertas).
- `GET /porteria/visitas/{id}` (vigilante o admin)
- `PATCH /porteria/visitas/{id}/salida` (vigilante o admin)
- `GET /porteria/visitantes/{documento}` (vigilante o admin) — autocompletar nombre si el documento ya visitó antes; 404 `VISITANTE_NO_ENCONTRADO` si nunca ha visitado.
- `GET /porteria/eventos` (vigilante o admin) — **SSE**, ver abajo.

Respuestas envueltas en `{ payload }` / `{ payload: PageResult<T> }`. Errores: `{ error: { code, message, details? } }`.

### `IngresoInput`

```ts
{ documento, nombre?, torre, numero, tipoVisita: "SOCIAL"|"DOMICILIO"|"SERVICIO"|"OTRO",
  conVehiculo: boolean, placa?, cerrarVisitaAnterior: boolean }
```

`nombre` es obligatorio solo si el documento nunca visitó antes (si ya existe, se autocompleta con `GET /porteria/visitantes/{documento}` y no hace falta reenviarlo salvo que cambie). `placa` solo tiene sentido si `conVehiculo` es `true`.

### Códigos de error que la UI debe mapear a mensaje

- `POST /visitas` → 409 `VISITA_ABIERTA` (el documento ya tiene una visita sin cerrar: ofrecer reenviar con `cerrarVisitaAnterior: true`, trae `visitaAbiertaId` en `details`), 409 `AFORO_COMPLETO` (**solo si `conVehiculo: true`**; trae `puedeIngresarSinVehiculo: true` en `details` — ofrecer directamente el botón "Registrar sin vehículo" reenviando con `conVehiculo: false`), 422 `NOMBRE_REQUERIDO` (primera visita de ese documento sin nombre).
- `PUT /aforo/total` → sin error especial: reducir el total por debajo de los ocupados es válido (CA-2 de HU-4.3), el backend no expulsa a nadie ni lo rechaza; el frontend debe advertir esto en el formulario ANTES de enviar, no solo reaccionar a un error.
- `PATCH /visitas/{id}/salida` → idempotente: repetir la salida sobre una visita ya cerrada no falla ni libera el cupo dos veces (`yaEstabaCerrada` no se expone en la respuesta HTTP directamente, pero el efecto es un 200 sin cambios).
- `GET /visitas` (histórico completo) → 403 para VIGILANTE: no mostrar ese enlace de navegación a ese rol en absoluto (ver HU-4.7 CA-5, es una decisión de privacidad, no solo de autorización).

Usar siempre `apiFetch` de `@gestionresidencial/auth-client`.

## Tiempo real: `GET /porteria/eventos` (SSE)

`Content-Type: text/event-stream`. Eventos: `aforo.actual` (al conectar, con el aforo vigente), `aforo.actualizado`, `visita.ingreso`, `visita.salida`, heartbeat cada 20s (comentario `: heartbeat`, ignorar), y `tiempo-real-no-disponible` si RabbitMQ no está disponible (en ese caso el cliente debe caer a *polling* de `GET /porteria/aforo` cada 10s, ver `reintentarEnMs` en el payload de ese evento). Usar `EventSource` desde el navegador (mismo origen vía el rewrite de Next, las cookies viajan solas). GR-79 CA-6: si la conexión se cae, mostrar la marca de tiempo del último dato válido en vez de dejar un número que podría estar desactualizado sin avisarlo.

## Diseño de la pantalla (GR-86)

Prioriza velocidad de captura sobre estética: foco inicial en el campo de documento, máximo cuatro pulsaciones de teclado para un visitante recurrente, el formulario se limpia y el foco vuelve al documento tras un registro exitoso, todo navegable por teclado. Pensado para tableta en la portería, no para escritorio.

## Autenticación

Igual que gr-wall-ui: puente SSO, `proxy.ts` protege todo lo demás. Las audiencias `vigilante` y `admin` son válidas aquí (nunca `residente`); el gating de páginas solo-admin usa `requiredRole="ADMINISTRACION"` en `AuthenticatedShell`.

## Gitflow

Igual que los demás repos `gr-*`: `feature/GR-000-descripcion` desde `develop`, commits `tipo(scope): GR-000 descripcion breve`, PR por work item vinculado a Jira.
