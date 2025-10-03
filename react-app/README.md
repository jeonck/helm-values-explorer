# Helm Values Explorer

A web application to browse and search the latest values.yaml files for popular Helm charts.

## Overview

This application provides an easy way to explore the most up-to-date values.yaml files for popular Helm charts. Instead of having to download and extract Helm charts to see their default configurations, you can browse them directly in the UI. The application automatically fetches the latest values from official Helm repositories to ensure you always have current information.

## Features

- Browse popular Helm charts from various repositories
- View the latest values.yaml files for each chart
- Search and filter charts by name, description, or category
- Copy or download values.yaml files
- Responsive UI for desktop and mobile
- Always up-to-date with the latest chart versions

## Architecture

The application is built with:

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Data**: Fetched from Helm repositories using automated scripts
- **Automation**: Node.js script to regularly update values.yaml files

## Project Structure

```
helm-values-explorer/
├── public/
│   └── data/           # Static chart data (served to frontend)
├── src/
│   ├── components/     # React components
│   ├── services/       # Helm chart fetching logic
│   ├── types/          # TypeScript type definitions
│   └── App.tsx         # Main application component
├── scripts/            # Automation scripts
│   └── fetchHelmValues.js # Script to fetch latest values from Helm repos
├── data/               # Fetched chart data (generated)
└── package.json
```

## Running the Application

1. Install dependencies:
   ```bash
   npm install
   ```

2. Fetch the latest Helm chart data:
   ```bash
   npm run fetch-values
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Automatic Data Updates

To keep the values.yaml files up-to-date with the latest chart versions:

```bash
npm run fetch-values
```

This script will:
- Fetch index.yaml from configured Helm repositories
- Identify the latest version of each chart
- Download the chart package
- Extract the values.yaml file
- Update the JSON data used by the frontend
- Ensure the application always displays the most current values

Run this command regularly (e.g., via cron job or CI/CD pipeline) to maintain current data.

## Configuration

The application is configured to fetch charts from popular Helm repositories. To add or modify charts:

- Update the `CHARTS_TO_FETCH` array in `scripts/fetchHelmValues.js`
- Update the `REPOSITORIES` object to include new Helm repositories

## Deployment

To build the application for production:

```bash
npm run fetch-values  # Update to latest data
npm run build
```

This creates a `dist/` directory with the production build that can be deployed to any static hosting service.

The production build includes all the latest values.yaml data, so users always see current configurations.

## How It Works

1. The automation script fetches the latest values.yaml files from official Helm repositories
2. The data is stored in a JSON format accessible to the frontend
3. The frontend displays a list of popular Helm charts with their latest information
4. When a chart is selected, the corresponding up-to-date values.yaml is displayed
5. The fetching script can be run periodically to keep data current

## Future Improvements

- Add more Helm chart repositories
- Implement server-side search for better performance
- Add chart version selection
- Include chart dependency information
- Add user favorites and history
- Allow custom repo configuration