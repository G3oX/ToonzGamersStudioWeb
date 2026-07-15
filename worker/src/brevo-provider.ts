/**
 * Implementación del proveedor de newsletter usando la API v3 de Brevo.
 *
 * @module brevo-provider
 */

import type { NewsletterProvider, SubscribeResult } from "./types";

const BREVO_API_BASE = "https://api.brevo.com/v3";
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Proveedor de newsletter que utiliza la API v3 de Brevo (anteriormente Sendinblue).
 *
 * Los errores de red y tiempo de espera se capturan internamente y se
 * relanzan como `Error` con mensajes genéricos. **Nunca se propagan
 * detalles internos al frontend.**
 */
export class BrevoProvider implements NewsletterProvider {
  private apiKey: string;
  private listId: number;

  /**
   * @param apiKey - Clave de la API v3 de Brevo.
   * @param listId - ID numérico de la lista de contactos.
   */
  constructor(apiKey: string, listId: number) {
    this.apiKey = apiKey;
    this.listId = listId;
  }

  /**
   * Suscribe un email a la lista de Brevo.
   *
   * Realiza un POST a `/v3/contacts` con `updateEnabled: true`, lo que
   * permite actualizar contactos existentes sin error.
   *
   * @param email - Dirección de email sanitizada.
   * @returns Resultado de la suscripción.
   * @throws {Error} Si la API responde con un código inesperado, hay
   *                 error de red, o se supera el tiempo de espera.
   */
  async subscribe(email: string): Promise<SubscribeResult> {
    const contactsUrl = `${BREVO_API_BASE}/contacts`;
    const body = JSON.stringify({
      email,
      listIds: [this.listId],
      updateEnabled: true,
    });

    try {
      // 1. Comprobar si el contacto ya existe y ya está en la lista
      try {
        const checkUrl = `${BREVO_API_BASE}/contacts/${encodeURIComponent(email)}`;
        const checkRes = await fetch(checkUrl, {
          method: "GET",
          headers: {
            "api-key": this.apiKey,
            "Accept": "application/json",
          },
          signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
        });

        if (checkRes.ok) {
          const contact = await checkRes.json() as { listIds?: number[] };
          if (Array.isArray(contact.listIds) && contact.listIds.includes(this.listId)) {
            return { success: true, alreadySubscribed: true };
          }
        }
        // 404 (contacto no existe) → se crea abajo. Otros errores → se ignoran y se intenta crear igual.
      } catch {
        // Error de red al comprobar → se intenta crear igual
      }

      // 2. Crear o actualizar el contacto.
      //    El GET anterior ya descartó que el contacto esté en la lista,
      //    así que cualquier respuesta exitosa del POST significa
      //    suscripción nueva (no "already subscribed").
      const response = await fetch(contactsUrl, {
        method: "POST",
        headers: {
          "api-key": this.apiKey,
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body,
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (response.ok) {
        return { success: true, alreadySubscribed: false };
      }

      // Error inesperado de la API
      const errorBody = await response.text().catch(() => "(sin cuerpo)");
      console.error(
        `[brevo-provider] Error inesperado: status=${response.status}, body=${errorBody}`,
      );
      throw new Error("Error al procesar la suscripción.");
    } catch (err) {
      if (err instanceof DOMException && err.name === "TimeoutError") {
        throw new Error("Brevo timeout");
      }
      if (err instanceof TypeError) {
        // Error de red (fetch falló)
        throw new Error("Brevo network error");
      }
      // Relanzar errores que ya son nuestros
      throw err;
    }
  }
}
