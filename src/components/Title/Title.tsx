import _ from 'lodash';
import React from 'react';
import { TitleBox, TitleText, TitleContainer } from './elements';

export class Title extends React.Component {
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
  }, 200);

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
      <TitleContainer>
        <TitleBox ref={this.boxEl}>
          <canvas ref={this.el} style={{ display: 'none' }} />
          <TitleText ref={this.textEl} />
        </TitleBox>
      </TitleContainer>
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
