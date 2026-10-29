---
title: Consulta clínica con ==evidencia visible.==
eyebrow: Propuesta técnica
subtitle: Despliegue de la plataforma BinPar en el servicio de Medicina Interna, con fuentes trazables y gobierno del conocimiento clínico.
client: Hospital Universitario de Ejemplo
version: "1.0"
date: 29 de octubre de 2026
author: Equipo de BinPar
confidential: true
short_title: Propuesta técnica · Medicina Interna
---

# Resumen ejecutivo

La consulta de guías y protocolos consume tiempo clínico y depende de documentos dispersos. Esta propuesta describe el despliegue de la plataforma en el servicio de Medicina Interna durante doce semanas, con un corpus validado por el propio servicio y un umbral de revisión definido antes de la puesta en marcha.

<div class="kpis">
  <div class="kpi"><b>12 semanas</b><span>Desde el arranque hasta el uso en consulta</span></div>
  <div class="kpi"><b>3 fases</b><span>Corpus, validación y despliegue</span></div>
  <div class="kpi"><b>100 %</b><span>Respuestas con la fuente enlazada</span></div>
</div>

> El sistema ordena la evidencia; la decisión clínica sigue siendo del profesional.

# Contexto

## Situación de partida

El servicio trabaja con guías de sociedades científicas, protocolos propios y documentación de farmacia. Las versiones conviven en carpetas compartidas y no siempre es posible saber cuál está vigente.

## Objetivos

1. Reducir el tiempo de localización de una recomendación concreta.
2. Garantizar que cada respuesta enlaza el ==fragmento de la fuente== que la respalda.
3. Establecer un procedimiento de publicación y versionado del corpus.

> [!NOTE]
> El corpus inicial lo selecciona el servicio. BinPar no incorpora documentos sin su validación.

# Alcance y plan de trabajo

## Fases

| Fase | Semanas | Entregable | Responsable |
|---|---:|---|---|
| Corpus | 1–4 | Inventario de fuentes vigentes y versionadas | Servicio + BinPar |
| Validación | 5–8 | Batería de preguntas de control superada | Comité clínico |
| Despliegue | 9–12 | Plataforma en uso en consulta | BinPar |

## Fuera de alcance

- Integración con la historia clínica electrónica.
- Documentación de otros servicios del hospital.

> [!WARNING] Requisito previo
> El servicio debe designar un responsable del corpus antes de la semana 1.

# Indicadores

<div class="chart">
  <p class="eyebrow">Benchmark · Tiempo de respuesta</p>
  <p class="chart-title">La consulta responde antes que la media</p>
  <svg viewBox="0 0 520 150" role="img" aria-label="Tiempo de respuesta por organización">
    <g stroke="rgb(0 117 149 / 18%)" stroke-dasharray="4 4"><line x1="110" x2="110" y1="0" y2="128"/><line x1="200" x2="200" y1="0" y2="128"/><line x1="290" x2="290" y1="0" y2="128"/><line x1="380" x2="380" y1="0" y2="128"/><line x1="470" x2="470" y1="0" y2="128"/></g>
    <g font-size="10" fill="#62748E">
      <text x="102" y="20" text-anchor="end" fill="#05215E" font-weight="600">Tu organización</text>
      <rect x="110" y="9" width="216" height="15" rx="4" fill="#006D79"/><text x="332" y="20" fill="#05215E" font-weight="600">2,4 s</text>
      <text x="102" y="56" text-anchor="end">Hospital A</text>
      <rect x="110" y="45" width="279" height="15" rx="4" fill="#CAD5E2"/><text x="395" y="56">3,1 s</text>
      <text x="102" y="92" text-anchor="end">Hospital B</text>
      <rect x="110" y="81" width="324" height="15" rx="4" fill="#CAD5E2"/><text x="440" y="92">3,6 s</text>
      <g text-anchor="middle"><text x="110" y="146">0 s</text><text x="200" y="146">1 s</text><text x="290" y="146">2 s</text><text x="380" y="146">3 s</text><text x="470" y="146">4 s</text></g>
    </g>
  </svg>
</div>

| Indicador | Línea base | Objetivo |
|---|---:|---:|
| Tiempo hasta localizar la recomendación | 6 min | < 1 min |
| Respuestas con fuente enlazada | — | 100 % |
| Preguntas de control superadas | — | ≥ 95 % |

# Condiciones

La propuesta tiene una validez de 60 días desde la fecha de emisión. Los importes no incluyen IVA.

<div class="signature">
  <div><b>Por BinPar</b>Nombre y cargo</div>
  <div><b>Por el hospital</b>Nombre y cargo</div>
</div>
