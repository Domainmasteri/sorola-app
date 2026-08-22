import AsyncStorage from '@react-native-async-storage/async-storage';

const DEFAULT_API_URL = 'https://api.sorola.fi/api';
const DEFAULT_SITE_URL = 'https://sorola.fi';
const API_KEY_STORAGE_KEY = 'sorola.apiKey';

const normalizeBaseUrl = (value) => (value || DEFAULT_API_URL).replace(/\/+$/, '');
const normalizeSiteUrl = (value) => (value || DEFAULT_SITE_URL).replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
const PUBLIC_BASE_URL = normalizeSiteUrl(process.env.EXPO_PUBLIC_SITE_URL);

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const REJECTED_API_KEY_MESSAGE = 'API key rejected by Sorola API. Update the saved API key and try again.';

export const getApiKey = async () => {
  const apiKey = await AsyncStorage.getItem(API_KEY_STORAGE_KEY);
  return apiKey ? apiKey.trim() : '';
};

export const setApiKey = async (key) => {
  const normalizedKey = typeof key === 'string' ? key.trim() : '';

  if (!normalizedKey) {
    await AsyncStorage.removeItem(API_KEY_STORAGE_KEY);
    return '';
  }

  await AsyncStorage.setItem(API_KEY_STORAGE_KEY, normalizedKey);
  return normalizedKey;
};

const parseResponse = async (response, { apiKeyWasSent = false } = {}) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (response.ok) {
    return data;
  }

  if ((response.status === 401 || response.status === 403) && apiKeyWasSent) {
    throw new ApiError(REJECTED_API_KEY_MESSAGE, response.status, data);
  }

  const errorMessage = (data && typeof data === 'object' && data.error)
    || (typeof data === 'string' && data)
    || 'Request failed. Please try again.';

  throw new ApiError(errorMessage, response.status, data);
};

const apiRequest = async (path, options = {}) => {
  const { headers = {}, includeApiKey = true, ...rest } = options;
  const apiKey = includeApiKey ? await getApiKey() : '';
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: {
      ...(apiKey ? { 'X-API-Key': apiKey } : {}),
      ...headers,
    },
  });

  return parseResponse(response, { apiKeyWasSent: Boolean(apiKey) });
};

export const shortenUrl = async (url, domain) => {
  const params = new URLSearchParams({ url });

  if (domain) {
    params.append('domain', domain);
  }

  return apiRequest(`/lyhennin/create?${params.toString()}`);
};

export const createPaste = async (content) => apiRequest('/paste', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ content }),
});

export const createFeedback = async ({ name, email, message, appVersion }) => apiRequest('/reports', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    type: 'feedback',
    name,
    email,
    message,
    appVersion: appVersion || 'unknown',
    platform: 'android',
  }),
});

export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();

  // KORJAUS: Välilyönnit URI:ssa aiheuttavat React Nativen fetchissä "Network request failed" virheen.
  const safeUri = file.uri.replace(/ /g, '%20');

  formData.append('file', {
    uri: safeUri,
    name: file.name,
    type: file.mimeType || file.type || 'application/octet-stream',
  });

  Object.entries(options).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      formData.append(key, String(value));
    }
  });

  return apiRequest('/upload', {
    method: 'POST',
    body: formData,
    // File sharing is public and does not use the optional saved API key.
    // Sending a stale key can cause a proxy to reject an otherwise valid upload.
    includeApiKey: false,
    headers: {
      Accept: 'application/json',
    },
  });
};

export const buildPasteUrl = (pastePath) => `${PUBLIC_BASE_URL}/p/${pastePath}`;
export const buildShareUrl = (shareId) => `${PUBLIC_BASE_URL}/d/${shareId}`;

export { ApiError, API_BASE_URL, PUBLIC_BASE_URL, API_KEY_STORAGE_KEY };
