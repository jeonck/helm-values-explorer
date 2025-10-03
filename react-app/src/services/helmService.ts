// services/helmService.ts
import type { HelmChart } from '../types';
import { parse } from 'yaml';

// Service to interact with fetched Helm chart data
export class HelmService {
  static async searchCharts(searchTerm: string = ''): Promise<HelmChart[]> {
    try {
      // Try to fetch the chart index to get list of chart files
      const indexResponse = await fetch('./data/charts/index.json');
      if (!indexResponse.ok) {
        throw new Error(`HTTP error! status: ${indexResponse.status}`);
      }
      const chartFiles: string[] = await indexResponse.json();
      
      // Fetch all chart data
      const chartPromises = chartFiles.map(async (fileName) => {
        try {
          const response = await fetch(`./data/charts/${fileName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          return response.json();
        } catch (error) {
          console.error(`Error fetching chart file ${fileName}:`, error);
          return null;
        }
      });
      
      const chartResults = await Promise.all(chartPromises);
      const charts: HelmChart[] = chartResults.filter(chart => chart !== null);
      
      if (!searchTerm) return charts;
      
      return charts.filter(chart => 
        chart.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        chart.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error fetching charts:', error);
      // Return empty array if there's an error
      return [];
    }
  }

  static async getChartByName(repo: string, name: string): Promise<HelmChart | null> {
    try {
      // Try to fetch the chart index to get list of chart files
      const indexResponse = await fetch('./data/charts/index.json');
      if (!indexResponse.ok) {
        throw new Error(`HTTP error! status: ${indexResponse.status}`);
      }
      const chartFiles: string[] = await indexResponse.json();
      
      // Look for the specific chart
      for (const fileName of chartFiles) {
        try {
          const response = await fetch(`./data/charts/${fileName}`);
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const chart: HelmChart = await response.json();
          
          if (chart.repo === repo && chart.name === name) {
            return chart;
          }
        } catch (error) {
          console.error(`Error fetching chart file ${fileName}:`, error);
          continue;
        }
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching chart:', error);
      return null;
    }
  }

  // This method would be used by the backend for automated fetching
  static async fetchChartValuesFromRepo(repo: string, chartName: string, version?: string): Promise<string> {
    console.log(`Fetching chart: ${repo}/${chartName}${version ? `@${version}` : ''}`);
    
    // In a real implementation, this would actually fetch from the Helm repository
    // The implementation would:
    // 1. Fetch the index.yaml file from the repository
    // 2. Find the chart with the specified name/version
    // 3. Download the chart package (tgz file)
    // 4. Extract the values.yaml file from the package
    // 5. Return the content as a string
    
    return '# Values content would be fetched from the repository';
  }
  
  // Method to validate YAML content
  static validateYaml(yamlContent: string): boolean {
    try {
      parse(yamlContent);
      return true;
    } catch (e) {
      console.error('Invalid YAML:', e);
      return false;
    }
  }
}