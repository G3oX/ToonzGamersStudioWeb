/**
 * Handler principal del Cloudflare Worker para el sistema de newsletter.
 *
 * Gestiona CORS, validación de entrada, honeypot anti-bot,
 * sanitización y delegación al servicio de newsletter.
 *
 * @module index
 */

import { getEnv } from "./env";
import { getCorsHeaders, isAllowedOrigin, isHoneypotTriggered, sanitizeEmail } from "./security";
import { jsonError, jsonSilentSuccess, noContent, preflightResponse } from "./responses";
import { BrevoProvider } from "./brevo-provider";
import { NewsletterService } from "./newsletter-service";

/**
 * Módulo principal del Worker.
 *
 * @example
 * ```toml
 * # wrangler.toml
 * name = "webnewsletter"
 * main = "src/index.ts"
 * ```
 */
export default {
  async fetch(request: Request, env: Record<string, string>): Promise<Response> {
    // 1. Validar entorno
    let config;
    try {
      config = getEnv(env);
    } catch {
      return jsonError(500, "Error. Intenta de nuevo más tarde.", {});
    }

    // 2. Obtener origen para CORS
    const origin = request.headers.get("Origin");

    // 3. Calcular headers CORS
    const corsHeaders = getCorsHeaders(origin, config.ALLOWED_ORIGINS);

    // 4. Preflight CORS (OPTIONS)
    if (request.method === "OPTIONS") {
      return preflightResponse(corsHeaders);
    }

    // 5. Solo POST
    if (request.method !== "POST") {
      return jsonError(405, "Método no permitido.", corsHeaders);
    }

    // 6. Validar Content-Type
    const contentType = request.headers.get("Content-Type") || "";
    const mediaType = contentType.split(";")[0].trim();
    if (mediaType !== "application/json") {
      return noContent(415, corsHeaders);
    }

    // 7. Limitar tamaño del cuerpo
    const contentLengthStr = request.headers.get("Content-Length");
    if (contentLengthStr) {
      const contentLength = parseInt(contentLengthStr, 10);
      if (!isNaN(contentLength) && contentLength > 1024) {
        return jsonError(413, "Solicitud demasiado grande.", corsHeaders);
      }
    }

    // 8. Validar origen CORS
    if (!isAllowedOrigin(origin, config.ALLOWED_ORIGINS)) {
      return jsonError(403, "Error. Intenta de nuevo más tarde.", corsHeaders);
    }

    // 9. Parsear body JSON
    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonError(400, "Solicitud no válida.", corsHeaders);
    }
    if (typeof body !== "object" || body === null) {
      return jsonError(400, "Solicitud no válida.", corsHeaders);
    }

    // 10. Honeypot anti-bot
    if (isHoneypotTriggered(body)) {
      console.warn("[newsletter] Honeypot triggered");
      return jsonSilentSuccess(corsHeaders);
    }

    // 11. Sanitizar email
    const email = sanitizeEmail(body.email);
    if (email === null) {
      return jsonError(400, "Email no válido.", corsHeaders);
    }

    // 12. Procesar suscripción
    try {
      const listId = parseInt(config.BREVO_LIST_ID, 10);
      if (isNaN(listId)) {
        console.error("[newsletter] BREVO_LIST_ID no es un número válido");
        return jsonError(500, "Error. Intenta de nuevo más tarde.", corsHeaders);
      }

      const provider = new BrevoProvider(config.BREVO_API_KEY, listId);
      const service = new NewsletterService(provider);
      const result = await service.subscribe(email);

      // Log seguro: solo el dominio, no el email completo
      const domain = email.split("@")[1] || "desconocido";
      console.log(`[newsletter] Subscribed: ${domain}`);

      return new Response(
        JSON.stringify({
          success: true,
          alreadySubscribed: result.alreadySubscribed,
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json; charset=utf-8",
            ...corsHeaders,
          },
        },
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error desconocido";
      console.error(`[newsletter] Error: ${message}`);
      return jsonError(500, "Error. Intenta de nuevo más tarde.", corsHeaders);
    }
  },
};
