# Plan — `docs-generator-sermas`

Skill paraguas para generar la documentación Word oficial de Sermas (Comunidad de Madrid — DGSD) en Google Docs, usando las 4 plantillas nuevas entregadas por el cliente.

---

## 1. Contexto

Sermas nos pasó 4 plantillas `.docx` nuevas en la carpeta de Drive `1LgWL3RnPhqeKb_rgKUYR1ucGs370TEHn`:

| Código        | Nombre                                  | Propósito                                                                                          |
|---------------|-----------------------------------------|----------------------------------------------------------------------------------------------------|
| **OC_DPE**    | Documento de Petición / Alcance Funcional | Definición de alcance funcional del proyecto. Validan Atención Primaria, perfiles, etc.          |
| **OP_GEN**    | Plantilla documento genérico v3.0       | Documentos de detalle técnico o funcional (JWT, gestión de guías, KPIs, etc.).                    |
| **OP_ACR**    | Acta Reunión v3.0                       | Acta de reunión con convocados, resoluciones y próximos pasos.                                     |
| **OC_MAN**    | Manual de usuario v2                    | Manual de usuario, **un documento por perfil** de la aplicación.                                   |

Ya existe en el repo la skill `slides-generator-sermas` para presentaciones Google Slides. Esta skill sigue el mismo patrón pero para documentos Word/Google Docs.

---

## 2. Decisiones arquitecturales (confirmadas con el usuario)

| Pregunta | Decisión |
|----------|----------|
| Motor de edición | **Google Docs API** (`gws docs`) — las plantillas `.docx` se convertirán a Google Docs canon y la skill las copia/edita vía API |
| Granularidad | **Una sola skill paraguas** `docs-generator-sermas` que detecta el tipo de documento por keywords y rutea a la lógica correcta |
| Fuentes de datos del contenido | Conversación con el usuario + documentos previos en Drive/Notion + Markdown/fichero local |
| Manual de usuario multi-perfil | **Un doc por perfil en una sola ejecución** — el usuario lista perfiles, la skill genera N documentos |
| Ubicación de los templates canon | Carpeta **`sermas`** (padre de la carpeta de templates `.docx`). Subida manual una vez, IDs hardcoded en `SKILL.md` |
| Workflow del DPE | El DPE es un **doc vivo por proyecto**: la plantilla ya trae la metadata (código JIRA, expediente, checkboxes, prioridad) fijada para ese proyecto. La skill **solo toca las secciones de contenido** (1. Introducción, 2. Requisitos, 3. Descripción Funcional) |
| OP_GEN estructura | **100 % libre** — la skill aplica la plantilla (portada, hoja de control, índice) y el usuario dicta los capítulos |
| Nomenclatura de ficheros | Oficial Sermas: `OC_DPE_{CODIGO}_ALCANCE_FUNCIONAL_{SUBSISTEMA}`, `OP_GEN_{TITULO}_v{VERSION}`, `OP_ACR_{YYYYMMDD}_{PROYECTO}`, `OC_MAN_{APLICACION}_{PERFIL}_v{VERSION}` |
| Entregable final | **Solo Google Doc** (no exportar a `.docx`). El usuario exporta manualmente cuando entrega |
| Hoja de Control | **Bump de versión + añadir fila en Control de cambios** (fecha + motivo + autor). Control de aprobaciones se deja para los revisores humanos |
| Modo update | **Mismo comando** acepta URL/ID de Google Doc existente. Si lo recibe → modo update: reescribe solo las secciones que el usuario pida, bumpa versión |

---

## 3. Estructura de ficheros

```
docs-generator-sermas/
├── SKILL.md                    # Entry point, triggers, constantes (template IDs), flujo común
└── references/
    ├── dpe-structure.md        # Anatomía del OC_DPE: tablas, placeholders, secciones editables (1-3)
    ├── generico-structure.md   # Anatomía del OP_GEN: portada, hoja control, índice; contenido libre
    ├── acta-structure.md       # Anatomía del OP_ACR: tablas fijas (asistentes, resoluciones, próximos pasos)
    ├── manual-structure.md     # Anatomía del OC_MAN: 8 secciones fijas + generación multi-perfil
    ├── gws-docs-commands.md    # Comandos gws docs más usados (get, batchUpdate, insertText, insertTableRow…)
    ├── hoja-control.md         # Patrón para localizar y mutar la tabla de Control de cambios + bump versión
    └── update-flow.md          # Cómo detectar secciones en un doc existente y reescribir rangos acotados
```

---

## 4. Triggers (detección de intent en SKILL.md)

La skill se activa cuando el usuario pide generar documentación Sermas. El tipo de documento se detecta por keywords:

| Tipo | Keywords (es) |
|------|---------------|
| DPE  | "DPE", "alcance funcional", "documento de petición", "documento de alcance", "OC_DPE" |
| Acta | "acta", "acta de reunión", "minutas", "OP_ACR" |
| Manual | "manual de usuario", "manual para [perfil]", "user manual sermas", "OC_MAN" |
| Genérico | "documento genérico", "doc técnico sermas", "JWT sermas", "KPIs sermas", "documento de guías", "OP_GEN" |

Fallback: si hay ambigüedad, `AskUserQuestion` con las 4 opciones.

Default language: **español**.

---

## 5. Constantes del skill

Se capturan **una vez** al subir las plantillas a la carpeta `sermas` y se hardcodean en `SKILL.md`:

```
TEMPLATES:
  DPE:     <Google Doc ID de OC_DPE convertido>
  GEN:     <Google Doc ID de OP_GEN convertido>
  ACR:     <Google Doc ID de OP_ACR convertido>
  MAN:     <Google Doc ID de OC_MAN convertido>

SERMAS_FOLDER_ID:    <ID de la carpeta "sermas">
```

El DPE, al ser "doc vivo por proyecto", admite override: si el usuario pasa un ID/URL distinto lo usará en lugar del canon (útil para proyectos que ya tienen su DPE inicial).

---

## 6. Flujo común (Steps)

### Step 0 — Prerequisites

- Verificar `gws` instalado y autenticado (`CI=true gws drive files list --params '{"pageSize": 1}'`).
- Si auth expirado → `CI=true gws auth login` y mostrar URL en chat.

### Step 1 — Detectar intent + modo (create vs update)

Parsear el prompt del usuario:

1. **Tipo de documento** (DPE / GEN / ACR / MAN) por keywords. Si ambiguo → `AskUserQuestion`.
2. **Modo**:
   - Si hay URL/ID de Google Doc en el prompt → **modo update**.
   - Si no → **modo create** (usa plantilla canon).
3. **Fuente de contenido**: conversación / doc previo en Drive / Notion / Markdown.

### Step 2 — Recoger requisitos mínimos

Según tipo (tabla con campos obligatorios y defaults — ver §7 por tipo). Los campos no inferibles del prompt se piden con `AskUserQuestion` preferentemente por opciones.

### Step 3 — Copiar plantilla (solo modo create)

```bash
CI=true gws drive files copy \
  --params '{"fileId": "TEMPLATE_ID"}' \
  --json '{"name": "NUEVO_NOMBRE_SEGUN_NOMENCLATURA", "parents": ["CARPETA_DESTINO_ID"]}'
```

Carpeta destino: la que indique el usuario o, si no, la carpeta `sermas`.

### Step 4 — Leer estructura del documento

```bash
CI=true gws docs documents get --params '{"documentId": "NEW_DOC_ID"}'
```

Se construye un mapa interno:

- `body.content[]` con cada paragraph y su `paragraphStyle.namedStyleType` (`HEADING_1`, `HEADING_2`, `NORMAL`).
- Posiciones (`startIndex`, `endIndex`) de cada heading.
- Tablas (`table.tableRows[].tableCells[]`) identificadas por el texto del primer row (cabecera).
- Placeholders literales (`<DD/MM/AAAA>`, `<Incluir en esta sección…>`, `<Nombre…>`).

### Step 5 — Generar contenido por sección

Ver §7 por tipo. El resultado es una lista de operaciones `batchUpdate`:

- `replaceAllText` para placeholders literales globales.
- `deleteContentRange` + `insertText` para cuerpos de sección acotados entre heading X y heading X+1.
- `insertTableRow` + `insertText` celda a celda para tablas estructuradas (asistentes, riesgos, próximos pasos).

### Step 6 — Bump Hoja de Control

Ver `references/hoja-control.md`. Pasos:

1. Localizar la tabla "Control de cambios" por texto de cabecera (`Versión | Fecha versión | Motivo del cambio | Autor`).
2. Leer la última fila no vacía → extraer versión actual (ej. `1.00`).
3. Calcular nueva versión:
   - Create: `1.00` (si la plantilla trae `<01.00>` como placeholder).
   - Update: bump `+0.01` por defecto, o `+1.00` si el usuario lo indica explícitamente.
4. `insertTableRow` bajo la última fila → rellenar celdas `{nueva_versión, hoy DD/MM/AAAA, motivo, autor}`.
5. En la portada, reemplazar el texto `Versión: <…>` con la nueva versión.

No se toca la tabla "Control de Aprobaciones" (es para revisores humanos).

### Step 7 — Ejecutar batchUpdate

```bash
CI=true gws docs documents batchUpdate \
  --params '{"documentId": "DOC_ID"}' \
  --json '{"requests": [...]}'
```

Reglas:

- Mantener cada batch bajo ~50 operaciones. Si hay más, partir.
- **Orden importa**: insertar en orden descendente de `startIndex` para evitar invalidar posiciones. Alternativa: re-leer el documento entre batches.

### Step 8 — Devolver URL

```bash
CI=true gws drive files get --params '{"fileId": "DOC_ID", "fields": "id,name,webViewLink"}'
```

Mostrar la URL **como texto en el chat** (no solo en tool output), junto con un resumen de qué se generó/actualizó.

---

## 7. Especifidades por tipo de documento

### 7.1 OC_DPE — Documento de Petición / Alcance Funcional

**Workflow**: "doc vivo por proyecto". La plantilla canon del DPE trae metadata de ejemplo (`GES-29112`, `SDAP-OP-CICG-ALMA`, empresa BINPAR, checkboxes fijados). Para un nuevo proyecto, el usuario pasa el ID del Google Doc DPE de ese proyecto (ya pre-rellenado por ellos). Si no pasa ID → usa el canon.

**Requisitos mínimos**:

- Modo create: carpeta destino, nombre o código JIRA para construir el filename.
- Modo update: URL/ID del DPE del proyecto.
- Para las secciones: contenido textual de 1.Introducción, 2.Requisitos, 3.Descripción Funcional (desde conversación o markdown).

**Secciones editables** (la skill solo toca estas):

| # | Heading 1 | Subsecciones (H2) |
|---|-----------|---------------------|
| 1 | INTRODUCCIÓN | 1.1 Datos Identificativos · 1.2 Documentos relacionados (tabla Fichero/Descripción/Localización) |
| 2 | REQUISITOS SOLICITADOS | 2.1 Funcionales · 2.2 Técnicos · 2.3 Otros · 2.4 Peticiones relacionadas · 2.5 Riesgos (tabla Tipo/Descripción/Impacto/Probabilidad/Mitigadora) |
| 3 | DESCRIPCIÓN FUNCIONAL DE LA SOLUCIÓN | 3.1 Enfoque · 3.2 Modelo de datos · 3.3 Entradas/Salidas · 3.4 Otros procesos · 3.5 Prototipo |

**NO se tocan**: Hoja de Control (tablas DATOS DE LA PETICIÓN, MOTIVACIÓN, CRITICIDAD, URGENCIA, PRIORIDAD, fases, datos administrativos, contactos). Son responsabilidad del gestor Sermas.

**Tablas con formato especial**:

- Tabla "Riesgos identificados": `insertTableRow` por cada riesgo con 5 celdas.
- Tabla "Documentos relacionados": `insertTableRow` por cada referencia.

### 7.2 OP_GEN — Documento genérico

**Workflow**: estructura 100 % libre. El usuario dicta los capítulos (ej. JWT: Flujo de autenticación / Claims / Rotación / Revocación).

**Requisitos mínimos**:

- Título, tipo de documento (texto libre que va bajo el título en portada).
- Autor, preparado para (default: "DGSD"), fecha (hoy), versión (default 1.0).
- Lista de capítulos con jerarquía H1/H2/H3 y contenido.

**Operaciones**:

- `replaceAllText` portada: `TÍTULO`, `Tipo de documento`, `AUTOR`, `DGSD`, `DD/MM/AAAA`, `1.0`, nombre del documento.
- Borrar el contenido de ejemplo ("TÍTULO 1", "TÍTULO 2"…) del cuerpo.
- Insertar capítulos del usuario aplicando `namedStyleType` `HEADING_1`/`HEADING_2`/`HEADING_3` + párrafos `NORMAL`.
- Actualizar índice: `gws docs` no regenera el TOC automáticamente; se deja una nota al final ("Abre el doc y click derecho en el índice → Update Table of Contents") o se invoca `deleteContentRange` + inserción de la misma estructura que Docs usa para el TOC (vía `TableOfContents` element — si la API lo soporta; de lo contrario, nota al usuario).

### 7.3 OP_ACR — Acta de Reunión

**Requisitos mínimos**:

- Código proyecto + descripción del motivo (portada).
- Fecha de la reunión (default: hoy) → aparece en portada y en "En Madrid, a X de mes de YYYY".
- Autor (creado por), fecha creación.
- Lista de asistentes: `[{nombre_apellidos, organizacion, abreviatura}, ...]`.
- Alcance de la reunión (bullet).
- Temas tratados: `[{tema, [bullets]}, ...]`.
- Resoluciones (texto o bullets por asunto).
- Próximos pasos: `[{asunto, tareas, fecha_limite, responsable}, ...]`.

**Operaciones**:

- `replaceAllText` portada: `<CÓDIGO PROYECTO>`, `Descripción del motivo de proyecto`, fecha.
- `replaceAllText` hoja control: `<Nombre de la persona que creó el documento>`, `<DD/MM/AAAA>`.
- Tabla "Relación de asistentes" (sección 1.1): `insertTableRow` por asistente con 3 celdas.
- Tabla "Resoluciones adoptadas" (sección 2): `insertTableRow` por asunto — cada fila con columna ASUNTOS + OBSERVACIONES (bullets).
- Tabla "Próximos pasos" (sección 3): `insertTableRow` por tarea con 5 celdas (ASUNTOS, ID, TAREAS, FECHA LÍMITE, RESPONSABLE).

### 7.4 OC_MAN — Manual de Usuario (multi-perfil)

**Workflow**: N documentos en una sola ejecución, uno por perfil.

**Requisitos mínimos**:

- Nombre de la aplicación (ej. "ALMA").
- Identificador/Aplicación de portada.
- Autor.
- Lista de perfiles: `["admin", "médico AP", "farmacéutico", "auditor", ...]`.
- Contenido común (intro, requisitos técnicos, funcionalidades generales, glosario, elementos del sistema).
- Contenido por perfil: niveles de acceso propios + guía de utilización adaptada + FAQ + incidencias.

**Estructura fija** (8 secciones):

1. INTRODUCCIÓN (común)
2. ASPECTOS GENERALES (común: 2.1 Requisitos · 2.2 Funcionalidades)
3. GLOSARIO DE TÉRMINOS (común)
4. PERFILES Y NIVELES DE ACCESO (común + destacar perfil actual)
5. ELEMENTOS DEL SISTEMA (común)
6. GUÍA UTILIZACIÓN (**específica del perfil**)
7. PREGUNTAS FRECUENTES (específica del perfil)
8. POSIBLES INCIDENCIAS (específica del perfil)

**Operaciones**:

- Bucle: por cada perfil → copia plantilla canon → rellena las 8 secciones → sufija nombre con `_{PERFIL_SLUG}` → bump hoja control.
- Al final, devolver N URLs en el chat.

---

## 8. Modo update (para cualquier tipo)

Activado cuando el prompt incluye URL o ID de un Google Doc existente.

Pasos:

1. Leer el doc existente con `gws docs documents get`.
2. Detectar el tipo por estructura (headings que coinciden con DPE/ACR/MAN o cuerpo libre = GEN).
3. Preguntar al usuario (si no está claro en el prompt) qué sección(es) actualizar.
4. Por cada sección seleccionada: calcular rango `startIndex`…`endIndex` entre su heading y el siguiente heading del mismo nivel. `deleteContentRange` + `insertText` + aplicar estilos.
5. Bump hoja de control (§6.6).

Protección: nunca se ejecuta un update sin confirmación explícita con `AskUserQuestion` mostrando qué secciones van a reescribirse.

---

## 9. Manejo de errores (resumen)

| Error | Causa | Solución |
|-------|-------|----------|
| `gws` not found | CLI no instalado | "Pídeme 'Set up BinPar tools'" |
| 401 Unauthorized | Token expirado | `CI=true gws auth login`, mostrar URL |
| Template inaccesible | Permisos | Verificar que los 4 Doc IDs canon están accesibles a la cuenta |
| `batchUpdate` falla por `startIndex` inválido | Otra operación previa invalidó posiciones | Re-leer el doc y rebuild requests |
| TOC no se actualiza | `gws docs` no refresca TOC automático | Mostrar nota al usuario al final con la instrucción manual |
| Más de N perfiles en MAN | Cada perfil = 1 batch de copy + batchUpdate | Procesar en serie; máx ~10 perfiles por ejecución sin warning |
| Doc existente con estructura no reconocida (update) | Alguien editó headings a mano | Abortar update y pedir al usuario que indique el rango manualmente |

---

## 10. Próximos pasos de implementación

1. **Localizar la carpeta `sermas`** (padre de `1LgWL3RnPhqeKb_rgKUYR1ucGs370TEHn`) y obtener su ID.
2. **Subir y convertir** los 4 `.docx` a Google Docs en esa carpeta. Capturar los 4 IDs.
3. **Escribir `SKILL.md`** con constantes, triggers, flujo común, pointers a references.
4. **Escribir los 7 references** (`dpe-structure`, `generico-structure`, `acta-structure`, `manual-structure`, `gws-docs-commands`, `hoja-control`, `update-flow`).
5. **Test end-to-end**:
   - Generar un acta corta con 2 asistentes y 1 resolución.
   - Generar un documento genérico con 3 capítulos.
   - Actualizar una sección del DPE canon y verificar que el resto queda intacto.
   - Generar un manual para 2 perfiles y comprobar que se crean 2 docs.
6. **Ajustar** cualquier drift de estilos/formato detectado en los tests.
