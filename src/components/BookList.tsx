import type { Book, BookStatus } from '../types/book'
import { BookItem } from './BookItem'

export interface BookListProps {
  books: Book[]
  onDelete: (id: string) => void
  onStatusChange: (book: Book, status: BookStatus) => void
  deletingId: string | null
  updatingId: string | null
}

export function BookList({
  books,
  onDelete,
  onStatusChange,
  deletingId,
  updatingId,
}: BookListProps) {
  if (books.length === 0) {
    return (
      <p className="book-list__empty" role="status">
        Nenhum livro cadastrado ainda.
      </p>
    )
  }

  return (
    <ul className="book-list">
      {books.map((book) => (
        <li key={book._id} className="book-list__item">
          <BookItem
            book={book}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
            isDeleting={deletingId === book._id}
            isUpdating={updatingId === book._id}
          />
        </li>
      ))}
    </ul>
  )
}
