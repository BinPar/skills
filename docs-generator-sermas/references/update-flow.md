# Update flow — reescritura acotada de un Google Doc Sermas existente

Aplica cuando el usuario pasa una URL o ID de un Google Doc previamente generado (o el DPE canon pre-rellenado por Sermas) y pide cambios puntuales.

## 1. Detectar que es update mode

En Step 1 del `SKILL.md`, si el prompt del usuario contiene:

- Una URL de Google Docs (`https://docs.google.com/document/d/{DOC_ID}/...`), o
- Un ID de Google Doc (string de ~44 chars alfanuméricos con `_` o `-`), o
- La palabra "actualiza", "modifica", "cambia", "refina", "bumpa", "añade a la acta" + referencia a un doc existente,

→ update mode.

Extraer `DOC_ID` y pasar al flujo de update.

## 2. Identificar el tipo de documento

Leer el doc (`documents.get`) y detectar por **estructura**:

| Heurística | Tipo |
|------------|------|
| Cabeceras de tabla `Versión | Fecha cambio | Responsable | Motivo del cambio` | **ACR** |
| Heading "INTRODUCCIÓN" + heading "DESCRIPCIÓN FUNCIONAL DE LA SOLUCIÓN" + tabla "DATOS DE LA PETICIÓN" | **DPE** |
| Heading "INTRODUCCIÓN" + heading "GUÍA UTILIZACIÓN" + heading "POSIBLES INCIDENCIAS" + filename empieza por `OC_MAN_` | **MAN** |
| Portada con "TÍTULO" + "Preparado Para: DGSD" sin las estructuras anteriores | **GEN** |

Si no encaja en ninguna estructura conocida → abortar update y decirle al usuario: "No reconozco este doc como una plantilla Sermas conocida. ¿Puedes indicarme manualmente el rango de texto a reescribir?"

## 3. Preguntar qué actualizar

Con AskQuestionTool, ofrecer opciones según tipo:

**DPE**:
- 1.1 Datos Identificativos
- 1.2 Documentos relacionados
- 2.1 Requisitos funcionales
- 2.2 Requisitos técnicos
- 2.3 Otros requisitos
- 2.4 Peticiones relacionadas
- 2.5 Riesgos
- 3.1 Enfoque
- 3.2 Modelo de datos
- 3.3 Entradas/Salidas
- 3.4 Otros procesos
- 3.5 Prototipo
- (multi-select permitido)

**GEN**: "Indícame el título exacto del capítulo a actualizar (texto del heading)". Es libre porque el cuerpo es libre.

**ACR**:
- Asistentes (§1.1)
- Resoluciones (§2)
- Próximos pasos (§3)
- Portada (código proyecto, fecha)

**MAN**:
- Secciones 1-5 (común)
- Sección 6 Guía de utilización
- Sección 7 Preguntas frecuentes
- Sección 8 Posibles incidencias

**Confirmación explícita**: antes de ejecutar, AskQuestionTool mostrando qué secciones se van a reescribir.

## 4. Calcular el rango de cada sección

Para cada heading seleccionado por el usuario:

1. En el mapa interno (Step 4 del SKILL.md), encontrar el párrafo cuyo texto coincide con el heading (normalizando espacios, mayúsculas, acentos).
2. `section_start = heading.endIndex` (el `\n` que sigue al heading).
3. `section_end` = `startIndex` del **siguiente heading de nivel ≤ al actual**, o final del body si no hay.
4. El rango del cuerpo a borrar es `[section_start, section_end - 1]` (dejando el `\n` del último párrafo para no romper estilos).

**Atención a tablas dentro de la sección**: `deleteContentRange` no puede cruzar fronteras de tabla. Si hay una tabla en medio de la sección (ej. §2.5 Riesgos, §1.2 Documentos), partir el reemplazo:

- Borrar cuerpo antes de la tabla.
- Editar la tabla por separado (añadir filas, reescribir celdas).
- Borrar cuerpo después de la tabla (si procede).

## 5. Aplicar la reescritura

**Orden: end-to-start** (sección cuyo `section_start` sea más alto primero).

Por cada sección:

```json
{"deleteContentRange": {"range": {"startIndex": SECTION_START, "endIndex": SECTION_END_MINUS_1}}},
{"insertText": {"location": {"index": SECTION_START}, "text": "Nuevo contenido generado..."}}
```

Si el nuevo contenido necesita subheadings H2/H3, aplicar `updateParagraphStyle` en un segundo batch tras re-leer el doc.

## 6. Bump Hoja de Control

Tras reescribir el contenido, aplicar el bump:

1. `insertTableRow` en la tabla "Control de cambios", fila nueva bajo la última.
2. Re-leer doc.
3. Rellenar las 4 celdas de la fila nueva con `{nueva_versión, hoy, motivo, autor}` (orden según tipo — ver `hoja-control.md`).
4. Actualizar la portada (versión).

**Motivo**: describe QUÉ se actualizó (ej. "Actualización §2.5 Riesgos y §3.1 Enfoque"). Si el usuario no lo especifica, preguntar o inferir.

## 7. Confirmar y presentar

Tras el update:

- Mostrar la URL del doc en el chat (texto plano).
- Resumen: qué secciones se reescribieron, cuál es la nueva versión, motivo registrado.
- Recordar al usuario actualizar el TOC manualmente si aplica.

## 8. Edge cases

| Caso | Acción |
|------|--------|
| El doc no es accesible (403) | Pedir al usuario que comparta el doc con la cuenta autenticada |
| El heading seleccionado no existe | Mostrar los headings encontrados y pedir al usuario que elija |
| Hay texto en el heading levemente distinto (acentos, espacios) | Hacer match case-insensitive y sin acentos; si aún no coincide, listar candidatos cercanos |
| El usuario cambia la versión manualmente en portada | Respetarla: leer la versión de la portada también, y si discrepa con la Hoja de Control, usar la portada como fuente de verdad |
| El usuario pide revertir la última fila de Control de cambios | No hacerlo automáticamente; decirle que es trazabilidad y debe editarla manualmente si está equivocada |
| Update concurrente (otro usuario edita a la vez) | Si `batchUpdate` falla con "document structure has changed", re-leer y reintentar una vez; si vuelve a fallar, avisar |
