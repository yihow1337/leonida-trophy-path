// The checklist pane: one row per trophy with checkbox, grade medal, official text and flags.
import { el, clear, formatCount } from './dom.js';
import { KIND_LABEL, isMasked, matchesFilters } from './filters.js';

const GRADE_LETTER = { platinum: 'P', gold: 'G', silver: 'S', bronze: 'B' };

export function gradeMedal(grade) {
  return el('span', { class: `medal medal-${grade}`, title: grade }, GRADE_LETTER[grade]);
}

export function trophyFlags(trophy, { compact = false } = {}) {
  return [
    el('span', { class: `tag kind-${trophy.kind}` }, KIND_LABEL[trophy.kind]),
    trophy.missable && el('span', { class: 'tag tag-missable' }, '⚠ Missable'),
    !trophy.missable && trophy.watch && el('span', { class: 'tag tag-watch' }, '◷ Watch'),
    trophy.count && el('span', { class: 'tag tag-count' }, `${formatCount(trophy.count)} ${compact ? '' : trophy.countLabel ?? ''}`.trim()),
    !compact && trophy.hidden && el('span', { class: 'tag tag-secret', title: 'Hidden on PlayStation until earned' }, 'PSN secret'),
  ];
}

function trophyText(trophy, masked) {
  if (!masked) {
    return [
      el('span', { class: 'row-name' }, trophy.name),
      el('span', { class: 'row-desc' }, trophy.description),
    ];
  }
  const where = trophy.chapter ? `Chapter ${trophy.chapter} story trophy` : 'Secret trophy';
  return [
    el('span', { class: 'row-name masked' }, `🔒 ${where}`),
    el('span', { class: 'row-desc masked' }, 'Name and description hidden until earned (spoiler setting).'),
  ];
}

export function renderChecklist(root, trophies, state, actions) {
  const shown = trophies.filter((t) => matchesFilters(t, state));
  const rows = shown.map((trophy) => {
    const earned = state.earned.has(trophy.id);
    const masked = isMasked(trophy, state);
    return el('article', {
      class: `row${earned ? ' earned' : ''}${trophy.id === state.selected ? ' selected' : ''}${trophy.missable ? ' is-missable' : ''}`,
      onclick: () => actions.select(trophy.id),
    },
      el('input', {
        type: 'checkbox', class: 'check', checked: earned, 'aria-label': `Mark trophy ${trophy.id} earned`,
        onclick: (e) => e.stopPropagation(),
        onchange: (e) => actions.toggle(trophy.id, e.target.checked),
      }),
      gradeMedal(trophy.grade),
      el('div', { class: 'row-text' }, trophyText(trophy, masked)),
      el('div', { class: 'row-flags' }, trophyFlags(trophy, { compact: true })),
    );
  });
  const maskedCount = trophies.filter((t) => isMasked(t, state)).length;
  clear(root,
    el('header', { class: 'pane-head' },
      el('strong', {}, `${shown.length} trophies`),
      el('span', {}, state.kind === 'all' && state.grade === 'all' && !state.query ? 'official list order' : 'filtered'),
    ),
    maskedCount > 0 && el('p', { class: 'spoiler-banner' },
      el('strong', {}, `🔒 ${maskedCount} ${state.spoilers === 'story' ? 'story' : 'secret'} trophies hidden`),
      ' — names, descriptions and guides appear once you tick them. ',
      el('button', { type: 'button', class: 'linkish', onclick: () => actions.setSpoilers('off') }, 'Show all')),
    rows.length ? rows : el('p', { class: 'empty' }, 'No trophy matches these filters.'),
  );
}
