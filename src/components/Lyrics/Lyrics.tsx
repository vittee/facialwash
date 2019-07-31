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
  private lineElements: HTMLElement[] = [];
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
      console.log('Resize');
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

    if (track) {
      const { lyrics } = track;

      if (lyrics) {
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
      }
    }
  }

  private storeLinePosition(el: HTMLDivElement | null, index: number) {
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
    return el ? el.offsetTop : this.calculatePosition(index);
  }

  render() {
    const { track, lineHeight, lines } = this.props;

    if (!track) {
      return (
        <>
          No track
        </>
      )
    }

    const { lyrics } = track;
    const timeline = lyrics && lyrics.timeline;

    const { line } = this.state;
    const topLine = this.getTopLine(line);

    let introLines = Math.floor(lines / 2);

    const colors = this.props.colors || defaultColors;

    return (
      <Container background={colors.background}>
        <Ticker ref={this.tickerEl} position={this.getPosition(topLine)} {...{ lineHeight, lines }}>
          {timeline && timeline.map(([ts, t], i) => (
            <Line
              colors={colors.line}
              key={i}
              ref={el => this.storeLinePosition(el, i)}
              dim={ i < line }
              active={ line === i }
              zoom={i < introLines || topLine === 0 || i === timeline.length - 1}
              {...{ lineHeight }}
            >
              {t}
            </Line>
          ))}
        </Ticker>
      </Container>
    );
  }
}

