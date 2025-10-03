/* 
 * Fixed YAML content alignment issue in HelmChartDetail component
 * Problem: YAML content was appearing centered instead of left-aligned
 * Solution: Added explicit left-alignment classes and block display
 */

// Before:
<div className="bg-gray-800 rounded-lg overflow-hidden">
  <pre className="text-gray-100 text-sm p-4 overflow-auto max-h-96">
    <code>{chart.values}</code>
  </pre>
</div>

// After:
<div className="bg-gray-800 rounded-lg overflow-hidden">
  <pre className="text-gray-100 text-sm p-4 overflow-auto max-h-96 whitespace-pre overflow-x-auto text-left !text-left">
    <code className="block text-left !text-left">{chart.values}</code>
  </pre>
</div>

/*
 * Key changes made:
 * 1. Added 'whitespace-pre' to preserve formatting
 * 2. Added 'text-left' and '!text-left' to ensure left alignment
 * 3. Added 'block' display to the code element
 * 4. Added 'overflow-x-auto' for horizontal scrolling when needed
 */