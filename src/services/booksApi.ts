import axios from 'axios'
import type { Book, BookCreatePayload, BookUpdatePayload } from '../types/book'

const client = axios.create({
  timeout: 30_000,
  // XHR + preflight da CrudCrud às vezes fica pendente (status 0 / Network Error).
  // O adapter fetch usa o mesmo caminho que o navegador já valida com sucesso.
  adapter: 'fetch',
  headers: { Accept: 'application/json' },
})

function isRetryable(err: unknown): boolean {
  if (!axios.isAxiosError(err)) return false
  if (err.code === 'ERR_NETWORK' || err.code === 'ECONNABORTED') return true
  const status = err.response?.status
  return status === 502 || status === 503 || status === 504
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 3): Promise<T> {
  let last: unknown
  for (let i = 0; i < attempts; i += 1) {
    try {
      return await fn()
    } catch (err) {
      last = err
      if (!isRetryable(err) || i === attempts - 1) throw err
      await new Promise((r) => setTimeout(r, 400 * (i + 1)))
    }
  }
  throw last
}

function assertBaseUrl(baseUrl: string): void {
  if (!baseUrl.trim()) {
    throw new Error(
      'Configure VITE_API_BASE_URL no arquivo .env com a URL da CrudCrud (incluindo /books).',
    )
  }
}

export async function listBooks(baseUrl: string): Promise<Book[]> {
  assertBaseUrl(baseUrl)
  const { data } = await withRetry(() => client.get<Book[]>(baseUrl))
  return Array.isArray(data) ? data : []
}

export async function createBook(
  baseUrl: string,
  payload: BookCreatePayload,
): Promise<Book> {
  assertBaseUrl(baseUrl)
  const { data } = await withRetry(() => client.post<Book>(baseUrl, payload))
  return data
}

export async function deleteBook(baseUrl: string, id: string): Promise<void> {
  assertBaseUrl(baseUrl)
  await withRetry(() => client.delete(`${baseUrl}/${id}`))
}

export async function updateBook(
  baseUrl: string,
  id: string,
  payload: BookUpdatePayload,
): Promise<Book> {
  assertBaseUrl(baseUrl)
  const { data } = await withRetry(() =>
    client.put<unknown>(`${baseUrl}/${id}`, payload),
  )
  if (data && typeof data === 'object' && '_id' in data) {
    return data as Book
  }
  return { _id: id, ...payload }
}
