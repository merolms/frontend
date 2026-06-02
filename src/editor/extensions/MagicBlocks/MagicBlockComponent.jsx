import React from 'react'
import { NodeViewWrapper } from '@tiptap/react'
import { Sparkles, Lock } from 'lucide-react'

function MagicBlockComponent() {
  return (
    <NodeViewWrapper className="block-magic w-full">
      <div
        style={{ background: 'linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), rgb(2 1 25 / 98%)' }}
        className="rounded-2xl px-5 py-8 shadow-lg ring-1 ring-inset ring-white/10"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 rounded-full bg-white/10">
            <Lock className="w-8 h-8 text-white/40" />
          </div>
          <div className="space-y-1">
            <p className="font-semibold text-white/80 flex items-center gap-2 justify-center">
              <Sparkles className="w-4 h-4 text-purple-400" />
              Magic Block
            </p>
            <p className="text-sm text-white/50">
              AI-powered interactive content requires a backend connection.
            </p>
            <p className="text-xs text-white/30 mt-2">
              This block is a placeholder in the standalone editor.
            </p>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  )
}

export default MagicBlockComponent
