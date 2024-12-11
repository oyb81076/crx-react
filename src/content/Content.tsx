import { useState } from "react"
import './content.scss';

export default function Content(): React.ReactNode {
  const [open, setOpen] = useState(true);
  if (!open) return null;
  return (
    <div className="content-scripts" onClick={()=> setOpen(false)}>
      Content Scripts
    </div>
  )
}