import React, { createRef, PropsWithChildren } from "react";
import classNames from "classnames";
import type { TrackInfo } from "common/types";
import { clamp } from "lodash";
import { Box, Container, Mask, Next, ProgressText } from "./elements";
import { useOvermind } from "overminds";

interface Props {
  position: number;
  duration: number;

  next?: string;
  nextLoading?: boolean;

  trackInfo: TrackInfo | undefined;
  backgroundColor: string;
  textColor: string;
  activeColor: string;
}

interface State {
  position: number;
}

function format(ms: number) {
  const seconds = ms / 1000;
  const mm = Math.trunc(seconds / 60);
  const ss = Math.trunc(seconds % 60);
  return [mm, ss].map(e => e.toString().padStart(2, '0')).join(':')
}

export const PlayHead: React.FC<PropsWithChildren<Omit<Props, 'next' | 'nextLoading'>>> = (props) => {
  const { state } = useOvermind();
  const { next, nextLoading } = state;

  return (
    <InternalPlayHead
      {...props }
      next={[next?.artist, next?.title].filter(e => !!e).join(' - ')}
      nextLoading={nextLoading}
    />
  )
}

class InternalPlayHead extends React.Component<PropsWithChildren<Props>, State> {
  private raf = 0;
  private timer?: NodeJS.Timeout;
  private lastTick = Date.now();

  private loadingNext?: string;

  private containerRef = createRef<HTMLDivElement>();

  private maskRef = createRef<HTMLDivElement>();

  state = {
    position: 0
  }

  private animate() {
    this.raf = requestAnimationFrame(() => {
      const now = Date.now();
      const delta = now - this.lastTick;
      //
      this.setState(prev => {
        this.lastTick = now;
        this.animate();

        return {
          position: clamp(prev.position + delta, 0, this.props.duration)
        }
      });

      const progress = this.state.position / this.props.duration;

      if (this.maskRef.current) {
        this.maskRef.current.style.left = `${progress * 100}%`;
      }
    });
  }

  componentDidMount() {
    this.animate();
  }

  componentWillUnmount() {
    cancelAnimationFrame(this.raf);
  }

  componentDidUpdate(prev: Props) {
    const { trackInfo, position } = this.props;

    if (prev.trackInfo !== trackInfo) {
      this.lastTick = Date.now();
      this.setState({ position });

      if (this.timer) {
        clearTimeout(this.timer);
      }

      this.timer = setTimeout(() => {
        this.loadingNext = undefined;
      }, 4000);
    }
  }

  render() {
    const { next, nextLoading } = this.props;
    const { position } = this.state;

    const text = format(position);

    let show = !!next;
    let loading = false;

    if (this.loadingNext || nextLoading) {
      if (next) {
        this.loadingNext = next;
      }

      loading = true;
    }

    const n = next || this.loadingNext;

    const clockChars = text.split('').map((c, i) => <span key={i}>{c}</span>);

    return (
      <>
        <Container ref={this.containerRef} className={classNames({ withNext: show })}>
          <Box>
            <ProgressText
              backgroundColor={this.props.backgroundColor}
              textColor={this.props.textColor}
            >
              {clockChars}
            </ProgressText>

            <Mask ref={this.maskRef} />
          </Box>
        </Container>

        <Next
          style={{ minWidth: `calc(${this.containerRef.current?.clientWidth}px - 0.4em * 2)` }}
          color={this.props.activeColor}
          className={classNames({ show, loading })}
        >
          <span>{n && 'Next: '}{n}</span>
        </Next>
      </>
    )
  }
};
