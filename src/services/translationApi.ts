import type { TranslationApiConfig } from '../types';

// DeepL language code mapping
const DEEPL_LANG_MAP: Record<string, string> = {
  en: 'EN',
  ja: 'JA',
  ko: 'KO',
  vi: 'VI',
  zh_Hans: 'ZH-HANS',
  zh_Hant: 'ZH-HANT',
  mn: 'MN',
  ru: 'RU',
  es: 'ES',
  id: 'ID',
  de: 'DE',
  fr: 'FR',
  it: 'IT',
  pt: 'PT-BR',
  nl: 'NL',
  pl: 'PL',
  tr: 'TR',
  th: 'TH',
  ar: 'AR',
};

export async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string,
  config: TranslationApiConfig
): Promise<string> {
  if (config.provider === 'deepl') {
    return translateWithDeepL(text, sourceLang, targetLang, config.apiKey);
  }

  // Add more providers here
  throw new Error(`Unsupported translation provider: ${config.provider}`);
}

// Cloudflare Workers proxy URL
const DEEPL_PROXY_URL = 'https://translate-localization.kkm9499.workers.dev/';

async function translateWithDeepL(
  text: string,
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string> {
  const sourceCode = DEEPL_LANG_MAP[sourceLang] || sourceLang.toUpperCase();
  const targetCode = DEEPL_LANG_MAP[targetLang] || targetLang.toUpperCase();

  const response = await fetch(DEEPL_PROXY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: [text],
      source_lang: sourceCode,
      target_lang: targetCode,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepL API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.translations[0].text;
}

export async function translateBatch(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  config: TranslationApiConfig
): Promise<string[]> {
  if (config.provider === 'deepl') {
    return translateBatchWithDeepL(texts, sourceLang, targetLang, config.apiKey);
  }

  throw new Error(`Unsupported translation provider: ${config.provider}`);
}

async function translateBatchWithDeepL(
  texts: string[],
  sourceLang: string,
  targetLang: string,
  apiKey: string
): Promise<string[]> {
  const sourceCode = DEEPL_LANG_MAP[sourceLang] || sourceLang.toUpperCase();
  const targetCode = DEEPL_LANG_MAP[targetLang] || targetLang.toUpperCase();

  const response = await fetch(DEEPL_PROXY_URL, {
    method: 'POST',
    headers: {
      'Authorization': `DeepL-Auth-Key ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      text: texts,
      source_lang: sourceCode,
      target_lang: targetCode,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`DeepL API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.translations.map((t: { text: string }) => t.text);
}

export const DEFAULT_LANGUAGES = [
  { code: 'en', name: 'English' },
  { code: 'ko', name: 'Korean' },
  { code: 'ja', name: 'Japanese' },
  { code: 'vi', name: 'Vietnamese' },
  { code: 'zh_Hans', name: 'Chinese (Simplified)' },
  { code: 'zh_Hant', name: 'Chinese (Traditional)' },
  { code: 'mn', name: 'Mongolian' },
  { code: 'ru', name: 'Russian' },
  { code: 'es', name: 'Spanish' },
  { code: 'id', name: 'Indonesian' },
];

export const ALL_AVAILABLE_LANGUAGES = [
  ...DEFAULT_LANGUAGES,
  { code: 'de', name: 'German' },
  { code: 'fr', name: 'French' },
  { code: 'it', name: 'Italian' },
  { code: 'pt', name: 'Portuguese' },
  { code: 'nl', name: 'Dutch' },
  { code: 'pl', name: 'Polish' },
  { code: 'tr', name: 'Turkish' },
  { code: 'th', name: 'Thai' },
  { code: 'ar', name: 'Arabic' },
];
