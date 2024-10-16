'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';

export default function QuizListPage() {
  const [quizzes, setQuizzes] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const response = await fetch('http://localhost:3001/quiz');
        if (!response.ok) {
          throw new Error('Failed to fetch quizzes');
        }
        const data = await response.json(); // อ่านข้อมูลจาก response เพียงครั้งเดียว
        console.log('Fetched quizzes:', data); // ตรวจสอบข้อมูลที่ได้รับ
        setQuizzes(data || []); // ตั้งค่า quizzes จากผลลัพธ์ที่ได้เป็นอาเรย์
      } catch (error) {
        console.error('Error fetching quizzes:', error);
        setError('Error fetching quizzes');
      }
    };

    fetchQuizzes(); // เรียกใช้ฟังก์ชันเพื่อดึงข้อมูล
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6 text-center">รายการแบบทดสอบ</h1>
      <Link href="/" className='bg-sky-300 text-black p-3 rounded-md hover:bg-sky-600'>
        Back
      </Link>
      {error && <p className="text-red-500 text-center">{error}</p>}
      <ul className='mt-6'>
        {quizzes.length > 0 ? (
          quizzes.map((quiz) => (
            <li key={quiz.id} className="mb-4 p-4 bg-gray-100 rounded">
              <div className="flex justify-between items-center">
                {/* แสดงชื่อของ quiz จาก coverPage.quizTitle */}
                <span className="text-lg font-semibold text-black">{quiz.coverPage.quizTitle}</span>
              </div>
            </li>
          ))
        ) : (
          <p className="text-center">ไม่มีแบบทดสอบ</p>
        )}
      </ul>
    </div>
  );
}
