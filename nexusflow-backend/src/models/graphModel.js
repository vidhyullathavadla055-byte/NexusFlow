import { getDb } from "../config/db.js";
import { ObjectId } from "mongodb";

const COLLECTION = "graphs";

export async function saveGraph({ name, nodes, edges, status = "draft", owner }) {
  const now = new Date();
  const doc = { name, nodes, edges, status, owner, createdAt: now, updatedAt: now };
  const result = await getDb().collection(COLLECTION).insertOne(doc);
  return { _id: result.insertedId, ...doc };
}

export async function updateGraph(id, { name, nodes, edges, status }) {
  const update = { updatedAt: new Date() };
  if (name !== undefined) update.name = name;
  if (nodes !== undefined) update.nodes = nodes;
  if (edges !== undefined) update.edges = edges;
  if (status !== undefined) update.status = status;

  await getDb()
    .collection(COLLECTION)
    .updateOne({ _id: new ObjectId(id) }, { $set: update });
  return getGraph(id);
}

export async function getGraph(id) {
  return getDb().collection(COLLECTION).findOne({ _id: new ObjectId(id) });
}

/** Scoped to one user by default — pass no owner only for internal/admin use. */
export async function listGraphs({ owner } = {}) {
  const query = owner ? { owner } : {};
  return getDb().collection(COLLECTION).find(query).sort({ updatedAt: -1 }).toArray();
}

export async function deleteGraph(id) {
  return getDb().collection(COLLECTION).deleteOne({ _id: new ObjectId(id) });
}
