import pg from "pg";

var conString =
  "postgres://akryysac:jo95Sa0X_87CYyylv4MDrpnhvrIJX0xj@drona.db.elephantsql.com/akryysac";

var client = new pg.Client(conString);

client.connect(function (err) {
  if (err) {
    return console.error("could not connect to postgres", err);
  }
  return console.error("Connected");
});

export default client;
