# Arquitectura — ToonzGamers Studio Web

Sitio web oficial de **ToonzGamers Studio**, un estudio independiente de
desarrollo de videojuegos formado por un único desarrollador. Construido
con **Astro 7**, el sitio consta de una *landing page* principal que
presenta el estudio, sus proyectos, sus redes sociales y dos formularios
de suscripción (newsletter general y novedades de proyectos), y una
página secundaria con la **Política de Privacidad** legal del estudio.

El repositorio contiene **dos proyectos independientes**:

1. La **web Astro** (estática, en `src/`) desplegada en `toonzgamers.com`.
2. Un **Cloudflare Worker** (en `worker/`) que actúa como backend ligero
   para la suscripción a la newsletter, integrado con la API v3 de Brevo.

---

## 1. Visión general

| Aspecto | Web Astro | Worker Newsletter |
| --- | --- | --- |
| Framework | Astro `^7.0.3` (modo estático, sin SSR) | Cloudflare Workers (runtime edge) |
| Lenguaje | TypeScript (`astro/tsconfigs/strict`) | TypeScript (`strict`, target ES2022) |
| UI frameworks | Ninguno — solo componentes `.astro` | N/A (sin UI) |
| Estilos | CSS nativo con *custom properties* + estilos *scoped* | N/A |
| Runtime JS | Mínimo: dos `<script is:inline>` (reveal + newsletter) | Lógica serverless |
| Node | `>=22.12.0` | `>=22.12.0` (solo para wrangler) |
| Locale | `es_ES` (`lang="es"`) | N/A |
| Salida | Sitio estático en `dist/` | Worker en `*.workers.dev` |
| Despliegue | Cloudflare Pages (`toonzgamers.com`) | Cloudflare Workers (`webnewsletter.toonzgamersstudio.workers.dev`) |

La web es **100% estática**: no hay backend propio. Toda la información
vive en archivos de configuración TypeScript y se renderiza en tiempo de
build. El único componente dinámico es el formulario de newsletter, que
hace peticiones cross-origin al Worker.

El sitio tiene **dos rutas**:

1. `/` — *landing page* principal (Hero + Projects + ProjectSubscribe +
   SocialLinks + NewsletterForm).
2. `/privacy-policy` — página legal con la Política de Privacidad del
   estudio, generada desde `src/config/privacy-policy.ts`.

---

## 2. Estructura del proyecto

```text
ToonzGamersStudioWeb/
├── astro.config.mjs          # Configuración de Astro (vacía: defaults)
├── tsconfig.json             # Extiende astro/tsconfigs/strict
├── package.json              # Web: astro + @astrojs/check + typescript
├── AGENTS.md                 # Guía para agentes de IA
├── ARCHITECTURE.md           # Este documento
├── README.md                 # Documentación del proyecto
├── docs/
│   └── newsletter.md         # Doc completa del sistema de newsletter
├── public/                   # Assets estáticos servidos tal cual
│   ├── favicon.svg
│   ├── favicon.ico
│   └── images/
│       ├── logo.png
│       └── apple-touch-icon.png
├── src/                      # ── Web Astro ──
│   ├── config/               # Fuente única de verdad (contenido)
│   │   ├── site.ts           #   SiteConfig: nombre, url, locale
│   │   ├── social.ts         #   SocialLinksConfig: enlaces a redes
│   │   ├── projects.ts       #   ProjectsConfig: proyectos / juegos
│   │   ├── newsletter.ts     #   NewsletterConfig: endpoint + mensajes
│   │   ├── project-newsletter.ts # ProjectNewsletterConfig (lista Brevo diferente)
│   │   └── privacy-policy.ts #   PrivacyPolicyConfig: texto legal de privacidad
│   ├── layouts/
│   │   └── MainLayout.astro  # Shell HTML: <head>, SEO, favicons, noise, reveal
│   ├── pages/
│   │   ├── index.astro       # Landing principal: Hero + Projects + ProjectSubscribe + Social + Newsletter
│   │   └── privacy-policy.astro # Página legal: Política de Privacidad (/privacy-policy)
│   ├── components/
│   │   ├── Hero.astro        # Logo + título + descripción con aurora de fondo
│   │   ├── Projects.astro    # Scroll horizontal modular de proyectos (scroll-snap)
│   │   ├── ProjectSubscribe.astro # Formulario de novedades de proyectos (vista, sin backend)
│   │   ├── SocialLinks.astro # Nav de redes con iconos SVG inline
│   │   └── NewsletterForm.astro # Formulario de newsletter (progressive enhancement)
│   └── styles/
│       └── global.css        # Design tokens, reset, accesibilidad, animaciones
└── worker/                   # ── Cloudflare Worker (proyecto independiente) ──
    ├── wrangler.toml         # Config de despliegue (nombre, ALLOWED_ORIGINS)
    ├── package.json          # wrangler + @cloudflare/workers-types + typescript
    ├── tsconfig.json         # TS config del Worker (ES2022, strict)
    └── src/
        ├── index.ts          # Handler principal (fetch + CORS + validaciones)
        ├── types.ts          # NewsletterEnv, NewsletterProvider, SubscribeResult
        ├── env.ts            # Validación tipada de variables de entorno
        ├── security.ts       # CORS dinámico, honeypot, sanitización de email
        ├── responses.ts      # Helpers de respuestas HTTP con CORS headers
        ├── brevo-provider.ts # Integración con API v3 de Brevo
        └── newsletter-service.ts # Capa de abstracción del proveedor
```

---

## 3. Flujo de renderizado

### 3.1 Web Astro

```text
src/config/*.ts  ──►  src/pages/index.astro          (landing principal)
                         │
                         ├── MainLayout.astro  (shell HTML + SEO + scripts)
                         │      └── global.css (tokens + reset + animaciones)
                         ├── Hero.astro        (sección hero)
                         ├── Projects.astro    (scroll horizontal de proyectos)
                         ├── ProjectSubscribe.astro (suscripción a novedades de proyectos)
                         ├── SocialLinks.astro (nav de redes)
                         └── NewsletterForm.astro (formulario de newsletter)
                                   │
                                   ▼
                          dist/index.html  (HTML estático + CSS + assets)

src/config/privacy-policy.ts  ──►  src/pages/privacy-policy.astro  (/privacy-policy)
                                       │
                                       ├── MainLayout.astro  (shell HTML + SEO + scripts)
                                       └── <article class="policy">  (documento legal, estilos scoped)
                                                   │
                                                   ▼
                                       dist/privacy-policy/index.html
```

1. **Configuración** (`src/config/`): `siteConfig`, `socialLinks`,
   `projectsConfig`, `newsletterConfig`, `projectNewsletterConfig` y
   `privacyPolicyConfig` son objetos TypeScript tipados. Fuente única de
   verdad.
2. **Páginas** (`src/pages/`): `index.astro` importa la configuración y los
   cinco componentes y los compone dentro de `<MainLayout>`.
   `privacy-policy.astro` importa `privacyPolicyConfig` y renderiza el
   documento legal dentro de `<MainLayout>`.
3. **Layout** (`MainLayout.astro`): genera el `<!doctype html>`, el `<head>`
   con SEO, favicons, overlay de ruido, `<slot />` y el script de reveal.
4. **Componentes**: cada uno autónomo, con marcado semántico y estilos
   *scoped*. `NewsletterForm` y `ProjectSubscribe` añaden sus propios
   `<script is:inline>`.
5. **Build**: Astro compila todo a HTML estático en `dist/`. El JS enviado
   al cliente son tres scripts *inline* (reveal + newsletter +
   project-subscribe).

### 3.2 Newsletter (web → worker → Brevo)

```text
Navegador                    Worker de Cloudflare           Brevo API v3
─────────────                ────────────────────           ────────────
NewsletterForm.astro  ──POST CORS──►  index.ts
  (fetch, JSON)                     │
                                    ├─ getEnv()          (valida entorno)
                                    ├─ CORS / Origin    (security.ts)
                                    ├─ Honeypot         (security.ts)
                                    ├─ sanitizeEmail    (security.ts)
                                    ├─ NewsletterService
                                    │     └─ BrevoProvider ──POST──► /v3/contacts
                                    │                                    │
                                    │     ◄── SubscribeResult ──────────┘
                                    └─ jsonSuccess / jsonError  (responses.ts)
        ◄── JSON {success, message} ──
```

El formulario envía `POST` cross-origin al Worker con
`{ email, website }` (este último es el honeypot). El Worker valida,
sanitiza, delega al `BrevoProvider` y responde en JSON. El frontend
muestra el mensaje según el estado.

---

## 4. Capas de la aplicación

### 4.1 Configuración (`src/config/`)

Capa de **datos**. Seis módulos tipados:

- **`site.ts`** — `SiteConfig` con `name`, `description`, `url`
  (`https://toonzgamers.com`), `locale` (`es_ES`) y `lang` (`es`).
- **`social.ts`** — `SocialLink` (con `key`, `label`, `href`, `icon`) y
  `SocialLinksConfig`. Los enlaces usan `target="_blank"` y
  `rel="noopener noreferrer"` al renderizarse.
- **`projects.ts`** — `Project` (con `id`, `title`, `description`, `status`
  `"coming_soon" | "in_development" | "available"`, `statusLabel`, `image?`,
  `links?`) y `ProjectsConfig`. Cada entrada del array `projects` se
  renderiza como una tarjeta en `<Projects />`.
- **`newsletter.ts`** — `NewsletterConfig` con el `endpoint` del Worker
  (`https://webnewsletter.toonzgamersstudio.workers.dev/api/newsletter`)
  y un mapa de `messages` (success, alreadySubscribed, error,
  invalidEmail, loading). Los valores se serializan en el markup del
  formulario vía `data-config` para uso del script cliente.
- **`project-newsletter.ts`** — `ProjectNewsletterConfig`, análogo a
  `newsletter.ts` pero para novedades de proyectos. Usa una **lista de
  Brevo diferente**. Por ahora `endpoint` es un placeholder (`#`) y
  añade el mensaje `comingSoon`. Los valores se serializan vía
  `data-config` en `ProjectSubscribe.astro`.
- **`privacy-policy.ts`** — `PrivacyPolicyConfig` con el `title`, la fecha
  `lastUpdated`, un array de `sections` (cada una con `id`, `title`,
  `paragraphs?`, `list?` y `subsections?`) y un objeto `contact` (`name` +
  `email`). Es la fuente única de verdad para el contenido legal de la
  página `/privacy-policy`. El email de contacto es
  `privacy@toonzgamers.com`.

**Convención:** cualquier contenido reutilizable o que pueda cambiar debe
vivir aquí como dato tipado, no hardcodeado en el marcado.

### 4.2 Layout (`src/layouts/MainLayout.astro`)

Capa de **presentación global**. Responsabilidades:

- **Props**: `title` (obligatorio), `description?` e `image?` con defaults
  tomados de `siteConfig`.
- **SEO**: `<title>`, `<meta description>`, `<link canonical>`, Open Graph
  completo, Twitter Card `summary_large_image`. Las URLs absolutas se
  construyen con `new URL(..., siteConfig.url)`.
- **Favicons**: SVG, ICO y apple-touch-icon.
- **Accesibilidad**: `<noscript>` que fuerza `.reveal { opacity: 1 }`.
- **Overlay de ruido**: SVG `feTurbulence` fijo con `mix-blend-mode: overlay`.
- **Script *reveal-on-scroll***: `<script is:inline>` que usa
  `IntersectionObserver` para añadir `.is-visible` a los `.reveal`. Respeta
  `prefers-reduced-motion`.

### 4.3 Páginas (`src/pages/`)

Capa de **composición**. El sitio tiene dos rutas:

- **`index.astro`** (`/`): la *landing page* principal. Importa el layout y
  los cinco componentes y los anida dentro de `<main>` en orden: Hero →
  Projects → ProjectSubscribe → SocialLinks → NewsletterForm.
- **`privacy-policy.astro`** (`/privacy-policy`): página legal con la
  Política de Privacidad del estudio. Importa `privacyPolicyConfig` y
  renderiza el documento dentro de `<MainLayout>`. No usa componentes de
  UI compartidos: el marcado y los estilos viven en el propio archivo
  (estilos *scoped* con prefijo BEM `.policy__*`). Ver sección 4.6.

### 4.4 Componentes (`src/components/`)

Capa de **UI**. Cinco componentes autónomos:

#### `Hero.astro`
- Sección `<section class="hero">` con `aria-label`.
- Fondo **aurora**: tres blobs con `radial-gradient` y `filter: blur()`,
  animados con `auroraDrift`.
- Logo (`<img>` con `loading="eager"`, `decoding="async"`, dimensiones
  explícitas), título con gradiente animado (`shimmer`) y descripción.
- Animaciones de entrada: `fadeInScale` + `float` (logo), `fadeInUp` (texto).

#### `Projects.astro`
- Sección `<section class="projects reveal">` con `aria-label`.
- **Scroll horizontal modular**: contenedor con `overflow-x: auto` +
  `scroll-snap-type: x mandatory`. Las tarjetas no se comprimen, sino que
  desbordan horizontalmente. Scrollbar oculto (`scrollbar-width: none` +
  `::-webkit-scrollbar { display: none }`). Bordes difuminados con
  gradientes CSS como *scroll hints*.
- **Config-driven**: lee `projectsConfig.projects` y renderiza una tarjeta
  por entrada. Añadir un proyecto al array genera automáticamente una
  tarjeta nueva.
- **Tarjeta glassmorphic**: `backdrop-filter: blur()`, superficie
  translúcida, highlight interior, sombras en capas. Zona de media con
  aspect-ratio 16/9: si el proyecto tiene `image`, muestra `<img>` con
  `loading="lazy"`; si no, un placeholder con gradiente teal→índigo y la
  inicial del título.
- **Badge de estado**: pill color-coded según `status`
  (`coming_soon` = ámbar, `in_development` = índigo, `available` = teal).
- **Enlaces opcionales**: si `project.links` existe, renderiza botones de
  tienda/web con `target="_blank"` + `rel="noopener noreferrer"`.
- **Hover**: `translateY(-6px) scale(1.02)` + glow índigo + zoom de imagen.
- **Entrada escalonada**: cada tarjeta usa `--card-delay` (inline style,
  index × 80ms) y anima cuando `.projects.is-visible` se añade vía
  `IntersectionObserver`.
- Respeta `prefers-reduced-motion` y `@media (scripting: none)`.

#### `ProjectSubscribe.astro`
- Sección `<section class="psubscribe reveal">` con `aria-label`.
- **Vista de formulario** (sin backend): el UI está completo y funcional,
  pero `endpoint` es un placeholder (`#`). Al enviar, valida el email,
  comprueba el honeypot y muestra el mensaje `comingSoon` tras un
  `setTimeout` simulado (600ms) en lugar de un `fetch` real.
- **Comentario placeholder** marca dónde reemplazar el `setTimeout` por una
  llamada `fetch` cuando se configure el Worker con una lista de Brevo
  diferente.
- Sigue el mismo patrón que `NewsletterForm` (progressive enhancement,
  honeypot, `role="status"` + `aria-live="polite"`, `<noscript>`,
  `data-config` serializado) pero con prefijo BEM `.psubscribe__*` y tokens
  locales propios (`--psubscribe-*`).

#### `SocialLinks.astro`
- `<nav aria-label="Redes sociales">` con `<ul role="list">`.
- Iconos SVG **inline** (mapa `iconPaths: Record<IconName, string>`) — sin
  dependencias de librerías de iconos.
- Enlaces con `target="_blank" rel="noopener noreferrer"` y `aria-label`
  descriptivo.
- Efectos hover/focus: `translateY(-4px) scale(1.06)`, glow radial, borde
  iluminado. Soporta `:focus-visible`.

#### `NewsletterForm.astro`
- Sección `<section class="newsletter reveal">` con `aria-label`.
- **Progressive enhancement**: el `<form>` tiene `action` y `method="POST"`
  reales, así que funciona sin JS. Con JS activo, el script *inline*
  intercepta el submit vía `fetch` para una experiencia sin recarga.
- **Honeypot**: campo oculto `website` (`visually-hidden`, `tabindex="-1"`,
  `aria-hidden="true"`) que los bots suelen rellenar. El script cliente lo
  detecta y responde con un falso éxito sin enviar la petición.
- **Validación cliente**: regex de email antes de enviar.
- **Estados**: loading (botón `is-loading` + `aria-busy`), success
  (`is-success`), error (`is-error`), input error (`is-error`).
- **Accesibilidad**: `<label>` `visually-hidden`, mensaje con
  `role="status" aria-live="polite"`, `<noscript>` con aviso, focus-visible.
- **Config serializada**: `data-config={JSON.stringify(config)}` en el
  `<form>`; el script lee los mensajes desde ahí (sin módulos JS extra).
- **Tokens locales**: define `--newsletter-success`, `--newsletter-error`,
  `--newsletter-on-accent`, etc. en el scope del componente (no globales).
- Respeta `prefers-reduced-motion`.

### 4.5 Estilos (`src/styles/global.css`)

Capa de **design system**. Define:

- **Tokens** en `:root`: paleta oscura (`--color-bg`, `--color-surface`,
  `--color-text`, `--color-muted`, `--color-accent`, `--color-teal`,
  `--color-cyan`, `--color-indigo`), tipografía (`--font-body`,
  `--font-mono`), escala de espaciado (`--space-xs` … `--space-3xl`),
  curvas de easing (`--ease-out`, `--ease-spring`), duraciones y capas
  z-index.
- **Reset** universal (`box-sizing`, margin/padding 0).
- **Base**: `color-scheme: dark`, `scroll-behavior: smooth` (solo sin
  `prefers-reduced-motion`), fondo con gradientes radiales, tipografía.
- **Accesibilidad**: `.visually-hidden`, `:focus-visible` con outline.
- **Utilidades**: `.noise-overlay`, `.reveal` / `.reveal.is-visible`.
- **Keyframes**: `fadeInUp`, `fadeInScale`, `shimmer`, `float`,
  `auroraDrift`, `marqueeScroll`.
- **Reduced motion**: `@media (prefers-reduced-motion: reduce)` anula
  animaciones/transiciones y muestra `.reveal`.
- **No-JS**: `@media (scripting: none)` muestra `.reveal`.

**Convención:** los componentes usan estilos *scoped* para lo específico,
y `global.css` para tokens, reset, utilidades y keyframes compartidos.
`NewsletterForm` define tokens locales en su propio scope en lugar de
añadirlos a `:root`.

### 4.6 Página de Política de Privacidad (`src/pages/privacy-policy.astro`)

Página legal secundaria en la ruta `/privacy-policy`. A diferencia de los
componentes de la *landing*, es una **página autónoma**: el marcado y los
estilos viven en el propio archivo, sin componentes de UI compartidos.

- **Config-driven**: lee `privacyPolicyConfig` desde
  `src/config/privacy-policy.ts` y renderiza el documento legal de forma
  declarativa (secciones, subsecciones, listas y bloque de contacto).
- **`<MainLayout>`**: usa el mismo layout que la *landing*, por lo que
  hereda SEO completo (`title`, `description`, canonical, Open Graph,
  Twitter Card), favicons, aurora de fondo, overlay de ruido y script de
  reveal. El `<title>` sigue el patrón
  `Política de Privacidad de ToonzGamers | ToonzGamers Studio`.
- **Estructura semántica**: `<article class="policy reveal">` con
  `<header>` (enlace de vuelta, título h1, fecha de actualización),
  `<div class="policy__body">` con las secciones (`<section>` + `<h2>` +
  `<h3>` para subsecciones) y `<footer>` con segundo enlace de vuelta.
- **Bloque de contacto**: la sección 14 renderiza un bloque destacado
  (`.policy__contact`) con el nombre del estudio y un enlace
  `mailto:privacy@toonzgamers.com`.
- **Estilos scoped**: prefijo BEM `.policy__*`, usa tokens del design system
  (`--color-*`, `--space-*`, `--ease-*`, `--z-*`). Tipografía optimizada
  para lectura de documento legal (line-height 1.7, max-width 50rem).
  Responsive (`@media (max-width: 640px)`).
- **Accesibilidad**: jerarquía de encabezados correcta (h1 → h2 → h3),
  enlaces de vuelta con `aria-label`, `:focus-visible` heredado del
  design system, `.reveal` respeta `prefers-reduced-motion` y
  `@media (scripting: none)`.
- **Sin JS de cliente**: la página no añade ningún `<script>` propio; el
  único JS que ejecuta es el script de reveal global del layout.

---

## 5. Cloudflare Worker (`worker/`)

Proyecto **independiente** con su propio `package.json`, `tsconfig.json` y
`wrangler.toml`. Es un backend serverless que actúa como proxy entre el
formulario y la API v3 de Brevo.

### 5.1 Arquitectura del Worker

```text
index.ts  (handler fetch)
   │
   ├── getEnv()              valida BREVO_API_KEY, BREVO_LIST_ID, ALLOWED_ORIGINS
   ├── getCorsHeaders()      CORS dinámico según Origin
   ├── preflight (OPTIONS)   204 con headers CORS
   ├── valida método (POST)  405 si no
   ├── valida Content-Type   415 si no es application/json
   ├── limita Content-Length 413 si > 1024 bytes
   ├── isAllowedOrigin()     403 si no autorizado
   ├── parsea JSON           400 si inválido
   ├── isHoneypotTriggered() 200 falso éxito (no procesa)
   ├── sanitizeEmail()       400 si inválido
   └── NewsletterService
         └── BrevoProvider.subscribe()
               POST https://api.brevo.com/v3/contacts
               (timeout 8s vía AbortSignal)
```

### 5.2 Módulos del Worker

| Archivo | Responsabilidad |
| --- | --- |
| `index.ts` | Handler `fetch`: orquesta CORS, validaciones y delegación al servicio. Punto de entrada. |
| `types.ts` | Tipos compartidos: `NewsletterEnv`, `NewsletterProvider`, `SubscribeResult`. |
| `env.ts` | `getEnv()`: valida y tipa las variables de entorno. Default `ALLOWED_ORIGINS = https://toonzgamers.com`. |
| `security.ts` | `isAllowedOrigin()`, `isHoneypotTriggered()`, `sanitizeEmail()`, `getCorsHeaders()`. |
| `responses.ts` | `jsonSuccess()`, `jsonError()`, `jsonSilentSuccess()`, `noContent()`, `preflightResponse()`. Mensajes genéricos. |
| `brevo-provider.ts` | `BrevoProvider` implementa `NewsletterProvider`. POST a `/v3/contacts` con `updateEnabled: true`. Timeout 8s. |
| `newsletter-service.ts` | `NewsletterService`: capa de abstracción con inyección de dependencias. Permite cambiar de proveedor sin tocar el handler. |

### 5.3 Variables de entorno

| Variable | Tipo | Dónde se define |
| --- | --- | --- |
| `BREVO_API_KEY` | Secreto | `wrangler secret put` o dashboard |
| `BREVO_LIST_ID` | Secreto | `wrangler secret put` o dashboard |
| `ALLOWED_ORIGINS` | Pública | `wrangler.toml` `[vars]` (default `https://toonzgamers.com`) |

> **Los secretos nunca se commitean.** No se usan archivos `.env` en el
> repositorio. Para desarrollo local, usa `worker/.dev.vars` (ignorado).

### 5.4 Seguridad del Worker

- **CORS dinámico**: headers calculados según el header `Origin`. Solo se
  incluyen si el origen está en `ALLOWED_ORIGINS`.
- **Honeypot**: si el campo `website` tiene valor, responde 200 falso sin
  procesar ni almacenar nada.
- **Validación de Origin**: 403 si el origen no está autorizado.
- **Sanitización de email**: trim, lowercase, regex, máx 254 caracteres.
- **Límite de payload**: 413 si el cuerpo supera 1024 bytes.
- **Timeout**: `AbortSignal.timeout(8000)` en las llamadas a Brevo.
- **Logging seguro**: solo se loggea el dominio del email (no el email
  completo), códigos de estado de Brevo y advertencias. Nunca API keys ni
  emails completos.
- **Mensajes genéricos**: los errores 403/413/500 devuelven mensajes
  genéricos para no filtrar información interna.

### 5.5 Respuestas HTTP

| Status | Cuando | Body |
| --- | --- | --- |
| 200 | Suscripción exitosa / ya suscrito / honeypot | `{ success: true, message: "…" }` |
| 204 | Preflight CORS (OPTIONS) | Sin cuerpo |
| 400 | JSON inválido / email no válido | `{ success: false, message: "…" }` |
| 403 | Origin no autorizado | `{ success: false, message: "…" }` |
| 405 | Método no permitido | `{ success: false, message: "…" }` |
| 413 | Cuerpo demasiado grande | `{ success: false, message: "…" }` |
| 415 | Content-Type incorrecto | Sin cuerpo |
| 500 | Error de entorno o de Brevo | `{ success: false, message: "…" }` |

> Consulta [`docs/newsletter.md`](./docs/newsletter.md) para la
> documentación completa (setup de Brevo, despliegue, desarrollo local,
> cambio de proveedor, seguridad).

---

## 6. Design system

### Paleta
| Token | Valor | Uso |
| --- | --- | --- |
| `--color-bg` | `#0b0d12` | Fondo de página |
| `--color-surface` | `#13161d` | Superficies (logo, inputs) |
| `--color-text` | `#f2f4f8` | Texto principal |
| `--color-muted` | `#9aa3b2` | Texto secundario |
| `--color-accent` | `#7c83fd` | Acento índigo |
| `--color-teal` | `#00a080` | Aurora / gradientes |
| `--color-cyan` | `#00f0f0` | Aurora / gradientes |

### Tokens locales del formulario
`NewsletterForm` define en su scope: `--newsletter-success` (`#4ade80`),
`--newsletter-error` (`#f87171`), `--newsletter-on-accent` (`#0b0d12`),
`--newsletter-accent-ring`, `--newsletter-accent-glow`,
`--newsletter-error-ring`.

### Espaciado
`--space-xs` (0.5rem) · `--space-sm` (0.75rem) · `--space-md` (1rem) ·
`--space-lg` (1.5rem) · `--space-xl` (2rem) · `--space-2xl` (3rem) ·
`--space-3xl` (5rem)

### Z-index
`--z-aurora` (-1) · `--z-ground` (0) · `--z-content` (1) · `--z-overlay`
(100) · `--z-noise` (200)

### Nomenclatura CSS
BEM-ish: `.hero__aurora-blob--1`, `.social__link`, `.marquee__content`,
`.newsletter__button`, `.newsletter__message--success`.

---

## 7. Accesibilidad

El proyecto prioriza accesibilidad desde el diseño:

- **HTML semántico**: `<section>`, `<nav>`, `<main>`, `<ul role="list">`,
  `<form>`, `<label>`.
- **ARIA**: `aria-label` en secciones y nav, `aria-hidden` en decoración
  (aurora, overlay de ruido, placeholders de imagen, honeypot).
- **Texto alternativo**: `.visually-hidden` para lectores de pantalla
  (label de los formularios, honeypot).
- **Foco visible**: `:focus-visible` con outline de 2px en color acento.
- **Movimiento reducido**: `@media (prefers-reduced-motion: reduce)` anula
  animaciones; el script de reveal no se ejecuta.
- **Sin JS**: `<noscript>` y `@media (scripting: none)` muestran el
  contenido `.reveal`. El formulario de newsletter funciona sin JS vía POST
  tradicional (progressive enhancement).
- **Enlaces externos**: `target="_blank"` siempre con
  `rel="noopener noreferrer"`.
- **Formulario**: `role="status"` + `aria-live="polite"` en el mensaje,
  `aria-busy` en el botón durante el envío, honeypot `tabindex="-1"`.

---

## 8. SEO

Gestionado en `MainLayout.astro`:

- `<title>` con patrón `Página | ToonzGamers Studio` (o solo el nombre si
  coincide con `siteConfig.name`).
- `<meta name="description">` con default desde `siteConfig`.
- `<link rel="canonical">` construido desde `Astro.url` y `siteConfig.url`
  (`https://toonzgamers.com`).
- **Open Graph** completo: `og:type`, `og:title`, `og:description`,
  `og:url`, `og:site_name`, `og:locale`, `og:image` (URL absoluta).
- **Twitter Card** `summary_large_image` con título, descripción e imagen.
- Favicons: SVG (principal), ICO (alternativo) y apple-touch-icon.

---

## 9. Rendimiento

- **Cero JS de framework**: Astro renderiza todo en build time.
- **Tres scripts cliente** (todos `<script is:inline>`): `IntersectionObserver`
  para reveal, handler del formulario de newsletter y handler del formulario
  de novedades de proyectos.
- **Imágenes**: `loading` y `decoding` explícitos, dimensiones en el markup
  para evitar *layout shift*.
- **CSS scoped**: solo los estilos usados por cada componente se incluyen.
- **`will-change`** declarado en elementos animados (aurora, projects,
  social, botones de newsletter y project-subscribe).
- **Sin dependencias runtime** más allá de Astro (web) y wrangler (worker).
- **Worker edge**: las suscripciones se procesan en la red de Cloudflare,
  cerca del usuario.

---

## 10. Comandos

### Web Astro (raíz del repo)

| Comando | Acción |
| --- | --- |
| `npm install` | Instala dependencias de la web |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `astro dev --background` | Dev server en segundo plano (ver `AGENTS.md`) |
| `npm run build` | Build de producción a `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run astro ...` | Comandos CLI de Astro |

### Worker (`worker/`)

| Comando | Acción |
| --- | --- |
| `cd worker && npm install` | Instala dependencias del Worker |
| `cd worker && npm run dev` | Worker local en `localhost:8788` (`wrangler dev`) |
| `cd worker && npm run deploy` | Despliega el Worker a Cloudflare |
| `cd worker && npm run check` | Type-check del Worker (`tsc --noEmit`) |
| `cd worker && npx wrangler secret put BREVO_API_KEY` | Configura secreto |
| `cd worker && npx wrangler secret put BREVO_LIST_ID` | Configura secreto |

---

## 11. Decisiones de diseño

- **Astro puro, sin integraciones**: el sitio es estático y minimalista;
  añadir React/Vue/etc. sería *overkill* y aumentaría el bundle.
- **Configuración tipada centralizada**: separar datos de presentación
  facilita mantener el contenido sin tocar el marcado.
- **CSS nativo + custom properties**: evita dependencias (Tailwind, etc.) y
  mantiene el control total del design system.
- **Iconos SVG inline**: cero dependencias, mejor rendimiento que icon
  fonts o librerías, y control total del estilo.
- **Accesibilidad *by design***: integrada en cada componente y el layout,
  no añadida como *post-fix*.
- **TypeScript strict**: detecta errores en build y documenta los contratos
  de configuración.
- **Worker independiente (no Pages Functions)**: permite desplegar web y
  backend por separado, con sus propias dependencias y ciclo de vida. El
  Worker maneja CORS explícitamente al ser cross-origin.
- **Progressive enhancement en el formulario**: funciona sin JS (POST
  tradicional) y mejora la experiencia con JS (fetch sin recarga).
- **Abstracción `NewsletterProvider`**: el `BrevoProvider` es intercambiable
  sin tocar el handler ni el servicio. Cambiar de proveedor solo requiere
  implementar la interfaz y una línea en `index.ts`.
- **Secretos fuera del repo**: `BREVO_API_KEY` y `BREVO_LIST_ID` se
  gestionan exclusivamente con `wrangler secret` o el dashboard.