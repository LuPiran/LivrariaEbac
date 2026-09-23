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
  busy?: boolean
}

const INITIAL_VALUES: BookFormValues = {
  title: '',
  author: '',
  status: 'Não lido',
}

const STATUS_OPTIONS: BookStatus[] = ['Lido', 'Não lido']

export function BookForm({
  onSubmit,
  disabled = false,
  busy = false,
}: BookFormProps) {
  const [values, setValues] = useState<BookFormValues>(INITIAL_VALUES)
  const locked = disabled || busy

  const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    if (locked) return
    const payload: BookCreatePayload = {
      title: values.title.trim(),
      author: values.author.trim(),
      status: values.status,
    }
    if (!payload.title || !payload.author) return
    try {
      await onSubmit(payload)
      setValues({ ...INITIAL_VALUES, status: 'Não lido' })
    } catch {
      // O App já exibe o erro; mantém os campos para nova tentativa.
    }
  }

  return (
    <form className="book-form" onSubmit={handleSubmit} aria-busy={busy}>
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
            disabled={locked}
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
            disabled={locked}
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
            disabled={locked}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </label>
      </div>
      <button type="submit" className="book-form__submit" disabled={locked}>
        {busy ? 'Salvando…' : 'Adicionar'}
      </button>
    </form>
  )
}
