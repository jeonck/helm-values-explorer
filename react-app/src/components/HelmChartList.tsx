import React, { useState, useEffect } from 'react';
import type { HelmChart, HelmChartCategory } from '../types';
import { HelmService } from '../services/helmService';

const categories: HelmChartCategory[] = [
  { id: 'all', name: 'All Charts', description: 'All available Helm charts' },
  { id: 'databases', name: 'Databases', description: 'Database Helm charts' },
  { id: 'messaging', name: 'Messaging & Streaming', description: 'Message brokers and streaming platforms' },
  { id: 'analytics', name: 'Analytics & OLAP', description: 'Analytics and OLAP datastore solutions' },
  { id: 'monitoring', name: 'Monitoring', description: 'Monitoring and observability tools' },
  { id: 'ingress', name: 'Ingress Controllers', description: 'Ingress and load balancing solutions' },
  { id: 'gitops', name: 'GitOps Tools', description: 'GitOps and continuous delivery tools' },
  { id: 'security', name: 'Security', description: 'Security-related solutions' },
];

interface HelmChartListProps {
  onSelectChart: (chart: HelmChart | null) => void;
  isLoading: boolean;
  selectedChart: HelmChart | null;
}

export const HelmChartList: React.FC<HelmChartListProps> = ({ 
  onSelectChart, 
  isLoading, 
  selectedChart 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [charts, setCharts] = useState<HelmChart[]>([]);

  useEffect(() => {
    const fetchCharts = async () => {
      try {
        const fetchedCharts = await HelmService.searchCharts();
        setCharts(fetchedCharts);
      } catch (error) {
        console.error('Error fetching charts:', error);
        // Fallback to empty array
        setCharts([]);
      }
    };

    fetchCharts();
  }, []);

  const filteredCharts = charts.filter(chart => {
    const matchesSearch = chart.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          chart.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || 
                           (selectedCategory === 'databases' && ['redis', 'mongodb', 'postgresql'].includes(chart.name)) ||
                           (selectedCategory === 'messaging' && (['kafka'].includes(chart.name) || chart.name.toLowerCase().includes('kafka'))) ||
                           (selectedCategory === 'analytics' && (['pinot'].includes(chart.name) || chart.name.toLowerCase().includes('pinot'))) ||
                           (selectedCategory === 'monitoring' && ['prometheus'].includes(chart.name)) ||
                           (selectedCategory === 'ingress' && ['nginx-ingress'].includes(chart.name)) ||
                           (selectedCategory === 'gitops' && (chart.name.toLowerCase().includes('argo') || chart.name.toLowerCase().includes('argocd')));
                           
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="bg-white rounded-lg shadow p-4 h-full">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Helm Charts</h2>
      
      {/* Search and Filter Section */}
      <div className="mb-6">
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search charts..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-3 py-1 text-sm rounded-full ${
                selectedCategory === category.id
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Charts List */}
      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="space-y-3 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
          {filteredCharts.length > 0 ? (
            filteredCharts.map(chart => (
              <div
                key={`${chart.repo}/${chart.name}`}
                className={`p-3 border rounded-lg cursor-pointer transition-all ${
                  selectedChart?.name === chart.name && selectedChart?.repo === chart.repo
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                }`}
                onClick={() => onSelectChart(chart)}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-semibold text-gray-800">{chart.name}</h3>
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    {chart.version}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{chart.description}</p>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-500">{chart.repo}</span>
                  <span className="text-xs text-gray-500">{chart.appVersion}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-gray-500">
              No charts found matching your criteria
            </div>
          )}
        </div>
      )}
    </div>
  );
};