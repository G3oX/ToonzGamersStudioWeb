# Sistema de Newsletter

Documentacion tecnica del sistema de suscripcion a la newsletter de
**ToonzGamers Studio Web**.

---

## 1. Vision general

El sistema de newsletter permite a los visitantes del sitio suscribirse a una
lista de correo. Esta implementado como un **Cloudflare Worker independiente**
que actua como un proxy ligero entre el formulario del frontend y la **API v3 de
Brevo** (anteriormente Sendinblue).

A diferencia de la arquitectura anterior (Pages Functions), el Worker es un
proyecto separado dentro del repositorio (`worker/`) con su propio
`package.json`, `wrangler.toml` y `tsconfig.json`. La web Astro (estatica,
desplegada en Cloudflare Pages en `https://toonzgamers.com`) realiza peticiones
cross-origin al Worker (`https://webnewsletter.toonzgamersstudio.workers.dev`).

```
+---------------------+     POST (cross-origin)    +---------------------------+
|                     | --------------------------> |                           |
| Web Astro (estatica)|                             | Cloudflare Worker         |
| toonzgamers.com     | <-------------------------- | webnewsletter             |
|                     |     JSON response + CORS    | *.workers.dev             |
+---------------------+                             +----------+----------------+
                                                                 |
                                                        POST api.brevo.com/v3/contacts
                                                                 |
                                                        +--------v----------------+
                                                        |                         |
                                                        | Brevo API               |
                                                        | (lista de correo)       |
                                                        |                         |
                                                        +-------------------------+
```

### Por que Worker independiente (no Pages Functions)

- **Despliegues independientes**: la web y el backend se despliegan por
  separado. Puedes actualizar el Worker sin redeployar la web y viceversa.
- **Proyectos separados**: el Worker tiene sus propias dependencias y
  configuracion. No se mezcla con el stack de Astro.
- **Sin CORS complicado en desarrollo**: al ser cross-origin, el Worker maneja
  CORS explicitamente, lo que permite probar localmente la web contra un Worker
  local sin conflictos.
- **Misma simplicidad**: sigue siendo serverless sin gestionar infraestructura.

---

## 2. Configuracion en Brevo

Brevo es el proveedor de envio de correos electronicos. Para conectar el
sistema necesitas dos valores: una **API key** y un **List ID**.

### Obtener la API key

1. Inicia sesion en [Brevo](https://www.brevo.com).
2. Ve a tu panel de administracion.
3. Busca la seccion de **API Keys** (normalmente en SMTP & API > API Keys).
4. Crea una nueva clave de API v3 (o copia una existente).
5. Guardala de forma segura. No la compartas ni la subas al repositorio.

### Obtener el List ID

1. En el panel de Brevo, ve a **Contacts** > **Lists**.
2. Crea una nueva lista o selecciona una existente.
3. Copia el **ID numerico** de la lista (aparece en la URL o en los detalles
   de la lista).

---

## 3. Configuracion del Worker en Cloudflare

El Worker ya existe en Cloudflare con el nombre `webnewsletter`. Las variables
de entorno se dividen en dos categorias: **secretos** y **variables publicas**.

### Secretos (wrangler secret)

Se configuran con la CLI de wrangler o desde el dashboard de Cloudflare:

| Variable          | Valor                            |
|-------------------|----------------------------------|
| `BREVO_API_KEY`   | Tu API key de Brevo v3           |
| `BREVO_LIST_ID`   | ID numerico de la lista de Brevo |

### Variable publica (wrangler.toml `[vars]`)

Se define en `worker/wrangler.toml` y es visible en el dashboard:

| Variable           | Valor por defecto                     |
|--------------------|---------------------------------------|
| `ALLOWED_ORIGINS`  | `https://toonzgamers.com`             |

`ALLOWED_ORIGINS` es una lista separada por comas de origenes HTTP permitidos
para CORS. Si necesitas permitir varios origenes (ej. durante desarrollo
local), anade mas separados por coma.

> **IMPORTANTE**: NUNCA commitees `BREVO_API_KEY` ni `BREVO_LIST_ID` al
> repositorio. No uses archivos `.env` en el proyecto. Los secretos se
> gestionan exclusivamente con `wrangler secret put` o el dashboard de
> Cloudflare.

---

## 4. Despliegue del Worker

### Requisitos

- Node.js >= 22.12.0
- Una cuenta de Cloudflare con Workers habilitado
- Autenticacion de wrangler (`npx wrangler login` o token de API)

### Desplegar

```bash
cd worker/
npm install
npm run deploy
```

Esto ejecuta `npx wrangler deploy` y despliega el Worker en
`https://webnewsletter.toonzgamersstudio.workers.dev`.

### Configurar secretos

La primera vez (o cuando cambien las claves), configura los secretos:

```bash
cd worker/
npx wrangler secret put BREVO_API_KEY
npx wrangler secret put BREVO_LIST_ID
```

Cada comando pedira el valor interactivamente. Una vez configurados, los
secretos estan disponibles como variables de entorno en el Worker sin
necesidad de redeploy.

### Verificar el despliegue

```bash
curl -X POST https://webnewsletter.toonzgamersstudio.workers.dev/api/newsletter \
  -H "Content-Type: application/json" \
  -H "Origin: https://toonzgamers.com" \
  -d '{"email":"test@example.com","website":""}'
```

Si todo funciona correctamente, recibiras una respuesta 200 con
`{"success":true,"message":"..."}`.

---

## 5. Configuracion de WAF Rate Limiting

### Limitacion en workers.dev

Las peticiones al Worker se envian a `*.workers.dev`, un subdominio de
Cloudflare que **no dispone de WAF gestionado**. Las reglas de rate limiting
del WAF de Cloudflare solo pueden configurarse en dominios custom asociados a
una zona de Cloudflare. Por tanto, no es posible aplicar WAF Rate Limiting
directamente sobre el Worker desde el dashboard.

### Limitacion en el dominio de la web

Aunque la web (`toonzgamers.com`) tiene WAF configurable, las peticiones de la
newsletter van al Worker (dominio distinto), por lo que el WAF del dominio de
la web **no las intercepta**.

### Que proteccion tenemos entonces

- **Honeypot**: campo oculto que los bots rellenan. Se detecta y se responde
  con un falso exito sin procesar la suscripcion.
- **Validacion de Origin**: el Worker solo procesa peticiones cuyo header
  `Origin` coincida con los origenes autorizados.
- **Limite de payload**: el Worker rechaza cuerpos de mas de 1024 bytes (413).
- **Rate limiting natural de Brevo**: la propia API de Brevo tiene sus propios
  limites de peticiones.

Para un sitio indie, estas medidas son suficientes. Si el trafico crece y se
necesita un rate limiting por IP, consulta la seccion "Futuras mejoras".

---

## 6. Desarrollo local

### Iniciar la web Astro

```bash
astro dev
```

La web se levanta en `http://localhost:4321` (o el puerto que tengas
configurado).

### Iniciar el Worker local

```bash
cd worker/
npx wrangler dev
```

El Worker se levanta en `http://localhost:8788`.

### Configurar variables locales

Crea un archivo `worker/.dev.vars` (NO lo commitees) con las variables
necesarias:

```
BREVO_API_KEY=xkeysib-tu-api-key-de-brevo
BREVO_LIST_ID=42
ALLOWED_ORIGINS=http://localhost:4321
```

`ALLOWED_ORIGINS` debe incluir el origen de la web local para que CORS
funcione.

### Probar la web contra el Worker local

Cambia temporalmente `endpoint` en `src/config/newsletter.ts` a
`http://localhost:8788/api/newsletter` y recarga la web. No olvides revertir
este cambio antes de desplegar.

O prueba directamente el endpoint con curl:

```bash
curl -X POST http://localhost:8788/api/newsletter \
  -H "Content-Type: application/json" \
  -H "Origin: http://localhost:4321" \
  -d '{"email":"test@example.com","website":""}'
```

Debes recibir una respuesta 200 con `{"success":true,"message":"..."}`.

> Nota: si no configuras `ALLOWED_ORIGINS` correctamente, el Worker devolvera
> headers CORS vacios y el navegador bloqueara la respuesta.

---

## 7. Cambiar de proveedor en el futuro

El sistema esta disenado con una abstraccion `NewsletterProvider` para
permitir cambiar de proveedor sin modificar la logica de negocio.

### Interfaz a implementar

```typescript
interface NewsletterProvider {
  subscribe(email: string): Promise<SubscribeResult>;
}
```

### Pasos para anadir un nuevo proveedor

1. Crea `worker/src/x-provider.ts` (donde `x` es el nombre del proveedor,
   ej. `mailchimp`, `sendgrid`).
2. Implementa la interfaz `NewsletterProvider` con la logica de llamada a la
   API del nuevo proveedor.
3. En `worker/src/index.ts`, cambia la linea:

   ```typescript
   const provider = new BrevoProvider(config.BREVO_API_KEY, listId);
   ```

   por la instancia del nuevo proveedor (con las variables de entorno que
   necesite).
4. No es necesario modificar `NewsletterService`, `security.ts`,
   `responses.ts` ni ningun otro archivo.

---

## 8. Estructura de archivos

**Web Astro:**

```
src/
  components/
    NewsletterForm.astro      # Formulario reutilizable con progressive enhancement
  config/
    newsletter.ts             # Configuracion publica del frontend (endpoint URL,
                              # mensajes de exito/error, textos del formulario)
```

**Worker (proyecto independiente en `worker/`):**

```
worker/
  src/
    index.ts                  # Handler principal (fetch + CORS + validaciones)
    types.ts                  # Tipos compartidos: NewsletterEnv,
                              # NewsletterProvider, SubscribeResult
    env.ts                    # Validacion tipada de variables de entorno
    security.ts               # CORS dinamico, honeypot, sanitizacion de email
    responses.ts              # Helpers de respuestas HTTP con CORS headers
    brevo-provider.ts         # Integracion con API v3 de Brevo
    newsletter-service.ts     # Capa de abstraccion del proveedor

  wrangler.toml               # Configuracion de despliegue de Cloudflare Workers
  package.json                # Dependencias del Worker (wrangler, workers-types, TS)
  tsconfig.json               # TypeScript config del Worker
```

---

## 9. Seguridad

### CORS dinamico

El Worker calcula los headers CORS en funcion del header `Origin` de la
peticion. Si el origen coincide con la lista de `ALLOWED_ORIGINS`, se incluyen
los headers necesarios. En caso contrario, se devuelven headers CORS vacios y
el navegador bloquea la respuesta.

La respuesta OPTIONS (preflight) tambien incluye los headers CORS correctos.

### Honeypot antispam

El formulario incluye un campo oculto `website` invisible para humanos. Los
bots tienden a rellenarlo. Si el backend detecta que `website` tiene
contenido, responde con un falso exito (200) pero no procesa la suscripcion ni
almacena ningun dato.

### Validacion de Origin

El Worker solo acepta peticiones cuyo header `Origin` este en la lista de
origenes autorizados (`ALLOWED_ORIGINS`). Si el origen no esta autorizado,
devuelve 403. Si el header `Origin` esta ausente (`null`), se acepta la
peticion (navegadores en same-origin a veces omiten el header).

### Sanitizacion de email

El email recibido se normaliza (trim, lowercase) y se valida con una
expresion regular basica. Si no es un string valido, supera los 254 caracteres
o no cumple el formato, se devuelve un error 400.

### Sin claves en el frontend

Las claves secretas (`BREVO_API_KEY`, `BREVO_LIST_ID`) nunca llegan al
frontend. Solo existen como secretos en el Worker de Cloudflare.

### Limite de payload

El Worker rechaza peticiones con cuerpo superior a 1024 bytes (codigo 413).

### Logging seguro

Que se loggea:

- El **dominio** del email (la parte despues de `@`), nunca el email completo.
- Los **codigos de estado** de las respuestas de Brevo.
- Mensajes de advertencia si se activa el honeypot.

Que NO se loggea:

- API keys.
- Emails completos de los usuarios.
- Cuerpos de respuesta de la API de Brevo.
- Mensajes de error internos (se capturan y se muestra un mensaje generico al
  usuario).

### Timeout en llamadas a Brevo

El Worker usa `AbortSignal.timeout(8000)` para las peticiones a la API de
Brevo. Si la API no responde en 8 segundos, se lanza un error de timeout y se
devuelve un error 500 generico al usuario.

---

## 10. Respuestas HTTP del endpoint

| Status | Cuando                                      | Body                                                         |
|--------|---------------------------------------------|--------------------------------------------------------------|
| 200    | Suscripcion exitosa (nuevo contacto)        | `{ "success": true, "message": "¡Suscripción confirmada! Revisa tu correo." }` |
| 200    | El email ya estaba suscrito                 | `{ "success": true, "message": "¡Suscripción confirmada! Revisa tu correo." }` |
| 200    | Honeypot activado (falso exito)             | `{ "success": true, "message": "¡Suscripción confirmada!" }` |
| 204    | Preflight CORS (OPTIONS)                    | Sin cuerpo                                                   |
| 400    | Body JSON invalido                          | `{ "success": false, "message": "Solicitud no válida." }`   |
| 400    | Email no valido o ausente                   | `{ "success": false, "message": "Email no válido." }`       |
| 403    | Origin no autorizado                        | `{ "success": false, "message": "Error. Intenta de nuevo más tarde." }` |
| 405    | Metodo HTTP no permitido (ni POST ni OPTIONS) | `{ "success": false, "message": "Método no permitido." }`   |
| 413    | Cuerpo de la solicitud demasiado grande      | `{ "success": false, "message": "Solicitud demasiado grande." }` |
| 415    | Content-Type no es application/json          | Sin cuerpo                                                   |
| 500    | Error de entorno (variable faltante)        | `{ "success": false, "message": "Error. Intenta de nuevo más tarde." }` |
| 500    | Error de Brevo (red, API, timeout, etc.)    | `{ "success": false, "message": "Error. Intenta de nuevo más tarde." }` |

> Nota: Los mensajes de error 403, 405, 413 y 500 son deliberadamente
> genericos para no filtrar informacion interna al usuario. Los detalles
> tecnicos se registran en los logs del Worker.
>
> Todas las respuestas incluyen headers CORS cuando el origen de la peticion
> esta autorizado.

---

## 11. Futuras mejoras (opcional)

### Rate limiting por IP con Cloudflare KV

Si el trafico crece y se necesita un rate limiting mas estricto, se puede
anadir un contador de peticiones por IP usando Cloudflare KV. El Worker
incrementaria un contador por IP en cada peticion y rechazaria aquellas que
superen un umbral en un periodo de tiempo.

Pasos aproximados:

1. Crear un namespace KV en el dashboard de Cloudflare.
2. Anadirlo al `wrangler.toml` como binding.
3. En `worker/src/index.ts`, antes de procesar la peticion, consultar el KV
   para verificar el rate de la IP.

### Cloudflare Turnstile

Si se necesita un filtrado de bots mas agresivo, se puede integrar Cloudflare
Turnstile (captcha invisible) en el formulario del frontend y validar el token
en el Worker antes de procesar la suscripcion.

