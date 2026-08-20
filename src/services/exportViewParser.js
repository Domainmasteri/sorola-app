import forge from 'node-forge';
import { unzipSync } from 'fflate';

export class ExportViewError extends Error {
  constructor(code, message = code) {
    super(message);
    this.name = 'ExportViewError';
    this.code = code;
  }
}

const bytesToBinary = (bytes) => {
  const source = bytes instanceof Uint8Array ? bytes : Uint8Array.from(bytes);
  const parts = [];
  for (let offset = 0; offset < source.length; offset += 0x8000) {
    parts.push(String.fromCharCode(...source.subarray(offset, offset + 0x8000)));
  }
  return parts.join('');
};

const fromBinary = (value) => Uint8Array.from(value, (character) => character.charCodeAt(0));
const decodeUtf8 = (bytes) => forge.util.decodeUtf8(bytesToBinary(bytes));
const decodeBase64 = (value) => fromBinary(forge.util.decode64(value));

const unique = (values) => [...new Set(values.filter(Boolean).map((value) => String(value).trim()).filter(Boolean))];
const toText = (value) => (value === undefined || value === null ? '' : String(value));
const cleanCell = (value) => toText(value).replace(/[\r\n]+/g, ' · ');

const getBitwardenItems = (exportData) => {
  if (!exportData || !Array.isArray(exportData.items)) {
    throw new ExportViewError('INVALID_JSON');
  }
  return exportData.items;
};

const normalizeBitwarden = (exportData) => {
  const folders = new Map((Array.isArray(exportData.folders) ? exportData.folders : [])
    .map((folder) => [folder.id, folder.name]));

  return getBitwardenItems(exportData).map((item) => {
    const login = item.login || {};
    const folderName = folders.get(item.folderId);
    const service = [item.name, folderName].filter(Boolean).join(' / ') || 'Bitwarden item';
    const urls = unique((login.uris || []).map((entry) => entry && entry.uri));
    const extraFields = Array.isArray(item.fields) ? item.fields.filter(Boolean) : [];
    const extra = [
      extraFields.length ? `fields: ${JSON.stringify(extraFields)}` : '',
      item.notes ? `notes: ${item.notes}` : '',
    ].filter(Boolean).join('\n');

    return {
      service,
      url: urls.join('\n'),
      username: toText(login.username),
      password: toText(login.password),
      totp: toText(login.totp),
      extra,
    };
  });
};

const findZipEntry = (zip, names) => {
  const key = Object.keys(zip).find((entry) => names.includes(entry) || names.some((name) => entry.endsWith(`/${name}`)));
  return key ? zip[key] : null;
};

const parseProtonZip = (bytes) => {
  let zip;
  try {
    zip = unzipSync(bytes);
  } catch {
    if (bytesToBinary(bytes).includes('-----BEGIN PGP MESSAGE-----')) {
      throw new ExportViewError('ENCRYPTED_FILE');
    }
    throw new ExportViewError('INVALID_ZIP');
  }

  const json = findZipEntry(zip, ['Proton Pass/data.json', 'data.json']);
  if (json) {
    try {
      return JSON.parse(decodeUtf8(json));
    } catch {
      throw new ExportViewError('INVALID_JSON');
    }
  }

  const pgp = findZipEntry(zip, ['Proton Pass/data.pgp', 'data.pgp']);
  if (pgp) throw new ExportViewError('ENCRYPTED_FILE');
  throw new ExportViewError('MISSING_PROTON_DATA');
};

const collectProtonItems = (value, result = []) => {
  if (Array.isArray(value)) {
    value.forEach((entry) => collectProtonItems(entry, result));
    return result;
  }
  if (!value || typeof value !== 'object') return result;
  if (Array.isArray(value.items)) {
    value.items.forEach((item) => result.push(item));
    return result;
  }
  Object.values(value).forEach((entry) => collectProtonItems(entry, result));
  return result;
};

const normalizeProton = (exportData) => collectProtonItems(exportData.vaults).map((item) => {
  const data = item && item.data ? item.data : item || {};
  const metadata = data.metadata || {};
  const content = data.content || {};
  const urls = unique([
    ...(Array.isArray(content.urls) ? content.urls : []),
    ...(Array.isArray(content.autofillUrls) ? content.autofillUrls.map((entry) => entry && entry.url) : []),
  ]);
  const extraFields = Array.isArray(data.extraFields) ? data.extraFields.filter(Boolean) : [];

  return {
    service: toText(metadata.name) || 'Proton Pass item',
    url: urls.join('\n'),
    username: toText(content.itemUsername || content.itemEmail),
    password: toText(content.password),
    totp: toText(content.totpUri),
    extra: [
      extraFields.length ? `extraFields: ${JSON.stringify(extraFields)}` : '',
      metadata.note ? `notes: ${metadata.note}` : '',
    ].filter(Boolean).join('\n'),
  };
});

export const parseExportFile = ({ provider, bytes }) => {
  if (!(bytes instanceof Uint8Array)) throw new ExportViewError('INVALID_FILE');
  if (provider === 'bitwarden') {
    let data;
    try { data = JSON.parse(decodeUtf8(bytes)); } catch { throw new ExportViewError('INVALID_JSON'); }
    if (data.encrypted === true || data.passwordProtected === true || /^2\.[^|]+\|[^|]+\|/.test(data.data || '')) {
      throw new ExportViewError('ENCRYPTED_FILE');
    }
    return normalizeBitwarden(data);
  }
  if (provider === 'proton') {
    const data = parseProtonZip(bytes);
    return normalizeProton(data);
  }
  throw new ExportViewError('UNSUPPORTED_PROVIDER');
};

export const createExportCsv = (records, language = 'fi') => {
  const headers = language === 'en'
    ? ['Service', 'URL / app', 'Username / email', 'Password', 'TOTP key', 'Additional details']
    : ['Palvelu', 'URL / appi', 'Käyttäjänimi / sähköposti', 'Salasana', 'TOTP-avain', 'Lisätiedot'];
  const escape = (value) => {
    const cleaned = cleanCell(value);
    return `"${cleaned.replace(/"/g, '""')}"`;
  };
  return `\ufeff${[headers, ...records.map((record) => [record.service, record.url, record.username, record.password, record.totp, record.extra])]
    .map((row) => row.map(escape).join(';')).join('\r\n')}\r\n`;
};

export const bytesFromBase64 = (base64) => decodeBase64(base64);
