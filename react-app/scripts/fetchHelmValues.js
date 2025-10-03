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
  { name: 'redis', repo: 'bitnami' },
  { name: 'mongodb', repo: 'bitnami' },
  { name: 'postgresql', repo: 'bitnami' },
  { name: 'nginx-ingress', repo: 'ingress-nginx', repoName: 'ingress-nginx' },
  { name: 'prometheus', repo: 'prometheus-community' },
  { name: 'grafana', repo: 'grafana' },
  { name: 'cert-manager', repo: 'jetstack' },
  { name: 'argo-cd', repo: 'argo' }
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
    
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    if (!fs.existsSync(publicDataDir)) {
      fs.mkdirSync(publicDataDir, { recursive: true });
    }

    // Write all chart data to a single JSON file
    const dataFilePath = path.join(dataDir, 'charts.json');
    const publicDataFilePath = path.join(publicDataDir, 'charts.json');
    
    fs.writeFileSync(dataFilePath, JSON.stringify(chartsData, null, 2));
    fs.writeFileSync(publicDataFilePath, JSON.stringify(chartsData, null, 2));
    
    console.log(`Data JSON file created at ${dataFilePath}`);
    console.log(`Public data JSON file created at ${publicDataFilePath}`);
  } catch (error) {
    console.error('Error creating data JSON file:', error.message);
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