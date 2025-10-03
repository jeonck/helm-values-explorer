# Automated Helm Chart Values Fetching

This project includes an automated system for fetching values.yaml files from popular Helm repositories.

## How It Works

The automation script `scripts/fetchHelmValues.js` performs the following steps:

1. Fetches the `index.yaml` file from configured Helm repositories
2. Identifies the latest version of specified charts
3. Downloads the chart package (.tgz file)
4. Extracts the `values.yaml` file from the chart
5. Saves the values to the `data/` directory
6. Creates a `charts.json` file with all chart metadata

## Configuration

The script is configured with:

- **REPOSITORIES**: A mapping of repository names to URLs
- **CHARTS_TO_FETCH**: A list of charts to fetch from repositories

## Running the Automation

To manually run the fetch script:

```bash
npm run fetch-values
```

## Integration with CI/CD

For continuous updates, you could integrate this script into a CI/CD pipeline to run automatically on a schedule (e.g., daily). This would ensure that the values.yaml files are always up-to-date with the latest chart versions.

## Data Structure

The script generates a JSON file at `data/charts.json` with the following structure:

```json
[
  {
    "name": "chart-name",
    "repo": "repository-name",
    "description": "Chart description",
    "version": "chart-version",
    "appVersion": "application-version",
    "values": "yaml content",
    "url": "chart-homepage-or-source-url",
    "createdAt": "date-generated"
  }
]
```

## Frontend Integration

The React application uses the mock data pattern for demonstration, but in a production setup, the frontend could be modified to load data from the generated `data/charts.json` file rather than using the hardcoded mock data.

## Security Considerations

In production:
- Validate downloaded chart content before processing
- Implement rate limiting when fetching from repositories
- Scan downloaded files for security issues
- Use checksums to verify chart integrity