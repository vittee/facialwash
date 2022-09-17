import type { Tags, TrackInfo } from "common/types";

type State = {
  currentTrackInfo?: TrackInfo;
  next?: Tags;
  nextLoading: boolean;
}

export const state: State = {
  nextLoading: false
}
