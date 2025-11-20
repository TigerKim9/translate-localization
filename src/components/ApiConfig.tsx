import type { TranslationApiConfig } from '../types';

interface Props {
  config: TranslationApiConfig;
  onChange: (config: TranslationApiConfig) => void;
}

export function ApiConfig({ config, onChange }: Props) {
  return (
    <div className="api-config">
      <h3>Translation API Settings</h3>
      <div className="config-fields">
        <div className="config-field">
          <label>Provider</label>
          <select
            value={config.provider}
            onChange={(e) =>
              onChange({ ...config, provider: e.target.value as TranslationApiConfig['provider'] })
            }
          >
            <option value="deepl">DeepL</option>
            <option value="google">Google Translate</option>
            <option value="custom">Custom API</option>
          </select>
        </div>
        <div className="config-field">
          <label>API Key</label>
          <input
            type="password"
            value={config.apiKey}
            onChange={(e) => onChange({ ...config, apiKey: e.target.value })}
            placeholder="Enter your API key..."
          />
        </div>
        {config.provider === 'custom' && (
          <div className="config-field">
            <label>Custom Endpoint</label>
            <input
              type="text"
              value={config.customEndpoint || ''}
              onChange={(e) => onChange({ ...config, customEndpoint: e.target.value })}
              placeholder="https://api.example.com/translate"
            />
          </div>
        )}
      </div>
    </div>
  );
}
