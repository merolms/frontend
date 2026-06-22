// Shared types for the MeroEdu editor.
//
// These describe the public surface of the editor (props, callbacks, stats)
// and the attribute shapes of the custom block extensions. Keeping them in
// one place lets extension schemas, NodeView components, slash commands and
// the toolbar all agree on the shape of the data flowing between them.

import type { Editor, JSONContent } from "@tiptap/core";

// ─── Public editor API ───────────────────────────────────────────────

/** Content accepted by `MeroEduEditor`. Either a doc JSON string or a parsed object. */
export type EditorContent = JSONContent | string;

/** Lightweight stats derived from the document, surfaced via `onStatsChange`. */
export interface EditorStats {
  /** Total number of top-level blocks in the document. */
  blocks: number;
  /** Word count, provided by `@tiptap/extension-character-count`. */
  words: number;
  /** Character count, provided by `@tiptap/extension-character-count`. */
  characters: number;
}

export interface MeroEduEditorProps {
  /** Initial document content (doc JSON string or parsed object). */
  initialContent?: EditorContent;
  /** Fired (debounced) with the latest document JSON when content changes. */
  onContentChange?: (content: JSONContent) => void;
  /** Fired with up-to-date stats on every content change (cheap, not debounced). */
  onStatsChange?: (stats: EditorStats) => void;
  /** Whether the editor is editable. Defaults to `true`. */
  editable?: boolean;
  /** Whether to render the toolbar. Defaults to `true`. */
  showToolbar?: boolean;
  /** The lesson this editor is editing — used for media uploads. */
  lessonId?: string | number | null;
}

// ─── Slash commands ──────────────────────────────────────────────────

export type SlashCommandCategory =
  | "text"
  | "media"
  | "interactive"
  | "callouts"
  | "ui"
  | "tables";

export interface SlashCommand {
  id: string;
  title: string;
  description: string;
  /** React node rendered as the command icon. */
  icon: React.ReactNode;
  category: SlashCommandCategory;
  keywords: string[];
  command: (editor: Editor) => void;
}

// ─── Custom block attribute shapes ───────────────────────────────────
// These mirror the `addAttributes()` return value of each extension.
// They're exposed so NodeView components and slash commands can stay in
// sync with the schema without hand-mirroring field names.

export interface BlockObject {
  id?: string | number;
}

export interface ImageBlockAttrs {
  blockObject?: BlockObject | null;
  size?: { width: number };
  alignment?: ImageAlignment;
  dataUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  unsplash_url?: string | null;
  unsplash_photographer_name?: string | null;
  unsplash_photographer_url?: string | null;
  unsplash_photo_url?: string | null;
}

export interface VideoBlockAttrs {
  dataUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  blockObject?: BlockObject | null;
}

export interface AudioBlockAttrs {
  dataUrl?: string | null;
  fileUrl?: string | null;
  fileName?: string | null;
  blockObject?: BlockObject | null;
}

export interface PDFBlockAttrs {
  dataUrl?: string | null;
  fileName?: string | null;
  pdfUrl?: string | null;
  blockObject?: BlockObject | null;
}

export interface MathEquationBlockAttrs {
  equation?: string;
}

export interface EmbedObjectsAttrs {
  embedUrl?: string | null;
  embedCode?: string | null;
  embedType?: string | null;
  embedHeight?: number;
  embedWidth?: number | string;
  alignment?: ImageAlignment;
}

export interface WebPreviewAttrs {
  url?: string | null;
  title?: string | null;
  description?: string | null;
  image?: string | null;
  og_image?: string | null;
  favicon?: string | null;
  og_type?: string | null;
  og_url?: string | null;
  alignment?: ImageAlignment;
  showButton?: boolean;
  buttonLabel?: string;
  openInPopup?: boolean;
}

export interface FlipcardAttrs {
  question?: string;
  answer?: string;
  color?: string;
  alignment?: ImageAlignment;
  size?: "small" | "medium" | "large";
}

export interface BadgeAttrs {
  color?: string;
  emoji?: string;
}

export interface ButtonAttrs {
  emoji?: string;
  link?: string;
  color?: string;
  alignment?: ImageAlignment;
}

export interface UserBlockAttrs {
  userId?: string | number | null;
  userName?: string;
  userAvatar?: string | null;
}

export interface CalloutAttrs {
  type?: CalloutType;
  dismissible?: boolean;
}

export interface CodePlaygroundTestCase {
  input?: string;
  expectedOutput?: string;
}

export interface CodePlaygroundAttrs {
  mode?: string;
  languageId?: number;
  languageName?: string;
  starterCode?: string;
  testCases?: CodePlaygroundTestCase[];
  description?: string;
  hints?: string[];
  difficulty?: "easy" | "medium" | "hard";
  solutionCode?: string;
  maxAttemptsBeforeReveal?: number;
  timeComplexity?: string;
  spaceComplexity?: string;
  timeLimitMs?: number;
  sqliteDbPath?: string;
  sqliteDbName?: string;
  timedMode?: boolean;
  timedDurationMs?: number;
  additionalFiles?: unknown[];
}

export interface MagicBlockAttrs {
  blockUuid?: string | null;
  sessionUuid?: string | null;
  htmlContent?: string | null;
  iterationCount?: number;
  title?: string;
  height?: number;
}

export interface ScenarioOption {
  id: string;
  text: string;
  nextScenarioId: string | null;
}

export interface ScenarioStep {
  id: string;
  text: string;
  imageUrl: string;
  options: ScenarioOption[];
}

export interface ScenariosAttrs {
  title?: string;
  scenarios?: ScenarioStep[];
  currentScenarioId?: string;
}

export interface QuizQuestion {
  // Quiz questions are free-form; intentionally loose.
  [key: string]: unknown;
}

export interface QuizAttrs {
  quizId?: string | null;
  questions?: QuizQuestion[];
}

// ─── Shared primitives ───────────────────────────────────────────────

export type ImageAlignment = "left" | "center" | "right";

export type CalloutType = "info" | "warning" | "tip" | "success" | "error";
