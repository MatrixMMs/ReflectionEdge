# Reflection Edge - Advanced Trading Performance Tool

A powerful, secure, and professional-grade trading journal built with React for in-depth performance analysis and execution discipline. Go beyond simple P&L tracking and discover your true statistical edge while building consistent trading habits.

## 🎯 Core Philosophy

Reflection Edge separates **process quality** from **outcome quality**. A trade can be executed perfectly (following your plan) but still lose money, or executed poorly but still make money. Our execution grading system helps you focus on improving your discipline rather than just chasing profits.

## 🚀 Core Features

### **Secure & Private**
- All data is stored and encrypted locally in your browser
- No data ever leaves your machine
- Multi-profile support for different trading accounts

### **Advanced Data Management**
- **Import/Export**: Supports multiple CSV formats (including Quantower) and allows you to export your data to JSON or generate comprehensive PDF reports
- **Data Validation**: Built-in security measures to prevent malicious file uploads
- **Backup & Restore**: Easy data backup and migration capabilities

### **Interactive Charting & Analysis**
- **Dynamic Charts**: Cumulative PnL, Win Rate, and other key metrics over time
- **Smart Filtering**: Filter by date range, trade direction, and custom tags
- **Performance Comparison**: Compare performance across different time periods
- **Real-time Updates**: Charts update automatically as you add new trades

### **Flexible Tagging System**
- Create custom tag groups and color-coded tags for your strategies, setups, and market conditions
- Analyze performance by any combination of tags
- Visual tag performance analysis with color-coded metrics

### **🆕 Advanced Tagging System (Coming Soon)**
- **Objective Tags**: Capture market conditions (Macro Environment, Time of Day, Market Structure, Order Flow, Inter-market correlations)
- **Subjective Tags**: Track trader psychology (Mental State, Emotional Response, Execution Quality)
- **Smart Suggestions**: Auto-suggest tags based on time, market conditions, and patterns
- **Cross-Tag Analysis**: Identify profitable combinations of objective and subjective tags
- **Enhanced UI**: Collapsible sections, search, filters, and quick selection patterns

*📋 [Complete Implementation Plan](TAGGING_SYSTEM_IMPLEMENTATION.md)*

## 🧠 **NEW: Monkey Brain Suppressor (MBS) - In-Session Trading Panel**

### **What It Does**
- **Full-screen, distraction-free trading session panel**
- **Quadrant-based trade logging**: Log each trade as one of four types (Made Money & Followed Plan, Lost Money & Followed Plan, Made Money & No Plan, Lost Money & No Plan)
- **Emoji mood picker**: Select from 7 moods for each trade (from 😡 to 🤩)
- **Smart prompts & reflections**: After each trade, receive context-aware journaling prompts; reflections are saved and shown in your session history
- **Editable session trade history**: Edit any aspect of your trade logs, including type, result, plan adherence, mood, notes, and reflection
- **Live session stats**: See trades, wins, losses, average mood, and a mood timeline at a glance
- **Pattern alerts**: Get notified if you log multiple anxious trades in a row
- **Guided onboarding**: Start each session with a mental state check, session goal, and pre-trading checklist
- **Gut check popups**: Every 5 minutes, get a gentle prompt to check in with your emotions
- **Break reminders**: Take healthy breaks with a single click

### **Why It Matters**
- **Ultra-fast logging**: Log a trade in seconds with just a few clicks
- **Focus on discipline**: Visual feedback (green/red) for good/bad process, not just outcome
- **Insight-driven journaling**: Prompts and pattern alerts help you learn from your behavior in real time
- **Review and edit**: Make corrections or add details to any trade during your session

## 🎓 **Execution Grading System**

### **What It Does**
- **Automatically grades** your trade execution from A+ to F
- **Separates discipline from outcomes** - a losing trade with perfect execution gets a good grade
- **Provides immediate feedback** on your trading discipline
- **Tracks improvement over time** to show if your habits are getting better

### **How It Works**
1. **Create a Playbook Strategy** with specific checklist items
2. **Log a Trade** and complete the execution checklist
3. **Get Automatic Grading** based on checklist adherence and trade outcome
4. **Analyze Performance** with visual charts showing P&L by grade

### **Grade Scale**
- **A+**: 90-100% adherence + Winning trade
- **A-**: 90-100% adherence + Losing trade
- **B+**: 75-89% adherence + Winning trade
- **B-**: 75-89% adherence + Losing trade
- **C+**: 60-74% adherence + Winning trade
- **C-**: 60-74% adherence + Losing trade
- **D**: 50-59% adherence (regardless of outcome)
- **F**: Below 50% adherence (regardless of outcome)

### **Execution Dashboard**
- **Performance by Grade Chart**: Visualize the financial impact of good vs. poor execution
- **Grade Statistics**: See trade counts and total P&L for each grade level
- **Trend Analysis**: Track your discipline improvement over time

*📖 [Complete Grading System Documentation](docs/GRADING_SYSTEM.md)*

## 📚 Enhanced Playbook System

### **Structured Checklists**
- Create detailed execution checklists for each strategy
- Track specific behaviors like "Wait for 5-minute confirmation" or "Check market conditions"
- Build consistent trading routines

### **Strategy Management**
- Organize your trading strategies with detailed descriptions
- Tag strategies for easy filtering and analysis
- Track performance by strategy execution quality

## 🔍 Professional Analysis Tools

### **Kelly Criterion Analysis**
- Calculates optimal position sizing (Full, Half, Quarter Kelly) based on your historical performance
- Provides key metrics like Profit Factor, Win Rate, and Risk of Ruin
- Filter by tags to see the Kelly value for each specific strategy

### **Interactive Edge Discovery**
- Automatically analyzes your entire trade history to find your statistical edge
- **Filter your analysis by date range and any combination of tags** to pinpoint exactly where your edge comes from
- Identifies your most profitable patterns, times of day, and market conditions
- Provides an overall "Edge Score" and actionable recommendations

### **Pattern Analysis Heatmap**
- Visualize your performance across different times of the day and days of the week
- Instantly identify your most (and least) profitable trading sessions
- Switch between metrics like Total Profit, Win Rate, and Number of Trades

## 🛠️ Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-repo/reflection-edge.git
   cd reflection-edge
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Open your browser to `http://localhost:5173`

## 📖 Usage Guide

### **1. Set Up Your Playbook**
1. Go to the **Playbook** section
2. Create strategy entries with specific checklist items
3. Example checklist: "Wait for 5-minute candle close", "Check market conditions", "Verify stop loss placement"

### **2. Import Your Data**
1. Use the "Import" button to upload your trade history from a CSV file
2. Supported formats: Generic CSV, Quantower CSV, and JSON backups

### **3. Log Trades with Execution Data**
1. Add new trades and select your strategy from the dropdown
2. Complete the execution checklist that appears
3. The system automatically calculates and assigns an execution grade

### **4. Use the MBS In-Session Panel for Live Trading**
1. Start a session with a mental state check, session goal, and pre-trading checklist
2. Log trades using the quadrant selector and emoji mood picker
3. Respond to smart prompts and reflections after each trade
4. Edit any trade in your session history as needed
5. Monitor live stats, mood timeline, and pattern alerts
6. Take breaks and respond to gut check popups

### **5. Analyze Your Performance**
1. **Execution Analysis**: View your discipline performance and grade trends
2. **Kelly Analysis**: Get position sizing recommendations for your strategies
3. **Edge Discovery**: Find your statistical edge across different conditions
4. **Pattern Analysis**: Identify your most profitable trading times

### **6. Track Your Improvement**
- Review your execution dashboard weekly
- Look for patterns in missed checklist items
- Celebrate improvements in discipline, not just profits

## 🔒 Data Persistence & Security

- **Local Storage**: All data saved securely in your browser using Web Crypto API encryption
- **No Network Transmission**: Your data never leaves your machine
- **Multi-Profile Support**: Manage multiple trading accounts with separate data
- **Backup & Export**: Easy data backup and migration capabilities

## 🏗️ Built With

- **React 18** & **TypeScript** for robust, type-safe development
- **Vite** for lightning-fast development and building
- **TailwindCSS** for beautiful, responsive styling
- **Recharts** for interactive data visualization
- **Web Crypto API** for secure local data encryption

## 📈 Why Reflection Edge?

### **Beyond Simple Journaling**
Most trading journals only track P&L. Reflection Edge helps you build **consistent execution habits** that lead to long-term success.

### **Evidence-Based Improvement**
Our execution grading system provides objective feedback on your trading discipline, helping you identify specific areas for improvement.

### **Professional-Grade Analysis**
Advanced tools like Kelly Criterion and Edge Discovery give you insights typically only available to institutional traders.

### **Privacy-First Design**
Your trading data stays on your machine. No cloud storage, no data mining, no privacy concerns.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guidelines](CONTRIBUTING.md) for details.

## 📄 License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## 🆘 Support

- **Documentation**: [Grading System Guide](docs/GRADING_SYSTEM.md)
- **Issues**: Report bugs or request features on GitHub
- **Discussions**: Join the community for tips and best practices

---

*Remember: Consistent execution of a mediocre strategy often outperforms inconsistent execution of a great strategy. Reflection Edge helps you build the discipline that separates successful traders from the rest.*
