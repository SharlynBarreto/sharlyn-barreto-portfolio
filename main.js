/* Sharlyn Barreto - portfolio interactions
   Two pieces need script: the Selected Works files (choosing a folder tab
   slides that project's folder to the front) and the Stack tabs (picking a
   category swaps the tile panel). Both work without JS: the first file sits
   in front and every stack panel shows.
   Motion modules (js/) layer GSAP on top; they are skipped for reduced
   motion or when GSAP fails to load, leaving the static page intact. */

import { readEnv } from './js/env.js';
import { initHero } from './js/hero.js';
import { initCursor } from './js/cursor.js';
import { initProgressNav } from './js/progressNav.js';
import { initTilt } from './js/tilt.js';
import { initCounters } from './js/counters.js';
import { initTimeline } from './js/timeline.js';
import { initStackDrop } from './js/stackDrop.js';
import { initTheme } from './js/theme.js';
import { initReveals } from './js/reveals.js';

(() => {

    const still = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* project files: choosing a folder moves it to the front slot; the rest keep
       their order behind it. Slots drive the CSS cascade (--slot). */
    const folders = [...document.querySelectorAll('.folder')];
    const ftabs = folders.map((f) => f.querySelector('.folder-tab'));
    const openFile = (idx, focus) => {
      const order = folders.map((_, i) => i).filter((i) => i !== idx).concat(idx);
      folders.forEach((f, i) => {
        const on = i === idx;
        f.style.setProperty('--slot', order.indexOf(i));
        ftabs[i].setAttribute('aria-selected', on);
        ftabs[i].tabIndex = on ? 0 : -1;
        f.querySelector('.folder-body').inert = !on;
      });
      if (focus) ftabs[idx].focus();
    };
    ftabs.forEach((t, i) => {
      t.addEventListener('click', () => openFile(i));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); openFile(e.key === 'Home' ? 0 : ftabs.length - 1, true); }
        else if (d) { e.preventDefault(); openFile((i + d + ftabs.length) % ftabs.length, true); }
      });
    });

    /* stack tabs: WAI-ARIA tablist, vertical, arrow keys move between categories */
    const tabs = [...document.querySelectorAll('.stack-tab')];
    const select = (tab, focus) => {
      tabs.forEach((t) => {
        const on = t === tab;
        t.setAttribute('aria-selected', on);
        t.tabIndex = on ? 0 : -1;
        const panel = document.getElementById(t.getAttribute('aria-controls'));
        panel.hidden = !on;
        panel.classList.toggle('in', on && !still);
        panel.querySelectorAll('li').forEach((li, i) => li.style.setProperty('--i', i));
      });
      if (focus) tab.focus();
    };
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => select(t));
      t.addEventListener('keydown', (e) => {
        const d = { ArrowDown: 1, ArrowRight: 1, ArrowUp: -1, ArrowLeft: -1 }[e.key];
        if (e.key === 'Home' || e.key === 'End') { e.preventDefault(); select(tabs[e.key === 'Home' ? 0 : tabs.length - 1], true); }
        else if (d) { e.preventDefault(); select(tabs[(i + d + tabs.length) % tabs.length], true); }
      });
    });
    if (tabs.length) select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  })();

/* motion layer: GSAP-driven, gated on environment */
const env = readEnv();
const root = document.documentElement;
initTheme(document.querySelector('.theme-toggle'), env); // works without GSAP too
if (env.gsap && env.ScrollTrigger) {
  env.gsap.registerPlugin(...[env.ScrollTrigger, env.Draggable].filter(Boolean));
  root.classList.add('gsap-on'); // GSAP owns tile motion; CSS tile-in steps aside
  initProgressNav(document, env, [['about', 'About'], ['works', 'Works'], ['experience', 'Experience'], ['leadership', 'Leadership'], ['stack', 'Stack'], ['contact', 'Contact']]);
  if (!env.still) {
    initHero(document.querySelector('.hero'), env);
    initReveals(document, env);
    initTimeline(document.querySelector('.xp-grid'), env);
    initStackDrop(document.getElementById('stack'), env);
    initCounters([...document.querySelectorAll('[data-count]')], env);
    if (env.fine) {
      initCursor(document, env);
      initTilt([...document.querySelectorAll('[data-tilt]')], env);
    }
  }
}
root.classList.add('motion-ready'); // reveals the hero (see .js .h-grid in styles.css)
