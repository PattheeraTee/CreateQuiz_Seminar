import { NextResponse } from "next/server";
import pool from "../../db/mysql.js"; // นำเข้า pool จากการตั้งค่าฐานข้อมูล

export async function GET() {
  const connection = await pool.getConnection(); // เชื่อมต่อกับฐานข้อมูล

  try {
    // ดึงข้อมูล id และ title ของแบบทดสอบทั้งหมดจากฐานข้อมูล
    const [quizResult] = await connection.query("SELECT id, title FROM quizzes");

    connection.release(); // ปล่อยการเชื่อมต่อหลังจากการ query เสร็จสิ้น

    // ส่งข้อมูล id และ title ของแบบทดสอบทั้งหมดกลับไป
    return NextResponse.json({
      quizzes: quizResult,
    });

  } catch (error) {
    connection.release(); // ปล่อยการเชื่อมต่อในกรณีเกิดข้อผิดพลาด
    console.error("Error fetching quizzes:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}