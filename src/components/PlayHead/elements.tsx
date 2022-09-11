import styled from "styled-components";
import { invert, tint, transparentize } from 'polished';

export const Container = styled.div`
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 30;

  transition: bottom 4s ease;
  transition-delay: 0.8s;

  &.withNext {
    bottom: 1.20em;
    transition: bottom 1.2s ease;
    transition-delay: 0s;
  }
`;

export const Box = styled.div`
  position: relative;
  padding: 0.12em 0.6em 0.12em 0.6em;
  border-radius: 0.25em 0px 0px 0px;
  background-color: rgba(200, 200, 255, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  height: 1.0em;
  width: 10vw;
`;

const BaseText = styled.div`
  position: absolute;
  display: flex;
  background-size: 300vw;

  justify-content: left;
  align-items: center;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  padding-left: 33%;

  border-radius: 0.25em 0px 0px 0px;

  user-select: none;

  background-size: 50px 50px;
  animation: move 2s linear infinite;

  @keyframes move {
    0% {
      background-position: 0 0;
    }
    100% {
      background-position: 50px 50px;
    }
  }

  transform: translateZ(0) rotateZ(360deg);
  transition:
    clip-path 0.5s ease,
    background-color 2.2s ease-in-out,
    color 2.2s ease-in-out;
`;

export const BackText = styled(BaseText)<{ backgroundColor: string, textColor: string }>`
  background-image: linear-gradient(
    -45deg,
    ${props => transparentize(0.2, props.backgroundColor)} 25%,
    transparent 25%,
    transparent 50%,
     ${props => transparentize(0.2, props.backgroundColor)} 50%,
     ${props => transparentize(0.2, props.backgroundColor)} 75%,
    transparent 75%,
    transparent
  );

  color: ${props => tint(0.2, props.textColor)};
`;

export const Text = styled(BaseText)`

`;

export const Next = styled.div<{ color: string }>`
  position: absolute;
  bottom: 0;
  right: 0;
  z-index: 30;

  font-size: 0.8em;

  padding: 0em 0.6em 0.5em 0.6em;
  background-color: rgba(200, 200, 255, 0.3);
  white-space: nowrap;
  height: 1.0em;
  min-width: 10vw;

  color: white;

  opacity: 0;

  transition: opacity 4s ease, color 4s ease;

  &.show {
    opacity: 1;
    transition: opacity 0.6s ease, color 4s ease;
  }

  &.loading {
    animation: blink 0.5s linear alternate infinite;
  }

  @keyframes blink {
    from {
      color: ${props => props.color};
    }

    to {
      color: ${props => invert(props.color)};
    }
  }
`;
