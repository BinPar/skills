# OP_ACR — Acta de Reunión

Template ID canon: `1HT5aLb20QT5-FVXtCyeO95rUroWfVvJL43zV1FAsOtI`.

## 1. Propósito

Acta oficial de reunión Sermas. Documenta convocados/asistentes, alcance, temas tratados, resoluciones y próximos pasos. La plantilla tiene 3 tablas estructuradas que se rellenan programáticamente.

## 2. Estructura de la plantilla canon

```
PORTADA
  <CÓDIGO PROYECTO>: Descripción del motivo de proyecto
  Acta de Reunión
  1/10/2024                         ← fecha reunión
  En Madrid, a 1 de octubre de 2024 ← fecha textual

HOJA DE CONTROL
  (TABLA 3x4)
    Creado por: | <Nombre…> | Fecha: | <DD/MM/AAAA>
    Revisado por: | <Nombre…> | Fecha: | <DD/MM/AAAA>
    Aprobado por: | <Nombre…> | Fecha: | <DD/MM/AAAA>

  Control de cambios (TABLA 4x4)
    Cabeceras: Versión | Fecha cambio | Responsable | Motivo del cambio
    Fila inicial: 1 | <DD/MM/AAAA> | <Nombre…> | <Describir…>

ÍNDICE (placeholder)

§1. Relación de convocados (H1)
  §1.1 Relación de asistentes (H2)
    TABLA 5x3: NOMBRE Y APELLIDOS | ORGANIZACIÓN/EQUIPO | ABREVIATURA
      (4 filas vacías bajo cabecera)

§2. Resoluciones adoptadas (H1)
  Texto: "Los temas más importantes que se han planteado durante la reunión y resoluciones que se han tomado son:"
  TABLA 3x2: ASUNTOS | OBSERVACIONES
    Fila 1: "Alcance de la reunión" | "XX"
    Fila 2: "Temas tratados" | "XX: / XX / XX / XX"

§3. Próximos pasos (H1)
  TABLA 5x5: ASUNTOS | ID | TAREAS | FECHA LÍMITE | RESPONSABLE
    Filas con IDs 1-4, fechas "dd/mm/aaaa" vacías
```

## 3. Requisitos mínimos (form)

| Campo | Default | Uso |
|-------|---------|-----|
| Código proyecto | preguntar | reemplaza `<CÓDIGO PROYECTO>` en portada |
| Descripción motivo | preguntar | reemplaza `Descripción del motivo de proyecto` |
| Fecha reunión (`DD/MM/AAAA`) | hoy | reemplaza `1/10/2024` |
| Fecha textual ("1 de octubre de 2024") | derivada de la fecha | reemplaza `1 de octubre de 2024` |
| Creador (`<Nombre…>`) | cuenta autenticada | Hoja de Control |
| Revisor / aprobador | opcional (dejar `<Nombre…>`) | Sermas los completa a mano |
| Asistentes: lista `[{nombre, organizacion, abreviatura}]` | preguntar | §1.1 |
| Alcance de la reunión (texto) | preguntar | §2 fila 1, columna "OBSERVACIONES" |
| Temas tratados (lista de bullets) | preguntar | §2 fila 2, columna "OBSERVACIONES" |
| Resoluciones extra (asunto + observaciones) | opcional | filas adicionales en §2 |
| Próximos pasos: lista `[{asunto, tareas, fecha_limite, responsable}]` | preguntar | §3 |
| Autor / nombre archivo | `OP_ACR_{YYYYMMDD}_{PROYECTO}` | Drive copy |

## 4. Operaciones por bloque

### 4.1 Portada + header + footer — `replaceAllText`

```json
{"replaceAllText": {"containsText": {"text": "<CÓDIGO PROYECTO>", "matchCase": true}, "replaceText": "CICG-ALMA"}},
{"replaceAllText": {"containsText": {"text": "<CODIGO PROYECTO>", "matchCase": true}, "replaceText": "CICG-ALMA"}},
{"replaceAllText": {"containsText": {"text": "Descripción del motivo de proyecto", "matchCase": true}, "replaceText": "Sesión de revisión de alcance"}},
{"replaceAllText": {"containsText": {"text": "<Descripción del alcance de la reunión>", "matchCase": true}, "replaceText": "Sesión de revisión de alcance"}},
{"replaceAllText": {"containsText": {"text": "1/10/2024", "matchCase": false}, "replaceText": "21/04/2026"}},
{"replaceAllText": {"containsText": {"text": "1 de octubre de 2024", "matchCase": false}, "replaceText": "21 de abril de 2026"}},
{"replaceAllText": {"containsText": {"text": "[Nombre del Proyecto]", "matchCase": true}, "replaceText": "CICG-ALMA"}},
{"replaceAllText": {"containsText": {"text": "[Título del Documento]", "matchCase": true}, "replaceText": "Acta de reunión"}},
{"replaceAllText": {"containsText": {"text": "<Equipo que realiza el documento>", "matchCase": true}, "replaceText": "BINPAR"}},
{"replaceAllText": {"containsText": {"text": "<Departamento que realiza el documento >", "matchCase": true}, "replaceText": "DGSD"}}
```

⚠️ **Dos sintaxis distintas**:

- `<CÓDIGO PROYECTO>` con acento aparece en el **body**.
- `<CODIGO PROYECTO>` sin acento aparece en el **header** `kix.hf0`.

Son strings diferentes — necesitas dos `replaceAllText` separados.

⚠️ **Header alternativo `kix.hf3`** usa la sintaxis `[Nombre del Proyecto]` / `[Título del Documento]` (con corchetes, no `<...>`). Cubrirlo explícitamente.

⚠️ **Footer `kix.hf6`** tiene un espacio final dentro del placeholder: `<Departamento que realiza el documento >` (espacio antes del `>`). Sin ese espacio, `replaceAllText` no matchea.

### 4.2 Hoja de Control — placeholders `<...>` del creador

```json
{"replaceAllText": {"containsText": {"text": "<Nombre de la persona que creó el documento>", "matchCase": true}, "replaceText": "Alberto Blanco"}},
{"replaceAllText": {"containsText": {"text": "<DD/MM/AAAA>", "matchCase": true}, "replaceText": "21/04/2026"}}
```

**Cuidado**: `<DD/MM/AAAA>` aparece en Creado/Revisado/Aprobado y en la fila de "Control de cambios". `replaceAllText` los sustituye todos por la misma fecha — en una versión inicial eso es aceptable. Si el usuario quiere diferenciar, actuar por índice de celda.

Si Revisor/Aprobador no se especifican → dejar los placeholders literales `<Nombre de la persona que revisa el documento>` / `<Nombre de la persona que aprueba el documento>` (Sermas los completa a mano).

Actualizar la fila de `Control de cambios`:

- `<Describir detalladamente donde se han realizado los cambios, indicando su ubicación (ejemplo: apartado xx)>` → motivo real (ej. "Versión inicial").

### 4.3 §1.1 Relación de asistentes (tabla 5x3)

La plantilla trae 4 filas vacías bajo cabecera. Estrategia:

- Si `N_asistentes ≤ 4` → rellenar las filas existentes con `insertText` en cada celda, dejar el resto vacías o borrarlas con `deleteTableRow`.
- Si `N_asistentes > 4` → añadir `N - 4` filas con `insertTableRow`, re-leer, rellenar.

Para borrar filas sobrantes:

```json
{
  "deleteTableRow": {
    "tableCellLocation": {
      "tableStartLocation": {"index": TABLE_START},
      "rowIndex": ROW_IDX,
      "columnIndex": 0
    }
  }
}
```

Borrar de abajo a arriba.

### 4.4 §2 Resoluciones adoptadas (tabla 3x2)

La plantilla viene con 2 filas de ejemplo:

- Fila 1: "Alcance de la reunión" | "XX"
- Fila 2: "Temas tratados" | "XX: / XX / XX / XX"

Operación:

1. En fila 1, col OBSERVACIONES: `deleteContentRange` de "XX" + `insertText` del alcance real.
2. En fila 2, col OBSERVACIONES: borrar el contenido de ejemplo e insertar los temas (uno por línea, con `\n`).
3. Si el usuario pasa más asuntos → `insertTableRow` adicionales.

### 4.5 §3 Próximos pasos (tabla 5x5)

5 columnas: `ASUNTOS | ID | TAREAS | FECHA LÍMITE | RESPONSABLE`. La plantilla trae 4 filas con IDs 1-4 vacías.

- Si `N_pasos ≤ 4` → rellenar filas existentes; borrar sobrantes con `deleteTableRow`.
- Si `N_pasos > 4` → `insertTableRow` extras. Nuevo ID secuencial.

### 4.6 Bump Hoja de Control

Ver `hoja-control.md`. En el ACR, las cabeceras de "Control de cambios" son `Versión | Fecha cambio | Responsable | Motivo del cambio` (nota: orden distinto al DPE/MAN/GEN).

Para create mode inicial: la fila 1 ya está ("1"), solo se rellenan los placeholders. Para update: `insertTableRow` abajo con nueva versión.

## 5. Secuencia recomendada de batchUpdate

**Batch 1** — `replaceAllText` portada y Hoja de Control (atómico, seguro).

**Batch 2** — **deleteTableRow de filas sobrantes vacías** (antes de rellenar). Tabla a tabla, una fila por batch si hay varias, re-leyendo entre llamadas.

**Batch 3** — rellenar celdas de las filas que quedan (end-to-start por índice). Si también hay `insertTableRow` para filas extras, hacerlo en un batch aparte y re-leer antes de rellenar.

**Batch 4** — bump Hoja de Control.

**⚠️ Importante: no mezclar `deleteContentRange` dentro de celdas con `deleteTableRow` en el mismo batch ni en batches contiguos sin re-leer**. Observado en tests: hace que `deleteTableRow` borre filas adyacentes con datos que acabas de insertar. Si te pasa, re-leer y reconstruir con `insertTableRow`.

## 6. Update mode

1. Leer el acta existente; confirmar que es OP_ACR por la cabecera "Acta de Reunión" + presencia de la tabla 5x5 de próximos pasos.
2. Preguntar al usuario qué actualizar: asistentes, resoluciones, próximos pasos, fechas.
3. Aplicar los cambios solicitados en la(s) tabla(s) correspondiente(s).
4. Bump versión en Control de cambios.

Un caso habitual: añadir una nueva resolución o actualizar un próximo paso tras una reunión de seguimiento — en lugar de crear una acta nueva, se actualiza la existente y se registra el cambio en la Hoja de Control.
