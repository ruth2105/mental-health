import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { api } from '@/services/apiClient';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Mic,
  MicOff,
  Video as VideoIcon,
  VideoOff,
  PhoneOff,
  MessageSquare,
} from 'lucide-react';

// Note: This component attempts to initialise Twilio Video when available.
// If you use Agora or Vonage, extend the provider branch where we check `provider`.

export default function VideoSession() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get('appointment_id') || undefined;
  const navigate = useNavigate();

  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const remoteVideoRef = useRef<HTMLDivElement | null>(null);

  const [connected, setConnected] = useState(false);
  const [provider, setProvider] = useState<string>('');
  const [muted, setMuted] = useState(false);
  const [videoOn, setVideoOn] = useState(true);
  const [duration, setDuration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const twilioRoomRef = useRef<any | null>(null);
  const localTrackRefs = useRef<any>({ audio: null, video: null });

  useEffect(() => {
    const timer = setInterval(() => setDuration((d) => d + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Redirect to login if not authenticated
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return;
    }

    if (!appointmentId) {
      setError('Missing appointment_id in query params');
      setLoading(false);
      return;
    }

    let mounted = true;

    async function init() {
      setLoading(true);
      try {
        const res = await api.get(`/api/video/token/?appointment_id=${appointmentId}`);
        const data = res.data || {};
        const token = data.token;
        const prov = (data.provider as string) || 'dummy';
        const room = data.room || data.session?.room_id || `room-${appointmentId}`;

        if (!mounted) return;
        setProvider(prov);

        if (prov === 'twilio') {
          // Attempt to dynamically import Twilio Video SDK
          try {
            // @ts-ignore dynamic import
            const Twilio = await import('twilio-video');

            // Attach local preview
            const localEl = localVideoRef.current as HTMLVideoElement | null;

            const connectOpts: any = { name: room };

            // If local preview element is available, createLocalTracks and attach
            try {
              const localTracks = await Twilio.createLocalTracks({ audio: true, video: { width: 640 } });
              // Attach first video track to local preview
              const videoTrack = localTracks.find((t: any) => t.kind === 'video');
              const audioTrack = localTracks.find((t: any) => t.kind === 'audio');
              localTrackRefs.current.video = videoTrack;
              localTrackRefs.current.audio = audioTrack;

              if (videoTrack && localEl) {
                const el = videoTrack.attach();
                el.style.width = '100%';
                el.style.height = '100%';
                localEl.innerHTML = '';
                localEl.appendChild(el);
              }

              // Connect using token and the already created local tracks
              connectOpts.tracks = localTracks;
            } catch (e) {
              // fallback: connect without pre-created tracks
            }

            const roomInstance = await Twilio.connect(token, connectOpts);
            twilioRoomRef.current = roomInstance;
            setConnected(true);

            // When a remote participant connects, attach their first video track to remoteVideoRef
            roomInstance.on('participantConnected', (participant: any) => {
              participant.tracks.forEach((publication: any) => {
                if (publication.isSubscribed) {
                  const track = publication.track;
                  if (track && track.kind === 'video' && remoteVideoRef.current) {
                    const el = track.attach();
                    remoteVideoRef.current.innerHTML = '';
                    remoteVideoRef.current.appendChild(el);
                  }
                }
              });

              participant.on('trackSubscribed', (track: any) => {
                if (track.kind === 'video' && remoteVideoRef.current) {
                  const el = track.attach();
                  remoteVideoRef.current.innerHTML = '';
                  remoteVideoRef.current.appendChild(el);
                }
              });
            });

            // Handle already-present participants
            roomInstance.participants.forEach((participant: any) => {
              participant.tracks.forEach((publication: any) => {
                if (publication.isSubscribed) {
                  const track = publication.track;
                  if (track && track.kind === 'video' && remoteVideoRef.current) {
                    const el = track.attach();
                    remoteVideoRef.current.innerHTML = '';
                    remoteVideoRef.current.appendChild(el);
                  }
                }
              });
              participant.on('trackSubscribed', (track: any) => {
                if (track.kind === 'video' && remoteVideoRef.current) {
                  const el = track.attach();
                  remoteVideoRef.current.innerHTML = '';
                  remoteVideoRef.current.appendChild(el);
                }
              });
            });

            // Handle disconnect
            roomInstance.on('disconnected', (room: any, error: any) => {
              setConnected(false);
            });
          } catch (err) {
            console.warn('Twilio Video SDK not available or failed to initialize', err);
            setError('Realtime provider SDK not available locally. Install `twilio-video` or configure a provider.');
          }
        } else {
          // Dummy provider: we still create a local preview using getUserMedia
          try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            const localEl = localVideoRef.current as HTMLVideoElement | null;
            if (localEl) {
              localEl.srcObject = stream;
              localEl.muted = true;
              await localEl.play().catch(() => {});
            }
            setConnected(true);
          } catch (err) {
            console.error('getUserMedia failed', err);
            setError('Could not access camera/microphone');
          }
        }
      } catch (err: any) {
        console.error(err);
        setError(err?.message || 'Failed to fetch video token');
      } finally {
        if (mounted) setLoading(false);
      }
    }

    init();

    return () => {
      mounted = false;
      // Cleanup Twilio room and local tracks
      try {
        const r = twilioRoomRef.current;
        if (r) {
          r.localParticipant.tracks.forEach((pub: any) => {
            try {
              pub.track.stop && pub.track.stop();
            } catch (e) {}
          });
          r.disconnect();
        }

        const lt = localTrackRefs.current;
        if (lt.audio && lt.audio.stop) lt.audio.stop();
        if (lt.video && lt.video.stop) lt.video.stop();
      } catch (e) {
        // ignore
      }
    };
  }, [appointmentId, navigate]);

  const toggleMute = async () => {
    setMuted((m) => {
      const newVal = !m;
      try {
        const room = twilioRoomRef.current;
        if (room) {
          room.localParticipant.audioTracks.forEach((pub: any) => {
            if (newVal) pub.track.disable();
            else pub.track.enable();
          });
        }
      } catch (e) {}
      // For dummy provider we cannot toggle without stored stream
      return newVal;
    });
  };

  const toggleVideo = () => {
    setVideoOn((v) => {
      const newVal = !v;
      try {
        const room = twilioRoomRef.current;
        if (room) {
          room.localParticipant.videoTracks.forEach((pub: any) => {
            if (newVal) pub.track.enable();
            else pub.track.disable();
          });
        } else {
          const lt = localTrackRefs.current;
          if (lt.video && lt.video.enable && lt.video.disable) {
            if (newVal) lt.video.enable(); else lt.video.disable();
          }
        }
      } catch (e) {}
      return newVal;
    });
  };

  const endCall = () => {
    try {
      const room = twilioRoomRef.current;
      if (room) room.disconnect();
      // Stop local media
      const localEl = localVideoRef.current;
      if (localEl && localEl.srcObject) {
        const tracks = (localEl.srcObject as MediaStream).getTracks();
        tracks.forEach((t) => t.stop());
      }
    } catch (e) {
      console.warn(e);
    }
    navigate('/feedback');
  };

  const formatDuration = (s: number) => {
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col">
      <div className="flex-1 relative p-6">
        <Card className="h-full">
          <div className="grid lg:grid-cols-3 gap-4 h-full">
            <div className="lg:col-span-2 bg-black/80 rounded-md p-2 flex items-center justify-center">
              {loading ? (
                <div className="text-white">Connecting...</div>
              ) : error ? (
                <div className="text-red-400">{error}</div>
              ) : (
                <div className="w-full h-full rounded overflow-hidden relative">
                  {/* remote video */}
                  <div className="absolute inset-0">
                    <div ref={remoteVideoRef as any} className="w-full h-full bg-black flex items-center justify-center" />
                  </div>

                  {/* small local preview bottom-right */}
                  <div className="absolute bottom-4 right-4 w-56 h-40 bg-black/60 rounded overflow-hidden">
                    <video ref={localVideoRef} className="w-full h-full object-cover" playsInline />
                  </div>
                </div>
              )}
            </div>

            <div className="bg-gray-800 rounded-md p-4 flex flex-col gap-4">
              <div className="text-white">
                <div className="font-medium">Realtime Video</div>
                <div className="text-sm text-gray-400">Provider: {provider || 'unknown'}</div>
              </div>

              <div className="flex items-center gap-3">
                <Button size="sm" variant={muted ? 'destructive' : 'secondary'} onClick={toggleMute}>
                  {muted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}<span className="ml-2">{muted ? 'Unmute' : 'Mute'}</span>
                </Button>

                <Button size="sm" variant={videoOn ? 'secondary' : 'destructive'} onClick={toggleVideo}>
                  {videoOn ? <VideoIcon className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}<span className="ml-2">{videoOn ? 'Camera On' : 'Camera Off'}</span>
                </Button>
              </div>

              <div className="mt-auto">
                <div className="mb-2 text-sm text-gray-300">Duration</div>
                <div className="font-mono text-lg text-white">{formatDuration(duration)}</div>
              </div>

              <div className="pt-4">
                <Button size="lg" variant="destructive" className="w-full" onClick={endCall}>
                  <PhoneOff className="inline-block mr-2" /> End Session
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
