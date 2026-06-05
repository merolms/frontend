import { NodeViewWrapper } from "@tiptap/react";
import { User } from "lucide-react";

import { useEditorProvider } from "../../../contexts/EditorContext";

function UserBlockComponent(props) {
  const editorState = useEditorProvider();
  const isEditable = editorState.isEditable;
  const userName = props.node.attrs.userName || "User";
  const userAvatar = props.node.attrs.userAvatar;

  return (
    <NodeViewWrapper className="block-user w-full">
      <div className="my-1 inline-flex items-center gap-2 rounded-full bg-neutral-100 px-3 py-1.5">
        {userAvatar ? (
          <img src={userAvatar} alt={userName} className="h-6 w-6 rounded-full object-cover" />
        ) : (
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-neutral-300">
            <User size={12} className="text-neutral-600" />
          </div>
        )}
        {isEditable ? (
          <input
            value={userName}
            onChange={(e) => props.updateAttributes({ userName: e.target.value })}
            className="w-24 border-none bg-transparent text-sm font-medium text-neutral-700 outline-none"
            placeholder="User name"
          />
        ) : (
          <span className="text-sm font-medium text-neutral-700">{userName}</span>
        )}
      </div>
    </NodeViewWrapper>
  );
}

export default UserBlockComponent;
