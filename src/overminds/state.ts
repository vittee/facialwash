import { Track } from "./effects/socket";

type State = {
  currentTrack: Track | undefined,
}

export const state: State = {
  currentTrack: undefined,
}
