import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { WebPreviewAttrs } from "../../types";

import WebPreviewComponent from "./WebPreviewComponent";

export default Node.create<WebPreviewAttrs>({
  name: "blockWebPreview",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      url: { default: null },
      title: { default: null },
      description: { default: null },
      image: { default: null },
      og_image: { default: null },
      favicon: { default: null },
      og_type: { default: null },
      og_url: { default: null },
      alignment: { default: "left" },
      showButton: { default: true },
      buttonLabel: { default: "" },
      openInPopup: { default: false },
    };
  },

  parseHTML() {
    return [{ tag: "block-web-preview" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-web-preview", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(WebPreviewComponent);
  },
});
