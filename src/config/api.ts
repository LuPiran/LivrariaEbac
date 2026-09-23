/**
 * URL do recurso na CrudCrud.
 *
 * Formato correto:
 * `https://crudcrud.com/api/<id-unico>/books`
 *
 * Se a variável tiver só o id (sem `/books`), o recurso é acrescentado
 * automaticamente — POST na URL "nua" retorna 404 e o axios mostra
 * "Network Error" porque essa resposta não envia cabeçalhos CORS.
 *
 * Defina em `.env`: VITE_API_BASE_URL=...
 */
const RESOURCE = 'books'

const CRUDCRUD_ID_ONLY =
  /^https?:\/\/crudcrud\.com\/api\/[a-f0-9]+$/i

export function resolveApiBaseUrl(raw?: string): string {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '')
  if (!trimmed) return ''
  if (CRUDCRUD_ID_ONLY.test(trimmed)) {
    return `${trimmed}/${RESOURCE}`
  }
  return trimmed
}

const FALLBACK_API_BASE_URL =
  'https://crudcrud.com/api/b9de22bd0f7c472d9d500894cdebca8f/books'

export const API_BASE_URL: string =
  resolveApiBaseUrl(import.meta.env.VITE_API_BASE_URL) || FALLBACK_API_BASE_URL
