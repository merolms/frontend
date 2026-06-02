import React from 'react'
import { DividerVerticalIcon } from '@radix-ui/react-icons'
import {
  ArrowCounterClockwise,
  ArrowClockwise,
  ArrowsClockwise,
  BracketsCurly,
  CaretDown,
  CheckCircle,
  Code,
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
  TextAlignCenter,
  TextAlignJustify,
  TextAlignLeft,
  TextAlignRight,
  TextB,
  TextItalic,
  TextStrikethrough,
  User,
  VideoCamera,
  Warning,
  XCircle,
} from '@phosphor-icons/react'
import ToolTip from '../../components/ui/Tooltip'
import LinkInputTooltip from './LinkInputTooltip'

export const ToolbarButtons = React.memo(({ editor }) => {
  const [showTableMenu, setShowTableMenu] = React.useState(false)
  const [showListMenu, setShowListMenu] = React.useState(false)
  const [showCodeMenu, setShowCodeMenu] = React.useState(false)
  const [showCalloutMenu, setShowCalloutMenu] = React.useState(false)
  const [showLinkInput, setShowLinkInput] = React.useState(false)

  if (!editor) return null

  const tableOptions = [
    { label: 'Insert Table', icon: <Table size={15} />, action: () => editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    { label: 'Add Row', icon: <RowsPlusBottom size={15} />, action: () => editor.chain().focus().addRowAfter().run() },
    { label: 'Add Column', icon: <ColumnsPlusRight size={15} />, action: () => editor.chain().focus().addColumnAfter().run() },
    { label: 'Delete Row', icon: <Rows size={15} />, action: () => editor.chain().focus().deleteRow().run() },
    { label: 'Delete Column', icon: <Columns size={15} />, action: () => editor.chain().focus().deleteColumn().run() },
  ]

  const listOptions = [
    { label: 'Bullet List', icon: <ListBullets size={15} />, action: () => editor.chain().focus().toggleBulletList().run() },
    { label: 'Ordered List', icon: <ListNumbers size={15} />, action: () => editor.chain().focus().toggleOrderedList().run() },
  ]

  const handleLinkClick = () => {
    const { from, to } = editor.state.selection
    setShowLinkInput(true)
    setTimeout(() => editor.commands.setTextSelection({ from, to }), 0)
  }

  const getCurrentLinkUrl = () =>
    editor.isActive('link') ? editor.getAttributes('link').href : ''

  const handleLinkSave = (url) => {
    editor.chain().focus().setLink({ href: url, target: '_blank', rel: 'noopener noreferrer' }).run()
    setShowLinkInput(false)
  }

  return (
    <div className="flex flex-row items-center justify-start flex-wrap gap-[7px]">
      <div className="editor-tool-btn" onClick={() => editor.chain().focus().undo().run()} title="Undo">
        <ArrowCounterClockwise size={15} />
      </div>
      <div className="editor-tool-btn" onClick={() => editor.chain().focus().redo().run()} title="Redo">
        <ArrowClockwise size={15} />
      </div>
      <div onClick={() => editor.chain().focus().toggleBold().run()} className={`editor-tool-btn ${editor.isActive('bold') ? 'is-active' : ''}`} title="Bold">
        <TextB size={15} />
      </div>
      <div onClick={() => editor.chain().focus().toggleItalic().run()} className={`editor-tool-btn ${editor.isActive('italic') ? 'is-active' : ''}`} title="Italic">
        <TextItalic size={15} />
      </div>
      <div onClick={() => editor.chain().focus().toggleStrike().run()} className={`editor-tool-btn ${editor.isActive('strike') ? 'is-active' : ''}`} title="Strikethrough">
        <TextStrikethrough size={15} />
      </div>

      <DividerVerticalIcon style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }} />

      {/* Text alignment */}
      <div onClick={() => editor.chain().focus().setTextAlign('left').run()} className={`editor-tool-btn ${editor.isActive({ textAlign: 'left' }) ? 'is-active' : ''}`} title="Align Left">
        <TextAlignLeft size={15} />
      </div>
      <div onClick={() => editor.chain().focus().setTextAlign('center').run()} className={`editor-tool-btn ${editor.isActive({ textAlign: 'center' }) ? 'is-active' : ''}`} title="Align Center">
        <TextAlignCenter size={15} />
      </div>
      <div onClick={() => editor.chain().focus().setTextAlign('right').run()} className={`editor-tool-btn ${editor.isActive({ textAlign: 'right' }) ? 'is-active' : ''}`} title="Align Right">
        <TextAlignRight size={15} />
      </div>
      <div onClick={() => editor.chain().focus().setTextAlign('justify').run()} className={`editor-tool-btn ${editor.isActive({ textAlign: 'justify' }) ? 'is-active' : ''}`} title="Justify">
        <TextAlignJustify size={15} />
      </div>

      <DividerVerticalIcon style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }} />

      {/* List dropdown */}
      <div className="relative inline-block shrink-0">
        <div onClick={() => setShowListMenu(!showListMenu)} className={`editor-tool-btn ${showListMenu || editor.isActive('bulletList') || editor.isActive('orderedList') ? 'is-active' : ''}`} title="List">
          <ListBullets size={15} /><CaretDown size={10} />
        </div>
        {showListMenu && (
          <div className="editor-menu-dropdown">
            {listOptions.map((opt, i) => (
              <div key={i} onClick={() => { opt.action(); setShowListMenu(false) }} className="editor-menu-item">
                <span className="icon">{opt.icon}</span><span className="label">{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Heading select */}
      <select
        className="editor-tool-select"
        value={
          editor.isActive('heading', { level: 1 }) ? '1' :
          editor.isActive('heading', { level: 2 }) ? '2' :
          editor.isActive('heading', { level: 3 }) ? '3' :
          editor.isActive('heading', { level: 4 }) ? '4' :
          editor.isActive('heading', { level: 5 }) ? '5' :
          editor.isActive('heading', { level: 6 }) ? '6' : '0'
        }
        onChange={(e) => {
          const v = e.target.value
          if (v === '0') editor.chain().focus().setParagraph().run()
          else editor.chain().focus().toggleHeading({ level: parseInt(v) }).run()
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

      {/* Table dropdown */}
      <div className="relative inline-block shrink-0">
        <div onClick={() => setShowTableMenu(!showTableMenu)} className={`editor-tool-btn ${showTableMenu ? 'is-active' : ''}`} title="Table">
          <Table size={15} /><CaretDown size={10} />
        </div>
        {showTableMenu && (
          <div className="editor-menu-dropdown">
            {tableOptions.map((opt, i) => (
              <div key={i} onClick={() => { opt.action(); setShowTableMenu(false) }} className="editor-menu-item">
                <span className="icon">{opt.icon}</span><span className="label">{opt.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <DividerVerticalIcon style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }} />

      {/* Callout dropdown */}
      <div className="relative inline-block shrink-0">
        <div onClick={() => setShowCalloutMenu(!showCalloutMenu)} className={`editor-tool-btn ${showCalloutMenu || editor.isActive('callout') || editor.isActive('calloutInfo') || editor.isActive('calloutWarning') ? 'is-active' : ''}`} title="Callout">
          <Info size={15} /><CaretDown size={10} />
        </div>
        {showCalloutMenu && (
          <div className="editor-menu-dropdown">
            {[
              { type: 'info',    label: 'Info',    icon: <Info      size={14} weight="fill" />, cls: 'text-gray-500'   },
              { type: 'warning', label: 'Warning', icon: <Warning   size={14} weight="fill" />, cls: 'text-yellow-500' },
              { type: 'tip',     label: 'Tip',     icon: <Lightbulb size={14} weight="fill" />, cls: 'text-green-500'  },
              { type: 'success', label: 'Success', icon: <CheckCircle size={14} weight="fill" />, cls: 'text-teal-500' },
              { type: 'error',   label: 'Error',   icon: <XCircle   size={14} weight="fill" />, cls: 'text-red-500'   },
            ].map(({ type, label, icon, cls }) => (
              <div key={type} onClick={() => { editor.chain().focus().insertContent({ type: 'callout', attrs: { type }, content: [] }).run(); setShowCalloutMenu(false) }} className="editor-menu-item">
                <span className={`icon ${cls}`}>{icon}</span><span className="label">{label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Link */}
      <ToolTip content="Link">
        <div style={{ position: 'relative' }}>
          <div onClick={handleLinkClick} className={`editor-tool-btn ${editor.isActive('link') ? 'is-active' : ''}`} title="Link">
            <Link size={15} />
          </div>
          {showLinkInput && (
            <LinkInputTooltip onSave={handleLinkSave} onCancel={() => setShowLinkInput(false)} currentUrl={getCurrentLinkUrl()} />
          )}
        </div>
      </ToolTip>

      <DividerVerticalIcon style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }} />

      {/* Media */}
      <ToolTip content="Image">
        <div className="editor-tool-btn editor-tool-btn-media" onClick={() => editor.chain().focus().insertContent({ type: 'blockImage' }).run()} title="Image">
          <ImageIcon size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Video">
        <div className="editor-tool-btn editor-tool-btn-media" onClick={() => editor.chain().focus().insertContent({ type: 'blockVideo' }).run()} title="Video">
          <VideoCamera size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Audio">
        <div className="editor-tool-btn editor-tool-btn-media" onClick={() => editor.chain().focus().insertContent({ type: 'blockAudio' }).run()} title="Audio">
          <Headphones size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Embed / YouTube">
        <div className="editor-tool-btn editor-tool-btn-media" onClick={() => editor.chain().focus().insertContent({ type: 'blockEmbed' }).run()} title="Embed">
          <Cube size={15} weight="fill" />
        </div>
      </ToolTip>

      <DividerVerticalIcon style={{ marginTop: 'auto', marginBottom: 'auto', color: 'grey' }} />

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

      {/* Interactive */}
      <ToolTip content="Math Equation">
        <div className="editor-tool-btn editor-tool-btn-math" onClick={() => editor.chain().focus().insertContent({ type: 'blockMathEquation' }).run()} title="Math">
          <Sigma size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="PDF">
        <div className="editor-tool-btn editor-tool-btn-document" onClick={() => editor.chain().focus().insertContent({ type: 'blockPDF' }).run()} title="PDF">
          <FileText size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Quiz">
        <div className="editor-tool-btn editor-tool-btn-interactive" onClick={() => editor.chain().focus().insertContent({ type: 'blockQuiz' }).run()} title="Quiz">
          <SealQuestion size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Badge">
        <div className="editor-tool-btn editor-tool-btn-badge" onClick={() => editor.chain().focus().insertContent({ type: 'badge', content: [{ type: 'text', text: 'Badge' }] }).run()} title="Badge">
          <Tag size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Button">
        <div className="editor-tool-btn editor-tool-btn-interactive" onClick={() => editor.chain().focus().insertContent({ type: 'button', content: [{ type: 'text', text: 'Click me' }] }).run()} title="Button">
          <CursorClick size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Web Preview">
        <div className="editor-tool-btn editor-tool-btn-web" onClick={() => editor.chain().focus().insertContent({ type: 'blockWebPreview' }).run()} title="Web Preview">
          <Globe size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Flipcard">
        <div className="editor-tool-btn editor-tool-btn-interactive" onClick={() => editor.chain().focus().insertContent({ type: 'flipcard', attrs: { question: 'Click to reveal', answer: 'This is the answer', color: 'blue', alignment: 'center', size: 'medium' } }).run()} title="Flipcard">
          <ArrowsClockwise size={15} weight="fill" />
        </div>
      </ToolTip>
      <ToolTip content="Scenarios">
        <div className="editor-tool-btn editor-tool-btn-interactive" onClick={() => editor.chain().focus().insertContent({ type: 'scenarios', attrs: { title: 'Interactive Scenario', currentScenarioId: '1' } }).run()} title="Scenarios">
          <GitBranch size={15} weight="fill" />
        </div>
      </ToolTip>
      {/* <ToolTip content="User Block">
        <div className="editor-tool-btn editor-tool-btn-user" onClick={() => editor.chain().focus().insertContent({ type: 'blockUser' }).run()} title="User Block">
          <User size={15} weight="fill" />
        </div>
      </ToolTip> */}
    </div>
  )
})

export default ToolbarButtons
