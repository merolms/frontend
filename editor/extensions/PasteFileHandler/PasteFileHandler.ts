// @ts-nocheck
import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";

import { uploadEditorMedia } from "@/editor/utils/mediaUpload";

const MIME_TYPE_MAP = {
  "image/jpeg": "blockImage",
  "image/png": "blockImage",
  "image/webp": "blockImage",
  "image/gif": "blockImage",
  "video/mp4": "blockVideo",
  "video/webm": "blockVideo",
  "application/pdf": "blockPDF",
};

const PasteFileHandler = Extension.create({
  name: "pasteFileHandler",

  addProseMirrorPlugins() {
    const editor = this.editor;

    const uploadAndReplace = async (file, blockType, nodePos) => {
      try {
        const lessonId = editor.storage?.lessonId || editor.options?.editorProps?.lessonId;
        if (!lessonId) return;

        const { url } = await uploadEditorMedia(file, lessonId, "temp_upload");

        const remoteAttr =
          blockType === "blockPDF" ? { pdfUrl: url } : { fileUrl: url, dataUrl: null };

        editor
          .chain()
          .focus()
          .updateAttributesAt(nodePos, {
            fileName: file.name,
            ...remoteAttr,
          })
          .run();
      } catch (err) {
        console.error("Background upload failed for pasted file:", err);
      }
    };

    const handleFiles = (files, pos) => {
      let handled = false;

      for (const file of Array.from(files)) {
        const blockType = MIME_TYPE_MAP[file.type];
        if (!blockType) continue;
        handled = true;

        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          const insertPos = pos !== undefined ? pos : editor.state.selection.anchor;

          editor
            .chain()
            .focus()
            .insertContentAt(insertPos, {
              type: blockType,
              attrs: { dataUrl, fileName: file.name },
            })
            .run();

          const resolvedPos = editor.state.selection.anchor;
          const $pos = editor.state.doc.resolve(resolvedPos);
          const nodeAtPos = $pos.nodeAfter;
          if (nodeAtPos && nodeAtPos.type.name === blockType) {
            uploadAndReplace(file, blockType, resolvedPos);
          }
        };
        reader.readAsDataURL(file);
      }

      return handled;
    };

    return [
      new Plugin({
        key: new PluginKey("pasteFileHandler"),
        props: {
          handlePaste(_view, event) {
            const files = event.clipboardData?.files;
            if (!files || files.length === 0) return false;
            return handleFiles(files);
          },
          handleDrop(_view, event, _slice, moved) {
            if (moved) return false;
            const files = event.dataTransfer?.files;
            if (!files || files.length === 0) return false;
            const coordinates = _view.posAtCoords({ left: event.clientX, top: event.clientY });
            event.preventDefault();
            return handleFiles(files, coordinates?.pos);
          },
        },
      }),
    ];
  },
});

export default PasteFileHandler;
