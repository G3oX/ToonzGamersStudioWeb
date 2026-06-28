# Arquitectura — ToonzGamers Studio Web

Sitio web oficial de **ToonzGamers Studio**, un estudio independiente de
desarrollo de videojuegos formado por un único desarrollador. Es una
*landing page* de una sola página construida con **Astro 7** que presenta el
estudio, sus valores y sus redes sociales.

---

## 1. Visión general

| Aspecto | Valor |
| --- | --- |
| Framework | Astro `^7.0.3` (modo estático, sin SSR) |
| Lenguaje | TypeScript (config `astro/tsconfigs/strict`) |
| UI frameworks | Ninguno — solo componentes `.astro` |
| Estilos | CSS nativo con *custom properties* + estilos *scoped* por componente |
| Runtime JS | Mínimo: un único `<script is:inline>` para *reveal-on-scroll* |
| Node | `>=22.12.0` |
| Locale | `es_ES` (`lang="es"`) |
| Salida | Sitio estático en `dist/` |

El sitio es **100% estático**: no hay backend, base de datos, ni endpoints
dinámicos. Toda la información vive en archivos de configuración TypeScript
y se renderiza en tiempo de build.

---

## 2. Estructura del proyecto

```text
ToonzGamersStudioWeb/
├── astro.config.mjs          # Configuración de Astro (vacía: defaults)
├── tsconfig.json             # Extiende astro/tsconfigs/strict
├── package.json
├── AGENTS.md                 # Guía para agentes de IA
├── ARCHITECTURE.md           # Este documento
├── README.md                 # Documentación del proyecto
├── public/                   # Assets estáticos servidos tal cual
│   ├── favicon.svg
│   ├── favicon.ico
│   └── images/
│       ├── logo.png
│       └── apple-touch-icon.png
└── src/
    ├── config/               # Fuente única de verdad (contenido)
    │   ├── site.ts           # SiteConfig: nombre, descripción, url, locale
    │   └── social.ts         # SocialLinksConfig: enlaces a redes
    ├── layouts/
    │   └── MainLayout.astro  # Shell HTML: <head>, SEO, favicons, noise, reveal
    ├── pages/
    │   └── index.astro       # Página única: compone Hero + Marquee + Social
    ├── components/
    │   ├── Hero.astro        # Logo + título + descripción con aurora de fondo
    │   ├── Marquee.astro     # Marquee infinito de valores del estudio
    │   └── SocialLinks.astro # Nav de redes con iconos SVG inline
    └── styles/
        └── global.css        # Design tokens, reset, accesibilidad, animaciones
```

---

## 3. Flujo de renderizado

```text
src/config/*.ts  ──►  src/pages/index.astro
                         │
                         ├── MainLayout.astro  (shell HTML + SEO + scripts)
                         │      └── global.css (tokens + reset + animaciones)
                         ├── Hero.astro        (sección hero)
                         ├── Marquee.astro     (marquee de valores)
                         └── SocialLinks.astro (nav de redes)
                                  │
                                  ▼
                         dist/index.html  (HTML estático + CSS + assets)
```

1. **Configuración** (`src/config/`): `siteConfig` y `socialLinks` son objetos
   TypeScript tipados exportados como módulos. Son la **única fuente de verdad**
   para nombre, descripción, URL, locale y enlaces sociales.
2. **Página** (`src/pages/index.astro`): importa la configuración y los tres
   componentes, y los compone dentro de `<MainLayout>`.
3. **Layout** (`MainLayout.astro`): genera el `<!doctype html>`, el `<head>`
   con metadatos SEO (Open Graph, Twitter Card, canonical, favicons), el
   overlay de ruido, el `<slot />` para el contenido y el script de
   *reveal-on-scroll*.
4. **Componentes** (`src/components/`): cada uno es autónomo, con su marcado
   HTML semántico y sus estilos `<style>` *scoped*. Reciben datos vía props
   o importando directamente la configuración.
5. **Build**: Astro compila todo a HTML estático en `dist/`, sin JavaScript de
   framework. El único JS enviado al cliente es el script *inline* del layout.

---

## 4. Capas de la aplicación

### 4.1 Configuración (`src/config/`)

Capa de **datos**. Dos módulos tipados:

- **`site.ts`** — interfaz `SiteConfig` + constante `siteConfig` con `name`,
  `description`, `url`, `locale` y `lang`.
- **`social.ts`** — interfaz `SocialLink` (con `key`, `label`, `href`, `icon`)
  y `SocialLinksConfig`. Los enlaces usan `target="_blank"` y
  `rel="noopener noreferrer"` al renderizarse.

**Convención:** cualquier contenido reutilizable o que pueda cambiar (texto,
enlaces, metadatos) debe vivir aquí como dato tipado, no hardcodeado en el
marcado.

### 4.2 Layout (`src/layouts/MainLayout.astro`)

Capa de **presentación global**. Responsabilidades:

- **Props**: `title` (obligatorio), `description?` e `image?` con defaults
  tomados de `siteConfig`.
- **SEO**: `<title>`, `<meta description>`, `<link canonical>`, Open Graph
  completo, Twitter Card `summary_large_image`. Las URLs absolutas se
  construyen con `new URL(..., siteConfig.url)`.
- **Favicons**: SVG, ICO y apple-touch-icon.
- **Accesibilidad**: `<noscript>` que fuerza `.reveal { opacity: 1 }` para que
  el contenido sea visible sin JS.
- **Overlay de ruido**: SVG `feTurbulence` fijo con `mix-blend-mode: overlay`
  para textura fílmica.
- **Script *reveal-on-scroll***: `<script is:inline>` que usa
  `IntersectionObserver` para añadir `.is-visible` a los `.reveal`. Respeta
  `prefers-reduced-motion` (no hace nada si el usuario la activa).

### 4.3 Página (`src/pages/index.astro`)

Capa de **composición**. Es la única ruta del sitio (`/`). Importa el layout
y los tres componentes y los anida dentro de `<main>`.

### 4.4 Componentes (`src/components/`)

Capa de **UI**. Tres componentes, cada uno autónomo:

#### `Hero.astro`
- Sección `<section class="hero">` con `aria-label`.
- Fondo **aurora**: tres blobs con `radial-gradient` y `filter: blur()`,
  animados con `auroraDrift` (keyframes en `global.css`).
- Logo (`<img>` con `loading="eager"`, `decoding="async"`, dimensiones
  explícitas), título con gradiente animado (`shimmer`) y descripción.
- Animaciones de entrada: `fadeInScale` + `float` (logo), `fadeInUp` (texto).

#### `Marquee.astro`
- Sección con `aria-label` y texto alternativo `visually-hidden` para
  lectores de pantalla (el contenido visual está `aria-hidden`).
- Dos bloques `.marquee__content` duplicados para un *marquee* infinito
  sin saltos (`marqueeScroll` mueve `-50%`).
- Máscara de gradiente para difuminar los bordes.

#### `SocialLinks.astro`
- `<nav aria-label="Redes sociales">` con `<ul role="list">`.
- Iconos SVG **inline** (mapa `iconPaths: Record<IconName, string>`) — sin
  dependencia de librerías de iconos.
- Enlaces con `target="_blank" rel="noopener noreferrer"` y `aria-label`
  descriptivo.
- Efectos hover/focus: `translateY(-4px) scale(1.06)`, glow radial, borde
  iluminado. Soporta `:focus-visible`.

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

**Convención:** los componentes usan estilos *scoped* (`<style>` dentro del
`.astro`) para lo específico, y `global.css` para tokens, reset, utilidades
y keyframes compartidos.

---

## 5. Design system

### Paleta
| Token | Valor | Uso |
| --- | --- | --- |
| `--color-bg` | `#0b0d12` | Fondo de página |
| `--color-surface` | `#13161d` | Superficies (logo) |
| `--color-text` | `#f2f4f8` | Texto principal |
| `--color-muted` | `#9aa3b2` | Texto secundario |
| `--color-accent` | `#7c83fd` | Acento índigo |
| `--color-teal` | `#00a080` | Aurora / gradientes |
| `--color-cyan` | `#00f0f0` | Aurora / gradientes |

### Espaciado
`--space-xs` (0.5rem) · `--space-sm` (0.75rem) · `--space-md` (1rem) ·
`--space-lg` (1.5rem) · `--space-xl` (2rem) · `--space-2xl` (3rem) ·
`--space-3xl` (5rem)

### Z-index
`--z-aurora` (-1) · `--z-ground` (0) · `--z-content` (1) · `--z-overlay`
(100) · `--z-noise` (200)

### Nomenclatura CSS
BEM-ish: `.hero__aurora-blob--1`, `.social__link`, `.marquee__content`.

---

## 6. Accesibilidad

El proyecto prioriza accesibilidad desde el diseño:

- **HTML semántico**: `<section>`, `<nav>`, `<main>`, `<ul role="list">`.
- **ARIA**: `aria-label` en secciones y nav, `aria-hidden` en decoración
  (aurora, marquee visual, overlay de ruido).
- **Texto alternativo**: `.visually-hidden` para contenido dirigido a
  lectores de pantalla (p. ej. el marquee expone los valores como texto).
- **Foco visible**: `:focus-visible` con outline de 2px en color acento.
- **Movimiento reducido**: `@media (prefers-reduced-motion: reduce)` anula
  animaciones; el script de reveal no se ejecuta.
- **Sin JS**: `<noscript>` y `@media (scripting: none)` garantizan que el
  contenido `.reveal` sea visible sin JavaScript.
- **Enlaces externos**: `target="_blank"` siempre con
  `rel="noopener noreferrer"`.

---

## 7. SEO

Gestionado en `MainLayout.astro`:

- `<title>` con patrón `Página | ToonzGamers Studio` (o solo el nombre si
  coincide con `siteConfig.name`).
- `<meta name="description">` con default desde `siteConfig`.
- `<link rel="canonical">` construido desde `Astro.url` y `siteConfig.url`.
- **Open Graph** completo: `og:type`, `og:title`, `og:description`,
  `og:url`, `og:site_name`, `og:locale`, `og:image` (URL absoluta).
- **Twitter Card** `summary_large_image` con título, descripción e imagen.
- Favicons: SVG (principal), ICO (alternativo) y apple-touch-icon.

---

## 8. Rendimiento

- **Cero JS de framework**: Astro renderiza todo en build time.
- **Único script cliente**: `IntersectionObserver` *inline* para reveal.
- **Imágenes**: `loading` y `decoding` explícitos, dimensiones en el markup
  para evitar *layout shift*.
- **CSS scoped**: solo los estilos usados por cada componente se incluyen.
- **`will-change`** declarado en elementos animados (aurora, marquee, social).
- **Sin dependencias runtime** más allá de Astro.

---

## 9. Comandos

| Comando | Acción |
| --- | --- |
| `npm install` | Instala dependencias |
| `npm run dev` | Servidor de desarrollo en `localhost:4321` |
| `astro dev --background` | Dev server en segundo plano (ver `AGENTS.md`) |
| `npm run build` | Build de producción a `./dist/` |
| `npm run preview` | Previsualiza el build localmente |
| `npm run astro ...` | Comandos CLI de Astro |

---

## 10. Decisiones de diseño

- **Astro puro, sin integraciones**: el sitio es estático y minimalista;
  añadir React/Vue/etc. sería *overkill* y aumentaría el bundle.
- **Configuración tipada centralizada**: separar datos de presentación
  facilita mantener el contenido sin tocar el marcado.
- **CSS nativo + custom properties**: evita dependencias (Tailwind, etc.) y
  mantiene el control total del design system. Los *custom properties*
  permiten tematización trivial.
- **Iconos SVG inline**: cero dependencias, mejor rendimiento que icon
  fonts o librerías, y control total del estilo.
- **Accesibilidad *by design***: no se añade como *post-fix*, está integrada
  en cada componente y en el layout.
- **TypeScript strict**: detecta errores en build y documenta los contratos
  de configuración.