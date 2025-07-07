import { parseCSVToTrades as parseBrokerExportCSV } from '../csvImporter';
import { parseQuantowerCSVToTrades } from '../quantowerCsvImporter';
import { TagGroup } from '../../types';

// Mock tag groups for testing
const mockTagGroups: TagGroup[] = [
  {
    id: 'strategy',
    name: 'Strategy',
    subtags: [
      { id: 'scalping', name: 'Scalping', color: '#ff0000', groupId: 'strategy' },
      { id: 'swing', name: 'Swing', color: '#00ff00', groupId: 'strategy' }
    ]
  }
];

// Helper function to normalize headers (same as in App.tsx)
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');

// Helper function to detect CSV format (same logic as in App.tsx)
const detectCSVFormat = (content: string): 'quantower' | 'broker' => {
  const firstLine = content.split(/\r\n|\n/)[0];
  const headersFromCSV = firstLine.split(',').map(h => normalizeHeader(h.trim()));
  
  const quantowerRequiredHeadersForDetection = ['datetime', 'side', 'quantity', 'price', 'grosspl', 'fee', 'netpl'];
  const isQuantowerFormat = quantowerRequiredHeadersForDetection.every(qh => headersFromCSV.includes(qh));
  
  return isQuantowerFormat ? 'quantower' : 'broker';
};

describe('Import System Integration', () => {
  describe('CSV Format Detection', () => {
    it('should detect Quantower format correctly', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50
1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`;

      const format = detectCSVFormat(quantowerCSV);
      expect(format).toBe('quantower');
    });

    it('should detect broker export format correctly', () => {
      const brokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const format = detectCSVFormat(brokerCSV);
      expect(format).toBe('broker');
    });

    it('should handle case-insensitive headers in format detection', () => {
      const quantowerCSV = `date/time,symbol,side,quantity,price,gross p/l,fee,net p/l
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50`;

      const format = detectCSVFormat(quantowerCSV);
      expect(format).toBe('quantower');
    });

    it('should handle headers with spaces in format detection', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50`;

      const format = detectCSVFormat(quantowerCSV);
      expect(format).toBe('quantower');
    });
  });

  describe('End-to-End Import Flow', () => {
    it('should successfully import Quantower CSV through the detection flow', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50
1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`;

      const format = detectCSVFormat(quantowerCSV);
      let parseResult;

      if (format === 'quantower') {
        parseResult = parseQuantowerCSVToTrades(quantowerCSV);
      } else {
        parseResult = parseBrokerExportCSV(quantowerCSV, mockTagGroups);
      }

      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.successfulTrades).toHaveLength(1);
      expect(parseResult.successfulTrades[0].symbol).toBe('AAPL');
      expect(parseResult.successfulTrades[0].direction).toBe('long');
    });

    it('should successfully import broker CSV through the detection flow', () => {
      const brokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const format = detectCSVFormat(brokerCSV);
      let parseResult;

      if (format === 'quantower') {
        parseResult = parseQuantowerCSVToTrades(brokerCSV);
      } else {
        parseResult = parseBrokerExportCSV(brokerCSV, mockTagGroups);
      }

      expect(parseResult.errors).toHaveLength(0);
      expect(parseResult.successfulTrades).toHaveLength(1);
      expect(parseResult.successfulTrades[0].symbol).toBe('AAPL');
      expect(parseResult.successfulTrades[0].direction).toBe('long');
    });

    it('should handle mixed CSV formats in the same flow', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50
1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`;

      const brokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
TSLA,50,200.00,210.00,500.00,1/16/2024 10:00,1/16/2024 15:30`;

      // Test Quantower format
      const quantowerFormat = detectCSVFormat(quantowerCSV);
      const quantowerResult = quantowerFormat === 'quantower' 
        ? parseQuantowerCSVToTrades(quantowerCSV)
        : parseBrokerExportCSV(quantowerCSV, mockTagGroups);

      // Test broker format
      const brokerFormat = detectCSVFormat(brokerCSV);
      const brokerResult = brokerFormat === 'quantower'
        ? parseQuantowerCSVToTrades(brokerCSV)
        : parseBrokerExportCSV(brokerCSV, mockTagGroups);

      expect(quantowerFormat).toBe('quantower');
      expect(brokerFormat).toBe('broker');
      expect(quantowerResult.errors).toHaveLength(0);
      expect(brokerResult.errors).toHaveLength(0);
      expect(quantowerResult.successfulTrades).toHaveLength(1);
      expect(brokerResult.successfulTrades).toHaveLength(1);
    });
  });

  describe('Error Handling in Import Flow', () => {
    it('should handle invalid Quantower CSV through detection flow', () => {
      const invalidQuantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
invalid,AAPL,Buy,100,150.50,0,2.50,497.50`;

      const format = detectCSVFormat(invalidQuantowerCSV);
      let parseResult;

      if (format === 'quantower') {
        parseResult = parseQuantowerCSVToTrades(invalidQuantowerCSV);
      } else {
        parseResult = parseBrokerExportCSV(invalidQuantowerCSV, mockTagGroups);
      }

      expect(parseResult.errors).toHaveLength(1);
      expect(parseResult.errors[0]).toContain('Invalid Date/Time format');
      expect(parseResult.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid broker CSV through detection flow', () => {
      const invalidBrokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,invalid,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const format = detectCSVFormat(invalidBrokerCSV);
      let parseResult;

      if (format === 'quantower') {
        parseResult = parseQuantowerCSVToTrades(invalidBrokerCSV);
      } else {
        parseResult = parseBrokerExportCSV(invalidBrokerCSV, mockTagGroups);
      }

      expect(parseResult.errors).toHaveLength(1);
      expect(parseResult.errors[0]).toContain('Contracts (Qty: "invalid") must be a positive number');
      expect(parseResult.successfulTrades).toHaveLength(0);
    });

    it('should handle ambiguous CSV format gracefully', () => {
      // This CSV has some Quantower-like headers but not all required ones
      const ambiguousCSV = `Date/Time,Symbol,Side,Quantity,Price
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50`;

      const format = detectCSVFormat(ambiguousCSV);
      let parseResult;

      if (format === 'quantower') {
        parseResult = parseQuantowerCSVToTrades(ambiguousCSV);
      } else {
        parseResult = parseBrokerExportCSV(ambiguousCSV, mockTagGroups);
      }

      expect(format).toBe('broker'); // Should default to broker format
      expect(parseResult.errors).toHaveLength(1);
      expect(parseResult.errors[0]).toContain('Missing required header(s)');
    });
  });

  describe('Data Consistency', () => {
    it('should produce consistent trade data structure regardless of format', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50
1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`;

      const brokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const quantowerResult = parseQuantowerCSVToTrades(quantowerCSV);
      const brokerResult = parseBrokerExportCSV(brokerCSV, mockTagGroups);

      expect(quantowerResult.successfulTrades).toHaveLength(1);
      expect(brokerResult.successfulTrades).toHaveLength(1);

      const quantowerTrade = quantowerResult.successfulTrades[0];
      const brokerTrade = brokerResult.successfulTrades[0];

      // Both should have the same basic structure
      expect(quantowerTrade.symbol).toBe(brokerTrade.symbol);
      expect(quantowerTrade.contracts).toBe(brokerTrade.contracts);
      expect(quantowerTrade.direction).toBe(brokerTrade.direction);
      expect(quantowerTrade.date).toBe(brokerTrade.date);
      expect(quantowerTrade.journal).toBe(brokerTrade.journal);
      expect(quantowerTrade.tags).toEqual(brokerTrade.tags);
    });

    it('should handle different date formats consistently', () => {
      const quantowerCSV = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50
1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`;

      const brokerCSV = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const quantowerResult = parseQuantowerCSVToTrades(quantowerCSV);
      const brokerResult = parseBrokerExportCSV(brokerCSV, mockTagGroups);

      expect(quantowerResult.successfulTrades[0].date).toBe('01/15/2024');
      expect(brokerResult.successfulTrades[0].date).toBe('01/15/2024');
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large CSV files efficiently', () => {
      // Create a large CSV with 1000 complete trades (2000 fills)
      const header = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L\n`;
      const tradePairs = Array.from({ length: 1000 }, () => 
        `1/15/2024 9:30:00 AM,AAPL,Buy,100,150.50,0,2.50,497.50\n` +
        `1/15/2024 2:45:00 PM,AAPL,Sell,100,155.25,475.00,2.50,472.50`
      ).join('\n');
      
      const largeQuantowerCSV = header + tradePairs;

      const startTime = performance.now();
      const result = parseQuantowerCSVToTrades(largeQuantowerCSV);
      const endTime = performance.now();

      expect(result.successfulTrades).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle CSV with special characters in symbols', () => {
      const csvWithSpecialChars = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,BTC/USD,Buy,1,45000.00,0,2.50,44997.50
1/15/2024 2:45:00 PM,BTC/USD,Sell,1,46000.00,1000.00,2.50,997.50`;

      const result = parseQuantowerCSVToTrades(csvWithSpecialChars);

      expect(result.successfulTrades).toHaveLength(1);
      expect(result.successfulTrades[0].symbol).toBe('BTC/USD');
      // Note: The importer correctly identifies that these fills form a complete trade
    });

    it('should handle CSV with very small numbers', () => {
      const csvWithSmallNumbers = `Date/Time,Symbol,Side,Quantity,Price,Gross P/L,Fee,Net P/L
1/15/2024 9:30:00 AM,AAPL,Buy,0.001,150.50,0,0.0001,0.1503999
1/15/2024 2:45:00 PM,AAPL,Sell,0.001,155.25,0.00475,0.0001,0.0046499`;

      const result = parseQuantowerCSVToTrades(csvWithSmallNumbers);

      expect(result.successfulTrades).toHaveLength(1);
      expect(result.successfulTrades[0].contracts).toBe(0.001);
      // Note: The importer correctly identifies that these fills form a complete trade
    });
  });
}); 