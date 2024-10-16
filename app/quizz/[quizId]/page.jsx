"use client";

import { useState, useEffect } from "react";

export default function QuizPage({ params }) {
  const { quizId } = params;
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    // Fetch quiz data from Express.js backend
    async function fetchQuiz() {
      try {
        const response = await fetch(`http://localhost:3001/quiz/${quizId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch quiz");
        }
        const data = await response.json();
        setQuiz(data);
      } catch (error) {
        console.error("Error fetching quiz:", error);
      }
    }

    fetchQuiz();
  }, [quizId]);

  const handleInputChange = (questionId, value) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    console.log(answers); // Handle submission logic here
  };

  if (!quiz) return <div>Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold mb-4 text-black">{quiz.coverPage.quizTitle}</h1>
        <p className="mb-6 text-gray-600">{quiz.coverPage.description}</p>
        <form onSubmit={handleSubmit}>
          {quiz.sections.map((section) => (
            <div key={section.sectionId} className="mb-6">
              <h2 className="text-xl font-semibold mb-2 text-black">
                {section.sectionTitle}
              </h2>
              <p className="mb-4 text-gray-500">{section.sectionDescription}</p>
              {section.questions.map((question) => (
                <QuestionComponent
                  key={question.questionId}
                  question={question}
                  handleInputChange={handleInputChange}
                />
              ))}
            </div>
          ))}
          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-300"
          >
            ส่ง
          </button>
        </form>
      </div>
    </div>
  );
}

function QuestionComponent({ question, handleInputChange }) {
  switch (question.type) {
    case "Multiple Choice":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2 text-black">{question.text}</p>
          {question.options.map((option) => (
            <div key={option.optionId} className="mb-1">
              <label className="inline-flex items-center text-black">
                <input
                  type="radio"
                  name={question.questionId}
                  value={option.text}
                  className="form-radio h-4 w-4 text-blue-600"
                  onChange={(e) =>
                    handleInputChange(question.questionId, e.target.value)
                  }
                />
                <span className="ml-2">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
      );
    case "Checkbox":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2 text-black">{question.text}</p>
          {question.options.map((option) => (
            <div key={option.optionId} className="mb-1">
              <label className="inline-flex items-center">
                <input
                  type="checkbox"
                  value={option.text}
                  className="form-checkbox h-4 w-4 text-blue-600"
                  onChange={(e) =>
                    handleInputChange(question.questionId, e.target.value)
                  }
                />
                <span className="ml-2">{option.text}</span>
              </label>
            </div>
          ))}
        </div>
      );
    case "Dropdown":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <select
            className="form-select block w-full mt-1"
            onChange={(e) =>
              handleInputChange(question.questionId, e.target.value)
            }
          >
            {question.options.map((option) => (
              <option key={option.optionId} value={option.text}>
                {option.text}
              </option>
            ))}
          </select>
        </div>
      );
    case "Rating":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((rating) => (
              <label key={rating} className="inline-flex items-center">
                <input
                  type="radio"
                  name={question.questionId}
                  value={rating}
                  className="form-radio h-4 w-4 text-blue-600"
                  onChange={(e) =>
                    handleInputChange(question.questionId, rating)
                  }
                />
                <span className="ml-1">{rating}</span>
              </label>
            ))}
          </div>
        </div>
      );
    case "Text":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <textarea
            className="form-textarea block w-full mt-1"
            onChange={(e) =>
              handleInputChange(question.questionId, e.target.value)
            }
          />
        </div>
      );
    case "Date":
      return (
        <div className="mb-4">
          <p className="font-medium mb-2">{question.text}</p>
          <input
            type="date"
            className="form-input block w-full mt-1"
            onChange={(e) =>
              handleInputChange(question.questionId, e.target.value)
            }
          />
        </div>
      );
    default:
      return null;
  }
}