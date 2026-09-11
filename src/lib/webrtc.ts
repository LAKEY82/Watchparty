"use client";

// STUN helps two browsers discover how to reach each other directly; it does
// NOT relay media, and it isn't enough on its own — two peers behind the
// same router can still fail to connect (no NAT hairpin support), and
// client/AP isolation on a network blocks them outright regardless of NAT.
// A TURN server is what actually relays media when a direct path isn't
// possible, so anything beyond two tabs on one machine genuinely needs one.
//
// TURN credentials themselves aren't handled here: they're fetched from our
// own backend (GET /api/turn/credentials, see useMovieWebRTC.ts), which in
// turn holds the real TURN provider's API key server-side. That's the whole
// point — a key that can mint TURN credentials against someone's account
// must never sit in a NEXT_PUBLIC_ variable, where it'd be sitting in
// plain text in the browser bundle for anyone to copy out and abuse.
const DEFAULT_STUN_URLS = [
  "stun:stun.l.google.com:19302",
  "stun:stun1.l.google.com:19302",
];

export function getStunServers(): RTCIceServer {
  const raw = process.env.NEXT_PUBLIC_STUN_URLS;
  const urls = raw ? raw.split(",").map((u) => u.trim()).filter(Boolean) : DEFAULT_STUN_URLS;
  return { urls };
}

export interface PeerConnectionConfig {
  iceServers: RTCIceServer[];
}

export function createPeerConnection(config?: PeerConnectionConfig): RTCPeerConnection {
  return new RTCPeerConnection({ iceServers: config?.iceServers ?? [getStunServers()] });
}

export async function createOffer(peer: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const offer = await peer.createOffer();
  await peer.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(peer: RTCPeerConnection): Promise<RTCSessionDescriptionInit> {
  const answer = await peer.createAnswer();
  await peer.setLocalDescription(answer);
  return answer;
}

export async function setRemoteDescription(
  peer: RTCPeerConnection,
  description: RTCSessionDescriptionInit
): Promise<void> {
  await peer.setRemoteDescription(new RTCSessionDescription(description));
}

export async function addIceCandidate(
  peer: RTCPeerConnection,
  candidate: RTCIceCandidateInit
): Promise<void> {
  await peer.addIceCandidate(new RTCIceCandidate(candidate));
}

export interface MovieCapture {
  stream: MediaStream;
  stop: () => void;
  // Controls what the HOST hears locally, independent of what guests
  // receive — see the audio routing note below for why these two are
  // deliberately kept separate.
  setLocalMuted: (muted: boolean) => void;
}

// Grabs the video element's own rendered output as a live MediaStream —
// this is the one browser API that makes "stream what I'm playing" possible
// without the server ever seeing a video frame. Not supported in every
// browser (notably older Safari), hence the feature-detect + null return
// rather than throwing.
//
// We don't hand back `videoElement.captureStream()`'s video track directly:
// on some Chromium builds it silently produces solid-black video frames for
// a locally-decoded file (a real, documented bug tied to hardware/overlay
// decode paths) while the element itself displays completely normally and
// even `canvas.drawImage(videoElement, ...)` reads real pixel data. So
// instead we continuously draw the video element onto an off-screen canvas
// ourselves and capture THAT — canvas.captureStream() doesn't hit the same
// bug.
export function getMovieStream(videoElement: HTMLVideoElement): MovieCapture | null {
  const mediaElement = videoElement as HTMLVideoElement & {
    captureStream?: () => MediaStream;
  };

  if (typeof mediaElement.captureStream !== "function") {
    return null;
  }

  const canvas = document.createElement("canvas");
  canvas.width = videoElement.videoWidth || 1280;
  canvas.height = videoElement.videoHeight || 720;
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    return null;
  }

  let rafId = 0;

  function draw() {
    if (
      videoElement.videoWidth &&
      (videoElement.videoWidth !== canvas.width ||
        videoElement.videoHeight !== canvas.height)
    ) {
      canvas.width = videoElement.videoWidth;
      canvas.height = videoElement.videoHeight;
    }

    if (!videoElement.paused && !videoElement.ended) {
      ctx!.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
    }

    rafId = requestAnimationFrame(draw);
  }

  rafId = requestAnimationFrame(draw);

  const canvasStream = canvas.captureStream(30);

  // Audio routing: `captureStream()`'s audio track mirrors the element's
  // own `muted`/volume state — if the host mutes their own speaker (e.g.
  // to avoid double audio while testing host+guest on one machine, or just
  // because they're not watching along), guests would silently lose audio
  // too. Web Audio lets us tap the raw decoded audio BEFORE that: `source`
  // feeds the guest-facing `destination` directly (always full volume,
  // regardless of the host's local preference) and separately feeds a
  // `gainNode` that drives what the host actually hears locally. Muting
  // the host is then just `gainNode.gain.value = 0` — it never touches
  // what's captured for guests.
  let audioTracks: MediaStreamTrack[];
  let setLocalMuted: (muted: boolean) => void = () => {};

  const AudioContextCtor =
    window.AudioContext ||
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;

  if (AudioContextCtor) {
    try {
      const audioContext = new AudioContextCtor();
      const source = audioContext.createMediaElementSource(videoElement);
      const destination = audioContext.createMediaStreamDestination();
      const gainNode = audioContext.createGain();

      source.connect(destination);
      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      gainNode.gain.value = videoElement.muted ? 0 : 1;
      setLocalMuted = (muted: boolean) => {
        gainNode.gain.value = muted ? 0 : 1;
      };

      audioContext.resume().catch(() => {
        // Some browsers require a user gesture to resume; the host has
        // already interacted with the page (selecting the file), so this
        // almost always succeeds. If it doesn't, audio is silent until
        // the next interaction — nothing else we can do from here.
      });

      audioTracks = destination.stream.getAudioTracks();
    } catch {
      // createMediaElementSource() can only be called once per element.
      // If something upstream already wired this element up, fall back to
      // captureStream()'s audio track — still correct, just coupled to
      // the element's own mute state again.
      audioTracks = mediaElement.captureStream().getAudioTracks();
    }
  } else {
    audioTracks = mediaElement.captureStream().getAudioTracks();
  }

  const combinedStream = new MediaStream([
    ...canvasStream.getVideoTracks(),
    ...audioTracks,
  ]);

  return {
    stream: combinedStream,
    setLocalMuted,
    stop: () => {
      cancelAnimationFrame(rafId);
      canvasStream.getTracks().forEach((track) => track.stop());
    },
  };
}
