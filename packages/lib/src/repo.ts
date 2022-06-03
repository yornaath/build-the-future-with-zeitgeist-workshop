// import type { Db, WithId } from 'mongodb'

// export type Repo<T> = {
//   get(id: keyof T): Promise<T | null>
//   put(item: T): Promise<void>
//   list(): Promise<WithId<T>[]>
// }

// export const db = <T>(
//   db: Db,
//   collectionName: string,
//   idField: keyof T,
// ): Repo<T> => {
//   const get = async (id: keyof T): Promise<T | null> => {
//     return await db.collection(collectionName).findOne<T>({ [idField]: id })
//   }

//   const put = async (item: T) => {
//     await db
//       .collection(collectionName)
//       .findOneAndReplace({ [idField]: item[idField] }, item, {
//         upsert: true,
//       })
//   }

//   const list = async () => {
//     return db.collection<T>(collectionName).find().toArray()
//   }

//   return { get, put, list }
// }

// export const memory = <T, ID extends keyof T & string>(
//   db: Record<ID, T>,
//   idField: ID,
// ): Repo<T> => {
//   const get = async (id: ID): Promise<T | null> => {
//     return await db[id]
//   }

//   const put = async (item: T) => {
//     db[idField]
//   }

//   const list = async () => {
//     return Object.values(db)
//   }

//   return { get, put, list }
// }
