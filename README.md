# Helm Values Explorer

A web application to browse and search the latest `values.yaml` files for popular Helm charts.

## Overview

This application provides an easy way to explore the most up-to-date `values.yaml` files for popular Helm charts. Instead of having to download and extract Helm charts to see their default configurations, you can browse them directly in the UI. The application automatically fetches the latest values from official Helm repositories to ensure you always have current information.

## Features

- Browse popular Helm charts from various repositories
- View the latest `values.yaml` files for each chart
- Search and filter charts by name, description, or category
- Copy or download `values.yaml` files
- Responsive UI for desktop and mobile
- Always up-to-date with the latest chart versions

## Quick Start

1. Clone the repository:
   ```bash
   git clone https://github.com/jeonck/helm-values-explorer.git
   cd helm-values-explorer
   ```

2. Navigate to the React app directory:
   ```bash
   cd react-app
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Fetch the latest Helm chart data:
   ```bash
   npm run fetch-values
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open your browser to the URL shown in the terminal (usually http://localhost:5173)

## Architecture

The application is built with:

- **Frontend**: Vite + React + TypeScript + Tailwind CSS
- **Data**: Fetched from Helm repositories using automated scripts
- **Automation**: Node.js script to regularly update values.yaml files

### Project Structure

```
helm-values-explorer/
├── react-app/              # Main React application
│   ├── public/
│   │   └── data/           # Static chart data (served to frontend)
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── services/       # Helm chart fetching logic
│   │   ├── types/          # TypeScript type definitions
│   │   └── App.tsx         # Main application component
│   ├── scripts/            # Automation scripts
│   │   └── fetchHelmValues.js # Script to fetch latest values from Helm repos
│   └── package.json
├── ARGOCD_IMPLEMENTATION_CHALLENGES.md  # Implementation challenges documentation
├── KAFKA_CATEGORY_CHALLENGES.md         # Category-specific challenges
├── MERGE_CONFLICT_RESOLUTION.md         # Documentation on resolving merge conflicts
└── QWEN.md                             # Qwen-specific documentation
```

## Automatic Data Updates

To keep the `values.yaml` files up-to-date with the latest chart versions:

```bash
npm run fetch-values
```

This script will:
- Fetch index.yaml from configured Helm repositories
- Identify the latest version of each chart
- Download the chart package
- Extract the `values.yaml` file
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

The production build includes all the latest `values.yaml` data, so users always see current configurations.

## How It Works

1. The automation script fetches the latest values.yaml files from official Helm repositories
2. The data is stored in a JSON format accessible to the frontend
3. The frontend displays a list of popular Helm charts with their latest information
4. When a chart is selected, the corresponding up-to-date values.yaml is displayed
5. The fetching script can be run periodically to keep data current

## Development

### Running in Development Mode

To run the application in development mode:

```bash
npm run dev
```

### Linting

To check code quality:

```bash
npm run lint
```

### Building for Production

To build the application for production deployment:

```bash
npm run build
```

## Contributing

We welcome contributions! Here are some ways you can help:

1. Report bugs by creating an issue
2. Suggest new features
3. Submit pull requests with bug fixes or new features
4. Improve documentation
5. Add more Helm chart repositories

## Future Improvements

- Add more Helm chart repositories
- Implement server-side search for better performance
- Add chart version selection
- Include chart dependency information
- Add user favorites and history
- Allow custom repo configuration

## License

This project is open source and available under the [MIT License](LICENSE).