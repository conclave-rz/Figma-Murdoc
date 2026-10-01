# Créditos

## ALX
Autor del pack de skills de producto y documentación integrado en Murdoc v3:

| Skill en Murdoc | Origen | Adaptaciones de Murdoc |
|---|---|---|
| `hu-alx` | hu-alx | Frontmatter `base: none`; sección "Integración con Murdoc" (carga de referencias, paso a `mission-planner`/`generate-screen`). Contenido original intacto. |
| `docu-alx` | docu-alx (con su plantilla `site-template`) | Frontmatter `base: none`; sección "Integración con Murdoc" (capturas reales desde Figma, verificación local). Contenido original intacto. |
| `generate-docsite` | figma-uikit-docsite v2 | Dividida en referencias por fase; tools nativas de Murdoc; `tokens.json` en DTCG vía `figma_export_tokens` (antes Style Dictionary plano); verificación con `scripts/verify-site.mjs` (Chrome local vía `puppeteer-core`) en vez de Playwright con rutas del sandbox de Linux; entrega por ruta/ZIP en vez de `SendUserFile`. |
| `ai-ready-audit` | Scorecard AI-Ready de figma-uikit-docsite v2 | Extraído como skill independiente; se agrega el modo Figma (las 8 dimensiones medidas sobre el archivo). |

El proyecto ToolKit de ALX es la barra de calidad de `generate-docsite`.

## Upstream
Murdoc es un fork de [southleft/figma-console-mcp](https://github.com/southleft/figma-console-mcp) (MIT).
