import Graphics from '@shepijcanwu/graphics';
import DraggableProvider, { MouseEventPoint } from '@shepijcanwu/react-draggable-provider';
declare namespace Draggable {
  interface DraggableHandleFunMap {
    onMouseDown: (event: React.MouseEvent, delta: Delta, position: Position) => any;
    onMouseMove: (event: MouseEvent, delta: Delta, position: Position) => any;
    onMouseUp: (event: MouseEvent, delta: Delta, position: Position) => any;
  }
  type DraggableMouseHandle = DraggableHandleFunMap;
  type DraggableBounds = Omit<Graphics.ElementRect, 'width' | 'height' | 'x' | 'y'>;

  type DraggableProps = Partial<DraggableMouseHandle> & {
    position?: Position;
    // 默认的 position，一次性效果
    defaultPosition?: Position;
    axis?: 'both' | 'x' | 'y' | 'none';
    handle?: string;
    grid?: [number, number];
    // 'window' | 'parent' | elementSelector | DraggableBounds
    bounds?: string | DraggableBounds;
    nodeRef?: React.RefObject<HTMLElement>;
    enableUserSelectHack?: boolean;
    scale?: number;
    canMoveable?: boolean;
    rotate?: number;
    moveRatio?: number;
    children?: React.ReactElement;
  };

  type ClientPoint = MouseEventPoint;

  interface DraggableState {
    position?: Position;
    rotate?: number;
    scale?: number;
    dragging: boolean;
  }

  interface MouseDownCache {
    clientPoint: ClientPoint;
    position: Position;
    bounds: DraggableBounds | null;
    size: Graphics.Size;
  }


  export default class Draggable extends React.PureComponent<
    DraggableProps,
    DraggableState
  > {
    draggableProvider: React.RefObject<DraggableProvider>;
    mouseDownCache: Partial<MouseDownCache>;
  }
}

export = Draggable
export as namespace Draggable
export default Draggable;
