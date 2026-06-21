import { Extension } from "@tiptap/core";
import { ReactRenderer } from "@tiptap/react";
import { Bold, Heading1 } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import tippy from "tippy.js";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const SlashCommandList = ({ items, onSelect, onClose }) => {
  const [open, setOpen] = useState(true);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setOpen(false);
        onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  const handleSelect = useCallback(
    (item) => {
      onSelect(item);
      setOpen(false);
    },
    [onSelect]
  );

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <span style={{ position: "absolute", opacity: 0 }}>Open</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" sideOffset={-15}>
        {items.map((item, index) => (
          <DropdownMenuItem key={index} onSelect={() => handleSelect(item)}>
            {item.icon}
            <span className="ml-2">{item.title}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export const SlashCommand = Extension.create({
  name: "slashCommand",

  addKeyboardShortcuts() {
    return {
      "/": () => {
        const SlashCommandList = ({ items, onSelect }) => {
          return (
            <DropdownMenu open={true}>
              <DropdownMenuTrigger asChild>
                <span style={{ position: "absolute", opacity: 0 }}>Open</span>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" sideOffset={-15}>
                {items.map((item, index) => (
                  <DropdownMenuItem key={index} onSelect={() => onSelect(item)}>
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          );
        };

        const items = [
          {
            title: "Heading 1",
            icon: <Heading1 className="mr-2 h-4 w-4" />,
            command: () => this.editor.chain().focus().toggleHeading({ level: 1 }).run(),
          },
          {
            title: "Bold",
            icon: <Bold className="mr-2 h-4 w-4" />,
            command: () => this.editor.chain().focus().toggleBold().run(),
          },
          // Add more items as needed
        ];

        const { view, state } = this.editor;
        const { from } = view.state.selection;

        const component = new ReactRenderer(SlashCommandList, {
          props: {
            items,
            onSelect: (item) => {
              item.command();
              component.destroy();
            },
          },
          editor: this.editor,
        });

        const tippyInstance = tippy(document.body, {
          getReferenceClientRect: () => {
            const { left, right, top, bottom } = view.coordsAtPos(from);
            return new DOMRect(left, top, right - left, bottom - top);
          },
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
        });

        return true; // Prevent default '/' insertion
      },
    };
  },
});
