import React, { useEffect, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import Draggable from './Draggable';

function DraggableTest() {
  const [position, setPosition] = useState({
    left: 100,
    top: 100,
  });
  const first = useRef();

  useEffect(() => {
    console.log(first);
  }, []);

  const [canMoveable, setCanMoveable] = useState(true);
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLElement>();

  return (
    <div>
      <Draggable
        bounds="window"
        canMoveable={canMoveable}
        position={position}
        scale={2}
        // moveRatio={2}
        nodeRef={ref}
        onMouseUp={(e, d, position) => {
          // setCount(count => count + 1);
          // setPosition(position);
          // // setTimeout(() => {
          // //   setCanMoveable(false);
          // // }, 1000);
          // if (count > 100) {
          //   return false;
          // }
        }}
        rotate={45}
      >
        <span style={{ width: 100, height: 100, border: '1px solid' }} ref={ref}></span>
      </Draggable>
    </div>
  );
}

ReactDOM.render(
  <React.StrictMode>
    <DraggableTest />
  </React.StrictMode>,
  document.getElementById('root'),
);
