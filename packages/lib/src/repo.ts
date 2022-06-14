import type { Db } from 'mongodb'

/**
 * Repository structure for Entity storage.
 */

export type Repo<T, ID extends keyof T & string> = {
  get(id: T[ID]): Promise<T | null>
  put(item: T): Promise<void>
  list(): Promise<T[]>
}

/**
 *
 * Repo implemented on top of mongodb
 *
 * @param db mongodb.Db
 * @param collectionName string
 * @param idField ID = keyof T
 * @returns Repo<T, ID>
 */

export const db = <T, ID extends keyof T & string>(
  db: Db,
  collectionName: string,
  idField: ID,
): Repo<T, ID> => {
  const get = async (id: T[ID]): Promise<T | null> => {
    return await db.collection(collectionName).findOne<T>({ [idField]: id })
  }

  const put = async (item: T) => {
    await db
      .collection(collectionName)
      .findOneAndReplace({ [idField]: item[idField] }, item, {
        upsert: true,
      })
  }

  const list = async () => {
    return db.collection<T>(collectionName).find().toArray() as Promise<T[]>
  }

  return { get, put, list }
}

/**
 *
 * Repo implemented on top of in memory record.
 *
 * @param db Record<string, T>
 * @param idField ID = keyof T
 * @returns Repo<T, ID>
 */

export const memory = <T, ID extends keyof T & string>(
  db: Record<string, T>,
  idField: ID,
): Repo<T, ID> => {
  const get = async (id: T[ID]): Promise<T | null> => {
    return await db[`${id}`]
  }

  const put = async (item: T) => {
    db[item[idField] as unknown as ID] = item
  }

  const list = async () => {
    return Object.values<T>(db)
  }

  return { get, put, list }
}
