// Progress and settings persistence: localStorage plus export to / import from a JSON file.

const PROGRESS_KEY = 'leonida-trophy-path:earned';
const SETTINGS_KEY = 'leonida-trophy-path:settings';
const FORMAT = 'leonida-trophy-path/progress@1';

export function loadEarned() {
  try {
    const ids = JSON.parse(localStorage.getItem(PROGRESS_KEY) ?? '[]');
    return new Set(Array.isArray(ids) ? ids.filter(Number.isInteger) : []);
  } catch {
    return new Set();
  }
}

export function saveEarned(earned) {
  localStorage.setItem(PROGRESS_KEY, JSON.stringify([...earned].sort((a, b) => a - b)));
}

export function loadSettings() {
  try {
    return { spoilers: 'story', ...JSON.parse(localStorage.getItem(SETTINGS_KEY) ?? '{}') };
  } catch {
    return { spoilers: 'story' };
  }
}

export function saveSettings(settings) {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
}

export function exportProgress(earned, trophies, settings) {
  const payload = {
    format: FORMAT,
    exportedAt: new Date().toISOString(),
    spoilers: settings.spoilers,
    earned: trophies.filter((t) => earned.has(t.id)).map((t) => ({ id: t.id, name: t.name })),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `leonida-trophy-progress-${payload.exportedAt.slice(0, 10)}.json`;
  link.click();
  setTimeout(() => URL.revokeObjectURL(link.href), 1000);
}

// Accepts this app's export, or a bare array of ids or official names.
export function parseImport(text, trophies) {
  const data = JSON.parse(text);
  const list = Array.isArray(data) ? data : data?.earned;
  if (!Array.isArray(list)) throw new Error('No "earned" list in that file.');
  const byName = new Map(trophies.map((t) => [t.name.toLowerCase(), t.id]));
  const ids = new Set(trophies.map((t) => t.id));
  const earned = new Set();
  for (const item of list) {
    const id = typeof item === 'number' ? item
      : typeof item === 'string' ? byName.get(item.toLowerCase())
      : item?.id ?? byName.get(String(item?.name).toLowerCase());
    if (ids.has(id)) earned.add(id);
  }
  return { earned, spoilers: data?.spoilers };
}
