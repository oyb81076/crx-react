import { createRoot } from 'react-dom/client';

import App from './App.js';

function render() {
  const div = document.createElement('div');
  div.id = 'crx-app';
  Object.assign(div.style, {
    position: 'absolute', zIndex: 10000, top: 0, left: 0,
    fontSize: '12px', color: '#666',
  });
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
