import React, { useRef } from 'react';
import { useOvermind } from 'overminds';
import { Lyrics } from 'components/Lyrics';
import styled from 'styled-components';
import { getLuminance, darken, lighten, shade, tint, adjustHue, setLightness, linearGradient, saturate, rgb, parseToHsl, setSaturation } from 'polished';
import _ from 'lodash';
import * as blobUtil from 'blob-util';

const TitleBox = styled.div`
  padding: 0.12em 0.6em 0.12em 0.33em;
  border-radius: 0px 0px 0.25em 0px;
  background-color: rgba(200, 200, 255, 0.3);
  transition: all 0.5s ease 0.05s;
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

const CoverContainer = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  display: flex;
  overflow: hidden;
  z-index: 30;
  border-radius: 100%;

  animation: rotate 14s infinite linear;
  backface-visibility: hidden;
  perspective: 1000;

  will-change: transform;

  @keyframes rotate {
    from {
      transform: rotate(0deg) translateZ(0) rotateZ(360deg);
    }

    to {
      transform: rotate(-360deg) translateZ(0) rotateZ(360deg);
    }
  }
`;

const CoverImage = styled.img`
  margin: 0;
  width: 7em;
  height: 7em;
  object-fit: cover;
  opacity: 0;
  transform: scale(2) rotate(-360deg);
  user-select: none;

  will-change: opacity, transform;
  transition: opacity 0.8s ease-in, transform 1s ease-out;

  &.visible {
    opacity: 0.8;
    transform: scale(1) rotate(0deg);
  }
`;

class Cover extends React.Component {
  private imageEl = React.createRef<HTMLImageElement>();

  render() {
    return (
      <CoverContainer>
        <CoverImage ref={this.imageEl} />
      </CoverContainer>
    )
  }

  setUrl(url: string | undefined) {
    const el = this.imageEl.current;
    if (el) {
      el.classList.remove('visible');
      setTimeout(() => {
        el.src = url || '';
        el.classList.add('visible');
      }, 1e3);
    }
  }
}

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

  setText(s: string, bg: string | null = null) {
    if (s === this.text) {
      return;
    }

    this.text = '';
    this.updateBounding();

    setTimeout(() => {
      const el = this.textEl.current!;
      el.style.backgroundImage = bg;
      el.innerText = this.text = s;
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
`;

function findColor(base: string, predicate: (c: number) => boolean, fn: (deg: number, base: string) => string) {
  let deg = 0.1;
  let c = base;
  while (predicate(getLuminance(c))) {
    c = fn(deg, base);
    deg += 0.01;
  }

  return c;
}

const App: React.FC = () => {
  const { state } = useOvermind();

  const track = state.currentTrack;
  const lines = 8;
  const lineHeight = 1.8;

  const coverColors = _.sortBy(((track && track.colors) || []), getLuminance);

  let img = undefined;
  if (track && track.picture) {
    const blob = blobUtil.arrayBufferToBlob(track.picture.data, track.picture.format);
    img = blobUtil.createObjectURL(blob);
  }

  const titleEl = useRef<Title>(null);
  const coverEl = useRef<Cover>(null);

  if (titleEl.current) {
    let gradient;

    if (coverColors.length) {
      const titleColor = _(coverColors)
        .map(c => {
          const hsl = parseToHsl(c);

          if (hsl.saturation < 0.5) {
            c = setSaturation(0.5, c);
          }

          if (hsl.lightness < 0.6) {
            c = setLightness(0.6, c);
          }

          return findColor(adjustHue(-40, c), v => v < 0.4, lighten);
        })
        .value();

      gradient = linearGradient({
        colorStops: titleColor,
        toDirection: 'to right',
      }).backgroundImage;
    } else {
      gradient = linearGradient({
        colorStops: [rgb(182, 244, 146), rgb(51, 139, 147)],
        toDirection: 'to right',
      }).backgroundImage;
    }

    titleEl.current.setText(
      (track && `${track.meta['artist']} - ${track.meta['title']}`) || '',
      gradient as string
    );
  }

  if (coverEl.current) {
    coverEl.current.setUrl(img);
  }

  let colors = undefined;

  if (coverColors.length >= 6) {
    const [background, dim, text, shadow, active, glow] = coverColors;

    colors = {
      background: findColor(background, v => v >= 0.0028, shade),
      line: {
        text: findColor(text, v => v >= 0.045, darken),
        active: findColor(active, v => v < 0.9, tint),
        dim: findColor(dim, v => v >= 0.018, darken),
        shadow: findColor(shadow, v => v >= 0.11, shade),
        glow: findColor(glow, v => v < 0.97, lighten)
      }
    }
  }

  return (
    <>
      <Lyrics {...{
        track,
        lines,
        lineHeight,
        img,
        colors
      }}/>

      <TitleContainer>
        <Title ref={titleEl} key="default" />
      </TitleContainer>

      <Cover ref={coverEl} key="default" />
    </>
  );
}

export default App;
