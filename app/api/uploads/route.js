import { existsSync } from "fs";
import { readdir, unlink, writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from 'path';
import pool from "../../db/mysql.js"; // นำเข้า pool จากการตั้งค่าฐานข้อมูล

// กำหนดการตั้งค่าไม่ให้ใช้ bodyParser ของ Next.js
export const config = {
  api: {
    bodyParser: false,
  },
};

// GET Method: ดึงรายการรูปภาพจากฐานข้อมูล
export const GET = async () => {
  const connection = await pool.getConnection();
  try {
    const [rows] = await connection.query("SELECT * FROM images");
    connection.release();
    return NextResponse.json({ msg: "Images fetched successfully", files: rows });
  } catch (error) {
    connection.release();
    console.error("Error fetching images:", error);
    return NextResponse.json({ error: "Failed to fetch images" }, { status: 500 });
  }
};

// DELETE Method: ลบรูปภาพและ path ออกจากฐานข้อมูล
export const DELETE = async (request) => {
  const imageName = request.nextUrl.searchParams.get("image");

  if (!imageName) {
    return NextResponse.json({ error: "Image name is required" }, { status: 400 });
  }

  try {
    const connection = await pool.getConnection();

    // ลบรูปภาพออกจากโฟลเดอร์
    if (existsSync(`./public/images/${imageName}`)) {
      await unlink(`./public/images/${imageName}`);
    }

    // ลบ path ของรูปภาพออกจากฐานข้อมูล
    await connection.query('DELETE FROM images WHERE path = ?', [`/images/${imageName}`]);
    connection.release();

    return NextResponse.json({ msg: "Image deleted successfully" });
  } catch (error) {
    console.error("Error deleting image:", error);
    return NextResponse.json({ error: "Failed to delete image" }, { status: 500 });
  }
};

// POST Method: อัปโหลดรูปภาพและบันทึก path ลงในฐานข้อมูล
export const POST = async (request) => {
  const file = await request.formData();
  const image = file.get("image");

  if (!image) {
    return NextResponse.json({ error: "No image uploaded" }, { status: 400 });
  }

  const byteLength = await image.arrayBuffer();
  const bufferData = Buffer.from(byteLength);

  const imagePath = `/images/${new Date().getTime()}${path.extname(image.name)}`;
  const pathOfImage = `./public${imagePath}`;

  try {
    // บันทึกไฟล์ลงในโฟลเดอร์
    await writeFile(pathOfImage, bufferData);

    // บันทึก path ของรูปภาพลงในฐานข้อมูล
    const connection = await pool.getConnection();
    await connection.query('INSERT INTO images (path) VALUES (?)', [imagePath]);
    connection.release();

    return NextResponse.json({ msg: "Image uploaded successfully", filePath: imagePath });
  } catch (error) {
    console.error("Error uploading image:", error);
    return NextResponse.json({ error: "Failed to upload image" }, { status: 500 });
  }
};
