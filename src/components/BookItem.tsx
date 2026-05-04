import type { ChangeEventHandler, MouseEventHandler } from 'react'
import type { Book, BookStatus } from '../types/book'

export interface BookItemProps {
  book: Book
  onDelete: (id: string) => void
  onStatusChange: (book: Book, status: BookStatus) => void
  isDeleting?: boolean
  isUpdating?: boolean
}

const STATUS_OPTIONS: BookStatus[] = ['Lido', 'Não lido']

export function BookItem({
  book,
  onDelete,
  onStatusChange,
  isDeleting = false,
  isUpdating = false,
}: BookItemProps) {
  const handleStatusChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    const value = e.target.value as BookStatus
    if (value !== book.status) {
      onStatusChange(book, value)
    }
  }

  const handleDelete: MouseEventHandler<HTMLButtonElement> = () => {
    onDelete(book._id)
  }

  const busy = isDeleting || isUpdating

  return (
    <article className="book-item" aria-busy={busy}>
      <div className="book-item__main">
        <h3 className="book-item__title">{book.title}</h3>
        <p className="book-item__author">{book.author}</p>
      </div>
      <div className="book-item__actions">
        <label className="book-item__label" htmlFor={`status-${book._id}`}>
          Status
        </label>
        <select
          id={`status-${book._id}`}
          className="book-item__select"
          value={book.status}
          onChange={handleStatusChange}
          disabled={busy}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button
          type="button"
          className="book-item__delete"
          onClick={handleDelete}
          disabled={busy}
        >
          {isDeleting ? 'Removendo…' : 'Remover'}
        </button>
      </div>
    </article>
  )
}
