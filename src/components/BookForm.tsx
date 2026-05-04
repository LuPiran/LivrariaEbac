import type { FormEventHandler } from 'react'
import { useState } from 'react'
import type { BookCreatePayload, BookStatus } from '../types/book'

export interface BookFormValues {
  title: string
  author: string
  status: BookStatus
}

export interface BookFormProps {
  onSubmit: (payload: BookCreatePayload) => void | Promise<void>
  disabled?: boolean
}

const INITIAL_VALUES: BookFormValues = {
  title: '',
  author: '',
  status: 'Não lido',
}

const STATUS_OPTIONS: BookStatus[] = ['Lido', 'Não lido']

export function BookForm({ onSubmit, disabled = false }: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(INITIAL_VALUES)

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (disabled) return
    const payload: BookCreatePayload = {
      title: values.title.trim(),
      author: values.author.trim(),
      status: values.status,
    }
    if (!payload.title || !payload.author) return
    await onSubmit(payload)
    setValues({ ...INITIAL_VALUES, status: 'Não lido' })
  }

  return (
    <form className="book-form" onSubmit={handleSubmit}>
      <h2 className="book-form__heading">Novo livro</h2>
      <div className="book-form__fields">
        <label className="book-form__label">
          Título
          <input
            className="book-form__input"
            name="title"
            value={values.title}
            onChange={(e) =>
              setValues((v) => ({ ...v, title: e.target.value }))
            }
            placeholder="Ex.: Dom Casmurro"
            required
            disabled={disabled}
            autoComplete="off"
          />
        </label>
        <label className="book-form__label">
          Autor
          <input
            className="book-form__input"
            name="author"
            value={values.author}
            onChange={(e) =>
              setValues((v) => ({ ...v, author: e.target.value }))
            }
            placeholder="Ex.: Machado de Assis"
            required
            disabled={disabled}
            autoComplete="off"
          />
        </label>
        <label className="book-form__label">
          Status
          <select
            className="book-form__input"
            name="status"
            value={values.status}
            onChange={(e) =>
              setValues((v) => ({
                ...v,
                status: e.target.value as BookStatus,
              }))
            }
            disabled={disabled}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="book-form__submit" disabled={disabled}>
        {disabled ? 'Salvando…' : 'Adicionar'}
      </button>
    </form>
  )
}
