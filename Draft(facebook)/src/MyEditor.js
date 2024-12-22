import React, { useState } from "react";
import { Editor, EditorState, RichUtils, Modifier, CompositeDecorator } from "draft-js";

// Component to render LINK entities
const Link = (props) => {
  const { url } = props.contentState.getEntity(props.entityKey).getData();
  const handleClick = (e) => {
    e.preventDefault(); // Prevent the editor from focusing
    window.open(url, "_blank", "noopener,noreferrer"); // Open the link in a new tab
  };
  return (
    <a href={url} style={{ color: "blue", textDecoration: "underline", cursor:'pointer' }} onClick={handleClick}>
      {props.children}
    </a>
  );
};

// Decorator to handle LINK rendering
const decorator = new CompositeDecorator([
  {
    strategy: (contentBlock, callback, contentState) => {
      contentBlock.findEntityRanges(
        (character) => {
          const entityKey = character.getEntity();
          return entityKey !== null && contentState.getEntity(entityKey).getType() === "LINK";
        },
        callback
      );
    },
    component: Link,
  },
]);

function MyEditor() {
  const [editorState, setEditorState] = useState(() => EditorState.createEmpty(decorator));

  // Toggle Inline Styles (Bold, Italic, Underline)
  const toggleInlineStyle = (style) => {
    setEditorState(RichUtils.toggleInlineStyle(editorState, style));
  };

  // Add a Link Entity
  const addLink = () => {
    const url = window.prompt("Enter the URL:", "https://example.com");
    if (!url) return;

    const contentState = editorState.getCurrentContent();
    const contentStateWithEntity = contentState.createEntity("LINK", "MUTABLE", { url });
    const entityKey = contentStateWithEntity.getLastCreatedEntityKey();

    const selectionState = editorState.getSelection();
    const contentStateWithLink = Modifier.applyEntity(contentStateWithEntity, selectionState, entityKey);

    const newEditorState = EditorState.push(editorState, contentStateWithLink, "apply-entity");
    setEditorState(newEditorState);
  };

  // Remove a Link Entity
  const removeLink = () => {
    const selectionState = editorState.getSelection();
    if (!selectionState.isCollapsed()) {
      const contentState = Modifier.applyEntity(
        editorState.getCurrentContent(),
        selectionState,
        null // Remove the entity
      );
      setEditorState(EditorState.push(editorState, contentState, "apply-entity"));
    }
  };

  // Handle Key Commands (e.g., Ctrl+B for Bold)
  const handleKeyCommand = (command) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      setEditorState(newState);
      return "handled";
    }
    return "not-handled";
  };

  return (
    <div>
      {/* Formatting Buttons */}
      <div style={{ marginBottom: "10px" }}>
        <button onClick={() => toggleInlineStyle("BOLD")}>Bold</button>
        <button onClick={() => toggleInlineStyle("ITALIC")}>Italic</button>
        <button onClick={() => toggleInlineStyle("UNDERLINE")}>Underline</button>
        <button onClick={addLink}>Add Link</button>
        <button onClick={removeLink}>Remove Link</button>
      </div>

      {/* Editor Container */}
      <div style={{ border: "1px solid #ccc", padding: "10px", minHeight: "200px" }}>
        <Editor
          editorState={editorState}
          onChange={setEditorState}
          handleKeyCommand={handleKeyCommand}
        />
      </div>
    </div>
  );
}

export default MyEditor;
