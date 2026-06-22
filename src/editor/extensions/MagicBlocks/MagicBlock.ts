import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { MagicBlockAttrs } from "../../types";

import MagicBlockComponent from "./MagicBlockComponent";

export default Node.create<MagicBlockAttrs>({
  name: "blockMagic",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      blockUuid: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-block-uuid"),
        renderHTML: (attributes: MagicBlockAttrs) => ({ "data-block-uuid": attributes.blockUuid }),
      },
      sessionUuid: {
        default: null,
        parseHTML: (element: HTMLElement) => element.getAttribute("data-session-uuid"),
        renderHTML: (attributes: MagicBlockAttrs) => ({ "data-session-uuid": attributes.sessionUuid }),
      },
      htmlContent: { default: null },
      iterationCount: { default: 0 },
      title: { default: "Interactive Element" },
      height: {
        default: 400,
        parseHTML: (element: HTMLElement) => {
          const h = element.getAttribute("data-height");
          return h ? parseInt(h, 10) : 400;
        },
        renderHTML: (attributes: MagicBlockAttrs) => ({ "data-height": attributes.height }),
      },
    };
  },

  parseHTML() {
    return [{ tag: "block-magic" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-magic", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(MagicBlockComponent);
  },
});
