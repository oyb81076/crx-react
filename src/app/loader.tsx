import { createRoot } from 'react-dom/client';

import App from './App.js';

function render() {
  const div = document.createElement('div');
  div.id = 'crx-app';
  document.body.append(div);
  createRoot(div).render(
    <App />,
  );
}
if (document.readyState === 'complete') {
  render();
} else {
  window.addEventListener('load', render);
}
