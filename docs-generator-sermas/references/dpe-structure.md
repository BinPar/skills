# OC_DPE — Documento de Petición / Alcance Funcional

Template ID canon: `1_X2eU9kKhqMpgyDALeNchTSNHjJJmVnnJcZlGnX1RsI`.

## 1. Workflow: "doc vivo por proyecto"

La plantilla canon ya viene con metadata pre-cargada por Sermas para un proyecto concreto (ejemplo: código JIRA `GES-29112`, expediente `A/SUM-039304/2025`, subsistema `SDAP-OP-CICG-ALMA-010`, empresa `BINPAR`, checkboxes de PRIORIDAD / FASE / MOTIVACIÓN ya marcados).

Para un proyecto **nuevo**, el flujo habitual es:

1. El gestor Sermas crea una copia del DPE, rellena toda la metadata (portada + tablas de la Hoja de Control) y la comparte con BINPAR.
2. BINPAR recibe la URL → el usuario pasa ese URL/ID a la skill en **modo update** y la skill solo toca §1, §2, §3.

Si el usuario **no** pasa un ID → modo create con el canon. La skill NO inventa códigos JIRA, expedientes ni checkboxes: tocar eso es responsabilidad del gestor Sermas.

## 2. Requisitos mínimos (form)

- **Create**: nombre/carpeta destino, código JIRA + subsistema para construir el filename (`OC_DPE_{JIRA}_ALCANCE_FUNCIONAL_{SUBSISTEMA}`).
- **Update**: URL/ID del DPE del proyecto.
- **Ambos**: contenido textual de:
  - 1.1 Datos Identificativos
  - 1.2 Documentos relacionados (+ tabla `Fichero | Descripción | Localización`)
  - 2.1 Funcionales (+ tabla de requisitos si el usuario la dicta)
  - 2.2 Técnicos
  - 2.3 Otros
  - 2.4 Peticiones relacionadas
  - 2.5 Riesgos (+ tabla 5 columnas)
  - 3.1 Enfoque
  - 3.2 Modelo de datos / Entidades
  - 3.3 Entradas / Salidas
  - 3.4 Otros procesos necesarios
  - 3.5 Prototipo / Diseño de ventanas

Permitir que el usuario genere un subconjunto (ej. solo §1-§2 en un primer batch, §3 después).

## 3. Zona editable vs zona intocable

### NO se toca (responsabilidad del gestor Sermas)

Todas las tablas de la **Hoja de Control del DPE** a partir del encabezado "Datos remitidos por el gestor":

| Tabla | Contenido |
|-------|-----------|
| `DATOS DE LA PETICIÓN` | Código JIRA, código externo, título, aplicación, ámbito, MOTIVACIÓN (checkboxes), CRITICIDAD, URGENCIA, PRIORIDAD, tipo de proyecto |
| `DATOS RELATIVOS AL SEGUIMIENTO DE LA PETICIÓN` | Fecha envío, plazo máximo valoración |
| `DATOS DE ADMINISTRATIVOS` | Expediente, denominación, empresa, contactos |
| `FASE DEL DOCUMENTO ASOCIADO A LA VERSIÓN ACTUAL` | Checkboxes AF / DT / VA + fechas + revisores/aprobadores |
| `Control de Aprobaciones` | Revisores humanos |

### SÍ se toca

| # | Heading 1 | Subsecciones (H2) | Operación |
|---|-----------|---------------------|-----------|
| 1 | INTRODUCCIÓN | 1.1 Datos Identificativos · 1.2 Documentos relacionados | Reescribir cuerpo; rellenar tabla `Fichero/Descripción/Localización` |
| 2 | REQUISITOS SOLICITADOS | 2.1 Funcionales · 2.2 Técnicos · 2.3 Otros · 2.4 Peticiones relacionadas · 2.5 Riesgos | Reescribir cuerpo; rellenar tabla de riesgos |
| 3 | DESCRIPCIÓN FUNCIONAL DE LA SOLUCIÓN | 3.1 Enfoque · 3.2 Modelo de datos · 3.3 Entradas/Salidas · 3.4 Otros procesos · 3.5 Prototipo | Reescribir cuerpo |

Además: **Hoja de Control → Control de cambios** (bump de versión — ver `hoja-control.md`).

## 4. Tablas con formato especial

### 4.1 Documentos relacionados (§1.2)

Cabeceras: `Fichero | Descripción | Localización`. En la plantilla canon viene vacía (solo cabeceras).

**Operación**: por cada documento relacionado que indique el usuario:

```json
{
  "insertTableRow": {
    "tableCellLocation": {
      "tableStartLocation": {"index": TABLE_START},
      "rowIndex": LAST_ROW,
      "columnIndex": 0
    },
    "insertBelow": true
  }
}
```

Re-leer el doc y rellenar las 3 celdas de la nueva fila con `insertText`.

### 4.2 Riesgos identificados (§2.5)

Cabeceras: `Tipo de Riesgo | Descripción del riesgo | Impacto (Muy Alto/Alto/medio/Bajo) | Probabilidad (Muy Alta/Alta/media/Baja) | Medida mitigadora`.

La plantilla ya trae 3 filas con `Tecnológico`, `Funcional`, `Otros` en la primera columna (sin contenido). Estrategia:

- Si el usuario da ≤3 riesgos de categorías Tecnológico/Funcional/Otros → rellenar las filas existentes.
- Si da más → `insertTableRow` por cada riesgo extra y rellenar 5 celdas.

### 4.3 Otras tablas que el usuario puede querer inyectar

- Tabla de **Requisitos funcionales** (`Código | Descripción`): no existe en la plantilla, se puede insertar como tabla nueva bajo §2.1 con `insertTable`:

```json
{
  "insertTable": {
    "location": {"index": INDEX_TRAS_PARRAFO_DE_INTRODUCCION},
    "rows": N_FILAS,
    "columns": 2
  }
}
```

Re-leer y rellenar celdas.

- Tabla de **Requisitos técnicos** (§2.2): igual patrón.

## 5. Placeholders literales

La plantilla canon, al estar pre-rellenada, apenas tiene placeholders `<...>`. Los que quedan en la **zona editable** (a vigilar al generar contenido):

### 5.1 Body

- `<01.00>` en portada → reemplazar con la versión nueva.
- En la fila inicial de "Control de cambios" (v1.00): `<DD/MM/AAAA>`, `<Describir detalladamente...>`, `<Nombre de la persona que creó el documento>` — **si el DPE es nuevo (no rellenado por gestor Sermas), hay que llenarlos con los valores iniciales**. Si es un DPE ya rellenado por Sermas, estos ya están con valores reales.
- Ningún otro placeholder en §1-§3 por defecto (el contenido de ejemplo son frases descriptivas que se borran al reescribir el cuerpo).

En la **zona intocable** sí hay placeholders (ej. `Teléfono:`, `Correo electrónico:` en Datos administrativos) — no tocar.

### 5.2 Footer

- `<Equipo que realiza el documento>` (footer `kix.hf4`) → `BINPAR`.

⚠️ El footer NO se alcanza con un escaneo solo del body. Asegúrate de recorrer `doc.footers` en Step 4.

## 6. Secuencia recomendada de batchUpdate (create mode)

Procesar en 2-3 batches con re-lectura entre ellos:

**Batch 1** — Cuerpos de §3 (índices más altos), descending:
1. §3.5 Prototipo
2. §3.4 Otros procesos
3. §3.3 Entradas/Salidas
4. §3.2 Modelo de datos
5. §3.1 Enfoque

**Batch 2** — §2 y tabla de riesgos:
6. §2.5 Riesgos (cuerpo + rellenar/expandir tabla)
7. §2.4 Peticiones relacionadas
8. §2.3 Otros
9. §2.2 Técnicos
10. §2.1 Funcionales

**Batch 3** — §1 y Hoja de Control:
11. §1.2 Documentos relacionados (cuerpo + tabla)
12. §1.1 Datos Identificativos
13. Bump Hoja de Control (insertTableRow + celdas + portada)

Entre Batch 1 y 2, y entre Batch 2 y 3, re-leer el doc si se usaron `insertTableRow`.

## 7. Update mode

Si el usuario pide actualizar solo ciertas secciones (ej. "refina §2.2 con los nuevos requisitos"):

1. Leer el doc existente.
2. Localizar el heading H2/H1 indicado.
3. Calcular rango `[startIndex_heading_siguiente, startIndex_heading_seleccionado + len(titulo) + 1]` — o sea, el cuerpo entre heading y siguiente heading.
4. `deleteContentRange` + `insertText` con el nuevo contenido.
5. Bump Hoja de Control con motivo = qué se cambió.

Ver `update-flow.md` para el algoritmo general.
