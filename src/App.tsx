import axios from 'axios'
import { useCallback, useEffect, useState } from 'react'
import { BookForm } from './components/BookForm'
import { BookList } from './components/BookList'
import { API_BASE_URL } from './config/api'
import './App.css'
import {
  createBook,
  deleteBook,
  listBooks,
  updateBook,
} from './services/booksApi'
import type { Book, BookCreatePayload, BookStatus } from './types/book'

function getErrorMessage(err: unknown): string {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status
    const data = err.response?.data
    const body = typeof data === 'string' ? data : ''

    if (typeof data === 'object' && data && 'title' in data) {
      const title = (data as { title?: unknown }).title
      if (typeof title === 'string' && title.trim()) return title
    }
    if (body.includes("Endpoint doesn't exist")) {
      return 'O endpoint da CrudCrud expirou ou é inválido. Gere um novo em crudcrud.com e atualize VITE_API_BASE_URL (a URL deve terminar com /books).'
    }
    if (status === 404) {
      return 'Recurso não encontrado (404). A URL da API precisa incluir o recurso /books, por exemplo https://crudcrud.com/api/<id>/books.'
    }
    if (err.code === 'ERR_NETWORK' || err.message === 'Network Error') {
      return 'Erro de rede ao falar com a CrudCrud. Confira se a URL termina com /books e se o endpoint ainda é válido (expira em cerca de 24h).'
    }
    if (body.trim()) return body
    if (err.message) return err.message
  }
  if (err instanceof Error) return err.message
  return 'Ocorreu um erro inesperado.'
}

export default function App() {
  const [books, setBooks] = useState<Book[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formBusy, setFormBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const loadBooks = useCallback(async () => {
    if (!API_BASE_URL) {
      setError(
        'Defina VITE_API_BASE_URL no .env (URL completa do recurso /books na CrudCrud).',
      )
      return
    }
    setLoading(true)
    setError(null)
    try {
      const data = await listBooks(API_BASE_URL)
      setBooks(data)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadBooks()
  }, [loadBooks])

  const handleAddBook = async (payload: BookCreatePayload) => {
    if (!API_BASE_URL) return
    setFormBusy(true)
    setError(null)
    try {
      const created = await createBook(API_BASE_URL, payload)
      setBooks((prev) => [...prev, created])
    } catch (err) {
      setError(getErrorMessage(err))
      throw err
    } finally {
      setFormBusy(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!API_BASE_URL) return
    setDeletingId(id)
    setError(null)
    try {
      await deleteBook(API_BASE_URL, id)
      setBooks((prev) => prev.filter((b) => b._id !== id))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setDeletingId(null)
    }
  }

  const handleStatusChange = async (book: Book, status: BookStatus) => {
    if (!API_BASE_URL || status === book.status) return
    setUpdatingId(book._id)
    setError(null)
    try {
      const updated = await updateBook(API_BASE_URL, book._id, {
        title: book.title,
        author: book.author,
        status,
      })
      setBooks((prev) => prev.map((b) => (b._id === book._id ? updated : b)))
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setUpdatingId(null)
    }
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">Catálogo de livros</h1>
        <p className="app__subtitle">
          Título, autor e se já leu. A estante fica abaixo.
        </p>
      </header>

      {!API_BASE_URL && (
        <div className="app__banner" role="alert">
          Crie um endpoint em{' '}
          <a href="https://crudcrud.com" target="_blank" rel="noopener noreferrer">
            crudcrud.com
          </a>{' '}
          e copie a URL do recurso para <code>.env</code> como{' '}
          <code>VITE_API_BASE_URL</code>.
        </div>
      )}

      {error && (
        <div className="app__error" role="alert" aria-live="polite">
          {error}
        </div>
      )}

      <main className="app__main">
        <section className="app__panel">
          <BookForm
            onSubmit={handleAddBook}
            disabled={!API_BASE_URL}
            busy={formBusy}
          />
        </section>
        <section className="app__panel app__panel--list">
          <h2 className="app__section-title">Livros</h2>
          {loading ? (
            <p className="app__loading" role="status">
              Carregando a estante…
            </p>
          ) : error && books.length === 0 ? (
            <div className="app__recover">
              <p className="app__recover-text">
                Não foi possível carregar a estante.
              </p>
              <button
                type="button"
                className="app__retry"
                onClick={() => void loadBooks()}
              >
                Tentar de novo
              </button>
            </div>
          ) : (
            <BookList
              books={books}
              onDelete={handleDelete}
              onStatusChange={handleStatusChange}
              deletingId={deletingId}
              updatingId={updatingId}
            />
          )}
        </section>
      </main>
    </div>
  )
}
