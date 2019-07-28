import React from 'react';
import styled from "styled-components";
import classNames from 'classnames';
import _ from 'lodash';

interface LineProps {
  active: boolean;
  lineHeight: number;
  zoom: boolean;
  dim: boolean;
}

interface LineLayoutProps {
  lines: number;
  lineHeight: number;
}

interface PositionProps {
  position: number;
}

export interface Props extends LineLayoutProps, PositionProps {

};

export const InnerContainer = styled.div`
  background-color: rgb(2, 2, 30);
  height: 100%;
  overflow: hidden;
`;

const Decorator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: calc(1.8em * 4);
  pointer-events: none;
  z-index: 2;
`;

const TopDecorator = styled(Decorator)`
  top: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0), black);
`;

const BottomDecorator = styled(Decorator)`
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), black);
`;

export const Container: React.FC = ({ children }) => {
  return (
    <InnerContainer>
      <TopDecorator />
      { children }
      <BottomDecorator />
    </InnerContainer>
  )
}

const TickerContainer = styled.div<LineLayoutProps>`
  font-size: calc(100vh / (${props => props.lines} * ${props => props.lineHeight}));
`;

const TickerScroller = styled.div.attrs<PositionProps>(props => {
  const { position } = props;

  return ({
    className: classNames({ smooth: position > 0}),
    style: {
      transform: `translate(0px, ${-position}px)`,
    }
  });
})<PositionProps>`
  display: flex;
  flex-direction: column;
  text-align: center;
  white-space: nowrap;
  will-change: transform;

  transition: transform 0.1s ease-out;

  &.smooth {
    transition: transform 1s ease;
  }
`;

export class Ticker extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>();

  setPosition(position: number) {
    const el = this.ref.current;
    if (el) {
      el.style.transform = `translate(0px, ${-position}px)`;
    }
  }

  render() {
    const { lines, lineHeight, position, children } = this.props;
    return (
      <TickerContainer {...{ lines, lineHeight } }>
        <TickerScroller ref={this.ref} {...{position}}>
          {children}
        </TickerScroller>
      </TickerContainer>
    );
  }
}

export const Line = styled.div.attrs<LineProps>(props => {
  const { zoom, active, dim } = props;

  return ({
    className: classNames({
      zoom: zoom || active,
      active,
      dim
    })
  });

})<LineProps>`
  color: rgba(80, 80, 200, 0.6);
  transition: color 0.3s ease, font-size 1s ease, text-shadow 1.5s ease;

  line-height: ${props => props.lineHeight}em;
  min-height: ${props => props.lineHeight}em;

  user-select: none;

  &.zoom {
    font-size: 1.1234em;
  }

  &.active {
    color: rgb(222, 222, 255);
    text-shadow: 0px 0px 22px white, 2px 2px 1px rgba(100, 100, 255, 0.8);
  }

  &.dim {
   color: rgba(100, 100, 180, 0.3);
  }
`;
