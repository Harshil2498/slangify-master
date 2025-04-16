
import { ObjectId } from 'mongodb';
import { getDb } from '../client';

export interface FavoriteSlang {
  _id?: ObjectId;
  userId: ObjectId;
  slangTerm: string;
  createdAt: Date;
}

export const getFavoriteSlangCollection = () => {
  const db = getDb();
  return db.collection<FavoriteSlang>('favorite_slangs');
};
