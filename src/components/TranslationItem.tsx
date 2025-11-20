import { useState } from 'react';
import type { TranslationItem as TranslationItemType, Language, TranslationApiConfig } from '../types';
import { translateText } from '../services/translationApi';

interface Props {
  item: TranslationItemType;
  languages: Language[];
  sourceLang: string;
  apiConfig: TranslationApiConfig;
  onUpdate: (item: TranslationItemType) => void;
  onDelete: () => void;
}

export function TranslationItem({ item, languages, sourceLang, apiConfig, onUpdate, onDelete }: Props) {
  const [isTranslating, setIsTranslating] = useState(false);

  const handleKeyChange = (newKey: string) => {
    onUpdate({ ...item, key: newKey });
  };

  const handleTextChange = (langCode: string, text: string) => {
    onUpdate({
      ...item,
      translations: {
        ...item.translations,
        [langCode]: {
          ...item.translations[langCode],
          text,
        },
      },
    });
  };

  const handleLockToggle = (langCode: string) => {
    onUpdate({
      ...item,
      translations: {
        ...item.translations,
        [langCode]: {
          ...item.translations[langCode],
          locked: !item.translations[langCode]?.locked,
        },
      },
    });
  };

  const handleTranslate = async () => {
    if (!apiConfig.apiKey) {
      alert('Please enter an API key');
      return;
    }

    const sourceText = item.translations[sourceLang]?.text;
    if (!sourceText) {
      alert(`Please enter text in ${languages.find(l => l.code === sourceLang)?.name || sourceLang} first`);
      return;
    }

    setIsTranslating(true);

    try {
      const updatedItem = { ...item };

      for (const lang of languages) {
        if (lang.code === sourceLang) continue;
        if (item.translations[lang.code]?.locked) continue;

        try {
          const translated = await translateText(
            sourceText,
            sourceLang,
            lang.code,
            apiConfig
          );
          updatedItem.translations[lang.code] = {
            text: translated,
            locked: false,
          };
        } catch (err) {
          console.error(`Failed to translate to ${lang.code}:`, err);
        }
      }

      onUpdate(updatedItem);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Translation failed');
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <div className="translation-item">
      <div className="item-header">
        <input
          type="text"
          className="key-input"
          value={item.key}
          onChange={(e) => handleKeyChange(e.target.value)}
          placeholder="translation_key"
        />
        <button
          className="translate-item-btn"
          onClick={handleTranslate}
          disabled={isTranslating || !apiConfig.apiKey}
          title="Translate this item"
        >
          {isTranslating ? '...' : '🌐'}
        </button>
        <button className="delete-btn" onClick={onDelete} title="Delete item">
          X
        </button>
      </div>
      <div className="translations-grid">
        {languages.map((lang) => (
          <div key={lang.code} className="translation-field">
            <div className="field-header">
              <label>{lang.name} ({lang.code})</label>
              <button
                className={`lock-btn ${item.translations[lang.code]?.locked ? 'locked' : ''}`}
                onClick={() => handleLockToggle(lang.code)}
                title={item.translations[lang.code]?.locked ? 'Unlock (include in translation)' : 'Lock (exclude from translation)'}
              >
                {item.translations[lang.code]?.locked ? '🔒' : '🔓'}
              </button>
            </div>
            <textarea
              value={item.translations[lang.code]?.text || ''}
              onChange={(e) => handleTextChange(lang.code, e.target.value)}
              placeholder={`Enter ${lang.name} translation...`}
              className={item.translations[lang.code]?.locked ? 'locked' : ''}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
