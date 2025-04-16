
import { ObjectId, getDb } from '../client';

export interface FavoriteSlang {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  slangTerm: string;
  createdAt: Date;
}

export const getFavoriteSlangCollection = () => {
  const db = getDb();
  return db.collection<FavoriteSlang>('favorite_slangs');
};
