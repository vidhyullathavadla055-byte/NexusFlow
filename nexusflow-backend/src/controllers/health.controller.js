import { getDb } from "../config/db.js";
import { getClientCount } from "../websocket/wsServer.js";


export async function getHealth(req, res) {
  let dbOk = false;
  try {
    await getDb().command({ ping: 1 });
    dbOk = true;
  } catch {
    dbOk = false;
  }

  const ok = dbOk;
  res.status(ok ? 200 : 503).json({
    ok,
    service: "nexusflow-backend",
    db: dbOk ? "connected" : "unreachable",
    wsClients: getClientCount(),
    time: new Date().toISOString(),
  });
}
