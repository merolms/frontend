import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { CalloutAttrs } from "../../types";

import CalloutComponent from "./CalloutComponent";

export default Node.create<CalloutAttrs>({
  name: "callout",
  group: "block",
  draggable: true,
  content: "text*",

  addAttributes() {
    return {
      type: {
        default: "info",
        parseHTML: (el: HTMLElement) => el.getAttribute("data-callout-type") || "info",
        renderHTML: (attrs: CalloutAttrs) => ({ "data-callout-type": attrs.type }),
      },
      dismissible: {
        default: false,
        parseHTML: (el: HTMLElement) => el.getAttribute("data-dismissible") === "true",
        renderHTML: (attrs: CalloutAttrs) => (attrs.dismissible ? { "data-dismissible": "true" } : {}),
      },
    };
  },

  parseHTML() {
    return [{ tag: "callout[data-callout-type]" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["callout", mergeAttributes(HTMLAttributes), 0];
  },

  addNodeView() {
    return ReactNodeViewRenderer(CalloutComponent);
  },
});
