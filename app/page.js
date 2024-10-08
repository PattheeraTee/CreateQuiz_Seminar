import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-4">
      <h1 className="text-4xl font-bold mb-8 text-white">หน้าหลัก</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
        <Link
          href={`/quizlist`}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          แบบทดสอบทั้งหมด
        </Link>
        <Link
          href={`/createquiz`}
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          สร้างแบบทดสอบ
        </Link>
        <Link
          href={`/quiz-upload`}
          className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          อัพโหลดแบบทดสอบแบบตัวเลือก
        </Link>
        <Link
          href={`/quiz-upload-text`}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          อัพโหลดแบบทดสอบแบบเติมคำตอบ
        </Link>
        <Link 
        href={`/generate-quiz`}
        className="bg-violet-500 hover:bg-violet-600 text-white font-bold py-4 px-6 rounded shadow-lg transition-transform transform hover:scale-105"
        >
          สร้างแบบทดสอบจากเนื้อหา
        </Link>
      </div>
    </div>
  );
}
