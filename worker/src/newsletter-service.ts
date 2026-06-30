/**
 * Capa de abstracción sobre el proveedor de newsletter.
 *
 * Separa la lógica de negocio del proveedor concreto, permitiendo
 * cambiar de proveedor (Brevo, Mailchimp, etc.) sin modificar el handler.
 *
 * @module newsletter-service
 */

import type { NewsletterProvider, SubscribeResult } from "./types";

/**
 * Servicio de newsletter con inyección de dependencias.
 *
 * Actualmente delega directamente en el proveedor, pero puede extenderse
 * en el futuro para añadir logging, métricas, colas de reintentos, etc.
 */
export class NewsletterService {
  private provider: NewsletterProvider;

  /**
   * @param provider - Implementación concreta del proveedor de newsletter.
   */
  constructor(provider: NewsletterProvider) {
    this.provider = provider;
  }

  /**
   * Suscribe un email a la lista de newsletter.
   *
   * @param email - Dirección de email sanitizada y validada.
   * @returns Resultado de la suscripción.
   */
  async subscribe(email: string): Promise<SubscribeResult> {
    return this.provider.subscribe(email);
  }
}
