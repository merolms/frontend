/**
 * Extension Registry
 *
 * Central registry for all editor extensions, organized by category.
 * This provides better organization without requiring file structure changes.
 */

// ─── Core Extensions ─────────────────────────────────────────────────────
export { default as DragHandle } from "./DragHandle/DragHandle";
export { default as SlashCommands } from "./SlashCommands/SlashCommands";
export { default as PasteFileHandler } from "./PasteFileHandler/PasteFileHandler";
export { default as Placeholder } from "@tiptap/extension-placeholder";

// ─── Text Formatting ────────────────────────────────────────────────────
export { default as AISelectionHighlight } from "./AISelectionHighlight/AISelectionHighlight";
export { default as AIStreamingMark } from "./AIStreaming/AIStreamingMark";
export { default as Highlight } from "@tiptap/extension-highlight";
export { default as TextStyleKit } from "@tiptap/extension-text-style";
export { default as TextAlign } from "@tiptap/extension-text-align";

// ─── Media Blocks ────────────────────────────────────────────────────────
export { default as ImageBlock } from "./Image/ImageBlock";
export { default as VideoBlock } from "./Video/VideoBlock";
export { default as AudioBlock } from "./Audio/AudioBlock";
export { default as PDFBlock } from "./PDF/PDFBlock";
export { default as EmbedObjects } from "./EmbedObjects/EmbedObjects";
export { default as Youtube } from "@tiptap/extension-youtube";

// ─── Interactive Blocks ───────────────────────────────────────────────────
export { default as QuizBlock } from "./Quiz/QuizBlock";
export { default as Flipcard } from "./Flipcard/Flipcard";
export { default as Scenarios } from "./Scenarios/Scenarios";
export { default as CodePlayground } from "./CodePlayground/CodePlayground";
export { default as WebPreview } from "./WebPreview/WebPreview";

// ─── Content Blocks ───────────────────────────────────────────────────────
export { default as MathEquationBlock } from "./MathEquation/MathEquationBlock";
export { default as Callout } from "./Callout/Callout";
export { default as InfoCallout } from "./Callout/Info/InfoCallout";
export { default as WarningCallout } from "./Callout/Warning/WarningCallout";
export { default as Badges } from "./Badges/Badges";
export { default as Buttons } from "./Buttons/Buttons";
export { default as UserBlock } from "./Users/UserBlock";
export { default as MagicBlock } from "./MagicBlocks/MagicBlock";

// ─── Table Extensions ────────────────────────────────────────────────────
export { default as Table } from "@tiptap/extension-table";
export { default as TableRow } from "@tiptap/extension-table-row";
export { default as TableHeader } from "@tiptap/extension-table-header";
export { default as TableCell } from "@tiptap/extension-table-cell";

// ─── Code Extensions ────────────────────────────────────────────────────
export { default as CodeBlockLowlight } from "@tiptap/extension-code-block-lowlight";

// ─── Link Extensions ───────────────────────────────────────────────────────
export { getLinkExtension } from "../EditorConf";

// ─── Extension Groups ───────────────────────────────────────────────────────

/**
 * Core extensions that are always loaded
 */
export const coreExtensions = [
  "DragHandle",
  "SlashCommands",
  "PasteFileHandler",
  "Placeholder",
];

/**
 * Text formatting extensions
 */
export const formattingExtensions = [
  "AISelectionHighlight",
  "AIStreamingMark",
  "Highlight",
  "TextStyleKit",
  "TextAlign",
];

/**
 * Media block extensions
 */
export const mediaExtensions = [
  "ImageBlock",
  "VideoBlock",
  "AudioBlock",
  "PDFBlock",
  "EmbedObjects",
  "Youtube",
];

/**
 * Interactive block extensions
 */
export const interactiveExtensions = [
  "QuizBlock",
  "Flipcard",
  "Scenarios",
  "CodePlayground",
  "WebPreview",
];

/**
 * Content block extensions
 */
export const contentExtensions = [
  "MathEquationBlock",
  "Callout",
  "InfoCallout",
  "WarningCallout",
  "Badges",
  "Buttons",
  "UserBlock",
  "MagicBlock",
];

/**
 * Table extensions
 */
export const tableExtensions = [
  "Table",
  "TableRow",
  "TableHeader",
  "TableCell",
];

/**
 * All block extensions (media + interactive + content)
 */
export const allBlockExtensions = [
  ...mediaExtensions,
  ...interactiveExtensions,
  ...contentExtensions,
];

/**
 * Complete list of all extension categories
 */
export const extensionCategories = {
  core: coreExtensions,
  formatting: formattingExtensions,
  media: mediaExtensions,
  interactive: interactiveExtensions,
  content: contentExtensions,
  table: tableExtensions,
} as const;
