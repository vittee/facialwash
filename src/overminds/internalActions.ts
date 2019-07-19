import { Action } from ".";
import { Track } from "common/track";

export const trackReceived: Action<Track> = ({ state }, track) => {
  state.currentTrack = track;
}
