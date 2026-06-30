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

export interface ProjectLink {
  /** Texto del enlace (p. ej., "Google Play", "Steam", "Web"). */
  label: string;
  /** URL absoluta del enlace. */
  href: string;
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
  /** Texto que se muestra en la chapa de estado. */
  statusLabel: string;
  /** Ruta opcional de la imagen destacada (servida desde `public/`). */
  image?: string;
  /** Enlaces opcionales a tiendas, web o descargas. */
  links?: ProjectLink[];
  /** Si true, muestra el formulario de suscripción a novedades dentro de la tarjeta. */
  subscribe?: boolean;
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
        "Una aventura móvil colorida y adictiva en la que la estrategia y la diversión suben de nivel. Prepárate para desafiar torres, recolectar personajes únicos y disfrutar de partidas pensadas para sacar tu mejor jugada en cualquier momento.",
      status: "coming_soon",
      statusLabel: "Próximamente en Android",
      subscribe: true,
      // image y links se añadirán cuando el proyecto tenga material publicable.
    },
    {
      id: "placeholder-project",
      title: "Próximo proyecto",
      description:
        "Placeholder para probar el scroll horizontal y el indicador de progreso. Pronto anunciaremos un nuevo juego aquí.",
      status: "in_development",
      statusLabel: "En desarrollo",
      // subscribe omitido — sin formulario de suscripción en esta tarjeta.
    },
  ],
};
