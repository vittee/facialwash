import React from 'react';
import styled from "styled-components";
import classNames from 'classnames';

interface BackgroundProp {
  background: string;
}

export interface LineColors {
  text: string;
  active: string;
  shadow: string;
  glow: string;
  dim: string;
}

interface LineProps {
  active: boolean;
  lineHeight: number;
  zoom: boolean;
  dim: boolean;
  colors: LineColors;
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

export const InnerContainer = styled.div.attrs<BackgroundProp>(props => {
  return {
    style: {
      backgroundColor: props.background
    }
  }
})<BackgroundProp>`
  height: 100%;
  overflow: hidden;
  transition: background-color 1s ease;
  will-change: background-color;
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

export const Container: React.FC<BackgroundProp> = (props) => {
  return (
    <InnerContainer {...props}>
      <TopDecorator />
      { props.children }
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
      transform: `translate3d(0px, ${-position}px, 0px)`,
    }
  });
})<PositionProps>`
  display: flex;
  flex-direction: column;
  text-align: center;
  white-space: nowrap;
  will-change: transform;

  transition: transform 0.1s ease-out;
  transform: translateZ(0) rotateZ(360deg);

  backface-visibility: hidden;
  perspective: 1000;

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

  const colors = props.colors;

  const style: any = {};

  if (active) {
    style.color = colors.active;
    style.textShadow = `0px 0px 22px ${colors.glow}, 2px 2px 1px ${colors.shadow}`;
  } else {
    style.textShadow = '';
    style.color =  dim ? colors.dim : colors.text
  }

  return ({
    style,
    className: classNames({ zoom: zoom || active })
  });

})<LineProps>`
  transition: color 0.3s ease, font-size 1s ease, text-shadow 1.5s ease;
  transform: translateZ(0);

  line-height: ${props => props.lineHeight}em;
  min-height: ${props => props.lineHeight}em;

  user-select: none;

  will-change: font-size, color, text-shadow;
  backface-visibility: hidden;
  perspective: 1000;

  &.zoom {
    font-size: 1.1234em;
  }

  &.dim {
    opacity: 0.5;
    transition: opacity 0.3s ease;
  }
`;
