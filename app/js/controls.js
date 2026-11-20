// Header and filter bar: progress meter, spoiler switch, view tabs, kind and grade chips.
import { el, clear } from './dom.js';
import { KINDS, GRADES, SPOILER_MODES, countByKind } from './filters.js';

export function renderProgress(root, trophies, state) {
  const earned = trophies.filter((t) => state.earned.has(t.id));
  const pct = Math.round((earned.length / trophies.length) * 100);
  const byGrade = (g) => `${earned.filter((t) => t.grade === g).length}/${trophies.filter((t) => t.grade === g).length}`;
  const missLeft = trophies.filter((t) => t.missable && !state.earned.has(t.id)).length;
  clear(root,
    el('div', { class: 'progress-line' },
      el('strong', { class: 'progress-big' }, `${earned.length}/${trophies.length}`),
      el('span', { class: 'progress-pct' }, `${pct}%`),
      el('span', { class: 'progress-grades' },
        el('b', { class: 'g-platinum' }, `P ${byGrade('platinum')}`),
        el('b', { class: 'g-gold' }, `G ${byGrade('gold')}`),
        el('b', { class: 'g-silver' }, `S ${byGrade('silver')}`),
        el('b', { class: 'g-bronze' }, `B ${byGrade('bronze')}`)),
    ),
    el('div', { class: 'bar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 },
      el('span', { style: `width:${pct}%` })),
    el('p', { class: 'progress-note' }, missLeft ? `⚠ ${missLeft} missable left · saved in this browser` : 'No missables left · saved in this browser'),
  );
}

export function renderSpoilerControl(root, state, actions) {
  clear(root,
    el('span', { class: 'spoiler-label' }, state.spoilers === 'off' ? '👁 Spoilers shown' : '🔒 Spoilers hidden'),
    el('div', { class: 'seg' }, SPOILER_MODES.map((m) => el('button', {
      type: 'button', class: m.id === state.spoilers ? 'on' : '', 'aria-pressed': String(m.id === state.spoilers),
      onclick: () => actions.setSpoilers(m.id),
    }, m.label))),
  );
}

export function renderFilterBar(parts, trophies, state, actions) {
  clear(parts.tabs, [['list', 'Checklist + guide'], ['roadmap', 'Roadmap to platinum']].map(([id, label]) =>
    el('button', { type: 'button', role: 'tab', class: state.view === id ? 'on' : '', 'aria-selected': String(state.view === id), onclick: () => actions.setView(id) }, label)));
  const counts = countByKind(trophies);
  clear(parts.kinds, KINDS.map((k) =>
    el('button', { type: 'button', class: `chip chip-${k.id}${state.kind === k.id ? ' on' : ''}`, onclick: () => actions.setKind(k.id) },
      k.label, el('span', { class: 'chip-n' }, counts[k.id]))));
  clear(parts.grades, GRADES.map((g) =>
    el('button', { type: 'button', class: `chip grade-chip g-${g}${state.grade === g ? ' on' : ''}`, onclick: () => actions.setGrade(g) },
      g === 'all' ? 'Any grade' : g[0].toUpperCase() + g.slice(1))));
}
