"use client";
// Copia texto al portapapeles. Muchos navegadores de celular (los que abren WhatsApp, Instagram o Facebook por dentro,
// y Android viejos) no tienen navigator.clipboard o lo rechazan: ahí se usa el método clásico con un textarea.
export async function copiarTexto(texto: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText && window.isSecureContext) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch {
    // sigue con el método clásico
  }
  return copiarClasico(texto);
}

function copiarClasico(texto: string): boolean {
  const area = document.createElement("textarea");
  area.value = texto;
  area.setAttribute("aria-hidden", "true");
  // 16 px para que iOS no haga zoom; fuera de la pantalla pero seleccionable.
  area.style.cssText = "position:fixed;top:0;left:-9999px;font-size:16px;opacity:0";
  document.body.appendChild(area);
  try {
    area.focus();
    area.select();
    area.setSelectionRange(0, texto.length);
    return document.execCommand("copy");
  } catch {
    return false;
  } finally {
    area.remove();
  }
}
