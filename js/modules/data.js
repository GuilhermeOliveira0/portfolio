const dataCache = new Map();

export async function fetchJsonArray(url) {
  if (dataCache.has(url)) {
    return dataCache.get(url);
  }

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(url + '_fetch_failed');
  }

  const data = await response.json();
  if (!Array.isArray(data)) {
    throw new Error(url + '_invalid_payload');
  }

  dataCache.set(url, data);
  return data;
}

export function toCleanString(value) {
  return typeof value === 'string' ? value.trim() : '';
}
