import { parseCSVToTrades } from '../csvImporter';
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

describe('CSV Importer', () => {
  describe('parseCSVToTrades', () => {
    it('should parse valid CSV with long trades correctly', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45
TSLA,50,200.00,210.00,500.00,1/16/2024 10:00,1/16/2024 15:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(2);

      const firstTrade = result.successfulTrades[0];
      expect(firstTrade.symbol).toBe('AAPL');
      expect(firstTrade.contracts).toBe(100);
      expect(firstTrade.direction).toBe('long');
      expect(firstTrade.entry).toBe(150.50);
      expect(firstTrade.exit).toBe(155.25);
      expect(firstTrade.profit).toBe(475.00);
      expect(firstTrade.date).toBe('01/15/2024');
    });

    it('should parse valid CSV with short trades correctly', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,155.25,150.50,475.00,1/15/2024 14:45,1/15/2024 9:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(1);

      const trade = result.successfulTrades[0];
      expect(trade.symbol).toBe('AAPL');
      expect(trade.contracts).toBe(100);
      expect(trade.direction).toBe('short');
      expect(trade.entry).toBe(150.50);
      expect(trade.exit).toBe(155.25);
      expect(trade.profit).toBe(475.00);
    });

    it('should handle PNL with parentheses for negative values', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,145.25,(525.00),1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(1);
      expect(result.successfulTrades[0].profit).toBe(-525.00);
    });

    it('should handle PNL with dollar signs and commas', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,$475.00,1/15/2024 9:30,1/15/2024 14:45
TSLA,1000,200.00,210.00,"$10,000.00",1/16/2024 10:00,1/16/2024 15:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(2);
      expect(result.successfulTrades[0].profit).toBe(475.00);
      expect(result.successfulTrades[1].profit).toBe(10000.00);
    });

    it('should handle case-insensitive headers with spaces', () => {
      const csvContent = `Symbol,Qty,Buy Price,Sell Price,PNL,Bought Timestamp,Sold Timestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(1);
    });

    it('should handle quoted fields in CSV', () => {
      const csvContent = `"Symbol","Qty","BuyPrice","SellPrice","PNL","BoughtTimestamp","SoldTimestamp"
"AAPL","100","150.50","155.25","475.00","1/15/2024 9:30","1/15/2024 14:45"`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(1);
    });

    it('should handle AM/PM timestamps', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30 AM,1/15/2024 2:45 PM`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(1);
    });

    it('should return error for missing required headers', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice
AAPL,100,150.50,155.25`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Missing required header(s)');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should return error for empty CSV', () => {
      const csvContent = '';

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('CSV must contain a header row and at least one data row.');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should return error for CSV with only header', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toBe('CSV must contain a header row and at least one data row.');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid symbol', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Symbol is required');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid quantity', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,0,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Contracts (Qty: "0") must be a positive number');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid PNL', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,invalid,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('PNL (Pnl: "invalid") must be a valid number');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid buy price', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,invalid,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Buy Price ("invalid") must be a number');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid sell price', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,invalid,475.00,1/15/2024 9:30,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Sell Price ("invalid") must be a number');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid bought timestamp', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,invalid,1/15/2024 14:45`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid BoughtTimestamp format: "invalid"');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle invalid sold timestamp', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,invalid`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Invalid SoldTimestamp format: "invalid"');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle identical timestamps', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 9:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('BoughtTimestamp and SoldTimestamp are identical');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle column count mismatch', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Number of columns');
      expect(result.successfulTrades).toHaveLength(0);
    });

    it('should handle multiple errors and continue parsing valid rows', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp
AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45
TSLA,invalid,200.00,210.00,500.00,1/16/2024 10:00,1/16/2024 15:30
MSFT,75,300.00,310.00,750.00,1/17/2024 11:00,1/17/2024 16:00`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toContain('Contracts (Qty: "invalid") must be a positive number');
      expect(result.successfulTrades).toHaveLength(2);
      expect(result.successfulTrades[0].symbol).toBe('AAPL');
      expect(result.successfulTrades[1].symbol).toBe('MSFT');
    });

    it('should handle empty lines in CSV', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp

AAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45

TSLA,50,200.00,210.00,500.00,1/16/2024 10:00,1/16/2024 15:30

`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(2);
    });

    it('should handle different line endings (CRLF vs LF)', () => {
      const csvContent = `Symbol,Qty,BuyPrice,SellPrice,PNL,BoughtTimestamp,SoldTimestamp\r\nAAPL,100,150.50,155.25,475.00,1/15/2024 9:30,1/15/2024 14:45\r\nTSLA,50,200.00,210.00,500.00,1/16/2024 10:00,1/16/2024 15:30`;

      const result = parseCSVToTrades(csvContent, mockTagGroups);

      expect(result.errors).toHaveLength(0);
      expect(result.successfulTrades).toHaveLength(2);
    });
  });
}); 