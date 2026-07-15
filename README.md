# ToonzGamers Studio Web

Sitio web oficial de **ToonzGamers Studio**, estudio independiente de
desarrollo de videojuegos formado por un único desarrollador. El sitio
incluye una *landing page* principal que presenta el estudio, sus
proyectos, sus redes sociales y dos formularios de suscripción
(newsletter general y novedades de proyectos), y una página secundaria
con la **Política de Privacidad** legal del estudio.

El repositorio contiene **dos proyectos independientes**:

1. La **web Astro** (estática, en `src/`) desplegada en `toonzgamers.com`.
2. Un **Cloudflare Worker** (en `worker/`) que actúa como backend ligero
   para la suscripción a la newsletter, integrado con la API v3 de Brevo.

Construido con **Astro 7**, TypeScript estricto y CSS nativo — sin frameworks
de UI ni dependencias runtime. Rápido, accesible y estático.

> 📖 Para entender cómo funciona la aplicación en detalle, consulta
> [`ARCHITECTURE.md`](./ARCHITECTURE.md).

---

## 🚀 Estructura del proyecto

```text
/
├── public/                   # Assets estáticos servidos tal cual
│   ├── favicon.svg
│   ├── favicon.ico
│   └── images/
│       ├── logo.png
│       └── apple-touch-icon.png
├── docs/
│   └── newsletter.md         # Doc completa del sistema de newsletter
├── src/                      # ── Web Astro ──
│   ├── config/              # Fuente única de verdad (contenido tipado)
│   │   ├── site.ts          #   nombre, descripción, url, locale
│   │   ├── social.ts        #   enlaces a redes sociales
│   │   ├── projects.ts      #   proyectos / juegos del estudio
│   │   ├── newsletter.ts    #   endpoint + mensajes de la newsletter general
│   │   ├── project-newsletter.ts # endpoint + mensajes de novedades de proyectos
│   │   └── privacy-policy.ts #   texto legal de la Política de Privacidad
│   ├── layouts/
│   │   └── MainLayout.astro # Shell HTML: SEO, favicons, noise, reveal
│   ├── pages/
│   │   ├── index.astro      # Landing principal (/): Hero + Projects + ProjectSubscribe + Social + Newsletter
│   │   └── privacy-policy.astro # Política de Privacidad (/privacy-policy)
│   ├── components/
│   │   ├── Hero.astro       # Logo + título + descripción con aurora
│   │   ├── Projects.astro   # Scroll horizontal modular de proyectos
│   │   ├── ProjectSubscribe.astro # Formulario de novedades de proyectos (vista)
│   │   ├── SocialLinks.astro # Nav de redes con iconos SVG inline
│   │   └── NewsletterForm.astro # Formulario de newsletter (progressive enhancement)
│   └── styles/
│       └── global.css        # Design tokens, reset, accesibilidad, keyframes
├── worker/                   # ── Cloudflare Worker (proyecto independiente) ──
│   ├── wrangler.toml         # Config de despliegue (nombre, ALLOWED_ORIGINS)
│   ├── package.json          # wrangler + workers-types + typescript
│   └── src/
│       ├── index.ts          # Handler principal (fetch + CORS + validaciones)
│       ├── types.ts          # Tipos compartidos
│       ├── env.ts            # Validación de variables de entorno
│       ├── security.ts       # CORS, honeypot, sanitización de email
│       ├── responses.ts      # Helpers de respuestas HTTP
│       ├── brevo-provider.ts # Integración con API v3 de Brevo
│       └── newsletter-service.ts # Capa de abstracción del proveedor
├── astro.config.mjs
├── tsconfig.json             # Extiende astro/tsconfigs/strict
└── package.json
```

Astro busca archivos `.astro` en `src/pages/` y los expone como rutas según
su nombre. El sitio tiene dos rutas: `index.astro` → `/` y
`privacy-policy.astro` → `/privacy-policy`.

---

## 🧞 Comandos

### Web Astro (raíz del repo)

| Command | Action |
| :--- | :--- |
| `npm install` | Instala dependencias de la web |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera el sitio de producción en `./dist/` |
| `npm run preview` | Previsualiza el build localmente antes de desplegar |
| `npm run astro ...` | Comandos CLI de Astro (`astro add`, `astro check`, …) |
| `npm run astro -- --help` | Ayuda del CLI de Astro |

### Worker (`worker/`)

| Command | Action |
| :--- | :--- |
| `cd worker && npm install` | Instala dependencias del Worker |
| `cd worker && npm run dev` | Worker local en `localhost:8788` (`wrangler dev`) |
| `cd worker && npm run deploy` | Despliega el Worker a Cloudflare |
| `cd worker && npm run check` | Type-check del Worker (`tsc --noEmit`) |
| `cd worker && npx wrangler secret put BREVO_API_KEY` | Configura secreto de Brevo |
| `cd worker && npx wrangler secret put BREVO_LIST_ID` | Configura ID de lista de Brevo |

### Requisitos

- **Node.js** `>=22.12.0`
- npm (incluido con Node)
- Cuenta de Cloudflare con Workers habilitados (para el Worker)

---

## 🎨 Personalización

Todo el contenido editable de la web vive en `src/config/`:

### Datos del sitio — `src/config/site.ts`

```ts
export const siteConfig: SiteConfig = {
  name: "ToonzGamers Studio",
  description: "Estudio independiente de desarrollo de videojuegos…",
  url: "https://toonzgamers.com",
  locale: "es_ES",
  lang: "es",
};
```

### Redes sociales — `src/config/social.ts`

```ts
export const socialLinks: SocialLinksConfig = {
  links: [
    { key: "twitter",  label: "Síguenos en X (Twitter)", href: "https://x.com/G3oX", icon: "twitter" },
    { key: "bluesky",  label: "Síguenos en Bluesky",     href: "https://bsky.app/profile/g3ox.bsky.social", icon: "bluesky" },
    // … youtube, twitch, discord
  ],
};
```

> Los enlaces se renderizan con `target="_blank"` y `rel="noopener noreferrer"`.
> Para añadir una red nueva, agrega una entrada a `links` y su path SVG en
> `iconPaths` dentro de `SocialLinks.astro`.

### Newsletter — `src/config/newsletter.ts`

```ts
export const newsletterConfig: NewsletterConfig = {
  endpoint: "https://webnewsletter.toonzgamersstudio.workers.dev/api/newsletter",
  messages: {
    success: "¡Suscripción confirmada! Revisa tu correo.",
    alreadySubscribed: "Ya estás suscrito. ¡Gracias!",
    error: "Error. Intenta de nuevo más tarde.",
    invalidEmail: "Introduce un email válido.",
    loading: "Suscribiendo...",
  },
};
```

> Para desarrollo local contra un Worker local, cambia `endpoint` a
> `http://localhost:8788/api/newsletter` y configura `ALLOWED_ORIGINS` en
> `worker/.dev.vars`. Revertir antes de desplegar.

### Proyectos — `src/config/projects.ts`

```ts
export const projectsConfig: ProjectsConfig = {
  projects: [
    {
      id: "monkeys-tower-world-tour",
      title: "Monkeys Tower World Tour",
      description: "Una aventura móvil colorida y adictiva…",
      status: "coming_soon",        // "coming_soon" | "in_development" | "available"
      statusLabel: "Próximamente en Android",
      // image: "/images/projects/monkeys-tower.png",  // opcional
      // links: [{ label: "Google Play", href: "…" }], // opcional
    },
  ],
};
```

> Para añadir un proyecto, copia una entrada del array `projects` y ajusta
> los valores. Cada entrada se renderiza automáticamente como una tarjeta
> en el scroll horizontal de `<Projects />`. Si incluyes `image`, coloca el
> archivo en `public/images/projects/`.

### Novedades de proyectos — `src/config/project-newsletter.ts`

```ts
export const projectNewsletterConfig: ProjectNewsletterConfig = {
  endpoint: "#",  // TODO: configurar endpoint real (lista de Brevo diferente)
  messages: {
    success: "¡Suscripción confirmada! Revisa tu correo.",
    // … alreadySubscribed, error, invalidEmail, loading
    comingSoon: "Próximamente. ¡Gracias por tu interés!",
  },
};
```

> Este formulario usa una **lista de Brevo diferente** a la newsletter
> general. Por ahora `endpoint` es un placeholder (`#`) y el componente
> `<ProjectSubscribe />` muestra un mensaje de "Próximamente" al enviar.
> Cuando el backend esté listo, reemplaza `endpoint` y el bloque
> `setTimeout` en `ProjectSubscribe.astro` por una llamada `fetch` real
> (como en `NewsletterForm.astro`).

### Política de Privacidad — `src/config/privacy-policy.ts`

```ts
export const privacyPolicyConfig: PrivacyPolicyConfig = {
  title: "Política de Privacidad de ToonzGamers",
  lastUpdated: "29 de julio de 2026",
  sections: [
    { id: "1", title: "Introducción", paragraphs: ["…"] },
    { id: "3", title: "Información que podemos recopilar", subsections: [
      { id: "3.1", title: "Información técnica", list: ["…"] },
      // …
    ]},
    // … 14 secciones en total
  ],
  contact: {
    name: "ToonzGamers",
    email: "privacy@toonzgamers.com",
  },
};
```

> El contenido legal vive como dato tipado en `src/config/privacy-policy.ts`
> y se renderiza en `/privacy-policy` vía `src/pages/privacy-policy.astro`.
> Para actualizar el texto, edita las `sections`; para cambiar el email de
> contacto, modifica `contact.email`. La fecha `lastUpdated` se muestra en
> el encabezado de la página.

### Design tokens — `src/styles/global.css`

Colores, tipografía, espaciado, motion y z-index se definen como *custom
properties* en `:root`. Modifícalos ahí para cambiar el tema global.

---

## ✉️ Sistema de newsletter

El formulario de suscripción funciona con y sin JavaScript (*progressive
enhancement*). Con JS activo, envía vía `fetch` al Worker; sin JS, hace un
POST tradicional al mismo endpoint.

```text
Navegador  ──POST CORS──►  Cloudflare Worker  ──POST──►  Brevo API v3
                              (webnewsletter)              (lista de correo)
```

- **Worker**: `https://webnewsletter.toonzgamersstudio.workers.dev`
- **Web**: `https://toonzgamers.com` (cross-origin al Worker)
- **Secretos** (`BREVO_API_KEY`, `BREVO_LIST_ID`): se configuran con
  `wrangler secret put` o el dashboard de Cloudflare. **Nunca se commitean.**
- `ALLOWED_ORIGINS` se define en `worker/wrangler.toml` `[vars]`.

> Consulta [`docs/newsletter.md`](./docs/newsletter.md) para la
> documentación completa (setup de Brevo, despliegue, desarrollo local,
> seguridad, respuestas HTTP, cambio de proveedor).

---

## ♿ Accesibilidad

El sitio está diseñado para ser accesible por defecto:

- HTML semántico (`<section>`, `<nav>`, `<main>`, `<ul role="list">`,
  `<form>`, `<label>`).
- `aria-label` en secciones y navegación; `aria-hidden` en decoración y honeypot.
- Texto alternativo `.visually-hidden` para lectores de pantalla.
- `:focus-visible` con outline visible.
- `@media (prefers-reduced-motion: reduce)` anula animaciones.
- `<noscript>` y `@media (scripting: none)` muestran el contenido sin JS.
- El formulario de newsletter funciona sin JS (progressive enhancement) y
  usa `role="status"` + `aria-live="polite"` para los mensajes.

---

## 🔍 SEO

Gestionado en `MainLayout.astro`:

- `<title>` con patrón `Página | ToonzGamers Studio`.
- `<meta name="description">`, `<link rel="canonical">`.
- Open Graph completo + Twitter Card `summary_large_image`.
- Favicons SVG, ICO y apple-touch-icon.

---

## 🧩 Stack técnico

| Capa | Tecnología |
| --- | --- |
| Web framework | Astro `^7.0.3` (estático) |
| Backend | Cloudflare Workers (serverless edge) |
| Lenguaje | TypeScript (`astro/tsconfigs/strict` + worker strict) |
| UI | Componentes `.astro` (sin React/Vue/Svelte) |
| Estilos | CSS nativo + custom properties + estilos scoped |
| JS cliente | Tres `<script is:inline>` (reveal + newsletter + project-subscribe) |
| Iconos | SVG inline (sin librerías) |
| Newsletter | Brevo API v3 (vía Worker) |

---

## 📁 Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Cómo funciona la aplicación
  (flujo de renderizado, capas, Worker, design system, decisiones de diseño).
- [`docs/newsletter.md`](./docs/newsletter.md) — Documentación completa del
  sistema de newsletter (Brevo, Worker, secretos, desarrollo local,
  seguridad, respuestas HTTP, cambio de proveedor).
- [`AGENTS.md`](./AGENTS.md) — Guía y convenciones para agentes de IA que
  trabajen en este repositorio.

---

## ⚖️ Licencia de activos

ToonzGamers®, logotipos, imágenes, contenido editorial y elementos gráficos
no están cubiertos por la licencia AGPL y permanecen bajo todos los derechos
reservados de sus respectivos propietarios.

---

The ToonzGamers® name, logos, images, artwork, editorial content, and other
graphical assets are not licensed under the AGPL. All rights are reserved by
their respective owners.

---

## 👀 Recursos

- [Documentación de Astro](https://docs.astro.build)
- [Documentación de Cloudflare Workers](https://developers.cloudflare.com/workers/)
- [Documentación de Brevo API](https://developers.brevo.com/)
- [Discord de Astro](https://astro.build/chat) 