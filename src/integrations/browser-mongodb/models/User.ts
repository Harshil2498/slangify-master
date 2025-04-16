
import { ObjectId, getDb } from '../client';

export interface User {
  _id?: ObjectId | string;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id?: ObjectId | string;
  userId: ObjectId | string;
  token: string;
  expiresAt: Date;
  createdAt: Date;
}

export const getUsersCollection = () => {
  const db = getDb();
  return db.collection<User>('users');
};

export const getSessionsCollection = () => {
  const db = getDb();
  return db.collection<Session>('sessions');
};
