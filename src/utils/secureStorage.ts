// Secure storage utilities for Reflection Edge
import { calculateDataHash, generateSecureId } from './security';
import { Trade, TagGroup, PlaybookEntry, Profile } from '../types';

// NOTE: Encryption here is for demonstration only and is NOT secure.
// For a real application, use a robust library like CryptoJS.
const ENCRYPTION_KEY = 'reflection-edge-secret-key-for-demo';

// This is a simplified, non-secure storage helper for demonstration.
// In a real-world application, consider using a library like Dexie.js for robust client-side storage.

// --- Data Structure Types ---
interface ProfileData {
  trades: Trade[];
  tagGroups: TagGroup[];
  playbookEntries: PlaybookEntry[];
}

export interface StoredData {
  activeProfileId: string | null;
  profiles: Profile[];
  profileData: {
    [profileId: string]: ProfileData;
  };
  version: string;
}

// --- Core API ---
export class SecureStorage {
    private static readonly STORAGE_KEY = 'reflection-edge-data';
    private static readonly CURRENT_VERSION = '2.0';

    private static decrypt(encryptedData: string): string {
        try {
            let result = '';
            const decodedData = atob(encryptedData);
            for (let i = 0; i < decodedData.length; i++) {
                result += String.fromCharCode(decodedData.charCodeAt(i) ^ ENCRYPTION_KEY.charCodeAt(i % ENCRYPTION_KEY.length));
            }
            return result;
        } catch(e) {
            console.error("Decryption failed. It might be unencrypted JSON.", e);
            // If decryption fails, it might be plain JSON from a previous state.
            return encryptedData;
        }
    }

  static loadData(): StoredData | null {
    try {
      const storedValue = localStorage.getItem(this.STORAGE_KEY);
      if (!storedValue) return null;

      const parsedData = JSON.parse(storedValue);

      // Check if data is in the old format (pre-profiles) and needs migration.
      if (!parsedData.profiles && (Array.isArray(parsedData) || parsedData.trades)) {
        console.log("Old data structure detected. Migrating to profiles...");
        
        const oldTrades = parsedData.trades || (Array.isArray(parsedData) ? parsedData : []);
        const oldTagGroups = parsedData.tagGroups || [];
        const oldPlaybookEntries = parsedData.playbookEntries || [];

        const defaultProfile: Profile = { id: `profile_${Date.now()}`, name: 'Main Profile' };

        const newStructure: StoredData = {
          activeProfileId: defaultProfile.id,
          profiles: [defaultProfile],
          profileData: {
            [defaultProfile.id]: {
              trades: oldTrades,
              tagGroups: oldTagGroups,
              playbookEntries: oldPlaybookEntries,
            },
          },
          version: this.CURRENT_VERSION,
        };

        this.saveData(newStructure);
        console.log("Migration complete. New data structure saved.");
        return newStructure;
      }

      // Handle version mismatches for future updates
      if (parsedData.version !== this.CURRENT_VERSION) {
        console.warn(`Storage version mismatch. Stored: ${parsedData.version}, App: ${this.CURRENT_VERSION}. Future migration logic would go here.`);
      }
      
      return parsedData as StoredData;

    } catch (error) {
      console.error('Failed to load or parse data. Data might be corrupted.', error);
      // In a real app, you might offer to clear the corrupted data.
      // localStorage.removeItem(this.STORAGE_KEY);
      return null;
    }
  }

  static saveData(data: StoredData) {
    try {
      data.version = this.CURRENT_VERSION;
      const stringifiedData = JSON.stringify(data);
      localStorage.setItem(this.STORAGE_KEY, stringifiedData);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  }

  static clearData(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear data:', error);
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