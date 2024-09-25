import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // ดึงข้อมูล JSON จาก request body
    const { id } = await request.json();

    if (!id) {
      throw new Error("Quiz ID is required");
    }

    // ตัวอย่างข้อมูลแบบทดสอบ (คุณอาจจะดึงข้อมูลจากฐานข้อมูลจริง)
    const quizData = {
      id,
      title: "Sample Quiz Title",
      questions: [
        {
          text: "What is your name?",
          type: "text",
          options: [],
          answer: ""
        },
        {
          text: "Choose a color",
          type: "radio",
          options: ["Red", "Green", "Blue"],
          answer: ""
        }
      ]
    };

    // ส่งข้อมูลแบบทดสอบกลับไป
    return NextResponse.json(quizData);
    
  } catch (error) {
    console.error("Error fetching quiz data:", error); // Log ข้อผิดพลาดเพื่อการดีบัก

    // ส่งข้อผิดพลาดกลับไปให้ client
    return NextResponse.json(
      { 
        error: error.message || "Something went wrong" 
      },
      { status: 500 }
    );
  }
}
