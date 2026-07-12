/// <reference types="vite/client" />

interface Window {
  Android?: {
    onMatchRestarted?: () => void;
    onMatchFinished?: () => void;
  };
}
