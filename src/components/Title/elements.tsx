import styled from "styled-components";

export const TitleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 30;
`;

export const TitleBox = styled.div`
  padding: 0.12em 0.6em 0.12em 0.33em;
  border-radius: 0px 0px 0.25em 0px;
  background-color: rgba(200, 200, 255, 0.3);
  transition: all 0.2s ease;
  white-space: nowrap;
  min-height: 1em;
`;

export const TitleText = styled.div`
  background-size: 300vw;

  animation: bg 15s infinite alternate linear;

  background-clip: text;
  -webkit-background-clip: text;
  color: transparent;
  -webkit-text-fill-color: transparent;
  line-height: 1.6em;
  user-select: none;

  transform: translateZ(0) rotateZ(360deg);

  @keyframes bg {
    0% { background-position: 0% 0%; }
    100% { background-position: 100% 100%; }
  }
`;
