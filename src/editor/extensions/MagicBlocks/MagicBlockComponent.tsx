import { NodeViewWrapper } from "@tiptap/react";
import { Lock, Sparkles } from "lucide-react";

function MagicBlockComponent() {
  return (
    <NodeViewWrapper className="block-magic w-full">
      <div
        style={{
          background:
            "linear-gradient(0deg, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.2) 100%), rgb(2 1 25 / 98%)",
        }}
        className="rounded-2xl px-5 py-8 shadow-lg ring-1 ring-white/10 ring-inset"
      >
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="rounded-full bg-white/10 p-4">
            <Lock className="text-secondary/40 h-8 w-8" />
          </div>
          <div className="space-y-1">
            <p className="text-secondary/80 flex items-center justify-center gap-2 font-semibold">
              <Sparkles className="h-4 w-4 text-purple-400" />
              Magic Block
            </p>
            <p className="text-secondary/50 text-sm">
              AI-powered interactive content requires a backend connection.
            </p>
            <p className="text-secondary/30 mt-2 text-xs">
              This block is a placeholder in the standalone editor.
            </p>
          </div>
        </div>
      </div>
    </NodeViewWrapper>
  );
}

export default MagicBlockComponent;
