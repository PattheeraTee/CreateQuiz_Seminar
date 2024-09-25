import { NextRequest,NextResponse } from "next/server";
import pool from "../../db/mysql.js";
export async function GET(){
    try{
        const connection = await pool.getConnection();
        const [rows] = await connection.query("SELECT * FROM `company`");
        connection.release();
        return NextResponse.json(rows);
    }catch(error){
        return NextResponse.json({
            error: error
        },{status:500});
    }
}