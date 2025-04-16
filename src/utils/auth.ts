
import { compare, hash } from 'bcryptjs';
import { ObjectId } from 'mongodb';
import * as crypto from 'crypto';
import { getUsersCollection, getSessionsCollection, User, Session } from '../integrations/mongodb/models/User';

// Helper function to hash passwords
export const hashPassword = async (password: string): Promise<string> => {
  return await hash(password, 12);
};

// Helper function to verify passwords
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return await compare(password, hashedPassword);
};

// Helper function to generate a session token
export const generateToken = (): string => {
  return crypto.randomBytes(64).toString('hex');
};

// Helper function to check if email is a test domain (for development purposes)
export const isTestEmailDomain = (email: string): boolean => {
  const testDomains = ['example.com', 'test.com', 'localhost.com', 'fake.com'];
  const domain = email.split('@')[1]?.toLowerCase();
  return testDomains.includes(domain);
};

// Create a new user
export const createUser = async (email: string, password: string): Promise<User> => {
  const usersCollection = getUsersCollection();
  
  // Check if user already exists
  const existingUser = await usersCollection.findOne({ email });
  if (existingUser) {
    throw new Error('User already exists');
  }
  
  // Hash the password
  const hashedPassword = await hashPassword(password);
  
  // Create the user
  const newUser: User = {
    email,
    password: hashedPassword,
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  const result = await usersCollection.insertOne(newUser);
  newUser._id = result.insertedId;
  
  return newUser;
};

// Sign in a user and create a session
export const signInUser = async (email: string, password: string): Promise<{ user: User, session: Session }> => {
  const usersCollection = getUsersCollection();
  const sessionsCollection = getSessionsCollection();
  
  // Find the user
  const user = await usersCollection.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }
  
  // Verify the password
  const isValid = await verifyPassword(password, user.password);
  if (!isValid) {
    throw new Error('Invalid email or password');
  }
  
  // Generate a token and create a session
  const token = generateToken();
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 7); // 7 days from now
  
  const session: Session = {
    userId: user._id!,
    token,
    expiresAt,
    createdAt: new Date()
  };
  
  await sessionsCollection.insertOne(session);
  
  return { user, session };
};

// Verify a session token
export const verifySession = async (token: string): Promise<{ user: User, session: Session } | null> => {
  const sessionsCollection = getSessionsCollection();
  const usersCollection = getUsersCollection();
  
  // Find the session
  const session = await sessionsCollection.findOne({ token, expiresAt: { $gt: new Date() } });
  if (!session) {
    return null;
  }
  
  // Find the user
  const user = await usersCollection.findOne({ _id: session.userId });
  if (!user) {
    return null;
  }
  
  return { user, session };
};

// Sign out a user by removing the session
export const signOutUser = async (token: string): Promise<void> => {
  const sessionsCollection = getSessionsCollection();
  await sessionsCollection.deleteOne({ token });
};
