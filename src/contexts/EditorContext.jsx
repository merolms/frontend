import { createContext, useContext } from "react";

const EditorContext = createContext({ isEditable: true, lessonId: null });

export function EditorProvider({ children, isEditable = true, lessonId = null }) {
  return (
    <EditorContext.Provider value={{ isEditable, lessonId }}>{children}</EditorContext.Provider>
  );
}

export function useEditorProvider() {
  return useContext(EditorContext);
}
