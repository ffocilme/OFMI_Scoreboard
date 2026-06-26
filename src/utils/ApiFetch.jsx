

const ALLORIGINS = 'https://api.allorigins.win/get?url=';

const isDev = () =>
  typeof window !== 'undefined' &&
  (window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1');

/**
 * Extract alias/token from a full scoreboard URL.
 * Works with https://omegaup.com/arena/ALIAS/scoreboard/TOKEN
 * or a bare   ALIAS/scoreboard/TOKEN string.
 */
const parseUrl = (url) => {
  const match = url.match(/arena\/([^/]+)\/scoreboard\/([^/?#\s]+)/);
  if (!match) throw new Error(`URL no reconocida: ${url}`);
  return { alias: match[1], token: match[2] };
};

/** Pull the JSON out of the #payload element using a regex — no cheerio needed. */
const extractPayload = (html) => {
  // <div id="payload" ...>{ ... }</div>
  const match = html.match(/<[^>]+id=["']payload["'][^>]*>([\s\S]*?)<\/[^>]+>/i);
  if (!match || !match[1].trim()) {
    throw new Error('No se encontró el elemento #payload en el HTML');
  }
  return JSON.parse(match[1]);
};

const fetchDev = async (alias, token) => {
  // Goes through the Vite dev-server proxy → no CORS
  const path = `/omegaup-proxy/arena/${alias}/scoreboard/${token}`;
  const res = await fetch(path);
  if (!res.ok) throw new Error(`HTTP ${res.status} (dev proxy)`);
  const html = await res.text();
  return extractPayload(html);
};

const fetchProd = async (alias, token) => {
  // allorigins wraps the full scoreboard HTML page
  const target = `https://omegaup.com/arena/${alias}/scoreboard/${token}`;
  const res = await fetch(ALLORIGINS + encodeURIComponent(target));
  if (!res.ok) throw new Error(`HTTP ${res.status} (allorigins)`);
  const wrapper = await res.json();
  if (wrapper?.status?.http_code !== 200) {
    throw new Error(`omegaUp devolvió HTTP ${wrapper?.status?.http_code}`);
  }
  return extractPayload(wrapper.contents);
};

export const fetchAPI = async (url) => {
  const { alias, token } = parseUrl(url);
  const payload = isDev()
    ? await fetchDev(alias, token)
    : await fetchProd(alias, token);

  // payload is { scoreboard: {...}, contest: {...} }
  return payload;
};
