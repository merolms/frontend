import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import BadgesExtension from "./BadgesExtension";

export default Node.create({
  name: "badge",
  group: "block",
  draggable: true,
  content: "text*",
  addAttributes() {
    return {
      color: { default: "sky" },
      emoji: { default: "💡" },
    };
  },
  parseHTML() {
    return [{ tag: "badge" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["badge", mergeAttributes(HTMLAttributes), 0];
  },
  addNodeView() {
    return ReactNodeViewRenderer(BadgesExtension);
  },
});
