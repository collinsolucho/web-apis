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



export type ExamSessionDoc = {
  examId: string; // also used as the SFU "room" name
  title: string;
  teacherName: string;
  status: "scheduled" | "live" | "ended";
  createdAt: Date;
};

const examSessions = db.collection<ExamSessionDoc>("examSessions");

async function getExamSessions() {
  if (!indexReady) {
    await examSessions.createIndex({ examId: 1 }, { unique: true });
    indexReady = true;
  }
  return examSessions;
}

// Look up one exam session by its id. Returns null if it doesn't exist
export async function getExamSession(examId: string) {
  const sessions = await getExamSessions();
  return sessions.findOne({ examId });
}

// A teacher calls this to open a new exam session
export async function createExamSession(examId: string, title: string, teacherName: string) {
  const sessions = await getExamSessions();
  await sessions.insertOne({
    examId,
    title,
    teacherName,
    status: "scheduled",
    createdAt: new Date(),
  });
}

// Mark a session as live or ended, e.g. when the teacher starts/stops watching
export async function setExamSessionStatus(examId: string, status: ExamSessionDoc["status"]) {
  const sessions = await getExamSessions();
  await sessions.updateOne({ examId }, { $set: { status } });
}