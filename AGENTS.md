# AGENTS.md — Guía para agentes de IA

Este documento describe las convenciones y buenas prácticas del proyecto
**ToonzGamers Studio Web**. Léelo antes de trabajar en el repositorio.

> 📖 Para el funcionamiento detallado de la aplicación, consulta
> [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and
`astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

---

## Stack del proyecto

- **Astro `^7.0.3`** en modo estático (sin SSR, sin integraciones).
- **TypeScript** con `astro/tsconfigs/strict`.
- **Componentes `.astro`** — sin React, Vue, Svelte ni otros frameworks UI.
- **CSS nativo** con *custom properties* + estilos *scoped* por componente.
- **Node `>=22.12.0`**.

No añadas dependencias runtime ni integraciones de framework salvo que el
usuario lo pida explícitamente. El sitio es deliberadamente minimalista.

---

## Convenciones de código

### Configuración tipada centralizada

- **Todo el contenido editable vive en `src/config/`** como módulos
  TypeScript tipados (`site.ts`, `social.ts`, `projects.ts`,
  `newsletter.ts`, `project-newsletter.ts`, `privacy-policy.ts`). Es la
  **fuente única de verdad**.
- No hardcodees texto, URLs ni metadatos en el marcado: añádelos como datos
  tipados en `src/config/` e impórtalos.
- Define una `interface` para cada estructura de configuración y exporta la
  constante tipada.

### Componentes `.astro`

- Un componente por archivo, autónomo, con su marcado y sus estilos
  `<style>` *scoped*.
- Usa **HTML semántico**: `<section>`, `<nav>`, `<main>`, `<ul>`, etc.
- Nomenclatura CSS **BEM-ish**: `.hero__aurora-blob--1`,
  `.social__link`, `.marquee__content`.
- Estilos específicos del componente → `<style>` scoped. Tokens, reset,
  utilidades y keyframes compartidos → `src/styles/global.css`.
- Recibe datos vía `Props` (interfaz tipada) o importando `src/config/*`.

### Design system (`src/styles/global.css`)

- Usa los **tokens** existentes (`--color-*`, `--space-*`, `--ease-*`,
  `--z-*`) en lugar de valores mágicos.
- Si necesitas un nuevo color/espaciado, añádelo como *custom property* en
  `:root` y documéntalo en `ARCHITECTURE.md`.
- Mantén la paleta oscura y refinada del estudio.

### TypeScript

- Respeta el modo `strict`. Tipa todas las props, configs y mapas.
- Evita `any`. Usa `Record<K, V>` e interfaces explícitas.

---

## Accesibilidad (obligatorio)

La accesibilidad está integrada por diseño, no es opcional:

- Añade `aria-label` a `<section>` y `<nav>`.
- Marca como `aria-hidden="true"` la decoración pura (aurora, overlay de
  ruido, placeholders de imagen).
- Proporciona texto alternativo para contenido visual dirigido a lectores
  de pantalla usando `.visually-hidden` (ver `NewsletterForm.astro`).
- Todo enlace externo: `target="_blank"` + `rel="noopener noreferrer"`.
- Asegura `:focus-visible` visible en elementos interactivos.
- Las animaciones deben respetar `@media (prefers-reduced-motion: reduce)`.
- El contenido `.reveal` debe ser visible sin JS (`<noscript>` y
  `@media (scripting: none)` ya lo garantizan; no los rompas).

---

## SEO

El SEO se gestiona en `MainLayout.astro`. Al añadir páginas:

- Usa `<MainLayout title="…" description="…" image="…" />`.
- El `<title>` sigue el patrón `Página | ToonzGamers Studio` (el layout lo
  calcula automáticamente).
- Las URLs absolutas se construyen con `new URL(path, siteConfig.url)`.
- Mantén Open Graph y Twitter Card actualizados.

---

## Rendimiento

- **Cero JS de framework.** No añadas scripts de cliente salvo que sean
  imprescindibles; si lo haces, usa `<script is:inline>` y que sea mínimo.
- Declara `loading`/`decoding` y dimensiones en las `<img>`.
- Usa `will-change` solo en elementos realmente animados.
- Prefiere iconos **SVG inline** (como en `SocialLinks.astro`) sobre icon
  fonts o librerías.

---

## Flujo de trabajo

1. **Lee** `ARCHITECTURE.md` para entender la arquitectura antes de cambios
   no triviales.
2. **Edita** `src/config/` para cambios de contenido; componentes/layouts
   para cambios de presentación.
3. **Verifica** con `npm run build` (y `astro check` si tocas TypeScript).
4. **No rompas** las convenciones de accesibilidad, SEO ni design system.
5. **Documenta** cambios arquitectónicos en `ARCHITECTURE.md`.

---

## Estructura de archivos (referencia rápida)

```text
src/
├── config/        # Datos tipados (fuente única de verdad)
├── layouts/       # Shell HTML + SEO + scripts globales
├── pages/         # Rutas (una por archivo .astro)
├── components/    # Componentes de UI autónomos
└── styles/        # Design tokens, reset, utilidades, keyframes
public/            # Assets estáticos servidos tal cual
```

---

## Sistema de newsletter

El proyecto incluye un sistema de suscripcion a newsletter que funciona
como un proxy entre el frontend y la API v3 de Brevo mediante un **Worker
independiente** de Cloudflare (proyecto separado en `worker/`).

### Ubicacion de los archivos

- `worker/src/index.ts` — **Handler principal del Worker** (`fetch` + CORS +
  validaciones). Es el punto de entrada del backend.
- `worker/src/` — Logica completa del Worker: servicio
  (`newsletter-service.ts`), proveedor (`brevo-provider.ts`), validacion de
  entorno (`env.ts`), seguridad (`security.ts`), tipos (`types.ts`) y
  respuestas HTTP (`responses.ts`).
- `worker/wrangler.toml` — Configuracion de despliegue (nombre del Worker,
  variable publica `ALLOWED_ORIGINS`).
- `src/config/newsletter.ts` — Configuracion publica del frontend (endpoint
  cross-origin, mensajes de exito/error). Es la fuente unica de verdad para
  el formulario.

### Convenciones

- El Worker se despliega en
  `https://webnewsletter.toonzgamersstudio.workers.dev`. La web Astro
  (estatica, `toonzgamers.com`) le hace peticiones cross-origin.
- Las claves secretas (`BREVO_API_KEY`, `BREVO_LIST_ID`) se configuran
  exclusivamente con `wrangler secret put` o en el dashboard de Cloudflare
  Workers. **Nunca se commitean.**
- `ALLOWED_ORIGINS` se define en `wrangler.toml` `[vars]` como variable
  publica (no secreta).
- No uses `.env` en el repositorio.
- Consulta [`docs/newsletter.md`](./docs/newsletter.md) para la documentacion
  completa del sistema (configuracion, desarrollo local, seguridad,
  respuestas HTTP, cambio de proveedor).