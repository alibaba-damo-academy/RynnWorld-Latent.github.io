(() => {
  'use strict';
  const data = window.RYNN_GALLERY;
  if (!data) return;
  const platforms = ['All platforms', 'GR-1', 'Marvin-WUJI', 'Astribot-S1'];
  function video(item, label) {
    const el = document.createElement('video');
    el.src = item.src;
    el.poster = item.poster;
    el.controls = true;
    el.playsInline = true;
    el.preload = 'none';
    el.muted = true;
    el.setAttribute('aria-label', label);
    el.style.setProperty('--native-ratio', `${item.width} / ${item.height}`);
    return el;
  }
  function element(tag, className, text) {
    const el = document.createElement(tag);
    if (className) el.className = className;
    if (text) el.textContent = text;
    return el;
  }
  function generation(item) {
    const card = element('article', `selected-card${item.comparison ? ' comparison' : ''}`);
    const head = element('header');
    head.append(element('h3', '', item.title), element('span', 'case-type', item.comparison ? 'Reference / prediction' : 'Generated rollout'));
    card.append(head);
    if (item.comparison) {
      const legend = element('div', 'comparison-legend');
      legend.append(element('span', '', 'Ground-truth reference'), element('span', '', 'RynnWorld-Latent generation'));
      card.append(legend);
    }
    card.append(video(item, item.title));
    return card;
  }
  function following(item) {
    const card = element('article', 'selected-card following-card');
    const head = element('header');
    const play = element('button', 'play-comparison', 'Play both from the start');
    play.type = 'button';
    head.append(element('h3', '', item.title), play);
    card.append(head);
    const grid = element('div', 'following-grid');
    const clips = [];
    for (const [key, action] of [['gen_self', 'A'], ['gen_cross', 'B']]) {
      const figure = element('figure');
      const clip = video(item[key], `${item.title}: generated with action ${action}`);
      clips.push(clip);
      const caption = element('figcaption');
      caption.append(element('strong', '', `Same initial image + action ${action}`));
      caption.append(document.createTextNode(item[`task${action}`]));
      figure.append(clip, caption);
      grid.append(figure);
    }
    card.append(grid);
    const details = element('details');
    details.append(element('summary', '', 'Show the two recorded source-motion references'));
    const refs = element('div', 'reference-grid');
    for (const [key, action] of [['gt_a', 'A'], ['gt_b', 'B']]) {
      const figure = element('figure');
      const clip = video(item[key], `${item.title}: source motion ${action}`);
      clips.push(clip);
      figure.append(clip, element('figcaption', '', `Recorded source ${action} — ${item[`task${action}`]}`));
      refs.append(figure);
    }
    details.append(refs);
    card.append(details);
    play.addEventListener('click', async () => {
      play.disabled = true;
      const active = details.open ? clips : clips.slice(0, 2);
      try {
        await Promise.all(active.map(clip => new Promise((resolve, reject) => {
          clip.pause();
          clip.currentTime = 0;
          if (clip.readyState >= 3) return resolve();
          clip.addEventListener('canplay', resolve, {once: true});
          clip.addEventListener('error', reject, {once: true});
          clip.load();
        })));
        await Promise.all(active.map(clip => clip.play()));
        play.textContent = 'Replay comparison';
      } catch (_) { play.textContent = 'Try playing again'; }
      finally { play.disabled = false; }
    });
    return card;
  }
  for (const kind of ['generation', 'following']) {
    const root = document.getElementById(`${kind}-gallery`);
    if (!root) continue;
    let platform = 'All platforms', page = 0;
    const pageSize = kind === 'generation' ? 6 : 2;
    const toolbar = element('div', 'gallery-toolbar');
    const tabs = element('div', 'platform-tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', `Filter ${kind} examples by robot platform`);
    const count = element('span', 'gallery-count');
    count.setAttribute('aria-live', 'polite');
    const grid = element('div', 'selected-gallery');
    const pager = element('nav', 'gallery-pager');
    pager.setAttribute('aria-label', `${kind} gallery pages`);
    const previous = element('button', '', 'Previous');
    const next = element('button', '', 'Next');
    previous.type = next.type = 'button';
    const status = element('span');
    pager.append(previous, status, next);
    toolbar.append(tabs, count);
    root.append(toolbar, grid, pager);
    const buttons = platforms.map(name => {
      const button = element('button', '', name);
      button.type = 'button';
      button.addEventListener('click', () => { platform = name; page = 0; render(); });
      tabs.append(button);
      return button;
    });
    function render() {
      grid.querySelectorAll('video').forEach(clip => clip.pause());
      const list = data[kind].filter(item => platform === 'All platforms' || item.platform === platform);
      const pages = Math.ceil(list.length / pageSize);
      buttons.forEach((button, i) => button.setAttribute('aria-pressed', String(platforms[i] === platform)));
      grid.replaceChildren(...list.slice(page * pageSize, (page + 1) * pageSize).map(kind === 'generation' ? generation : following));
      count.textContent = `${list.length} ${kind === 'generation' ? 'rollouts' : 'controlled comparisons'}`;
      status.textContent = `${page + 1} / ${pages}`;
      previous.disabled = page === 0;
      next.disabled = page >= pages - 1;
    }
    previous.addEventListener('click', () => { page--; render(); root.scrollIntoView({block: 'start'}); });
    next.addEventListener('click', () => { page++; render(); root.scrollIntoView({block: 'start'}); });
    render();
  }
})();
