'use client'
import React, { useEffect, useRef, useState } from 'react';
import Prism from 'prismjs';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-markup';
import 'prismjs/themes/prism-tomorrow.css';

interface CodeViewerProps {
  code: string;
  language: 'css' | 'html' | 'combined';
}

const CodeViewer: React.FC<CodeViewerProps> = ({ code, language }) => {
  const codeRef = useRef<HTMLPreElement>(null);
  // State to track if highlighting fails
  const [highlightFailed, setHighlightFailed] = useState(false);

  useEffect(() => {
    console.log(`CodeViewer: Rendering ${language} tab content`);
    console.log(`Code begins with: ${code.substring(0, 50)}`);
    
    if (codeRef.current) {
      try {
        // Determine which language to use for Prism
        let langClass = 'language-css';
        
        if (language === 'html' || language === 'combined') {
          langClass = 'language-markup';
        }

        // Apply the language class
        codeRef.current.className = `${langClass} rounded-md`;
        
        // Highlight the code
        Prism.highlightElement(codeRef.current);
        setHighlightFailed(false);
      } catch (error) {
        console.error('Syntax highlighting failed:', error);
        setHighlightFailed(true);
      }
    }
  }, [code, language]);

  // Generate a unique badge for each tab type to easily identify content
  const getBadge = () => {
    switch (language) {
      case 'css':
        return <span className="bg-blue-500 text-white px-2 py-0.5 rounded text-xs">CSS</span>;
      case 'html':
        return <span className="bg-green-500 text-white px-2 py-0.5 rounded text-xs">HTML</span>;
      case 'combined':
        return <span className="bg-purple-500 text-white px-2 py-0.5 rounded text-xs">COMBINED</span>;
      default:
        return null;
    }
  };

  return (
    <div>
      {/* Add visual indicator of current tab type */}
      <div className="text-xs text-gray-400 mb-2 flex items-center space-x-2">
        {getBadge()}
        <span className="italic">
          {language === 'css' && 'CSS Tab - External stylesheet content'}
          {language === 'html' && 'HTML Tab - HTML structure with classes'}
          {language === 'combined' && 'Combined Tab - Ready-to-use HTML with internal CSS styles'}
        </span>
      </div>
      
      {highlightFailed ? (
        // Fallback display if highlighting fails
        <div className="bg-gray-800 p-3 rounded-md whitespace-pre overflow-auto text-white font-mono text-sm">
          {code}
        </div>
      ) : (
        <pre ref={codeRef} className={`language-${language === 'html' || language === 'combined' ? 'markup' : 'css'} rounded-md`}>
          <code className={`language-${language === 'html' || language === 'combined' ? 'markup' : 'css'}`}>
            {code}
          </code>
        </pre>
      )}
    </div>
  );
};

export default CodeViewer; 