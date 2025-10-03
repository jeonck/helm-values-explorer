// services/helmService.ts
import type { HelmChart } from '../types';
import { parse } from 'yaml';

// Service to interact with fetched Helm chart data
export class HelmService {
  static async searchCharts(searchTerm: string = ''): Promise<HelmChart[]> {
    try {
      // Fetch the chart data from the generated JSON file
      const response = await fetch('/data/charts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const charts: HelmChart[] = await response.json();
      
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
      // Fetch the chart data from the generated JSON file
      const response = await fetch('/data/charts.json');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const charts: HelmChart[] = await response.json();
      
      return charts.find(chart => chart.repo === repo && chart.name === name) || null;
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