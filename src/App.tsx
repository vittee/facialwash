import React from 'react';
import { useOvermind } from 'overminds';
import { Lyrics } from 'components/Lyrics';

const App: React.FC = (props) => {
  console.log('App render');

  const { state } = useOvermind();

  const track = state.currentTrack;

  return (
    <>
      <Lyrics track={track} />
    </>
  );
}

export default App;
