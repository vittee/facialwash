import { TrackInfo } from "common/track";

type State = {
  currentTrackInfo: TrackInfo | undefined,
}

export const state: State = {
  currentTrackInfo: undefined,
}
