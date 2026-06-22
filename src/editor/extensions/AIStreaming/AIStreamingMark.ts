import { Mark, mergeAttributes } from "@tiptap/core";

interface AIStreamingOptions {
  HTMLAttributes: Record<string, unknown>;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    aiStreaming: {
      /** Begin streaming AI output at the current selection. */
      setAIStreaming: () => ReturnType;
      /** Stop streaming AI output at the current selection. */
      unsetAIStreaming: () => ReturnType;
      /** Toggle AI streaming at the current selection. */
      toggleAIStreaming: () => ReturnType;
    };
  }
}

export const AIStreamingMark = Mark.create<AIStreamingOptions>({
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
