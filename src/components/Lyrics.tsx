import React from 'react';
import { Track } from 'overminds/effects/socket';

interface Props {
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

    const prev_id = prev.track && prev.track.id;
    const current_id = track && track.id;

    if (prev.track !== track) {
      console.log('track changed');

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

        let i = line! + 1 || 0;
        while (i < timeline.length) {
          let t = timeline[i][0];

          if (t <= this.position + LATENCY_COMPENSATION) {
            foundLine = i;
            break;
          }

          i++;
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
    const { track } = this.props;

    if (!track) {
      return (
        <>
          No track
        </>
      )
    }

    const { lyrics, meta } = track;
    const timeline = lyrics && lyrics.timeline;
    const { line } = this.state;

    return (
      <>
        Lyrics {meta['title']} Line: {line}
        {timeline && timeline.map(([ts, t], i) => (
          <h2 key={`${ts}_${i}`} style={{ color: i === line ? 'red' : 'black' }}>
            #{i} [{ts.toFixed(2)}] {t}
          </h2>
        ))}
      </>
    );
  }
}

