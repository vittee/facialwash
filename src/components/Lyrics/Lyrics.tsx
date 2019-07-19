import React from 'react';
import { Ticker, Line, Container } from './elements';
import { Track } from 'common/track';

interface Props {
  lines: number;
  lineHeight: number;
  track: Track | undefined;
}

const LATENCY_COMPENSATION = -800;

export class Lyrics extends React.Component<Props> {
  private raf = 0;
  private lastTick = Date.now();
  private position = 0;

  state: { line: number | undefined } = {
    line: undefined
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

  componentDidMount() {
    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  componentDidUpdate(prev: Props) {
    const { track } = this.props;

    if (prev.track !== track) {
      this.position = (track && track.position_ms) || 0;
      this.setState({ line: undefined });
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
    let topLine = (line || 0) - (Math.floor( lines / 2) - 1);
    if (topLine < 0) topLine = 0;

    return (
      <Container>
        <Ticker {...{ topLine, lineHeight, lines }}>
          {timeline && timeline.map(([ts, t], i) => (
            <Line active={line === i} {...{ lineHeight }} key={`${ts}_${i}`}>
              {t}
            </Line>
          ))}
        </Ticker>
      </Container>
    );
  }
}

