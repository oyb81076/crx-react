import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import contentLoader from './content/content-loader.js'
import Content from './content/Content.js';

contentLoader();

window.addEventListener('load', ()=> {
  const root = document.createElement('div');
  document.body.insertAdjacentElement('afterend', root);
  createRoot(root).render(
    <StrictMode>
      <Content />
    </StrictMode>
  );
})