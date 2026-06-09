import { useEffect, useRef, useState } from "react";

import { t } from "@/styles/theme";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:9090";

/**
 * Build a stream URL with ?token= for auth — same pattern as VideoBlockComponent.
 * Lets the browser use native HTTP Range requests for seeking.
 */
function buildStreamUrl(src) {
  if (!src) return null;
  if (src.startsWith("data:") || src.startsWith("blob:")) return src;
  // External URLs (different origin) — pass through, no auth
  if (src.startsWith("http") && !src.startsWith(API_BASE)) return src;
  const token = localStorage.getItem("auth_token");
  const fullUrl = src.startsWith("http") ? src : `${API_BASE}${src}`;
  return token ? `${fullUrl}?token=${encodeURIComponent(token)}` : fullUrl;
}

/**
 * VideoPlayer — HLS-capable video player with fallback to native <video>.
 *
 * Props:
 *   src       - Video URL (HLS .m3u8 or direct MP4)
 *   poster    - Poster image URL
 *   onProgress - callback(percentWatched) — fires every ~5s during playback
 */
const VideoPlayer = ({ src, poster, onProgress }) => {
  const videoRef = useRef(null);
  const [error, setError] = useState(null);
  const progressInterval = useRef(null);

  // Build authenticated stream URL
  const streamUrl = buildStreamUrl(src);

  // Load HLS.js dynamically if needed
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    // Check if native HLS is supported (Safari)
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      return;
    }

    // Try HLS.js for other browsers
    let hls = null;
    import("hls.js")
      .then((mod) => {
        const Hls = mod.default;
        if (Hls.isSupported()) {
          hls = new Hls();
          hls.loadSource(streamUrl);
          hls.attachMedia(video);
          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            // ready
          });
          hls.on(Hls.Events.ERROR, (_event, data) => {
            if (data.fatal) setError("Video playback error");
          });
        } else {
          // Fallback: try direct playback
          video.src = streamUrl;
        }
      })
      .catch(() => {
        // HLS.js not available, try direct
        video.src = streamUrl;
      });

    return () => {
      if (hls) hls.destroy();
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [streamUrl]);

  // Track progress
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !onProgress) return;

    progressInterval.current = setInterval(() => {
      if (video.duration > 0) {
        const pct = Math.round((video.currentTime / video.duration) * 100);
        onProgress(pct);
      }
    }, 5000);

    return () => {
      if (progressInterval.current) clearInterval(progressInterval.current);
    };
  }, [onProgress]);

  // Keyboard shortcuts
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handler = (e) => {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      switch (e.key) {
        case " ":
        case "k":
          e.preventDefault();
          video.paused ? video.play() : video.pause();
          break;
        case "ArrowLeft":
          e.preventDefault();
          video.currentTime = Math.max(0, video.currentTime - 10);
          break;
        case "ArrowRight":
          e.preventDefault();
          video.currentTime = Math.min(video.duration, video.currentTime + 10);
          break;
        case "f":
          e.preventDefault();
          if (video.requestFullscreen) video.requestFullscreen();
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  if (error) {
    return (
      <div
        style={{
          background: t("bg-surface"),
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          color: t("text-muted"),
        }}
      >
        <div style={{ fontSize: 24, marginBottom: 8 }}>⚠️</div>
        <div>{error}</div>
        <a
          href={streamUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: t("accent"), fontSize: 13, marginTop: 8, display: "inline-block" }}
        >
          Download video instead
        </a>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      poster={poster}
      controls
      playsInline
      style={{
        width: "100%",
        maxHeight: "70vh",
        borderRadius: 8,
        background: "#000",
      }}
    />
  );
};

export default VideoPlayer;
