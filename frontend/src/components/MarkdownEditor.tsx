'use client';

import React, { useState } from 'react';
import MarkdownIt from 'markdown-it';
import MdEditor from 'react-markdown-editor-lite';
import 'react-markdown-editor-lite/lib/index.css';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import 'highlight.js/styles/github-dark.css';
import hljs from 'highlight.js';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
  className?: string;
}

const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  height = '300px',
  placeholder = 'Write your content here...',
  className
}) => {
  const mdParser = new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    highlight: function (str, lang) {
      if (lang && hljs.getLanguage(lang)) {
        try {
          return hljs.highlight(str, { language: lang }).value;
        } catch (__) { }
      }
      return ''; // use external default escaping
    }
  });

  const handleEditorChange = ({ text }: { text: string }) => {
    onChange(text);
  };

  return (
    <div className={cn("markdown-editor rounded-lg border border-input bg-background", className)}>
      <MdEditor
        value={value}
        style={{ height }}
        renderHTML={(text) => mdParser.render(text)}
        onChange={handleEditorChange}
        placeholder={placeholder}
        config={{
          view: {
            menu: true,
            md: true,
            html: true,
            fullScreen: true,
            hideMenu: false,
          },
          canView: {
            menu: true,
            md: true,
            html: true,
            fullScreen: true,
            hideMenu: true,
          },
          table: {
            maxRow: 20,
            maxCol: 20,
          },
          imageUpload: false,
          imageAccept: '',
          linkUrl: '',
          linkOpenType: '_blank',
          codeFold: true,
          syncScrollMode: ['rightFollowLeft', 'leftFollowRight'],
          imageCaptions: true,
          imagePaste: false,
          shortcuts: true,
          theme: 'dark',
        }}
      />
    </div>
  );
};

export default MarkdownEditor;

export const MarkdownDisplay: React.FC<{ content: string; className?: string }> = ({ content, className }) => {
  return (
    <div className={cn("prose prose-sm max-w-none dark:prose-invert rounded-lg border border-input bg-background p-4", className)}>
      <ReactMarkdown
        rehypePlugins={[rehypeRaw, rehypeSanitize]}
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }: { node?: any; inline?: boolean; className?: string; children?: React.ReactNode; }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <CodeBlock language={match[1]} code={String(children).replace(/\n$/, '')} />
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

interface CodeBlockProps {
  language: string;
  code: string;
}

const CodeBlock: React.FC<CodeBlockProps> = ({ language, code }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({ description: "Code copied to clipboard" });

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  let displayLanguage = language;
  switch (language) {
    case 'js':
      displayLanguage = 'JavaScript';
      break;
    case 'ts':
      displayLanguage = 'TypeScript';
      break;
    case 'py':
      displayLanguage = 'Python';
      break;
    case 'rb':
      displayLanguage = 'Ruby';
      break;
    case 'java':
      displayLanguage = 'Java';
      break;
    case 'go':
      displayLanguage = 'Go';
      break;
    case 'rs':
      displayLanguage = 'Rust';
      break;
    case 'php':
      displayLanguage = 'PHP';
      break;
    case 'bash':
    case 'sh':
      displayLanguage = 'Shell';
      break;
    case 'html':
      displayLanguage = 'HTML';
      break;
    case 'css':
      displayLanguage = 'CSS';
      break;
    case 'jsx':
      displayLanguage = 'React JSX';
      break;
    case 'tsx':
      displayLanguage = 'React TSX';
      break;
    case 'json':
      displayLanguage = 'JSON';
      break;
    case 'md':
      displayLanguage = 'Markdown';
      break;
  }

  return (
    <div className="relative group">
      <div className="absolute right-2 top-2 flex gap-2">
        <span className="rounded bg-muted-foreground/20 px-2 py-1 text-xs font-medium text-muted-foreground">
          {displayLanguage}
        </span>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={handleCopy}
        >
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>
      <pre className="overflow-x-auto p-4 rounded-lg bg-muted text-sm">
        <code className={`language-${language}`}>
          {code}
        </code>
      </pre>
    </div>
  );
};
