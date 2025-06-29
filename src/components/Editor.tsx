import React, { useRef } from "react";
import JoditEditor from "jodit-react";

type Props = {
  content: string;
  setContent: (val: string) => void;
};

const Editor = ({ content, setContent }: Props) => {
  const editor = useRef(null);

  return (
    <JoditEditor
      ref={editor}
      value={content}
      tabIndex={1}
      onBlur={(newContent) => setContent(newContent)}
      onChange={() => {}}
    />
  );
};

export default Editor;
