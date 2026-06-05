import { createContext, useContext } from "react";

const EditorContext = createContext({ isEditable: true });

export function EditorProvider({ children, isEditable = true }) {
  return <EditorContext.Provider value={{ isEditable }}>{children}</EditorContext.Provider>;
}

export function useEditorProvider() {
  return useContext(EditorContext);
}
