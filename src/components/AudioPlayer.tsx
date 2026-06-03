"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Volume2,
  VolumeX,
  Gauge,
} from "lucide-react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
}

function formatTime(seconds: number): string {
  if (!isFinite(seconds) || seconds < 0) return "0:00";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2] as const;

export default function AudioPlayer({ audioUrl, title }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [speed, setSpeed] = useState<number>(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const volumePercent = isMuted ? 0 : volume * 100;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onLoadedMetadata = () => {
      setDuration(audio.duration);
      setIsLoaded(true);
    };

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const onEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    audio.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.addEventListener("timeupdate", onTimeUpdate);
    audio.addEventListener("ended", onEnded);

    return () => {
      audio.removeEventListener("loadedmetadata", onLoadedMetadata);
      audio.removeEventListener("timeupdate", onTimeUpdate);
      audio.removeEventListener("ended", onEnded);
    };
  }, []);

  // Close speed menu when clicking outside
  useEffect(() => {
    if (!showSpeedMenu) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest("[data-speed-menu]")) {
        setShowSpeedMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showSpeedMenu]);

  const togglePlayPause = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().then(() => setIsPlaying(true)).catch(() => {});
    }
  }, [isPlaying]);

  const skipBackward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, audio.currentTime - 10);
  }, []);

  const skipForward = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.min(audio.duration, audio.currentTime + 10);
  }, []);

  const handleProgressChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio || !duration) return;
      const newTime = (parseFloat(e.target.value) / 100) * duration;
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    },
    [duration]
  );

  const handleVolumeChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const audio = audioRef.current;
      if (!audio) return;
      const newVolume = parseFloat(e.target.value) / 100;
      setVolume(newVolume);
      audio.volume = newVolume;
      if (newVolume > 0 && isMuted) {
        setIsMuted(false);
        audio.muted = false;
      }
    },
    [isMuted]
  );

  const toggleMute = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    const newMuted = !isMuted;
    setIsMuted(newMuted);
    audio.muted = newMuted;
  }, [isMuted]);

  const handleSetSpeed = useCallback((s: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.playbackRate = s;
    setSpeed(s);
    setShowSpeedMenu(false);
  }, []);

  return (
    <div className="w-full rounded-2xl bg-white p-6 shadow-md animate-fade-in">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      {/* Title */}
      <p className="mb-4 text-center text-sm font-medium text-gray-500 truncate">
        {title}
      </p>

      {/* Progress Bar */}
      <div className="mb-2">
        <div className="audio-progress-track">
          <div
            className="audio-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
          <input
            type="range"
            className="audio-range"
            min="0"
            max="100"
            step="0.1"
            value={progressPercent}
            onChange={handleProgressChange}
            aria-label="Tiến trình phát"
          />
        </div>
        <div className="mt-1.5 flex items-center justify-between text-xs text-gray-400">
          <span>{formatTime(currentTime)}</span>
          <span>{formatTime(duration)}</span>
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center justify-center gap-4">
        {/* Skip Back 10s */}
        <button
          type="button"
          onClick={skipBackward}
          disabled={!isLoaded}
          aria-label="Lùi 10 giây"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipBack className="h-5 w-5" aria-hidden="true" />
        </button>

        {/* Play / Pause */}
        <button
          type="button"
          onClick={togglePlayPause}
          disabled={!isLoaded}
          aria-label={isPlaying ? "Tạm dừng" : "Phát"}
          className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl disabled:opacity-40 disabled:cursor-not-allowed"
        >
          {isPlaying ? (
            <Pause className="h-6 w-6" aria-hidden="true" />
          ) : (
            <Play className="h-6 w-6 ml-0.5" aria-hidden="true" />
          )}
        </button>

        {/* Skip Forward 10s */}
        <button
          type="button"
          onClick={skipForward}
          disabled={!isLoaded}
          aria-label="Tiến 10 giây"
          className="flex h-10 w-10 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-orange-50 hover:text-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <SkipForward className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* Volume + Speed */}
      <div className="mt-4 flex items-center justify-between gap-2">
        {/* Volume */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={toggleMute}
            aria-label={isMuted ? "Bật tiếng" : "Tắt tiếng"}
            className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 transition-colors hover:text-orange-500"
          >
            {isMuted || volume === 0 ? (
              <VolumeX className="h-4 w-4" aria-hidden="true" />
            ) : (
              <Volume2 className="h-4 w-4" aria-hidden="true" />
            )}
          </button>
          <div className="audio-volume-track">
            <div
              className="audio-volume-fill"
              style={{ width: `${volumePercent}%` }}
            />
            <input
              type="range"
              className="audio-range"
              min="0"
              max="100"
              step="1"
              value={volumePercent}
              onChange={handleVolumeChange}
              aria-label="Âm lượng"
            />
          </div>
        </div>

        {/* Speed Control */}
        <div className="relative" data-speed-menu>
          <button
            type="button"
            onClick={() => setShowSpeedMenu((v) => !v)}
            aria-label="Tốc độ phát"
            aria-expanded={showSpeedMenu}
            className={`flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              speed !== 1
                ? "border-orange-400 text-orange-500 bg-orange-50"
                : "border-gray-200 text-gray-500 hover:border-orange-400 hover:text-orange-500"
            }`}
          >
            <Gauge className="h-3.5 w-3.5" aria-hidden="true" />
            {speed === 1 ? "Tốc độ" : `${speed}×`}
          </button>

          {showSpeedMenu && (
            <div className="absolute bottom-full right-0 mb-2 z-20 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl min-w-[110px]">
              <p className="px-3 pt-2.5 pb-1 text-[10px] font-semibold uppercase tracking-wider text-gray-400">
                Tốc độ phát
              </p>
              {SPEEDS.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => handleSetSpeed(s)}
                  className={`flex w-full items-center justify-between px-4 py-2 text-sm transition-colors hover:bg-orange-50 ${
                    speed === s ? "font-bold text-orange-500" : "text-gray-700"
                  }`}
                >
                  <span>{s === 1 ? "1× Bình thường" : `${s}×`}</span>
                  {speed === s && (
                    <span className="ml-2 h-1.5 w-1.5 shrink-0 rounded-full bg-orange-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
