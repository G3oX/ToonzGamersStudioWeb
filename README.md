# ToonzGamers Studio Web

Sitio web oficial de **ToonzGamers Studio**, estudio independiente de
desarrollo de videojuegos formado por un único desarrollador. Es una
*landing page* de una sola página que presenta el estudio, sus valores y
sus redes sociales.

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
├── src/
│   ├── config/              # Fuente única de verdad (contenido tipado)
│   │   ├── site.ts          #   nombre, descripción, url, locale
│   │   └── social.ts        #   enlaces a redes sociales
│   ├── layouts/
│   │   └── MainLayout.astro # Shell HTML: SEO, favicons, noise, reveal
│   ├── pages/
│   │   └── index.astro      # Página única (/): Hero + Marquee + Social
│   ├── components/
│   │   ├── Hero.astro       # Logo + título + descripción con aurora
│   │   ├── Marquee.astro     # Marquee infinito de valores del estudio
│   │   └── SocialLinks.astro # Nav de redes con iconos SVG inline
│   └── styles/
│       └── global.css        # Design tokens, reset, accesibilidad, keyframes
├── astro.config.mjs
├── tsconfig.json             # Extiende astro/tsconfigs/strict
└── package.json
```

Astro busca archivos `.astro` o `.md` en `src/pages/` y los expone como
rutas según su nombre. Aquí solo existe `index.astro` → ruta `/`.

---

## 🧞 Comandos

Todos los comandos se ejecutan desde la raíz del proyecto:

| Command | Action |
| :--- | :--- |
| `npm install` | Instala dependencias |
| `npm run dev` | Inicia el servidor de desarrollo en `localhost:4321` |
| `npm run build` | Genera el sitio de producción en `./dist/` |
| `npm run preview` | Previsualiza el build localmente antes de desplegar |
| `npm run astro ...` | Comandos CLI de Astro (`astro add`, `astro check`, …) |
| `npm run astro -- --help` | Ayuda del CLI de Astro |

### Requisitos

- **Node.js** `>=22.12.0`
- npm (incluido con Node)

---

## 🎨 Personalización

Todo el contenido editable vive en `src/config/`:

### Datos del sitio — `src/config/site.ts`

```ts
export const siteConfig: SiteConfig = {
  name: "ToonzGamers Studio",
  description: "Estudio independiente de desarrollo de videojuegos…",
  url: "https://toonzgamersstudio.com",
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

### Design tokens — `src/styles/global.css`

Colores, tipografía, espaciado, motion y z-index se definen como *custom
properties* en `:root`. Modifícalos ahí para cambiar el tema global.

---

## ♿ Accesibilidad

El sitio está diseñado para ser accesible por defecto:

- HTML semántico (`<section>`, `<nav>`, `<main>`, `<ul role="list">`).
- `aria-label` en secciones y navegación; `aria-hidden` en decoración.
- Texto alternativo `.visually-hidden` para lectores de pantalla.
- `:focus-visible` con outline visible.
- `@media (prefers-reduced-motion: reduce)` anula animaciones.
- `<noscript>` y `@media (scripting: none)` muestran el contenido sin JS.

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
| Framework | Astro `^7.0.3` (estático) |
| Lenguaje | TypeScript (`astro/tsconfigs/strict`) |
| UI | Componentes `.astro` (sin React/Vue/Svelte) |
| Estilos | CSS nativo + custom properties + estilos scoped |
| JS cliente | Un único `<script is:inline>` (IntersectionObserver) |
| Iconos | SVG inline (sin librerías) |

---

## 📁 Documentación

- [`ARCHITECTURE.md`](./ARCHITECTURE.md) — Cómo funciona la aplicación
  (flujo de renderizado, capas, design system, decisiones de diseño).
- [`AGENTS.md`](./AGENTS.md) — Guía y convenciones para agentes de IA que
  trabajen en este repositorio.

---

## 👀 Recursos

- [Documentación de Astro](https://docs.astro.build)
- [Discord de Astro](https://astro.build/chat)