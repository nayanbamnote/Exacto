import { Element } from '@/store/useElementStore';

export interface CSSGenerationOptions {
  usePixels: boolean;  // true for px values, false for % values
  includeComments: boolean;
  formatOutput: boolean;
  includePrefix: boolean;
  prefix: string;
}

export const defaultCSSOptions: CSSGenerationOptions = {
  usePixels: true,
  includeComments: true,
  formatOutput: true,
  includePrefix: false,
  prefix: 'element'
};

/**
 * Generates a CSS selector for an element
 */
export const generateSelector = (
  element: Element, 
  options: CSSGenerationOptions,
  elements: Element[]
): string => {
  // Basic selector is the element type
  let selector = element.type;
  const shortId = element.id.split('-').pop() || '';
  
  // Create a consistent class name that will match our HTML
  const className = `element-${element.type}-${shortId}`;
  
  // Add an id or class prefix if needed
  if (options.includePrefix) {
    // Use the element ID without the "element-" prefix and timestamp
    if (options.prefix.startsWith('#')) {
      // ID selector
      selector = `${options.prefix}${shortId}`;
    } else if (options.prefix.startsWith('.')) {
      // Class selector
      selector = `${element.type}${options.prefix}${shortId}`;
    } else {
      // Default class selector with prefix
      selector = `${element.type}.${options.prefix}-${shortId}`;
    }
  } else {
    // When no prefix is provided, use the consistent class name
    selector = `${element.type}.${className}`;
  }
  
  // If element has a parent, we should include the parent in the selector
  if (element.parentId) {
    const parent = elements.find(el => el.id === element.parentId);
    if (parent) {
      const parentSelector = generateSelector(parent, options, elements);
      selector = `${parentSelector} > ${selector}`;
    }
  }
  
  return selector;
};

/**
 * Generates CSS for a single element
 */
export const generateElementCSS = (
  element: Element, 
  options: CSSGenerationOptions,
  parentElement?: Element,
  elements: Element[] = []
): string => {
  const selector = generateSelector(element, options, elements);
  const position = element.style?.position || 'absolute';
  const indent = options.formatOutput ? '  ' : '';
  const newline = options.formatOutput ? '\n' : '';
  
  let css = `${selector} {${newline}`;
  css += `${indent}position: ${position};${newline}`;
  
  // For absolute positioning
  if (position === 'absolute') {
    if (options.usePixels) {
      css += `${indent}left: ${element.x}px;${newline}`;
      css += `${indent}top: ${element.y}px;${newline}`;
    } else {
      // Calculate percentage values relative to parent
      const parentWidth = parentElement?.width || 1200; // Default canvas width
      const parentHeight = parentElement?.height || 800; // Default canvas height
      
      const leftPercent = (element.x / parentWidth) * 100;
      const topPercent = (element.y / parentHeight) * 100;
      
      css += `${indent}left: ${leftPercent.toFixed(2)}%;${newline}`;
      css += `${indent}top: ${topPercent.toFixed(2)}%;${newline}`;
    }
  } else if (position === 'relative') {
    if (element.x !== 0 || element.y !== 0) {
      if (options.usePixels) {
        css += `${indent}left: ${element.x}px;${newline}`;
        css += `${indent}top: ${element.y}px;${newline}`;
      } else {
        // For relative positioning, we still use pixels by default
        // But we could use percentages if needed
        css += `${indent}left: ${element.x}px;${newline}`;
        css += `${indent}top: ${element.y}px;${newline}`;
      }
    }
  }
  
  // Size
  if (options.usePixels) {
    css += `${indent}width: ${element.width}px;${newline}`;
    css += `${indent}height: ${element.height}px;${newline}`;
  } else {
    // Calculate percentage values
    const parentWidth = parentElement?.width || 1200;
    const parentHeight = parentElement?.height || 800;
    
    const widthPercent = (element.width / parentWidth) * 100;
    const heightPercent = (element.height / parentHeight) * 100;
    
    css += `${indent}width: ${widthPercent.toFixed(2)}%;${newline}`;
    css += `${indent}height: ${heightPercent.toFixed(2)}%;${newline}`;
  }
  
  // Z-index
  if (element.zIndex) {
    css += `${indent}z-index: ${element.zIndex};${newline}`;
  }
  
  // Rotation
  if (element.rotation && element.rotation !== 0) {
    css += `${indent}transform: rotate(${element.rotation}deg);${newline}`;
  }
  
  // Additional styles from the element
  if (element.style) {
    // Skip position as we already included it
    // Also skip flex-related properties and padding since we're using absolute positioning
    const stylesToSkip = [
      'position',
      'display',
      'alignItems',
      'justifyContent',
      'padding'
    ];
    
    Object.entries(element.style).forEach(([key, value]) => {
      if (!stylesToSkip.includes(key)) {
        // Convert camelCase to kebab-case for CSS properties
        const cssKey = key.replace(/([A-Z])/g, '-$1').toLowerCase();
        css += `${indent}${cssKey}: ${value};${newline}`;
      }
    });
  }
  
  css += `}${newline}`;
  
  // Add comment if needed
  if (options.includeComments) {
    const comment = `/* ${element.type} element - ID: ${element.id.split('-').pop()} */`;
    css = `${comment}${newline}${css}`;
  }
  
  return css;
};

/**
 * Recursively generates CSS for an element and its children
 */
export const generateElementAndChildrenCSS = (
  element: Element,
  elements: Element[],
  options: CSSGenerationOptions,
  parentElement?: Element
): string => {
  // Find the parent of this element
  const parent = element.parentId 
    ? elements.find(el => el.id === element.parentId)
    : undefined;
  
  // Generate CSS for this element
  let css = generateElementCSS(element, options, parent, elements);
  
  // Get all children of this element
  const children = elements.filter(el => el.parentId === element.id);
  
  // Generate CSS for each child
  if (children.length > 0) {
    css += options.formatOutput ? '\n' : '';
    children.forEach(child => {
      css += generateElementAndChildrenCSS(child, elements, options, element);
    });
  }
  
  return css;
};

/**
 * Main function to generate CSS for all elements in the store
 */
export const generateCSS = (
  elements: Element[],
  options: CSSGenerationOptions = defaultCSSOptions
): string => {
  // Get only root elements (elements without parent)
  const rootElements = elements.filter(el => !el.parentId);
  
  let css = '';
  
  // Generate a header comment
  if (options.includeComments) {
    css += '/* CSS Generated by Absolute Positioning CSS Generator Tool */\n';
    css += '/* Created on: ' + new Date().toLocaleString() + ' */\n\n';
  }
  
  // Generate CSS for each root element and its children
  rootElements.forEach(element => {
    css += generateElementAndChildrenCSS(element, elements, options);
    css += options.formatOutput ? '\n' : '';
  });
  
  return css;
};

/**
 * Generate HTML structure with CSS classes/IDs for the elements
 */
export const generateHTML = (
  elements: Element[],
  options: CSSGenerationOptions
): string => {
  // Get only root elements (elements without parent)
  const rootElements = elements.filter(el => !el.parentId);
  
  const indent = options.formatOutput ? '  ' : '';
  const newline = options.formatOutput ? '\n' : '';
  
  const generateElementHTML = (element: Element, depth: number = 0, allElements: Element[] = []): string => {
    const elementIndent = indent.repeat(depth);
    const shortId = element.id.split('-').pop() || '';
    
    // Create a simpler class name for HTML display
    let className = `element-${element.type}-${shortId}`;
    let attributes = `class="${className}"`;
    
    // Generate opening tag
    let html = `${elementIndent}<${element.type} ${attributes}>${newline}`;
    
    // Add content if present
    if (element.content) {
      html += `${elementIndent}${indent}${element.content}${newline}`;
    }
    
    // Get children and generate their HTML
    const children = elements.filter(el => el.parentId === element.id);
    children.forEach(child => {
      html += generateElementHTML(child, depth + 1, allElements);
    });
    
    // Close tag
    html += `${elementIndent}</${element.type}>${newline}`;
    
    return html;
  };
  
  let html = '';
  
  // Add a distinctive header for the HTML tab
  html += '<!-- HTML STRUCTURE TAB -->\n';
  html += '<!-- This is the HTML structure with element classes -->\n';
  html += '<!-- Use this with the CSS code from the CSS tab -->\n\n';
  
  // Add a header comment if enabled in options
  if (options.includeComments) {
    html += '<!-- HTML Generated by Absolute Positioning CSS Generator Tool -->\n';
    html += '<!-- Created on: ' + new Date().toLocaleString() + ' -->\n\n';
  }
  
  // Generate HTML for each root element
  rootElements.forEach(element => {
    html += generateElementHTML(element, 0, elements);
  });
  
  return html;
};

/**
 * Generate combined HTML and CSS
 */
export const generateCombinedCode = (
  elements: Element[],
  options: CSSGenerationOptions
): string => {
  // Generate the CSS content
  const css = generateCSS(elements, options);
  
  // Create the HTML content with internal CSS
  let combined = '<!DOCTYPE html>\n';
  combined += '<html lang="en">\n';
  combined += '<head>\n';
  combined += '  <meta charset="UTF-8">\n';
  combined += '  <meta name="viewport" content="width=device-width, initial-scale=1.0">\n';
  combined += '  <title>Generated Layout</title>\n';
  
  // Add internal CSS in style tags
  combined += '  <!-- Internal CSS styles - ready to use immediately -->\n';
  combined += '  <style>\n';
  
  // Add the CSS content with proper indentation
  const indentedCss = css.split('\n').map(line => `    ${line}`).join('\n');
  combined += indentedCss;
  
  combined += '\n  </style>\n';
  
  // Add a comment explaining this is a combined view
  combined += '  <!-- \n';
  combined += '    COMBINED VIEW: \n';
  combined += '    This HTML includes all CSS styles internally, so you can copy and\n';
  combined += '    paste this complete code into a single file to see the result immediately.\n';
  combined += '  -->\n';
  
  combined += '</head>\n';
  combined += '<body>\n\n';
  
  // Extract just the HTML structure without the comments
  const html = generateHTML(elements, options)
    .replace('<!-- HTML STRUCTURE TAB -->\n', '')
    .replace('<!-- This is the HTML structure with element classes -->\n', '')
    .replace('<!-- Use this with the CSS code from the CSS tab -->\n\n', '');
  
  // Add HTML with additional indentation (indent each line)
  const indentedHtml = html.split('\n').map(line => `  ${line}`).join('\n');
  combined += indentedHtml;
  
  combined += '\n</body>\n';
  combined += '</html>';
  
  return combined;
};

/**
 * Generate CSS file content (for external CSS)
 */
export const generateCSSFile = (
  elements: Element[],
  options: CSSGenerationOptions
): string => {
  let cssContent = '';
  
  // Add a distinctive header for the CSS tab
  cssContent += '/* CSS STYLES TAB */\n';
  cssContent += '/* This is the content for the standalone CSS file (styles.css) */\n';
  cssContent += '/* Save this code as "styles.css" to use with your HTML */\n\n';
  
  // Get the standard CSS content
  cssContent += generateCSS(elements, options);
  
  return cssContent;
}; 