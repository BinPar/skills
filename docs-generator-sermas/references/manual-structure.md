# OC_MAN — Manual de Usuario (multi-perfil)

Template ID canon: `1lJsr6ur7XJ2cnjaEDpjif3r3UXnc8Ckroj83OYkOkGc`.

## 1. Propósito

Manual de usuario Sermas. Es un **multi-doc**: se genera **un manual por perfil de usuario** en una sola ejecución (administrador, médico AP, farmacéutico, auditor, etc.). Las secciones 1-5 son comunes; 6-8 son específicas del perfil.

## 2. Estructura de la plantilla canon

```
PORTADA
  <Identificador/Aplicación>
  Manual de usuario
  Autor: <indicar>
  Preparado Para: <Usuario de la aplicación>
  Fecha: <DD/MM/AAAA>
  Aplicación: <NOMBRE DE LA APLICACIÓN>
  Versión: <01.00>
  Documento: OP_MAN_Manual de usuario v1.0.docx

HOJA DE CONTROL
  Control de cambios (TABLA 4x4: Versión | Fecha versión | Motivo del cambio | Autor)
    Fila inicial: 1.00 | <DD/MM/AAAA> | <Describir…> | <Nombre…>
  Control de Aprobaciones (TABLA 3x4, NO TOCAR)

ÍNDICE (placeholder)

§1 INTRODUCCIÓN (H1) — común
§2 ASPECTOS GENERALES DEL SISTEMA (H1) — común
  §2.1 Requisitos Necesarios (H2)
  §2.2 Funcionalidades Aplicación (H2)
§3 GLOSARIO DE TÉRMINOS (H1) — común
§4 PERFILES Y NIVELES DE ACCESO (H1) — común + resalte del perfil actual
§5 ELEMENTOS DEL SISTEMA (H1) — común
§6 GUÍA UTILIZACIÓN (H1) — ESPECÍFICA DEL PERFIL
§7 PREGUNTAS FRECUENTES (H1) — específica del perfil
§8 POSIBLES INCIDENCIAS (H1) — específica del perfil
```

## 3. Requisitos mínimos (form)

| Campo | Default | Uso |
|-------|---------|-----|
| Nombre aplicación | preguntar | `<NOMBRE DE LA APLICACIÓN>` |
| Identificador/Aplicación (portada) | = nombre aplicación | `<Identificador/Aplicación>` |
| Autor | cuenta autenticada | `<indicar>` y `<Nombre de la persona que creó el documento>` |
| Fecha | hoy `DD/MM/AAAA` | `<DD/MM/AAAA>` |
| Versión inicial | `1.00` | `<01.00>` |
| Lista de perfiles | preguntar (lista libre) | un doc por perfil, sufijo en filename |
| Contenido común §1, §2.1, §2.2, §3, §4, §5 | preguntar | mismo en todos los docs |
| Contenido por perfil §6, §7, §8 | preguntar por cada perfil | distinto en cada doc |

**Warning**: si `len(perfiles) > 10`, avisar al usuario antes de generar (10 copies + batchUpdates secuenciales).

## 4. Flujo multi-perfil

```
for perfil in perfiles:
  1. files.copy del template canon con name = "OC_MAN_{APP}_{PERFIL_SLUG}_v{VER}"
  2. documents.get para leer estructura real del nuevo doc
  3. Construir batchUpdate con:
     - replaceAllText de placeholders de portada
     - replaceAllText de placeholders de Hoja de Control
     - Reescribir §1-§5 (contenido común) y §4 enfatizar el perfil
     - Reescribir §6-§8 (contenido específico del perfil)
     - Bump Hoja de Control (rellenar fila 1.00 inicial)
  4. Ejecutar batchUpdate (puede requerir split en varios batches)
  5. Obtener webViewLink y guardar URL
Al final: mostrar N URLs en el chat.
```

Paralelizable a nivel de `files.copy`, pero los `batchUpdate` son secuenciales por doc. Para N ≤ 5 perfiles, secuencial completo es aceptable.

## 5. Placeholders y operaciones por doc

### 5.1 Portada — `replaceAllText`

```json
{"replaceAllText": {"containsText": {"text": "<Identificador/Aplicación>", "matchCase": true}, "replaceText": "ALMA"}},
{"replaceAllText": {"containsText": {"text": "<indicar>", "matchCase": true}, "replaceText": "Alberto Blanco"}},
{"replaceAllText": {"containsText": {"text": "<Usuario de la aplicación>", "matchCase": true}, "replaceText": "Médico de Atención Primaria"}},
{"replaceAllText": {"containsText": {"text": "<DD/MM/AAAA>", "matchCase": true}, "replaceText": "21/04/2026"}},
{"replaceAllText": {"containsText": {"text": "<NOMBRE DE LA APLICACIÓN>", "matchCase": true}, "replaceText": "ALMA — Asistente Clínico"}},
{"replaceAllText": {"containsText": {"text": "<01.00>", "matchCase": true}, "replaceText": "1.00"}},
{"replaceAllText": {"containsText": {"text": "OP_MAN_Manual de usuario v1.0.docx", "matchCase": true}, "replaceText": "OC_MAN_ALMA_MEDICO_AP_v1.0"}}
```

**Preparado Para** varía por perfil (es lo que distingue cada doc en la portada aparte del filename).

### 5.2 Hoja de Control — placeholders `<...>`

```json
{"replaceAllText": {"containsText": {"text": "<Nombre de la persona que creó el documento>", "matchCase": true}, "replaceText": "Alberto Blanco"}},
{"replaceAllText": {"containsText": {"text": "<Describir detalladamente donde se han realizado los cambios, indicando su ubicación (ejemplo: apartado xx)>", "matchCase": true}, "replaceText": "Versión inicial del manual"}}
```

### 5.3 Cuerpo — reescritura de §1 a §8

Cada sección en la plantilla viene con un **párrafo descriptivo de ejemplo** (ej. §1 INTRODUCCIÓN → "Breve exposición del objeto del documento, contexto y aplicación."). Estrategia:

1. Identificar el rango entre el heading `§X` y el heading `§X+1`.
2. `deleteContentRange` del cuerpo descriptivo.
3. `insertText` del contenido real, con newlines para separar párrafos. Si hay subheadings H2/H3, aplicar `updateParagraphStyle`.

Procesar **end-to-start** (de §8 hacia §1) para no invalidar índices.

**⚠️ Incluye TODOS los headings en la lista de boundaries**, incluidos los "contenedores" sin cuerpo propio. §2 "ASPECTOS GENERALES DEL SISTEMA" no tiene párrafo de cuerpo propio (el contenido está en §2.1 y §2.2), pero **tiene que estar en la lista de headings** al calcular rangos. Si no, al calcular el rango del cuerpo de §1 INTRODUCCIÓN extenderás hasta §2.1 Requisitos Necesarios — y al reemplazar el cuerpo borrarás el heading §2 ASPECTOS GENERALES.

Lista completa de headings que hay que reconocer como boundaries al parsear:

1. `INTRODUCCIÓN` (H1)
2. `ASPECTOS GENERALES DEL SISTEMA` (H1) — contenedor, sin cuerpo propio
3. `Requisitos Necesarios` (H2)
4. `Funcionalidades Aplicación` (H2)
5. `GLOSARIO DE TÉRMINOS` (H1)
6. `PERFILES Y NIVELES DE ACCESO` (H1)
7. `ELEMENTOS DEL SISTEMA` (H1)
8. `GUÍA UTILIZACIÓN` (H1)
9. `PREGUNTAS FRECUENTES` (H1)
10. `POSIBLES INCIDENCIAS` (H1)

**⚠️ Estilo residual tras `insertText`**: el texto insertado en sustitución de un párrafo heredará el `namedStyleType` del párrafo borrado. Si sustituyes el cuerpo descriptivo (que probablemente era NORMAL_TEXT) el resultado hereda NORMAL_TEXT y está bien. PERO si en tu lógica acabas sustituyendo desde el heading en vez de desde el párrafo siguiente, el body saldrá como HEADING_X. Tras el `insertText`, re-leer el doc e inspeccionar el estilo de cada párrafo del cuerpo; si hay derive, aplicar `updateParagraphStyle` a `NORMAL_TEXT`.

### 5.4 §4 PERFILES Y NIVELES DE ACCESO — destacar perfil actual

En el contenido común de §4, tras la tabla o lista de perfiles, añadir un párrafo resaltado del tipo:

> **Este manual está dirigido al perfil "Médico de Atención Primaria".** A continuación se describen los accesos y funcionalidades específicos de este perfil.

Se puede poner en negrita con `updateTextStyle` (`bold: true`) sobre el rango correspondiente.

## 6. Secuencia recomendada de batchUpdate (por doc)

**Batch 1** — `replaceAllText` de portada y Hoja de Control.

**Batch 2** — Reescritura de §8, §7, §6 (específicos del perfil), end-to-start.

**Batch 3** — Reescritura de §5, §4, §3, §2.2, §2.1, §1 (comunes), end-to-start. Entre batch 2 y 3 conviene re-leer si los índices pueden haberse movido.

**Batch 4** — Si se añadieron subheadings nuevos, aplicar `updateParagraphStyle` tras re-leer.

## 7. Nomenclatura de ficheros

Patrón: `OC_MAN_{APLICACION}_{PERFIL_SLUG}_v{VERSION}`

- `APLICACION`: en MAYÚSCULAS, espacios → `_` (ej. "ALMA").
- `PERFIL_SLUG`: en MAYÚSCULAS, sin acentos, espacios → `_` (ej. "MEDICO_AP", "FARMACEUTICO", "ADMINISTRADOR").
- `VERSION`: `1.0` (no `1.00` en el filename; `1.00` solo en la Hoja de Control).

Ejemplos:

- `OC_MAN_ALMA_MEDICO_AP_v1.0`
- `OC_MAN_ALMA_FARMACEUTICO_v1.0`
- `OC_MAN_ALMA_AUDITOR_v1.0`

## 8. Update mode

Poco común en MAN (los manuales se revisan poco). Si el usuario lo pide:

- Solo actúa sobre 1 doc a la vez (URL/ID específico).
- Preguntar qué sección actualizar.
- Aplicar cambio + bump Hoja de Control.

Si el usuario quiere actualizar "el manual de todos los perfiles" → pedirle la lista de IDs o buscar en la carpeta todos los docs con prefijo `OC_MAN_{APP}_` y aplicar el cambio a cada uno.
