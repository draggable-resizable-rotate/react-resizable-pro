import React from 'react';
import { Direction } from '@shepijcanwu/graphics';
import DraggableProvider, { HandleFunMap } from '@shepijcanwu/react-draggable-provider';

export type {
  Direction
};

const styles: { [key: string]: React.CSSProperties } = {
  top: {
    width: '100%',
    height: '10px',
    top: '-5px',
    left: '0px',
    cursor: 'row-resize',
  },
  right: {
    width: '10px',
    height: '100%',
    top: '0px',
    right: '-5px',
    cursor: 'col-resize',
  },
  bottom: {
    width: '100%',
    height: '10px',
    bottom: '-5px',
    left: '0px',
    cursor: 'row-resize',
  },
  left: {
    width: '10px',
    height: '100%',
    top: '0px',
    left: '-5px',
    cursor: 'col-resize',
  },
  topRight: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    right: '-10px',
    top: '-10px',
    cursor: 'ne-resize',
  },
  bottomRight: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    right: '-10px',
    bottom: '-10px',
    cursor: 'se-resize',
  },
  bottomLeft: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    left: '-10px',
    bottom: '-10px',
    cursor: 'sw-resize',
  },
  topLeft: {
    width: '20px',
    height: '20px',
    position: 'absolute',
    left: '-10px',
    top: '-10px',
    cursor: 'nw-resize',
  },
};
export type OnStartCallback = (e: React.MouseEvent, dir: Direction) => void;

export interface Props {
  direction: Direction;
  className?: string;
  replaceStyles?: React.CSSProperties;
  onMouseDown: HandleFunMap['onMouseDown'];
  children: React.ReactNode;
  onMouseMove: HandleFunMap['onMouseMove'];
  onMouseUp: HandleFunMap['onMouseUp'];
}

export class Resizer extends React.PureComponent<Props> {
  elementRef: React.RefObject<HTMLDivElement>;

  constructor(props: Props) {
    super(props);
    this.elementRef = React.createRef();
  }

  render() {
    return (
      <DraggableProvider
        onMouseDown={this.props.onMouseDown}
        onMouseMove={this.props.onMouseMove}
        onMouseUp={this.props.onMouseUp}
        nodeRef={this.elementRef}
      >
        <div
          className={this.props.className || ''}
          style={{
            position: 'absolute',
            userSelect: 'none',
            ...styles[this.props.direction],
            ...(this.props.replaceStyles || {}),
          }}
          ref={this.elementRef}
        >
          {this.props.children}
        </div>
      </DraggableProvider>
    );
  }
}
