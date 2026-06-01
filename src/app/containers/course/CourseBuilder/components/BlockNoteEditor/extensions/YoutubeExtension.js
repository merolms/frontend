import { Node } from "@tiptap/core";
import { mergeAttributes } from "@tiptap/core";

// ─── YouTube URL helpers ───────────────────────────────────────────

const isValidYoutubeUrl = (url) => {
  if (!url) return false;
  const pattern = /^(https?:\/\/)?(www\.|m\.)?(youtube\.com\/(watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})([^#\&\?]*)*$/;
  return pattern.test(url);
};

export const getYoutubeVideoId = (url) => {
  if (!url) return null;
  // Direct video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
};

const getEmbedUrlFromYoutubeUrl = (url, options = {}) => {
  const {
    allowFullscreen = true,
    autoplay = false,
    controls = true,
    startAt = 0,
    nocookie = false,
    rel = 1,
  } = options;

  const videoId = getYoutubeVideoId(url);
  if (!videoId) return null;

  const baseUrl = nocookie
    ? `https://www.youtube-nocookie.com/embed/${videoId}`
    : `https://www.youtube.com/embed/${videoId}`;

  const params = new URLSearchParams();
  if (autoplay) params.set("autoplay", "1");
  if (!controls) params.set("controls", "0");
  if (startAt) params.set("start", String(startAt));
  if (rel !== undefined) params.set("rel", String(rel));

  const allow = [];
  if (allowFullscreen) allow.push("fullscreen");
  if (autoplay) allow.push("autoplay");
  if (allow.length > 0) params.set("allow", allow.join("; "));

  const queryString = params.toString();
  return `${baseUrl}${queryString ? "?" + queryString : ""}`;
};

const YOUTUBE_REGEX_GLOBAL =
  /(?:https?:\/\/)?(?:www\.|m\.)?(?:youtube\.com\/(?:watch\?v=|embed\/|v\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})(?:[^#&?]*)*/g;

// ─── Tiptap YouTube Node ───────────────────────────────────────────

export const YoutubeNode = Node.create({
  name: "youtube",

  addOptions() {
    return {
      addPasteHandler: true,
      allowFullscreen: true,
      autoplay: false,
      controls: true,
      height: 480,
      width: 640,
      origin: "",
      rel: 1,
    };
  },

  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      src: { default: null },
      start: { default: 0 },
      width: { default: this.options.width },
      height: { default: this.options.height },
    };
  },

  parseHTML() {
    return [
      { tag: "div[data-youtube-video] iframe" },
      { tag: "iframe[src*='youtube.com/embed']" },
      { tag: "iframe[src*='youtube-nocookie.com/embed']" },
    ];
  },

  addCommands() {
    return {
      setYoutubeVideo:
        (options) =>
        ({ commands }) => {
          let src = options.src;
          // Allow bare video IDs
          if (!isValidYoutubeUrl(src) && /^[a-zA-Z0-9_-]{11}$/.test(src)) {
            src = `https://www.youtube.com/watch?v=${src}`;
          }
          if (!isValidYoutubeUrl(src)) return false;
          return commands.insertContent({
            type: this.name,
            attrs: { ...options, src },
          });
        },
    };
  },

  addPasteRules() {
    if (!this.options.addPasteHandler) return [];
    return [
      {
        find: YOUTUBE_REGEX_GLOBAL,
        handler: ({ range, match }) => {
          const url = match[0];
          if (!url) return;
          // Insert the youtube node at the current position
          const node = this.type.create({ src: url });
          return { from: range.from, to: range.to, node };
        },
      },
    ];
  },

  renderHTML({ HTMLAttributes }) {
    const embedUrl = getEmbedUrlFromYoutubeUrl(HTMLAttributes.src || "", {
      allowFullscreen: this.options.allowFullscreen,
      autoplay: this.options.autoplay,
      controls: this.options.controls,
      startAt: HTMLAttributes.start || 0,
      rel: this.options.rel,
    });

    return [
      "div",
      mergeAttributes(
        { "data-youtube-video": "" },
        this.options.HTMLAttributes,
      ),
      [
        "iframe",
        mergeAttributes(HTMLAttributes, {
          src: embedUrl,
          width: HTMLAttributes.width || this.options.width,
          height: HTMLAttributes.height || this.options.height,
          frameborder: "0",
          allowfullscreen: "true",
          allow: "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture",
        }),
      ],
    ];
  },
});
