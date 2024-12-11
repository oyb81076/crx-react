import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import Popup from './popup/Popup.js'

createRoot(document.querySelector('root')!).render(
  <StrictMode>
    <Popup />
  </StrictMode>
)