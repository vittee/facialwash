import { Track } from "common/track";

type State = {
  currentTrack: Track | undefined,
}

export const state: State = {
  currentTrack: undefined,
}
