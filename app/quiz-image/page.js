"use client";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid";
import axios from 'axios';

export default function Createquiz() {
  const [questions, setQuestions] = useState([]);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState(null);
  const [quizTitle, setQuizTitle] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const addQuestion = () => {
    setQuestions([
      ...questions,
      {
        text: "",
        type: "radio",
        options: [""],
        date: "",
        answer: "",
        imageFile: null,
        optionImageFiles: [],
      },
    ]);
    setEditingQuestionIndex(questions.length);
  };

  const deleteQuestion = (index) => {
    setQuestions(questions.filter((_, i) => i !== index));
    if (editingQuestionIndex === index) {
      setEditingQuestionIndex(null);
    }
  };

  const handleQuestionTextChange = (index, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].text = text;
    setQuestions(updatedQuestions);
  };

  const handleQuestionTypeChange = (index, type) => {
    const updatedQuestions = [...questions];
    updatedQuestions[index].type = type;
    if (type !== "radio" && type !== "checkbox" && type !== "dropdown" && type !== "date") {
      updatedQuestions[index].options = [];
      updatedQuestions[index].optionImageFiles = [];
    } else {
      if (!updatedQuestions[index].options.length) {
        updatedQuestions[index].options = [""];
        updatedQuestions[index].optionImageFiles = [null];
      }
    }
    setQuestions(updatedQuestions);
  };

  const handleDropdownChange = (questionIndex, value) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answer = value; // Update the selected answer for dropdown
    setQuestions(updatedQuestions);
  };

  const handleDateChange = (questionIndex, date) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].date = date;
    setQuestions(updatedQuestions);
  };

  const handleTextChange = (questionIndex, answer) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].answer = answer;
    setQuestions(updatedQuestions);
  };

  const addOption = (questionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options.push("");
    updatedQuestions[questionIndex].optionImageFiles.push(null);
    setQuestions(updatedQuestions);
  };

  const deleteOption = (questionIndex, optionIndex) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options = updatedQuestions[questionIndex].options.filter((_, i) => i !== optionIndex);
    updatedQuestions[questionIndex].optionImageFiles = updatedQuestions[questionIndex].optionImageFiles.filter((_, i) => i !== optionIndex);
    setQuestions(updatedQuestions);
  };

  const handleOptionTextChange = (questionIndex, optionIndex, text) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].options[optionIndex] = text;
    setQuestions(updatedQuestions);
  };

  const handleImageUpload = (questionIndex, file) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].imageFile = file;
    setQuestions(updatedQuestions);
  };

  const handleOptionImageUpload = (questionIndex, optionIndex, file) => {
    const updatedQuestions = [...questions];
    updatedQuestions[questionIndex].optionImageFiles[optionIndex] = file;
    setQuestions(updatedQuestions);
  };

  const handleSubmit = async () => {
    setIsSubmitted(true);

    const quizId = uuidv4();
    console.log('Quiz ID:', quizId);
    console.log('Quiz Title:', quizTitle);

    // Log each question and their details
    console.log('Questions before upload:', questions);

    // Create FormData to send the payload and images together
    const formData = new FormData();
    formData.append('id', quizId);
    formData.append('title', quizTitle);

    // Prepare questions data
    const updatedQuestions = questions.map((question, questionIndex) => {
        // Add the question image file to the formData
        if (question.imageFile) {
            formData.append(`questionImage-${questionIndex}`, question.imageFile);
        }

        // Add the option image files to the formData
        question.optionImageFiles.forEach((optionImageFile, optionIndex) => {
            if (optionImageFile) {
                formData.append(`optionImage-${questionIndex}-${optionIndex}`, optionImageFile);
            }
        });

        // Include the options and answer in the question object
        return {
            ...question,
            options: question.options, // Include options in the question data
            answer: question.answer,   // Include the selected answer
            index: questionIndex,      // Include the index to match with images in FormData
        };
    });

    // Add the questions JSON data to the formData
    formData.append('questions', JSON.stringify(updatedQuestions));

    // Debugging: Check all formData entries
    for (let pair of formData.entries()) {
        console.log(`${pair[0]}: ${pair[1]}`);
    }

    try {
        const response = await axios.post('/api/testpost', formData);
        if (response.status !== 200) {
            throw new Error("Failed to submit quiz");
        }

        const result = response.data;
        console.log("Quiz submitted successfully:", result);
    } catch (error) {
        console.error("Error submitting quiz:", error);
    }
};


  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Quiz Builder</h1>

      <div className="mb-4">
        <label className="block text-lg font-medium mb-2">Quiz Title:</label>
        <input
          type="text"
          value={quizTitle}
          onChange={(e) => setQuizTitle(e.target.value)}
          placeholder="Enter quiz title"
          className="w-full p-2 border rounded text-black"
        />
      </div>

      {questions.map((question, questionIndex) => (
        <div key={questionIndex} className="mb-6 p-4 border rounded-lg shadow-lg">
          {editingQuestionIndex === questionIndex ? (
            <>
              {/* Editing mode */}
              <div className="relative w-full">
                <input
                  type="text"
                  value={question.text}
                  onChange={(e) => handleQuestionTextChange(questionIndex, e.target.value)}
                  placeholder="Enter question"
                  className="w-full p-2 mb-4 border rounded text-black"
                />

                <label htmlFor={`upload-question-${questionIndex}`} className="absolute right-0 top-0 mt-2 mr-2 cursor-pointer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-black">
                    <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                  </svg>
                </label>
                <input
                  id={`upload-question-${questionIndex}`}
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(questionIndex, e.target.files[0])}
                  className="hidden"
                />
              </div>

              {question.imageFile && (
                <img src={URL.createObjectURL(question.imageFile)} alt="Question" className="w-full h-auto mt-4 rounded-lg" />
              )}

              <select
                value={question.type}
                onChange={(e) => handleQuestionTypeChange(questionIndex, e.target.value)}
                className="w-full p-2 mb-4 border rounded text-black"
              >
                <option value="radio">Multiple Choice (Radio)</option>
                <option value="checkbox">Multiple Choice (Checkbox)</option>
                <option value="text">Text Input</option>
                <option value="rating">Rating</option>
                <option value="dropdown">Dropdown</option>
                <option value="date">Date</option>
              </select>

              {question.type === "radio" || question.type === "checkbox" || question.type === "dropdown" ? (
                <>
                  {question.options.map((option, optionIndex) => (
                    <div key={optionIndex} className="mb-4">
                      <div className="flex items-center mb-2">
                        {question.type === "radio" && (
                          <input
                            type="radio"
                            name={`question-${questionIndex}`}
                            className="mr-2"
                            disabled
                          />
                        )}
                        {question.type === "checkbox" && (
                          <input
                            type="checkbox"
                            name={`question-${questionIndex}`}
                            className="mr-2"
                            disabled
                          />
                        )}
                        {question.type === "dropdown" && (
                          <span className="mr-2">{optionIndex + 1}.</span>
                        )}
                        <input
                          type="text"
                          value={option !== undefined ? option : ""}
                          onChange={(e) => handleOptionTextChange(questionIndex, optionIndex, e.target.value)}
                          placeholder="Enter option"
                          className="flex-1 p-2 border rounded text-black"
                        />

                        {(question.type === "radio" || question.type === "checkbox") && (
                          <>
                            <label htmlFor={`upload-option-${questionIndex}-${optionIndex}`} className="cursor-pointer text-blue-600 hover:underline">
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-white m-2">
                                <path fillRule="evenodd" d="M1.5 6a2.25 2.25 0 0 1 2.25-2.25h16.5A2.25 2.25 0 0 1 22.5 6v12a2.25 2.25 0 0 1-2.25 2.25H3.75A2.25 2.25 0 0 0 21 18v-1.94l-2.69-2.689a1.5 1.5 0 0 0-2.12 0l-.88.879.97.97a.75.75 0 1 1-1.06 1.06l-5.16-5.159a1.5 1.5 0 0 0-2.12 0L3 16.061Zm10.125-7.81a1.125 1.125 0 1 1 2.25 0 1.125 1.125 0 0 1-2.25 0Z" clipRule="evenodd" />
                              </svg>
                            </label>
                            <input
                              id={`upload-option-${questionIndex}-${optionIndex}`}
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleOptionImageUpload(questionIndex, optionIndex, e.target.files[0])}
                              className="hidden"
                            />
                          </>
                        )}

                        <button
                          onClick={() => deleteOption(questionIndex, optionIndex)}
                          className="ml-2 bg-red-500 rounded-lg p-2 hover:bg-red-700"
                        >
                          Delete
                        </button>
                      </div>

                      {(question.type === "radio" || question.type === "checkbox") && question.optionImageFiles[optionIndex] && (
                        <img src={URL.createObjectURL(question.optionImageFiles[optionIndex])} alt="Option" className="w-full h-auto mt-2" />
                      )}
                    </div>
                  ))}
                  <button onClick={() => addOption(questionIndex)} className="bg-blue-500 rounded-lg p-2 hover:bg-blue-700">
                    Add Option
                  </button>
                </>
              ) : question.type === "rating" ? (
                <div className="mb-4">
                  <p>Rating (1 to 5):</p>
                  <input type="range" min="1" max="5" className="w-full" disabled />
                </div>
              ) : question.type === "text" ? (
                <input
                  type="text"
                  value={question.answer}
                  onChange={(e) => handleTextChange(questionIndex, e.target.value)}
                  placeholder="Answer..."
                  className="w-full p-2 border rounded text-black"
                />
              ) : question.type === "date" ? (
                <input
                  type="date"
                  value={question.date}
                  onChange={(e) => handleDateChange(questionIndex, e.target.value)}
                  className="w-full p-2 border rounded text-black"
                />
              ) : null}

              <button onClick={() => setEditingQuestionIndex(null)} className="ml-4 bg-green-600 rounded-lg p-2 hover:bg-green-700">
                Save
              </button>
            </>
          ) : (
            <>
              {/* Viewing mode */}
              <p className="font-semibold mb-3">{question.text}</p>
              {question.imageFile && (
                <div className="mb-4">
                  <img src={URL.createObjectURL(question.imageFile)} alt="Question" className="w-full h-auto rounded-lg mt-4" />
                </div>
              )}
              {question.type === "radio" || question.type === "checkbox" || question.type === "dropdown" ? (
                <>
                  {question.type === "dropdown" ? (
                    <select
                      className="w-full text-black p-2 border rounded"
                      value={question.answer}
                      onChange={(e) => handleDropdownChange(questionIndex, e.target.value)}
                    >
                      <option value="">Select an option</option>
                      {question.options.map((option, optionIndex) => (
                        <option key={optionIndex} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>
                  ) : (
                    question.options.map((option, optionIndex) => (
                      <div key={optionIndex} className="mb-4">
                        <div className="flex items-center mb-2">
                          {question.type === "radio" && (
                            <input
                              type="radio"
                              name={`question-${questionIndex}`}
                              value={option}
                              onChange={() => handleTextChange(questionIndex, option)}
                              checked={question.answer === option}
                              className="mr-2"
                            />
                          )}
                          {question.type === "checkbox" && (
                            <input
                              type="checkbox"
                              name={`question-${questionIndex}`}
                              value={option}
                              onChange={(e) => handleTextChange(questionIndex, e.target.value, true)}
                              checked={question.answer.includes(option)}
                              className="mr-2"
                            />
                          )}
                          <span>{option}</span>
                        </div>
                        {question.optionImageFiles[optionIndex] && (
                          <img src={URL.createObjectURL(question.optionImageFiles[optionIndex])} alt="Option" className="w-full h-auto mt-2" />
                        )}
                      </div>
                    ))
                  )}
                </>
              ) : question.type === "rating" ? (
                <div className="mb-4">
                  <p>Rating (1 to 5):</p>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={question.answer}
                    onChange={(e) => handleTextChange(questionIndex, e.target.value)}
                    className="w-full"
                  />
                </div>
              ) : question.type === "text" ? (
                <input
                  type="text"
                  placeholder="Answer..."
                  className="w-full p-2 border rounded text-black"
                  value={question.answer}
                  onChange={(e) => handleTextChange(questionIndex, e.target.value)}
                  
                />
              ) : question.type === "date" ? (
                <input
                  type="date"
                  value={question.date}
                  className="w-full p-2 border rounded text-black"
                  onChange={(e) => handleDateChange(questionIndex, e.target.value)}
                 
                />
              ) : null}

              <button onClick={() => setEditingQuestionIndex(questionIndex)} className="rounded-lg p-2 bg-amber-500 hover:bg-amber-700 mt-4">
                Edit
              </button>
              <button onClick={() => deleteQuestion(questionIndex)} className="ml-4 bg-red-500 rounded-lg p-2 hover:bg-red-700 mt-4">
                Delete
              </button>
            </>
          )}
        </div>
      ))}

      {!isSubmitted && (
        <button onClick={addQuestion} className="w-full p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
          Add Question
        </button>
      )}
      {!isSubmitted && questions.length > 0 && (
        <button onClick={handleSubmit} className="w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
          Submit
        </button>
      )}
    </div>
  );
}
