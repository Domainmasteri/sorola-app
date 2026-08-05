const DEFAULT_API_URL = 'https://api.sorola.fi';
const DEFAULT_SITE_URL = 'https://sorola.fi';

const normalizeBaseUrl = (value) => (value || DEFAULT_API_URL).replace(/\/+$/, '');
const normalizeSiteUrl = (value) => (value || DEFAULT_SITE_URL).replace(/\/+$/, '');

const API_BASE_URL = normalizeBaseUrl(process.env.EXPO_PUBLIC_API_URL);
const API_KEY = process.env.EXPO_PUBLIC_API_KEY;
const PUBLIC_BASE_URL = normalizeSiteUrl(process.env.EXPO_PUBLIC_SITE_URL);

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

const getMissingApiKeyMessage = () => 'API key missing. Set EXPO_PUBLIC_API_KEY to use Sorola API.';
const getRejectedApiKeyMessage = () => 'API key rejected by Sorola API. Check EXPO_PUBLIC_API_KEY.';

const buildHeaders = (headers = {}) => {
  if (!API_KEY) {
    throw new ApiError(getMissingApiKeyMessage(), 0);
  }

  return {
    'X-API-Key': API_KEY,
    ...headers,
  };
};

const parseResponse = async (response) => {
  const contentType = response.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const data = isJson ? await response.json() : await response.text();

  if (response.ok) {
    return data;
  }

  if (response.status === 401 || response.status === 403) {
    throw new ApiError(getRejectedApiKeyMessage(), response.status, data);
  }

  const errorMessage = (data && typeof data === 'object' && data.error)
    || (typeof data === 'string' && data)
    || 'Request failed. Please try again.';

  throw new ApiError(errorMessage, response.status, data);
};

const apiRequest = async (path, options = {}) => {
  const { headers, ...rest } = options;
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...rest,
    headers: buildHeaders(headers),
  });

  return parseResponse(response);
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

export const uploadFile = async (file, options = {}) => {
  const formData = new FormData();

  formData.append('file', {
    uri: file.uri,
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
    headers: {
      Accept: 'application/json',
    },
  });
};

export const buildPasteUrl = (path) => `${PUBLIC_BASE_URL}/p/${path}`;
export const buildShareUrl = (id) => `${PUBLIC_BASE_URL}/d/${id}`;

export { ApiError, API_BASE_URL, PUBLIC_BASE_URL };
