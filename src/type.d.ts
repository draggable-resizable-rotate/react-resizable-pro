import Graphics, {
  Direction, Size, Position,
} from '@shepijcanwu/graphics';

import React from 'react';
declare namespace Resizable {
  type ResizableDirection = Direction;
  type ElementRect = Graphics.ElementRect;
  type ResizeBounds = Omit<ElementRect, 'width' | 'height' | 'x' | 'y'>;

  interface Enable {
    top?: boolean;
    right?: boolean;
    bottom?: boolean;
    left?: boolean;
    topRight?: boolean;
    bottomRight?: boolean;
    bottomLeft?: boolean;
    topLeft?: boolean;
  }

  interface HandleStyles {
    top?: React.CSSProperties;
    right?: React.CSSProperties;
    bottom?: React.CSSProperties;
    left?: React.CSSProperties;
    topRight?: React.CSSProperties;
    bottomRight?: React.CSSProperties;
    bottomLeft?: React.CSSProperties;
    topLeft?: React.CSSProperties;
  }

  interface HandleClassName {
    top?: string;
    right?: string;
    bottom?: string;
    left?: string;
    topRight?: string;
    bottomRight?: string;
    bottomLeft?: string;
    topLeft?: string;
  }

  interface HandleComponent {
    top?: React.ReactElement<any>;
    right?: React.ReactElement<any>;
    bottom?: React.ReactElement<any>;
    left?: React.ReactElement<any>;
    topRight?: React.ReactElement<any>;
    bottomRight?: React.ReactElement<any>;
    bottomLeft?: React.ReactElement<any>;
    topLeft?: React.ReactElement<any>;
  }

  interface ResizableState {
    isResizing: boolean;
    size?: Size;
    position?: Position;
    rotate?: number;
    scale?: number;
    backgroundStyle: React.CSSProperties;
  }

  interface Delta {
    position: Position;
    size: Size,
    rotate: number;
  }

  type ResizeStartCallback = (
    e: React.MouseEvent,
    dir: ResizableDirection,
    delta: Delta,
  ) => void | boolean;

  type ResizeCallback = (event: MouseEvent, direction: ResizableDirection, delta: Delta) => void;

  export interface ResizableProps {
    as?: string | React.ComponentType<any>;
    style?: React.CSSProperties;
    className?: string;
    grid?: [number, number];
    snap?: {
      x?: number[];
      y?: number[];
    };
    snapGap?: number;
    bounds?: string | ResizableBounds;
    // 添加需要的状态
    size?: Size;
    position?: Position;
    rotate?: number;
    minWidth?: number;
    minHeight?: number;
    maxWidth?: number;
    maxHeight?: number;
    lockAspectRatio?: boolean | number;
    enable?: Enable;
    handleStyles?: HandleStyles;
    handleClasses?: HandleClassName;
    handleWrapperStyle?: React.CSSProperties;
    handleWrapperClass?: string;
    handleComponent?: HandleComponent;
    children?: React.ReactNode;
    onResizeStart?: ResizeStartCallback;
    onResize?: ResizeCallback;
    onResizeStop?: ResizeCallback;
    defaultSize?: Size;
    defaultPosition?: Position;
    scale?: number;
    resizeRatio?: number;
    canResizable?: boolean;
    priorityStyle?: React.CSSProperties;
  }



  export default class Resizable extends React.PureComponent<
    ResizableProps,
    ResizableState
  > {
    resizableRef: React.RefObject<HTMLElement>;
  }
}

export = Resizable
export as namespace Resizable
export default Resizable;
