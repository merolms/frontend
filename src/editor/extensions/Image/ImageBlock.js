import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ImageBlockComponent from "./ImageBlockComponent";

export default Node.create({
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
