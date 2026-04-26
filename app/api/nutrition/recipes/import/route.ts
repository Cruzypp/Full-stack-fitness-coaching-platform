import { NextRequest, NextResponse } from 'next/server'
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist/legacy/build/pdf.mjs'
import type { RecipeCategory } from '../../../../types/nutrition'

// Resolve worker path — webpack 5 / Node.js ESM understand this pattern
GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/legacy/build/pdf.worker.mjs',
  import.meta.url
).href

const VALID_CATEGORIES: RecipeCategory[] = ['desayuno', 'comida', 'cena', 'snack', 'colacion']
const MAX_RECIPES = 50

function getField(block: string, key: string): string | undefined {
  const match = block.match(new RegExp(`^${key}:\\s*(.+)`, 'im'))
  return match?.[1]?.trim()
}

// Collect all lines belonging to a section (stops at next ALL-CAPS header)
function getSection(lines: string[], key: string): string[] {
  const result: string[] = []
  let inside = false
  for (const line of lines) {
    if (new RegExp(`^${key}:\\s*$`, 'i').test(line)) { inside = true; continue }
    if (inside) {
      if (/^[A-ZÁÉÍÓÚÑ]{2,}[A-ZÁÉÍÓÚÑA-Z ]*:/i.test(line)) break
      result.push(line)
    }
  }
  return result
}

function parseRecipes(text: string) {
  const normalized = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n')
  const blocks = normalized.split(/^---+$/m).map((b) => b.trim()).filter(Boolean)

  const recipes = []

  for (const block of blocks) {
    const name = getField(block, 'RECETA')
    const categoryRaw = getField(block, 'CATEGORIA')?.toLowerCase()
    if (!name || !categoryRaw) continue
    if (!VALID_CATEGORIES.includes(categoryRaw as RecipeCategory)) continue

    const lines = block.split('\n')

    // Parse multi-line sections line by line (avoids $ multiline flag bug)
    const ingLines = getSection(lines, 'INGREDIENTES')
    const ingredients = ingLines
      .map((l) => l.replace(/^[-*•]\s*/, '').trim())
      .filter(Boolean)
      .map((raw) => {
        const m = raw.match(/^([\d.,/]+)\s*([a-zA-ZáéíóúÁÉÍÓÚgGkKmMlL]+)?\s+(.+)$/)
        if (m) return { amount: m[1], unit: m[2] ?? '', name: m[3].trim() }
        return { amount: '', unit: '', name: raw }
      })

    const instrLines = getSection(lines, 'INSTRUCCIONES')
    const instructions = instrLines.join(' ').trim() || null

    const calStr = getField(block, 'CALORIAS')
    const protStr = getField(block, 'PROTEINAS')
    const carbStr = getField(block, 'CARBOHIDRATOS')
    const fatStr = getField(block, 'GRASAS')
    const tagsRaw = getField(block, 'TAGS')

    recipes.push({
      name,
      category: categoryRaw as RecipeCategory,
      description: getField(block, 'DESCRIPCION') ?? null,
      calories: calStr ? parseInt(calStr) : null,
      protein_g: protStr ? parseFloat(protStr) : null,
      carbs_g: carbStr ? parseFloat(carbStr) : null,
      fats_g: fatStr ? parseFloat(fatStr) : null,
      ingredients,
      instructions,
      tags: tagsRaw ? tagsRaw.split(',').map((t) => t.trim()).filter(Boolean) : [],
    })

    if (recipes.length >= MAX_RECIPES) break
  }

  return recipes
}

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const file = formData.get('file') as File | null

  if (!file) {
    return NextResponse.json({ error: 'No se recibió ningún archivo.' }, { status: 400 })
  }

  if (file.type !== 'application/pdf') {
    return NextResponse.json({ error: 'Solo se aceptan archivos PDF.' }, { status: 400 })
  }

  const buffer = Buffer.from(await file.arrayBuffer())

  let text: string
  try {
    const loadingTask = getDocument({ data: new Uint8Array(buffer) })
    const pdf = await loadingTask.promise
    const pages: string[] = []
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i)
      const content = await page.getTextContent()
      // Use hasEOL to detect real line breaks; items on the same line get joined with ''
      const pageText = content.items
        .map((item) => {
          if (!('str' in item)) return ''
          return item.str + (item.hasEOL ? '\n' : '')
        })
        .join('')
      pages.push(pageText)
    }
    text = pages.join('\n')
    await pdf.destroy()
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('[pdf-import]', msg)
    return NextResponse.json({ error: `Parse error: ${msg}` }, { status: 422 })
  }

  const recipes = parseRecipes(text)

  if (recipes.length === 0) {
    return NextResponse.json({ error: 'No se encontraron recetas válidas en el PDF. Revisa el formato.' }, { status: 422 })
  }

  return NextResponse.json({ recipes, count: recipes.length })
}
