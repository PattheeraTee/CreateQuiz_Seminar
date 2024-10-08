'use client';
import { useState } from 'react';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { v4 as uuidv4 } from 'uuid';

export default function QuizUploadPage() {
    const [quiz, setQuiz] = useState([]);
    const [quizTitle, setQuizTitle] = useState('');
    const [errorMessage, setErrorMessage] = useState('');

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
        const result = await mammoth.convertToHtml({
            arrayBuffer: arrayBuffer,
            convertImage: mammoth.images.inline((element) => {
                return element.read("base64").then((imageBuffer) => {
                    return {
                        src: `data:${element.contentType};base64,${imageBuffer}`,
                    };
                });
            }),
        });
        return result.value;
    };

    const extractImagesFromDocx = async (zip) => {
        const images = {};
        const mediaFolder = zip.folder('word/media');
        if (mediaFolder) {
            const files = mediaFolder.file(/.+/);
            for (const file of files) {
                const blob = await file.async('blob');
                const imageUrl = URL.createObjectURL(blob);
                images[file.name] = imageUrl; // Store images with their names as keys
            }
        }
        return images;
    };

    const createQuizFromHtml = (html, images) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        const paragraphs = Array.from(tempDiv.querySelectorAll('p, img')); // Extract <p> and <img> elements
        
        const questions = [];
        let currentQuestion = null;
        let currentChoices = [];
        let currentImageUrl = null;
        let questionIndex = 0;

        paragraphs.forEach((element) => {
            if (element.tagName === 'P') {
                const trimmedText = element.innerText.trim();
                if (trimmedText) {
                    if (currentQuestion === null) {
                        currentQuestion = trimmedText; // This is a question
                    } else if (currentChoices.length < 4) {
                        currentChoices.push({ text: trimmedText, option_image_url: null }); // This is a choice
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
            } else if (element.tagName === 'IMG') {
                if (currentQuestion !== null && currentChoices.length === 0) {
                    currentImageUrl = element.src; // Image belongs to the question
                } else if (currentChoices.length > 0 && currentChoices.length <= 4) {
                    currentChoices[currentChoices.length - 1].option_image_url = element.src; // Image belongs to the last choice
                }
            }
        });

        setQuiz(questions);
    };

    const displayQuestion = () => {
        return quiz.map((q, index) => (
            <div key={index} className="bg-white p-4 my-4 shadow-lg rounded-lg">
                <p className="font-semibold text-lg mb-2 text-black">{q.text}</p>
    
                {/* Display question image */}
                {q.imageUrl && (
                    <img src={q.imageUrl} alt={`Question Image ${index}`} className="w-full h-auto mb-4" />
                )}
    
                {/* Display choices with images if available */}
                {q.options.map((choice, i) => (
                    <div key={i} className="flex flex-col mb-2 text-black">
                        <div className="flex items-center">
                            <input
                                type="radio"
                                name={`question${index}`}
                                value={choice.text}
                                onChange={(e) => handleAnswerChange(index, e.target.value)}
                                className="mr-2"
                            />
                            <label>{choice.text}</label>
                        </div>
    
                        {/* Display option image if available */}
                        {choice.option_image_url && (
                            <img src={choice.option_image_url} alt={`Option Image ${i}`} className="w-4/5 h-auto mt-2" />
                        )}
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
        const formData = new FormData(); // Create FormData to handle both text and image data
        const quizId = uuidv4(); // Unique ID for the quiz
        
        // Append the quiz ID and title (derived from the file name)
        formData.append('id', quizId);
        formData.append('title', quizTitle);
    
        // Loop through each question in the quiz
        quiz.forEach((question, questionIndex) => {
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
                formData.append(`questionImage-${questionIndex}`, question.imageFile, `question-${questionIndex}.jpg`);
            }
    
            // Process options and their images
            question.options.forEach((option, optionIndex) => {
                const optionData = {
                    text: option.text,              // Option text from DOCX file
                    option_image_url: null,         // Option image (if any)
                };
    
                // Check if the option has an image and ensure it's a File/Blob
                if (option.option_image_url instanceof File) {
                    formData.append(`optionImage-${questionIndex}-${optionIndex}`, option.option_image_url, `option-${questionIndex}-${optionIndex}.jpg`);
                    optionData.option_image_url = `optionImage-${questionIndex}-${optionIndex}.jpg`; // Set image URL for the option
                }
    
                // Append option data to the question's options array
                questionData.options.push(optionData);
            });
    
            // Append the question data as a JSON string to the FormData
            formData.append(`questions-${questionIndex}`, JSON.stringify(questionData));
        });
    
        // Log the FormData contents for debugging
        console.log('Submitting formData to the API...');
        for (const pair of formData.entries()) {
            console.log(`${pair[0]}:`, pair[1]);
        }
        console.log('-----------------------------');
        // Make the API request
        try {
            console.log("---------------TRY-------------------")
            const response = await fetch('/api/testpost', {
                method: 'POST',
                body: formData,  // Send FormData
            });
            console.log("---------------RESPONSE-------------------")
            // Log the entire response for debugging
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
    
            if (!response.ok) {
                // Log more details of the response in case of an error
                const errorText = await response.text();
                console.error("FormData Error: ", errorText);  // Log API response text for more details
                throw new Error('Failed to create quiz');
            }
    
            const result = await response.json();
            console.log('Quiz created successfully:', result);
        } catch (error) {
            // Log the error with more detail
            console.error('Error creating quiz:', error.message);
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
