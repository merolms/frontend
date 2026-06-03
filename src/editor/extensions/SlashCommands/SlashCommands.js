import { Extension } from "@tiptap/core";
import Suggestion from "@tiptap/suggestion";
import { ReactRenderer } from "@tiptap/react";
import tippy from "tippy.js";
import { filterCommands } from "./slashCommandsConfig";
import SlashCommandsList from "./SlashCommandsList";
import { PluginKey } from "@tiptap/pm/state";
import { Z_INDEX } from "../../../lib/z-index";

const slashCommandsPluginKey = new PluginKey("slashCommands");

export const SlashCommands = Extension.create({
  name: "slashCommands",

  addOptions() {
    return { currentPlan: "free" };
  },

  addProseMirrorPlugins() {
    const currentPlan = this.options.currentPlan;

    return [
      Suggestion({
        editor: this.editor,
        char: "/",
        startOfLine: false,
        pluginKey: slashCommandsPluginKey,
        command: ({ editor, range, props }) => {
          editor.chain().focus().deleteRange(range).run();
          props.command(editor);
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          return $from.parent.type.name !== "codeBlock";
        },
        items: ({ query }) => filterCommands(query),
        render: () => {
          let component = null;
          let popup = null;

          return {
            onStart: (props) => {
              component = new ReactRenderer(SlashCommandsList, {
                props: {
                  items: props.items,
                  command: (item) => props.command(item),
                  editor: props.editor,
                  currentPlan,
                },
                editor: props.editor,
              });

              if (!props.clientRect) return;

              popup = tippy("body", {
                getReferenceClientRect: props.clientRect,
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

            onUpdate: (props) => {
              component?.updateProps({
                items: props.items,
                command: (item) => props.command(item),
                editor: props.editor,
                currentPlan,
              });
              if (!props.clientRect) return;
              popup?.[0]?.setProps({ getReferenceClientRect: props.clientRect });
            },

            onKeyDown: (props) => {
              if (props.event.key === "Escape") {
                popup?.[0]?.hide();
                return true;
              }
              return component?.ref?.onKeyDown(props.event) ?? false;
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
