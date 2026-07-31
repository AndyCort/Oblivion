import { useEffect, useRef } from 'react';
import { useMusicStore, musicStore } from '../stores/musicStore';

export function useGlobalAudio() {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { playlist, currentIndex, isPlaying, seekTime } = useMusicStore();
    const currentTrack = playlist[currentIndex] || null;

    useEffect(() => {
        if (!audioRef.current) {
            const audio = new Audio();
            audio.preload = 'auto';

            audio.onended = () => {
                musicStore.nextTrack();
            };
            audio.onerror = () => {
                musicStore.syncIsPlaying(false);
            };
            audio.ontimeupdate = () => {
                musicStore.syncTime(audio.currentTime, audio.duration || 0);
            };
            audio.onloadedmetadata = () => {
                musicStore.syncTime(audio.currentTime, audio.duration || 0);
            };

            audioRef.current = audio;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
                audioRef.current = null;
            }
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || !currentTrack) return;

        if (audio.src !== currentTrack.audio) {
            audio.src = currentTrack.audio;
            audio.load();
        }

        if (isPlaying) {
            audio.play().catch(e => {
                console.warn('Playback failed', e);
                musicStore.syncIsPlaying(false);
            });
        } else {
            audio.pause();
        }
    }, [currentTrack, isPlaying]);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio || seekTime === null) return;
        
        audio.currentTime = seekTime;
        musicStore.clearSeek();
    }, [seekTime]);
}
