// scripts/fetchHelmValues.js
// This script would run periodically to fetch and update values.yaml files from Helm repositories
// In a production implementation, this would run on a server or as a scheduled job

const fs = require('fs');
const path = require('path');
const axios = require('axios');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Configuration
const REPOSITORIES = {
  'bitnami': 'https://charts.bitnami.com/bitnami',
  'ingress-nginx': 'https://kubernetes.github.io/ingress-nginx',
  'prometheus-community': 'https://prometheus-community.github.io/helm-charts',
  'grafana': 'https://grafana.github.io/helm-charts',
  'jetstack': 'https://charts.jetstack.io',
  'argo': 'https://argoproj.github.io/argo-helm'
};

const CHARTS_TO_FETCH = [
  { name: 'fluentd', repo: 'fluent' },
  { name: 'opensearch', repo: 'opensearch' },
  { name: 'pinot', repo: 'apache' },
  { name: 'kafka', repo: 'bitnami' },
  { name: 'argo-cd', repo: 'argo' },
  { name: 'nginx-ingress', repo: 'ingress-nginx' },
  { name: 'redis', repo: 'bitnami' },
  { name: 'mongodb', repo: 'bitnami' },
  { name: 'postgresql', repo: 'bitnami' },
  { name: 'prometheus', repo: 'prometheus-community' },
  { name: 'airflow', repo: 'apache' },
  { name: 'minio', repo: 'minio' }
];

async function fetchIndexYaml(repoName, repoUrl) {
  try {
    const indexUrl = `${repoUrl}/index.yaml`;
    const response = await axios.get(indexUrl);
    return response.data;
  } catch (error) {
    console.error(`Error fetching index.yaml from ${repoUrl}:`, error.message);
    return null;
  }
}

async function downloadChart(chartUrl, chartName, version) {
  try {
    const tempDir = path.join(__dirname, '..', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }

    const chartFileName = `${chartName}-${version}.tgz`;
    const chartPath = path.join(tempDir, chartFileName);

    console.log(`Downloading chart: ${chartName} version ${version} from ${chartUrl}`);
    
    // Download the chart
    const response = await axios({
      method: 'GET',
      url: chartUrl,
      responseType: 'stream'
    });

    const writer = fs.createWriteStream(chartPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    return chartPath;
  } catch (error) {
    console.error(`Error downloading chart ${chartName} version ${version}:`, error.message);
    throw error;
  }
}

async function extractValuesYaml(chartPath, chartName, version) {
  try {
    const outputDir = path.join(__dirname, '..', 'data', chartName);
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Extract the chart using tar
    const extractedDir = path.join(outputDir, `${chartName}-${version}`);
    if (!fs.existsSync(extractedDir)) {
      fs.mkdirSync(extractedDir, { recursive: true });
    }

    await execAsync(`tar -xzf "${chartPath}" -C "${extractedDir}"`);

    // Read values.yaml
    const valuesPath = path.join(extractedDir, 'values.yaml');
    if (fs.existsSync(valuesPath)) {
      const valuesContent = fs.readFileSync(valuesPath, 'utf8');
      
      // Write to data directory
      const outputFilePath = path.join(outputDir, `values-${version}.yaml`);
      fs.writeFileSync(outputFilePath, valuesContent);
      
      console.log(`Successfully extracted values.yaml for ${chartName} version ${version}`);
      
      return valuesContent;
    } else {
      console.error(`values.yaml not found in chart ${chartName} version ${version}`);
      return null;
    }
  } catch (error) {
    console.error(`Error extracting values.yaml from chart ${chartName} version ${version}:`, error.message);
    throw error;
  }
}

async function fetchChartValues(chartInfo) {
  try {
    const { name, repo, repoName: explicitRepoName } = chartInfo;
    const repoUrl = REPOSITORIES[repo];
    if (!repoUrl) {
      console.error(`Repository ${repo} not found in configuration`);
      return null;
    }

    // Fetch the index.yaml to get chart information
    const indexData = await fetchIndexYaml(repo, repoUrl);
    if (!indexData) {
      console.error(`Could not fetch index.yaml for repository ${repo}`);
      return null;
    }

    // Find the chart and its latest version
    const chartData = indexData.entries[name];
    if (!chartData || chartData.length === 0) {
      console.error(`Chart ${name} not found in repository ${repo}`);
      return null;
    }

    // Get the latest version
    const latestVersion = chartData[0];
    console.log(`Found chart ${name}, latest version: ${latestVersion.version}`);

    // Find the download URL for this version
    const chartDownloadUrl = latestVersion.urls[0];
    if (!chartDownloadUrl) {
      console.error(`No download URL found for chart ${name} version ${latestVersion.version}`);
      return null;
    }

    // Ensure we have a complete URL
    let fullChartUrl;
    if (chartDownloadUrl.startsWith('http')) {
      fullChartUrl = chartDownloadUrl;
    } else {
      // Construct the full URL
      fullChartUrl = repoUrl.endsWith('/') ? `${repoUrl}${chartDownloadUrl}` : `${repoUrl}/${chartDownloadUrl}`;
    }

    // Download the chart
    const chartPath = await downloadChart(fullChartUrl, name, latestVersion.version);

    // Extract values.yaml
    const valuesContent = await extractValuesYaml(chartPath, name, latestVersion.version);

    // Clean up downloaded chart file
    fs.unlinkSync(chartPath);

    return {
      name,
      repo,
      description: latestVersion.description,
      version: latestVersion.version,
      appVersion: latestVersion.appVersion,
      values: valuesContent,
      url: latestVersion.home || latestVersion.sources?.[0] || '',
      createdAt: new Date().toISOString().split('T')[0]
    };
  } catch (error) {
    console.error(`Error processing chart ${chartInfo.name}:`, error.message);
    return null;
  }
}

async function createDataJson(chartsData) {
  try {
    const dataDir = path.join(__dirname, '..', 'data');
    const publicDataDir = path.join(__dirname, '..', 'public', 'data');
    const chartsDataDir = path.join(dataDir, 'charts');
    const publicChartsDataDir = path.join(publicDataDir, 'charts');
    
    // Create directories if they don't exist
    [dataDir, publicDataDir, chartsDataDir, publicChartsDataDir].forEach(dir => {
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
    });

    // Create individual chart files
    const chartFiles = [];
    for (const chart of chartsData) {
      const fileName = `${chart.name}.json`;
      chartFiles.push(fileName);
      
      // Write individual chart file to both data directories
      const chartFilePath = path.join(chartsDataDir, fileName);
      const publicChartFilePath = path.join(publicChartsDataDir, fileName);
      
      fs.writeFileSync(chartFilePath, JSON.stringify(chart, null, 2));
      fs.writeFileSync(publicChartFilePath, JSON.stringify(chart, null, 2));
    }
    
    // Create index files listing all chart files
    const indexFilePath = path.join(chartsDataDir, 'index.json');
    const publicIndexFilePath = path.join(publicChartsDataDir, 'index.json');
    
    fs.writeFileSync(indexFilePath, JSON.stringify(chartFiles, null, 2));
    fs.writeFileSync(publicIndexFilePath, JSON.stringify(chartFiles, null, 2));
    
    console.log(`Individual chart files created in ${chartsDataDir}`);
    console.log(`Public chart files created in ${publicChartsDataDir}`);
    console.log(`Index files created at ${indexFilePath} and ${publicIndexFilePath}`);
  } catch (error) {
    console.error('Error creating chart files:', error.message);
  }
}

async function main() {
  console.log('Starting to fetch Helm chart values...');
  
  // Check if required tools are available
  try {
    await execAsync('helm version');
    console.log('Helm is available');
  } catch (error) {
    console.log('Helm is not available, using manual download method');
  }
  
  const results = [];
  
  for (const chartInfo of CHARTS_TO_FETCH) {
    console.log(`\nProcessing chart: ${chartInfo.name} from ${chartInfo.repo}`);
    const chartData = await fetchChartValues(chartInfo);
    if (chartData) {
      results.push(chartData);
    }
  }
  
  // Create a JSON file with all chart data
  await createDataJson(results);
  
  console.log('\nFinished fetching Helm chart values.');
  console.log(`Processed ${results.length} charts out of ${CHARTS_TO_FETCH.length}`);
}

// Run the script if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  fetchChartValues,
  fetchIndexYaml,
  downloadChart,
  extractValuesYaml
};