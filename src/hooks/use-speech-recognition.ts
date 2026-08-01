"use client";

import { useCallback, useEffect, useRef, useState } from "react";

function getSpeechRecognitionCtor():
  | SpeechRecognitionConstructor
  | undefined {
  if (typeof window === "undefined") return undefined;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition;
}

export function useSpeechRecognition(lang: string) {
  const [listening, setListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    setSupported(Boolean(getSpeechRecognitionCtor()));
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    recognitionRef.current = null;
    setListening(false);
  }, []);

  const start = useCallback(
    (onFinalTranscript: (text: string) => void) => {
      const Ctor = getSpeechRecognitionCtor();
      if (!Ctor) return;

      stop();

      const recognition = new Ctor();
      recognition.lang = lang;
      recognition.continuous = true;
      recognition.interimResults = true;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        let chunk = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result?.isFinal && result[0]?.transcript) {
            chunk += result[0].transcript;
          }
        }
        const text = chunk.trim();
        if (text) onFinalTranscript(text);
      };

      recognition.onend = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognition.onerror = () => {
        setListening(false);
        recognitionRef.current = null;
      };

      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    },
    [lang, stop],
  );

  useEffect(() => () => stop(), [stop]);

  return { listening, supported, start, stop };
}
