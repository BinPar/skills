# OP_GEN — Documento genérico

Template ID canon: `1C17hlxF4Q8MwvUqA3w8JFHGdYXJ6Gh0YHRERWKzIzAs`.

## 1. Propósito

Documento corporativo Sermas de formato libre. Se usa para detalles técnicos/funcionales: JWT, gestión de guías, KPIs, arquitecturas, integraciones, etc. La portada y la Hoja de Control son fijas; **el cuerpo es 100% libre** — el usuario dicta capítulos H1/H2/H3.

## 2. Estructura de la plantilla canon

```
PORTADA (NORMAL_TEXT)
  TÍTULO
  Tipo de documento
  Autor: AUTOR
  Preparado Para: DGSD
  Fecha: DD/MM/AAAA
  Versión: 1.0
  Documento: OP_GEN_Plantilla documento genérico_v1

HOJA DE CONTROL
  Control de cambios (TABLA 4x4: Versión | Fecha versión | Motivo del cambio | Autor)
    Fila inicial: 1.00 | DD/MM/AAAA | Versión Inicial | AUTOR - COMPAÑIA
  Control de Aprobaciones (TABLA 3x4, NO TOCAR)

ÍNDICE (placeholder — el usuario debe refrescarlo a mano al final)

CUERPO DE EJEMPLO (BORRAR)
  HEADING_1: TÍTULO 1
  HEADING_2: TÍTULO 2
  HEADING_3: TÍTULO 3
  HEADING_4: TÍTULO 4
  HEADING_5: TÍTULO 5
  HEADING_6: TÍTULO 6
```

## 3. Requisitos mínimos

| Campo | Default | Notas |
|-------|---------|-------|
| Título | preguntar | va en portada (primer NORMAL_TEXT) |
| Tipo de documento | preguntar | subtítulo bajo el título (ej. "Documento técnico", "Especificación funcional") |
| Autor | cuenta autenticada | reemplaza `AUTOR` |
| Preparado para | `DGSD` | solo cambiarlo si el usuario lo pide |
| Fecha | hoy (`DD/MM/AAAA`) | reemplaza `DD/MM/AAAA` |
| Versión | `1.0` | reemplaza `1.0`; bumpeará desde aquí |
| Nombre archivo Drive | `OP_GEN_{TITULO}_v{VERSION}` | se usa como `name` al copiar |
| Capítulos | lista estructurada H1/H2/H3 + contenido | preguntar si no viene en el prompt |

## 4. Operaciones

### 4.1 Portada — `replaceAllText`

Como la portada tiene strings únicos y predecibles, es seguro usar `replaceAllText`:

```json
{"replaceAllText": {"containsText": {"text": "TÍTULO", "matchCase": true}, "replaceText": "Gestión de tokens JWT"}},
{"replaceAllText": {"containsText": {"text": "Tipo de documento", "matchCase": true}, "replaceText": "Especificación técnica"}},
{"replaceAllText": {"containsText": {"text": "AUTOR", "matchCase": true}, "replaceText": "Alberto Blanco"}},
{"replaceAllText": {"containsText": {"text": "DD/MM/AAAA", "matchCase": false}, "replaceText": "21/04/2026"}},
{"replaceAllText": {"containsText": {"text": "OP_GEN_Plantilla documento genérico_v1", "matchCase": true}, "replaceText": "OP_GEN_Gestion_tokens_JWT_v1.0"}}
```

**Cuidado con `AUTOR`**: aparece también en la tabla de Hoja de Control como `AUTOR - COMPAÑIA`. Si se reemplaza "AUTOR" globalmente, también sustituye en la tabla — normalmente eso es lo deseado (mismo autor), pero si no, usar `replaceAllText` con substring más específico o actuar por índice.

**`DD/MM/AAAA`** también aparece en la Hoja de Control (fila inicial) — se sustituye por la fecha de hoy en ambas ubicaciones, que es lo correcto.

### 4.2 Versión en portada

Para sustituir `Versión: 1.0` → `Versión: 1.0` (igual si versión inicial) o una nueva versión: `replaceAllText` con `"1.0"` es peligroso porque puede coincidir en otros sitios. Mejor **localizar el párrafo por texto** en Step 4 (lectura) y usar `deleteContentRange` + `insertText` sobre el índice exacto.

### 4.3 Borrar el cuerpo de ejemplo

Identificar el índice de `HEADING_1: TÍTULO 1` (primer heading después del "Índice") y el final del documento.

```json
{"deleteContentRange": {"range": {"startIndex": IDX_TITULO_1, "endIndex": IDX_END_OF_BODY}}}
```

No borrar el último `\n` del body (Docs requiere mantenerlo).

### 4.4 Insertar los capítulos del usuario

Desde el índice donde empezaba `TÍTULO 1`, insertar el cuerpo completo en una sola operación `insertText` con `\n` entre párrafos y bloques, y luego aplicar `updateParagraphStyle` a cada rango que corresponda a un heading:

```json
{"insertText": {"location": {"index": IDX_INICIO_CUERPO}, "text": "Capítulo 1\nContenido del capítulo 1...\nSubcapítulo 1.1\nContenido...\n"}}
```

Después, en el mismo batchUpdate, aplicar estilos — **procesar de inicio a fin es válido aquí** porque todo se inserta de una vez y los offsets se calculan desde `IDX_INICIO_CUERPO`:

```json
{"updateParagraphStyle": {
  "range": {"startIndex": IDX_INICIO_CUERPO, "endIndex": IDX_INICIO_CUERPO + LEN("Capítulo 1") + 1},
  "paragraphStyle": {"namedStyleType": "HEADING_1"},
  "fields": "namedStyleType"
}},
{"updateParagraphStyle": {
  "range": {"startIndex": IDX_SUBCAPITULO_START, "endIndex": IDX_SUBCAPITULO_END},
  "paragraphStyle": {"namedStyleType": "HEADING_2"},
  "fields": "namedStyleType"
}}
```

**Recomendación práctica**: hacer primero el `insertText`, después re-leer el doc (`gws docs documents get`) y luego construir un segundo batch con los `updateParagraphStyle` usando los startIndex/endIndex reales — evita errores de conteo de bytes Unicode.

### 4.5 Índice (TOC)

La plantilla tiene un placeholder de texto "Índice" pero no un elemento `TableOfContents` real. Dos opciones:

1. **Dejarlo como está** y avisar al usuario en Step 8 que abra el doc y use "Insertar → Tabla de contenidos" manualmente.
2. **Insertar un TOC programáticamente**: `gws docs` no soporta `insertTableOfContents` directamente en algunas versiones. Verificar con `CI=true gws docs documents batchUpdate --help` antes de intentarlo. Si no está disponible → opción 1.

### 4.5.1 Footer

El footer del OP_GEN contiene `<unidad que genera el documento>` → reemplazar con `BINPAR` (o la unidad real) mediante `replaceAllText`. Segmento: `doc.footers["kix.hf1"]`. Si solo escaneas body, el placeholder sobrevive en el entregable.

### 4.6 Bump Hoja de Control

En la plantilla, la fila inicial es `1.00 | DD/MM/AAAA | Versión Inicial | AUTOR - COMPAÑIA`. Para create mode:

- Si el usuario pide versión 1.0 / 1.00 → rellenar esa fila con valores reales (`deleteContentRange` + `insertText` por celda).
- Si pide versión distinta (`2.0`, etc.) → dejar la fila inicial con 1.00 y añadir fila con `insertTableRow`.

Ver `hoja-control.md` para detalles.

## 5. Secuencia recomendada de batchUpdate

**Batch 1** — reemplazos por `replaceAllText` (seguros, afectan portada y Hoja de Control):
- Título, tipo de documento, autor, fecha, nombre archivo.

**Batch 2** — borrar cuerpo de ejemplo + bump versión en portada (end-to-start por índice).

**Batch 3** — re-leer, insertar cuerpo nuevo, aplicar estilos de heading, rellenar fila de Hoja de Control.

## 6. Update mode

Flujo general (ver `update-flow.md`):

1. Leer el doc; detectar que es OP_GEN por la presencia de portada "Versión: X.Y" + tabla "Control de cambios".
2. Preguntar qué sección actualizar. Como el cuerpo es libre, pedir al usuario que identifique el heading por texto (ej. "actualiza el capítulo 'Claims'").
3. Buscar ese heading en el doc; calcular rango hasta el siguiente heading del mismo nivel o superior.
4. `deleteContentRange` + `insertText` con el nuevo contenido.
5. Bump versión (+0.01 por defecto).
