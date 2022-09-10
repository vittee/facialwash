import { TrackInfo } from "common/track";
import { Action } from ".";

export const trackReceived: Action<TrackInfo> = ({ state }, info) => {
  state.currentTrackInfo = info;
}
