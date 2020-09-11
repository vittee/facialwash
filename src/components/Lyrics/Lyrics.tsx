import React from 'react';
import _ from 'lodash';
import { Line, Container, Ticker, LineColors } from './elements';
import { Track } from 'common/track';

interface Colors {
  background: string;
  line: LineColors;
}

interface Props {
  lines: number;
  lineHeight: number;
  track: Track | undefined;
  img: string | undefined;
  colors: Colors | undefined;
}

const LATENCY_COMPENSATION = -400;

const defaultColors = {
  background: 'rgb(2,2,30)',
  line: {
    text: 'rgb(49, 49, 132)',
    active: 'rgb(222, 222, 255)',
    dim: 'rgba(61,61,147,0.5)',
    shadow: 'rgb(80, 80, 210)',
    glow: 'white'
  }
}

export class Lyrics extends React.Component<Props> {
  private raf = 0;
  private lastTick = Date.now();
  private position = 0;
  private lineElements: Line[] = [];
  private tickerEl = React.createRef<Ticker>();

  state: { line: number } = {
    line: 0
  }

  private animate() {
    this.raf = requestAnimationFrame(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      //
      this.position += delta;
      this.lastTick = now;
      this.updateLine();
      this.animate();
    });
  }

  private resizeHandler = _.debounce(() => {
    if (this.tickerEl.current) {
      const topLine = this.getTopLine(this.state.line);
      const y = this.getPosition(topLine);
      this.tickerEl.current.setPosition(y);
    }
  });

  componentDidMount() {
    this.animate();
    window.addEventListener('resize', this.resizeHandler);
    console.log('Did mount');
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.resizeHandler);
    cancelAnimationFrame(this.raf);
  }

  componentDidUpdate(prev: Props) {
    const { track } = this.props;

    if (prev.track !== track) {
      const timeline = (track && track.lyrics && track.lyrics.timeline) || [];

      this.position = (track && track.position_ms) || 0;
      this.lastTick = Date.now();
      this.lineElements = Array(timeline.length).fill(0);
      this.setState({ line: 0 });
      this.updateLine();
    }
  }

  private updateLine() {
    const { track } = this.props;

    if (!track) {
      return;
    }

    const { lyrics, meta } = track;

    if (!lyrics) {
      return;
    }

    const { timeline } = lyrics;
    const { line } = this.state;

    let foundLine = line;
    let newLine = null;

    while (newLine !== foundLine) {
      newLine = foundLine;

      let i = foundLine! + 1 || 0;
      while (i < timeline.length) {
        let t = timeline[i][0];

        if (t <= this.position + LATENCY_COMPENSATION) {
          foundLine = i;
          break;
        }

        i++;
      }
    }

    if (foundLine !== line) {
      this.setState({
        line: foundLine
      });
    }

    const nextLine = _.findIndex(timeline, ([,t]) => t.trim().length > 0, foundLine + 1);

    if (nextLine !== -1 && nextLine !== foundLine) {
      const [ts, , far] = timeline[nextLine];
      const bts = ts - (8 * (6e4/(meta.bpm || 90)));

      if (true || far) {
        const realpos = this.position + LATENCY_COMPENSATION;
        const el = this.lineElements[nextLine];
        if (el && realpos >= bts) {
          el.setProgress(_.clamp((ts - realpos) / (ts - bts), 0, 1));
        }
      }
    }
  }

  private storeLine(el: Line | null, index: number) {
    if (el && this.lineElements[index] !== el) {
      this.lineElements[index] = el;
    }
  }

  private getTopLine(line: number) {
    const { lines } = this.props;
    let introLines = Math.floor(lines / 2);
    let topLine = (line || 0) - (introLines - 1);
    if (topLine < 0) topLine = 0;

    return topLine;
  }

  private calculatePosition(line: number) {
    const heights = Math.floor(window.innerHeight / this.props.lines);
    return (line >= 0 ? line : 0) * heights;
  }

  private getPosition(index: number) {
    const el = this.lineElements[index];
    return (el && el.getTop()) || this.calculatePosition(index);
  }

  render() {
    const { track, lineHeight, lines } = this.props;

    const lyrics = track && track.lyrics;
    const timeline = lyrics && lyrics.timeline;

    const { line } = this.state;
    const topLine = this.getTopLine(line);

    let introLines = Math.floor(lines / 2);

    const colors = this.props.colors || defaultColors;

    const mapLine = (info: any, i: number) => {
      const [, t, far] = info;
      return (
        <Line
          colors={colors.line}
          key={i}
          ref={el => this.storeLine(el, i)}
          dim={ i < line }
          active={ line === i }
          zoom={i < introLines || topLine === 0 || i === timeline!.length - 1}
          far={far}
          {...{ lineHeight }}
        >
          {t}
        </Line>
      );
    }

    return (
      <Container background={colors.background}>
        <Ticker ref={this.tickerEl} position={this.getPosition(topLine)} {...{ lineHeight, lines }}>
          {timeline && timeline.map(mapLine)}
        </Ticker>
      </Container>
    );
  }
}

