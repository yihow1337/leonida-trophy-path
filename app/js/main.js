// Entry point: loads the trophy data as a JSON module, holds the UI state, wires controls and deep links.
import data from '../data/trophies.json' with { type: 'json' };
import { loadEarned, saveEarned, loadSettings, saveSettings, exportProgress, parseImport } from './store.js';
import { renderChecklist } from './checklist.js';
import { renderGuide } from './guide.js';
import { renderRoadmap } from './roadmap.js';
import { renderProgress, renderSpoilerControl, renderFilterBar } from './controls.js';

const $ = (id) => document.getElementById(id);
const trophies = data.trophies;
const byId = new Map(trophies.map((t) => [t.id, t]));

const state = {
  earned: loadEarned(),
  revealed: new Set(),
  spoilers: loadSettings().spoilers,
  view: 'list',
  kind: 'all',
  grade: 'all',
  query: '',
  selected: 17,
  preview: false,
};

// Deep links such as #view=roadmap or #open=17&kind=activity&spoilers=story&earned=1,2,8
// set the view for one visit; an `earned` list there is a preview and is never saved.
function applyHash() {
  const p = new URLSearchParams(location.hash.slice(1));
  if (p.has('view')) state.view = p.get('view') === 'roadmap' ? 'roadmap' : 'list';
  if (p.has('open') && byId.has(Number(p.get('open')))) state.selected = Number(p.get('open'));
  if (p.has('kind')) state.kind = p.get('kind');
  if (p.has('grade')) state.grade = p.get('grade');
  if (p.has('q')) state.query = p.get('q');
  if (['off', 'story', 'hidden'].includes(p.get('spoilers'))) state.spoilers = p.get('spoilers');
  if (p.has('earned')) {
    state.earned = new Set(p.get('earned').split(',').map(Number).filter((id) => byId.has(id)));
    state.preview = true;
  }
  return p.get('stage');
}

function persist() {
  if (!state.preview) saveEarned(state.earned);
}

function toast(message) {
  const node = $('toast');
  node.textContent = message;
  node.hidden = false;
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => { node.hidden = true; }, 2600);
}

const actions = {
  select(id, switchToList = false) {
    state.selected = id;
    if (switchToList) state.view = 'list';
    render();
  },
  toggle(id, on) {
    if (on) state.earned.add(id); else state.earned.delete(id);
    persist();
    render();
  },
  reveal(id) {
    state.revealed.add(id);
    render();
  },
  setSpoilers(mode) {
    state.spoilers = mode;
    state.revealed.clear();
    saveSettings({ spoilers: mode });
    render();
  },
  setView(view) {
    state.view = view;
    render();
  },
  showRoadmap(stage) {
    state.view = 'roadmap';
    render();
    document.getElementById(`stage-${stage}`)?.scrollIntoView({ block: 'start' });
  },
  setKind(kind) { state.kind = kind; render(); },
  setGrade(grade) { state.grade = grade; render(); },
};

function render() {
  renderProgress($('progress'), trophies, state);
  renderSpoilerControl($('spoiler-ctl'), state, actions);
  renderFilterBar({ tabs: $('tabs'), kinds: $('kind-chips'), grades: $('grade-chips') }, trophies, state, actions);
  const onRoadmap = state.view === 'roadmap';
  $('view-list').hidden = onRoadmap;
  $('view-roadmap').hidden = !onRoadmap;
  document.body.classList.toggle('on-roadmap', onRoadmap);
  if (onRoadmap) {
    renderRoadmap($('view-roadmap'), data, state, actions);
  } else {
    renderChecklist($('checklist'), trophies, state, actions);
    renderGuide($('guide'), byId.get(state.selected), data, state, actions);
    document.querySelector('.row.selected')?.scrollIntoView({ block: 'nearest' });
  }
}

function wireStaticControls() {
  $('search').value = state.query;
  $('search').addEventListener('input', (e) => { state.query = e.target.value; render(); });
  $('export').addEventListener('click', () => {
    exportProgress(state.earned, trophies, state);
    toast(`Exported ${state.earned.size} earned trophies.`);
  });
  $('import').addEventListener('change', async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = parseImport(await file.text(), trophies);
      state.earned = result.earned;
      state.preview = false;
      persist();
      toast(`Imported ${result.earned.size} earned trophies.`);
      render();
    } catch (err) {
      toast(`Import failed: ${err.message}`);
    }
    e.target.value = '';
  });
  window.addEventListener('hashchange', () => { applyHash(); render(); });
}

const stage = applyHash();
wireStaticControls();
render();
if (stage) document.getElementById(`stage-${stage}`)?.scrollIntoView({ block: 'start' });
