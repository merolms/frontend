import { mergeAttributes, Node } from "@tiptap/core";
import { ReactNodeViewRenderer } from "@tiptap/react";

import ScenariosExtension from "./ScenariosExtension";

export default Node.create({
  name: "scenarios",
  group: "block",
  draggable: true,
  atom: true,
  addAttributes() {
    return {
      title: { default: "Interactive Scenario" },
      scenarios: {
        default: [
          {
            id: "1",
            text: "Welcome! What would you like to do?",
            imageUrl: "",
            options: [
              { id: "opt1", text: "Continue exploring", nextScenarioId: "2" },
              { id: "opt2", text: "Learn more", nextScenarioId: "3" },
            ],
          },
          {
            id: "2",
            text: "Great choice!",
            imageUrl: "",
            options: [
              { id: "opt3", text: "Go back", nextScenarioId: "1" },
              { id: "opt4", text: "Finish", nextScenarioId: null },
            ],
          },
          {
            id: "3",
            text: "Here's more info.",
            imageUrl: "",
            options: [
              { id: "opt5", text: "Go back", nextScenarioId: "1" },
              { id: "opt6", text: "Finish", nextScenarioId: null },
            ],
          },
        ],
      },
      currentScenarioId: { default: "1" },
    };
  },
  parseHTML() {
    return [{ tag: "scenarios-block" }];
  },
  renderHTML({ HTMLAttributes }) {
    return ["scenarios-block", mergeAttributes(HTMLAttributes)];
  },
  addNodeView() {
    return ReactNodeViewRenderer(ScenariosExtension);
  },
});
