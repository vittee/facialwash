import React from 'react';
import { useOvermind } from 'overminds';
import { Lyrics } from 'components/Lyrics';
import styled from 'styled-components';

const Title = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  z-index: 40;
  padding: 2px 8px 2px 4px;
  border-radius: 0px 0px 6px 0px;
  background-color: rgba(0, 0, 0, 0.1);
  color: rgba(0, 0, 0, 0.8);
`;

const App: React.FC = () => {
  const { state } = useOvermind();

  const track = state.currentTrack;
  const lines = 8;
  const lineHeight = 1.8;

  return (
    <>
      <Lyrics {...{ track, lines, lineHeight } }/>
      <Title>{track && `${track.meta['artist']} - ${track.meta['title']}`}</Title>
    </>
  );
}

export default App;
