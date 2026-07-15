/**
 * Configuración del frontend para el formulario de suscripción a
 * novedades de proyectos / juegos.
 *
 * El endpoint apunta al Cloudflare Worker independiente (cross-origin)
 * que procesa las suscripciones contra la API de Brevo. Por ahora usa
 * la misma lista que la newsletter general; en el futuro se puede
 * configurar una lista independiente por proyecto.
 *
 * @module project-newsletter
 */

export interface ProjectNewsletterConfig {
  /** URL del endpoint del Worker que procesa las suscripciones (POST, cross-origin). */
  endpoint: string;
  /** Mapas de mensajes mostrados al usuario según el estado. */
  messages: {
    /** Suscripción exitosa. */
    success: string;
    /** El email ya estaba registrado. */
    alreadySubscribed: string;
    /** Error genérico del servidor o de red. */
    error: string;
    /** Validación cliente: email con formato incorrecto. */
    invalidEmail: string;
    /** Texto mostrado mientras se envía la solicitud. */
    loading: string;
  };
}

export const projectNewsletterConfig: ProjectNewsletterConfig = {
  endpoint: "https://webnewsletter.toonzgamersstudio.workers.dev/api/newsletter",
  messages: {
    success: "¡Solicitud confirmada! Le avisaremos con las novedades.",
    alreadySubscribed: "Ya estás participando. ¡Gracias!",
    error: "Error. Intenta de nuevo más tarde.",
    invalidEmail: "Introduce un email válido.",
    loading: "Enviando...",
  },
};
