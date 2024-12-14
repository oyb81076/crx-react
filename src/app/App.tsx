import { useEffect } from 'react';

import MarkCreator from './components/MarkCreator.js';
import Marks from './components/Marks.js';

import './app.scss';
// 这里需要有个store, 让我框框

export default function App(): React.ReactNode {
  useEffect(() => {
    return () => {};
  }, []);
  return (
    <>
      <MarkCreator />
      <div className="crx-app">
        <button className="crx-button">操作</button>
        <button className="crx-button">截屏</button>
      </div>
      <Marks />
    </>
  );
}
