
import { Trade, TradeDirection } from '../types';

// This is the structure App.tsx expects for new trades, minus id and timeInTrade
type ParsedTradeData = Omit<Trade, 'id' | 'timeInTrade'>;

interface CSVParseResult {
  successfulTrades: ParsedTradeData[];
  errors: string[];
}

interface QuantowerFill {
  dateTime: Date;
  symbol: string;
  side: 'Buy' | 'Sell';
  quantity: number; // Original signed quantity from CSV: positive for Buy, negative for Sell
  price: number;
  netPL: number;
  fee: number;
  netPLPerUnit: number; // Calculated: netPL / Math.abs(quantity)
  originalRowIndex: number; // For error reporting
}

// Simple CSV line parser (handles basic cases, including quoted fields)
const parseCSVLine = (line: string): string[] => {
  const result: string[] = [];
  let currentField = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      result.push(currentField.trim());
      currentField = '';
    } else {
      currentField += char;
    }
  }
  result.push(currentField.trim());
  return result.map(field => {
    if (field.startsWith('"') && field.endsWith('"')) {
      return field.substring(1, field.length - 1);
    }
    return field;
  });
};

const parseQuantowerDateTime = (dateTimeStr: string): Date | null => {
  if (!dateTimeStr) return null;
  // Format: "M/D/YYYY H:MM:SS AM/PM" or "M/D/YYYY HH:MM:SS AM/PM"
  const match = dateTimeStr.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})\s+(\d{1,2}):(\d{2}):(\d{2})\s+(AM|PM)/i);
  if (!match) return null;

  const month = parseInt(match[1], 10) - 1;
  const day = parseInt(match[2], 10);
  const year = parseInt(match[3], 10);
  let hour = parseInt(match[4], 10);
  const minute = parseInt(match[5], 10);
  const second = parseInt(match[6], 10);
  const ampm = match[7].toUpperCase();

  if (ampm === 'PM' && hour < 12) hour += 12;
  if (ampm === 'AM' && hour === 12) hour = 0; // Midnight case

  if (year < 1900 || year > 2100 || month < 0 || month > 11 || day < 1 || day > 31 || hour < 0 || hour > 23 || minute < 0 || minute > 59 || second < 0 || second > 59) {
    return null;
  }
  return new Date(year, month, day, hour, minute, second);
};

const formatDateToYYYYMMDD = (date: Date): string => {
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Consistent with App.tsx's normalizeHeader
const normalizeHeader = (header: string): string => header.toLowerCase().replace(/\s+/g, '').replace(/\//g, '');


export const parseQuantowerCSVToTrades = (csvContent: string): CSVParseResult => {
  const successfulTrades: ParsedTradeData[] = [];
  const errors: string[] = [];
  const lines = csvContent.split(/\r\n|\n/).filter(line => line.trim() !== '');

  if (lines.length < 2) {
    errors.push("Quantower CSV Error: Must contain a header row and at least one data row.");
    return { successfulTrades, errors };
  }

  const rawHeadersFromCSV = parseCSVLine(lines[0]);
  // Normalize headers from the CSV file using the local normalizeHeader function
  const normalizedHeadersFromCSV = rawHeadersFromCSV.map(normalizeHeader);
  
  // These are the *internal keys* we'll use in headerIndices,
  // and their values are the *normalized header names* we expect in the CSV.
  const requiredHeaderMap: { [key: string]: string } = {
    datetime: 'datetime', // From "Date/Time"
    symbol: 'symbol',     // From "Symbol"
    side: 'side',         // From "Side"
    quantity: 'quantity', // From "Quantity"
    price: 'price',       // From "Price"
    // grosspl: 'grosspl', // From "Gross P/L" - not strictly needed for fill calculation if Net P/L & Fee are used
    fee: 'fee',           // From "Fee"
    netpl: 'netpl',       // From "Net P/L" - corrected to be slash-less
  };

  const headerIndices: { [key: string]: number } = {};
  let missingHeadersError = false; // Changed variable name to avoid conflict
  const detectedRawHeaders: string[] = []; // For error reporting

  // Populate headerIndices using the normalized headers from the CSV
  for (const internalKey in requiredHeaderMap) {
    const expectedNormalizedHeader = requiredHeaderMap[internalKey];
    const foundIndex = normalizedHeadersFromCSV.indexOf(expectedNormalizedHeader);
    
    if (foundIndex === -1) {
      // Try to find the original header name for better error messages
      let originalHeaderName = expectedNormalizedHeader; // Fallback
      const originalHeaderIndex = Object.values(requiredHeaderMap).indexOf(expectedNormalizedHeader);
      if (originalHeaderIndex !== -1) {
          const keyForOriginal = Object.keys(requiredHeaderMap)[originalHeaderIndex];
          // This is a bit convoluted; ideally, map raw headers to normalized to find original
          // For now, use the normalized name or a placeholder if raw can't be easily found.
          // A better way would be to map original CSV headers to their normalized versions first.
          // Let's find the original raw header that would normalize to expectedNormalizedHeader
          const rawHeaderIndex = normalizedHeadersFromCSV.findIndex(h => h === expectedNormalizedHeader);
          if (rawHeaderIndex !== -1 && rawHeaderIndex < rawHeadersFromCSV.length) {
            originalHeaderName = rawHeadersFromCSV[rawHeaderIndex]; // This might still be normalized if not careful
          }
      }
      // Simplified error for now:
      errors.push(`Quantower CSV Error: Missing required column for an expected header like "${expectedNormalizedHeader}". Check if a column like "Net P/L" (normalizes to 'netpl') is present.`);
      missingHeadersError = true;
    }
    headerIndices[internalKey] = foundIndex;
  }


  if (missingHeadersError) {
    return { successfulTrades, errors };
  }

  const allFills: QuantowerFill[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const values = parseCSVLine(line);
    if (values.length !== normalizedHeadersFromCSV.length) {
      errors.push(`Quantower CSV Row ${i + 1}: Column count mismatch. Expected ${normalizedHeadersFromCSV.length}, got ${values.length}. Skipping.`);
      continue;
    }

    try {
      const dateTimeStr = values[headerIndices.datetime];
      const dateTime = parseQuantowerDateTime(dateTimeStr);
      if (!dateTime) throw new Error(`Invalid Date/Time format: "${dateTimeStr}"`);

      const symbol = values[headerIndices.symbol].trim();
      if (!symbol) throw new Error("Symbol is missing.");

      const sideStr = values[headerIndices.side].trim().toLowerCase();
      if (sideStr !== 'buy' && sideStr !== 'sell') throw new Error(`Invalid Side: "${values[headerIndices.side]}". Must be 'Buy' or 'Sell'.`);
      const side = sideStr === 'buy' ? 'Buy' : 'Sell';

      const quantityRaw = parseFloat(values[headerIndices.quantity]);
      if (isNaN(quantityRaw) || quantityRaw === 0) throw new Error(`Invalid Quantity: "${values[headerIndices.quantity]}". Must be a non-zero number.`);
      const quantity = quantityRaw;


      const price = parseFloat(values[headerIndices.price]);
      if (isNaN(price)) throw new Error(`Invalid Price: "${values[headerIndices.price]}"`);

      const netPL = parseFloat(values[headerIndices.netpl].replace(/,/g, ''));
      if (isNaN(netPL)) throw new Error(`Invalid Net P/L: "${values[headerIndices.netpl]}"`);
      
      const fee = parseFloat(values[headerIndices.fee].replace(/,/g, ''));
       if (isNaN(fee)) throw new Error(`Invalid Fee: "${values[headerIndices.fee]}"`);


      allFills.push({
        dateTime,
        symbol,
        side,
        quantity, 
        price,
        netPL,
        fee,
        netPLPerUnit: netPL / Math.abs(quantity),
        originalRowIndex: i + 1,
      });
    } catch (e: any) {
      errors.push(`Quantower CSV Row ${i + 1}: ${e.message}. Skipping.`);
    }
  }

  allFills.sort((a, b) => a.dateTime.getTime() - b.dateTime.getTime());

  const pendingFills: { [symbol: string]: QuantowerFill[] } = {};

  for (const currentFill of allFills) {
    const { symbol, quantity } = currentFill;
    if (!pendingFills[symbol]) {
      pendingFills[symbol] = [];
    }

    let currentFillQuantityRemaining = currentFill.quantity; 

    if (currentFillQuantityRemaining > 0) { 
      let i = 0;
      while (i < pendingFills[symbol].length && currentFillQuantityRemaining > 0) {
        const pendingShortFill = pendingFills[symbol][i];
        if (pendingShortFill.quantity < 0) { 
          const matchQty = Math.min(currentFillQuantityRemaining, Math.abs(pendingShortFill.quantity));

          successfulTrades.push({
            date: formatDateToYYYYMMDD(pendingShortFill.dateTime),
            symbol: symbol,
            contracts: matchQty,
            direction: 'short',
            entry: pendingShortFill.price,
            exit: currentFill.price,
            timeIn: pendingShortFill.dateTime.toISOString(),
            timeOut: currentFill.dateTime.toISOString(),
            profit: (pendingShortFill.netPLPerUnit + currentFill.netPLPerUnit) * matchQty,
            journal: '',
            tags: {},
          });

          currentFillQuantityRemaining -= matchQty;
          pendingShortFill.quantity += matchQty; 

          if (pendingShortFill.quantity === 0) {
            pendingFills[symbol].splice(i, 1); 
          } else {
            i++; 
          }
        } else {
          i++; 
        }
      }
      if (currentFillQuantityRemaining > 0) {
        pendingFills[symbol].push({ ...currentFill, quantity: currentFillQuantityRemaining });
      }
    } else { 
      let i = 0;
      while (i < pendingFills[symbol].length && currentFillQuantityRemaining < 0) {
        const pendingLongFill = pendingFills[symbol][i];
        if (pendingLongFill.quantity > 0) { 
          const matchQty = Math.min(Math.abs(currentFillQuantityRemaining), pendingLongFill.quantity);
          
          successfulTrades.push({
            date: formatDateToYYYYMMDD(pendingLongFill.dateTime),
            symbol: symbol,
            contracts: matchQty,
            direction: 'long',
            entry: pendingLongFill.price,
            exit: currentFill.price,
            timeIn: pendingLongFill.dateTime.toISOString(),
            timeOut: currentFill.dateTime.toISOString(),
            profit: (pendingLongFill.netPLPerUnit + currentFill.netPLPerUnit) * matchQty,
            journal: '',
            tags: {},
          });
          currentFillQuantityRemaining += matchQty; 
          pendingLongFill.quantity -= matchQty;

          if (pendingLongFill.quantity === 0) {
            pendingFills[symbol].splice(i, 1); 
          } else {
            i++;
          }
        } else {
          i++;
        }
      }
      if (currentFillQuantityRemaining < 0) {
        pendingFills[symbol].push({ ...currentFill, quantity: currentFillQuantityRemaining });
      }
    }
    
    if (pendingFills[symbol] && pendingFills[symbol].length === 0) {
        delete pendingFills[symbol];
    }
  }
  
  Object.keys(pendingFills).forEach(symbol => {
    pendingFills[symbol].forEach(fill => {
      errors.push(`Warning: Unmatched fill for ${symbol} on ${fill.dateTime.toLocaleString()}: ${fill.side} ${Math.abs(fill.quantity)} @ ${fill.price}. Original row ${fill.originalRowIndex}.`);
    });
  });

  return { successfulTrades, errors };
};
