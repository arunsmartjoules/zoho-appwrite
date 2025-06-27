import { Client, Databases } from "node-appwrite";
import dotenv from "dotenv";
dotenv.config();

const client = new Client();

client
  .setEndpoint(process.env.APPWRITE_ENDPOINT) // Your API Endpoint
  .setProject(process.env.APPWRITE_PROJECT_ID) // Your project ID
  .setKey(process.env.APPWRITE_DEV_KEY);

const databases = new Databases(client);
export { databases };
