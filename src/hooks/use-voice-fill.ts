"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { readJsonResponse } from "@/lib/http/read-json-response";
import type { TransactionType } from "@/types/listing";
import type { VoiceParseResult } from "@/types/voice-parse";

type VoiceFillState = "idle" | "recording" | "processing";

type ParseVoiceResponse = {
  transcript?: string;
  fields?: VoiceParseResult;
  error?: string;
};

export type VoiceFillParseResult = {
  fields: VoiceParseResult;
  transcript?: string;
};

function pickRecorderMimeType(): string | undefined {
  if (typeof MediaRecorder === "undefined") return undefined;
  const candidates = [
    "audio/webm;codecs=opus",
    "audio/webm",
    "audio/mp4",
    "audio/ogg;codecs=opus",
  ];
  return candidates.find((type) => MediaRecorder.isTypeSupported(type));
}

export function useVoiceFill(currentListingType: TransactionType) {
  const [state, setState] = useState<VoiceFillState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [supported, setSupported] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const currentListingTypeRef = useRef(currentListingType);
  const recordingStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    currentListingTypeRef.current = currentListingType;
  }, [currentListingType]);

  const cleanupStream = useCallback(() => {
    mediaStreamRef.current?.getTracks().forEach((track) => track.stop());
    mediaStreamRef.current = null;
  }, []);

  useEffect(() => {
    setSupported(
      typeof window !== "undefined" &&
        Boolean(navigator.mediaDevices?.getUserMedia) &&
        typeof MediaRecorder !== "undefined",
    );
    return () => {
      mediaRecorderRef.current?.stop();
      cleanupStream();
    };
  }, [cleanupStream]);

  useEffect(() => {
    if (state !== "recording" || !recordingStartedAtRef.current) {
      setRecordingSeconds(0);
      return;
    }

    const tick = () => {
      const started = recordingStartedAtRef.current;
      if (!started) return;
      setRecordingSeconds(Math.floor((Date.now() - started) / 1000));
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [state]);

  const stopRecording = useCallback(async (): Promise<VoiceFillParseResult | null> => {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      setState("idle");
      return null;
    }

    setState("processing");
    setError(null);

    const blob = await new Promise<Blob>((resolve, reject) => {
      recorder.onstop = () => {
        resolve(new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" }));
      };
      recorder.onerror = () => reject(new Error("Recording failed"));
      recorder.stop();
    });

    mediaRecorderRef.current = null;
    cleanupStream();
    chunksRef.current = [];

    try {
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      formData.append("currentListingType", currentListingTypeRef.current);

      const res = await fetch("/api/parse-voice", {
        method: "POST",
        body: formData,
      });
      const data = await readJsonResponse<ParseVoiceResponse>(res);
      if (!res.ok || !data.fields) {
        throw new Error(data.error ?? "Failed to parse voice input");
      }

      setTranscript(data.transcript?.trim() || null);
      setState("idle");
      recordingStartedAtRef.current = null;
      return { fields: data.fields, transcript: data.transcript?.trim() };
    } catch (err) {
      setState("idle");
      recordingStartedAtRef.current = null;
      setError(err instanceof Error ? err.message : "Failed to parse voice input");
      return null;
    }
  }, [cleanupStream]);

  const startRecording = useCallback(async () => {
    if (!supported) return;

    setError(null);
    chunksRef.current = [];

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    mediaStreamRef.current = stream;

    const mimeType = pickRecorderMimeType();
    const recorder = mimeType
      ? new MediaRecorder(stream, { mimeType })
      : new MediaRecorder(stream);

    recorder.ondataavailable = (event) => {
      if (event.data.size > 0) chunksRef.current.push(event.data);
    };

    mediaRecorderRef.current = recorder;
    recordingStartedAtRef.current = Date.now();
    recorder.start();
    setState("recording");
  }, [supported]);

  const toggle = useCallback(
    async (onParsed: (result: VoiceFillParseResult) => void) => {
      if (state === "processing") return;

      if (state === "recording") {
        const result = await stopRecording();
        if (result) onParsed(result);
        return;
      }

      try {
        setTranscript(null);
        await startRecording();
      } catch (err) {
        setState("idle");
        setError(
          err instanceof Error ? err.message : "Microphone access was denied or unavailable.",
        );
      }
    },
    [startRecording, state, stopRecording],
  );

  const cancel = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
    }
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    recordingStartedAtRef.current = null;
    cleanupStream();
    setState("idle");
    setError(null);
    setRecordingSeconds(0);
  }, [cleanupStream]);

  return {
    state,
    error,
    supported,
    toggle,
    cancel,
    isRecording: state === "recording",
    isProcessing: state === "processing",
    transcript,
    recordingSeconds,
  };
}
