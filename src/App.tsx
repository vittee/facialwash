import React, { useRef } from 'react';
import { Lyrics } from 'components/Lyrics';
import { Title } from 'components/Title';
import { Cover } from 'components/Cover/Cover';
import { useOvermind } from 'overminds';

import { getLuminance,
  darken,
  lighten,
  shade,
  tint,
  adjustHue,
  setLightness,
  linearGradient,
  rgb,
  parseToHsl,
  setSaturation,
  hsl,
  radialGradient
} from 'polished';

import _ from 'lodash';
import * as blobUtil from 'blob-util';

const defaultColors = [rgb(182, 244, 146), rgb(51, 139, 147)];

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
  const trackInfo = state.currentTrackInfo;
  const track = trackInfo?.track;
  const lines = 8;
  const lineHeight = 1.8;

  const trackColors = (track && track.colors) || (() => {
    const main = hsl(_.random(360), _.random(0.5, 0.9, true), _.random(0.6, 0.8, true));
    const deg = _.random(15, 20);

    return _(6).times().map(i => adjustHue((i - 3) * deg, main))
  })();

  const coverColors = _.sortBy(trackColors, getLuminance);

  let img: string | undefined = undefined;
  if (track && track.cover?.length) {
    const blob = blobUtil.arrayBufferToBlob(Uint8Array.from(atob(track.cover), c => c.charCodeAt(0)), 'image/jpeg');
    img = blobUtil.createObjectURL(blob);
    console.log(img);
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

          if (hsl.lightness < 0.5) {
            c = setLightness(0.5, c);
          }

          return findColor(adjustHue(-20, c), v => v < 0.3, lighten);
        })
        .shuffle()
        .flatMap(c => [c, adjustHue(_.random(15, 90), c)])
        .value();

      gradient = radialGradient({
        colorStops: titleColor,
        position: 'circle'
      }).backgroundImage;
    } else {
      gradient = linearGradient({
        colorStops: defaultColors,
        toDirection: 'to right',
      }).backgroundImage;
    }

    console.log(track?.tags?.artist);

    const banner = [track?.tags?.artist, track?.tags?.title].join(' - ') || 'No track';

    titleEl.current.setText(
      banner,
      gradient as string
    );
  }

  if (coverEl.current) {
    let center = true;

    if (track) {
      if (track.lyrics) {
        center = track.lyrics?.timeline.length < 2;
      }
    }

    coverEl.current.update(img, coverColors, center);
  }

  let colors = undefined;

  if (coverColors.length >= 6) {
    const [background, dim, text, shadow, active, glow] = coverColors;

    colors = {
      background: findColor(background, v => v >= 0.01, darken),
      line: {
        text: findColor(text, v => v >= 0.045, darken),
        active: findColor(active, v => v < 0.9, tint),
        dim: findColor(dim, v => v >= 0.03, shade),
        shadow: findColor(shadow, v => v >= 0.11, shade),
        glow: findColor(glow, v => v < 0.97, lighten)
      }
    }
  }

  return (
    <>
      <Cover ref={coverEl} key="cover" />

      <Lyrics {...{
        trackInfo,
        lines,
        lineHeight,
        img,
        colors
      }} key="lyrics" />

      <Title ref={titleEl} key="title" />
    </>
  );
}

export default App;
