import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { ImageBlockAttrs } from "../../types";

import ImageBlockComponent from "./ImageBlockComponent";

/**
 * Atom block node for an image. Renders an upload zone until a file is
 * attached, then the image with resize/align controls.
 */
export default Node.create<ImageBlockAttrs>({
  name: "blockImage",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      blockObject: { default: null },
      size: { default: { width: 300 } },
      alignment: { default: "center" },
      dataUrl: { default: null },
      fileUrl: { default: null },
      fileName: { default: null },
      unsplash_url: { default: null },
      unsplash_photographer_name: { default: null },
      unsplash_photographer_url: { default: null },
      unsplash_photo_url: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "block-image" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-image", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(ImageBlockComponent);
  },
});
