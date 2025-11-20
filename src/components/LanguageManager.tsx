import { useState } from 'react';
import type { Language } from '../types';
import { ALL_AVAILABLE_LANGUAGES } from '../services/translationApi';

interface Props {
  languages: Language[];
  onAdd: (lang: Language) => void;
  onRemove: (code: string) => void;
}

export function LanguageManager({ languages, onAdd, onRemove }: Props) {
  const [showSelector, setShowSelector] = useState(false);
  const [customCode, setCustomCode] = useState('');
  const [customName, setCustomName] = useState('');

  const availableToAdd = ALL_AVAILABLE_LANGUAGES.filter(
    (lang) => !languages.find((l) => l.code === lang.code)
  );

  const handleAddPredefined = (lang: Language) => {
    onAdd(lang);
    setShowSelector(false);
  };

  const handleAddCustom = () => {
    if (customCode && customName) {
      onAdd({ code: customCode, name: customName });
      setCustomCode('');
      setCustomName('');
      setShowSelector(false);
    }
  };

  return (
    <div className="language-manager">
      <h3>Languages</h3>
      <div className="language-tags">
        {languages.map((lang) => (
          <span key={lang.code} className="language-tag">
            {lang.name} ({lang.code})
            <button onClick={() => onRemove(lang.code)} title="Remove language">
              x
            </button>
          </span>
        ))}
        <button className="add-lang-btn" onClick={() => setShowSelector(!showSelector)}>
          + Add Language
        </button>
      </div>

      {showSelector && (
        <div className="language-selector">
          <div className="predefined-languages">
            <h4>Predefined Languages</h4>
            <div className="lang-options">
              {availableToAdd.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => handleAddPredefined(lang)}
                  className="lang-option"
                >
                  {lang.name} ({lang.code})
                </button>
              ))}
            </div>
          </div>
          <div className="custom-language">
            <h4>Custom Language</h4>
            <div className="custom-inputs">
              <input
                type="text"
                placeholder="Code (e.g., fr)"
                value={customCode}
                onChange={(e) => setCustomCode(e.target.value)}
              />
              <input
                type="text"
                placeholder="Name (e.g., French)"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
              />
              <button onClick={handleAddCustom} disabled={!customCode || !customName}>
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
