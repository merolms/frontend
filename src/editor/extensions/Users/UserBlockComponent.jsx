import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { User } from 'lucide-react'
import { useEditorProvider } from '../../../contexts/EditorContext'

function UserBlockComponent(props) {
  const editorState = useEditorProvider()
  const isEditable = editorState.isEditable
  const userName = props.node.attrs.userName || 'User'
  const userAvatar = props.node.attrs.userAvatar

  return (
    <NodeViewWrapper className="block-user w-full">
      <div className="inline-flex items-center gap-2 bg-neutral-100 rounded-full px-3 py-1.5 my-1">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-neutral-300 flex items-center justify-center">
            <User size={12} className="text-neutral-600" />
          </div>
        )}
        {isEditable ? (
          <input
            value={userName}
            onChange={(e) => props.updateAttributes({ userName: e.target.value })}
            className="bg-transparent text-sm font-medium text-neutral-700 outline-none border-none w-24"
            placeholder="User name"
          />
        ) : (
          <span className="text-sm font-medium text-neutral-700">{userName}</span>
        )}
      </div>
    </NodeViewWrapper>
  )
}

export default UserBlockComponent
