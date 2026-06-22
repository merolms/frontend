import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import type { QuizAttrs } from "../../types";

import QuizBlockComponent from "./QuizBlockComponent";

export default Node.create<QuizAttrs>({
  name: "blockQuiz",
  group: "block",
  draggable: true,
  atom: true,

  addAttributes() {
    return {
      quizId: { default: null },
      questions: { default: [] },
    };
  },

  parseHTML() {
    return [{ tag: "block-quiz" }];
  },

  renderHTML({ HTMLAttributes }) {
    return ["block-quiz", mergeAttributes(HTMLAttributes)];
  },

  addNodeView() {
    return ReactNodeViewRenderer(QuizBlockComponent);
  },
});
