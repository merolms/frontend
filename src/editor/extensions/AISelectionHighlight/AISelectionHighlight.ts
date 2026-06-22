import { Extension, type Editor } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface HighlightRange {
  from: number;
  to: number;
}

export const aiSelectionHighlightPluginKey = new PluginKey<DecorationSet>("aiSelectionHighlight");

/** Highlight a range of text for an in-flight AI action. */
export function setAIHighlight(editor: Editor | null | undefined, range: HighlightRange | null): void {
  if (!editor?.view) return;
  const { tr } = editor.state;
  tr.setMeta(aiSelectionHighlightPluginKey, { range });
  editor.view.dispatch(tr);
}

export function clearAIHighlight(editor: Editor | null | undefined): void {
  setAIHighlight(editor, null);
}

interface HighlightMeta {
  range: HighlightRange | null;
}

interface HighlightOptions {
  className: string;
}

const AISelectionHighlight = Extension.create<HighlightOptions>({
  name: "aiSelectionHighlight",

  addOptions() {
    return { className: "ai-selection-highlight" };
  },

  addStorage() {
    return { highlightRange: null as HighlightRange | null };
  },

  addProseMirrorPlugins() {
    const options = this.options;
    const storage = this.storage as { highlightRange: HighlightRange | null };

    return [
      new Plugin<DecorationSet>({
        key: aiSelectionHighlightPluginKey,
        state: {
          init() {
            return DecorationSet.empty;
          },
          apply(tr, oldDecorationSet, _oldState, newState) {
            const meta = tr.getMeta(aiSelectionHighlightPluginKey) as HighlightMeta | undefined;
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
