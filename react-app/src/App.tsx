import { useState } from 'react';
import { HelmChartList } from './components/HelmChartList';
import { HelmChartDetail } from './components/HelmChartDetail';
import type { HelmChart } from './types';
import './App.css';

function App() {
  const [selectedChart, setSelectedChart] = useState<HelmChart | null>(null);

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
          <div className="lg:w-1/3">
            <HelmChartList 
              onSelectChart={setSelectedChart} 
              isLoading={false}
              selectedChart={selectedChart}
            />
          </div>
          <div className="lg:w-2/3">
            <HelmChartDetail chart={selectedChart} isLoading={false} />
          </div>
        </div>
      </main>
    </div>
  )
}

export default App
