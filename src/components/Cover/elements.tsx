import React, { PropsWithChildren } from 'react';
import styled from "styled-components";
import _ from 'lodash';
import { rgba, transparentize } from "polished";

export interface ColorsProp {
  colors: string[];
}

export const CoverContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 8em;
  height: 8em;
  z-index: 30;
  opacity: 0;

  transform: scale(1.4) rotateZ(360deg) rotate(-135deg);

  transition:
    opacity 1s linear,
    transform 1s cubic-bezier(.5,-0.72,.41,1.56),
    bottom 1s ease-in-out,
    left 1s ease-in-out,
    width 1s ease-in-out,
    height 1s ease-in-out;
  ;

  transform-origin: -4%;

  will-change: opacity, transform, bottom, left, width, height;

  &.visible {
    opacity: 0.9;
    transform: scale(1) rotateZ(360deg) rotate(0deg);
  }

  &.center {
    bottom: calc((100% - 25em) / 2);
    left: calc((100% - 25em) / 2);
    width: 25em;
    height: 25em;
  }
`;

//#region backgrounds
function tracks(n: number) {
  const availSize = 65; // %
  const start = 30; // %
  const size = availSize / n;
  const variation = 3; // %
  const ridgeSize = 1; // %
  const ridgeColor = rgba(0,0,0,0.3);
  const ridgeBlur = 0.2; // %

  return _(n).times().flatMap(i => {
    let p1 = start + ((i + 1) * size) + (Math.random() * variation);
    let p2 = p1 + ridgeSize;

    return [
      `transparent ${p1  - ridgeBlur}%`,
      `${ridgeColor} ${p1}%`,
      `${ridgeColor} ${p2}%`,
      `transparent ${p2  - ridgeBlur}%`
    ]
  }).join(', ');
}

function grooves(steps = 59) {
  const loopSize = 70;
  const stepSize = loopSize / steps;

  const color = 'black';
  const variation = 0.3;
  const maxTransparency = 0.5;

  return _(steps).times().flatMap(i => {
    const step = stepSize * (i + 1);
    let transparency = 1;
    let cur_variation = Math.random() * variation;

    transparency = transparency - cur_variation;
    if (i % 2 === 1) {
      transparency = 1 - transparency;
    }

    transparency = 1 - ((1 - transparency) * maxTransparency);

    return `${transparentize(transparency, color)} ${step}px`;
  }).join(', ');
}

const discAreas = (borderColor: string) => `radial-gradient(
  circle closest-side,
  ${transparentize(0.2, borderColor)} 43%,
  transparent 43.5%,
  transparent 96%,
  ${borderColor} 96.5%
)`;

const createTracks = () => `radial-gradient(circle closest-side, ${tracks(7)})`;

const highlights = `conic-gradient(
  black 40deg,
  white 42deg,
  black 44deg,
  black 219deg,
  white 222deg,
  white 223deg,
  black 228deg
)`;

const createGrooves = () => `repeating-radial-gradient(${grooves(59)})`;

const weakLightning = `conic-gradient(
  ${transparentize(1, 'white')} 80deg,
  ${transparentize(0.96, 'white')} 90deg,
  ${transparentize(1, 'white')} 95deg,
  ${transparentize(1, 'white')} 260deg,
  ${transparentize(0.96, 'white')} 270deg,
  ${transparentize(1, 'white')} 285deg
)`;

const strongLightning = `conic-gradient(
  ${transparentize(1,'white')},
  ${transparentize(0.78, 'white')} 20deg,
  ${transparentize(0.71, 'white')} 40deg,
  ${transparentize(1,'white')} 70deg,
  ${transparentize(1,'white')} 180deg,
  ${transparentize(0.82, 'white')} 200deg,
  ${transparentize(0.85, 'white')} 210deg,
  ${transparentize(1,'white')} 250deg
)`;
//#endregion

const CoverDiscElement = styled.div.attrs<ColorsProp>(props => {
  const pColors = props.colors || [];
  const colors = pColors.concat(_.first(pColors) || '').join(', ');
  const gradient = `conic-gradient(from 200deg, ${colors})`;

  const background = [
    discAreas(_.first(props.colors) || 'black'),
    createTracks(),
    highlights,
    createGrooves(),
    weakLightning,
    strongLightning,
    gradient
  ].join(',');

  return ({
    style: {
      background
    }
  })
})<ColorsProp>`
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 100%;

  background-blend-mode:normal,normal,color-dodge,normal,normal;

  animation: wiggle 30ms infinite;

  backface-visibility: hidden;
  perspective: 1000;

  will-change: transform;

  &::before {
    content:"";
    position:absolute;
    width:100%;
    height:100%;
    background:repeating-radial-gradient(${grooves()});
    border-radius:100%;
    animation: wabble 4s infinite alternate linear;
  }

  @keyframes wiggle {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(0.5deg);
    }
  }

  @keyframes wabble {
    0% {
      opacity: 0.5;
      transform: scale(1.4);
    }
    50% {
      opacity: 0.8;
      transform: scale(1.2) rotate(180deg);
    }
    100% {
      opacity: 0.5;
      transform: scale(1) rotate(360deg);
    }
  }
`;

export class CoverDisc extends React.Component<PropsWithChildren<{}>, ColorsProp> {
  state = {
    colors: []
  }

  setColors(colors: string[]) {
    this.setState({ colors });
  }

  render() {
    return (
      <CoverDiscElement colors={this.state.colors}>
        {this.props.children}
      </CoverDiscElement>
    )
  }
}

export const CoverImage = styled.img`
  position:absolute;
  top: 50%;
  left: 50%;
  width: 43%;
  height: 43%;
  margin-left: calc(-43% / 2);
  margin-top: calc(-43% / 2);
  border-radius: 100%;
  object-fit: contain;
  object-position: center;
  opacity: 0;
  user-select: none;
  border: none;

  will-change: opacity, transform;

  animation: spin 4s infinite linear;

  @keyframes spin {
    from {
      transform: rotate(0deg) translateZ(0) rotateZ(360deg);
    }

    to {
      transform: rotate(360deg) translateZ(0) rotateZ(360deg);
    }
  }

  &.visible {
    opacity: 1;
  }
`;

export const CoverDecorator = styled.div`
  position:absolute;
  top: 50%;
  left: 50%;
  width: 43%;
  height: 43%;
  margin-left: calc(-43% / 2);
  margin-top: calc(-43% / 2);
  border-radius: 100%;
  background: radial-gradient(
    circle closest-side,
    black 7%,
    transparent 7.5%,
    transparent 96%,
    rgba(255,255,255,0.5) 96.5%
  );
`;
