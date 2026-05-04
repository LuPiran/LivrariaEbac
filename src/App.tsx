import axios from 'axios'
import { useEffect, useState } from 'react'
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
    const msg = err.response?.data
    if (typeof msg === 'string' && msg.trim()) return msg
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

  useEffect(() => {
    let active = true

    async function loadInitialBooks() {
      if (!API_BASE_URL) {
        if (active) {
          setError(
            'Defina VITE_API_BASE_URL no .env (URL completa do recurso /books na CrudCrud).',
          )
        }
        return
      }
      if (active) {
        setLoading(true)
        setError(null)
      }
      try {
        const data = await listBooks(API_BASE_URL)
        if (active) setBooks(data)
      } catch (err) {
        if (active) setError(getErrorMessage(err))
      } finally {
        if (active) setLoading(false)
      }
    }

    void loadInitialBooks()
    return () => {
      active = false
    }
  }, [])

  const handleAddBook = async (payload: BookCreatePayload) => {
    if (!API_BASE_URL) return
    setFormBusy(true)
    setError(null)
    try {
      const created = await createBook(API_BASE_URL, payload)
      setBooks((prev) => [...prev, created])
    } catch (err) {
      setError(getErrorMessage(err))
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
      setBooks((prev) =>
        prev.map((b) => (b._id === updated._id ? updated : b)),
      )
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
          Listagem, inclusão, remoção e atualização de status via CrudCrud.
        </p>
      </header>

      {!API_BASE_URL && (
        <div className="app__banner" role="alert">
          Crie um endpoint em{' '}
          <a href="https://crudcrud.com" target="_blank" rel="noreferrer">
            crudcrud.com
          </a>{' '}
          e copie a URL do recurso para <code>.env</code> como{' '}
          <code>VITE_API_BASE_URL</code>.
        </div>
      )}

      {error && (
        <div className="app__error" role="alert">
          {error}
        </div>
      )}

      <main className="app__main">
        <section className="app__panel">
          <BookForm onSubmit={handleAddBook} disabled={formBusy || !API_BASE_URL} />
        </section>
        <section className="app__panel app__panel--list">
          <h2 className="app__section-title">Livros</h2>
          {loading ? (
            <p className="app__loading" role="status">
              Carregando…
            </p>
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
