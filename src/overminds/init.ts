import { Initializer } from ".";

export const onInitialize: Initializer = ({ effects, actions}) => {
  effects.socket.init();
  effects.socket.onTrack = actions.internal.trackReceived;
}
