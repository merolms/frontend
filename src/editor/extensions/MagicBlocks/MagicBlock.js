import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";
import MagicBlockComponent from "./MagicBlockComponent";

export default Node.create({
  name: "blockMagic",
  group: "block",
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      blockUuid: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-block-uuid"),
        renderHTML: (attributes) => ({ "data-block-uuid": attributes.blockUuid }),
      },
      sessionUuid: {
        default: null,
        parseHTML: (element) => element.getAttribute("data-session-uuid"),
        renderHTML: (attributes) => ({ "data-session-uuid": attributes.sessionUuid }),
      },
      htmlContent: { default: null },
      iterationCount: { default: 0 },
      title: { default: "Interactive Element" },
      height: {
        default: 400,
        parseHTML: (element) => {
          const h = element.getAttribute("data-height");
          return h ? parseInt(h, 10) : 400;
        },
        renderHTML: (attributes) => ({ "data-height": attributes.height }),
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
