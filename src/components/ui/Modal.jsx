import React from 'react'
import * as Dialog from '@radix-ui/react-dialog'
import { X } from 'lucide-react'

export default function Modal({ isDialogOpen, onOpenChange, dialogTitle, dialogContent, minWidth, minHeight }) {
  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 z-40" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl shadow-2xl z-50 p-6 max-h-[90vh] overflow-y-auto"
          style={{ minWidth: minWidth === 'lg' || minWidth === 'xl' ? 600 : 400, minHeight: minHeight === 'lg' || minHeight === 'xl' ? 400 : undefined }}
        >
          <div className="flex items-center justify-between mb-4">
            <Dialog.Title className="text-lg font-semibold">{dialogTitle}</Dialog.Title>
            <Dialog.Close className="p-1 rounded-md hover:bg-neutral-100 transition-colors">
              <X size={18} />
            </Dialog.Close>
          </div>
          {dialogContent}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  )
}
