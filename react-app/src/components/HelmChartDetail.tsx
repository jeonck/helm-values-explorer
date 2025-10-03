import React, { useEffect, useState } from 'react';
import type { HelmChart } from '../types';
import { parse } from 'yaml';
// import { HelmService } from '../services/helmService'; // Commenting out unused import

interface HelmChartDetailProps {
  chart: HelmChart | null;
  isLoading: boolean;
}

export const HelmChartDetail: React.FC<HelmChartDetailProps> = ({ chart: propChart, isLoading: propLoading }) => {
  const [chart, setChart] = useState<HelmChart | null>(propChart);
  const [isLoading, setIsLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  
  useEffect(() => {
    const fetchChartDetails = async () => {
      if (propChart) {
        setIsLoading(true);
        try {
          // In a real implementation, we would fetch the latest values from the Helm repository
          // For now, we'll use the passed chart data
          setChart(propChart);
        } catch (error) {
          console.error('Error fetching chart details:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setChart(null);
      }
    };

    fetchChartDetails();
  }, [propChart]);

  if (isLoading || propLoading) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-96 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chart) {
    return (
      <div className="bg-white rounded-lg shadow p-6 h-full flex items-center justify-center">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">Select a Helm chart</h3>
          <p className="mt-1 text-sm text-gray-500">
            Choose a chart from the list to view its values.yaml file
          </p>
        </div>
      </div>
    );
  }

  // Parse the YAML to validate it
  try {
    parse(chart.values);
  } catch (e) {
    console.error('Error parsing YAML:', e);
  }

  return (
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{chart.name}</h2>
            <p className="text-gray-600 mt-1">{chart.description}</p>
            <div className="flex items-center mt-3 space-x-4">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                {chart.repo}
              </span>
              <span className="text-sm text-gray-500">Version: {chart.version}</span>
              <span className="text-sm text-gray-500">App Version: {chart.appVersion}</span>
            </div>
          </div>
          <a
            href={chart.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">values.yaml</h3>
          <div className="flex space-x-2">
            <button 
              className={`inline-flex items-center px-3 py-1.5 border text-xs font-medium rounded text-gray-700 hover:bg-gray-50 ${
                copySuccess 
                  ? 'border-green-500 bg-green-50 text-green-700' 
                  : 'border-gray-300 bg-white'
              }`}
              onClick={async () => {
                try {
                  await navigator.clipboard.writeText(chart.values);
                  setCopySuccess(true);
                  setTimeout(() => setCopySuccess(false), 2000); // Reset after 2 seconds
                } catch (err) {
                  console.error('Failed to copy text: ', err);
                  // Optionally, you could set an error state here
                }
              }}
            >
              {copySuccess ? '✓ Copied!' : 'Copy'}
            </button>
            <button 
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
              onClick={() => {
                const blob = new Blob([chart.values], { type: 'application/yaml' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${chart.name}-values.yaml`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
              }}
            >
              Download
            </button>
          </div>
        </div>
        
        <div className="bg-gray-800 rounded-lg overflow-hidden">
          <pre className="text-gray-100 text-sm p-4 overflow-auto max-h-96 whitespace-pre overflow-x-auto text-left">
            <code className="text-left">{chart.values}</code>
          </pre>
        </div>
        
        <div className="mt-6 text-left">
          <h4 className="text-md font-medium text-gray-900 mb-2">How to use</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">To use this values file in your Helm installation:</p>
            <pre className="bg-gray-800 text-gray-100 p-3 rounded text-sm font-mono overflow-x-auto whitespace-pre">
              <code>
                {`# Add the repository
helm repo add ${chart.repo} https://charts.${chart.repo.replace('-', '.')}.io
helm repo update

# Install with default values
helm install my-release ${chart.repo}/${chart.name}

# Install with custom values
helm install my-release -f values.yaml ${chart.repo}/${chart.name}

# Common command used in practice for upgrades
helm upgrade my-release ${chart.repo}/${chart.name} -f values.yaml --install --namespace my-namespace --create-namespace

# Or download and inspect the chart first
helm show chart ${chart.repo}/${chart.name}
helm pull ${chart.repo}/${chart.name} --untar
# This creates a directory with the chart files which you can inspect and modify`}
              </code>
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};