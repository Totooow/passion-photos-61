import { S3Client, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import { timingSafeEqual, randomUUID } from 'node:crypto'
import Stripe from 'stripe'

// ── Config ──
const REQUIRED_ENV = ['S3_BUCKET', 'S3_ACCESS_KEY', 'S3_SECRET_KEY', 'API_KEY', 'STRIPE_WEBHOOK_SECRET']
for (const key of REQUIRED_ENV) {
  if (!process.env[key]) throw new Error(`Variable d'environnement manquante : ${key}`)
}

const BUCKET = process.env.S3_BUCKET
const API_KEY = process.env.API_KEY
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*'
const CATALOG_KEY = 'photos.json'
const ORDERS_KEY = 'orders.json'
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET

const s3 = new S3Client({
  region: process.env.S3_REGION || 'fr-par',
  endpoint: process.env.S3_ENDPOINT || 'https://s3.fr-par.scw.cloud',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY,
    secretAccessKey: process.env.S3_SECRET_KEY,
  },
  forcePathStyle: true,
})

// ── Async mutex (prevents interleaved read-modify-write within a single container) ──

function createLock() {
  let pending = Promise.resolve()
  return (fn) => {
    const result = pending.then(fn, fn)
    pending = result.then(() => {}, () => {})
    return result
  }
}

const catalogLock = createLock()
const ordersLock = createLock()

// ── Helpers ──

const CORS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Authorization, Content-Type',
  'Access-Control-Allow-Credentials': 'true',
  'X-Content-Type-Options': 'nosniff',
}

function respond(status, body, extraHeaders) {
  return {
    statusCode: status,
    headers: { 'Content-Type': 'application/json', ...CORS, ...extraHeaders },
    body: body ? JSON.stringify(body) : '',
  }
}

function parseCookie(headers, name) {
  const raw = headers?.cookie || headers?.Cookie || ''
  const match = raw.match(new RegExp(`(?:^|;\\s*)${name}=([^;]*)`))
  return match ? match[1] : ''
}

const SESSION_COOKIE = 'pp61_session'
const COOKIE_MAX_AGE = 86400 // 24h

function setSessionCookie(value, maxAge = COOKIE_MAX_AGE) {
  return `${SESSION_COOKIE}=${value}; HttpOnly; Secure; Path=/; Max-Age=${maxAge}`
}

async function readCatalog() {
  const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: CATALOG_KEY }))
  const text = await new Response(res.Body).text()
  try {
    return JSON.parse(text)
  } catch {
    throw new Error(`${CATALOG_KEY} corrompu`)
  }
}

async function readOrders() {
  try {
    const res = await s3.send(new GetObjectCommand({ Bucket: BUCKET, Key: ORDERS_KEY }))
    const text = await new Response(res.Body).text()
    return JSON.parse(text)
  } catch (err) {
    if (err.name === 'NoSuchKey' || err.$metadata?.httpStatusCode === 404) return []
    throw err
  }
}

async function writeOrders(data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: ORDERS_KEY,
    Body: JSON.stringify(data, null, 2),
    ContentType: 'application/json',
    CacheControl: 'no-cache, must-revalidate',
    ACL: 'private',
  }))
}

async function writeCatalog(data) {
  await s3.send(new PutObjectCommand({
    Bucket: BUCKET,
    Key: CATALOG_KEY,
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

const SAFE_TEXT_RE = /^[\p{L}\p{N}\s\-'.,()&]+$/u

function validateName(body) {
  if (!body?.name?.trim()) return 'name requis'
  const name = body.name.trim()
  if (name.length > 100) return 'name trop long (max 100 caractères)'
  if (!SAFE_TEXT_RE.test(name)) return 'name contient des caractères non autorisés'
  return null
}

function validateTitle(title) {
  if (!title?.trim()) return 'title ne peut pas être vide'
  const t = title.trim()
  if (t.length > 200) return 'title trop long (max 200 caractères)'
  if (!SAFE_TEXT_RE.test(t)) return 'title contient des caractères non autorisés'
  return null
}

function validatePrices(prices, formats) {
  const result = {}
  for (const fmt of formats) {
    const p = Number(prices[fmt.id])
    if (isNaN(p) || p < 0) {
      return { error: `Prix invalide pour le format "${fmt.id}" (doit être un nombre >= 0)` }
    }
    result[fmt.id] = p
  }
  return { prices: result }
}

// ── Route matching ──

function matchRoute(method, path) {
  // Public routes (no auth required)
  if (method === 'POST' && path === '/login') return { handler: login, public: true }
  if (method === 'POST' && path === '/logout') return { handler: logout, public: true }
  if (method === 'POST' && path === '/checkout') return { handler: createCheckoutSession, public: true }
  if (method === 'POST' && path === '/donate') return { handler: createDonationSession, public: true }
  if (method === 'POST' && path === '/webhook') return { handler: handleWebhook, public: true, rawBody: true }

  // Exact routes
  if (method === 'GET' && path === '/ping') return { handler: ping, public: true }
  if (method === 'GET' && path === '/session') return { handler: ping }
  if (method === 'GET' && path === '/orders') return { handler: getOrders }
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

export async function handle(event, context) {
  // CORS preflight
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers: CORS, body: '' }
  }

  const route = matchRoute(event.httpMethod, event.path)
  if (!route) {
    return respond(404, { error: 'Route introuvable' })
  }

  // Auth (skip for public routes)
  if (!route.public) {
    const auth = event.headers?.authorization || event.headers?.Authorization || ''
    const cookieKey = parseCookie(event.headers, SESSION_COOKIE)
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : cookieKey

    const expected = API_KEY
    const isValid =
      token.length === expected.length &&
      timingSafeEqual(Buffer.from(token), Buffer.from(expected))
    if (!isValid) {
      return respond(401, { error: 'Non autorisé' })
    }
  }

  const start = Date.now()
  try {
    let body = null
    if (route.rawBody) {
      // For webhook: pass the raw string body for signature verification
      body = event.body
    } else if (event.body) {
      try {
        body = JSON.parse(event.body)
      } catch {
        return respond(400, { error: 'Corps JSON invalide' })
      }
    }
    const res = await route.handler(body, route.params, event.headers)
    console.log(JSON.stringify({ method: event.httpMethod, path: event.path, status: res.statusCode, ms: Date.now() - start }))
    return res
  } catch (e) {
    console.error(JSON.stringify({ method: event.httpMethod, path: event.path, status: 500, ms: Date.now() - start, error: e.message }))
    return respond(500, { error: 'Erreur interne' })
  }
}

// ── Handlers ──

function ping() {
  return respond(200, { ok: true })
}

// ── Auth ──

function login(body) {
  if (!body?.key) return respond(400, { error: 'key requis' })

  const expected = API_KEY
  const key = String(body.key)
  const isValid =
    key.length === expected.length &&
    timingSafeEqual(Buffer.from(key), Buffer.from(expected))

  if (!isValid) return respond(401, { error: 'Clé invalide' })

  return respond(200, { ok: true }, { 'Set-Cookie': setSessionCookie(key) })
}

function logout() {
  return respond(200, { ok: true }, { 'Set-Cookie': setSessionCookie('', 0) })
}

// ── Orders ──

async function getOrders() {
  const orders = await readOrders()
  return respond(200, { orders })
}

// ── Folders ──

function createFolder(body) {
  const nameErr = validateName(body)
  if (nameErr) return respond(400, { error: nameErr })

  const name = body.name.trim()
  const id = slugify(name)
  if (!id) return respond(400, { error: 'Nom invalide' })

  return catalogLock(async () => {
    const catalog = await readCatalog()

    if (catalog.folders.some(f => f.id === id)) {
      return respond(409, { error: 'Ce dossier existe déjà' })
    }

    const folder = { id, name }
    catalog.folders.push(folder)
    await writeCatalog(catalog)

    return respond(201, { folder })
  })
}

function updateFolder(body, params) {
  const nameErr = validateName(body)
  if (nameErr) return respond(400, { error: nameErr })

  return catalogLock(async () => {
    const catalog = await readCatalog()
    const folder = catalog.folders.find(f => f.id === params.id)
    if (!folder) return respond(404, { error: 'Dossier introuvable' })

    folder.name = body.name.trim()
    await writeCatalog(catalog)

    return respond(200, { folder })
  })
}

function deleteFolder(_body, params) {
  return catalogLock(async () => {
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
  })
}

// ── Photos ──

function createPhoto(body) {
  if (!body?.folder || !body?.title?.trim() || !body?.src || !body?.prices) {
    return respond(400, { error: 'folder, title, src et prices requis' })
  }
  const titleErr = validateTitle(body.title)
  if (titleErr) return respond(400, { error: titleErr })

  return catalogLock(async () => {
    const catalog = await readCatalog()

    if (!catalog.folders.some(f => f.id === body.folder)) {
      return respond(400, { error: `Dossier "${body.folder}" introuvable` })
    }

    const priceResult = validatePrices(body.prices, catalog.formats)
    if (priceResult.error) return respond(400, { error: priceResult.error })
    const prices = priceResult.prices

    const titleExists = catalog.photos.some(p => p.folder === body.folder && p.title.toLowerCase() === body.title.trim().toLowerCase())
    if (titleExists) return respond(409, { error: `Une photo "${body.title.trim()}" existe déjà dans ce dossier` })

    const id = `${body.folder}-${Date.now()}-${randomUUID().slice(0, 8)}`
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
  })
}

function updatePhoto(body, params) {
  return catalogLock(async () => {
    const catalog = await readCatalog()
    const photo = catalog.photos.find(p => p.id === params.id)
    if (!photo) return respond(404, { error: 'Photo introuvable' })

    if (body?.title !== undefined) {
      const titleErr = validateTitle(body.title)
      if (titleErr) return respond(400, { error: titleErr })
      const duplicate = catalog.photos.some(p => p.id !== photo.id && p.folder === photo.folder && p.title.toLowerCase() === body.title.trim().toLowerCase())
      if (duplicate) return respond(409, { error: `Une photo "${body.title.trim()}" existe déjà dans ce dossier` })
      photo.title = body.title.trim()
    }

    if (body?.prices !== undefined) {
      const priceResult = validatePrices(body.prices, catalog.formats)
      if (priceResult.error) return respond(400, { error: priceResult.error })
      Object.assign(photo.prices, priceResult.prices)
    }

    await writeCatalog(catalog)
    return respond(200, { photo })
  })
}

function deletePhoto(_body, params) {
  return catalogLock(async () => {
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

    return respond(204, null)
  })
}

// ── Presigned URL ──

async function presign(body) {
  if (!body?.key || !body?.contentType) {
    return respond(400, { error: 'key et contentType requis' })
  }

  // Validate key: must be in preview/ folder, no traversal
  const key = decodeURIComponent(body.key)
  if (key.includes('..') || key.startsWith('/') || !key.startsWith('preview/')) {
    return respond(400, { error: 'key invalide (doit commencer par preview/)' })
  }

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: key,
    ContentType: body.contentType,
    ACL: 'public-read',
  })

  const url = await getSignedUrl(s3, cmd, { expiresIn: 600 })
  return respond(200, { url })
}

// ── Stripe Checkout ──

async function createCheckoutSession(body) {
  if (!stripe) return respond(500, { error: 'Stripe non configuré' })
  if (!body?.items?.length) return respond(400, { error: 'Panier vide' })

  const catalog = await readCatalog()
  const photosMap = Object.fromEntries(catalog.photos.map(p => [p.id, p]))
  const formatsMap = Object.fromEntries(catalog.formats.map(f => [f.id, f]))

  const lineItems = []
  const orderDetails = []

  for (const item of body.items) {
    const photo = photosMap[item.id]
    if (!photo) return respond(400, { error: `Photo introuvable : ${item.id}` })

    const format = formatsMap[item.formatId]
    if (!format) return respond(400, { error: `Format introuvable : ${item.formatId}` })

    const catalogPrice = photo.prices[item.formatId]
    if (catalogPrice === undefined || catalogPrice <= 0) {
      return respond(400, { error: `Prix non disponible pour ${photo.title} en ${format.label}` })
    }

    lineItems.push({
      price_data: {
        currency: 'eur',
        product_data: { name: `${photo.title} — ${format.label}` },
        unit_amount: Math.round(catalogPrice * 100),
      },
      quantity: item.qty || 1,
    })

    orderDetails.push(`${photo.title} (${format.label}) x${item.qty || 1}`)
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: lineItems,
    name_collection: { individual: { enabled: true, optional: false } },
    phone_number_collection: { enabled: true },
    success_url: `${SITE_URL}/commande/confirmation?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/commande/annulee`,
    // TODO: décommenter quand l'URL des CGV est configurée dans le dashboard Stripe (Settings → Checkout)
    // consent_collection: {
    //   terms_of_service: 'required',
    // },
    // custom_text: {
    //   terms_of_service_acceptance: {
    //     message: `J'accepte les [conditions générales de vente](${SITE_URL}/cgv) et je renonce expressément à mon droit de rétractation pour les contenus numériques fournis immédiatement après le paiement (art. L221-28 du Code de la consommation).`,
    //   },
    // },
    metadata: {
      order_summary: orderDetails.join(' | ').slice(0, 500),
    },
  })

  return respond(200, { url: session.url })
}

async function createDonationSession(body) {
  if (!stripe) return respond(500, { error: 'Stripe non configuré' })

  const amount = Number(body?.amount)
  if (!Number.isInteger(amount) || amount < 100 || amount > 100000) {
    return respond(400, { error: 'Montant invalide (min 1€, max 1000€)' })
  }

  const session = await stripe.checkout.sessions.create({
    mode: 'payment',
    submit_type: 'donate',
    line_items: [
      {
        price_data: {
          currency: 'eur',
          product_data: { name: 'Don — Passion Photos 61' },
          unit_amount: amount,
        },
        quantity: 1,
      },
    ],
    success_url: `${SITE_URL}/don/merci?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${SITE_URL}/don/annule`,
    metadata: { type: 'donation' },
  })

  return respond(200, { url: session.url })
}

async function handleWebhook(rawBody, _params, headers) {
  if (!stripe) return respond(500, { error: 'Stripe non configuré' })

  const sig = headers['stripe-signature'] || headers['Stripe-Signature']
  if (!sig) return respond(400, { error: 'Header stripe-signature manquant' })

  let event
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message)
    return respond(400, { error: 'Signature invalide' })
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    const order = {
      id: session.id,
      date: new Date(session.created * 1000).toISOString(),
      amount: session.amount_total,
      email: session.customer_details?.email,
      name: session.collected_information?.individual_name || session.customer_details?.name,
      phone: session.customer_details?.phone,
      summary: session.metadata?.order_summary,
    }
    console.log(JSON.stringify({ webhook: 'checkout.session.completed', ...order }))

    await ordersLock(async () => {
      const orders = await readOrders()
      orders.push(order)
      await writeOrders(orders)
    })
  }

  return respond(200, { received: true })
}
