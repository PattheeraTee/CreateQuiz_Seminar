// import mysql from "mysql2/promise";
// const pool = mysql.createPool({
//     host: "localhost",
//     user: "root",
//     password: "1",
//     database: "pattheera_db",
//     port: 3307,
//     waitForConnections: true
// });
// export default pool;

import { MongoClient } from "mongodb";

const url = "mongodb://localhost:27017"; // MongoDB server URL
const client = new MongoClient(url);

const connectToDatabase = async () => {
    try {
        // Connect the client to the server
        await client.connect();
        console.log("Connected successfully to MongoDB server");

        // Choose the database to work with
        const db = client.db("pattheera_db");

        return db;
    } catch (error) {
        console.error("Failed to connect to MongoDB", error);
    }
};

export default connectToDatabase;
