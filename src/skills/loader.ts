import { readFileSync, readdirSync, existsSync, statSync } from 'fs'
import { join, resolve, sep } from 'path'
import { PACKAGE_ROOT } from '../core/resolve-package-root.js'

const DEFAULT_SKILLS_DIR = join(PACKAGE_ROOT, 'skills')

// Nombres de skill y de referencia: kebab-case, sin rutas (evita path traversal)
const SAFE_NAME = /^[a-z0-9][a-z0-9-]*$/

export interface SkillManifest {
  name: string
  description: string
  path: string
  /** true si la skill es una carpeta con SKILL.md (puede tener references/ y assets/) */
  isFolder: boolean
}

export interface Skill extends SkillManifest {
  content: string
  /** Frontmatter parseado (name, description, base, credit, ...) */
  meta: Record<string, string>
  /** Referencias disponibles en references/*.md (sin extensión) */
  references: string[]
  /** Ruta absoluta a assets/ si existe */
  assetsDir: string | null
}

/**
 * Frontmatter YAML mínimo: `clave: valor` y bloques plegados `clave: >` / `clave: |`
 * con líneas indentadas. Suficiente para name/description/base/credit; no es YAML completo.
 */
export function parseFrontmatter(raw: string): { meta: Record<string, string>; body: string } {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?/)
  if (!match) return { meta: {}, body: raw }
  const meta: Record<string, string> = {}
  const lines = match[1].split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const kv = lines[i].match(/^([A-Za-z0-9_-]+):\s*(.*)$/)
    if (!kv) continue
    const [, key, rest] = kv
    if (rest === '>' || rest === '|' || rest === '>-' || rest === '|-') {
      const block: string[] = []
      while (i + 1 < lines.length && (/^\s+/.test(lines[i + 1]) || lines[i + 1] === '')) {
        block.push(lines[++i].trim())
      }
      meta[key] = rest.startsWith('>') ? block.filter(Boolean).join(' ') : block.join('\n')
    } else {
      meta[key] = rest.replace(/^["']|["']$/g, '')
    }
  }
  return { meta, body: raw.slice(match[0].length) }
}

/** Descripción: frontmatter `description`, o la primera línea de texto que no sea encabezado. */
function describe(raw: string): string {
  const { meta, body } = parseFrontmatter(raw)
  if (meta.description) return meta.description
  for (const line of body.split('\n')) {
    const t = line.trim()
    if (t && !t.startsWith('#')) return t
  }
  return ''
}

function assertSafeName(kind: string, name: string): void {
  if (!SAFE_NAME.test(name)) {
    throw new Error(`Nombre de ${kind} inválido: "${name}". Usa kebab-case sin rutas (ej. generate-docsite).`)
  }
}

/** Confirma que la ruta resuelta no se sale del directorio base. */
function insideDir(baseDir: string, target: string): boolean {
  const base = resolve(baseDir) + sep
  return resolve(target).startsWith(base)
}

/** Ubica una skill como `<name>.md` o `<name>/SKILL.md`. */
function locateSkill(name: string, skillsDir: string): { path: string; isFolder: boolean } | null {
  const filePath = join(skillsDir, `${name}.md`)
  if (existsSync(filePath)) return { path: filePath, isFolder: false }
  const folderPath = join(skillsDir, name, 'SKILL.md')
  if (existsSync(folderPath)) return { path: folderPath, isFolder: true }
  return null
}

export function listSkills(skillsDir: string = DEFAULT_SKILLS_DIR): SkillManifest[] {
  if (!existsSync(skillsDir)) return []
  const manifests: SkillManifest[] = []
  for (const entry of readdirSync(skillsDir)) {
    const entryPath = join(skillsDir, entry)
    if (entry.endsWith('.md') && statSync(entryPath).isFile()) {
      manifests.push({ name: entry.slice(0, -3), description: describe(readFileSync(entryPath, 'utf-8')), path: entryPath, isFolder: false })
    } else if (statSync(entryPath).isDirectory() && existsSync(join(entryPath, 'SKILL.md'))) {
      const skillPath = join(entryPath, 'SKILL.md')
      manifests.push({ name: entry, description: describe(readFileSync(skillPath, 'utf-8')), path: skillPath, isFolder: true })
    }
  }
  return manifests.sort((a, b) => a.name.localeCompare(b.name))
}

export function loadSkill(name: string, skillsDir: string = DEFAULT_SKILLS_DIR): Skill {
  const cleanName = name.replace(/\.md$/, '')
  assertSafeName('skill', cleanName)
  const located = locateSkill(cleanName, skillsDir)
  if (!located) {
    const available = listSkills(skillsDir).map(s => s.name).join(', ')
    throw new Error(`Skill "${cleanName}" no encontrado. Disponibles: ${available}`)
  }
  const content = readFileSync(located.path, 'utf-8')
  const { meta } = parseFrontmatter(content)
  const folder = join(skillsDir, cleanName)
  const referencesDir = join(folder, 'references')
  const references = located.isFolder && existsSync(referencesDir)
    ? readdirSync(referencesDir).filter(f => f.endsWith('.md')).map(f => f.slice(0, -3)).sort()
    : []
  const assetsDir = located.isFolder && existsSync(join(folder, 'assets')) ? resolve(folder, 'assets') : null
  return {
    name: cleanName,
    description: describe(content),
    path: located.path,
    isFolder: located.isFolder,
    content,
    meta,
    references,
    assetsDir,
  }
}

/** Carga `skills/<skill>/references/<reference>.md` (lectura por fase, bajo demanda). */
export function loadSkillReference(skill: string, reference: string, skillsDir: string = DEFAULT_SKILLS_DIR): string {
  assertSafeName('skill', skill)
  const cleanRef = reference.replace(/\.md$/, '')
  assertSafeName('referencia', cleanRef)
  const loaded = loadSkill(skill, skillsDir)
  const refPath = join(skillsDir, skill, 'references', `${cleanRef}.md`)
  if (!insideDir(skillsDir, refPath) || !existsSync(refPath)) {
    const available = loaded.references.length ? loaded.references.join(', ') : '(ninguna)'
    throw new Error(`Referencia "${cleanRef}" no existe en la skill "${skill}". Disponibles: ${available}`)
  }
  return readFileSync(refPath, 'utf-8')
}

/** Pie con las referencias y assets de una skill en carpeta, para que el agente sepa qué más cargar. */
function folderFooter(skill: Skill): string {
  if (!skill.isFolder) return ''
  const parts: string[] = []
  if (skill.references.length) {
    parts.push(`Referencias disponibles (cárgalas con use_skill { skill: "${skill.name}", reference: "<nombre>" } solo cuando la fase lo pida): ${skill.references.join(', ')}`)
  }
  if (skill.assetsDir) {
    parts.push(`Assets de la skill (plantillas, fuentes; cópialos al proyecto de salida): ${skill.assetsDir}`)
  }
  return parts.length ? `\n\n---\n\n${parts.join('\n\n')}` : ''
}

/**
 * Carga una skill con la base figma-use antepuesta, salvo que la propia skill sea figma-use
 * o declare `base: none` en su frontmatter (skills que no operan sobre Figma, ej. hu-alx).
 */
export function loadSkillWithBase(name: string, skillsDir: string = DEFAULT_SKILLS_DIR): string {
  const skill = loadSkill(name, skillsDir)
  const skipBase = skill.name === 'figma-use' || skill.meta.base === 'none'
  const base = skipBase ? '' : (() => {
    try { return loadSkill('figma-use', skillsDir).content + '\n\n---\n\n' }
    catch { return '' }
  })()
  return base + skill.content + folderFooter(skill)
}
