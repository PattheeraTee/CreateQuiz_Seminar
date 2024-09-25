'use client';

import { useState } from 'react';
import mammoth from 'mammoth'; // For extracting text from .docx files
import JSZip from 'jszip'; // For extracting images from .docx files
import { v4 as uuidv4 } from 'uuid'; // For generating unique IDs

export default function QuizUploadPage() {
    const [quiz, setQuiz] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [extractedImages, setExtractedImages] = useState([]); // State for storing extracted images

    const handleFileUpload = (event) => {
        const file = event.target.files[0];
        if (!file) {
            alert('Please select a file.');
            return;
        }

        const fileTitle = file.name.split('.')[0];
        setQuizTitle(fileTitle);

        const fileType = file.name.split('.').pop().toLowerCase();
        if (fileType === 'txt') {
            handleTxtFile(file);
        } else if (fileType === 'doc' || fileType === 'docx') {
            handleDocFile(file);
        } else {
            alert('Supported formats are .txt, .doc, and .docx only.');
        }
    };

    const handleTxtFile = (file) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            createQuiz(e.target.result);
        };
        reader.readAsText(file);
    };

    const handleDocFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const zip = await JSZip.loadAsync(arrayBuffer); // Load the docx file as a zip
                const text = await extractTextFromDocx(arrayBuffer);
                const images = await extractImagesFromDocx(zip);
                createQuizFromHtml(text, images);
            } catch (err) {
                setErrorMessage('Error reading the DOC/DOCX file.');
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const extractTextFromDocx = async (arrayBuffer) => {
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        return result.value;
    };

    const extractImagesFromDocx = async (zip) => {
        const images = {};
        const imageUrls = []; // Array to store the image URLs for display
        const mediaFolder = zip.folder('word/media');
        if (mediaFolder) {
            const files = mediaFolder.file(/.+/); // Get all files in 'word/media'
            for (const file of files) {
                const blob = await file.async('blob');
                const imageUrl = URL.createObjectURL(blob);
                images[file.name] = imageUrl; // Store images with their names as keys
                imageUrls.push(imageUrl); // Add image URL to array for display
            }
        }
        setExtractedImages(imageUrls); // Set extracted images for rendering
        return images;
    };

    const createQuizFromHtml = (text, images) => {
        const paragraphs = text.split('\n');
        const questions = [];
        let currentQuestion = null;
        let currentChoices = [];
        let currentImageUrl = null;
        let questionIndex = 0;

        paragraphs.forEach((paragraph) => {
            const trimmedText = paragraph.trim();
            if (trimmedText) {
                if (currentQuestion === null) {
                    currentQuestion = trimmedText; // This is a question
                } else if (currentChoices.length < 4) {
                    currentChoices.push(trimmedText); // This is a choice
                }

                if (currentChoices.length === 4) {
                    questions.push({
                        id: questionIndex + 1,
                        quiz_id: uuidv4(),
                        text: currentQuestion,
                        type: 'radio',
                        answer: '',
                        options: [...currentChoices],
                        imageUrl: currentImageUrl, // Assign image to the question
                    });
                    currentQuestion = null;
                    currentChoices = [];
                    currentImageUrl = null;
                    questionIndex++;
                }
            }
        });

        setQuiz(questions);
    };

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

    const handleAnswerChange = (questionIndex, value) => {
        const updatedQuiz = [...quiz];
        updatedQuiz[questionIndex].answer = value;
        setQuiz(updatedQuiz);
    };

    const handleSubmit = async () => {
        const payload = {
            id: uuidv4(),
            title: quizTitle,
            questions: quiz.map((question) => ({
                id: question.id,
                quiz_id: question.quiz_id,
                text: question.text,
                type: question.type,
                answer: question.answer,
                options: question.options,
                imageUrl: question.imageUrl,
            })),
        };

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
            <h1 className="text-3xl font-bold mb-6 text-center text-black">Create Quiz from .txt and .doc</h1>
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
                    <p className="text-center text-gray-900">Upload a file to create a quiz</p>
                )}
                {extractedImages.length > 0 && (
                <div className="mt-8">
                    <h2 className="text-2xl font-bold mb-4 text-center text-black">Extracted Images</h2>
                    <div className="grid grid-cols-2 gap-4">
                        {extractedImages.map((src, index) => (
                            <img key={index} src={src} alt={`Extracted ${index}`} className="w-full h-auto" />
                        ))}
                    </div>
                </div>
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
