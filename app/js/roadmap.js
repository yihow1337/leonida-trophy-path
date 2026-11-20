// The roadmap view: the nine stages to the platinum, each with its trophies, counts and missable flags.
import { el, clear, formatCount } from './dom.js';
import { isMasked } from './filters.js';

function stagePill(trophy, state, actions) {
  const earned = state.earned.has(trophy.id);
  const masked = isMasked(trophy, state);
  const label = masked ? `🔒 Ch.${trophy.chapter ?? '?'} story` : trophy.name;
  return el('button', {
    type: 'button',
    class: `pill pill-${trophy.grade}${earned ? ' earned' : ''}${trophy.missable ? ' is-missable' : ''}`,
    onclick: () => actions.select(trophy.id, true),
  },
    el('span', { class: 'pill-check', 'aria-hidden': 'true' }, earned ? '✓' : ''),
    el('span', { class: 'pill-name' }, label),
    trophy.kind === 'story' && !masked && el('span', { class: 'pill-sub' }, `Ch.${trophy.chapter} · ${trophy.mission.replace(/ \(.*\)$/, '')}`),
    trophy.count && el('span', { class: 'pill-count' }, formatCount(trophy.count)),
    trophy.missable && el('span', { class: 'pill-flag' }, 'MISSABLE'),
    !trophy.missable && trophy.watch && el('span', { class: 'pill-watch' }, 'WATCH'),
  );
}

// A stage may list its trophies in play order (the story stage does); others keep list order.
function playOrder(stage, trophy) {
  const at = stage.order?.indexOf(trophy.id) ?? -1;
  return at === -1 ? 100 + trophy.id : at;
}

export function renderRoadmap(root, data, state, actions) {
  const cards = data.roadmap.map((stage) => {
    const members = data.trophies
      .filter((t) => t.roadmapStage === stage.stage)
      .sort((a, b) => playOrder(stage, a) - playOrder(stage, b));
    const done = members.filter((t) => state.earned.has(t.id)).length;
    const hasMissable = members.some((t) => t.missable);
    return el('section', {
      class: `stage${hasMissable ? ' stage-missable' : ''}${done === members.length ? ' stage-done' : ''}`,
      id: `stage-${stage.stage}`,
    },
      el('header', {},
        el('span', { class: 'stage-num' }, stage.stage),
        el('div', {}, el('h2', {}, stage.title), el('p', { class: 'stage-when' }, stage.when)),
        el('span', { class: 'stage-tally' }, `${done}/${members.length}`),
      ),
      el('p', { class: 'stage-summary' }, stage.summary),
      el('div', { class: 'pills' }, members.map((t) => stagePill(t, state, actions))),
      el('p', { class: 'stage-src' }, 'Sources: ', stage.sources.map((k, i) => [i ? ' · ' : '', el('a', { href: data.sources[k].url, target: '_blank', rel: 'noopener noreferrer' }, data.sources[k].name.split(' — ').pop())])),
    );
  });
  const missable = data.trophies.filter((t) => t.missable).map((t) => t.name).join(', ');
  clear(root, el('p', { class: 'legend' },
    el('strong', {}, '9 stages · 55 trophies · 1 playthrough'),
    el('span', {}, el('span', { class: 'pill-flag' }, 'MISSABLE'), ` ${missable} (Chapter 1 meditation)`),
    el('span', {}, el('span', { class: 'pill-watch' }, 'WATCH'), ' time-sensitive step, not missable'),
    el('span', {}, el('span', { class: 'pill-count' }, '42'), ' = count from the official wording or PSN tracker'),
  ), el('div', { class: 'stages' }, cards));
}
