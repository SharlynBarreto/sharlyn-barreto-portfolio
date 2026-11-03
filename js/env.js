/* Environment flags, read once. Every motion module takes these as input
   instead of querying globals, so each can be tested with fake flags. */
export const readEnv = (win = window) => ({
  still: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
  fine: win.matchMedia('(hover: hover) and (pointer: fine)').matches, // mouse/trackpad, not touch
  gsap: win.gsap, ScrollTrigger: win.ScrollTrigger, Draggable: win.Draggable,
});
