export interface HelmChart {
  name: string;
  repo: string;
  description: string;
  version: string;
  appVersion: string;
  values: string; // Raw YAML content
  url: string; // URL to the chart
  createdAt: string;
}

export interface HelmChartCategory {
  id: string;
  name: string;
  description: string;
}