import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { EmbedObjectsAttrs } from "../../types";

import EmbedObjectsComponent from "./EmbedObjectsComponent";

export default Node.create<EmbedObjectsAttrs>({
  name: "blockEmbed",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      embedUrl: { default: null },
      embedCode: { default: null },
      embedType: { default: null },
      embedHeight: { default: 300 },
      embedWidth: { default: "100%" },
      alignment: { default: "left" },
    };
  },

  parseHTML() {
    return [{ tag: "block-embed" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-embed", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(EmbedObjectsComponent);
  },
});
