
import { ObjectId } from 'mongodb';
import { getDb } from '../client';

export interface User {
  _id?: ObjectId;
  email: string;
  password: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Session {
  _id?: ObjectId;
  userId: ObjectId;
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
