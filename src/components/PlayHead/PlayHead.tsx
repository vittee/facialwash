import { Tags, TrackInfo } from "common/track";
import _, { clamp } from "lodash";
import { Connect, connect } from "overminds";
import { lighten, transparentize } from "polished";
import React from "react";
import { BackText, Box, Container, Next, Text } from "./elements";

interface Props {
  trackInfo: TrackInfo | undefined;
  backgroundColor: string;
  textColor: string;
  activeColor: string;
}

interface State {
  position: number;
  duration: number;
}

export const PlayHead = connect(class PlayHead extends React.Component<Props & Connect, State> {
  private raf = 0;
  private lastTick = Date.now();

  private loadingNext?: Tags;

  state = {
    position: 0,
    duration: 0
  }

  private containerEl = React.createRef<HTMLDivElement>();

  private animate() {
    this.raf = requestAnimationFrame(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      //
      this.setState(prev => {
        this.lastTick = now;
        this.animate();

        return {
          position: clamp(prev.position + delta, 0, this.state.duration)
        }
      })
    });
  }

  componentDidMount() {
    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  componentDidUpdate(prev: Props) {
    const { trackInfo } = this.props;

    if (prev.trackInfo !== trackInfo) {
      const position = trackInfo?.position;

      this.lastTick = Date.now();
      this.setState({
        position: position?.current ?? 0,
        duration: position?.duration ?? 0
      })
    }
  }

  private format(ms: number) {
    const seconds = ms / 1000;
    const mm = Math.trunc(seconds / 60);
    const ss = Math.trunc(seconds % 60);
    return [mm, ss].map(e => e.toString().padStart(2, '0')).join(':')
  }

  render() {
    let { next, nextLoading } = this.props.overmind.state;

    const { position, duration } = this.state;
    const progress = position / duration;

    const text = this.format(position);

    const textStyle: React.CSSProperties = {
      clipPath: `inset(0 0 0 ${progress * 100}%)`,
      backgroundColor: transparentize(0.2, this.props.backgroundColor),
      color: lighten(0.3, this.props.textColor)
    }

    if (this.loadingNext && !next) {
      setTimeout(() => {
        this.loadingNext = undefined;
      }, 4000)
    }

    const nextClassName: string[] = [];
    if (next) {
      nextClassName.push('show');
    }

    if (this.loadingNext || nextLoading) {
      if (next) {
        this.loadingNext = next;
      }

      nextClassName.push('loading');
    }

    const n = next ?? this.loadingNext;

    return (
      <>
        <Container ref={this.containerEl} className={ next && 'withNext'}>
          <Box>
            <BackText
              backgroundColor={this.props.backgroundColor}
              textColor={this.props.activeColor}
            >
              {text}
            </BackText>
            <Text style={textStyle}>{text}</Text>
          </Box>
        </Container>
        <Next
          color={lighten(0.3, this.props.backgroundColor)}
          className={nextClassName.join(' ')}
        >
          {n && 'Next: '}{[n?.artist, n?.title].filter(e => !!e).join(' - ')}
        </Next>
      </>
    )
  }
});