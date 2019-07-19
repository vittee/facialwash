import React, { useEffect, useRef } from 'react';
import styled from "styled-components";
import _ from 'lodash';

interface LineProps {
  active: boolean;
  lineHeight: number;
}

export interface Props {
  lineHeight: number;
  lines: number;
  topLine: number;
}

export const InnerContainer = styled.div`
  height: 100%;
  overflow: hidden;
`;

const Decorator = styled.div`
  position: absolute;
  left: 0;
  right: 0;
  height: calc(1.8em * 2);
  pointer-events: none;
  z-index: 2;
`;

const TopDecorator = styled(Decorator)`
  top: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0), white);
`;

const BottomDecorator = styled(Decorator)`
  bottom: 0;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0), white);
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

function calcTransformation(pos: number, max: number) {
  const heights = Math.floor(window.innerHeight / max);
  return -(pos >= 0 ? pos : 0) * heights;
}

export const TickerScroller = styled.div.attrs<Props>(props => {
  const { lines, topLine, lineHeight } = props;
  const y = calcTransformation(topLine, lines);

  return ({
    style: {
      fontSize: `calc(100vh / (${lines} * ${lineHeight}))`,
      transform: `translate(0px, ${y}px)`,
      transition: topLine ? 'transform 1s ease' : undefined
    }
  });
})<Props>`
  display: flex;
  flex-direction: column;
  text-align: center;
  white-space: nowrap;
`;

export const Ticker: React.FC<Props> = (props) => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const resizeHandler = _.throttle(_.debounce(() => {
      if (el.current) {
        console.log('Resizing', Date.now())
        const { lines, topLine } = props;
        const y = calcTransformation(topLine, lines);
        el.current.style.transform = `translate(0px, ${y}px)`;
      }
    }, 50), 500);

    window.addEventListener('resize', resizeHandler);

    return () => {
      window.removeEventListener('resize', resizeHandler);
    }
  });

  return (
    <TickerScroller {...props} ref={el} />
  )
}

export const Line = styled.div.attrs<LineProps>(props => {
  const val = `${props.lineHeight}em`;

  return ({
    style: {
      color: props.active ? 'red' : 'black',
      lineHeight: val,
      minHeight: val
    }
  });

})<LineProps>`
  transition: color 0.6s ease;
`;
