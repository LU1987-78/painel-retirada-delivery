import { useCallback, useRef } from 'react';

export function useVoiceAlert() {
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const isPlayingRef = useRef(false);

  const speak = useCallback((text: string, repeat: number = 1) => {
    // Cancelar qualquer fala anterior
    window.speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'pt-BR';
    utterance.rate = 0.9; // Velocidade um pouco mais lenta para clareza
    utterance.pitch = 1;
    utterance.volume = 1;

    utteranceRef.current = utterance;
    isPlayingRef.current = true;

    let count = 0;

    const onEnd = () => {
      count++;
      if (count < repeat) {
        // Pequena pausa entre repetições
        setTimeout(() => {
          window.speechSynthesis.speak(utterance);
        }, 500);
      } else {
        isPlayingRef.current = false;
      }
    };

    utterance.onend = onEnd;
    utterance.onerror = () => {
      isPlayingRef.current = false;
    };

    window.speechSynthesis.speak(utterance);
  }, []);

  const stop = useCallback(() => {
    window.speechSynthesis.cancel();
    isPlayingRef.current = false;
  }, []);

  const isPlaying = useCallback(() => isPlayingRef.current, []);

  return { speak, stop, isPlaying };
}
