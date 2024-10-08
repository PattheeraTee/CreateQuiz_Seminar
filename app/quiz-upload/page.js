'use client';

import { useState } from 'react';
import mammoth from 'mammoth'; // Mammoth.js สำหรับอ่านไฟล์ .doc/.docx
import { v4 as uuidv4 } from 'uuid'; // ใช้สำหรับสร้าง unique id
import Link from 'next/link';

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
            <div key={index} className="bg-gray-800 p-4 my-4 shadow-lg rounded-lg">
                <p className="font-semibold text-lg mb-2 text-white">{q.text}</p>
                {q.imageUrl && (
                    <img src={q.imageUrl} alt={`Question ${index}`} className="w-full h-auto mb-4" />
                )}
                {q.options.map((choice, i) => (
                    <div key={i} className="flex items-center mb-2 text-white">
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
        const formData = new FormData(); // Create FormData to handle both text and image data
        const quizId = uuidv4(); // Unique ID for the quiz
        
        // Append the quiz ID and title (derived from the file name)
        formData.append('id', quizId);
        formData.append('title', quizTitle);
    
        // Loop through each question in the quiz
        const questions = quiz.map((question, questionIndex) => {
            // Prepare question data
            const questionData = {
                id: question.id || uuidv4(),  // Generate ID if not available
                quiz_id: quizId,
                text: question.text,          // Question text from DOCX file
                type: "radio",                // All questions are of type radio
                answer: question.answer,      // Selected answer
                options: [],                  // This will be populated with option data
                imageUrl: question.imageUrl || null,  // Question image (if any)
            };
    
            // If the question has an image, add it to FormData
            if (question.imageFile) {
                const imageBlob = question.imageFile;
                formData.append(`questionImage-${questionIndex}`, imageBlob, `question-${questionIndex}.jpg`);
            }
    
            // Process options and their images
            question.options.forEach((option, optionIndex) => {
                const optionData = {
                    text: option.text,              // Option text from DOCX file
                    option_image_url: null,         // Option image (if any)
                };
    
                // If the option has an image, append it to FormData
                if (option.option_image_url) {
                    const optionImageBlob = option.option_image_url;
                    formData.append(`optionImage-${questionIndex}-${optionIndex}`, optionImageBlob, `option-${questionIndex}-${optionIndex}.jpg`);
                    optionData.option_image_url = `optionImage-${questionIndex}-${optionIndex}.jpg`; // Set image URL for the option
                }
    
                // Append option data to the question's options array
                questionData.options.push(optionData);
            });
    
            return questionData;
        });
    
        // Append questions (as a JSON string) to FormData
        formData.append('questions', JSON.stringify(questions));
    
        // Log the FormData contents for debugging
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
    
        // Make the API request
        try {
            const response = await fetch('/api/testpost', {
                method: 'POST',
                body: formData,  // Send FormData
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
        <div className="max-w-4xl mx-auto p-8 bg-black text-white">
            <h1 className="text-3xl font-bold mb-6 text-center">สร้างแบบทดสอบจากไฟล์ .txt และ .doc</h1>
            <Link href="/" className="bg-sky-300 text-black p-3 rounded-md hover:bg-gray-600">
                Back
            </Link>
            <div className="flex justify-center mb-6">
                <input
                    type="file"
                    accept=".txt, .doc, .docx"
                    onChange={handleFileUpload}
                    className="bg-gray-700 border border-gray-500 rounded-lg p-2 w-full max-w-lg text-white"
                />
            </div>
            {errorMessage && (
                <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
            )}
            <div id="quizContainer">
                {quiz.length > 0 ? (
                    displayQuestion()
                ) : (
                    <p className="text-center text-gray-400">อัปโหลดไฟล์เพื่อสร้างแบบทดสอบ</p>
                )}
            </div>
            {quiz.length > 0 && (
                <div className="flex justify-center mt-6">
                    <Link href="/quizlist">
                    <button
                        onClick={handleSubmit}
                        className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded"
                    >
                        Create Quiz
                    </button>
                    </Link>
                   
                </div>
            )}
        </div>
    );
}
