import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import fs from "fs";

let db = null;

export function initFirestore() {
  if (db) return db;

  if (getApps().length === 0) {
    if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
      const credentialsPath = process.env.GOOGLE_APPLICATION_CREDENTIALS;
      const serviceAccount = JSON.parse(
        fs.readFileSync(credentialsPath, "utf8"),
      );
      initializeApp({
        credential: cert(serviceAccount),
      });
    } else {
      initializeApp();
    }
  }

  const databaseId = process.env.FIRESTORE_DATABASE_ID || "(default)";
  db = getFirestore(undefined, databaseId);
  return db;
}

export function getDb() {
  if (!db) initFirestore();
  return db;
}

export async function upsertUser(uid, userData) {
  const db = getDb();
  const ref = db.collection("users").doc(uid);
  await ref.set(
    {
      ...userData,
      updatedAt: FieldValue.serverTimestamp(),
      createdAt: FieldValue.serverTimestamp(),
    },
    { merge: true },
  );
  return ref;
}

export async function getUser(uid) {
  const db = getDb();
  const doc = await db.collection("users").doc(uid).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function createRun(runData) {
  const db = getDb();
  const ref = await db.collection("runs").add({
    ...runData,
    createdAt: FieldValue.serverTimestamp(),
  });
  return ref.id;
}

export async function updateRun(runId, updates) {
  const db = getDb();
  await db
    .collection("runs")
    .doc(runId)
    .update({
      ...updates,
      updatedAt: FieldValue.serverTimestamp(),
    });
}

export async function getRunsByUser(userId, limit = 50) {
  const db = getDb();
  const snapshot = await db
    .collection("runs")
    .where("userId", "==", userId)
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

export async function getRun(runId) {
  const db = getDb();
  const doc = await db.collection("runs").doc(runId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}
