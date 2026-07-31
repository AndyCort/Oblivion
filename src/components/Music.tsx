import React from 'react';
import styled from 'styled-components';
import { Play, Pause, StepBack, StepForward } from 'lucide-react';
import { useMusicStore, musicStore } from '../stores/musicStore';

const formatTime = (time: number) => {
  if (isNaN(time)) return '00:00';
  const mins = Math.floor(time / 60);
  const secs = Math.floor(time % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

const MusicContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 30vw;
  padding: 0;
  border-radius: 12px;
  transition: background-color 0.3s ease;
  overflow: hidden;
  cursor: pointer;

 
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 15px;
  width: 100%;
  `;

const CurrentTime = styled.span`
  font-size: 12px;
`;

const TotalTime = styled.span`
  font-size: 12px;
`;

const Timeline = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(128, 128, 128, 0.3);
  margin: 0 10px;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
`;

const ProgressBar = styled.div<{ width: number }>`
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: ${props => props.width}%;
  background: currentColor;
  border-radius: 2px;
  pointer-events: none;
`;

const Controller = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 10px 15px 15px;
`;


export default function Music() {
  const { isPlaying, currentTime, duration, playlist, currentIndex } = useMusicStore();
  const currentTrack = playlist[currentIndex];

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const width = rect.width;
    const newTime = (clickX / width) * duration;
    if (duration > 0) {
      musicStore.seek(newTime);
    }
  };

  return (
    <MusicContainer>
      <Progress>
        <CurrentTime>
          {formatTime(currentTime)}
        </CurrentTime>
        <Timeline onClick={handleTimelineClick}>
          <ProgressBar width={progressPercentage} />
        </Timeline>
        <TotalTime>
          {formatTime(duration)}
        </TotalTime>
      </Progress>
      <Controller>
        <StepBack size={16} onClick={() => musicStore.prevTrack()} style={{ cursor: 'pointer' }} />
        <div onClick={() => musicStore.togglePlay()} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </div>
        <StepForward size={16} onClick={() => musicStore.nextTrack()} style={{ cursor: 'pointer' }} />
      </Controller>
    </MusicContainer>
  );
}