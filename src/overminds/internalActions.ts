import { Action } from ".";
import { Track } from "./effects/socket";

export const trackReceived: Action<Track> = ({ state }, track) => {
  state.currentTrack = track;
}
