/**
 * Output formatters for different types of thinking processes.
 * These help structure the output in a consistent, readable format.
 */

/**
 * Format a general reasoning process
 * 
 * @param content - The reasoning content
 * @param metadata - Optional metadata about the reasoning
 * @returns Formatted markdown string
 */
export function formatGeneralReasoning(
  content: string,
  metadata: {
    title?: string;
    step?: number;
    totalSteps?: number;
    category?: string;
    context?: string;
    hasReflection?: boolean;
    hasResearch?: boolean;
  } = {}
): string {
  const title = metadata.title || 'Structured Reasoning';
  const stepInfo = metadata.step && metadata.totalSteps ? 
    ` (Step ${metadata.step}/${metadata.totalSteps})` : '';
  const categoryInfo = metadata.category ? 
    `Category: ${metadata.category}` : '';
  const contextInfo = metadata.context ? 
    `Context: ${metadata.context}` : '';
  
  // Determine if content already has sections
  const hasExplicitSections = /^##\s+/m.test(content);
  
  // If content doesn't have sections and isn't short, try to add them
  const contentWithSections = !hasExplicitSections && content.length > 500 ?
    addDefaultSections(content) : content;
  
  let output = `# ${title}${stepInfo}\n\n`;
  
  // Add metadata section if we have metadata
  if (categoryInfo || contextInfo) {
    output += '## Metadata\n\n';
    if (categoryInfo) output += `- ${categoryInfo}\n`;
    if (contextInfo) output += `- ${contextInfo}\n`;
    output += '\n';
  }
  
  // Add features section if applicable
  if (metadata.hasReflection || metadata.hasResearch) {
    output += '## Features\n\n';
    if (metadata.hasReflection) output += '- Includes self-reflection analysis\n';
    if (metadata.hasResearch) output += '- Includes integrated research\n';
    output += '\n';
  }
  
  // Add the main content
  output += contentWithSections;
  
  return output;
}

/**
 * Format a problem-solving process
 * 
 * @param content - The reasoning content
 * @param metadata - Optional metadata about the reasoning
 * @returns Formatted markdown string
 */
export function formatProblemSolving(
  content: string,
  metadata: {
    problem?: string;
    step?: number;
    totalSteps?: number;
    context?: string;
  } = {}
): string {
  const problemStatement = metadata.problem || 'Problem Analysis';
  const stepInfo = metadata.step && metadata.totalSteps ? 
    ` (Step ${metadata.step}/${metadata.totalSteps})` : '';
    
  let output = `# ${problemStatement}${stepInfo}\n\n`;
  
  if (metadata.context) {
    output += `## Context\n\n${metadata.context}\n\n`;
  }
  
  // Check if content already has explicit sections
  if (/^##\s+/m.test(content)) {
    // If it does, just append it
    output += content;
  } else {
    // Otherwise, try to structure it
    output += '## Problem Definition\n\n';
    
    // Extract the first paragraph as the problem definition
    const firstParagraph = content.split('\n\n')[0];
    output += `${firstParagraph}\n\n`;
    
    // Rest of the content split into Analysis and Solution
    const remainingContent = content.replace(firstParagraph, '').trim();
    
    if (remainingContent) {
      // Split remaining content roughly in half
      const midpoint = Math.floor(remainingContent.length / 2);
      const analysisBreakpoint = remainingContent.indexOf('\n\n', midpoint);
      
      if (analysisBreakpoint !== -1 && analysisBreakpoint < remainingContent.length - 100) {
        // If we can find a good splitting point
        const analysis = remainingContent.substring(0, analysisBreakpoint);
        const solution = remainingContent.substring(analysisBreakpoint).trim();
        
        output += '## Analysis\n\n' + analysis + '\n\n';
        output += '## Solution\n\n' + solution;
      } else {
        // Just append the rest as Analysis
        output += '## Analysis\n\n' + remainingContent;
      }
    }
  }
  
  return output;
}

/**
 * Format a comparative analysis
 * 
 * @param content - The reasoning content
 * @param metadata - Optional metadata about the reasoning 
 * @returns Formatted markdown string
 */
export function formatComparison(
  content: string,
  metadata: {
    title?: string;
    options?: string[];
    context?: string;
  } = {}
): string {
  const title = metadata.title || 'Comparative Analysis';
  
  let output = `# ${title}\n\n`;
  
  if (metadata.context) {
    output += `## Context\n\n${metadata.context}\n\n`;
  }
  
  // If options are explicitly provided, list them
  if (metadata.options && metadata.options.length > 0) {
    output += '## Options Considered\n\n';
    for (const option of metadata.options) {
      output += `- ${option}\n`;
    }
    output += '\n';
  }
  
  // Check if content already has explicit sections
  if (/^##\s+/m.test(content)) {
    // If it does, just append it
    output += content;
  } else {
    // Try to detect comparison table
    if (content.includes('|') && content.includes('-|-')) {
      // Content has a table, so keep it intact
      output += '## Comparison\n\n' + content;
    } else {
      // Split content into sections
      output += '## Comparison\n\n' + content;
    }
  }
  
  return output;
}

/**
 * Add default sections to unstructured content
 * 
 * @param content - The unstructured content
 * @returns Content with added section headers
 */
function addDefaultSections(content: string): string {
  // Split content into paragraphs
  const paragraphs = content.split('\n\n').filter(p => p.trim());
  
  if (paragraphs.length <= 3) {
    // Too short to meaningfully section
    return content;
  }
  
  // First paragraph is usually introduction
  let output = '## Introduction\n\n' + paragraphs[0] + '\n\n';
  
  // Middle paragraphs are analysis
  const middleParagraphs = paragraphs.slice(1, paragraphs.length - 1);
  output += '## Analysis\n\n' + middleParagraphs.join('\n\n') + '\n\n';
  
  // Last paragraph is usually conclusion
  output += '## Conclusion\n\n' + paragraphs[paragraphs.length - 1];
  
  return output;
}

/**
 * Detect the most appropriate formatter based on content
 * 
 * @param content - The reasoning content
 * @returns The name of the most appropriate formatter
 */
export function detectFormatterType(content: string): 'general' | 'problem' | 'comparison' {
  // Check for comparison indicators
  const hasComparisonTable = content.includes('|') && content.includes('-|-');
  const hasVsWords = /\b(vs|versus|compared to|as opposed to)\b/i.test(content);
  const hasAdvantagesDisadvantages = /\b(advantages|disadvantages|pros|cons|benefits|drawbacks)\b/i.test(content);
  
  if ((hasComparisonTable || (hasVsWords && hasAdvantagesDisadvantages)) &&
      !content.toLowerCase().includes('problem')) {
    return 'comparison';
  }
  
  // Check for problem-solving indicators
  const hasProblemWords = /\b(problem|issue|challenge|solution|solve)\b/i.test(content);
  const hasSteps = /\b(step \d|steps|approach|method)\b/i.test(content);
  
  if (hasProblemWords && (hasSteps || content.includes('?'))) {
    return 'problem';
  }
  
  // Default to general reasoning
  return 'general';
}

/**
 * Main formatter function that detects type and applies appropriate formatting
 * 
 * @param content - The reasoning content
 * @param metadata - Optional metadata
 * @returns Formatted markdown
 */
export function formatThought(
  content: string,
  metadata: Record<string, any> = {}
): string {
  const type = metadata.type || detectFormatterType(content);
  
  switch (type) {
    case 'problem':
      return formatProblemSolving(content, metadata);
    case 'comparison':
      return formatComparison(content, metadata);
    case 'general':
    default:
      return formatGeneralReasoning(content, metadata);
  }
} 