import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <h1 className="text-4xl font-bold mb-8 text-gray-900">หน้าหลัก</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <a
          href={`http://localhost:3000/quizlist`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          แบบทดสอบทั้งหมด
        </a>
        <a
          href={`http://localhost:3000/createquiz`}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          สร้างแบบทดสอบ
        </a>
        <a
          href={`http://localhost:3000/quiz-upload`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          อัพโหลดแบบทดสอบแบบตัวเลือก
        </a>
        <a
          href={`http://localhost:3000/quiz-upload-text`}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          อัพโหลดแบบทดสอบแบบเติมคำตอบ
        </a>
      </div>
    </div>
  );
}
