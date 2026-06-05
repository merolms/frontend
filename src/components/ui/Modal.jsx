import * as Dialog from "@radix-ui/react-dialog";
import { X } from "lucide-react";

export default function Modal({
  isDialogOpen,
  onOpenChange,
  dialogTitle,
  dialogContent,
  minWidth,
  minHeight,
}) {
  return (
    <Dialog.Root open={isDialogOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 z-50 max-h-[90vh] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-xl bg-white p-6 shadow-2xl"
          style={{
            minWidth: minWidth === "lg" || minWidth === "xl" ? 600 : 400,
            minHeight: minHeight === "lg" || minHeight === "xl" ? 400 : undefined,
          }}
        >
          <div className="mb-4 flex items-center justify-between">
            <Dialog.Title className="text-lg font-semibold">{dialogTitle}</Dialog.Title>
            <Dialog.Close className="rounded-md p-1 transition-colors hover:bg-neutral-100">
              <X size={18} />
            </Dialog.Close>
          </div>
          {dialogContent}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
