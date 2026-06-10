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

import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

import ToolTip from "../../components/ui/Tooltip";
import LinkInputTooltip from "./LinkInputTooltip";

export const ToolbarButtons = React.memo(({ editor }) => {
  const [showTableMenu, setShowTableMenu] = React.useState(false);
  const [showListMenu, setShowListMenu] = React.useState(false);
  const [showCodeMenu, setShowCodeMenu] = React.useState(false);
  const [showCalloutMenu, setShowCalloutMenu] = React.useState(false);
  const [showLinkInput, setShowLinkInput] = React.useState(false);

  if (!editor) return null;

  const tableOptions = [
    {
      label: "Insert Table",
      icon: <Table size={15} />,
      action: () =>
        editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run(),
    },
    {
      label: "Add Row",
      icon: <RowsPlusBottom size={15} />,
      action: () => editor.chain().focus().addRowAfter().run(),
    },
    {
      label: "Add Column",
      icon: <ColumnsPlusRight size={15} />,
      action: () => editor.chain().focus().addColumnAfter().run(),
    },
    {
      label: "Delete Row",
      icon: <Rows size={15} />,
      action: () => editor.chain().focus().deleteRow().run(),
    },
    {
      label: "Delete Column",
      icon: <Columns size={15} />,
      action: () => editor.chain().focus().deleteColumn().run(),
    },
  ];

  const listOptions = [
    {
      label: "Bullet List",
      icon: <ListBullets size={15} />,
      action: () => editor.chain().focus().toggleBulletList().run(),
    },
    {
      label: "Ordered List",
      icon: <ListNumbers size={15} />,
      action: () => editor.chain().focus().toggleOrderedList().run(),
    },
  ];

  const handleLinkClick = () => {
    const { from, to } = editor.state.selection;
    setShowLinkInput(true);
    setTimeout(() => editor.commands.setTextSelection({ from, to }), 0);
  };

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
    <div className="bg-background sticky top-0 z-50 py-2">
      {/* Menu Bar */}
      <div className="flex w-full flex-row justify-between">
        <div className="flex flex-row flex-wrap gap-2">
          {/* undo, redo, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().undo().run()}
              // disabled={!editor.can().chain().focus().undo().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Undo2 className="h-5 w-5 flex-none" />
            </Button>
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().redo().run()}
              // disabled={!editor.can().chain().focus().redo().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Redo2 className="h-5 w-5 flex-none" />
            </Button>
          </Alert>
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <div
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`editor-tool-btn ${editor.isActive("bold") ? "is-active" : ""}`}
              title="Bold"
            >
              <Bold className="h-5 w-5 flex-none" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`editor-tool-btn ${editor.isActive("italic") ? "is-active" : ""}`}
              title="Italic"
            >
              <Italic className="h-5 w-5 flex-none" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`editor-tool-btn ${editor.isActive("underline") ? "is-active" : ""}`}
              title="Underline"
            >
              <UnderlineIcon className="h-5 w-5 flex-none" />
            </div>
            <div
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`editor-tool-btn ${editor.isActive("strike") ? "is-active" : ""}`}
              title="Strikethrough"
            >
              <Strikethrough className="h-5 w-5 flex-none" />
            </div>
          </Alert>
          {/* <DividerVerticalIcon style={{ marginTop: "auto", marginBottom: "auto", color: "grey" }} /> */}
          {/* alignment like left, center, right, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="secondary" className="m-0 h-fit w-fit p-[.35rem]">
                  {editor.isActive({ textAlign: "left" }) ? (
                    <AlignLeft className="h-5 w-5 flex-none" />
                  ) : editor.isActive({ textAlign: "center" }) ? (
                    <AlignCenter className="h-5 w-5 flex-none" />
                  ) : (
                    <AlignRight className="h-5 w-5 flex-none" />
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={
                    editor.isActive({ textAlign: "left" })
                      ? "left"
                      : editor.isActive({ textAlign: "center" })
                        ? "center"
                        : "right"
                  }
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="left"
                    aria-label="Left Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("left").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignLeft className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="center"
                    aria-label="Center Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("center").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignCenter className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="right"
                    aria-label="Right Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("right").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignRight className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="justify"
                    aria-label="Justify Alignment"
                    onClick={() => editor.chain().focus().setTextAlign("justify").run()}
                    className="m-0 h-fit w-fit p-[.35rem]"
                  >
                    <AlignJustify className="h-5 w-5 flex-none" />
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>

          {/* <DividerVerticalIcon style={{ marginTop: "auto", marginBottom: "auto", color: "grey" }} /> */}

          {/* List dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`m-0 inline-flex h-fit w-fit cursor-pointer items-center justify-center gap-1.5 rounded-md p-[.35rem] text-xs font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                  editor.isActive("bulletList") || editor.isActive("orderedList") ? "is-active" : ""
                }`}
              >
                <ListBullets size={25} />
                <CaretDown size={15} />
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-48 p-1">
              <div className="flex flex-col gap-1">
                {listOptions.map((opt, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={opt.action}
                    className="flex h-auto w-full justify-start gap-2 px-2 py-2"
                  >
                    <span>{opt.icon}</span>
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          {/* Heading select */}
          <select
            className="bg-neutral-secondary-medium border-default-medium text-heading rounded-base focus:ring-brand focus:border-brand placeholder:text-body block border px-3 py-2.5 text-sm shadow-xs"
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
              else
                editor
                  .chain()
                  .focus()
                  .toggleHeading({ level: parseInt(v) })
                  .run();
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
          {/* horizontal rule */}
          <Alert className="m-0 flex w-fit flex-row gap-1 p-1">
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]">
                  <Baseline
                    className="h-5 w-5 flex-none"
                    style={{
                      color: editor.getAttributes("textStyle").color,
                    }}
                  ></Baseline>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("textStyle").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose"
                    onClick={() => editor.chain().focus().setColor("#e11d48").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet"
                    onClick={() => editor.chain().focus().setColor("#7c3aed").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue"
                    onClick={() => editor.chain().focus().setColor("#2563eb").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald"
                    onClick={() => editor.chain().focus().setColor("#10b981").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber"
                    onClick={() => editor.chain().focus().setColor("#f59e0b").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral"
                    onClick={() => editor.chain().focus().setColor("#737373").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#fafafa"
                    aria-label="toggle white"
                    onClick={() => editor.chain().focus().setColor("#fafafa").run()}
                    className="flex w-full items-center"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#fafafa" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
            {/* highlight */}
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="m-0 h-fit w-fit p-[.35rem]"
                  style={{
                    color: editor.getAttributes("highlight").color,
                  }}
                >
                  <Highlighter className="h-5 w-5 flex-none" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="m-0 mt-2 h-fit w-fit p-1">
                <ToggleGroup
                  type="single"
                  value={editor.getAttributes("highlight").color}
                  className="flex flex-col gap-1"
                >
                  <ToggleGroupItem
                    value="#e11d48"
                    aria-label="toggle rose highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#e11d48" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#e11d48" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#7c3aed"
                    aria-label="toggle violet highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#7c3aed" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#7c3aed" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#2563eb"
                    aria-label="toggle blue highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#2563eb" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#2563eb" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#10b981"
                    aria-label="toggle emerald highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#10b981" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#10b981" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#f59e0b"
                    aria-label="toggle amber highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#f59e0b" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#f59e0b" }}
                    ></div>
                  </ToggleGroupItem>
                  <ToggleGroupItem
                    value="#737373"
                    aria-label="toggle neutral highlight"
                    onClick={() =>
                      editor.chain().focus().toggleHighlight({ color: "#737373" }).run()
                    }
                    className="flex w-full justify-start"
                  >
                    <div
                      className="h-4 w-4 rounded-full"
                      style={{ backgroundColor: "#737373" }}
                    ></div>
                  </ToggleGroupItem>
                </ToggleGroup>
              </PopoverContent>
            </Popover>
          </Alert>
          {/* other like unset all marks, clear nodes, etc. */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <Button
              variant="ghost"
              onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()}
              className="m-0 h-fit w-fit p-[.35rem]"
            >
              <Eraser className="h-5 w-5 flex-none" />
            </Button>
          </Alert>

          {/* Table dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" className="m-0 h-fit w-fit p-[.35rem]" title="Table">
                <Table className="h-8 w-8 flex-none" />
                <CaretDown className="ml-1 h-3 w-3" />
              </Button>
            </PopoverTrigger>

            <PopoverContent className="m-0 mt-2 w-56 p-1">
              <div className="flex flex-col gap-1">
                {tableOptions.map((opt, i) => (
                  <Button
                    key={i}
                    variant="ghost"
                    onClick={opt.action}
                    className="justify-start gap-2"
                  >
                    <span className="flex-shrink-0">{opt.icon}</span>
                    <span>{opt.label}</span>
                  </Button>
                ))}
              </div>
            </PopoverContent>
          </Popover>
          {/* <DividerVerticalIcon style={{ marginTop: "auto", marginBottom: "auto", color: "grey" }} /> */}

          {/* Callout dropdown */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`m-0 mt-1 h-fit w-fit p-2 ${
                  editor.isActive("callout") ||
                  editor.isActive("calloutInfo") ||
                  editor.isActive("calloutWarning")
                    ? "is-active"
                    : ""
                }`}
              >
                <Info size={20} />
                <CaretDown size={15} />
              </Button>
            </PopoverTrigger>

            <PopoverContent align="start" className="w-48 p-1">
              {[
                {
                  type: "info",
                  label: "Info",
                  icon: <Info size={14} weight="fill" />,
                  cls: "text-gray-500",
                },
                {
                  type: "warning",
                  label: "Warning",
                  icon: <Warning size={14} weight="fill" />,
                  cls: "text-yellow-500",
                },
                {
                  type: "tip",
                  label: "Tip",
                  icon: <Lightbulb size={14} weight="fill" />,
                  cls: "text-green-500",
                },
                {
                  type: "success",
                  label: "Success",
                  icon: <CheckCircle size={14} weight="fill" />,
                  cls: "text-teal-500",
                },
                {
                  type: "error",
                  label: "Error",
                  icon: <XCircle size={14} weight="fill" />,
                  cls: "text-red-500",
                },
              ].map(({ type, label, icon, cls }) => (
                <Button
                  key={type}
                  variant="ghost"
                  onClick={() =>
                    editor
                      .chain()
                      .focus()
                      .insertContent({
                        type: "callout",
                        attrs: { type },
                        content: [],
                      })
                      .run()
                  }
                  className="flex h-auto w-full justify-start gap-2 px-2 py-2"
                >
                  <span className={cls}>{icon}</span>
                  <span>{label}</span>
                </Button>
              ))}
            </PopoverContent>
          </Popover>
          {/* Link */}
          <Popover open={showLinkInput} onOpenChange={setShowLinkInput}>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                className={`m-0 mt-1 h-fit w-fit p-[.35rem] ${
                  editor.isActive("link") ? "is-active" : ""
                }`}
              >
                <Link size={20} />
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
          {/* <DividerVerticalIcon style={{ marginTop: "auto", marginBottom: "auto", color: "grey" }} /> */}

          {/* Media */}
          <Alert className="m-0 flex h-fit w-fit flex-row gap-1 p-1">
            <ToolTip content="Image">
              <div
                className="editor-tool-btn editor-tool-btn-media mt-1 p-0"
                onClick={() => editor.chain().focus().insertContent({ type: "blockImage" }).run()}
                title="Image"
              >
                <ImageIcon size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Video">
              <div
                className="editor-tool-btn editor-tool-btn-media mt-1 p-0"
                onClick={() => editor.chain().focus().insertContent({ type: "blockVideo" }).run()}
                title="Video"
              >
                <VideoCamera size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Audio">
              <div
                className="editor-tool-btn editor-tool-btn-media mt-1 p-0"
                onClick={() => editor.chain().focus().insertContent({ type: "blockAudio" }).run()}
                title="Audio"
              >
                <Headphones size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Embed / YouTube">
              <div
                className="editor-tool-btn editor-tool-btn-media mt-1 p-0"
                onClick={() => editor.chain().focus().insertContent({ type: "blockEmbed" }).run()}
                title="Embed"
              >
                <Cube size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Math Equation">
              <div
                className="editor-tool-btn editor-tool-btn-math"
                onClick={() =>
                  editor.chain().focus().insertContent({ type: "blockMathEquation" }).run()
                }
                title="Math"
              >
                <Sigma size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="PDF">
              <div
                className="editor-tool-btn editor-tool-btn-document"
                onClick={() => editor.chain().focus().insertContent({ type: "blockPDF" }).run()}
                title="PDF"
              >
                <FileText size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Quiz">
              <div
                className="editor-tool-btn editor-tool-btn-interactive"
                onClick={() => editor.chain().focus().insertContent({ type: "blockQuiz" }).run()}
                title="Quiz"
              >
                <SealQuestion size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Badge">
              <div
                className="editor-tool-btn editor-tool-btn-badge"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({ type: "badge", content: [{ type: "text", text: "Badge" }] })
                    .run()
                }
                title="Badge"
              >
                <Tag size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Button">
              <div
                className="editor-tool-btn editor-tool-btn-interactive"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "button",
                      content: [{ type: "text", text: "Click me" }],
                    })
                    .run()
                }
                title="Button"
              >
                <CursorClick size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Web Preview">
              <div
                className="editor-tool-btn editor-tool-btn-web"
                onClick={() =>
                  editor.chain().focus().insertContent({ type: "blockWebPreview" }).run()
                }
                title="Web Preview"
              >
                <Globe size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Flipcard">
              <div
                className="editor-tool-btn editor-tool-btn-interactive"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "flipcard",
                      attrs: {
                        question: "Click to reveal",
                        answer: "This is the answer",
                        color: "blue",
                        alignment: "center",
                        size: "medium",
                      },
                    })
                    .run()
                }
                title="Flipcard"
              >
                <ArrowsClockwise size={15} weight="fill" />
              </div>
            </ToolTip>
            <ToolTip content="Scenarios">
              <div
                className="editor-tool-btn editor-tool-btn-interactive"
                onClick={() =>
                  editor
                    .chain()
                    .focus()
                    .insertContent({
                      type: "scenarios",
                      attrs: { title: "Interactive Scenario", currentScenarioId: "1" },
                    })
                    .run()
                }
                title="Scenarios"
              >
                <GitBranch size={15} weight="fill" />
              </div>
            </ToolTip>
          </Alert>
          {/* <DividerVerticalIcon style={{ marginTop: "auto", marginBottom: "auto", color: "grey" }} /> */}

          {/* Code dropdown */}
          {/* <div className="relative inline-block shrink-0">
        <div onClick={() => setShowCodeMenu(!showCodeMenu)} className={`editor-tool-btn editor-tool-btn-code ${showCodeMenu || editor.isActive('codeBlock') || editor.isActive('blockCode') ? 'is-active' : ''}`} title="Code">
          <Code size={15} weight="fill" /><CaretDown size={10} />
        </div>
        {showCodeMenu && (
          <div className="editor-menu-dropdown">
            <div onClick={() => { editor.chain().focus().toggleCodeBlock().run(); setShowCodeMenu(false) }} className={`editor-menu-item ${editor.isActive('codeBlock') ? 'is-active' : ''}`}>
              <span className="icon"><Code size={15} /></span><span className="label">Basic Code Block</span>
            </div>
            <div onClick={() => { editor.chain().focus().insertContent({ type: 'blockCode', attrs: { mode: 'advanced', languageId: 71, languageName: 'Python 3', starterCode: '# Write your code here\n', testCases: [] } }).run(); setShowCodeMenu(false) }} className="editor-menu-item">
              <span className="icon"><BracketsCurly size={15} /></span><span className="label">Code Playground</span>
            </div>
          </div>
        )}
      </div> */}
        </div>
      </div>
    </div>
  );
});

export default ToolbarButtons;
