import { z } from 'zod'
import { listSkills, loadSkillWithBase, loadSkillReference } from '../skills/loader.js'

export const listSkillsTool = {
  name: 'list_skills',
  description: 'Lista todos los skills de diseño disponibles. Llama esto antes de use_skill para saber qué puedes cargar.',
  inputSchema: {},
  handler: async () => {
    const skills = listSkills()
    if (skills.length === 0) {
      return {
        content: [{ type: 'text' as const, text: 'No hay skills disponibles. Asegúrate de que existe /skills con archivos .md' }],
      }
    }
    const lines = skills.map(s => `- **${s.name}**${s.isFolder ? ' (carpeta)' : ''}: ${s.description}`)
    return {
      content: [{ type: 'text' as const, text: `Skills disponibles (${skills.length}):\n\n${lines.join('\n')}\n\nUsa use_skill con el nombre exacto para cargar uno.` }],
    }
  },
}

export const useSkillTool = {
  name: 'use_skill',
  description: 'Carga un skill de diseño e inyecta sus instrucciones como contexto. El skill base figma-use se incluye automáticamente (salvo skills con base: none). Para skills en carpeta, pasa reference para cargar una referencia de references/ bajo demanda.',
  inputSchema: {
    skill: z.string().describe('Nombre del skill sin extensión .md. Ejemplos: generate-onboarding, apply-design-system, hu-alx'),
    reference: z.string().optional().describe('Opcional: nombre de una referencia en skills/<skill>/references/ (sin .md). El skill lista las disponibles al cargarse.'),
  },
  handler: async ({ skill, reference }: { skill: string; reference?: string }) => {
    try {
      if (reference) {
        const refContent = loadSkillReference(skill, reference)
        return {
          content: [{ type: 'text' as const, text: `Referencia "${reference}" de la skill "${skill}":\n\n---\n\n${refContent}` }],
        }
      }
      const content = loadSkillWithBase(skill)
      return {
        content: [{ type: 'text' as const, text: `Skill "${skill}" cargado.\n\nSigue estas instrucciones:\n\n---\n\n${content}` }],
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      return {
        content: [{ type: 'text' as const, text: `Error al cargar skill: ${msg}` }],
        isError: true,
      }
    }
  },
}
