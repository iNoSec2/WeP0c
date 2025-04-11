'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Copy, Check } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import hljs from 'highlight.js';
import 'highlight.js/styles/github-dark.css';

interface CodeBlockProps {
  code: string;
  language: string;
  showLineNumbers?: boolean;
  className?: string;
}

export const CodeBlock: React.FC<CodeBlockProps> = ({
  code,
  language,
  showLineNumbers = true,
  className = '',
}) => {
  const { toast } = useToast();
  const [copied, setCopied] = useState(false);

  // Map common language aliases to highlight.js supported languages
  const languageMap: Record<string, string> = {
    'py': 'python',
    'js': 'javascript',
    'ts': 'typescript',
    'sh': 'bash',
    'bash': 'bash',
    'shell': 'bash',
    'json': 'json',
    'html': 'html',
    'css': 'css',
    'go': 'go',
    'rust': 'rust',
    'c': 'c',
    'cpp': 'cpp',
    'java': 'java',
    'php': 'php',
    'ruby': 'ruby',
    'sql': 'sql',
    'yaml': 'yaml',
    'xml': 'xml',
  };

  // Normalize language for highlighting
  const normalizedLanguage = languageMap[language.toLowerCase()] || language.toLowerCase();
  
  // Display language name
  const displayLanguage = language.toUpperCase();

  // Highlight the code
  let highlightedCode = code;
  try {
    if (hljs.getLanguage(normalizedLanguage)) {
      highlightedCode = hljs.highlight(code, { language: normalizedLanguage }).value;
    }
  } catch (error) {
    console.error('Error highlighting code:', error);
  }

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: 'Copied to clipboard',
      description: 'The code has been copied to your clipboard.',
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative group ${className}`}>
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
      
      {showLineNumbers ? (
        <div className="flex overflow-x-auto">
          <div className="min-w-[40px] text-right pr-4 select-none text-muted-foreground/50 bg-muted/50 pt-4 pb-4">
            {code.split('\n').map((_, i) => (
              <div key={i} className="text-xs leading-5 px-2">
                {i + 1}
              </div>
            ))}
          </div>
          <pre className="overflow-x-auto p-4 rounded-r-lg bg-muted text-sm flex-1">
            <code 
              className={`language-${normalizedLanguage}`}
              dangerouslySetInnerHTML={{ __html: highlightedCode }}
            />
          </pre>
        </div>
      ) : (
        <pre className="overflow-x-auto p-4 rounded-lg bg-muted text-sm">
          <code 
            className={`language-${normalizedLanguage}`}
            dangerouslySetInnerHTML={{ __html: highlightedCode }}
          />
        </pre>
      )}
    </div>
  );
};

export default CodeBlock;
