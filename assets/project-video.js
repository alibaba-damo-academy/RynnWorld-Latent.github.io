(() => {
 const tabs = [...document.querySelectorAll('.film-tabs [role="tab"]')];
 function select(tab) {
  tabs.forEach(t => {
   const active = t === tab, panel = document.getElementById(t.getAttribute('aria-controls'));
   t.setAttribute('aria-selected', String(active)); t.tabIndex = active ? 0 : -1; panel.hidden = !active;
   const frame = panel.querySelector('iframe'), video = panel.querySelector('video');
   if (frame) {
    if (!active && frame.hasAttribute('src')) { frame.dataset.src = frame.getAttribute('src'); frame.removeAttribute('src'); }
    if (active && !frame.hasAttribute('src') && frame.dataset.src) frame.src = frame.dataset.src;
   }
   if (!active && video) video.pause();
  });
 }
 tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => select(tab));
  tab.addEventListener('keydown', event => {
   let n;
   if (event.key === 'ArrowRight') n = (i+1)%tabs.length;
   else if (event.key === 'ArrowLeft') n = (i+tabs.length-1)%tabs.length;
   else if (event.key === 'Home') n = 0;
   else if (event.key === 'End') n = tabs.length-1;
   else return;
   event.preventDefault(); select(tabs[n]); tabs[n].focus();
  });
 });
})();
