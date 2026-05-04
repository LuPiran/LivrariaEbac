import axios from 'axios'
import type { Book, BookCreatePayload, BookUpdatePayload } from '../types/book'

function assertBaseUrl(baseUrl: string): void {
  if (!baseUrl.trim()) {
    throw new Error(
      'Configure VITE_API_BASE_URL no arquivo .env com a URL da CrudCrud.',
    )
  }
}

export async function listBooks(baseUrl: string): Promise<Book[]> {
  assertBaseUrl(baseUrl)
  const { data } = await axios.get<Book[]>(baseUrl)
  return Array.isArray(data) ? data : []
}

export async function createBook(
  baseUrl: string,
  payload: BookCreatePayload,
): Promise<Book> {
  assertBaseUrl(baseUrl)
  const { data } = await axios.post<Book>(baseUrl, payload)
  return data
}

export async function deleteBook(baseUrl: string, id: string): Promise<void> {
  assertBaseUrl(baseUrl)
  await axios.delete(`${baseUrl}/${id}`)
}

export async function updateBook(
  baseUrl: string,
  id: string,
  payload: BookUpdatePayload,
): Promise<Book> {
  assertBaseUrl(baseUrl)
  const { data } = await axios.put<Book>(`${baseUrl}/${id}`, payload)
  return data
}
