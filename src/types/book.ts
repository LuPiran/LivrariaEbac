/** Status de leitura exibido e persistido na API */
export type BookStatus = 'Lido' | 'Não lido'

/** Livro retornado pela API (CrudCrud inclui `_id`) */
export interface Book {
  _id: string
  title: string
  author: string
  status: BookStatus
}

/** Corpo enviado no POST (sem `_id`) */
export interface BookCreatePayload {
  title: string
  author: string
  status: BookStatus
}

/** Corpo do PUT para atualizar apenas o status (mantém título e autor) */
export interface BookUpdatePayload {
  title: string
  author: string
  status: BookStatus
}
