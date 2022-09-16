import React from 'react';
import { CoverDisc, CoverImage, CoverContainer, CoverDecorator } from './elements';

export class Cover extends React.Component {
  private containerEl = React.createRef<HTMLDivElement>();
  private discEl = React.createRef<CoverDisc>();
  private imageEl = React.createRef<HTMLImageElement>();

  render() {
    return (
      <CoverContainer ref={this.containerEl}>
        <CoverDisc ref={this.discEl}>
          <div style={{ opacity: 0.77 }}>
            <CoverImage ref={this.imageEl} />
          </div>
          <CoverDecorator />
        </CoverDisc>
      </CoverContainer>
    )
  }

  update(url: string | undefined, colors: string[], center: boolean) {
    const img = this.imageEl.current;

    const cont = this.containerEl.current;
    if (cont) {
      const updateCenter = () => {
        const c = 'center';

        if (center) {
          cont.classList.add(c);
        } else {
          cont.classList.remove(c);
        }
      }

      const hide = () => {
        cont.classList.remove('visible');
      }

      const reveal = () => {
        const disc = this.discEl.current;

        if (disc) {
          disc.setColors(colors);
        }

        if (img) {
          img.classList.remove('visible');
          img.src = url || '';
          url && img.classList.add('visible');
        }

        cont.classList.add('visible');
      }

      const revealThenCenter = () => {
        hide();

        setTimeout(() => {
          reveal();
          setTimeout(updateCenter, 1e3);
        }, 1.1e3);
      }

      const centerThenReveal = () => {
        updateCenter();

        setTimeout(() => {
          hide();
          setTimeout(reveal, 1.1e3);
        }, 1e3);
      }

      const isCentered = cont.classList.contains('center');
      const animate =  (isCentered && !center) ? centerThenReveal : revealThenCenter;

      animate();
    }
  }
}
