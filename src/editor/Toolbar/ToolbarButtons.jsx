import {
  ArrowsClockwise,
  CaretDown,
  CheckCircle,
  Columns,
  ColumnsPlusRight,
  Cube,
  CursorClick,
  FileText,
  GitBranch,
  Globe,
  Headphones,
  Image as ImageIcon,
  Info,
  Lightbulb,
  Link,
  ListBullets,
  ListNumbers,
  Plus,
  Rows,
  RowsPlusBottom,
  SealQuestion,
  Sigma,
  Table,
  Tag,
  VideoCamera,
  Warning,
  XCircle,
} from "@phosphor-icons/react";
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Eraser,
  Highlighter,
  Italic,
  Redo2,
  Strikethrough,
  Underline as UnderlineIcon,
  Undo2,
} from "lucide-react";
import React from "react";

import { Button } from "@/components/ui/Button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import LinkInputTooltip from "./LinkInputTooltip";

const ToolbarGroup = ({ children, className = "" }) => (
  <div className={`flex items-center gap-1 rounded-md border bg-background p-1 ${className}`}>
    {children}
  </div>
);

export const ToolbarButtons = React.memo(({ editor }) => {
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  if (!editor) return null;

  const listOptions = [
    {
      label: "Bullet List",
      icon: <ListBullets size={16} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: <ListNumbers size={16} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  const getCurrentLinkUrl = () =>
    editor.isActive("link") ? editor.getAttributes("link").href : "";

  const handleLinkSave = (url) => {
    editor
      .chain()
      .focus()
      .setLink({ href: url, target: "_blank", rel: "noopener noreferrer" })
      .run();
    setShowLinkInput(false);
  };

  return (
    <div className="bg-background sticky top-0 z-50 w-full p-2">
      <div className="flex flex-wrap items-center gap-2">
        {/* History Group */}
        <ToolbarGroup>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().undo().run()}
            className="h-8 w-8"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().redo().run()}
            className="h-8 w-8"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
        </ToolbarGroup>

        {/* Text Format Group */}
        <ToolbarGroup>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`h-8 w-8 ${editor.isActive("bold") ? "is-active" : ""}`}
          >
            <Bold className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`h-8 w-8 ${editor.isActive("italic") ? "is-active" : ""}`}
          >
            <Italic className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`h-8 w-8 ${editor.isActive("underline") ? "is-active" : ""}`}
          >
            <UnderlineIcon className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().toggleStrike().run()}
            className={`h-8 w-8 ${editor.isActive("strike") ? "is-active" : ""}`}
          >
            <Strikethrough className="h-4 w-4" />
          </Button>
        </ToolbarGroup>

        {/* Block Structure Group */}
        <ToolbarGroup>
          <select
            className="h-8 rounded-md border bg-background px-2 text-sm"
            value={
              editor.isActive("heading", { level: 1 })
                ? "1"
                : editor.isActive("heading", { level: 2 })
                  ? "2"
                  : editor.isActive("heading", { level: 3 })
                    ? "3"
                    : editor.isActive("heading", { level: 4 })
                      ? "4"
                      : editor.isActive("heading", { level: 5 })
                        ? "5"
                        : editor.isActive("heading", { level: 6 })
                          ? "6"
                          : "0"
            }
            onChange={(e) => {
              const v = e.target.value;
              if (v === "0") editor.chain().focus().setParagraph().run();
              else editor.chain().focus().toggleHeading({ level: parseInt(v) }).run();
            }}
          >
            <option value="0">Paragraph</option>
            <option value="1">Heading 1</option>
            <option value="2">Heading 2</option>
            <option value="3">Heading 3</option>
            <option value="4">Heading 4</option>
            <option value="5">Heading 5</option>
            <option value="6">Heading 6</option>
          </select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`h-8 gap-1 ${editor.isActive("bulletList") || editor.isActive("orderedList") ? "is-active" : ""}`}
              >
                <ListBullets size={16} />
                <CaretDown size={12} />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-40 p-1">
              <div className="flex flex-col gap-1">
                {listOptions.map((opt, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={opt.action}
                    className="justify-start gap-2"
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                {editor.isActive({ textAlign: "left" }) ? (
                  <AlignLeft className="h-4 w-4" />
                ) : editor.isActive({ textAlign: "center" }) ? (
                  <AlignCenter className="h-4 w-4" />
                ) : (
                  <AlignRight className="h-4 w-4" />
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1">
              <ToggleGroup
                type="single"
                value={
                  editor.isActive({ textAlign: "left" })
                    ? "left"
                    : editor.isActive({ textAlign: "center" })
                      ? "center"
                      : editor.isActive({ textAlign: "right" })
                        ? "right"
                        : "justify"
                }
                className="flex flex-col gap-1"
              >
                <ToggleGroupItem
                  value="left"
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  className="h-8 w-8"
                >
                  <AlignLeft className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="center"
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  className="h-8 w-8"
                >
                  <AlignCenter className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="right"
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  className="h-8 w-8"
                >
                  <AlignRight className="h-4 w-4" />
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="justify"
                  onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                  className="h-8 w-8"
                >
                  <AlignJustify className="h-4 w-4" />
                </ToggleGroupItem>
              </ToggleGroup>
            </PopoverContent>
          </Popover>
        </ToolbarGroup>

        {/* Text Style Group */}
        <ToolbarGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8"
                style={{ color: editor.getAttributes("textStyle").color }}
              >
                <Baseline className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1">
              <ToggleGroup
                type="single"
                value={editor.getAttributes("textStyle").color}
                className="flex flex-col gap-1"
              >
                {["#e11d48", "#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#737373", "#fafafa"].map(
                  (color) => (
                    <ToggleGroupItem
                      key={color}
                      value={color}
                      onClick={() => editor.chain().focus().setColor(color).run()}
                      className="h-8 w-full justify-center"
                    >
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                    </ToggleGroupItem>
                  )
                )}
              </ToggleGroup>
            </PopoverContent>
          </Popover>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className="h-8 w-8"
                style={{ color: editor.getAttributes("highlight").color }}
              >
                <Highlighter className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-1">
              <ToggleGroup
                type="single"
                value={editor.getAttributes("highlight").color}
                className="flex flex-col gap-1"
              >
                {["#e11d48", "#7c3aed", "#2563eb", "#10b981", "#f59e0b", "#737373"].map(
                  (color) => (
                    <ToggleGroupItem
                      key={color}
                      value={color}
                      onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
                      className="h-8 w-full justify-center"
                    >
                      <div className="h-4 w-4 rounded-full" style={{ backgroundColor: color }} />
                    </ToggleGroupItem>
                  )
                )}
              </ToggleGroup>
            </PopoverContent>
          </Popover>
        </ToolbarGroup>

        {/* Actions Group */}
        <ToolbarGroup>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
            className="h-8 w-8"
          >
            <Eraser className="h-4 w-4" />
          </Button>
        </ToolbarGroup>

        {/* Insert Group - Consolidated Menu */}
        <ToolbarGroup>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="h-8 w-8">
                <Plus className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="w-56 p-1">
              <div className="flex flex-col gap-1">
                {/* Link Button */}
                <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
                  <PopoverTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`justify-start gap-2 ${editor.isActive("link") ? "is-active" : ""}`}
                    >
                      <Link size={16} />
                      <span>Link</span>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent align="center" className="w-auto p-0">
                    <LinkInputTooltip
                      onSave={(url) => {
                        handleLinkSave(url);
                        setShowLinkInput(false);
                      }}
                      onCancel={() => setShowLinkInput(false)}
                      currentUrl={getCurrentLinkUrl()}
                    />
                  </PopoverContent>
                </Popover>

                {/* Table Section */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Table
                </div>
                {[
                  {
                    label: "Insert Table",
                    icon: <Table size={16} />,
                    action: () =>
                      editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
                  },
                  {
                    label: "Add Row",
                    icon: <RowsPlusBottom size={16} />,
                    action: () => editor.chain().focus().addRowAfter().run(),
                  },
                  {
                    label: "Add Column",
                    icon: <ColumnsPlusRight size={16} />,
                    action: () => editor.chain().focus().addColumnAfter().run(),
                  },
                  {
                    label: "Delete Row",
                    icon: <Rows size={16} />,
                    action: () => editor.chain().focus().deleteRow().run(),
                  },
                  {
                    label: "Delete Column",
                    icon: <Columns size={16} />,
                    action: () => editor.chain().focus().deleteColumn().run(),
                  },
                ].map((opt) => (
                  <Button
                    key={opt.label}
                    variant="ghost"
                    onClick={opt.action}
                    className="justify-start gap-2"
                  >
                    {opt.icon}
                    <span>{opt.label}</span>
                  </Button>
                ))}

                {/* Callouts Section */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Callouts
                </div>
                {[
                  { type: "info", label: "Info", icon: <Info size={14} weight="fill" /> },
                  { type: "warning", label: "Warning", icon: <Warning size={14} weight="fill" /> },
                  { type: "tip", label: "Tip", icon: <Lightbulb size={14} weight="fill" /> },
                  { type: "success", label: "Success", icon: <CheckCircle size={14} weight="fill" /> },
                  { type: "error", label: "Error", icon: <XCircle size={14} weight="fill" /> },
                ].map(({ type, label, icon }) => (
                  <Button
                    key={type}
                    variant="ghost"
                    onClick={() =>
                      editor
                        .chain()
                        .focus()
                        .insertContent({ type: "callout", attrs: { type }, content: [] })
                        .run()
                    }
                    className="justify-start gap-2"
                  >
                    {icon}
                    <span>{label}</span>
                  </Button>
                ))}

                {/* Media Section */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Media
                </div>
                {[
                  { label: "Image", icon: <ImageIcon size={16} weight="fill" />, type: "blockImage" },
                  { label: "Video", icon: <VideoCamera size={16} weight="fill" />, type: "blockVideo" },
                  { label: "Audio", icon: <Headphones size={16} weight="fill" />, type: "blockAudio" },
                  { label: "Embed", icon: <Cube size={16} weight="fill" />, type: "blockEmbed" },
                  { label: "PDF", icon: <FileText size={16} weight="fill" />, type: "blockPDF" },
                  { label: "Math", icon: <Sigma size={16} weight="fill" />, type: "blockMathEquation" },
                  { label: "Web Preview", icon: <Globe size={16} weight="fill" />, type: "blockWebPreview" },
                ].map(({ label, icon, type }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    onClick={() => editor.chain().focus().insertContent({ type }).run()}
                    className="justify-start gap-2"
                  >
                    {icon}
                    <span>{label}</span>
                  </Button>
                ))}

                {/* Interactive Blocks Section */}
                <div className="px-2 py-1 text-xs font-semibold text-muted-foreground">
                  Interactive
                </div>
                {[
                  { label: "Quiz", icon: <SealQuestion size={16} weight="fill" />, type: "blockQuiz" },
                  { label: "Badge", icon: <Tag size={16} weight="fill" />, type: "badge", content: "Badge" },
                  { label: "Button", icon: <CursorClick size={16} weight="fill" />, type: "button", content: "Click me" },
                  { label: "Flipcard", icon: <ArrowsClockwise size={16} weight="fill" />, type: "flipcard", attrs: { question: "Click to reveal", answer: "This is the answer", color: "blue", alignment: "center", size: "medium" } },
                  { label: "Scenarios", icon: <GitBranch size={16} weight="fill" />, type: "scenarios", attrs: { title: "Interactive Scenario", currentScenarioId: "1" } },
                ].map(({ label, icon, type, content, attrs }) => (
                  <Button
                    key={label}
                    variant="ghost"
                    onClick={() => {
                      if (attrs) {
                        editor.chain().focus().insertContent({ type, attrs, content: [] }).run();
                      } else if (content) {
                        editor.chain().focus().insertContent({ type, content: [{ type: "text", text: content }] }).run();
                      } else {
                        editor.chain().focus().insertContent({ type }).run();
                      }
                    }}
                    className="justify-start gap-2"
                  >
                    {icon}
                    <span>{label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        </ToolbarGroup>
      </div>
    </div>
  );
});

ToolbarButtons.displayName = "ToolbarButtons";

export default ToolbarButtons;
