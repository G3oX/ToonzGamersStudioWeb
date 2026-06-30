/**
 * Tipos compartidos para el Worker de newsletter.
 *
 * @module types
 */

/** Variables de entorno esperadas por el Worker. */
export interface NewsletterEnv {
  /** Clave API de Brevo (v3). Obligatoria. */
  BREVO_API_KEY: string;
  /** ID numérico de la lista de Brevo donde se añadirán los contactos. Obligatorio. */
  BREVO_LIST_ID: string;
  /** Lista de orígenes permitidos para CORS, separada por comas.
   *  Si no se define, se usa "https://toonzgamers.com". */
  ALLOWED_ORIGINS: string;
}

/** Resultado de una suscripción procesada por el proveedor. */
export interface SubscribeResult {
  /** true si la suscripción se completó con éxito. */
  success: boolean;
  /** true si el contacto ya existía en la lista (suscripción duplicada). */
  alreadySubscribed: boolean;
}

/**
 * Interfaz abstracta para un proveedor de newsletter.
 * Permite cambiar de proveedor sin modificar la lógica del servicio.
 */
export interface NewsletterProvider {
  /**
   * Suscribe una dirección de correo electrónico a la lista.
   *
   * @param email - Dirección de email ya sanitizada.
   * @returns Promesa con el resultado de la suscripción.
   */
  subscribe(email: string): Promise<SubscribeResult>;
}
