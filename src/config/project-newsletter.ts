/**
 * Configuración del frontend para el formulario de suscripción a
 * novedades de proyectos / juegos.
 *
 * Este formulario está preparado para usar un endpoint y una lista de
 * Brevo DIFERENTES a los de la newsletter general del estudio. Por ahora
 * el endpoint es un placeholder; el componente muestra un mensaje de
 * "Próximamente" hasta que se configure el backend real.
 *
 * @module project-newsletter
 */

export interface ProjectNewsletterConfig {
  /** URL del endpoint que procesará las suscripciones (placeholder). */
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
    /** Mensaje mostrado mientras el backend no está configurado. */
    comingSoon: string;
  };
}

export const projectNewsletterConfig: ProjectNewsletterConfig = {
  endpoint: "#", // TODO: configurar endpoint real del Worker con otra lista de Brevo.
  messages: {
    success: "¡Suscripción confirmada! Revisa tu correo.",
    alreadySubscribed: "Ya estás suscrito. ¡Gracias!",
    error: "Error. Intenta de nuevo más tarde.",
    invalidEmail: "Introduce un email válido.",
    loading: "Suscribiendo...",
    comingSoon: "Próximamente. ¡Gracias por tu interés!",
  },
};
