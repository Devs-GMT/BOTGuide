import { Fragment, type ReactNode } from "react";

const KEYWORDS =
  /^(module|exports|const|let|import|from|await|async|new|console|process|require|function|return|pragma|contract|public|forge|cast|npm|npx|install)$/;

/** Tiny token colouring for the short snippets BOTGuide shows. Not a real parser. */
export function highlight(code: string): ReactNode[] {
  return code.split("\n").map((line, li) => {
    const trimmed = line.trimStart();
    if (trimmed.startsWith("//") || trimmed.startsWith("#")) {
      return (
        <Fragment key={li}>
          <span className="tok-c">{line}</span>
          {"\n"}
        </Fragment>
      );
    }
    const parts = line.split(/("[^"]*"|'[^']*'|\b\d+\b|\b[A-Za-z_]+\b)/g);
    return (
      <Fragment key={li}>
        {parts.map((p, i) => {
          if (/^["']/.test(p)) return <span key={i} className="tok-s">{p}</span>;
          if (/^\d+$/.test(p)) return <span key={i} className="tok-s">{p}</span>;
          if (KEYWORDS.test(p)) return <span key={i} className="tok-k">{p}</span>;
          if (/^(create|run|deploy)$/.test(p)) return <span key={i} className="tok-f">{p}</span>;
          return <Fragment key={i}>{p}</Fragment>;
        })}
        {"\n"}
      </Fragment>
    );
  });
}
