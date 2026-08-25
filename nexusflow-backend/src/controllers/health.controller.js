
export function getHealth( req, res ) {
  res.json( {
    ok: true,
    service: "nexusflow-backend",
    day: 1,
    time: new Date().toISOString(),
  } );
}
