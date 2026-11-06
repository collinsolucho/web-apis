import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import { client } from "~/.server/mongo";

const scrypt = promisify(scryptCallback);

export type UserDoc = {
  name: string;
  email: string;
  department: string;
  course: string;
  passwordHash: string;
  createdAt: Date;
};

const db = client.db("reactNative");
const accounts = db.collection<UserDoc>("accounts");

let indexReady = false;

// Get the accounts collection and make sure emails are unique
export async function getUsers() {
  if (!indexReady) {
    await accounts.createIndex({ email: 1 }, { unique: true });
    indexReady = true;
  }
  return accounts;
}

export type NewUser = {
  name: string;
  email: string;
  department: string;
  course: string;
  password: string;
};

// Save a new user. Returns { ok: false } if the email is already taken
export async function createUser({ name, email, department, course, password }: NewUser) {
  const users = await getUsers();
  try {
    await users.insertOne({
      name,
      email: email.trim().toLowerCase(),
      department,
      course,
      passwordHash: await hashPassword(password), // never store the plain password
      createdAt: new Date(),
    });
    return { ok: true as const };
  } catch (error: any) {
    // 11000 means the unique email index found a duplicate
    if (error?.code === 11000) return { ok: false as const, reason: "duplicate" as const };
    throw error;
  }
}

// Turn a password into "salt:hash" for storing
export async function hashPassword(password: string) {
  const salt = randomBytes(16);
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt.toString("hex")}:${hash.toString("hex")}`;
}

// Use this later for login
export async function verifyPassword(password: string, stored: string) {
  const [saltHex, hashHex] = stored.split(":");
  if (!saltHex || !hashHex) return false;

  const hash = (await scrypt(password, Buffer.from(saltHex, "hex"), 64)) as Buffer;
  const expected = Buffer.from(hashHex, "hex");

  // timingSafeEqual throws if the lengths differ
  if (hash.length !== expected.length) return false;
  return timingSafeEqual(hash, expected);
}