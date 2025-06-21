import { Trade, TagGroup, TradeDirection } from '../types';

type ParsedTradeData = Omit<Trade, 'id' | 'timeInTrade'>;

interface CSVParseResult {
  successfulTrades: ParsedTradeData[];
  errors: string[];
}

// Simple CSV line parser (handles basic cases, including quoted fields)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i-1] !== '\\')) { // Handle basic quotes, not escaped quotes
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim()); // Push the last field
  return result.map(field => {
    // Remove leading/trailing quotes if they are the first and last char
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.substring(1, field.length - 1);
    }
    return field;
  });
};

// Parses "M/D/YYYY H:MM" or "M/D/YYYY HH:MM" (handles single/double digit for month, day, hour)
const parseBrokerTimestamp = (timestampStr: string): Date | null => {
  if (!timestampStr) return null;
  // Regex to capture M/D/YYYY H:MM or M/D/YYYY HH:MM AM/PM (optional AM/PM)
  const match = timestampStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2})(\s*(AM|PM))?/i);
  if (!match) return null;

  const month = parseInt(match[1], 10) -1; // Month is 0-indexed in JS Date
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  let hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const ampm = match[7]?.toUpperCase();

  if (ampm === 'PM' && hour < 12) {
    hour += 12;
  }
  if (ampm === 'AM' && hour === 12) { // Midnight case
    hour = 0;
  }
  
  // Validate date components
  if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    return null; // Invalid date component
  }

  return new Date(year, month, day, hour, minute, 0, 0);
};

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const parsePnl = (pnlStr: string): number | null => {
    if (typeof pnlStr !== 'string') return null;
    let cleanedStr = pnlStr.replace(/\$/g, '').replace(/,/g, ''); // Remove $ and commas
    let value;
    if (cleanedStr.startsWith('(') && cleanedStr.endsWith(')')) {
        value = -parseFloat(cleanedStr.substring(1, cleanedStr.length -1));
    } else {
        value = parseFloat(cleanedStr);
    }
    return isNaN(value) ? null : value;
};


export const parseCSVToTrades = (csvContent: string, _existingTagGroups: TagGroup[]): CSVParseResult => {
  const successfulTrades: ParsedTradeData[] = [];
  const errors: string[] = [];

  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');
  if (lines.length < 2) {
    errors.push("CSV must contain a header row and at least one data row.");
    return { successfulTrades, errors };
  }

  const headerLine = lines[0];
  const rawHeaders = parseCSVLine(headerLine);
  const headers = rawHeaders.map(h => h.toLowerCase().replace(/\s+/g, '')); // Normalize headers: lowercase, remove spaces

  const requiredHeaders = ['symbol', 'qty', 'buyprice', 'sellprice', 'pnl', 'boughttimestamp', 'soldtimestamp'];
  const missingHeaders = requiredHeaders.filter(reqHeader => !headers.includes(reqHeader));

  if (missingHeaders.length > 0) {
    errors.push(`Missing required header(s): ${missingHeaders.join(', ')}. Expected headers (case-insensitive, spaces ignored): Symbol, Qty, BuyPrice, SellPrice, PNL, BoughtTimestamp, SoldTimestamp.`);
    return { successfulTrades, errors };
  }
  
  const headerMap: {[key: string]: number} = {};
  headers.forEach((header, index) => {
    headerMap[header] = index;
  });


  const dataLines = lines.slice(1);

  dataLines.forEach((line, index) => {
    const values = parseCSVLine(line);
    if (values.length !== headers.length && values.length !== rawHeaders.length) { // Check against both raw and normalized header count
      errors.push(`Row ${index + 2}: Number of columns (${values.length}) does not match header columns (${headers.length}). Skipping row. Line: "${line}"`);
      return;
    }

    const getRowData = (headerName: string): string => values[headerMap[headerName.toLowerCase().replace(/\s+/g, '')]]?.trim() || '';

    try {
      const symbol = getRowData('symbol');
      if (!symbol) {
        throw new Error("Symbol is required.");
      }
      
      const contractsStr = getRowData('qty');
      const contracts = parseFloat(contractsStr);
      if (isNaN(contracts) || contracts <= 0) {
        throw new Error(`Contracts (Qty: "${contractsStr}") must be a positive number.`);
      }

      const pnlStr = getRowData('pnl');
      const profit = parsePnl(pnlStr);
      if (profit === null) {
        throw new Error(`PNL (Pnl: "${pnlStr}") must be a valid number, optionally in parentheses for negative.`);
      }

      const boughtTimestampStr = getRowData('boughttimestamp');
      const parsedBoughtTime = parseBrokerTimestamp(boughtTimestampStr);
      if (!parsedBoughtTime) {
        throw new Error(`Invalid BoughtTimestamp format: "${boughtTimestampStr}". Expected M/D/YYYY H:MM.`);
      }

      const soldTimestampStr = getRowData('soldtimestamp');
      const parsedSoldTime = parseBrokerTimestamp(soldTimestampStr);
      if (!parsedSoldTime) {
        throw new Error(`Invalid SoldTimestamp format: "${soldTimestampStr}". Expected M/D/YYYY H:MM.`);
      }
      
      let direction: TradeDirection;
      let entryTime: Date;
      let exitTime: Date;
      let entryPriceNum: number;
      let exitPriceNum: number;

      const buyPriceStr = getRowData('buyprice');
      const buyPrice = parseFloat(buyPriceStr);
      if (isNaN(buyPrice)) {
          throw new Error(`Buy Price ("${buyPriceStr}") must be a number.`);
      }

      const sellPriceStr = getRowData('sellprice');
      const sellPrice = parseFloat(sellPriceStr);
      if (isNaN(sellPrice)) {
          throw new Error(`Sell Price ("${sellPriceStr}") must be a number.`);
      }

      if (parsedBoughtTime.getTime() < parsedSoldTime.getTime()) {
        direction = 'long';
        entryTime = parsedBoughtTime;
        exitTime = parsedSoldTime;
        entryPriceNum = buyPrice;
        exitPriceNum = sellPrice;
      } else if (parsedSoldTime.getTime() < parsedBoughtTime.getTime()) {
        direction = 'short';
        entryTime = parsedSoldTime; // For shorts, entry is when sold
        exitTime = parsedBoughtTime; // and exit is when bought back
        entryPriceNum = sellPrice; // Entry price for short is sell price
        exitPriceNum = buyPrice;   // Exit price for short is buy price
      } else {
        throw new Error("BoughtTimestamp and SoldTimestamp are identical. Cannot determine trade direction or duration.");
      }
      
      const tradeDate = formatDateToYYYYMMDD(entryTime); // Use entry time's date as the trade date
      const timeInISO = entryTime.toISOString();
      const timeOutISO = exitTime.toISOString();
      
      const journal = ''; // Not in this CSV format
      const tradeTags: { [key: string]: string } = {}; // Not in this CSV format

      // Optional: Validate PNL against prices and direction
      // const calculatedPnl = (exitPriceNum - entryPriceNum) * contracts * (direction === 'long' ? 1 : -1);
      // if (Math.abs(calculatedPnl - profit) > 0.01 * contracts) { // Allow small tolerance
      //   console.warn(`Row ${index + 2}: PNL discrepancy. CSV PNL: ${profit}, Calculated PNL: ${calculatedPnl.toFixed(2)}`);
      // }


      successfulTrades.push({
        date: tradeDate,
        symbol,
        contracts,
        direction,
        entry: entryPriceNum,
        exit: exitPriceNum,
        timeIn: timeInISO,
        timeOut: timeOutISO,
        profit,
        journal,
        tags: tradeTags,
        accountId: 'default', // Default account ID for imported trades
      });

    } catch (e: any) {
      errors.push(`Row ${index + 2}: ${e.message}. Skipping row.`);
    }
  });

  return { successfulTrades, errors };
};
