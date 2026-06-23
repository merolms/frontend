import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const aiSelectionHighlightPluginKey = new PluginKey("aiSelectionHighlight");

export function setAIHighlight(editor, range) {
  if (!editor || !editor.view) return;
  const { tr } = editor.state;
  tr.setMeta(aiSelectionHighlightPluginKey, { range });
  editor.view.dispatch(tr);
}

export function clearAIHighlight(editor) {
  setAIHighlight(editor, null);
}

const AISelectionHighlight = Extension.create({
  name: "aiSelectionHighlight",

  addOptions() {
    return { className: "ai-selection-highlight" };
  },

  addStorage() {
    return { highlightRange: null };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const storage = this.storage;

    return [
      new Plugin({
        key: aiSelectionHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldDecorationSet, oldState, newState) {
            const meta = tr.getMeta(aiSelectionHighlightPluginKey);
            if (meta !== undefined) {
              const { range } = meta;
              storage.highlightRange = range;
              if (range && range.from < range.to) {
                const docSize = newState.doc.content.size;
                const from = Math.max(0, Math.min(range.from, docSize));
                const to = Math.max(0, Math.min(range.to, docSize));
                if (from < to) {
                  return DecorationSet.create(newState.doc, [
                    Decoration.inline(from, to, { class: options.className }),
                  ]);
                }
              }
              return DecorationSet.empty;
            }
            if (tr.docChanged && oldDecorationSet.find().length > 0) {
              return oldDecorationSet.map(tr.mapping, newState.doc);
            }
            return oldDecorationSet;
          },
        },
        props: {
          decorations(state) {
            return this.getState(state);
          },
        },
      }),
    ];
  },
});

export default AISelectionHighlight;
