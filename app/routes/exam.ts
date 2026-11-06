/*
  SERVER ONLY. Keeps track of exam "sessions" - one document per exam,
  so the token route (api.exam-token.ts) has something to check before
  handing out a join token, and so the teacher page knows which room
  id to join.

  This is deliberately small. It does not store video - the SFU
  provider holds the live streams, this collection only holds the
  metadata: which exam, is it open, who's allowed in.
*/

import { client } from "~/.server/mongo";

export type ExamSessionDoc = {
  examId: string; // also used as the SFU "room" name
  title: string;
  teacherName: string;
  status: "scheduled" | "live" | "ended";
  createdAt: Date;
};

const db = client.db("reactNative");
const examSessions = db.collection<ExamSessionDoc>("examSessions");

let indexReady = false;

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