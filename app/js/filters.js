// Kind and grade vocabularies, the filter predicate, and spoiler masking rules.

export const KINDS = [
  { id: 'all', label: 'All' },
  { id: 'story', label: 'Story' },
  { id: 'missable', label: 'Missable / watch' },
  { id: 'collectible', label: 'Collectibles' },
  { id: 'activity', label: 'Activities' },
  { id: 'strand', label: 'Strands' },
  { id: 'crime', label: 'Crime' },
  { id: 'money', label: 'Money' },
  { id: 'feat', label: 'Feats' },
];

export const KIND_LABEL = {
  story: 'Story', collectible: 'Collectible', activity: 'Activity', strand: 'Strand',
  crime: 'Crime', money: 'Money', feat: 'Feat', completion: '100%',
};

export const GRADES = ['all', 'platinum', 'gold', 'silver', 'bronze'];

export const SPOILER_MODES = [
  { id: 'off', label: 'Show all' },
  { id: 'story', label: 'Hide story' },
  { id: 'hidden', label: 'Hide all secret' },
];

export function isMasked(trophy, state) {
  if (state.earned.has(trophy.id) || state.revealed.has(trophy.id)) return false;
  if (state.spoilers === 'story') return trophy.kind === 'story';
  if (state.spoilers === 'hidden') return trophy.hidden;
  return false;
}

export function matchesKind(trophy, kind) {
  if (kind === 'all') return true;
  if (kind === 'missable') return Boolean(trophy.missable || trophy.watch);
  return trophy.kind === kind;
}

export function matchesFilters(trophy, state) {
  if (!matchesKind(trophy, state.kind)) return false;
  if (state.grade !== 'all' && trophy.grade !== state.grade) return false;
  const q = state.query.trim().toLowerCase();
  if (!q) return true;
  const visible = isMasked(trophy, state)
    ? [trophy.grade, KIND_LABEL[trophy.kind]]
    : [trophy.name, trophy.description, trophy.guide, trophy.mission, trophy.character, KIND_LABEL[trophy.kind]];
  return visible.some((s) => s && s.toLowerCase().includes(q));
}

export function countByKind(trophies) {
  const counts = { all: trophies.length };
  for (const k of KINDS) if (k.id !== 'all') counts[k.id] = trophies.filter((t) => matchesKind(t, k.id)).length;
  return counts;
}
