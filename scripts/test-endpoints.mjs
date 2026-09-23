import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

function loadEnv() {
  const text = readFileSync(resolve(process.cwd(), '.env'), 'utf8')
  /** @type {Record<string, string>} */
  const map = {}
  for (const line of text.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const i = trimmed.indexOf('=')
    if (i === -1) continue
    map[trimmed.slice(0, i).trim()] = trimmed.slice(i + 1).trim()
  }
  return map
}

function resolveApiBaseUrl(raw) {
  const trimmed = (raw ?? '').trim().replace(/\/+$/, '')
  if (/^https?:\/\/crudcrud\.com\/api\/[a-f0-9]+$/i.test(trimmed)) {
    return `${trimmed}/books`
  }
  return trimmed
}

function assert(condition, message) {
  if (!condition) {
    throw new Error(message)
  }
}

async function request(method, url, body) {
  const res = await fetch(url, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  })
  const text = await res.text()
  let json = null
  try {
    json = text ? JSON.parse(text) : null
  } catch {
    json = text
  }
  return { ok: res.ok, status: res.status, json, text }
}

function log(title, result) {
  const preview =
    typeof result.json === 'string'
      ? result.json
      : JSON.stringify(result.json, null, 2)
  console.log(`\n[${title}] HTTP ${result.status}`)
  if (preview) console.log(preview)
}

const env = loadEnv()
const baseUrl = resolveApiBaseUrl(env.VITE_API_BASE_URL)
assert(baseUrl, 'VITE_API_BASE_URL não definido no .env')
console.log('Base URL:', baseUrl)

const bookPayload = {
  title: 'Dom Casmurro',
  author: 'Machado de Assis',
  status: 'Não lido',
}

const rootUrl = baseUrl.replace(/\/books$/, '')

console.log('\n== 0) Controle: POST na URL sem /books (deve falhar) ==')
const postRoot = await request('POST', rootUrl, bookPayload)
log('POST sem /books', postRoot)
assert(
  postRoot.status === 404 || !postRoot.ok,
  'POST sem /books deveria falhar (404).',
)

console.log('\n== 1) GET lista ==')
const list1 = await request('GET', baseUrl)
log('GET /books', list1)
assert(list1.ok, `GET falhou: ${list1.text}`)
assert(Array.isArray(list1.json), 'GET deveria devolver um array')

console.log('\n== 2) POST criar ==')
const created = await request('POST', baseUrl, bookPayload)
log('POST /books', created)
assert(created.ok, `POST falhou: ${created.text}`)
assert(created.json?._id, 'POST deveria devolver _id')
assert(created.json.title === bookPayload.title, 'Título do POST não bate')
const id = created.json._id

console.log('\n== 3) GET por id ==')
const byId = await request('GET', `${baseUrl}/${id}`)
log('GET /books/:id', byId)
assert(byId.ok, `GET por id falhou: ${byId.text}`)
assert(byId.json?._id === id, 'GET por id deveria devolver o mesmo livro')

console.log('\n== 4) PUT atualizar status ==')
const putPayload = {
  title: bookPayload.title,
  author: bookPayload.author,
  status: 'Lido',
}
const updated = await request('PUT', `${baseUrl}/${id}`, putPayload)
log('PUT /books/:id', updated)
assert(updated.ok, `PUT falhou: ${updated.text}`)

const afterPut = await request('GET', `${baseUrl}/${id}`)
log('GET após PUT', afterPut)
assert(afterPut.json?.status === 'Lido', 'Status não foi atualizado para Lido')

console.log('\n== 5) DELETE remover ==')
const deleted = await request('DELETE', `${baseUrl}/${id}`)
log('DELETE /books/:id', deleted)
assert(deleted.ok || deleted.status === 200, `DELETE falhou: ${deleted.text}`)

const afterDelete = await request('GET', `${baseUrl}/${id}`)
log('GET após DELETE', afterDelete)
assert(
  afterDelete.status === 404 || !afterDelete.ok,
  'Livro ainda existia após o DELETE',
)

const list2 = await request('GET', baseUrl)
const stillThere = Array.isArray(list2.json)
  ? list2.json.some((item) => item._id === id)
  : true
assert(!stillThere, 'Livro ainda aparecia na listagem após o DELETE')

console.log('\nTodos os testes de endpoint passaram.')
