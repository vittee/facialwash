import _ from 'lodash';
import { Lyrics, Timeline } from 'common/track';

const attnExpr = /\[([^\]]*)\]/g;
const infoExpr = /([^\d:]+):\s*(.*)\s*/;
const timeExpr = /(\d+):(\d+\.\d+)/;

type LineInfo = {
  infos: any[][],
  times: number[],
  text: string
} | null;

type LineResult = LineInfo | null;

function parse_line(line: string): LineResult {
  const match = line.match(/(\[.*\])\s*(.*)/);

  if (!match) {
    return null;
  }

  const [, tag, text] = match;

  const tags = [];
  let m: RegExpExecArray | null;
  while (m = attnExpr.exec(tag)) {
    tags.push(m[1]);
  }

  let infos: any = [];
  let times: any = [];

  tags.forEach(t => {
    const info_match = t.match(infoExpr);

    if (info_match) {
      const [, key, value] = info_match;
      infos.push([key, value]);
      return;
    }

    const time_match = t.match(timeExpr);
    if (time_match) {
      const [, mm, ss] = time_match;

      const mins = parseInt(mm);
      const secs = parseFloat(ss);
      times.push(1e3*(60*mins+secs));
    }
  });

  return {
    infos,
    times,
    text
  }
}

export function parse_lyric(data: any): Lyrics {
  const lines: LineResult[] = data.toString()
    .replace(/\r\n/g, "\n")
    .split(/\n/)
    .map(parse_line);

  const infos = _.defaults(_.fromPairs(_(lines)
    .map(l => l && l.infos)
    .flatten()
    .reject((i: any) => _.isEmpty(i) || _.some(i, _.isEmpty))
    .map((i: any) => {
      let [k,v] = i;
      if (k === 'offset') {
        v=+v;
      }
      return [k,v];
    })
    .value() as unknown as any[][]
  ), { offset: 0 });

  const { offset } = infos;

  const timeline = _(lines)
    .map((l: any) => {
      if (l) {
        l = _.omit(l, 'infos');
      }
      return l;
    })
    .flatMap((l: any) => {
      if (!l) return ({ time: null, text: '' });

      const { text, times } = l;
      return times.map((time: any) => {
        return ({
         time: time - offset,
         text
        })
      });
    })
    .value();

  const hasTime = (l: any) => !_.isNull(l.time);

  if (_.some(timeline, _.isObject)) {
    // Trim nulls from head and tail
    const firstIndex = _.findIndex(timeline, hasTime);

    if (firstIndex > 0) {
      timeline.splice(0, firstIndex);
    }

    const lastIndex = _.findLastIndex(timeline, hasTime);

    if (lastIndex < timeline.length) {
      timeline.splice(lastIndex + 1, timeline.length - lastIndex - 1);
    }

    let index = 0;
    let length = timeline.length;
    while (index < length) {
      const nextIndex = _.findIndex(timeline, hasTime, index + 1);

      if (nextIndex < 0) {
        break;
      }

      const current = timeline[index];
      const next = timeline[nextIndex];

      if (current === null) {
        index = nextIndex;
        continue;
      }

      if (next === null) {
        break;
      }

      const skipCount = nextIndex - index - 1;

      if (skipCount > 0) {
        const idleingTime = _.min([current.time + 6000, next.time]);

        const duration = (next.time - idleingTime) / skipCount;
        const newTimes = _.map(Array(skipCount), (t,i) => current.time+(i*duration));

        let filler = _(newTimes)
          .map(t => _.clamp(t, idleingTime, next.time))
          .sort()
          .map(time => ({ time, text: ''}))
          .value();

        // Reduce duplicated empty time
        const dups = _(filler)
          .filter(f => f.text === '')
          .countBy('time')
          .omitBy(c => c <= 1)
          .toPairs()
          .map(p => {
            const [t, c] = p as any;
            return [+t,c-1];
          })
          .sortBy(p => -p[0])
          .value();

        dups.forEach(d => {
          let [t,c] = d;
          filler = _.reject(filler, ({ time }) => {
            return (time === t) ? (c-- > 0) : false;
          });
        });

        Array.prototype.splice.apply(timeline, [index + 1, skipCount].concat(filler as any) as any)
      }

      index = nextIndex;
    }

    // post processing
    if (timeline.length > 1) {
      const { time, text } = _.last(timeline);

      if (time === 59940000 || /^\*{3}.*\*{3}$/.test(text)) {
        timeline.pop();
      }
    }

    const last = _.last(timeline);

    if (last) {
      timeline.push({ time: last.time + 4000, text: '' });
    }

    if (timeline.length) {
      timeline.unshift({ time: 0, text: '' });
    }
  }

  return {
    infos,
    timeline: _(timeline)
      .reject(_.isNull)
      .sortBy('time')
      .map(({ time, text }) => [time, text])
      .value() as Timeline
  }
}
