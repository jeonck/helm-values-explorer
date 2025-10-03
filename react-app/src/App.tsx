import { useState, useEffect } from 'react';
import { HelmChartList } from './components/HelmChartList';
import { HelmChartDetail } from './components/HelmChartDetail';
import type { HelmChart } from './types';
import { HelmService } from './services/helmService';
import './App.css';

function App() {
  const [selectedChart, setSelectedChart] = useState<HelmChart | null>(null);

  // Set default chart if no chart is selected
  useEffect(() => {
    const setDefaultChart = async () => {
      if (!selectedChart) {
        // First try to get nginx-ingress
        let defaultChart = await HelmService.getChartByName('ingress-nginx', 'nginx-ingress');
        if (!defaultChart) {
          // If nginx-ingress not found, try argo-cd
          defaultChart = await HelmService.getChartByName('argo', 'argo-cd');
        }
        
        if (!defaultChart) {
          // If neither found, get the first available chart
          const allCharts = await HelmService.searchCharts();
          if (allCharts.length > 0) {
            defaultChart = allCharts[0];
          }
        }
        
        if (defaultChart) {
          setSelectedChart(defaultChart);
        }
      }
    };
    
    setDefaultChart();
  }, [selectedChart]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Helm Values Explorer</h1>
          <p className="mt-2 text-gray-600">Browse and search values.yaml files for popular Helm charts</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-1/3">
            <HelmChartList 
              onSelectChart={setSelectedChart} 
              isLoading={false}
              selectedChart={selectedChart}
            />
          </div>
          <div className="w-full lg:w-2/3">
            <HelmChartDetail chart={selectedChart} isLoading={false} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
