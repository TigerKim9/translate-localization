import { useState, useRef } from 'react';
import { TranslationItem } from './components/TranslationItem';
import { LanguageManager } from './components/LanguageManager';
import { ApiConfig } from './components/ApiConfig';
import { translateText } from './services/translationApi';
import { DEFAULT_LANGUAGES } from './services/translationApi';
import type {
  TranslationItem as TranslationItemType,
  Language,
  TranslationApiConfig,
  TranslationValue,
} from './types';
import './App.css';

function App() {
  const [items, setItems] = useState<TranslationItemType[]>([]);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [sourceLang, setSourceLang] = useState('ko');
  const [apiConfig, setApiConfig] = useState<TranslationApiConfig>({
    provider: 'deepl',
    apiKey: import.meta.env.VITE_DEEPL_API_KEY || '',
  });
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addItem = () => {
    const newItem: TranslationItemType = {
      id: crypto.randomUUID(),
      key: `new_key_${Date.now()}`,
      translations: languages.reduce((acc, lang) => {
        acc[lang.code] = { text: '', locked: false };
        return acc;
      }, {} as Record<string, TranslationValue>),
    };
    setItems([...items, newItem]);
  };

  const updateItem = (index: number, updatedItem: TranslationItemType) => {
    const newItems = [...items];
    newItems[index] = updatedItem;
    setItems(newItems);
  };

  const deleteItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const addLanguage = (lang: Language) => {
    setLanguages([...languages, lang]);
    // Add empty translation for new language to all items
    setItems(
      items.map((item) => ({
        ...item,
        translations: {
          ...item.translations,
          [lang.code]: { text: '', locked: false },
        },
      }))
    );
  };

  const removeLanguage = (code: string) => {
    setLanguages(languages.filter((l) => l.code !== code));
    // Remove translation for this language from all items
    setItems(
      items.map((item) => {
        const { [code]: _, ...rest } = item.translations;
        return { ...item, translations: rest };
      })
    );
  };

  const translateAll = async () => {
    if (!apiConfig.apiKey) {
      setError('Please enter an API key');
      return;
    }

    setIsTranslating(true);
    setError(null);

    try {
      const newItems = [...items];

      for (let i = 0; i < newItems.length; i++) {
        const item = newItems[i];
        const sourceText = item.translations[sourceLang]?.text;

        if (!sourceText) continue;

        for (const lang of languages) {
          if (lang.code === sourceLang) continue;
          if (item.translations[lang.code]?.locked) continue;
          if (item.translations[lang.code]?.text) continue; // Skip if already has translation

          try {
            const translated = await translateText(
              sourceText,
              sourceLang,
              lang.code,
              apiConfig
            );
            newItems[i] = {
              ...newItems[i],
              translations: {
                ...newItems[i].translations,
                [lang.code]: {
                  text: translated,
                  locked: false,
                },
              },
            };
          } catch (err) {
            console.error(`Failed to translate to ${lang.code}:`, err);
          }
        }
      }

      setItems(newItems);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Parse as JavaScript object (handles both JSON and JS object literal)
        let data: Record<string, Record<string, string>>;

        // Try to parse as JSON first
        try {
          data = JSON.parse(content);
        } catch {
          // Try to evaluate as JS object
          // Remove 'export default' if present
          const cleaned = content
            .replace(/export\s+default\s+/, '')
            .replace(/;\s*$/, '');
          data = eval(`(${cleaned})`);
        }

        // Extract languages from first item
        const firstKey = Object.keys(data)[0];
        if (firstKey) {
          const langCodes = Object.keys(data[firstKey]);
          const newLanguages = langCodes.map((code) => ({
            code,
            name: DEFAULT_LANGUAGES.find((l) => l.code === code)?.name || code,
          }));
          setLanguages(newLanguages);
        }

        // Convert to our format
        const newItems: TranslationItemType[] = Object.entries(data).map(
          ([key, translations]) => ({
            id: crypto.randomUUID(),
            key,
            translations: Object.entries(translations).reduce(
              (acc, [langCode, text]) => {
                acc[langCode] = { text, locked: false };
                return acc;
              },
              {} as Record<string, TranslationValue>
            ),
          })
        );

        setItems(newItems);
        setError(null);
      } catch (err) {
        setError('Failed to parse file. Please check the format.');
        console.error(err);
      }
    };
    reader.readAsText(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const exportAsJson = () => {
    const output: Record<string, Record<string, string>> = {};
    items.forEach((item) => {
      output[item.key] = {};
      languages.forEach((lang) => {
        output[item.key][lang.code] = item.translations[lang.code]?.text || '';
      });
    });

    const blob = new Blob([JSON.stringify(output, null, 2)], {
      type: 'application/json',
    });
    downloadBlob(blob, 'translations.json');
  };

  const exportAsArb = () => {
    // Export separate ARB file for each language
    languages.forEach((lang) => {
      const arb: Record<string, string> = {
        '@@locale': lang.code,
      };

      items.forEach((item) => {
        arb[item.key] = item.translations[lang.code]?.text || '';
      });

      const blob = new Blob([JSON.stringify(arb, null, 2)], {
        type: 'application/json',
      });
      downloadBlob(blob, `app_${lang.code}.arb`);
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app">
      <header>
        <h1>Multilingual Translation Tool</h1>
        <p>Translate your localization strings to multiple languages</p>
      </header>

      <div className="controls">
        <ApiConfig config={apiConfig} onChange={setApiConfig} />
        <LanguageManager
          languages={languages}
          onAdd={addLanguage}
          onRemove={removeLanguage}
        />

        <div className="action-bar">
          <div className="source-lang">
            <label>Source Language:</label>
            <select
              value={sourceLang}
              onChange={(e) => setSourceLang(e.target.value)}
            >
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name} ({lang.code})
                </option>
              ))}
            </select>
          </div>

          <div className="action-buttons">
            <button onClick={addItem}>+ Add Item</button>
            <button onClick={() => fileInputRef.current?.click()}>
              Upload JSON
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json,.js,.arb"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
            <button
              onClick={translateAll}
              disabled={isTranslating || !apiConfig.apiKey}
              className="translate-btn"
            >
              {isTranslating ? 'Translating...' : 'Translate All'}
            </button>
          </div>

          <div className="export-buttons">
            <button onClick={exportAsJson} disabled={items.length === 0}>
              Export JSON
            </button>
            <button onClick={exportAsArb} disabled={items.length === 0}>
              Export ARB
            </button>
          </div>
        </div>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="items-list">
        {items.length === 0 ? (
          <div className="empty-state">
            <p>No translation items yet.</p>
            <p>Click "Add Item" to create a new translation or "Upload JSON" to import existing translations.</p>
          </div>
        ) : (
          items.map((item, index) => (
            <TranslationItem
              key={item.id}
              item={item}
              languages={languages}
              onUpdate={(updated) => updateItem(index, updated)}
              onDelete={() => deleteItem(index)}
            />
          ))
        )}
      </div>
    </div>
  );
}

export default App;
