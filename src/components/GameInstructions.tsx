
import React from 'react';

const GameInstructions: React.FC = () => {
  return (
    <div className="bg-muted/50 rounded-lg p-4">
      <h3 className="font-semibold mb-2">Como Jogar:</h3>
      <ul className="text-sm text-muted-foreground space-y-1">
        <li>• Compartilhe o link da sala com seu amigo</li>
        <li>• Ele vai entrar com o nome dele</li>
        <li>• O jogo começará automaticamente</li>
        <li>• Você joga como ✕ (primeiro jogador)</li>
      </ul>
    </div>
  );
};

export default GameInstructions;
