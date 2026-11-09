import type { ReactNode } from 'react';

export interface MentionTextProps {
  text: string;
  className?: string;
}

/** 将正文中的 @昵称高亮显示（D4 / I2-02） */
export function MentionText({ text, className = '' }: MentionTextProps) {
  if (!text) return null;
  const nodes: ReactNode[] = [];
  const re = /@\S+/g;
  let last = 0;
  let match: RegExpExecArray | null;
  let key = 0;
  while ((match = re.exec(text)) !== null) {
    if (match.index > last) {
      nodes.push(text.slice(last, match.index));
    }
    nodes.push(
      <span key={`m-${key++}`} className="mention-token text-primary-text font-medium">
        {match[0]}
      </span>,
    );
    last = match.index + match[0].length;
  }
  if (last < text.length) nodes.push(text.slice(last));
  return <span className={className}>{nodes}</span>;
}
