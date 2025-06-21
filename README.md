# Reflection Edge - Advanced Trading Journal

A powerful, secure, and professional-grade trading journal built with React for in-depth performance analysis. Go beyond simple P&L tracking and discover your true statistical edge.

## Core Features

- **Secure & Private**: All data is stored and encrypted locally in your browser. No data ever leaves your machine.
- **Advanced CSV Import**: Supports multiple broker and platform formats (including Quantower) with automatic data validation.
- **Interactive Charting**:
  - Cumulative PnL, Win Rate, and other key metrics over time.
  - Dynamic filtering by date range, trade direction, and custom tags.
  - Compare performance across different time periods.
- **Flexible Tagging System**:
  - Create custom tag groups and color-coded tags for your strategies, setups, and market conditions.
  - Analyze performance by any combination of tags.
- **Playbook & Journaling**:
  - Build a playbook of your ideal trade setups.
  - Attach playbook entries and detailed notes to every trade.

## Professional Analysis Tools

- **Kelly Criterion Analysis**:
  - Calculates optimal position sizing (Full, Half, Quarter Kelly) based on your historical performance.
  - Provides key metrics like Profit Factor, Win Rate, and Risk of Ruin.
  - Filter by tags to see the Kelly value for each specific strategy, helping you allocate capital effectively.
- **Edge Discovery Dashboard**:
  - Automatically analyzes your entire trade history to find your statistical edge.
  - Identifies your most profitable patterns, times of day, and market conditions.
  - Provides an overall "Edge Score" and actionable recommendations.
  - Includes a risk assessment and highlights your subconscious behavioral patterns.
- **Monkey Brain Suppressor (MBS)**:
  - An interactive tool to promote discipline during live trading sessions.
  - Enforces a timeout after consecutive losses to prevent emotional decisions.
  - Provides real-time session stats and a detailed post-session analysis.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/your-repo/reflection-edge.git
    cd reflection-edge
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the development server:
    ```bash
    npm run dev
    ```
4.  Open your browser to `http://localhost:5173`.

## Usage

1.  **Import Data**: Use the "Import" button to upload your trade history from a CSV file.
2.  **Tag Your Trades**: Use the "Tags" manager to create tags for your strategies (e.g., "Opening Drive," "Reversal") and apply them to your trades.
3.  **Analyze Your Edge**:
    *   Open the **Kelly** panel to see position sizing recommendations for your strategies.
    *   Open the **Edge** panel to get a deep-dive analysis of where you're most profitable.
    *   Use the main charts and filters to explore performance visually.

## Data Persistence & Security

All trade data and settings are saved securely in your browser's local storage using the Web Crypto API for encryption. Your data is yours alone and never transmitted over the network.

## Built With

- React & TypeScript
- Vite for a fast development experience
- TailwindCSS for styling
- Recharts for interactive data visualization

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.
