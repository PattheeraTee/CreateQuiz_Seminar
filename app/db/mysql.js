import mysql from "mysql2/promise";
const pool = mysql.createPool({
    host: "localhost",
    user: "root",
    password: "1",
    database: "pattheera_db",
    port: 3307,
    waitForConnections: true
});
export default pool;