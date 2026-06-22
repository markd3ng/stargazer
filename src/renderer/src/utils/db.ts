export interface DataUsageLog {
  id?: number
  timestamp: number
  sourceIP: string
  host: string
  outbound: string
  process: string
  upload: number
  download: number
}

const DB_NAME = 'stargazer_db'
const LEGACY_DB_NAME = 'clashparty_db'
const STORE_NAME = 'data_usage_logs'
const DB_VERSION = 1

export class DataUsageDB {
  private db: IDBDatabase | null = null

  static async migrateFromLegacy(): Promise<void> {
    // Check if legacy DB exists
    const dbs = await indexedDB.databases()
    const legacyExists = dbs.some((db) => db.name === LEGACY_DB_NAME)
    if (!legacyExists) return

    try {
      // Open legacy DB and read all records
      const records: DataUsageLog[] = await new Promise((resolve, reject) => {
        const request = indexedDB.open(LEGACY_DB_NAME, 1)
        request.onupgradeneeded = () => {
          // If upgrade needed, there's no data to migrate
          resolve([])
        }
        request.onsuccess = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.close()
            resolve([])
            return
          }
          const tx = db.transaction(STORE_NAME, 'readonly')
          const store = tx.objectStore(STORE_NAME)
          const allRequest = store.getAll()
          allRequest.onsuccess = () => {
            resolve(allRequest.result)
            db.close()
          }
          allRequest.onerror = () => {
            reject(allRequest.error)
            db.close()
          }
        }
        request.onerror = () => reject(request.error)
      })

      if (records.length === 0) {
        // No data to migrate, just remove legacy DB
        indexedDB.deleteDatabase(LEGACY_DB_NAME)
        return
      }

      // Open new DB and write records
      await new Promise<void>((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION)
        request.onupgradeneeded = () => {
          const db = request.result
          if (!db.objectStoreNames.contains(STORE_NAME)) {
            db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
              .createIndex('timestamp', 'timestamp', { unique: false })
          }
        }
        request.onsuccess = () => {
          const db = request.result
          const tx = db.transaction(STORE_NAME, 'readwrite')
          const store = tx.objectStore(STORE_NAME)
          for (const record of records) {
            // Remove the old auto-generated id so new one is assigned
            const { id, ...data } = record
            store.add(data)
          }
          tx.oncomplete = () => {
            db.close()
            // Now safe to delete legacy DB
            indexedDB.deleteDatabase(LEGACY_DB_NAME)
            resolve()
          }
          tx.onerror = () => reject(tx.error)
        }
        request.onerror = () => reject(request.error)
      })
    } catch (err) {
      console.error('Failed to migrate legacy database:', err)
      // Non-fatal: user may lose legacy usage logs
    }
  }

  async open(): Promise<IDBDatabase> {
    if (this.db) return this.db

    // Run migration before opening the new DB
    await DataUsageDB.migrateFromLegacy()

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION)

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result
        if (!db.objectStoreNames.contains(STORE_NAME)) {
          const store = db.createObjectStore(STORE_NAME, { keyPath: 'id', autoIncrement: true })
          store.createIndex('timestamp', 'timestamp', { unique: false })
          store.createIndex('sourceIP', 'sourceIP', { unique: false })
          store.createIndex('host', 'host', { unique: false })
          store.createIndex('outbound', 'outbound', { unique: false })
          store.createIndex('process', 'process', { unique: false })
        }
      }

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result
        resolve(this.db)
      }

      request.onerror = () => reject(request.error)
    })
  }

  async addLogs(logs: DataUsageLog[]): Promise<void> {
    if (logs.length === 0) return
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      logs.forEach((log) => store.add(log))
      tx.oncomplete = () => resolve()
      tx.onerror = () => reject(tx.error)
    })
  }

  async query(startTime: number, endTime: number): Promise<DataUsageLog[]> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readonly')
      const index = tx.objectStore(STORE_NAME).index('timestamp')
      const request = index.openCursor(IDBKeyRange.bound(startTime, endTime))
      const results: DataUsageLog[] = []

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result
        if (cursor) {
          results.push(cursor.value)
          cursor.continue()
        } else {
          resolve(results)
        }
      }

      request.onerror = () => reject(request.error)
    })
  }

  async clearAll(): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const request = tx.objectStore(STORE_NAME).clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  async cleanup(beforeTime: number): Promise<void> {
    const db = await this.open()
    return new Promise((resolve, reject) => {
      const tx = db.transaction([STORE_NAME], 'readwrite')
      const store = tx.objectStore(STORE_NAME)
      const request = store.index('timestamp').openKeyCursor(IDBKeyRange.upperBound(beforeTime))

      request.onsuccess = (event) => {
        const cursor = (event.target as IDBRequest<IDBCursor>).result
        if (cursor) {
          store.delete(cursor.primaryKey)
          cursor.continue()
        } else {
          resolve()
        }
      }

      request.onerror = () => reject(request.error)
    })
  }
}

export const db = new DataUsageDB()
