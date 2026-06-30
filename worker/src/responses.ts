/**
 * Helpers para construir respuestas HTTP con soporte CORS.
 *
 * Todos los mensajes de error son genéricos para no filtrar información interna.
 *
 * @module responses
 */

/**
 * Respuesta 200 OK con mensaje de éxito.
 *
 * @param message     - Mensaje legible para el usuario.
 * @param corsHeaders - Encabezados CORS calculados para la respuesta.
 * @returns Respuesta HTTP JSON.
 */
export function jsonSuccess(
  message: string,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ success: true, message }),
    {
      status: 200,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders,
      },
    },
  );
}

/**
 * Respuesta de error en JSON con el código de estado indicado.
 *
 * @param status      - Código de estado HTTP (4xx o 5xx).
 * @param message     - Mensaje legible para el usuario.
 * @param corsHeaders - Encabezados CORS calculados para la respuesta.
 * @returns Respuesta HTTP JSON.
 */
export function jsonError(
  status: number,
  message: string,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(
    JSON.stringify({ success: false, message }),
    {
      status,
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        ...corsHeaders,
      },
    },
  );
}

/**
 * Respuesta 200 con mensaje de éxito genérico, útil cuando se quiere
 * responder igual ante un éxito real y un honeypot (para no alertar bots).
 *
 * @param corsHeaders - Encabezados CORS calculados para la respuesta.
 * @returns Respuesta HTTP JSON.
 */
export function jsonSilentSuccess(
  corsHeaders: Record<string, string>,
): Response {
  return jsonSuccess("¡Suscripción confirmada!", corsHeaders);
}

/**
 * Respuesta sin cuerpo pero con los encabezados CORS.
 * Útil para errores donde no se debe devolver JSON (ej. 415 Unsupported Media Type).
 *
 * @param status      - Código de estado HTTP.
 * @param corsHeaders - Encabezados CORS calculados para la respuesta.
 * @returns Respuesta HTTP sin cuerpo.
 */
export function noContent(
  status: number,
  corsHeaders: Record<string, string>,
): Response {
  return new Response(null, {
    status,
    headers: {
      ...corsHeaders,
    },
  });
}

/**
 * Respuesta 204 No Content para peticiones OPTIONS (preflight CORS).
 *
 * @param corsHeaders - Encabezados CORS calculados para la respuesta.
 * @returns Respuesta HTTP 204.
 */
export function preflightResponse(
  corsHeaders: Record<string, string>,
): Response {
  return new Response(null, {
    status: 204,
    headers: {
      ...corsHeaders,
    },
  });
}
