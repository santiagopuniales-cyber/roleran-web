// Datos estructurados para Google. El contenido se serializa escapando «<» para que no pueda cerrar el script.
export function JsonLd({ datos }: { datos: object }) {
  return (
    <script
      type="application/ld+json"
       
      dangerouslySetInnerHTML={{ __html: JSON.stringify(datos).replace(/</g, "\\u003c") }}
    />
  );
}
