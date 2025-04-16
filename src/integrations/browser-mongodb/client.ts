
// This is a browser-friendly mock of MongoDB functionality
// We use localStorage to persist data in the browser

const DB_NAME = 'slangify';

export interface MongoCollection<T> {
  find: (query: any) => { toArray: () => Promise<T[]> };
  findOne: (query: any) => Promise<T | null>;
  insertOne: (doc: T) => Promise<{ insertedId: string }>;
  deleteOne: (query: any) => Promise<{ deletedCount: number }>;
}

class MockDatabase {
  private collections: Record<string, any[]> = {};

  constructor() {
    // Load existing data from localStorage
    try {
      const savedData = localStorage.getItem(`${DB_NAME}_collections`);
      if (savedData) {
        this.collections = JSON.parse(savedData);
      }
    } catch (error) {
      console.error('Error loading mock database:', error);
      this.collections = {};
    }
  }

  // Save data to localStorage
  private saveData() {
    localStorage.setItem(`${DB_NAME}_collections`, JSON.stringify(this.collections));
  }

  // Get or create a collection
  collection<T>(collectionName: string): MongoCollection<T> {
    if (!this.collections[collectionName]) {
      this.collections[collectionName] = [];
      this.saveData();
    }

    return {
      find: (query: any) => {
        return {
          toArray: async () => {
            const results = this.collections[collectionName].filter(item => {
              return Object.keys(query).every(key => {
                // Handle special MongoDB queries like $gt
                if (typeof query[key] === 'object' && query[key].$gt) {
                  return item[key] > query[key].$gt;
                }
                
                // For ObjectId comparison
                if (key === 'userId' && item[key] && query[key]) {
                  return item[key].toString() === query[key].toString();
                }
                
                return item[key] === query[key];
              });
            });
            return results;
          }
        };
      },

      findOne: async (query: any) => {
        const found = this.collections[collectionName].find(item => {
          return Object.keys(query).every(key => {
            if (key === '_id') {
              return item[key] && item[key].toString() === query[key].toString();
            }
            return item[key] === query[key];
          });
        });
        return found || null;
      },

      insertOne: async (doc: T) => {
        const id = `id_${Math.random().toString(36).slice(2)}`;
        const docWithId = { ...doc, _id: id };
        this.collections[collectionName].push(docWithId);
        this.saveData();
        return { insertedId: id };
      },

      deleteOne: async (query: any) => {
        const initialLength = this.collections[collectionName].length;
        this.collections[collectionName] = this.collections[collectionName].filter(item => {
          return !Object.keys(query).every(key => {
            // For ObjectId comparison in userId
            if (key === 'userId' && item[key] && query[key]) {
              return item[key].toString() === query[key].toString();
            }
            return item[key] === query[key];
          });
        });
        this.saveData();
        return { deletedCount: initialLength - this.collections[collectionName].length };
      }
    };
  }
}

const mockDb = new MockDatabase();

// Create a mock ObjectId class that works in the browser
export class ObjectId {
  id: string;

  constructor(id?: string) {
    this.id = id || `id_${Math.random().toString(36).slice(2)}`;
  }

  toString() {
    return this.id;
  }
}

// Mock the MongoDB client connection
export const connectToMongoDB = async () => {
  console.log('Connected to mock MongoDB (browser storage)');
  return mockDb;
};

// Get the database instance
export const getDb = () => {
  return mockDb;
};

// Close the MongoDB connection
export const closeMongoDB = async () => {
  console.log('Mock MongoDB connection closed');
};

export const mongodb = {
  client: {},
  getDb,
  connectToMongoDB,
  closeMongoDB
};
