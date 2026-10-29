"""Achica la fuente Archivo (variable, licencia OFL) para la web.

Parte del archivo latino que sirve Google Fonts (data/raw/marca/archivo-latin-variable.woff2, ~90 KB) y:
  1. limita los ejes a lo que usa el sitio: peso 400 a 700 y ancho 72 % a 100 %;
  2. deja solo los caracteres del español y los signos que aparecen en la web.
Resultado: src/fuentes/archivo-roleran.woff2, que carga next/font/local.

Uso:  python scripts/marca/fuente.py      (requiere: pip install fonttools brotli)
"""
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools import subset

ORIGEN = "data/raw/marca/archivo-latin-variable.woff2"
DESTINO = "src/fuentes/archivo-roleran.woff2"

fuente = TTFont(ORIGEN)
fuente = instantiateVariableFont(fuente, {"wght": (400, 700), "wdth": (72, 100)})

caracteres = (
    [range(0x20, 0x7F)]  # ASCII
    + [range(0xA0, 0x100)]  # Latin-1: tildes, ñ, ¿, ¡, «, », º, ½, ×
    + [[0x2003, 0x2009, 0x2013, 0x2014, 0x2018, 0x2019, 0x201C, 0x201D, 0x2022, 0x2026, 0x2192, 0x20AC, 0x2212]]
)
opciones = subset.Options()
opciones.flavor = "woff2"
opciones.layout_features = ["kern", "liga", "calt", "tnum", "lnum", "case", "ccmp", "locl", "mark", "mkmk"]
opciones.name_IDs = ["*"]
opciones.notdef_outline = True
opciones.hinting = False
sub = subset.Subsetter(opciones)
sub.populate(unicodes=[c for r in caracteres for c in r])
sub.subset(fuente)
fuente.flavor = "woff2"
fuente.save(DESTINO)
print(DESTINO)
