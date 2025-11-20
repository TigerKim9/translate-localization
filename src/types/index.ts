export interface TranslationValue {
  text: string;
  locked: boolean;
}

export interface TranslationItem {
  id: string;
  key: string;
  translations: Record<string, TranslationValue>;
}

export interface Language {
  code: string;
  name: string;
}

export interface TranslationApiConfig {
  provider: 'deepl' | 'google' | 'custom';
  apiKey: string;
  customEndpoint?: string;
}

export interface ArbFile {
  '@@locale': string;
  [key: string]: string | { description?: string; placeholders?: Record<string, unknown> };
}
