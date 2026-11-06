import { MongoClient, BSON } from "mongodb";

declare global {
  var __db: MongoClient | undefined;
}

let connectionString: string = process.env.MONGODB_CONNECTION_STRING || "";

if (!connectionString) {
  throw new Error(
    "No connection string provided. \n\nPlease create a `.env` file in the root of this project. Add a CONNECTION_STRING variable to that file with the connection string to your MongoDB cluster. \nRefer to the README.md file for more information."
  );
}
if (connectionString.indexOf("appName") === -1)
  connectionString +=
    connectionString.indexOf("?") > -1
      ? "&appName=devrel.template.remix|"
      : "?appName=devrel.template.remix|";
else
  connectionString = connectionString.replace(
    /appName\=([a-z0-9]*)/i,
    (_m: string, p: string) => `appName=devrel.template.remix|${p}`
  );

let client: MongoClient;

if (process.env.NODE_ENV === "production") {
  client = new MongoClient(connectionString);
} else {
  if (!global.__db) {
    global.__db = new MongoClient(connectionString);
  }
  client = global.__db;
}

const ObjectId = BSON.ObjectId;

export { client, ObjectId };