"use client";
// Avisos para lectores de pantalla (región aria-live única, montada en el layout).
export function anunciar(texto: string) {
  const region = document.getElementById("anuncios");
  if (!region) return;
  region.textContent = "";
  window.setTimeout(() => {
    region.textContent = texto;
  }, 30);
}
