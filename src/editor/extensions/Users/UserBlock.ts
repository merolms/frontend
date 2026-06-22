import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { UserBlockAttrs } from "../../types";

import UserBlockComponent from "./UserBlockComponent";

export default Node.create<UserBlockAttrs>({
  name: "blockUser",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      userId: { default: null },
      userName: { default: "User" },
      userAvatar: { default: null },
    };
  },

  parseHTML() {
    return [{ tag: "block-user" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-user", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(UserBlockComponent);
  },
});
