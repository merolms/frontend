import { Extension, type Editor } from "@tiptap/core";
import { PluginKey } from "@tiptap/pm/state";
import { ReactRenderer } from "@tiptap/react";
import Suggestion, { type SuggestionProps } from "@tiptap/suggestion";
import tippy from "tippy.js";

import { Z_INDEX } from "../../../lib/z-index";
import type { SlashCommand } from "../../types";
import { filterCommands } from "./slashCommandsConfig";
import SlashCommandsList from "./SlashCommandsList";

interface SlashCommandsOptions {
  currentPlan: string;
}

const slashCommandsPluginKey = new PluginKey("slashCommands");

export const SlashCommands = Extension.create<SlashCommandsOptions>({
  name: "slashCommands",

  addOptions() {
    return { currentPlan: "free" };
  },

  addProseMirrorPlugins() {
    const currentPlan = this.options.currentPlan;

    return [
      Suggestion<SlashCommand>({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        pluginKey: slashCommandsPluginKey,
        command: ({ editor, range, props }: SuggestionProps<SlashCommand, Editor>) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name !== "codeBlock";
        },
        items: ({ query }) => filterCommands(query),
        render: () => {
          let component: ReactRenderer | null = null;
          let popup: ReturnType<typeof tippy> | null = null;

          return {
            onStart: (props: SuggestionProps<SlashCommand, Editor>) => {
              component = new ReactRenderer(SlashCommandsList, {
                props: {
                  items: props.items,
                  command: (item: SlashCommand) => props.command({ ...props, props: item } as SuggestionProps<SlashCommand, Editor>),
                  editor: props.editor,
                  currentPlan,
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect as () => DOMRect,
                appendTo: () => document.body,
                content: component.element,
                showOnCreate: true,
                interactive: true,
                trigger: "manual",
                placement: "bottom-start",
                animation: "shift-away",
                maxWidth: "none",
                theme: "slash-commands",
                zIndex: Z_INDEX.EDITOR_BUBBLE,
              });
            },

            onUpdate: (props: SuggestionProps<SlashCommand, Editor>) => {
              component?.updateProps({
                items: props.items,
                command: (item: SlashCommand) => props.command({ ...props, props: item } as SuggestionProps<SlashCommand, Editor>),
                editor: props.editor,
                currentPlan,
              });
              if (!props.clientRect) return;
              popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect as () => DOMRect });
            },

            onKeyDown: (props: { event: KeyboardEvent }) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return (component?.ref as { onKeyDown?: (e: KeyboardEvent) => boolean } | undefined)?.onKeyDown(props.event) ?? false;
            },

            onExit: () => {
              popup?.[0]?.destroy();
              component?.destroy();
            },
          };
        },
      }),
    ];
  },
});

export default SlashCommands;
