/**
 * Funciones de seguridad: CORS, honeypot, sanitización de email.
 *
 * @module security
 */

/**
 * Determina si un origen HTTP está permitido según la lista configurada.
 *
 * - Si `origin` es `null` se acepta como válido (navegadores en same-origin
 *   pueden omitir el header `Origin`; no queremos bloquear peticiones legítimas).
 * - Si `origin` está presente, debe coincidir exactamente con uno de los
 *   orígenes en `allowedOrigins` (separados por coma).
 *
 * @param origin       - Valor del header `Origin` (o `null` si no se envió).
 * @param allowedOrigins - Lista separada por comas de orígenes permitidos.
 * @returns `true` si el origen está permitido (o es `null`).
 */
export function isAllowedOrigin(
  origin: string | null,
  allowedOrigins: string,
): boolean {
  if (origin === null) {
    return true;
  }

  return allowedOrigins
    .split(",")
    .map((o) => o.trim())
    .some((allowed) => allowed === origin);
}

/**
 * Detecta si el honeypot anti-bot fue activado.
 *
 * El formulario debe incluir un campo oculto `website` que los bots
 * suelen rellenar. Si contiene un valor no vacío, se considera ataque.
 *
 * @param body - Cuerpo parseado de la petición.
 * @returns `true` si el honeypot se disparó.
 */
export function isHoneypotTriggered(
  body: Record<string, unknown>,
): boolean {
  const website = body.website;
  return typeof website === "string" && website.trim().length > 0;
}

/**
 * Sanitiza y valida una dirección de email.
 *
 * - Convierte a minúsculas.
 * - Elimina espacios al inicio y final.
 * - Valida formato con regex básico.
 * - Rechaza emails de más de 254 caracteres.
 *
 * @param email - Valor crudo del email (puede ser cualquier tipo).
 * @returns El email sanitizado, o `null` si no es válido.
 */
export function sanitizeEmail(email: unknown): string | null {
  if (typeof email !== "string") {
    return null;
  }

  const sanitized = email.trim().toLowerCase();

  if (sanitized.length === 0 || sanitized.length > 254) {
    return null;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(sanitized)) {
    return null;
  }

  return sanitized;
}

/**
 * Devuelve los encabezados CORS apropiados para una respuesta HTTP.
 *
 * Si el origen está permitido, se incluyen:
 * - `Access-Control-Allow-Origin` con el valor exacto del origen.
 * - `Access-Control-Allow-Methods: POST, OPTIONS`
 * - `Access-Control-Allow-Headers: Content-Type`
 * - `Access-Control-Max-Age: 86400`
 * - `Vary: Origin`
 *
 * Si el origen no está permitido o es `null`, se devuelve un objeto vacío
 * (sin headers CORS, el navegador bloqueará la respuesta).
 *
 * @param origin        - Valor del header `Origin` (o `null`).
 * @param allowedOrigins - Lista separada por comas de orígenes permitidos.
 * @returns Objeto con los encabezados CORS.
 */
export function getCorsHeaders(
  origin: string | null,
  allowedOrigins: string,
): Record<string, string> {
  if (origin === null || !isAllowedOrigin(origin, allowedOrigins)) {
    return {};
  }

  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}
