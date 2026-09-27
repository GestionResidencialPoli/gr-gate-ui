# GR Gate UI

Microfrontend de portería de Gestión Residencial: registro de visitantes y aforo de parqueadero para VIGILANTE, configuración e histórico para ADMINISTRACION.

## Por qué existe este repositorio

Sigue el mismo patrón que `gr-wall-ui`: un repo por dominio, simétrico con su microservicio (`gr-gate-microservice`), en vez de vivir dentro de las apps por rol.

## Biblioteca compartida

Consume, como dependencias npm normales:

- [`@gestionresidencial/shared-ui`](https://www.npmjs.com/package/@gestionresidencial/shared-ui)
- [`@gestionresidencial/auth-client`](https://www.npmjs.com/package/@gestionresidencial/auth-client)

## Cómo se llega aquí

Sin login propio: un usuario autenticado en `gr-common-ui` (vigilante) o `gr-admin-ui` (administración) navega al módulo de portería; esa app inicia un salto SSO (`initiateSsoHandoff`) hacia `/auth/sso/callback` de este origen.

## Backend

`/api/v1/porteria` (`gr-gate-microservice`), incluido un canal SSE para el aforo en tiempo real, a través del gateway. Ver `AGENTS.md` para el contrato completo.

## Desarrollo local

```bash
pnpm install
pnpm dev   # puerto 3005
```
