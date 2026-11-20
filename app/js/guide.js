// The guide pane: the open trophy's official text, flags, written guide, steps and cited sources.
import { el, clear } from './dom.js';
import { isMasked } from './filters.js';
import { gradeMedal, trophyFlags } from './checklist.js';

function sourceLinks(keys, sources) {
  return el('ol', { class: 'sources' }, keys.map((key) => {
    const src = sources[key];
    const host = new URL(src.url).hostname.replace(/^www\./, '');
    return el('li', {}, el('a', { href: src.url, target: '_blank', rel: 'noopener noreferrer' }, src.name), el('span', { class: 'host' }, host));
  }));
}

// The 12 story trophies in play order, this one highlighted; masked ones stay masked.
function storyPath(trophy, data, state, actions) {
  const order = data.roadmap.find((s) => s.order)?.order ?? [];
  return el('div', { class: 'story-path' },
    el('h3', {}, 'Story path'),
    el('ol', {}, order.map((id) => {
      const t = data.trophies.find((x) => x.id === id);
      const masked = isMasked(t, state);
      return el('li', {
        class: `${t.id === trophy.id ? 'here' : ''}${state.earned.has(t.id) ? ' done' : ''}`,
        onclick: () => actions.select(t.id),
      },
        el('span', { class: 'sp-ch' }, `Ch.${t.chapter}`),
        el('span', { class: 'sp-name' }, masked ? '🔒 hidden' : t.name),
        !masked && el('span', { class: 'sp-mission' }, t.mission.replace(/ \(.*\)$/, '')));
    })),
  );
}

function lockedGuide(root, trophy, data, state, actions) {
  const stage = data.roadmap.find((s) => s.stage === trophy.roadmapStage);
  clear(root,
    el('div', { class: 'guide-locked' },
      el('p', { class: 'lock-icon', 'aria-hidden': 'true' }, '🔒'),
      el('h2', {}, trophy.chapter ? `Chapter ${trophy.chapter} story trophy` : 'Secret trophy'),
      el('p', {}, `${trophy.grade[0].toUpperCase()}${trophy.grade.slice(1)} · roadmap stage ${stage.stage}: ${stage.title}`),
      el('p', {}, 'The spoiler setting hides this trophy’s name, description and guide until you mark it earned.'),
      el('button', { class: 'btn', type: 'button', onclick: () => actions.reveal(trophy.id) }, 'Reveal this one'),
    ),
    trophy.kind === 'story' && storyPath(trophy, data, state, actions),
  );
}

export function renderGuide(root, trophy, data, state, actions) {
  if (!trophy) return clear(root, el('p', { class: 'empty' }, 'Pick a trophy to read its guide.'));
  if (isMasked(trophy, state)) return lockedGuide(root, trophy, data, state, actions);
  const stage = data.roadmap.find((s) => s.stage === trophy.roadmapStage);
  const earned = state.earned.has(trophy.id);
  clear(root,
    el('div', { class: 'guide-head' },
      gradeMedal(trophy.grade),
      el('div', {},
        el('h2', {}, trophy.name),
        el('p', { class: 'official' }, trophy.description),
        el('p', { class: 'meta' }, `${trophy.grade} · #${trophy.id}${trophy.hidden ? ' · secret on PSN' : ''}`),
      ),
      el('button', { class: `btn ${earned ? 'btn-on' : ''}`, type: 'button', onclick: () => actions.toggle(trophy.id, !earned) }, earned ? '✓ Earned' : 'Mark earned'),
    ),
    el('div', { class: 'guide-flags' }, trophyFlags(trophy),
      stage && el('button', { class: 'tag tag-stage', type: 'button', onclick: () => actions.showRoadmap(stage.stage) }, `Roadmap ${stage.stage}: ${stage.title}`),
      trophy.mission && el('span', { class: 'tag tag-mission' }, `${trophy.chapter ? `Ch.${trophy.chapter} · ` : ''}${trophy.mission}`)),
    el('div', { class: 'cited' }, el('h3', {}, `Sources for this guide (${trophy.sources.length})`), sourceLinks(trophy.sources, data.sources)),
    trophy.missable && el('p', { class: 'callout missable' }, el('strong', {}, 'Missable — '), trophy.missableWhy),
    trophy.watch && el('p', { class: 'callout watch' }, el('strong', {}, 'Watch — '), trophy.watch),
    el('h3', {}, 'Guide'),
    el('p', { class: 'guide-text' }, trophy.guide),
    trophy.steps?.length && el('ol', { class: 'steps' }, trophy.steps.map((s) => el('li', {}, s))),
    trophy.kind === 'story' && storyPath(trophy, data, state, actions),
  );
}
