export const S3_BASE_URL = import.meta.env.VITE_S3_BASE_URL || ''

export const CONTACT_EMAIL = 'passionphotos61@gmail.com'

export const BMAC_URL = 'https://buymeacoffee.com/passionphotos61' // TODO: remplacer par le vrai lien

export const SITE_TITLE = 'Passion Photos 61'
export const SITE_SUBTITLE = 'Photographe Amatrice'

export const DISABLE_RIGHT_CLICK = true

export const PREVIEW_DISCLAIMER =
  "L'aperçu présenté est volontairement de qualité dégradée. La photo livrée sera en pleine résolution et sans filigrane."

export const GALLERY_PER_PAGE = 12
export const ADMIN_PER_PAGE = 30

export const DEFAULT_PRICE_MAP = { '10x15': 2, '13x18': 2, numerique: 1.5 }

export const NAV_LINKS = [
  { to: '/', label: 'Accueil' },
  { to: '/galerie', label: 'Galerie' },
  { to: '/don', label: 'Faire un don' },
]
