/**
 * Validación y tipado seguro de las variables de entorno.
 *
 * @module env
 */

import type { NewsletterEnv } from "./types";

/**
 * Valida y devuelve las variables de entorno tipadas como {@link NewsletterEnv}.
 *
 * - `BREVO_API_KEY` y `BREVO_LIST_ID` son obligatorias.
 * - `ALLOWED_ORIGINS` es opcional; por defecto se usa `"https://toonzgamers.com"`.
 *
 * @param env - Objeto crudo de variables de entorno (`Record<string, string | undefined>`).
 * @returns Un objeto {@link NewsletterEnv} con todos los campos poblados.
 * @throws {Error} Si falta `BREVO_API_KEY` o `BREVO_LIST_ID`.
 */
export function getEnv(
  env: Record<string, string | undefined>,
): NewsletterEnv {
  const apiKey = env.BREVO_API_KEY;
  const listId = env.BREVO_LIST_ID;

  if (!apiKey || apiKey.trim() === "") {
    throw new Error(
      "Falta la variable de entorno BREVO_API_KEY. "
      + "Configúrala con: wrangler secret put BREVO_API_KEY",
    );
  }

  if (!listId || listId.trim() === "") {
    throw new Error(
      "Falta la variable de entorno BREVO_LIST_ID. "
      + "Configúrala con: wrangler secret put BREVO_LIST_ID",
    );
  }

  return {
    BREVO_API_KEY: apiKey.trim(),
    BREVO_LIST_ID: listId.trim(),
    ALLOWED_ORIGINS:
      env.ALLOWED_ORIGINS?.trim() || "https://toonzgamers.com",
  };
}
