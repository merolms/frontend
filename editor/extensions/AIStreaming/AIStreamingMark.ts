import { Mark, mergeAttributes } from "@tiptap/core";

export const AIStreamingMark = Mark.create({
  name: "aiStreaming",

  addOptions() {
    return { HTMLAttributes: {} };
  },

  parseHTML() {
    return [{ tag: "span.ai-streaming-text" }];
  },

  renderHTML({ HTMLAttributes }) {
    return [
      "span",
      mergeAttributes(this.options.HTMLAttributes, HTMLAttributes, { class: "ai-streaming-text" }),
      0,
    ];
  },

  addCommands() {
    return {
      setAIStreaming:
        () =>
        ({ commands }) =>
          commands.setMark(this.name),
      unsetAIStreaming:
        () =>
        ({ commands }) =>
          commands.unsetMark(this.name),
      toggleAIStreaming:
        () =>
        ({ commands }) =>
          commands.toggleMark(this.name),
    };
  },
});

export default AIStreamingMark;
