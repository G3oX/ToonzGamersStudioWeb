# Arquitectura — ToonzGamers Studio Web

Sitio estático oficial de **ToonzGamers Studio**, construido con Astro 7 y
TypeScript estricto. El repositorio contiene dos proyectos independientes:

1. La web Astro en `src/`, desplegada en `https://toonzgamers.com`.
2. El Cloudflare Worker en `worker/`, proxy de newsletter para la API v3 de Brevo.

No hay frameworks de UI ni dependencias runtime adicionales. La integración
`@astrojs/sitemap` se ejecuta únicamente durante el build.

## Estructura

```text
├── astro.config.mjs              # URL canónica + integración de sitemap
├── public/
│   ├── robots.txt                # Crawlers web y de IA permitidos
│   ├── llms.txt                  # Índice curado para agentes de IA
│   └── images/                   # Assets estáticos
├── src/
│   ├── config/
│   │   ├── site.ts               # Identidad y URL del sitio
│   │   ├── social.ts             # Enlaces sociales
│   │   ├── projects.ts           # Proyectos y etiquetas de estado
│   │   ├── icons.ts              # Paths SVG compartidos
│   │   ├── project-newsletter.ts # Endpoint y mensajes de suscripción
│   │   └── privacy-policy.ts     # Metadatos y contenido legal
│   ├── components/
│   │   ├── Hero.astro            # Hero; contiene SocialLinks
│   │   ├── SocialLinks.astro     # Navegación social
│   │   ├── Projects.astro        # Pin/sticky scroll y carrusel
│   │   ├── ProjectCard.astro     # Presentación de una tarjeta
│   │   └── ProjectSubscribe.astro # Formulario conectado al Worker
│   ├── layouts/MainLayout.astro  # Shell HTML, SEO y reveal global
│   ├── pages/
│   │   ├── index.astro           # Hero + Projects
│   │   └── privacy-policy.astro  # Ruta legal
│   └── styles/global.css         # Tokens, reset y utilidades compartidas
└── worker/
    ├── wrangler.toml
    └── src/
        ├── index.ts              # Handler HTTP, CORS y validaciones
        ├── newsletter-service.ts # Capa de servicio
        ├── brevo-provider.ts     # Adaptador de Brevo
        ├── security.ts           # CORS, honeypot y sanitización
        ├── responses.ts          # Respuestas JSON
        ├── env.ts                # Validación del entorno
        └── types.ts              # Contratos compartidos
```

## Web Astro

### Composición y rutas

La web tiene dos rutas estáticas:

- `/`: `index.astro` compone únicamente `Hero` y `Projects` dentro de
  `MainLayout`. `SocialLinks` se renderiza dentro de `Hero`. No se muestra un
  formulario global de newsletter; la suscripción activa está dentro de las
  tarjetas de proyecto que habilitan `subscribe`.
- `/privacy-policy/`: renderiza la configuración legal desde
  `src/config/privacy-policy.ts`, incluida su descripción SEO tipada.

`MainLayout.astro` centraliza title, meta description, canonical, Open Graph,
Twitter Card, favicons, overlay visual y el script de reveal. Astro conoce la
URL canónica mediante `site: "https://toonzgamers.com"`.

### Configuración tipada

Todo contenido editable vive en `src/config/`:

- `projects.ts` define `Project`, `ProjectStatus`, plataformas y proyectos.
  `statusLabel` no se almacena en cada entrada: se deriva de
  `projectStatusLabels: Record<ProjectStatus, string>` para evitar divergencias.
- `icons.ts` expone un único `iconPaths` tipado para plataformas y redes.
  `ProjectCard.astro` y `SocialLinks.astro` consumen el mismo mapa sin alterar
  los SVG renderizados.
- `project-newsletter.ts` usa el endpoint canónico
  `https://webnewsletter.toonzgamersstudio.workers.dev/api/newsletter`.
- `privacy-policy.ts` contiene título, descripción SEO, fecha, secciones y
  contacto de la página legal.

### Proyectos

`Projects.astro` filtra las entradas con `visible: false`, mantiene el stage,
los indicadores y toda la mecánica de navegación. Cada entrada se delega a
`ProjectCard.astro`, que recibe un `Project` tipado y renderiza media, badge,
plataformas, nombre, descripción y footer con enlaces o `ProjectSubscribe`.

En escritorio con puntero fino y movimiento normal, Projects usa un contenedor
vertical alto con un stage `position: sticky`. El progreso del scroll vertical
mueve linealmente las tarjetas, actualiza escalado/opacidad y hace snap
programático a la tarjeta más cercana. No es un scroll-snap horizontal en ese
modo. Para touch, `prefers-reduced-motion`, una sola tarjeta o ausencia de JS,
se conserva el fallback horizontal nativo con CSS `scroll-snap`.

### Newsletter de proyectos

`ProjectSubscribe.astro` está conectado al Worker real; no usa un `setTimeout`
de demostración. El script envía JSON mediante `fetch`, valida el email,
incluye honeypot, gestiona loading/success/error y anuncia resultados con
`role="status"` y `aria-live="polite"`.

El flujo es:

```text
ProjectSubscribe.astro
  └─ POST CORS /api/newsletter
       └─ worker/src/index.ts
            └─ NewsletterService
                 └─ BrevoProvider
                      └─ Brevo API v3 /contacts
```

## Cloudflare Worker

El Worker valida entorno, método POST, `Content-Type`, tamaño del cuerpo,
origen CORS, JSON, honeypot y email antes de delegar en `NewsletterService`.
`BrevoProvider` devuelve `SubscribeResult`, incluido `alreadySubscribed`; el
handler usa ese resultado para escoger el mensaje de éxito correspondiente.
Los errores públicos siguen siendo genéricos y los logs no incluyen emails
completos ni secretos.

Variables:

| Variable | Clase | Configuración |
| --- | --- | --- |
| `BREVO_API_KEY` | Secreto | `wrangler secret put` o dashboard |
| `BREVO_LIST_ID` | Secreto | `wrangler secret put` o dashboard |
| `ALLOWED_ORIGINS` | Pública | `worker/wrangler.toml` |

Los secretos nunca se commitean. Consulta `docs/newsletter.md` para setup,
despliegue y desarrollo local.

## SEO y descubrimiento

- `@astrojs/sitemap` genera `sitemap-index.xml` durante el build.
- `public/robots.txt` permite explícitamente el rastreo general y los crawlers
  de IA configurados por el propietario, y referencia el sitemap.
- `public/llms.txt` ofrece un índice Markdown curado del estudio, proyectos
  visibles y política de privacidad.

## CI y seguridad

- `.github/workflows/security.yml` invoca los workflows reutilizables de
  [`TheLastBattlellama/Battlellama-actions`](https://github.com/TheLastBattlellama/Battlellama-actions):
  `security-scan.yml` (Gitleaks + Trivy FS) y `sast-javascript.yml` (Semgrep,
  `framework: generic`).
- Es un gate de CI puro: no despliega nada. Advierte en `pull_request`
  (`exit-code: 0`) y bloquea en `push` a `main` (`exit-code: 1`).
- El despliegue de la web sigue gestionado por la integración Git nativa de
  Cloudflare Pages (build/deploy automático desde el dashboard), independiente
  de GitHub Actions. El Worker se despliega manualmente con
  `cd worker && npm run deploy`.

## Accesibilidad y rendimiento

- HTML semántico, labels ARIA, decoración oculta y enlaces externos seguros.
- Focus visible y animaciones compatibles con `prefers-reduced-motion`.
- Contenido visible sin JS mediante `<noscript>` y `@media (scripting: none)`.
- Imágenes con dimensiones, `loading` y `decoding` explícitos.
- Cero JavaScript de frameworks. Los scripts inline cubren reveal, carrusel y
  suscripción de proyectos.
- CSS nativo con tokens compartidos en `src/styles/global.css` y nomenclatura
  BEM-ish por componente.

## Verificación

Desde la raíz:

```sh
npm run build
npx astro check
```

Para comprobar el Worker por separado:

```sh
cd worker && npm run check
```
