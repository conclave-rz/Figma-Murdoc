import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'fs'
import { join } from 'path'
import { tmpdir } from 'os'
import {
  listSkills,
  loadSkill,
  loadSkillReference,
  loadSkillWithBase,
  parseFrontmatter,
} from '../src/skills/loader'

describe('skills loader v3', () => {
  let dir: string

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'murdoc-skills-'))
    writeFileSync(join(dir, 'figma-use.md'), '# figma-use\n\nBase de Figma.\n')
    writeFileSync(join(dir, 'flat-skill.md'), '# flat-skill\n\nSkill de un solo archivo.\n')
    // Skill en carpeta con frontmatter plegado, references/ y assets/
    mkdirSync(join(dir, 'folder-skill', 'references'), { recursive: true })
    mkdirSync(join(dir, 'folder-skill', 'assets'), { recursive: true })
    writeFileSync(
      join(dir, 'folder-skill', 'SKILL.md'),
      '---\nname: folder-skill\ndescription: >\n  Skill en carpeta\n  con descripción plegada.\n---\n\n# Folder\n\nCuerpo.\n',
    )
    writeFileSync(join(dir, 'folder-skill', 'references', 'fase-uno.md'), '# Fase uno\n')
    // Skill sin base figma-use
    mkdirSync(join(dir, 'no-base'))
    writeFileSync(join(dir, 'no-base', 'SKILL.md'), '---\nname: no-base\ndescription: "Sin Figma"\nbase: none\n---\n\nTexto.\n')
  })

  afterAll(() => rmSync(dir, { recursive: true, force: true }))

  it('lista skills de archivo y de carpeta', () => {
    const names = listSkills(dir).map(s => s.name)
    expect(names).toEqual(['figma-use', 'flat-skill', 'folder-skill', 'no-base'])
    expect(listSkills(dir).find(s => s.name === 'folder-skill')?.isFolder).toBe(true)
  })

  it('lee la descripción del frontmatter (bloque plegado) y no la línea ---', () => {
    const folder = listSkills(dir).find(s => s.name === 'folder-skill')
    expect(folder?.description).toBe('Skill en carpeta con descripción plegada.')
    expect(listSkills(dir).find(s => s.name === 'flat-skill')?.description).toBe('Skill de un solo archivo.')
  })

  it('parsea valores entre comillas', () => {
    expect(parseFrontmatter('---\ndescription: "Hola"\n---\nx').meta.description).toBe('Hola')
  })

  it('expone referencias y assets de una skill en carpeta', () => {
    const skill = loadSkill('folder-skill', dir)
    expect(skill.references).toEqual(['fase-uno'])
    expect(skill.assetsDir).toContain(join('folder-skill', 'assets'))
    expect(loadSkillWithBase('folder-skill', dir)).toContain('fase-uno')
  })

  it('carga una referencia bajo demanda', () => {
    expect(loadSkillReference('folder-skill', 'fase-uno', dir)).toContain('# Fase uno')
  })

  it('falla con mensaje útil si la referencia no existe', () => {
    expect(() => loadSkillReference('folder-skill', 'no-existe', dir)).toThrow(/Disponibles: fase-uno/)
  })

  it('rechaza path traversal en skill y referencia', () => {
    expect(() => loadSkill('../etc/passwd', dir)).toThrow(/inválido/)
    expect(() => loadSkillReference('folder-skill', '../SKILL', dir)).toThrow(/inválido/)
  })

  it('antepone figma-use salvo con base: none', () => {
    expect(loadSkillWithBase('flat-skill', dir)).toContain('Base de Figma.')
    expect(loadSkillWithBase('no-base', dir)).not.toContain('Base de Figma.')
  })

  it('las skills reales del repo cargan sin error', () => {
    const real = listSkills()
    expect(real.length).toBeGreaterThan(20)
    expect(real.map(s => s.name)).toContain('html-to-figma')
    for (const s of real) expect(s.description).not.toBe('---')
  })
})
