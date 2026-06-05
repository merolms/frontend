import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import MathEquationBlockComponent from "./MathEquationBlockComponent";

export default Node.create({
  name: "blockMathEquation",
  group: "block",
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      equation: { default: "E = mc^2" },
    };
  },
  parseHTML() {
    return [{ tag: "block-math-equation" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["block-math-equation", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(MathEquationBlockComponent);
  },
});
