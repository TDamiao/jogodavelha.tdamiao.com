declare global {
  interface AndroidAdBridge {
    onMatchFinished?: () => void;
    onMatchRestarted?: () => void;
  }

  interface Window {
    Android?: AndroidAdBridge;
  }
}

export {};
