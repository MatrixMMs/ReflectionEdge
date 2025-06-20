# Trading Analysis Dashboard

A powerful React-based web application for analyzing trading performance through CSV data imports, interactive charts, and detailed reporting.

## Features

- **CSV Import Support**
  - Import trading data from broker exports
  - Support for Quantower CSV format
  - Automatic data validation and error handling

- **Interactive Charts**
  - Cumulative PnL visualization
  - Trade sequence analysis
  - Customizable date ranges
  - Multiple chart types (Line, Pie)

- **Tag Management System**
  - Create custom tag groups
  - Assign multiple tags to trades
  - Color-coded tag visualization
  - Tag-based performance analysis

- **Trade Management**
  - Add, edit, and delete trades manually
  - Track trade duration
  - Monitor entry/exit points
  - Record trade direction (long/short)

- **Performance Analytics**
  - Daily trading summaries
  - Tag performance metrics
  - Trade direction filtering
  - Custom date range comparisons

- **Pattern Recognition & Insights**
  - Detect time-based trading patterns (hourly, daily, session, etc.)
  - Actionable insights and recommendations for optimizing strategy
  - Visualize best/worst performing periods and patterns

- **Multi-Account Support**
  - Track trades across multiple trading accounts
  - Filter analytics and charts by account
  - Manage account details and assignments

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone [repository-url]
cd reflection-edge
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Start the development server:
```bash
npm run dev
# or
yarn dev
```

4. Open your browser and navigate to `http://localhost:5173`

## Usage

1. **Importing Data**
   - Click the import button to upload your CSV file
   - Supported formats: Broker export CSV or Quantower CSV
   - The system will automatically detect the format and process the data

2. **Managing Trades**
   - Add new trades manually using the trade form
   - Edit existing trades by clicking on them in the trade list
   - Delete trades using the delete button

3. **Working with Tags**
   - Create tag groups through the tag manager
   - Assign tags to trades for better organization
   - Use tags to filter and analyze performance

4. **Analyzing Performance**
   - Use the chart controls to customize your view
   - Select different metrics for the Y-axis
   - Choose between trade sequence or time-based X-axis
   - Filter by date ranges and tags

## Data Persistence

The application automatically saves your data to local storage, including:
- Trade history
- Tag groups and assignments
- Chart preferences

## Built With

- React
- TypeScript
- Recharts for data visualization
- Vite for build tooling

## License

This project is licensed under the MIT License - see the LICENSE file for details.
