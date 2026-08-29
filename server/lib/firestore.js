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
  const { runId, ...data } = runData;
  const ref = db.collection("runs").doc(runId);
  await ref.set({
    ...data,
    runId,
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
  const query = db.collection("runs").where("userId", "==", userId);

  try {
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .get();
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    if (error.code !== 9) throw error;

    console.warn(
      "Firestore composite index for runs is unavailable; using an in-memory fallback.",
    );
    const snapshot = await query.get();
    return snapshot.docs
      .map((doc) => ({ id: doc.id, ...doc.data() }))
      .sort(
        (left, right) =>
          (right.createdAt?.toMillis?.() ?? 0) -
          (left.createdAt?.toMillis?.() ?? 0),
      )
      .slice(0, limit);
  }
}

export async function getRun(runId) {
  const db = getDb();
  const doc = await db.collection("runs").doc(runId).get();
  return doc.exists ? { id: doc.id, ...doc.data() } : null;
}

export async function updateRunTaskStatus(runId, taskId, status) {
  const db = getDb();
  const ref = db.collection("runs").doc(runId);
  const snapshot = await ref.get();
  if (!snapshot.exists) return null;

  const tasks = snapshot.data()?.tasks || [];
  const updatedTasks = tasks.map((t) =>
    t.id === taskId ? { ...t, status: Boolean(status) } : t,
  );

  await ref.update({
    tasks: updatedTasks,
    updatedAt: FieldValue.serverTimestamp(),
  });

  return updatedTasks;
}
