export function addUserSelectStyles(doc: Document) {
  let styleEl = doc.getElementById('react-draggable-style-el') as HTMLStyleElement | null;

  if (!styleEl) {
    styleEl = doc.createElement('style');
    styleEl.type = 'text/css';
    styleEl.id = 'react-draggable-style-el';
    styleEl.innerHTML = '.react-draggable-transparent-selection *::-moz-selection {all: inherit;}\n';
    styleEl.innerHTML += '.react-draggable-transparent-selection *::selection {all: inherit;}\n';
    doc.getElementsByTagName('head')[0].appendChild(styleEl);
  }

  if (doc.body) {
    doc.body.classList.add('react-draggable-transparent-selection');
  }
}

export function removeUserSelectStyles(doc: Document) {
  if (doc.body) {
    doc.body.classList.remove('react-draggable-transparent-selection');
  }
  const selection = (doc.defaultView || window).getSelection();

  if (selection && selection.type !== 'Caret') {
    selection.removeAllRanges();
  }
}


export function getSafeObjectValue<T>(obj: T) {
  return JSON.parse(JSON.stringify(obj)) as T;
}
