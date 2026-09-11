"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";
import type { Socket } from "socket.io-client";
import {
  addIceCandidate,
  createAnswer,
  createOffer,
  createPeerConnection,
  getMovieStream,
  setRemoteDescription,
  type MovieCapture,
} from "@/lib/webrtc";

interface UseMovieWebRTCOptions {
  socket: Socket | null;
  roomCode: string;
  isHost: boolean;
  userId: string | null;
  // A ref, not the element itself — refs must only be read inside effects/
  // callbacks, never during render, and this hook is called during render
  // (it's invoked directly in VideoPlayer's function body). Passing the ref
  // itself lets every callback below read `.current` fresh, at the moment
  // it actually runs, instead of capturing whatever the element was at the
  // last render — which could be stale or still null.
  videoRef: RefObject<HTMLVideoElement | null>;
}

interface OfferPayload {
  roomCode: string;
  fromUserId: string;
  targetUserId: string;
  offer: RTCSessionDescriptionInit;
}

interface AnswerPayload {
  roomCode: string;
  fromUserId: string;
  targetUserId: string;
  answer: RTCSessionDescriptionInit;
}

interface IcePayload {
  roomCode: string;
  fromUserId: string;
  targetUserId: string;
  candidate: RTCIceCandidateInit;
}

export function useMovieWebRTC({
  socket,
  roomCode,
  isHost,
  userId,
  videoRef,
}: UseMovieWebRTCOptions) {
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());
  const pendingCandidatesRef = useRef<
    Map<string, RTCIceCandidateInit[]>
  >(new Map());

  const movieCaptureRef = useRef<MovieCapture | null>(null);
  // GUEST only: one MediaStream per remote peer that we build ourselves by
  // appending each incoming track, rather than trusting `event.streams[0]`
  // to be the same object across separate audio/video `track` events. Some
  // browsers fire those events with distinct MediaStream instances even
  // though they share an id, which can leave a `<video>` stuck decoding
  // only the first track it saw (typically audio) — a real-world "I can
  // hear it but not see it" symptom that a synthetic video-only test never
  // exercises.
  const remoteStreamsRef = useRef<Map<string, MediaStream>>(new Map());

  // HOST only: each guest gets their OWN clone of the movie's audio track
  // (see startHostStreaming) so muting one guest's sound can't affect any
  // other guest or the host — they'd all share one MediaStreamTrack object
  // otherwise, and disabling a track disables it everywhere it's used.
  const guestAudioTracksRef = useRef<Map<string, MediaStreamTrack>>(new Map());

  const [connectedPeers, setConnectedPeers] = useState<string[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [supported, setSupported] = useState(true);
  const [mutedGuestIds, setMutedGuestIds] = useState<Set<string>>(new Set());
  // GUEST only: true while the host has silenced this guest specifically
  // (their audio track is present but disabled on the sending end) —
  // distinct from the guest's own local mute, which is just their own
  // volume preference and doesn't affect what they'd hear if unmuted.
  const [hostMutedMe, setHostMutedMe] = useState(false);

  const updatePeers = useCallback(() => {
    setConnectedPeers(Array.from(peersRef.current.keys()));
  }, []);

  const closePeer = useCallback(
    (userIdToRemove: string) => {
      const peer = peersRef.current.get(userIdToRemove);

      if (peer) {
        peer.onicecandidate = null;
        peer.ontrack = null;
        peer.onconnectionstatechange = null;
        peer.close();
      }

      peersRef.current.delete(userIdToRemove);
      pendingCandidatesRef.current.delete(userIdToRemove);
      remoteStreamsRef.current.delete(userIdToRemove);

      const guestAudioClone = guestAudioTracksRef.current.get(userIdToRemove);
      if (guestAudioClone) {
        guestAudioClone.stop();
        guestAudioTracksRef.current.delete(userIdToRemove);
      }
      setMutedGuestIds((prev) => {
        if (!prev.has(userIdToRemove)) return prev;
        const next = new Set(prev);
        next.delete(userIdToRemove);
        return next;
      });

      // A guest only ever has one peer — the host's. If it's gone, the
      // stream is gone too: clear the frozen last frame instead of leaving
      // it on screen looking like playback just silently stopped.
      const video = videoRef.current;
      if (!isHost && video) {
        video.srcObject = null;
        setStreaming(false);
      }

      updatePeers();
    },
    [updatePeers, isHost, videoRef],
  );

  const getPeer = useCallback(
    (remoteUserId: string) => {
      const existing = peersRef.current.get(remoteUserId);

      if (existing) {
        return existing;
      }

      const peer = createPeerConnection();

      peer.onicecandidate = (event) => {
        if (!event.candidate || !socket) {
          return;
        }

        socket.emit("webrtc-ice-candidate", {
          roomCode,
          targetUserId: remoteUserId,
          candidate: event.candidate.toJSON(),
        });
      };

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;

        // "disconnected" is often transient — a momentary Wi-Fi blip or
        // brief network hiccup, especially common on mobile — and the
        // browser's own ICE agent frequently recovers it back to
        // "connected" within a couple of seconds on its own. Tearing the
        // whole connection down here (as we used to) turned every one of
        // those blips into a visible failure needing a full reconnect,
        // instead of letting the browser quietly ride it out. If it truly
        // can't recover, the browser itself will move this to "failed" —
        // that's the actual signal to give up and clean up.
        if (state === "failed" || state === "closed") {
          closePeer(remoteUserId);
        }

        updatePeers();
      };

      if (!isHost) {
        peer.ontrack = (event) => {
          const video = videoRef.current;

          if (!video) {
            return;
          }

          let remoteStream = remoteStreamsRef.current.get(remoteUserId);

          if (!remoteStream) {
            remoteStream = new MediaStream();
            remoteStreamsRef.current.set(remoteUserId, remoteStream);
          }

          if (!remoteStream.getTracks().includes(event.track)) {
            remoteStream.addTrack(event.track);
          }

          if (video.srcObject !== remoteStream) {
            video.srcObject = remoteStream;
          }

          if (event.track.kind === "audio") {
            // When the host disables this guest's audio sender (see
            // setGuestAudioMuted), this same track goes "muted" on our end
            // — no data flowing, not to be confused with the track's own
            // `enabled` property, which is a receiver-local, unrelated
            // switch. Mirror that into state so the UI can explain why the
            // guest's own unmute button wouldn't do anything.
            setHostMutedMe(event.track.muted);
            event.track.onmute = () => setHostMutedMe(true);
            event.track.onunmute = () => setHostMutedMe(false);
          }

          video.play().catch(() => {
            // Browser autoplay policy may require a user interaction.
          });

          setStreaming(true);
        };
      }

      peersRef.current.set(remoteUserId, peer);

      updatePeers();

      return peer;
    },
    [
      socket,
      roomCode,
      isHost,
      videoRef,
      closePeer,
      updatePeers,
    ],
  );

  /*
   * HOST
   *
   * Take the movie currently playing inside the HTML video element
   * and turn it into a MediaStream.
   */
const startHostStreaming = useCallback(
  async (guestUserId: string) => {
    const video = videoRef.current;
    if (!isHost || !socket || !video) {
      return;
    }

    // A guest keeps announcing "I'm ready" every few seconds until it sees
    // a stream (see the retry loop below) — if we already have a peer for
    // this guest, a connection attempt is already underway or complete, so
    // sending a second offer would race with it (and WebRTC's signaling
    // state machine rejects that: "wrong state: stable"). Once that peer
    // actually fails, closePeer() removes it from the map, and the next
    // retry will find nothing here and correctly start fresh.
    if (peersRef.current.has(guestUserId)) {
      return;
    }

    const captureCapableVideo = video as HTMLVideoElement & {
      captureStream?: () => MediaStream;
    };
    if (typeof captureCapableVideo.captureStream !== "function") {
      setSupported(false);
      return;
    }

    let stream = movieCaptureRef.current?.stream ?? null;

    if (!stream || stream.getTracks().length === 0) {
      const capture = getMovieStream(video);

      if (!capture) {
        setSupported(false);
        return;
      }

      // A guest can announce "I'm ready" before the host has picked a movie
      // file at all — the <video> element exists, but its captured stream
      // has no tracks yet. Sending that as an offer would "use up" this
      // guest's slot in peersRef (see the guard above) with a connection
      // carrying no media, and the host would never retry. Bail out without
      // creating a peer so the guest's next retry (every 4s) tries again
      // once the host actually has something loaded.
      if (capture.stream.getTracks().length === 0) {
        capture.stop();
        return;
      }

      movieCaptureRef.current?.stop();
      movieCaptureRef.current = capture;
      stream = capture.stream;
    }

    const peer = getPeer(guestUserId);

    const existingTrackIds = new Set(
      peer
        .getSenders()
        .map((sender) => sender.track?.id)
        .filter(Boolean),
    );

    for (const track of stream.getTracks()) {
      if (track.kind === "audio") {
        // Give this guest their own clone rather than the shared track —
        // see the note on guestAudioTracksRef. Skip only if we've already
        // handed this guest a clone (startHostStreaming shouldn't run
        // twice for the same guest, but this keeps it safe either way).
        if (guestAudioTracksRef.current.has(guestUserId)) {
          continue;
        }

        const guestAudioTrack = track.clone();
        guestAudioTracksRef.current.set(guestUserId, guestAudioTrack);
        peer.addTrack(guestAudioTrack, stream);
        continue;
      }

      if (!existingTrackIds.has(track.id)) {
        peer.addTrack(track, stream);
      }
    }

    const offer = await createOffer(peer);

    socket.emit("webrtc-offer", {
      roomCode,
      targetUserId: guestUserId,
      offer,
    });

    setStreaming(true);
  },
  [
    isHost,
    socket,
    videoRef,
    roomCode,
    getPeer,
  ],
);

  /*
   * HOST receives a new guest.
   */
  useEffect(() => {
    if (!socket || !isHost) {
      return;
    }

    const handleGuestReady = ({
      roomCode: incomingRoomCode,
      userId: guestUserId,
    }: {
      roomCode: string;
      userId: string;
    }) => {
      if (incomingRoomCode !== roomCode) {
        return;
      }

      if (!guestUserId || guestUserId === userId) {
        return;
      }

      startHostStreaming(guestUserId).catch((error) => {
        console.error("Failed to start movie stream:", error);
      });
    };

    socket.on("movie-stream-ready", handleGuestReady);

    return () => {
      socket.off("movie-stream-ready", handleGuestReady);
    };
  }, [
    socket,
    isHost,
    roomCode,
    userId,
    startHostStreaming,
  ]);

  /*
   * GUEST receives HOST offer.
   */
  useEffect(() => {
    if (!socket || isHost) {
      return;
    }

    const handleOffer = async (payload: OfferPayload) => {
      if (payload.roomCode !== roomCode) {
        return;
      }

      if (payload.targetUserId !== userId) {
        return;
      }

      const hostUserId = payload.fromUserId;

      try {
        const peer = getPeer(hostUserId);

        await setRemoteDescription(peer, payload.offer);

        const pendingCandidates =
          pendingCandidatesRef.current.get(hostUserId) || [];

        for (const candidate of pendingCandidates) {
          await addIceCandidate(peer, candidate);
        }

        pendingCandidatesRef.current.delete(hostUserId);

        const answer = await createAnswer(peer);

        socket.emit("webrtc-answer", {
          roomCode,
          targetUserId: hostUserId,
          answer,
        });
      } catch (error) {
        console.error("Failed to process WebRTC offer:", error);
      }
    };

    socket.on("webrtc-offer", handleOffer);

    return () => {
      socket.off("webrtc-offer", handleOffer);
    };
  }, [
    socket,
    isHost,
    roomCode,
    userId,
    getPeer,
  ]);

  /*
   * HOST receives guest answer.
   */
  useEffect(() => {
    if (!socket || !isHost) {
      return;
    }

    const handleAnswer = async (payload: AnswerPayload) => {
      if (payload.roomCode !== roomCode) {
        return;
      }

      if (payload.targetUserId !== userId) {
        return;
      }

      const guestUserId = payload.fromUserId;

      const peer = peersRef.current.get(guestUserId);

      if (!peer) {
        return;
      }

      try {
        await setRemoteDescription(peer, payload.answer);

        setStreaming(true);
      } catch (error) {
        console.error("Failed to process WebRTC answer:", error);
      }
    };

    socket.on("webrtc-answer", handleAnswer);

    return () => {
      socket.off("webrtc-answer", handleAnswer);
    };
  }, [
    socket,
    isHost,
    roomCode,
    userId,
  ]);

  /*
   * ICE candidates.
   */
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleIceCandidate = async (
      payload: IcePayload,
    ) => {
      if (payload.roomCode !== roomCode) {
        return;
      }

      if (payload.targetUserId !== userId) {
        return;
      }

      const remoteUserId = payload.fromUserId;

      const peer = peersRef.current.get(remoteUserId);

      if (!peer) {
        const pending =
          pendingCandidatesRef.current.get(remoteUserId) || [];

        pending.push(payload.candidate);

        pendingCandidatesRef.current.set(
          remoteUserId,
          pending,
        );

        return;
      }

      try {
        await addIceCandidate(peer, payload.candidate);
      } catch (error) {
        console.error(
          "Failed to add ICE candidate:",
          error,
        );
      }
    };

    socket.on(
      "webrtc-ice-candidate",
      handleIceCandidate,
    );

    return () => {
      socket.off(
        "webrtc-ice-candidate",
        handleIceCandidate,
      );
    };
  }, [
    socket,
    roomCode,
    userId,
  ]);

  /*
   * GUEST tells the HOST:
   *
   * "I am ready to receive the movie."
   *
   * Retries on an interval rather than firing once: the host may not have
   * joined yet, may not have loaded a file yet, or the very first message
   * could simply be lost — any of those would otherwise leave a guest
   * stuck forever with no stream and no way to recover. Retrying stops
   * once a stream actually arrives (see `streaming` below).
   */
  useEffect(() => {
    if (!socket || isHost || !userId) {
      return;
    }

    function announceReady() {
      if (streaming) return;
      socket?.emit("movie-stream-ready", { roomCode });
    }

    announceReady();
    const interval = setInterval(announceReady, 4000);
    return () => clearInterval(interval);
  }, [
    socket,
    isHost,
    roomCode,
    userId,
    streaming,
  ]);

  /*
   * User leaves the room.
   */
  useEffect(() => {
    if (!socket) {
      return;
    }

    const handleUserLeft = ({
      userId: leftUserId,
    }: {
      userId: string;
    }) => {
      closePeer(leftUserId);
    };

    socket.on("user-left", handleUserLeft);

    return () => {
      socket.off("user-left", handleUserLeft);
    };
  }, [
    socket,
    closePeer,
  ]);

  /*
   * Cleanup.
   */
  useEffect(() => {
    return () => {
      peersRef.current.forEach((peer) => {
        peer.close();
      });

      peersRef.current.clear();
      remoteStreamsRef.current.clear();

      guestAudioTracksRef.current.forEach((track) => track.stop());
      guestAudioTracksRef.current.clear();

      movieCaptureRef.current?.stop();
      movieCaptureRef.current = null;

      setStreaming(false);
    };
  }, []);

  // Lets the HOST mute their own local speaker without silencing guests —
  // see the routing note in getMovieStream(). A no-op until a capture
  // actually exists (e.g. no guest has connected yet); the video element's
  // own `muted` still governs local playback in the meantime.
  const setLocalMuted = useCallback((mutedValue: boolean) => {
    movieCaptureRef.current?.setLocalMuted(mutedValue);
  }, []);

  // HOST only: silence (or restore) one specific guest's audio without
  // touching anyone else's — see guestAudioTracksRef for why this works
  // per-guest instead of muting the whole movie stream.
  const setGuestAudioMuted = useCallback(
    (guestUserId: string, mutedValue: boolean) => {
      const track = guestAudioTracksRef.current.get(guestUserId);

      if (track) {
        track.enabled = !mutedValue;
      }

      setMutedGuestIds((prev) => {
        const alreadySet = prev.has(guestUserId);
        if (mutedValue === alreadySet) return prev;

        const next = new Set(prev);
        if (mutedValue) {
          next.add(guestUserId);
        } else {
          next.delete(guestUserId);
        }
        return next;
      });
    },
    [],
  );

  return {
    streaming,
    supported,
    connectedPeers,
    startHostStreaming,
    setLocalMuted,
    mutedGuestIds,
    setGuestAudioMuted,
    hostMutedMe,
  };
}