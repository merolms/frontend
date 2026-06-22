import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { VideoBlockAttrs } from "../../types";

import VideoBlockComponent from "./VideoBlockComponent";

export default Node.create<VideoBlockAttrs>({
  name: "blockVideo",
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
    return [{ tag: "block-video" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-video", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(VideoBlockComponent);
  },
});
