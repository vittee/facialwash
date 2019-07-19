import _ from 'lodash';
import util from 'util';

const D = '[ti:เสียงสะท้อน]\n[ar:นิว จิ๋ว]\n[al:]\n[by:]\n[offset:0]\n\n[00:04.60]   [00:04.60]   [00:04.60][00:04.60][00:04.60]     เพลง: เสียงสะท้อน\n[00:09.20]ศิลปิน: นิว จิ๋ว\n\n[00:13.80]นานเท่าไหร่แล้วเธอ\n[00:16.85]ที่ทำเพื่อเธอมากมาย\n[00:20.09]เท่าที่คนคนหนึ่งทำเพื่อใครคนนึง\n[00:23.85]ที่เขารักได้\n\n[00:27.12]นานเท่าไหร่แล้วเธอ\n[00:30.41]ที่ฉันรักเธอมากมาย\n[00:33.47]เท่าที่คนคนหนึ่งจะรักใครคนหนึ่ง\n[00:37.02]นั่นคือหมดหัวใจ\n\n[00:39.95]แต่ดูเหมือนแม้พยายามสักเท่าไร\n[00:47.34]ก็เหมือนมีกระจกเงาที่กั้นเราเอาไว้\n[00:54.24]แม้ฉันทำทุกทางยอมทุ่มเททั้งใจ\n[01:00.79]ตะโกนบอกเธอดังเท่าไร\n[01:04.24]ไม่เคยส่งไปถึงเธอ\n\n[01:08.65]ได้ยินฉันไหมได้ยินฉันไหม\n[01:12.13]กี่คำว่ารักที่ดังในใจ\n[01:15.08]เธอมองเห็นไหมเธอเคยเห็นไหม\n[01:19.32]รักเธอเท่าไร\n[01:22.32]หมื่นคำว่ารักจากคนที่ไม่รัก\n[01:25.64]คงมีแค่ฉันได้ยินใช่ไหม\n[01:28.93]ทุกความรู้สึกและทุกความเจ็บ\n[01:32.82]สะท้อนมาที่ฉันคนเดียว\n\n[01:38.44]Have you ever felt my love\n[01:48.55]Never ever feel it\n\n[01:50.18]ถ้ายังรักเธอไม่พอ\n[01:53.32]ถ้าทำเพื่อเธอน้อยไป\n[01:56.43]คงไม่มีอะไรที่ฉันให้เธอไป\n[02:00.16]ได้มากกว่านี้\n[02:03.56]ยิ่งมองตัวเองเท่าไหร่\n[02:06.69]ยิ่งชัดเจนขึ้นทุกที\n[02:10.01]วันที่เธอรักกันวันนั้นคงไม่มี\n[02:13.46]ไม่ว่านานเท่าไร\n\n[02:16.33]ได้ยินฉันไหมได้ยินฉันไหม\n[02:19.65]กี่คำว่ารักที่ดังในใจ\n[02:22.78]เธอมองเห็นไหมเธอเคยเห็นไหม\n[02:26.65]รักเธอเท่าไร\n[02:29.84]หมื่นคำว่ารักจากคนที่ไม่รัก\n[02:33.21]คงมีแค่ฉันได้ยินใช่ไหม\n[02:36.45]ทุกความรู้สึกและทุกความเจ็บ\n[02:40.52]สะท้อนมาที่ฉันคนเดียว\n\n[02:46.14]Have you ever felt my love\n\n[02:56.98]ได้ยินฉันไหม\n[03:03.25]เธอเคยเห็นไหมเธอเคยเห็นไหม\n[03:07.40]รักเธอเท่าไร\n[03:10.38]หมื่นคำว่ารักจากคนที่ไม่รัก\n[03:13.83]คงมีแค่ฉันได้ยินใช่ไหม\n[03:17.38]ทุกความรู้สึกและทุกความเจ็บ\n[03:21.20]สะท้อนมาที่ฉันคนเดียว\n\n[03:26.73]Have you ever felt my love\n[03:36.79]Never ever feel it\n[999:00.00]***เนื้อเพลงจากที่อื่น***\n';

const attnExpr = /\[([^\]]*)\]/g;
const infoExpr = /([^\d:]+):\s*(.*)\s*/;
const timeExpr = /(\d+):(\d+\.\d+)/;

type LineInfo = {
  infos: any[][],
  time: number,
  text: string
} | null;

type LineResult = LineInfo | null;

export type Lyric = {
  infos: any;
  timeline: any[][];
}

function parse_line(line: string): LineResult {
  const match = line.match(/(\[.*\])\s*(.*)/);

  if (!match) {
    return null;
  }

  const result: LineResult = {
    infos: [],
    time: 0,
    text: ''
  };

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
    time: _.max(times) as number,
    text
  }
}

export function parse_lyric(data: any): Lyric {
  const lines: LineResult[] = data.toString().replace(/\r\n/, "\n").split(/\n/).map(parse_line);

  const infos = _.defaults(_.fromPairs(_(lines)
    .map(l => l && l.infos)
    .flatten()
    .reject((i: any) => _.isEmpty(i) || _.some(i, _.isEmpty))
    .map((i: any) => {
      let [k,v] = i;
      if (k === 'offset') v=+v;
      return [k,v];
    })
    .value() as unknown as any[][]
  ), { offset: 0 });

  const { offset } = infos;

  const timeline = _(lines)
    .map((l: any) => {
      if (l) {
        l = _.omit(l, 'infos');
        l.time += offset;
      }
      return l;
    })
    .reject((l: any) => l && !isFinite(l.time))
    .value();

  if (_.some(timeline, _.isObject)) {
    // Trim nulls from head and tail
    const firstIndex = _.findIndex(timeline, _.isObject);

    if (firstIndex > 0) {
      timeline.splice(0, firstIndex);
    }

    const lastIndex = _.findLastIndex(timeline, _.isObject);

    if (lastIndex < timeline.length) {
      timeline.splice(lastIndex + 1, timeline.length - lastIndex - 1);
    }

    let index = 0;
    let length = timeline.length;
    while (index < length) {
      const nextIndex = _.findIndex(timeline, _.isObject, index + 1);

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
        const duration = (next.time - current.time) / (skipCount + 1);
        const newTimes = _.map(Array(skipCount), (t,i) => current.time+(i*duration));

        if (newTimes[0] < current.time + 4000) {
          newTimes[0] += current.time + 4000;
        }

        let filler = _(newTimes)
          .map(t => _.clamp(t, current.time, next.time))
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
  }

  return {
    infos,
    timeline: _(timeline)
      .reject(_.isNull)
      .sortBy('time')
      .map(({ time, text }) => [time, text])
      .value()
  }
}
