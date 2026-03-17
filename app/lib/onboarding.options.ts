/**
 * Opciones de UI para los campos de selección del formulario de onboarding.
 *
 * Separado del schema Zod para que los componentes puedan importar
 * solo las opciones sin cargar la lógica de validación.
 */

// ── Medicamentos ──────────────────────────────────────────────────────────
export const medicationOptions = [
  "Metformina", "Insulina", "Levotiroxina", "Omeprazol",
  "Losartán", "Enalapril", "Atorvastatina", "Aspirina",
  "Ibuprofeno", "Paracetamol", "Anticonceptivos orales",
  "Antidepresivos", "Ansiolíticos", "Corticosteroides",
  "Antihistamínicos", "Antibióticos (recurrentes)", "Diuréticos",
  "Anticoagulantes", "Otro",
] as const

// ── Suplementos ───────────────────────────────────────────────────────────
export const supplementOptions = [
  "Proteína", "Caseína", "Creatina", "BCAA", "Glutamina",
  "Pre-entreno", "Omega-3", "Multivitamínico", "Vitamina D",
  "Vitamina C", "Zinc", "Magnesio", "Hierro", "Colágeno",
  "L-Carnitina", "CLA", "Beta-alanina", "Cafeína", "Melatonina",
  "Probióticos", "Otro",
] as const

// ── Condiciones médicas ───────────────────────────────────────────────────
export const conditionOptions = [
  "Diabetes tipo 1", "Diabetes tipo 2", "Hipotiroidismo",
  "Hipertiroidismo", "Hipertensión", "Colesterol alto",
  "Triglicéridos altos", "Síndrome de ovario poliquístico (SOP)",
  "Resistencia a la insulina", "Hipoglucemia", "Gastritis",
  "Colon irritable", "Reflujo gastroesofágico", "Anemia",
  "Osteoporosis", "Artritis", "Asma", "Depresión", "Ansiedad",
  "Otro", "Ninguna",
] as const

// ── Síntomas ──────────────────────────────────────────────────────────────
export const symptomOptions = [
  "Fatiga constante", "Insomnio", "Dolor de cabeza frecuente",
  "Hinchazón abdominal", "Estreñimiento", "Diarrea frecuente",
  "Náuseas", "Acidez estomacal", "Ansiedad por comer", "Atracones",
  "Poca energía para entrenar", "Dolor muscular persistente",
  "Dolor articular", "Calambres", "Retención de líquidos",
  "Piel seca", "Caída de cabello", "Ciclo menstrual irregular",
  "Cambios de humor frecuentes", "Otro", "Ninguno",
] as const

// ── Frutas ────────────────────────────────────────────────────────────────
export const fruitOptions = [
  "Manzana", "Plátano", "Naranja", "Mandarina", "Fresa", "Uva",
  "Sandía", "Melón", "Mango", "Papaya", "Piña", "Kiwi", "Pera",
  "Durazno", "Ciruela", "Guayaba", "Frambuesa", "Arándano",
  "Cereza", "Otro",
] as const

// ── Verduras ──────────────────────────────────────────────────────────────
export const vegetableOptions = [
  "Brócoli", "Espinaca", "Lechuga", "Zanahoria", "Tomate",
  "Pepino", "Calabaza", "Chayote", "Ejotes", "Chícharos",
  "Nopal", "Betabel", "Cebolla", "Ajo", "Pimiento", "Coliflor",
  "Acelgas", "Apio", "Elote", "Otro",
] as const

// ── Condimentos ───────────────────────────────────────────────────────────
export const condimentOptions = [
  "Sal", "Salsa picante", "Salsa de soya", "Mayonesa", "Cátsup",
  "Mostaza", "Aderezo ranch", "Aderezo cesar", "Vinagre",
  "Aceite de oliva", "Mantequilla", "Crema", "Chile en polvo",
  "Consomé en polvo", "Sazonador (Maggi, Jugo Sazonador)",
] as const

// ── Azúcares ──────────────────────────────────────────────────────────────
export const sugarOptions = [
  "Azúcar de mesa", "Azúcar morena", "Miel de abeja", "Miel de agave",
  "Mermelada", "Cajeta", "Chocolate", "Dulces", "Gomitas",
  "Chocolate en polvo (Nesquik, Abuelita)", "Stevia", "Splenda",
] as const

// ── Grasas ────────────────────────────────────────────────────────────────
export const fatOptions = [
  "Aguacate", "Aceite vegetal", "Aceite de oliva", "Mantequilla",
  "Margarina", "Manteca", "Tocino", "Chorizo", "Crema",
  "Queso crema", "Cacahuates", "Almendras", "Nueces",
  "Semillas de girasol", "Chía", "Linaza",
] as const

// ── Bebidas ───────────────────────────────────────────────────────────────
export const drinkOptions = [
  "Agua natural", "Agua mineral", "Refresco regular",
  "Refresco light/zero", "Jugos", "Leche entera", "Leche descremada",
  "Bebida vegetal (avena, almendra, soya)", "Café", "Té",
  "Bebida energética", "Bebida deportiva (Gatorade, Powerade)",
  "Agua de sabor",
] as const

// ── Alimentos favoritos ───────────────────────────────────────────────────
export const favoriteFoodOptions = [
  // Frutas
  "Manzana", "Plátano", "Naranja", "Fresa", "Uva", "Pera",
  "Durazno", "Mango", "Papaya", "Piña", "Kiwi", "Melón",
  // Lácteos
  "Leche", "Yogur natural", "Yogur griego",
  "Queso fresco", "Queso cottage", "Kéfir",
  // Proteínas
  "Huevo", "Pollo", "Res", "Cerdo",
  "Atún", "Salmón", "Sardina", "Camarón", "Tofu", "Tempeh",
  // Leguminosas
  "Frijoles", "Lentejas", "Garbanzos", "Habas", "Edamame",
  // Cereales y tubérculos
  "Avena", "Arroz integral", "Papa", "Camote",
  "Quinoa", "Tortilla de maíz", "Pan integral",
  // Frutos secos y semillas
  "Almendras", "Nueces", "Cacahuates", "Pistaches",
  "Semillas de chía", "Linaza",
  // Otros básicos
  "Aguacate", "Aceite de oliva", "Miel", "Crema de cacahuate",
  "Otro",
] as const

// ── Alimentos no favoritos ────────────────────────────────────────────────
export const noFavoriteFoodOptions = [
  "Hígado", "Riñón", "Corazón", "Vísceras",
  "Sardina", "Atún enlatado", "Anchoas",
  "Mariscos", "Ostiones", "Calamar",
  "Tofu", "Tempeh", "Soya texturizada",
  "Lentejas", "Garbanzos", "Habas",
  "Betabel", "Nopal", "Apio", "Berenjena",
  "Champiñones", "Hongos",
  "Cebolla cruda", "Ajo",
  "Pepino", "Rábano",
  "Brócoli", "Coliflor", "Coles de Bruselas",
  "Espinaca", "Acelgas", "Kale",
  "Queso cottage", "Requesón",
  "Yogur natural", "Kéfir",
  "Avena", "Otro",
] as const
