import  { useRef } from "react";
import JoditEditor from "jodit-react";
import { stripHtml } from "../utils/helper";

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
      onBlur={(newContent) => setContent(stripHtml(newContent))}
      onChange={() => {}}
    />
  );
};

export default Editor;
