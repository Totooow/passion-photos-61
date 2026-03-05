import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

// ── Config ──
const BUCKET = process.env.S3_BUCKET
const API_KEY = process.env.API_KEY

const s3 = new S3Client({
  region: process.env.S3_REGION || 'fr-par',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.fr-par.scw.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
})

// ── Helpers ──

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
}

function respond(status, body) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...CORS },
    body: JSON.stringify(body),
  }
}

async function readCatalog() {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: 'photos.json' }))
  const text = await new Response(res.Body).text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error('photos.json corrompu')
  }
}

async function writeCatalog(data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: 'photos.json',
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache, must-revalidate',
    ACL: 'public-read',
  }))
}

async function deleteS3File(key) {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: key }))
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

// ── Route matching ──

function matchRoute(method, path) {
  // Exact routes
  if (method === 'GET' && path === '/ping') return { handler: ping }
  if (method === 'POST' && path === '/folders') return { handler: createFolder }
  if (method === 'POST' && path === '/photos') return { handler: createPhoto }
  if (method === 'POST' && path === '/presign') return { handler: presign }

  // Parameterized routes
  const folderMatch = path.match(/^\/folders\/([a-z0-9-]+)$/)
  if (folderMatch) {
    if (method === 'PUT') return { handler: updateFolder, params: { id: folderMatch[1] } }
    if (method === 'DELETE') return { handler: deleteFolder, params: { id: folderMatch[1] } }
  }

  const photoMatch = path.match(/^\/photos\/([a-z0-9-]+)$/)
  if (photoMatch) {
    if (method === 'PUT') return { handler: updatePhoto, params: { id: photoMatch[1] } }
    if (method === 'DELETE') return { handler: deletePhoto, params: { id: photoMatch[1] } }
  }

  return null
}

// ── Entry point ──

export async function handle(event, context, callback) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  // Auth
  const auth = event.headers?.authorization || event.headers?.Authorization
  if (auth !== `Bearer ${API_KEY}`) {
    return respond(401, { error: 'Unauthorized' })
  }

  const route = matchRoute(event.httpMethod, event.path)
  if (!route) {
    return respond(404, { error: 'Not found' })
  }

  try {
    let body = null
    if (event.body) {
      try {
        body = JSON.parse(event.body)
      } catch {
        return respond(400, { error: 'Invalid JSON body' })
      }
    }
    return await route.handler(body, route.params)
  } catch (e) {
    console.error(e)
    return respond(500, { error: 'Erreur interne' })
  }
}

// ── Handlers ──

function ping() {
  return respond(200, { ok: true })
}

// ── Folders ──

async function createFolder(body) {
  if (!body?.name?.trim()) return respond(400, { error: 'name requis' })

  const name = body.name.trim()
  if (name.length > 100) return respond(400, { error: 'name trop long (max 100 caractères)' })
  const id = slugify(name)
  if (!id) return respond(400, { error: 'Nom invalide' })

  const catalog = await readCatalog()

  if (catalog.folders.some(f => f.id === id)) {
    return respond(409, { error: 'Ce dossier existe déjà' })
  }

  const folder = { id, name }
  catalog.folders.push(folder)
  await writeCatalog(catalog)

  return respond(201, { folder })
}

async function updateFolder(body, params) {
  if (!body?.name?.trim()) return respond(400, { error: 'name requis' })
  if (body.name.trim().length > 100) return respond(400, { error: 'name trop long (max 100 caractères)' })

  const catalog = await readCatalog()
  const folder = catalog.folders.find(f => f.id === params.id)
  if (!folder) return respond(404, { error: 'Dossier introuvable' })

  folder.name = body.name.trim()
  await writeCatalog(catalog)

  return respond(200, { folder })
}

async function deleteFolder(body, params) {
  const catalog = await readCatalog()
  const folder = catalog.folders.find(f => f.id === params.id)
  if (!folder) return respond(404, { error: 'Dossier introuvable' })

  // Delete S3 files for photos in this folder
  const photos = catalog.photos.filter(p => p.folder === params.id)
  const errors = []
  for (const photo of photos) {
    if (photo.src && !photo.src.startsWith('http')) {
      try {
        await deleteS3File(photo.src)
      } catch (e) {
        errors.push(`${photo.src}: ${e.message}`)
      }
    }
  }

  catalog.photos = catalog.photos.filter(p => p.folder !== params.id)
  catalog.folders = catalog.folders.filter(f => f.id !== params.id)
  await writeCatalog(catalog)

  return respond(200, { deleted: photos.length, errors })
}

// ── Photos ──

async function createPhoto(body) {
  if (!body?.folder || !body?.title?.trim() || !body?.src || !body?.prices) {
    return respond(400, { error: 'folder, title, src et prices requis' })
  }
  if (body.title.trim().length > 200) return respond(400, { error: 'title trop long (max 200 caractères)' })

  const catalog = await readCatalog()

  if (!catalog.folders.some(f => f.id === body.folder)) {
    return respond(400, { error: `Dossier "${body.folder}" introuvable` })
  }

  // Validate prices
  const prices = {}
  for (const fmt of catalog.formats) {
    const p = Number(body.prices[fmt.id])
    if (isNaN(p) || p < 0) {
      return respond(400, { error: `Prix invalide pour le format "${fmt.id}" (doit être un nombre >= 0)` })
    }
    prices[fmt.id] = p
  }

  const id = `${body.folder}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
  const photo = {
    id,
    folder: body.folder,
    title: body.title.trim(),
    src: body.src,
    prices,
  }

  catalog.photos.push(photo)
  await writeCatalog(catalog)

  return respond(201, { photo })
}

async function updatePhoto(body, params) {
  const catalog = await readCatalog()
  const photo = catalog.photos.find(p => p.id === params.id)
  if (!photo) return respond(404, { error: 'Photo introuvable' })

  if (body?.title !== undefined) {
    const title = body.title.trim()
    if (!title) return respond(400, { error: 'title ne peut pas être vide' })
    if (title.length > 200) return respond(400, { error: 'title trop long (max 200 caractères)' })
    photo.title = title
  }

  if (body?.prices !== undefined) {
    for (const fmt of catalog.formats) {
      if (fmt.id in body.prices) {
        const p = Number(body.prices[fmt.id])
        if (isNaN(p) || p < 0) {
          return respond(400, { error: `Prix invalide pour le format "${fmt.id}" (doit être un nombre >= 0)` })
        }
        photo.prices[fmt.id] = p
      }
    }
  }

  await writeCatalog(catalog)
  return respond(200, { photo })
}

async function deletePhoto(body, params) {
  const catalog = await readCatalog()
  const photo = catalog.photos.find(p => p.id === params.id)

  // Delete S3 file if photo exists in catalog
  if (photo?.src && !photo.src.startsWith('http')) {
    try {
      await deleteS3File(photo.src)
    } catch (e) {
      console.error(`Failed to delete S3 file ${photo.src}:`, e.message)
    }
  }

  catalog.photos = catalog.photos.filter(p => p.id !== params.id)
  await writeCatalog(catalog)

  return respond(200, { deleted: params.id })
}

// ── Presigned URL ──

async function presign(body) {
  if (!body?.key || !body?.contentType) {
    return respond(400, { error: 'key et contentType requis' })
  }

  // Validate key: must be in preview/ folder, no traversal
  if (body.key.includes('..') || body.key.startsWith('/') || !body.key.startsWith('preview/')) {
    return respond(400, { error: 'key invalide (doit commencer par preview/)' })
  }

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: body.key,
    ContentType: body.contentType,
    ACL: 'public-read',
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 600 })
  return respond(200, { url })
}
