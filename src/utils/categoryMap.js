// Category label -> Supabase column suffix mapping
// G = General seats, K = Kannada Medium, R = Rural
export const CATEGORY_MAP = {
  'General (GM)':        'GM',
  'General - Kannada':   'GMK',
  'General - Rural':     'GMR',
  'Category 1':          '1G',
  'Cat 1 - Kannada':     '1K',
  'Cat 1 - Rural':       '1R',
  'Category 2A':         '2AG',
  'Cat 2A - Kannada':    '2AK',
  'Cat 2A - Rural':      '2AR',
  'Category 2B':         '2BG',
  'Cat 2B - Kannada':    '2BK',
  'Cat 2B - Rural':      '2BR',
  'Category 3A':         '3AG',
  'Cat 3A - Kannada':    '3AK',
  'Cat 3A - Rural':      '3AR',
  'Category 3B':         '3BG',
  'Cat 3B - Kannada':    '3BK',
  'Cat 3B - Rural':      '3BR',
  'SC':                  'SCG',
  'SC - Kannada':        'SCK',
  'SC - Rural':          'SCR',
  'ST':                  'STG',
  'ST - Kannada':        'STK',
  'ST - Rural':          'STR',
}

// Main categories shown in primary UI (G suffix only)
export const CATEGORIES_PRIMARY = [
  'General (GM)',
  'Category 1',
  'Category 2A',
  'Category 2B',
  'Category 3A',
  'Category 3B',
  'SC',
  'ST',
]

// All categories including K/R variants
export const CATEGORIES = Object.keys(CATEGORY_MAP)

// Round label -> Supabase column prefix mapping
export const ROUND_MAP = {
  'Mock':                   'Mock',
  'First Round':            'FirstRound',
  'Second Round':           'SecondRound',
  'Second Extended Round':  'SecondExtended',
}

export const ROUNDS = Object.keys(ROUND_MAP)

// Round display order for explorer
export const ROUND_ORDER = ['Mock', 'First Round', 'Second Round', 'Second Extended Round']

// GM fallback suffix (the base General Merit column)
export const GM_SUFFIX = 'GM'
