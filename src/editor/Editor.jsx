import React from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Youtube from '@tiptap/extension-youtube'
import { Table } from '@tiptap/extension-table'
import TableCell from '@tiptap/extension-table-cell'
import TableHeader from '@tiptap/extension-table-header'
import TableRow from '@tiptap/extension-table-row'
import CodeBlockLowlight from '@tiptap/extension-code-block-lowlight'
import TextAlign from '@tiptap/extension-text-align'
import { Toaster } from 'react-hot-toast'
import './editor.css'
import { EditorProvider } from '../contexts/EditorContext'
import { ToolbarButtons } from './Toolbar/ToolbarButtons'
import { getLinkExtension } from './EditorConf'
import { lowlight } from './editorLowlight'

import Callout from './extensions/Callout/Callout'
import InfoCallout from './extensions/Callout/Info/InfoCallout'
import WarningCallout from './extensions/Callout/Warning/WarningCallout'
import ImageBlock from './extensions/Image/ImageBlock'
import VideoBlock from './extensions/Video/VideoBlock'
import AudioBlock from './extensions/Audio/AudioBlock'
import PDFBlock from './extensions/PDF/PDFBlock'
import MathEquationBlock from './extensions/MathEquation/MathEquationBlock'
import QuizBlock from './extensions/Quiz/QuizBlock'
import EmbedObjects from './extensions/EmbedObjects/EmbedObjects'
import WebPreview from './extensions/WebPreview/WebPreview'
import Flipcard from './extensions/Flipcard/Flipcard'
import Scenarios from './extensions/Scenarios/Scenarios'
import Badges from './extensions/Badges/Badges'
import Buttons from './extensions/Buttons/Buttons'
import UserBlock from './extensions/Users/UserBlock'
import MagicBlock from './extensions/MagicBlocks/MagicBlock'
import CodePlayground from './extensions/CodePlayground/CodePlayground'
import AISelectionHighlight from './extensions/AISelectionHighlight/AISelectionHighlight'
import AIStreamingMark from './extensions/AIStreaming/AIStreamingMark'
import DragHandle from './extensions/DragHandle/DragHandle'
import { SlashCommands } from './extensions/SlashCommands'
import PasteFileHandler from './extensions/PasteFileHandler/PasteFileHandler'

const DEFAULT_CONTENT = {
  type: 'doc',
  content: [{ type: 'paragraph', content: [{ type: 'text', text: '' }] }],
}

function MeroEduEditor({ content, onSave, editable = true }) {
  const [editorReady, setEditorReady] = React.useState(false)

  const extensions = React.useMemo(() => [
    StarterKit.configure({
      codeBlock: false,
      link: false,
      bulletList: { HTMLAttributes: { class: 'bullet-list' } },
      orderedList: { HTMLAttributes: { class: 'ordered-list' } },
    }),
    Callout,
    InfoCallout.configure({ editable }),
    WarningCallout.configure({ editable }),
    ImageBlock.configure({ editable }),
    VideoBlock.configure({ editable }),
    AudioBlock.configure({ editable }),
    PDFBlock.configure({ editable }),
    MathEquationBlock.configure({ editable }),
    QuizBlock.configure({ editable }),
    Youtube.configure({ controls: true, modestBranding: true }),
    CodeBlockLowlight.configure({ lowlight }),
    EmbedObjects.configure({ editable }),
    WebPreview.configure({ editable }),
    Flipcard.configure({ editable }),
    Scenarios.configure({ editable }),
    Badges.configure({ editable }),
    Buttons.configure({ editable }),
    UserBlock.configure({ editable }),
    MagicBlock.configure({ editable }),
    CodePlayground.configure({ editable }),
    Table.configure({ resizable: true }),
    TableRow,
    TableHeader,
    TableCell,
    TextAlign.configure({ types: ['heading', 'paragraph'] }),
    getLinkExtension(),
    AISelectionHighlight,
    AIStreamingMark,
    DragHandle,
    SlashCommands.configure({ currentPlan: 'pro' }),
    PasteFileHandler.configure({ activity: null, getAccessToken: () => undefined }),
  ], [editable])

  const editor = useEditor({
    editable,
    extensions,
    content: content || DEFAULT_CONTENT,
    immediatelyRender: false,
    onCreate: () => {
      setTimeout(() => setEditorReady(true), 0)
    },
  })

  const handleSave = React.useCallback(() => {
    if (!editor || !onSave) return
    onSave(editor.getJSON())
  }, [editor, onSave])

  return (
    <EditorProvider isEditable={editable}>
      <Toaster position="top-right" />
        <div className="editor-topbar">
          <div className="editor-toolbar-center">
            <ToolbarButtons editor={editor} />
          </div>
        </div>
        <div className="editor-content-area">
          <div className="editor-content-inner">
            <EditorContent editor={editor} dark={"false"} />
          </div>
        </div>
    </EditorProvider>
  )
}

export default MeroEduEditor
