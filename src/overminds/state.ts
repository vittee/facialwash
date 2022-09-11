import { Tags, TrackInfo } from "common/track";

type State = {
  currentTrackInfo?: TrackInfo;
  next?: Tags;
  nextLoading: boolean;
}

export const state: State = {
  nextLoading: false
}
