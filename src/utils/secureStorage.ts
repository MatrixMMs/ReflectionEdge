// Secure storage utilities for Reflection Edge
import { calculateDataHash, generateSecureId } from './security';
import { Trade, TagGroup, PlaybookEntry } from '../types';

interface StoredData {
  version: string;
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
  dataHash: string;
  lastModified: string;
}

export class SecureStorage {
  private static readonly STORAGE_KEY = 'reflection-edge-data';
  private static readonly STORAGE_VERSION = '1.1';

  static saveData(trades: Trade[], tagGroups: TagGroup[], playbookEntries: PlaybookEntry[]): boolean {
    try {
      // Validate data before saving
      if (!Array.isArray(trades) || !Array.isArray(tagGroups) || !Array.isArray(playbookEntries)) {
        console.error('Invalid data structure for storage');
        return false;
      }

      // Create data object
      const dataToStore: StoredData = {
        version: this.STORAGE_VERSION,
        trades,
        tagGroups,
        playbookEntries,
        dataHash: calculateDataHash({ trades, tagGroups, playbookEntries }),
        lastModified: new Date().toISOString()
      };

      // Store in localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(dataToStore));
      return true;
    } catch (error) {
      console.error('Error saving data:', error);
      return false;
    }
  }

  static loadData(): { trades: Trade[]; tagGroups: TagGroup[]; playbookEntries: PlaybookEntry[] } | null {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return null;
      }

      const parsed: StoredData = JSON.parse(storedData);

      // Version check
      if (parsed.version !== this.STORAGE_VERSION) {
        console.warn('Storage version mismatch, data may need migration');
      }

      // Data integrity check
      const expectedHash = calculateDataHash({
        trades: parsed.trades,
        tagGroups: parsed.tagGroups,
        playbookEntries: parsed.playbookEntries
      });

      if (parsed.dataHash !== expectedHash) {
        console.error('Data integrity check failed');
        return null;
      }

      // Validate data structure
      if (!Array.isArray(parsed.trades) || !Array.isArray(parsed.tagGroups) || !Array.isArray(parsed.playbookEntries)) {
        console.error('Invalid data structure in storage');
        return null;
      }

      return {
        trades: parsed.trades,
        tagGroups: parsed.tagGroups,
        playbookEntries: parsed.playbookEntries
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return null;
    }
  }

  static clearData(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('Error clearing data:', error);
      return false;
    }
  }

  static getStorageInfo(): { size: number; lastModified?: string } {
    try {
      const storedData = localStorage.getItem(this.STORAGE_KEY);
      if (!storedData) {
        return { size: 0 };
      }

      const parsed: StoredData = JSON.parse(storedData);
      return {
        size: storedData.length,
        lastModified: parsed.lastModified
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return { size: 0 };
    }
  }

  static validateTradeData(trade: Trade): boolean {
    // Basic trade validation
    return !!(
      trade.id &&
      trade.symbol &&
      trade.date &&
      typeof trade.contracts === 'number' &&
      typeof trade.entry === 'number' &&
      typeof trade.exit === 'number' &&
      typeof trade.profit === 'number' &&
      trade.direction &&
      (trade.direction === 'long' || trade.direction === 'short')
    );
  }

  static validateTagGroupData(tagGroup: TagGroup): boolean {
    // Basic tag group validation
    return !!(
      tagGroup.id &&
      tagGroup.name &&
      Array.isArray(tagGroup.subtags)
    );
  }
} 