
import React from 'react';
import WaitingRoomHost from './WaitingRoomHost';
import WaitingRoomGuest from './WaitingRoomGuest';

interface WaitingRoomProps {
  roomId: string;
  hostName: string;
  onBack: () => void;
  onGameStart: (playerName?: string) => void;
  isGuest?: boolean;
}

const WaitingRoom: React.FC<WaitingRoomProps> = ({ 
  roomId, 
  hostName, 
  onBack, 
  onGameStart,
  isGuest = false
}) => {
  if (isGuest) {
    return (
      <WaitingRoomGuest 
        roomId={roomId}
        onBack={onBack}
        onGameStart={onGameStart}
      />
    );
  }

  return (
    <WaitingRoomHost 
      roomId={roomId}
      hostName={hostName}
      onBack={onBack}
      onGameStart={onGameStart}
    />
  );
};

export default WaitingRoom;
