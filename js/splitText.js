/* Wraps each character of an element's text nodes in <span class="ch">,
   keeping child elements (like the name's <span>) intact. The original text
   goes to aria-label so screen readers still read whole words.
   Returns the char spans in reading order. */
export function splitChars(el) {
  el.setAttribute('aria-label', [...el.childNodes].map((n) => n.textContent.trim()).filter(Boolean).join(' '));
  const chars = [];
  const walk = (node) => {
    [...node.childNodes].forEach((n) => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        [...n.textContent].forEach((c) => {
          if (c.trim() === '') { frag.append(c); return; }
          const s = document.createElement('span');
          s.className = 'ch'; s.textContent = c; s.setAttribute('aria-hidden', 'true');
          frag.append(s); chars.push(s);
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return chars;
}
