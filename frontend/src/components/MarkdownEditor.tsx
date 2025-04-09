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
import { Copy } from 'lucide-react';

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
          syncScrollMode: true,
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
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '');
            return !inline && match ? (
              <div className="relative group">
                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(String(children).replace(/\n$/, ''));
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
                <pre className={cn("p-4 rounded-lg bg-muted", className)} {...props}>
                  <code className={className}>
                    {String(children).replace(/\n$/, '')}
                  </code>
                </pre>
              </div>
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
