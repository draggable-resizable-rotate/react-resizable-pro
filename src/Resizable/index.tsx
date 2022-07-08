import React from 'react';
import { Resizer, Direction } from './resizer';
import {
  Matrix,
  Line,
  Rect,
  getElementDocumentRect,
  getRelativePoint,
  Point,
  LineEquation,
  DirectionType,
  LineDirection,
  Size,
  Position,
  ElementRect,
} from '@draggable-resizable-rotate/graphics';
import {
  addUserSelectStyles,
  removeUserSelectStyles,
} from '@draggable-resizable-rotate/react-draggable-provider';

export type ResizableDirection = Direction;
export type ResizableBounds = Omit<ElementRect, 'width' | 'height' | 'x' | 'y'>;

interface MinMaxSize {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
}

interface ClientPoint {
  clientX: number;
  clientY: number;
}

export interface Enable {
  top?: boolean;
  right?: boolean;
  bottom?: boolean;
  left?: boolean;
  topRight?: boolean;
  bottomRight?: boolean;
  bottomLeft?: boolean;
  topLeft?: boolean;
}

export interface HandleStyles {
  top?: React.CSSProperties;
  right?: React.CSSProperties;
  bottom?: React.CSSProperties;
  left?: React.CSSProperties;
  topRight?: React.CSSProperties;
  bottomRight?: React.CSSProperties;
  bottomLeft?: React.CSSProperties;
  topLeft?: React.CSSProperties;
}

export interface HandleClassName {
  top?: string;
  right?: string;
  bottom?: string;
  left?: string;
  topRight?: string;
  bottomRight?: string;
  bottomLeft?: string;
  topLeft?: string;
}

export interface HandleComponent {
  top?: React.ReactElement<any>;
  right?: React.ReactElement<any>;
  bottom?: React.ReactElement<any>;
  left?: React.ReactElement<any>;
  topRight?: React.ReactElement<any>;
  bottomRight?: React.ReactElement<any>;
  bottomLeft?: React.ReactElement<any>;
  topLeft?: React.ReactElement<any>;
}

export interface ResizableDelta {
  position: Position;
  size: Size;
}

export type ResizeCallback = (
  event: MouseEvent,
  direction: Direction,
  delta: ResizableDelta,
) => void;

export type ResizeStartCallback = (
  e: React.MouseEvent,
  dir: Direction,
  delta: ResizableDelta,
) => void | boolean;

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
  transform?: string;
}

interface ResizableState {
  isResizing: boolean;
  size?: Size;
  position?: Position;
  rotate?: number;
  scale?: number;
  backgroundStyle: React.CSSProperties;
}

const definedProps = [
  'as',
  'style',
  'className',
  'grid',
  'snap',
  'bounds',
  'size',
  'defaultSize',
  'minWidth',
  'minHeight',
  'maxWidth',
  'maxHeight',
  'lockAspectRatio',
  'enable',
  'handleStyles',
  'handleClasses',
  'handleWrapperStyle',
  'handleWrapperClass',
  'children',
  'onResizeStart',
  'onResize',
  'onResizeStop',
  'handleComponent',
  'scale',
  'resizeRatio',
  'snapGap',
  'position',
  'defaultPosition',
  'rotate',
  'canResizable',
];

interface MouseDownCache {
  bounds?: ResizableBounds | null;
  minMaxSize?: MinMaxSize;
  rotateData?: {
    rotateRect: ReturnType<typeof getRotateRectPoints>;
    fixWidthLineEquation: LineEquation;
    fixHeightLineEquation: LineEquation;
    directionStartPoint: Point;
    directionType: DirectionType;
    diagonal: {
      fixedPoint: {
        index: number;
        position: Point;
      };
      apexAnglePoint: {
        index: number;
        position: Point;
      };
    };
    diagonalLineEquation: LineEquation;
  };
  clientPoint?: ClientPoint;
  ratio?: number;
  position?: Position;
  size?: Size;
}

const { parseMatrix } = Matrix;

const {
  drawRect,
  getOppositeDirection,
  getRotateRectPoints,
  getValidDirectionIndex,
  RECT_DIRECT,
  RECT_LINE_DIRECTION,
} = Rect;
const {
  get2LineIntersectionPoint,
  getLineEquation,
  getLineEquationByRotateAndPoint,
  getPointToLineDistance,
} = Line;

export default class Resizable extends React.PureComponent<ResizableProps, ResizableState> {
  resizableRef: React.RefObject<HTMLElement>;

  mouseDownCache: MouseDownCache;

  constructor(props: ResizableProps) {
    super(props);
    this.state = {
      size: this.props.size || this.props.defaultSize,
      position: this.props.position || this.props.defaultPosition,
      rotate: this.props.rotate,
      scale: this.props.scale,
      isResizing: false,
      backgroundStyle: {
        height: '100%',
        width: '100%',
        backgroundColor: 'rgba(0,0,0,0)',
        cursor: 'auto',
        opacity: 0,
        position: 'fixed',
        zIndex: 9999,
        top: '0',
        left: '0',
        bottom: '0',
        right: '0',
        transform: 'scale(1.2)',
      },
    };
    this.onMouseDown = this.onMouseDown.bind(this);
    this.onMouseMove = this.onMouseMove.bind(this);
    this.onMouseUp = this.onMouseUp.bind(this);
    this.resizableRef = React.createRef<HTMLElement>();
    this.mouseDownCache = {};
  }

  componentDidMount() {
    const { state } = this;
    const { position, size } = state;
    const element = this.resizableRef.current as HTMLElement;

    const newState: Partial<Pick<ResizableState, 'position' | 'size' | 'rotate'>> = {};
    // 如果没有初始size
    if (!size) {
      Object.assign(newState, {
        size: {
          width: element.offsetWidth,
          height: element.offsetHeight,
        },
      });
    }
    // 如果没有初始position、rotate
    if (!position || state.rotate === undefined || state.scale === undefined) {
      const transformStr = element.style.transform || window.getComputedStyle(element).transform;
      let left = 0;
      let top = 0;
      let rotate = 0;
      let scale = 1;
      if (transformStr && transformStr !== 'none') {
        const matrix = parseMatrix(transformStr);
        left = matrix?.translateX || 0;
        top = matrix?.translateY || 0;
        rotate = matrix?.rotate || 0;
        scale = matrix?.scaleX || 1;
      }
      if (state.rotate === undefined) {
        Object.assign(newState, {
          rotate,
        });
      }
      if (!position) {
        Object.assign(newState, {
          position: {
            left,
            top,
          },
        });
      }
      if (state.rotate === undefined) {
        Object.assign(newState, {
          scale,
        });
      }
    }
    if (Object.keys(newState).length) {
      this.setState(newState);
    }
  }

  // 获取矩形旋转之后的位置
  getRotateRect(options: {
    position: Position;
    size: Size;
    rotate: number;
    direction: Direction;
  }): MouseDownCache['rotateData'] {
    const { position, size, rotate, direction } = options;
    // 获取元素旋转的属性
    const rotateRect = getRotateRectPoints({ ...position, ...size }, rotate);
    const directionStartPoint: Point = rotateRect[direction];
    // 记录角点的位置信息
    const hRotate = rotate;
    const vRotate = 90 + rotate;
    // 触发的方向是顶角还是四边
    let directionType: DirectionType;
    if (RECT_LINE_DIRECTION.includes(direction as LineDirection)) {
      directionType = 'line';
    } else {
      directionType = 'apex-angle';
    }
    // 固定点 顺时针
    let { oppositeIndex: fixedPointIndex, currentIndex: apexAnglePointIndex } =
      getOppositeDirection(direction);
    const validIndex = getValidDirectionIndex;
    // 是线 往前走一个点位
    if (directionType === 'line') {
      fixedPointIndex = validIndex(fixedPointIndex + 1);
      apexAnglePointIndex = validIndex(apexAnglePointIndex + 1);
    }

    // 固定点的位置信息
    const fixedPointPosition = rotateRect[RECT_DIRECT[fixedPointIndex]];
    // 对点信息
    const apexAnglePointPosition = rotateRect[RECT_DIRECT[apexAnglePointIndex]];
    // 对角的方程
    const diagonalLineEquation = getLineEquation(apexAnglePointPosition, fixedPointPosition);
    const fixWidthLineEquation = getLineEquationByRotateAndPoint(fixedPointPosition, hRotate);
    const fixHeightLineEquation = getLineEquationByRotateAndPoint(fixedPointPosition, vRotate);

    return {
      rotateRect,
      fixWidthLineEquation,
      fixHeightLineEquation,
      directionStartPoint,
      directionType,
      diagonal: {
        fixedPoint: {
          index: fixedPointIndex,
          position: fixedPointPosition,
        },
        apexAnglePoint: {
          index: apexAnglePointIndex,
          position: apexAnglePointPosition,
        },
      },
      diagonalLineEquation,
    };
  }

  getRotateElementRect(clientPoint: ClientPoint, direction: Direction) {
    const { rotate } = this.state as Required<ResizableState>;
    const { lockAspectRatio, resizeRatio = 1, scale = 1 } = this.props;
    const hRotate = rotate;
    const vRotate = 90 + rotate;
    const {
      clientPoint: lastClientPoint,
      rotateData,
      ratio,
    } = this.mouseDownCache as Required<MouseDownCache>;

    const {
      fixHeightLineEquation,
      fixWidthLineEquation,
      directionStartPoint,
      directionType,
      diagonal: {
        apexAnglePoint: { position: apexAnglePointPosition },
        fixedPoint: { position: fixedPointPosition },
      },
      diagonalLineEquation,
    } = rotateData;

    // 相对于 矩形的定位 点变化
    const changX = clientPoint.clientX - lastClientPoint.clientX;
    const changY = clientPoint.clientY - lastClientPoint.clientY;
    // 如果有transform的scale属性，那么本身这部分是会自动算进去的
    let relativeChangePoint = {
      x: directionStartPoint.x + (changX * resizeRatio) / scale,
      y: directionStartPoint.y + (changY * resizeRatio) / scale,
    };

    // 如果是四边拖动 并考虑 等比例缩放，点位移发生两种情况，这里选择较大的rect
    if (lockAspectRatio && ratio) {
      const firstLine = getLineEquationByRotateAndPoint(relativeChangePoint, vRotate);
      const secondLine = getLineEquationByRotateAndPoint(relativeChangePoint, hRotate);
      const firstPoint = get2LineIntersectionPoint(firstLine, diagonalLineEquation);
      const secondPoint = get2LineIntersectionPoint(secondLine, diagonalLineEquation);

      const biggerSizePoint =
        secondPoint.x - fixedPointPosition.x > firstPoint.x - fixedPointPosition.x
          ? secondPoint
          : firstPoint;
      relativeChangePoint = biggerSizePoint;
      // 根据近Line决定
      if (directionType === 'line') {
        if (direction === 'bottom' || direction === 'top') {
          relativeChangePoint = secondPoint;
        } else if (direction === 'left' || direction === 'right') {
          relativeChangePoint = firstPoint;
        }
      }
    } else if (directionType === 'line') {
      let firstLineRotate = 0;
      let secondLineRotate = 0;
      if (direction === 'bottom' || direction === 'top') {
        firstLineRotate = hRotate;
        secondLineRotate = vRotate;
      } else if (direction === 'left' || direction === 'right') {
        firstLineRotate = vRotate;
        secondLineRotate = hRotate;
      }
      const firstLine = getLineEquationByRotateAndPoint(relativeChangePoint, firstLineRotate);
      const secondLine = getLineEquationByRotateAndPoint(apexAnglePointPosition, secondLineRotate);
      relativeChangePoint = get2LineIntersectionPoint(firstLine, secondLine);
    }
    // 计算宽高
    const width = getPointToLineDistance(relativeChangePoint, fixHeightLineEquation);
    const height = getPointToLineDistance(relativeChangePoint, fixWidthLineEquation);
    // 计算新的 origin 位置
    const targetOriginPoint: Point = {
      x: (fixedPointPosition.x + relativeChangePoint.x) / 2,
      y: (fixedPointPosition.y + relativeChangePoint.y) / 2,
    };
    const elementRect = drawRect(targetOriginPoint, {
      height,
      width,
    });

    return elementRect;
  }

  onMouseDown(event: React.MouseEvent, direction: Direction) {
    const position = (this.props.position || this.state.position) as Position;
    const size = (this.props.size || this.state.size) as Size;
    const rotate = (
      this.props.rotate !== undefined ? this.props.rotate : this.state.rotate
    ) as number;
    const scale = (this.props.scale !== undefined ? this.props.scale : this.state.scale) as number;
    const { clientX, clientY } = event;
    const { lockAspectRatio } = this.props;

    // 清除拖动鼠标默认行为
    const element = this.resizableRef.current as HTMLElement;
    addUserSelectStyles(element.ownerDocument);

    this.mouseDownCache.position = position;
    this.mouseDownCache.size = size;
    this.mouseDownCache.ratio =
      typeof lockAspectRatio === 'number' ? lockAspectRatio : size.width / size.height;
    this.mouseDownCache.rotateData = this.getRotateRect({
      position,
      size,
      rotate,
      direction,
    });
    this.mouseDownCache.clientPoint = {
      clientX,
      clientY,
    };
    this.mouseDownCache.minMaxSize = this.getJudgeSize();
    // 同步数据
    const state: ResizableState = {
      isResizing: true,
      backgroundStyle: {
        ...this.state.backgroundStyle,
        cursor: window.getComputedStyle(event.target as HTMLElement).cursor || 'auto',
      },
      position,
      size,
      rotate,
      scale,
    };
    this.mouseDownCache.bounds = this.getJudgeBounds(position);
    this.setState(state);
    this.props.onResizeStart?.(
      event,
      direction,
      JSON.parse(
        JSON.stringify({
          position,
          size,
        }),
      ),
    );
  }

  // 暂时不考虑各种grid的让步
  onMouseMove(event: MouseEvent, direction: Direction) {
    const { size: oldSize } = this.state as Required<ResizableState>;
    const { lockAspectRatio, canResizable = true } = this.props;
    if (!canResizable) return;
    const { ratio, minMaxSize, bounds } = this.mouseDownCache as Required<MouseDownCache>;
    const { height, width, left, top } = this.getRotateElementRect(
      {
        clientX: event.clientX,
        clientY: event.clientY,
      },
      direction,
    );
    // 大小限制
    let validSize = this.getValidSize(
      {
        height,
        width,
      },
      minMaxSize,
    );
    // 限制大小之后仍然越界
    if (lockAspectRatio && ratio) {
      if (validSize.height !== height || validSize.width !== width) {
        validSize = { ...oldSize };
      }
    }
    let validPosition = {
      left,
      top,
    };
    // 位置限制
    if (bounds) {
      validPosition = this.getValidPosition(validPosition, {
        ...bounds,
        right: bounds.right - validSize.width,
        bottom: bounds.bottom - validSize.height,
      });
    }
    // 是对象的拷贝暴露出去，防止副作用
    const delta: ResizableDelta = {
      size: { ...validSize },
      position: { ...validPosition },
    };

    const shouldUpdate = this.props.onResize?.(event, direction, JSON.parse(JSON.stringify(delta)));
    if (shouldUpdate && shouldUpdate === false) return;
    this.setState(delta);
  }

  onMouseUp(event: MouseEvent, direction: Direction) {
    const { position: propsPosition, size: propsSize } = this.props;
    const { position: mouseDownPosition, size: mouseDownSize } = this
      .mouseDownCache as Required<MouseDownCache>;
    const { size, position } = this.state as Required<ResizableState>;
    const delta: ResizableDelta = {
      size: { ...size },
      position: { ...position },
    };

    // 清除拖动鼠标默认行为
    const element = this.resizableRef.current as HTMLElement;
    removeUserSelectStyles(element.ownerDocument);

    this.setState({
      isResizing: false,
      backgroundStyle: { ...this.state.backgroundStyle, cursor: 'auto' },
      position: propsPosition ? { ...propsPosition } : { ...mouseDownPosition },
      size: propsSize ? { ...propsSize } : { ...mouseDownSize },
    });
    this.props.onResizeStop?.(event, direction, JSON.parse(JSON.stringify(delta)));
  }

  componentWillUnmount() {
    // 清除拖动鼠标默认行为
    const element = this.resizableRef.current as HTMLElement;
    removeUserSelectStyles(element.ownerDocument);
  }

  getValidSize(size: Size, minMaxSize: MinMaxSize): Size {
    let { width: newWidth, height: newHeight } = size;
    const { maxHeight, maxWidth, minHeight, minWidth } = minMaxSize;
    if (maxHeight) newHeight = Math.min(newHeight, maxHeight);
    if (maxWidth) newWidth = Math.min(newWidth, maxWidth);
    if (minHeight) newHeight = Math.max(newHeight, minHeight);
    if (minWidth) newWidth = Math.max(newWidth, minWidth);
    return {
      width: newWidth,
      height: newHeight,
    };
  }

  // 通过bounds获取有效位置
  getValidPosition(position: Position, bounds: ResizableBounds) {
    let { left, top } = position;
    left = Math.max(bounds.left, left);
    left = Math.min(bounds.right, left);
    top = Math.max(bounds.top, top);
    top = Math.min(bounds.bottom, top);
    return {
      left,
      top,
    };
  }

  getJudgeSize(): MinMaxSize {
    let { maxWidth, maxHeight } = this.props;
    const { minWidth = 1, minHeight = 1 } = this.props;
    const { bounds } = this.props;
    if (!bounds) {
      return {
        maxWidth,
        maxHeight,
        minWidth,
        minHeight,
      };
    }
    if (typeof bounds === 'object') {
      return {
        maxWidth: bounds.right - bounds.left,
        maxHeight: bounds.bottom - bounds.top,
        minWidth: 0,
        minHeight: 0,
      };
    }

    const element = this.resizableRef.current as HTMLElement;
    let boundsWidth = 0;
    let boundsHeight = 0;
    if (bounds === 'window') {
      boundsWidth = window.innerWidth;
      boundsHeight = window.innerHeight;
    } else {
      let boundsElement: HTMLElement;
      switch (bounds) {
        case 'body': {
          boundsElement = document.body;
          break;
        }
        case 'parent': {
          boundsElement = element.parentElement as HTMLElement;
          break;
        }
        default: {
          const targetBounds = document.querySelector(bounds);
          // 不存在 | 不是当前元素的父元素
          if (!targetBounds || !targetBounds.contains(element)) {
            throw new Error('bounds 必须存在，并且需要为拖动元素的祖先级别（包括父级）');
          }
          boundsElement = targetBounds as HTMLElement;
        }
      }
      boundsWidth = boundsElement.offsetWidth;
      boundsHeight = boundsElement.offsetHeight;
    }
    maxWidth = Math.min(boundsWidth, maxWidth || boundsWidth);
    maxHeight = Math.min(boundsHeight, maxHeight || boundsWidth);

    return {
      maxWidth,
      maxHeight,
      minWidth,
      minHeight,
    };
  }

  // 判断边界
  getJudgeBounds(validPosition: Position): ResizableBounds | null {
    const { bounds } = this.props;
    if (!bounds) return null;
    if (typeof bounds === 'object') {
      return bounds;
    }
    // 外层边界限制是字符串
    const element = this.resizableRef.current as HTMLElement;
    // 获取元素文档流的位置
    const elementDocumentRect = getElementDocumentRect(element, validPosition);

    let boundsElementRect: Omit<ElementRect, 'left' | 'top' | 'right' | 'bottom'>;

    if (bounds === 'window') {
      boundsElementRect = {
        width: window.innerWidth,
        height: window.innerHeight,
        x: 0,
        y: 0,
      };
    } else {
      let boundsElement: HTMLElement;
      switch (bounds) {
        case 'body': {
          boundsElement = document.body;
          break;
        }
        case 'parent': {
          boundsElement = element.parentElement as HTMLElement;
          break;
        }
        default: {
          const targetBounds = document.querySelector(bounds);
          // 不存在 | 不是当前元素的父元素
          if (!targetBounds || !targetBounds.contains(element)) {
            throw new Error('bounds 必须存在，并且需要为拖动元素的祖先级别（包括父级）');
          }
          boundsElement = targetBounds as HTMLElement;
        }
      }
      boundsElementRect = boundsElement.getBoundingClientRect();
    }
    // 父元素相对元素文档流的位置
    const boundsELementRelativePosition = getRelativePoint(elementDocumentRect, boundsElementRect);

    const { x: boundsElementLeft, y: boundsElementTop } = boundsELementRelativePosition;
    const { width: boundsElementWidth, height: boundsElementHeight } = boundsElementRect;

    return {
      left: boundsElementLeft,
      top: boundsElementTop,
      right: boundsElementLeft + boundsElementWidth,
      bottom: boundsElementTop + boundsElementHeight,
    };
  }

  renderResizer() {
    const {
      enable,
      handleStyles,
      handleClasses,
      handleWrapperStyle,
      handleWrapperClass,
      handleComponent,
    } = this.props;
    if (!enable) {
      return null;
    }
    const resizers = Object.keys(enable).map((dir) => {
      if (enable[dir as Direction] !== false) {
        return (
          <Resizer
            key={dir}
            direction={dir as Direction}
            onMouseDown={(event) => {
              this.onMouseDown(event, dir as Direction);
            }}
            onMouseMove={(event) => {
              this.onMouseMove(event, dir as Direction);
            }}
            onMouseUp={(event) => {
              this.onMouseUp(event, dir as Direction);
            }}
            replaceStyles={handleStyles && handleStyles[dir as Direction]}
            className={handleClasses && handleClasses[dir as Direction]}
          >
            {handleComponent && handleComponent[dir as Direction]
              ? handleComponent[dir as Direction]
              : null}
          </Resizer>
        );
      }
      return null;
    });

    return (
      <div className={handleWrapperClass} style={handleWrapperStyle}>
        {resizers}
      </div>
    );
  }

  getRef = (instance: HTMLElement) => {
    Object.assign(this.resizableRef, {
      current: instance,
    });
  };

  getTransformStyle() {
    const { state, props } = this;
    const { isResizing } = state;
    const { position, size } = state;
    const rotate = isResizing ? state.rotate : props.rotate;

    const innerStyle: React.CSSProperties = {};
    if (isResizing || !props.position) {
      if (position) {
        innerStyle.transform = `translate(${position.left}px, ${position.top}px) rotate(${
          rotate || 0
        }deg)`;
      }
    } else {
      innerStyle.transform = `translate(${props.position.left}px, ${props.position.top}px) rotate(${
        rotate || 0
      }deg)`;
    }
    if (isResizing || !props.size) {
      if (size) {
        innerStyle.width = size.width;
        innerStyle.height = size.height;
      }
    } else {
      innerStyle.width = props.size.width;
      innerStyle.height = props.size.height;
    }

    return innerStyle;
  }

  updatePosition(position: Position) {
    this.setState({
      position,
    });
  }

  updateSize(size: Size) {
    this.setState({
      size,
    });
  }

  render() {
    const extendsProps = Object.keys(this.props).reduce((acc, key) => {
      if (definedProps.indexOf(key) !== -1) {
        return acc;
      }
      acc[key] = this.props[key as keyof ResizableProps];
      return acc;
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
    }, {} as { [key: string]: any });
    const innerStyle = this.getTransformStyle();

    const style: React.CSSProperties = {
      position: 'relative',
      ...this.props.style,
      ...innerStyle,
      maxWidth: this.props.maxWidth,
      maxHeight: this.props.maxHeight,
      minWidth: this.props.minWidth,
      minHeight: this.props.minHeight,
      boxSizing: 'border-box',
    };

    if (this.props.transform !== undefined) {
      style.transform = this.props.transform;
    }

    const Wrapper = this.props.as || 'div';

    return (
      <Wrapper ref={this.getRef} style={style} className={this.props.className} {...extendsProps}>
        {this.state.isResizing && <div style={this.state.backgroundStyle} />}
        {this.props.children}
        {this.renderResizer()}
      </Wrapper>
    );
  }
}
