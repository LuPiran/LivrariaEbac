/**
 * URL completa do recurso na CrudCrud, por exemplo:
 * `https://crudcrud.com/api/<seu-id-unico>/books`
 *
 * Defina em `.env`: VITE_API_BASE_URL=...
 */
export const API_BASE_URL: string =
  import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? ''
