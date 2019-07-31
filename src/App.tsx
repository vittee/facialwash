import React, { useRef, useEffect } from 'react';
import { useOvermind } from 'overminds';
import { Lyrics } from 'components/Lyrics';
import styled from 'styled-components';
import _ from 'lodash';

const TitleBox = styled.div`
  padding: 0.12em 0.6em 0.12em 0.33em;
  border-radius: 0px 0px 0.25em 0px;
  background-color: rgba(200, 200, 255, 0.3);
  transition: width 0.5s ease 0.05s;
  white-space: nowrap;
  min-height: 1em;
`;

const TitleText = styled.div`
  background-clip: text;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  line-height: 1.6em;
  user-select: none;
`;

class Title extends React.Component {
  private el = React.createRef<HTMLCanvasElement>();

  private boxEl = React.createRef<HTMLDivElement>();

  private textEl = React.createRef<HTMLDivElement>();

  private text = '';

  private updateCanvas = _.debounce(() => {
    const canvas = this.el.current;
    const ctx = canvas!.getContext('2d')!;
    const font = window.getComputedStyle(canvas!.parentElement!).font!;
    ctx.font = font;

    this.updateBounding();
  }, 100);

  componentDidMount() {
    document.addEventListener('DOMContentLoaded', this.updateCanvas);
    window.addEventListener('load', this.updateCanvas);
    window.addEventListener('resize', this.updateCanvas);
  }

  componentDidUpdate() {
    this.updateCanvas();
  }

  render() {
    return (
      <TitleBox ref={this.boxEl}>
        <canvas ref={this.el} style={{ display: 'none' }} />
        <TitleText ref={this.textEl} />
      </TitleBox>
    )
  }

  private bg = [
    'radial-gradient( circle farthest-corner at 12.3% 19.3%,  rgba(85,88,218,1) 0%, rgba(95,209,249,1) 100.2% )',
    'linear-gradient(to right, rgb(182, 244, 146), rgb(51, 139, 147))'
  ]

  setText(s: string) {
    if (s === this.text) {
      return;
    }

    this.text = '';
    this.updateBounding();

    setTimeout(() => {
      this.textEl.current!.style.backgroundImage = _.sample(this.bg) || null;
      this.textEl.current!.innerText = this.text = s;
      this.updateBounding();
    }, 700);
  }

  updateBounding() {
    const tm = this.el.current!.getContext('2d')!.measureText(this.text);
    const tw = tm.width;
    this.boxEl.current!.style.width = tw+'px';
  }
}

const TitleContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 40;
`

const App: React.FC = () => {
  const { state } = useOvermind();

  const track = state.currentTrack;
  const lines = 8;
  const lineHeight = 1.8;


  const ref = useRef<Title>(null);

  if (ref.current) {
    ref.current.setText(track && `${track.meta['artist']} - ${track.meta['title']}` || '');
  }

  return (
    <>
      <Lyrics {...{ track, lines, lineHeight } }/>
      <TitleContainer>
        <Title ref={ref} key="default" />
      </TitleContainer>
    </>
  );
}

export default App;
