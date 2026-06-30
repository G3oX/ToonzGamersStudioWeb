/**
 * Configuración del frontend para el formulario de suscripción a la newsletter.
 *
 * Fuente única de verdad para textos, endpoints y mensajes de la
 * sección de newsletter. Los valores se serializan en el marcado
 * del componente NewsletterForm para uso en el lado del cliente
 * sin necesidad de módulos JS adicionales.
 *
 * El endpoint ahora apunta a un Worker independiente (cross-origin)
 * desplegado en Cloudflare Workers. El formulario envía peticiones
 * CORS a `https://webnewsletter.toonzgamersstudio.workers.dev`.
 *
 * @module newsletter
 */

export interface NewsletterConfig {
  /** URL del endpoint que procesa las suscripciones (POST, cross-origin) */
  endpoint: string;
  /** Mapas de mensajes mostrados al usuario según el estado */
  messages: {
    /** Suscripción exitosa */
    success: string;
    /** El email ya estaba registrado */
    alreadySubscribed: string;
    /** Error genérico del servidor o de red */
    error: string;
    /** Validación cliente: email con formato incorrecto */
    invalidEmail: string;
    /** Texto mostrado mientras se envía la solicitud */
    loading: string;
  };
}

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
