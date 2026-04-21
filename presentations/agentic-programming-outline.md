# Programación Agéntica

> Esquema de presentación interna · 30–45 min + Q&A
> Audiencia: devs mixtos (algunos veteranos en agentes, otros nuevos)
> Entregable: slides generadas con `slides-generator`

---

## Objetivos

Al final de la sesión, cada asistente debería:

1. Entender **qué es** programar con agentes (y en qué se diferencia del autocomplete).
2. Saber **cuándo** alcanzar plugin / skill / MCP.
3. Poder ejecutar el **flujo estándar** plan → ejecución en hilo nuevo.
4. Salir con **2 MCPs listos para usar** (Notion + Chrome DevTools).

---

## Estructura global (≈35 min contenido + 10 Q&A)

| Bloque | Slides | Min aprox | Min/slide |
|--------|--------|-----------|-----------|
| Apertura | 1–3 | 4 | ~2 |
| Fundamentos + guidelines | 4–6 | 7 | ~2 |
| Velocidad y calidad | 7–8 | 5 | ~2.5 |
| Ecosistema (plugins/skills/MCPs + Notion + DevTools) | 9–13 | 10 | ~2 |
| Flujo estándar plan→ejecución | 14–17 | 7 | ~2 |
| Cierre | 18–20 | 2 | — |

Total: **20 slides** (incluyendo portada, índice, contacto y cierre). Contenido real: **14-15 slides** para ~35 min → ~2.5 min/slide, tiempo cómodo para hablar.

---

## Convenciones de imágenes

- **SVG concept** → ilustración abstracta/decorativa (Cat. C)
- **SVG diagram** → flujo/arquitectura/proceso (Cat. A)
- **SVG timeline** → secuencia de pasos (Cat. D)
- **SVG data** → comparación/métrica visual (Cat. B)

Todas las imágenes se generan con la pipeline de subagentes SVG → PNG → Drive de `slides-generator`.

---

## Slide-by-slide

### Slide 1 · Portada
- **Layout:** TITLE
- **Título:** Programación Agéntica
- **Subtítulo:** Cómo trabajamos con Codex y Claude
- **Notas ponente:** Saludo + encuadre. "Hoy no venimos a hablar de IA en abstracto, sino de cómo la metemos en nuestro flujo real."

---

### Slide 2 · Índice
- **Layout:** TOC (auto-generado)

---

### Slide 3 · El shift
- **Layout:** MAIN_POINT
- **Mensaje:** "No es autocomplete con esteroides. Es un colaborador con agencia."
- **Notas:** Antes la IA sugería líneas. Ahora le das un objetivo y decide qué leer, qué cambiar, qué testear. Ese salto de *sugerencia* a *acción* es el tema de la charla. Mencionar brevemente los 4 factores que lo hicieron posible: contexto de 1M tokens, tool use maduro, ecosistema MCP, coste en picado.

---

### Slide 4 · ¿Qué es un agente de código?
- **Layout:** 2 Cols + Image  → **SVG diagram** del loop
- **Columna texto:**
  - LLM + herramientas + loop de decisión
  - Razona → elige tool → observa → decide → itera
  - No ejecuta ciegamente: verifica y corrige
- **SVG:** diagrama circular del loop `prompt → plan → tool call → observation → decide → …` con flechas y 5 nodos.
- **Notas:** Desarrollar el loop, poner un ejemplo concreto (p.ej. "arreglar un test"). Insistir en que el loop es la diferencia clave con un chatbot plano.

---

### Slide 5 · Codex vs Claude Code
- **Layout:** Two Columns
- **Codex:**
  - CLI de OpenAI, terminal-first
  - Fuerte en ejecución directa y shell
  - Configuración vía `AGENTS.md`
- **Claude Code:**
  - CLI de Anthropic, multi-superficie (terminal, VS Code, JetBrains, web)
  - Fuerte en planificación larga, sub-agentes, skills
  - Configuración vía `CLAUDE.md`
- **Notas:** No es "cuál es mejor", es "para qué cada uno". En nuestro día a día conviven.

---

### Slide 6 · Las 5 guidelines no negociables
- **Layout:** Special List
- **Items:**
  1. **Contexto es rey.** `AGENTS.md` / `CLAUDE.md` al día, siempre.
  2. **Intent, no código.** Pide *qué quieres conseguir*, no *qué líneas escribir*.
  3. **Plan antes de ejecutar.** Markdown primero, código después.
  4. **Verifica, no confíes.** Lee el diff, corre los tests, mira el navegador.
  5. **Commits atómicos.** Un paso del plan = un commit.
- **Notas:** Si alguien sólo se lleva una slide, que sea esta. Dedicarle minuto y medio, explicando el *por qué* de cada guideline.

---

### Slide 7 · Velocidad y calidad no son un tradeoff
- **Layout:** MAIN_POINT
- **Mensaje:** "Rápido vs bien era un tradeoff humano. Con agentes deja de serlo."
- **Notas:** El humano que va rápido salta tests. El agente que va rápido los genera en paralelo con la feature. La velocidad ya no se paga en deuda técnica — **si el flujo es bueno**.

---

### Slide 8 · Caso real #1 · "La entrevista que trabaja dos veces"
- **Layout:** 2 Cols + Image → **SVG diagram** (flujo del caso)
- **Columna texto:**
  - **Problema:** preparar una estimación detallada para un cliente.
  - **Flujo aplicado:**
    1. Modo *entrevista* en Codex → el agente pregunta hasta entender el alcance.
    2. Salida en markdown → se publica en Notion para cliente y equipo.
    3. Semanas después, **el mismo markdown** alimenta el plan de implementación.
  - **Resultado:** cero re-trabajo entre fase comercial y fase técnica. El análisis no se tira, se ejecuta.
- **SVG diagram:** 4 nodos horizontales — `Entrevista Codex` → `markdown` → `Notion (cliente + equipo)` → `Implementación (mismo md como plan)`. Flecha de vuelta mostrando que el md se reutiliza.
- **Notas:** Este es el mejor ejemplo de por qué "velocidad y calidad dejan de ser tradeoff". La entrevista parece lenta al principio, pero produce un artefacto (md) que sirve para vender *y* para construir. Un input, dos fases de valor.

---

### Slide 9 · El ecosistema en 3 bloques
- **Layout:** 2 Blocks + Images (2 imágenes) o Cards Group (3 tarjetas)
- **Opción elegida:** Cards Group con 3 tarjetas
- **Tarjetas:**
  - **Plugins** — extienden el CLI (comandos, UI, integraciones IDE)
  - **Skills** — recetas reutilizables en markdown que el agente invoca
  - **MCPs** — servidores que exponen herramientas de sistemas externos
- **Notas:** La confusión más habitual es tratarlos como intercambiables. No lo son.

---

### Slide 10 · ¿Cuándo uso qué?
- **Layout:** Table of Concepts
- **Tabla:**

  | Necesito… | Uso |
  |-----------|-----|
  | Comando nuevo `/x` o cambiar la UI del CLI | **Plugin** |
  | Procedimiento reutilizable (generar slides, triage Gmail, crear PR) | **Skill** |
  | Acceso a sistema externo (Notion, browser, Jira, DB) | **MCP** |
  | "Cada vez que X, haz Y" con lógica propia | **Skill** + hook |

- **Notas:** Regla mental → plugin = *capability estática*, skill = *procedimiento*, MCP = *puente al mundo*. Mencionar skills del repo `binpar-skills` como ejemplos reales de "procedimiento" (slides-generator, doc-generator, email-sender, binpar-setup).

---

### Slide 11 · Notion MCP ⭐
- **Layout:** 2 Cols + Image → **SVG diagram**
- **Columna texto:**
  - Buscar, leer, crear, editar páginas **sin salir del terminal**
  - Ideal para specs, retros, onboarding, ADRs
  - Caso típico: "lee el ticket en Notion → genera el plan → ejecuta"
- **SVG diagram:** 3 nodos horizontales — `Notion (ticket)` → `Agente` → `Repo (PR)`, con flechas bidireccionales hacia Notion (lectura + actualización de estado).
- **Notas:** Demo corta en vivo: buscar un ticket real, extraer requisitos, crear plan. (Si no hay tiempo, dejar como "lo enseño al final en el Q&A").

---

### Slide 12 · Chrome DevTools MCP · caso real #2
- **Layout:** 2 Cols + Image → **SVG diagram** (el caso real)
- **Columna texto:**
  - **Capacidades:** navega, click, evalúa JS, lee network y consola, lighthouse, performance traces.
  - **Caso real — testing sintético de chatbot:**
    - **200 sesiones** de chat ejecutadas automáticamente contra nuestro chatbot.
    - **Chrome DevTools MCP** orquesta la interacción (abrir, escribir, enviar, leer respuesta).
    - **Directus MCP** persiste y consulta los mensajes generados.
    - El agente analiza el corpus y saca estadísticas (latencia, calidad de respuesta, fallos).
  - **Lo que demuestra:** dos MCPs coordinados pueden reemplazar una suite de QA manual.
- **SVG diagram:** Agente (centro) con dos brazos: hacia `Chrome (200 sesiones)` y hacia `Directus (persistencia + query)`, confluyendo en `Análisis + estadísticas`.
- **Notas:** Esto no es un "demo de juguete" — es automatización de QA real a una escala que manualmente sería inviable. El punto clave: coordinación de múltiples MCPs en un mismo flujo. Aquí Alberto puede mostrar un snippet del reporte generado si lo tiene a mano.

---

### Slide 13 · Otros MCPs que ya usamos
- **Layout:** Four Blocks (2×2)
- **Bloques:**
  - **Filesystem / Git** — base, siempre activos.
  - **Directus** — leer/escribir datos de nuestro CMS (caso slide 12).
  - **Scheduled Tasks / MCP Registry** — automatización recurrente y descubrimiento de conectores bajo demanda.
  - **Custom internos** — cualquier API nuestra puede exponerse como MCP en horas.
- **Notas:** El catálogo crece solo. Si un sistema externo no está expuesto todavía, se expone. Ejemplo concreto: Directus apareció como MCP porque lo necesitábamos para el caso del chatbot.

---

### Slide 14 · El flujo estándar (no es magia, es orden)
- **Layout:** Special List con timeline → **SVG timeline** en imagen acompañante (opcional; se puede hacer 2 Cols + Image)
- **Alternativa recomendada:** 2 Cols + Image → **SVG timeline** de 3 pasos
- **Columna texto — las 3 fases:**
  1. **Planificación.** Entrevista con el agente hasta que el plan esté claro.
  2. **Documentación.** Plan escrito en markdown, commiteado al repo.
  3. **Ejecución.** Hilo nuevo que toma el plan como input.
- **SVG timeline:** 3 nodos horizontales "Plan (entrevista)" → "Markdown commiteado" → "Ejecución hilo nuevo", cada uno con icono representativo.
- **Notas:** Este flujo no es BinPar, es el estándar en agentic programming. La separación entre plan y ejecución es lo que convierte velocidad en calidad. Antipatrón que **no** hacemos: abrir el agente y escribir "implementa X".

---

### Slide 15 · Fase 1 · Entrevista con el agente
- **Layout:** Plain Text + Quote
- **Contenido:**
  - Arrancar al agente en modo *plan*, no *act*
  - Él pregunta, tú respondes — no al revés
  - Objetivo: disolver ambigüedades **antes** de tocar código
  - Señales de plan listo: sin preguntas pendientes + archivos concretos identificados + criterios de éxito definidos
- **Quote:** "Un buen plan es aquel que otro agente, en otro hilo, podría ejecutar sin volver a preguntarte."
- **Notas:** Es contraintuitivo al principio — cuesta resistir la tentación de "ya que estamos, hazlo". Pero el tiempo en entrevista se recupera x10 en ejecución.

---

### Slide 16 · Fase 2 · Anatomía del plan en markdown
- **Layout:** 2 Cols + Image → **SVG concept** (ejemplo de plan.md)
- **Columna texto:**
  - Objetivo (1 frase)
  - Contexto / archivos relevantes
  - Pasos numerados con criterio de "hecho"
  - Tests / verificación
  - Out of scope (explícito)
- **SVG concept:** mockup estilizado de un `plan.md` renderizado, con secciones destacadas en color acento.
- **Notas:** El plan es un artefacto versionado. Si cambia el approach, se actualiza el plan, no la memoria del agente. Eso hace el trabajo reproducible.

---

### Slide 17 · Fase 3 · Ejecución en hilo nuevo
- **Layout:** 2 Cols + Image → **SVG diagram** del handoff
- **Columna texto:**
  - Contexto limpio = mejor rendimiento
  - Input: `plan.md` + repo. Output: commits atómicos + diff verificable
  - Si se desvía → para, actualiza el plan, relanza
  - **Ventaja clave:** paralelización — 3 planes distintos, 3 hilos, 0 colisión
- **SVG diagram:** Hilo 1 (con plan) → commit del plan → nuevo hilo limpio que lee plan + repo → commits atómicos. Mostrar la "frontera" entre ambos hilos.
- **Notas:** Esta slide explica por qué la fase 3 existe separada. Sin hilo nuevo, el contexto del agente se pudre con la conversación de planificación.

---

### Slide 18 · 3 takeaways
- **Layout:** Special List
- **Items:**
  1. **Plan antes de código, siempre.** Markdown es tu nuevo estándar.
  2. **Plugin, skill, MCP — sabe cuál.** No son intercambiables.
  3. **Velocidad y calidad dejaron de pelearse** — si el flujo es bueno.
- **Notas:** Resumen a viva voz, dejar que asienten.

---

### Slide 19 · Próximos pasos + recursos
- **Layout:** Plain Text + Quote
- **Contenido:**
  - Instalar `binpar-setup` si no lo tienes
  - Probar Notion MCP en tu próximo ticket
  - Generar tu primer `plan.md` para cualquier tarea > 1h
  - Contribuir una skill al repo `binpar-skills`
- **Quote:** link al repo + canal Slack de agentic-programming + esta presentación en drive

---

### Slide 20 · Contacto + cierre
- **Layout:** Contact (template slide 13), seguido del Closing (template 14)
- Datos: ⭐ **pendientes** (nombre, rol, teléfono, email).

---

## Resumen de imágenes a generar (8 SVGs)

| # | Slide | Categoría | Contenido |
|---|-------|-----------|-----------|
| 1 | 4 · Loop del agente | Diagram | Loop circular de 5 nodos |
| 2 | 8 · Caso entrevista → Notion → implementación | Diagram | 4 nodos con reuso del md |
| 3 | 11 · Notion MCP | Diagram | Notion ↔ Agente ↔ Repo |
| 4 | 12 · Chatbot testing sintético | Diagram | Agente + DevTools + Directus → stats |
| 5 | 14 · Flujo estándar | Timeline | 3 pasos horizontales |
| 6 | 16 · Plan markdown | Concept | Mockup de plan.md |
| 7 | 17 · Ejecución hilo nuevo | Diagram | Handoff plan → hilo limpio |
| — | — | — | *(eliminado — 7 SVGs totales)* |

**Nota técnica:** Todos se generan en paralelo con subagentes (ver `slides-generator`, Step 7). Paleta: fondo dark navy `#222033`, acento orange `#FD9D00`, texto white.

---

## Slots pendientes

✅ Caso real #1 (slide 8) — integrado: entrevista Codex → md → Notion → implementación.
✅ Caso real #2 (slide 12) — integrado: 200 sesiones chatbot con Chrome DevTools + Directus MCP.
⭐ **Slide 20 — Contacto**: nombre, rol, teléfono, email. *(Pendiente)*

Si no me pasas el contacto, uso el de Alberto Blanco por defecto y lo editas en Google Slides.

---

## Configuración para generar

- **Skill:** `slides-generator`
- **Template:** BinPar dark (`1930-cBpaLoe7F-sRoWy_XB5Xj2wEwXWc8MYvAOvuAxA`)
- **Idioma:** Español
- **Speaker notes:** Sí
- **Total slides:** 20 (3 son auto: TOC + contact + closing)
- **SVGs a generar:** 7 (en paralelo)
- **Carpeta destino Drive:** pendiente
