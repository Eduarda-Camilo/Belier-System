import Editor from "react-simple-code-editor";
import { highlightCode } from "../utils/codeHighlight";

const editorStyle: React.CSSProperties = {
  fontFamily: "'Source Code Pro', Consolas, Monaco, monospace",
  fontSize: 14,
  minHeight: 80,
  width: "100%",
  margin: 0,
  padding: 12,
  background: "transparent",
  color: "rgba(255,255,255,0.9)",
  outline: "none",
};

export function CodeEditor({
  value,
  onChange,
  placeholder = "Código da variante...",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="code-block-prism rounded-[8px] w-full min-h-[80px] bg-[#1c1c1c] border border-[rgba(255,255,255,0.08)]">
      <Editor
        value={value}
        onValueChange={onChange}
        highlight={(code) => highlightCode(code)}
        placeholder={placeholder}
        padding={12}
        tabSize={2}
        insertSpaces
        style={editorStyle}
        textareaClassName="focus:outline-none"
        preClassName="m-0"
      />
    </div>
  );
}
