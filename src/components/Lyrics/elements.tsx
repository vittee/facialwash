import React from 'react';
import styled, { CSSProperties } from "styled-components";
import classNames from 'classnames';
import { linearGradient, rgba } from 'polished';

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
  far: boolean;
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
  position: relative;
  height: 100%;
  overflow: hidden;
  transition: background-color 1s ease;
  will-change: background-color;
  transform: translateZ(0) rotateZ(360deg);
  z-index: 0;
  opacity: 0.99;
`;

const Decorator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: calc(1.8em * 4);
  pointer-events: none;
  z-index: 2;
`;

const TopDecorator = styled(Decorator).attrs<BackgroundProp>(props => {
  return ({
    style: {
      background: linearGradient({
        toDirection: 'to top',
        colorStops: [rgba(props.background, 0), props.background]
      }).backgroundImage
    }
  });
})<BackgroundProp>`
  top: 0;
`;

const BottomDecorator = styled(Decorator).attrs<BackgroundProp>(props => {
  return ({
    style: {
      background: linearGradient({
        toDirection: 'to bottom',
        colorStops: [rgba(props.background, 0), props.background]
      }).backgroundImage
    }
  });
})<BackgroundProp>`
  bottom: 0;
`;

export const Container: React.FC<BackgroundProp> = (props) => {
  const { background } = props;
  const p = { background };

  return (
    <InnerContainer {...p}>
      <TopDecorator {...p}/>
      { props.children }
      <BottomDecorator {...p}/>
    </InnerContainer>
  )
}

const TickerContainer = styled.div<LineLayoutProps>`
  font-size: calc(min(80vw, 100vh) / (${props => props.lines} * ${props => props.lineHeight}));
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

  transition: transform 0.75s ease-out;

  backface-visibility: hidden;
  perspective: 1000;
`;

export class Ticker extends React.Component<Props> {
  private ref = React.createRef<HTMLDivElement>();

  setPosition(position: number) {
    const el = this.ref.current;
    if (el) {
      el.style.transform = `translate3d(0px, ${-position}px)`;
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

const LineText = styled.div.attrs<LineProps>(props => {
  const { zoom, active, dim } = props;

  const colors = props.colors;

  const style: CSSProperties = {};

  if (active) {
    style.color = colors.active;
    style.textShadow = `0px 0px 22px ${colors.glow}, 2px 2px 1px ${colors.shadow}`;
  } else {
    style.textShadow = '';
    style.color =  dim ? colors.dim : colors.text
  }

  return ({
    style,
    className: classNames({ zoom: zoom || active, dim })
  });

})<LineProps>`
  transition: color 0.3s ease, font-size 1s ease, transform 1s ease, text-shadow 1.5s ease;
  transform: scale(1) translateZ(0) rotateZ(360deg);

  line-height: ${props => props.lineHeight}em;
  min-height: ${props => props.lineHeight}em;

  user-select: none;

  will-change: transform, font-size, color, text-shadow;
  backface-visibility: hidden;
  perspective: 1000;

  font-size: 1em;

  &.zoom {
    transform: scale(1.12) translateZ(0) rotateZ(360deg);
  }

  &.dim {
    opacity: 0.7;
  }
`;

interface IndicatorProps {
  color: string;
}

const LineFarIndicator = styled.div.attrs<IndicatorProps>(props => {
  const style: CSSProperties = {
    borderColor: `transparent transparent transparent ${props.color}`
  };

  return ({ style });
})<IndicatorProps>`
  position: absolute;
  left: -0.75em;
  bottom: 0.6em;

  border-style: solid;
  border-width: 0.25em 0 0.25em 0.5em;

  animation: wobble 0.66s infinite alternate linear;

  opacity: 0;
  will-change: height, opacity, transform;

  transition: opacity 0.8s linear, border-color 0.5s linear;

  .dim {
    opacity: 0;
  }

  @keyframes wobble {
    from {
      transform: scale(1) translateZ(0) rotateZ(360deg);
    }

    to {
      transform: scale(1.2) translateZ(0) rotateZ(360deg);
    }
  }
`;

const LineWrapper = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: center;
`;

export class Line extends React.Component<LineProps> {
  private el = React.createRef<HTMLDivElement>();
  private farEl = React.createRef<HTMLDivElement>();

  getTop() {
    return this.el.current && this.el.current.offsetTop;
  }

  setProgress(progress: number) {
    if (this.farEl.current) {
      this.farEl.current.style.opacity = ''+progress;
    }
  }

  render() {
    const { far, active, dim, colors } = this.props;
    return (
      <LineWrapper ref={this.el}>
        <LineText {...this.props}>
          { far && <LineFarIndicator ref={this.farEl}
            color={ active || dim ? colors.dim : colors.active}
          />}

          {this.props.children}
        </LineText>
      </LineWrapper>
    );
  }
}
