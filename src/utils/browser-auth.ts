
import { ObjectId } from '../integrations/browser-mongodb/client';
import { getUsersCollection, getSessionsCollection, User, Session } from '../integrations/browser-mongodb/models/User';

// Helper function to hash passwords (simple for browser demo)
export const hashPassword = async (password: string): Promise<string> => {
  // Very simple hash function - NOT SECURE, just for demo
  return btoa(password + "salt123");
};

// Helper function to verify passwords
export const verifyPassword = async (password: string, hashedPassword: string): Promise<boolean> => {
  return hashPassword(password).then(hash => hash === hashedPassword);
};

// Helper function to generate a session token
export const generateToken = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

// Helper function to check if email is a test domain
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
