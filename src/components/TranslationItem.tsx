import type { TranslationItem as TranslationItemType, Language } from '../types';

interface Props {
  item: TranslationItemType;
  languages: Language[];
  onUpdate: (item: TranslationItemType) => void;
  onDelete: () => void;
}

export function TranslationItem({ item, languages, onUpdate, onDelete }: Props) {
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
