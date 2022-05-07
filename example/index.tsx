import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
// import { ReactComponent as ProSvg } from '@/asset/svg/pro_icon.svg';
// import style from '../index.less';
import Resizable from './Resizable';
// import Draggable from '../components/Draggable';

export default function ResizableTest() {
  const [frame, setFrame] = useState({
    position: {
      left: 50,
      top: 50,
    },
    size: {
      width: 100,
      height: 100,
    },
    rotate: 30,
  });

  const [canMoveable, setCanMoveable] = useState(true);
  // const [count, setCount] = useState(0);
  console.log(frame);
  return (
    <div>
      <Resizable
        // bounds="parent"
        position={frame.position}
        size={frame.size}
        enable={{
          right: true,
          bottomRight: true,
          top: true,
          topLeft: true,
          topRight: true,
          bottomLeft: true,
          bottom: true,
          left: true,
        }}
        // canResizable={canMoveable}
        // className={style.app}
        rotate={frame.rotate}
        // lockAspectRatio={true}
        onResize={(e, d, delta) => {
          setFrame({
            position: { ...delta.position },
            size: { ...delta.size },
            rotate: delta.rotate,
          });
        }}
        style={{ width: 120, height: 100, border: '1px solid', display: 'block' }}
      >

      </Resizable>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <ResizableTest />
  </React.StrictMode>,
  document.getElementById('root'),
);
