/*
 * Fixed formatting for the "How to use" section in HelmChartDetail component
 * Problem: Command instructions were not properly formatted with line breaks
 * Solution: Changed to use pre element with proper formatting
 */

// Before:
<div className="mt-6">
  <h4 className="text-md font-medium text-gray-900 mb-2">How to use</h4>
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-gray-700 mb-2">To use this values file in your Helm installation:</p>
    <code className="block bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto">
      {`# Add the repository
helm repo add ${chart.repo} https://charts.${chart.repo.replace('-', '.')}.io
helm repo update

# Install with default values
helm install my-release ${chart.repo}/${chart.name}

# Install with custom values
helm install my-release -f values.yaml ${chart.repo}/${chart.name}`}
    </code>
  </div>
</div>

// After:
<div className="mt-6">
  <h4 className="text-md font-medium text-gray-900 mb-2">How to use</h4>
  <div className="bg-gray-50 p-4 rounded-lg">
    <p className="text-gray-700 mb-2">To use this values file in your Helm installation:</p>
    <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre text-left !text-left">
      <code className="block text-left !text-left">
        {`# Add the repository
helm repo add ${chart.repo} https://charts.${chart.repo.replace('-', '.')}.io
helm repo update

# Install with default values
helm install my-release ${chart.repo}/${chart.name}

# Install with custom values
helm install my-release -f values.yaml ${chart.repo}/${chart.name}`}
      </code>
    </pre>
  </div>
</div>

/*
 * Key changes made:
 * 1. Changed from code element to pre element to preserve line breaks
 * 2. Added 'whitespace-pre' to maintain formatting
 * 3. Added 'text-left' and '!text-left' to ensure left alignment
 * 4. Added 'block' display to the inner code element
 * 5. Properly formatted the template string with actual line breaks
 */