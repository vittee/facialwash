import type { Track, TrackInfo } from "common/types";
import { Action } from ".";

export const trackReceived: Action<TrackInfo> = ({ state }, info) => {
  state.currentTrackInfo = info;
  state.next = undefined;
  state.nextLoading = false;
}

export const nexTrackLoaded: Action<Track['tags']> = ({ state }, tags) => {
  state.next = tags;
  state.nextLoading = false;
}

export const nexTrackStarted: Action = ({ state }) => {
  state.nextLoading = true;
}
