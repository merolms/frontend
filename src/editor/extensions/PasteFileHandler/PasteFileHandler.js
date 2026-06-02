import { Extension } from '@tiptap/core'
import { Plugin, PluginKey } from '@tiptap/pm/state'

const MIME_TYPE_MAP = {
  'image/jpeg': 'blockImage',
  'image/png': 'blockImage',
  'image/webp': 'blockImage',
  'image/gif': 'blockImage',
  'video/mp4': 'blockVideo',
  'video/webm': 'blockVideo',
  'application/pdf': 'blockPDF',
}

const PasteFileHandler = Extension.create({
  name: 'pasteFileHandler',

  addProseMirrorPlugins() {
    const editor = this.editor

    const handleFiles = (files, pos) => {
      let handled = false

      for (const file of Array.from(files)) {
        const blockType = MIME_TYPE_MAP[file.type]
        if (!blockType) continue
        handled = true

        const reader = new FileReader()
        reader.onload = (e) => {
          const dataUrl = e.target.result
          const insertPos = pos !== undefined ? pos : editor.state.selection.anchor
          editor.chain().focus().insertContentAt(insertPos, {
            type: blockType,
            attrs: { dataUrl, fileName: file.name },
          }).run()
        }
        reader.readAsDataURL(file)
      }

      return handled
    }

    return [
      new Plugin({
        key: new PluginKey('pasteFileHandler'),
        props: {
          handlePaste(_view, event) {
            const files = event.clipboardData?.files
            if (!files || files.length === 0) return false
            return handleFiles(files)
          },
          handleDrop(_view, event, _slice, moved) {
            if (moved) return false
            const files = event.dataTransfer?.files
            if (!files || files.length === 0) return false
            const coordinates = _view.posAtCoords({ left: event.clientX, top: event.clientY })
            event.preventDefault()
            return handleFiles(files, coordinates?.pos)
          },
        },
      }),
    ]
  },
})

export default PasteFileHandler
