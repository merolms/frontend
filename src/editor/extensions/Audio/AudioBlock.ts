import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { AudioBlockAttrs } from "../../types";

import AudioBlockComponent from "./AudioBlockComponent";

export default Node.create<AudioBlockAttrs>({
  name: "blockAudio",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      dataUrl: { default: null },
      fileUrl: { default: null },
      fileName: { default: null },
      blockObject: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "block-audio" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-audio", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(AudioBlockComponent);
  },
});
