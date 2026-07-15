/**
 * Configuración de proyectos / juegos del estudio.
 *
 * Fuente única de verdad para la sección de proyectos. Cada entrada
 * del array `projects` se renderiza como una tarjeta en el componente
 * `<Projects />`.
 *
 * Para añadir más proyectos, copia una entrada existente y ajusta los
 * valores. Si incluyes `image`, coloca el archivo en `public/` (por
 * ejemplo, `/images/projects/monkeys-tower.png`).
 *
 * @module projects
 */

export type ProjectStatus = "coming_soon" | "in_development" | "available";

export const projectStatusLabels: Record<ProjectStatus, string> = {
  coming_soon: "Próximamente",
  in_development: "En desarrollo",
  available: "Disponible",
};

export type Platform = "webgl" | "android" | "ios" | "steam" | "epic" | "gog";

export interface ProjectLink {
  /** Texto del enlace (p. ej., "Google Play", "Steam", "Web"). */
  label: string;
  /** URL absoluta del enlace. */
  href: string;
  /** Icono de plataforma opcional para mostrar antes del label. */
  icon?: Platform;
}

export interface Project {
  /** Identificador único, usado como clave de renderizado. */
  id: string;
  /** Título del proyecto. */
  title: string;
  /** Descripción corta (1-2 frases). */
  description: string;
  /** Estado del proyecto para la lógica de color/etiqueta. */
  status: ProjectStatus;
  /** Plataformas donde está o estará disponible el proyecto. */
  platforms?: Platform[];
  /** Ruta opcional de la imagen destacada (servida desde `public/`). */
  image?: string;
  /** Enlaces opcionales a tiendas, web o descargas. */
  links?: ProjectLink[];
  /** Si true, muestra el formulario de suscripción a novedades dentro de la tarjeta. */
  subscribe?: boolean;
  /**
   * Si la tarjeta es visible en la sección de proyectos.
   * Por defecto `true`. Ponlo a `false` para ocultar una tarjeta
   * sin tener que borrarla del array.
   */
  visible?: boolean;
}

export interface ProjectsConfig {
  projects: Project[];
}

export const projectsConfig: ProjectsConfig = {
  projects: [
    {
      id: "monkeys-tower-world-tour",
      title: "Monkeys Tower World Tour",
      description:
        "Recorre el mundo y construye torres de monos a base de cañonazos para conseguir la copa Monada. Supera los distintos niveles, usa power-ups y personaliza tu personaje con atuendos de las distintas localidades. ¡Llega a lo más alto y no los dejes caer!",
      status: "in_development",
      platforms: ["android"],
      links: [
        {
          label: "Google Play",
          href: "https://play.google.com/store/apps/details?id=com.toonz.monkeys.tower.world.tour",
          icon: "android",
        },
      ],
      subscribe: true,
      image: "/images/projects/monkeys-tower-world-tour/cover.webp",
    },
    {
      // Plantilla oculta. Copia esta entrada, cambia los valores y
      // pon `visible: true` (o elimina la propiedad) para mostrarla.
      id: "project-template",
      title: "Nombre del proyecto",
      description: "Descripción corta del proyecto (1-2 frases).",
      status: "in_development",
      visible: false,
    },
  ],
};
