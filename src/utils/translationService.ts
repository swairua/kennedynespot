export type TranslationResult = {
  title?: string;
  excerpt?: string;
  content?: string;
};

const CACHE_PREFIX = 'translate_cache_v1';
const API_ENDPOINTS = [
  'https://libretranslate.de/translate',
  'https://libretranslate.com/translate',
  'https://translate.argosopentech.com/translate',
];
const DEFAULT_TIMEOUT_MS = 3500;
let loggedFailure = false;
// Whether remote translation endpoints are reachable. null = unknown, true = reachable, false = not reachable
let canUseRemote: boolean | null = null;

async function probeTranslationService(timeout = 2000) {
  if (canUseRemote !== null) return canUseRemote;
  for (const url of API_ENDPOINTS) {
    try {
      const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
      const id = controller ? setTimeout(() => controller.abort(), timeout) : undefined;
      try {
        const resp = await fetch(url, {
          method: 'OPTIONS',
          mode: 'cors',
          signal: controller ? (controller as any).signal : undefined,
        });
        if (id) clearTimeout(id);
        if (resp && (resp.status === 200 || resp.status === 204 || resp.status === 204 || resp.status === 401 || resp.status === 405)) {
          canUseRemote = true;
          return true;
        }
      } catch (e) {
        // ignore and try next
      } finally {
        if (id) clearTimeout(id);
      }
    } catch (e) {
      // ignore
    }
  }
  canUseRemote = false;
  return false;
}

async function computeHash(text: string) {
  if (typeof crypto !== 'undefined' && (crypto as any).subtle) {
    try {
      const enc = new TextEncoder();
      const data = enc.encode(text);
      const hashBuffer = await (crypto as any).subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    } catch (e) {
      // fallthrough
    }
  }
  // Fallback
  try {
    return btoa(unescape(encodeURIComponent(text))).slice(0, 64);
  } catch (e) {
    return String(text.length);
  }
}

function getCacheKey(hash: string, target: string) {
  return `${CACHE_PREFIX}:${hash}:${target}`;
}

function saveToCache(hash: string, target: string, value: string) {
  try {
    const key = getCacheKey(hash, target);
    localStorage.setItem(key, value);
  } catch (e) {
    // ignore
  }
}

function loadFromCache(hash: string, target: string) {
  try {
    const key = getCacheKey(hash, target);
    return localStorage.getItem(key);
  } catch (e) {
    return null;
  }
}

async function translateChunk(text: string, target: string, source = 'en') {
  // Check cache
  const hash = await computeHash(text);
  const cached = loadFromCache(hash, target);
  if (cached) return cached;

  try {
    if (typeof navigator !== 'undefined' && navigator.onLine === false) {
      return text;
    }

    // Retry/backoff per endpoint to increase resilience against transient network errors
    const MAX_ATTEMPTS = 3;
    const sleep = (ms: number) => new Promise(res => setTimeout(res, ms));

    for (const url of API_ENDPOINTS) {
      let attempt = 0;
      while (attempt < MAX_ATTEMPTS) {
        try {
          // Use AbortController to implement a timeout and avoid unhandled rejections
          const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
          const timeoutId = controller
            ? setTimeout(() => controller.abort(), DEFAULT_TIMEOUT_MS)
            : undefined;

          let resp: Response | null = null;

          try {
            resp = await fetch(url, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ q: text, source, target, format: 'text' }),
              signal: controller ? (controller as any).signal : undefined,
            });
          } catch (fetchErr) {
            // Treat fetch errors as transient and retry/continue to next endpoint
            resp = null;
          } finally {
            if (timeoutId) clearTimeout(timeoutId);
          }

          if (!resp) {
            attempt += 1;
            if (attempt < MAX_ATTEMPTS) {
              const delay = 200 * Math.pow(2, attempt - 1);
              await sleep(delay);
              continue;
            }
            break; // move to next endpoint
          }

          if (!resp.ok) {
            // Non-2xx response; do not throw to avoid bubbling noisy errors
            attempt += 1;
            if (attempt < MAX_ATTEMPTS) {
              const delay = 200 * Math.pow(2, attempt - 1);
              await sleep(delay);
              continue;
            }
            break;
          }

          const data = await resp.json().catch(() => null);
          if (!data) {
            break;
          }

          const translated = (data as any)?.translatedText || (data as any)?.translation || '';
          if (translated) {
            saveToCache(hash, target, translated);
            return translated;
          }

          // If response didn't contain translation, break to try next endpoint
          break;
        } catch (_err) {
          attempt += 1;
          if (attempt < MAX_ATTEMPTS) {
            const delay = 200 * Math.pow(2, attempt - 1); // 200ms, 400ms, 800ms
            await sleep(delay);
            continue;
          }
          // otherwise move on to the next endpoint
          break;
        }
      }
    }

    if (!loggedFailure) {
      loggedFailure = true;
      console.warn('Translation service unavailable. Falling back to original text.');
    }
    return text;
  } catch (_e) {
    return text;
  }
}

export async function translateText(text: string, target: string, source = 'en') {
  if (!text) return '';
  if (target === source) return text;

  // If text is short, translate directly
  if (text.length < 3000) {
    return translateChunk(text, target, source);
  }

  // For long text, split by paragraphs and translate sequentially
  const parts = text.split(/\n\n+/g);
  const translatedParts: string[] = [];
  for (const part of parts) {
    const trimmed = part.trim();
    if (!trimmed) {
      translatedParts.push(part);
      continue;
    }
    // Honor code blocks by not translating triple-backtick blocks
    if (/^```[\s\S]*```$/m.test(trimmed)) {
      translatedParts.push(part);
      continue;
    }
    const translated = await translateChunk(part, target, source);
    translatedParts.push(translated);
  }

  return translatedParts.join('\n\n');
}

export async function translatePostFields(fields: { title?: string; excerpt?: string; content?: string }, target: string, source = 'en') {
  const result: TranslationResult = {};
  if (fields.title) {
    result.title = await translateText(fields.title, target, source);
  }
  if (fields.excerpt) {
    result.excerpt = await translateText(fields.excerpt, target, source);
  }
  if (fields.content) {
    result.content = await translateText(fields.content, target, source);
  }
  return result;
}
