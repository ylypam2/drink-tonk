const LONGITUD_MAXIMA_URL = 2048;

/**
 * Valida un enlace de imagen proporcionado por un administrador.
 * Devuelve la URL normalizada (trim) o null si el campo viene vacío.
 * Lanza Error si el valor no es una URL http(s) absoluta válida.
 *
 * Política de hosts: se acepta cualquier host http(s) porque solo un
 * ADMIN puede definir el enlace y la imagen se renderiza con <img>
 * (el navegador no ejecuta el recurso como código de la app).
 * Si en el futuro se adopta next/image, este punto debe revisarse
 * junto con images.remotePatterns.
 */
export function validarUrlImagen(
  valor: string | null | undefined
): string | null {
  if (valor === null || valor === undefined) return null;

  const url = valor.trim();
  if (url === "") return null;

  if (url.length > LONGITUD_MAXIMA_URL) {
    throw new Error(
      "El enlace de imagen excede la longitud máxima permitida (2048 caracteres)."
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    throw new Error(
      "El enlace de imagen debe ser una URL absoluta válida (http o https)."
    );
  }

  if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
    throw new Error(
      "El enlace de imagen solo puede usar los protocolos http o https."
    );
  }

  if (parsed.username !== "" || parsed.password !== "") {
    throw new Error("El enlace de imagen no puede contener credenciales.");
  }

  return url;
}
