'use client';

import { useState } from 'react';
import mammoth from 'mammoth'; // Mammoth.js สำหรับอ่านไฟล์ .doc/.docx
import { v4 as uuidv4 } from 'uuid'; // ใช้สำหรับสร้าง unique id

export default function QuizUploadPage() {
    const [quizContent, setQuizContent] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [quiz, setQuiz] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [fileName, setFileName] = useState('');

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('กรุณาเลือกไฟล์ก่อน');
            return;
        }

        const fileTitle = file.name.split('.')[0]; // ตั้งชื่อแบบทดสอบจากชื่อไฟล์
        setFileName(fileTitle); // กำหนดชื่อไฟล์
        setQuizTitle(fileTitle); // ใช้ชื่อไฟล์เป็นชื่อแบบทดสอบ

        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType === 'txt') {
            handleTxtFile(file);
        } else if (fileType === 'doc' || fileType === 'docx') {
            handleDocFile(file);
        } else {
            alert('รองรับเฉพาะไฟล์ .txt, .doc, .docx');
        }
    };

    const handleTxtFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                createQuiz(e.target.result);
            } catch (err) {
                setErrorMessage('เกิดข้อผิดพลาดในการสร้างแบบทดสอบจากไฟล์ .txt');
                console.error(err);
            }
        };
        reader.readAsText(file);
    };

    const handleDocFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            mammoth.convertToHtml({ arrayBuffer: e.target.result })
                .then((result) => {
                    try {
                        const html = result.value; // HTML content including images in base64
                        const messages = result.messages;

                        createQuizFromHtml(html);
                    } catch (err) {
                        setErrorMessage('เกิดข้อผิดพลาดในการสร้างแบบทดสอบจากไฟล์ DOC/DOCX');
                        console.error(err);
                    }
                })
                .catch((err) => {
                    setErrorMessage('ไม่สามารถแยกข้อความจากไฟล์ DOC/DOCX ได้');
                    console.error(err);
                });
        };
        reader.readAsArrayBuffer(file);
    };

    const createQuizFromHtml = (html) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;

        const questions = [];
        let currentQuestion = null;
        let currentChoices = [];
        let questionIndex = 0;

        tempDiv.childNodes.forEach((node) => {
            if (node.nodeName === 'P') {
                const text = node.innerText.trim();
                if (text) {
                    if (currentQuestion === null) {
                        currentQuestion = text; // This is a question
                    } else if (currentChoices.length < 4) {
                        currentChoices.push(text); // This is a choice
                    }

                    if (currentChoices.length === 4) {
                        questions.push({
                            id: questionIndex + 1,
                            quiz_id: uuidv4(),
                            text: currentQuestion,
                            type: 'radio',
                            answer: '',
                            options: [...currentChoices],
                        });
                        currentQuestion = null;
                        currentChoices = [];
                        questionIndex++;
                    }
                }
            } else if (node.nodeName === 'IMG') {
                const imageUrl = node.getAttribute('src');
                if (currentQuestion !== null) {
                    questions.push({
                        id: questionIndex + 1,
                        quiz_id: uuidv4(),
                        text: currentQuestion,
                        type: 'radio',
                        answer: '',
                        options: currentChoices,
                        imageUrl: imageUrl,
                    });
                    currentQuestion = null;
                    currentChoices = [];
                    questionIndex++;
                }
            }
        });

        setQuiz(questions);
    };

    // ฟังก์ชันสำหรับแสดงคำถามและตัวเลือก
    const displayQuestion = () => {
        return quiz.map((q, index) => (
            <div key={index} className="bg-white p-4 my-4 shadow-lg rounded-lg">
                <p className="font-semibold text-lg mb-2 text-black">{q.text}</p>
                {q.imageUrl && (
                    <img src={q.imageUrl} alt={`Question ${index}`} className="w-full h-auto mb-4" />
                )}
                {q.options.map((choice, i) => (
                    <div key={i} className="flex items-center mb-2 text-black">
                        <input
                            type="radio"
                            name={`question${index}`}
                            value={choice}
                            onChange={(e) => handleAnswerChange(index, e.target.value)}
                            className="mr-2"
                        />
                        <label>{choice}</label>
                    </div>
                ))}
            </div>
        ));
    };

    // ฟังก์ชันสำหรับจัดการเมื่อผู้ใช้เลือกคำตอบ
    const handleAnswerChange = (questionIndex, value) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[questionIndex].answer = value;
        setQuiz(updatedQuiz);
    };

    const handleSubmit = async () => {
        const payload = {
            id: uuidv4(), // สร้าง unique id สำหรับ quiz
            title: quizTitle, // ใช้ชื่อไฟล์เป็น title ของ quiz
            questions: quiz.map((question) => ({
                id: question.id,
                quiz_id: question.quiz_id,
                text: question.text,
                type: question.type,
                answer: question.answer, // ส่งคำตอบที่ผู้ใช้เลือก
                options: question.options,
                imageUrl: question.imageUrl, // Add image URL
            })),
        };

        // console.log ข้อมูล payload ที่จะส่งไปยัง API
        console.log('Sending quiz payload:', payload);

        try {
            const response = await fetch('/api/testpost', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            });

            if (!response.ok) {
                throw new Error('Failed to create quiz');
            }

            const result = await response.json();
            console.log('Quiz created successfully:', result);
        } catch (error) {
            console.error('Error creating quiz:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-center text-black">สร้างแบบทดสอบจากไฟล์ .txt และ .doc</h1>
            <div className="flex justify-center mb-6">
                <input
                    type="file"
                    accept=".txt, .doc, .docx"
                    onChange={handleFileUpload}
                    className="bg-blue-50 border border-blue-300 rounded-lg p-2 w-full max-w-lg text-black"
                />
            </div>
            {errorMessage && (
                <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
            )}
            <div id="quizContainer">
                {quiz.length > 0 ? (
                    displayQuestion()
                ) : (
                    <p className="text-center text-gray-900">อัปโหลดไฟล์เพื่อสร้างแบบทดสอบ</p>
                )}
            </div>
            {quiz.length > 0 && (
                <div className="flex justify-center mt-6">
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Create Quiz
                    </button>
                </div>
            )}
        </div>
    );
}
