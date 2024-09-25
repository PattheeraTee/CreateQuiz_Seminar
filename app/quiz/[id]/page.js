'use client'; // This is a client-side component

import { useEffect, useState } from 'react';

export default function QuizPage({ params }) {
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { id } = params; // Extract `id` from params

  useEffect(() => {
    if (id) {
      // Function to fetch quiz data from the API
      const fetchQuiz = async () => {
        try {
          const response = await fetch(`/api/testpost?id=${id}`);
          if (!response.ok) {
            throw new Error('Failed to load quiz');
          }

          const quizData = await response.json();
          setQuiz(quizData); // Set the quiz data
        } catch (error) {
          setError(error.message);
        } finally {
          setLoading(false);
        }
      };

      fetchQuiz(); // Fetch quiz data when `id` is available
    }
  }, [id]);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (!quiz) {
    return <p>Quiz not found</p>;
  }

  const handleAnswerChange = (questionIndex, value, isCheckbox = false) => {
    const updatedQuestions = [...quiz.questions];

    if (isCheckbox) {
      // Handle checkbox selection
      const currentAnswers = updatedQuestions[questionIndex].answer || [];
      if (currentAnswers.includes(value)) {
        // Remove the option if it's already selected
        updatedQuestions[questionIndex].answer = currentAnswers.filter((answer) => answer !== value);
      } else {
        // Add the option if it's not selected
        updatedQuestions[questionIndex].answer = [...currentAnswers, value];
      }
    } else {
      // Handle other input types (radio, dropdown, text, etc.)
      updatedQuestions[questionIndex].answer = value;
    }

    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const handleSubmit = () => {
    console.log('Submitted answers:', quiz);
    // You can send the answers to an API or perform additional processing here
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">{quiz.title}</h1>
      {quiz.questions.map((question, questionIndex) => (
        <div key={question.id} className="mb-6 p-4 border rounded-lg shadow-lg">
          <p className="font-semibold mb-3">{question.text}</p>

          {/* Display question image if available */}
          {question.image_url && (
            <img
              src={question.image_url}
              alt={`Question ${questionIndex}`}
              className="w-full h-auto mt-2 rounded-lg"
            />
          )}

          {/* Render input fields based on the question type */}
          {question.type === 'text' ? (
            <input
              type="text"
              value={question.answer}
              onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
              placeholder="Enter your answer"
              className="w-full p-2 border rounded text-black"
            />
          ) : question.type === 'radio' || question.type === 'checkbox' ? (
            <>
              {question.options.map((option, optionIndex) => (
                <label key={optionIndex} className="block mb-4 cursor-pointer">
                  <div className="flex items-center">
                    <input
                      type={question.type}
                      name={`question-${questionIndex}`}
                      value={option.text}
                      onChange={() =>
                        handleAnswerChange(
                          questionIndex,
                          option.text,
                          question.type === 'checkbox'
                        )
                      }
                      checked={
                        question.type === 'checkbox'
                          ? question.answer?.includes(option.text)
                          : question.answer === option.text
                      }
                      className="mr-2"
                    />
                    <span>{option.text}</span>
                  </div>

                  {/* Display option image if available */}
                  {option.imageUrl && (
                    <img
                      src={option.imageUrl}
                      alt={`Option ${optionIndex}`}
                      className="w-1/2 h-auto mt-2 rounded-lg"
                    />
                  )}
                </label>
              ))}
            </>
          ) : question.type === 'dropdown' ? (
            <select
              value={question.answer || ''}
              onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
              className="w-full text-black p-2 border rounded"
            >
              <option value="" disabled>
                Select an option
              </option>
              {question.options.map((option, optionIndex) => (
                <option key={optionIndex} value={option.text}>
                  {option.text}
                </option>
              ))}
            </select>
          
          ) : question.type === 'rating' ? (
            <div className="mb-4">
              <p>Rating (1 to 5):</p>
              <input
                type="range"
                min="1"
                max="5"
                value={question.answer || 3}
                onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
                className="w-full"
              />
            </div>
          ) : question.type === 'date' ? (
            <input
              type="date"
              value={question.answer || ''}
              onChange={(e) => handleAnswerChange(questionIndex, e.target.value)}
              className="w-full p-2 border rounded text-black"
            />
          ) : null}
        </div>
      ))}
      <button
        onClick={handleSubmit}
        className="w-full mt-4 p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
      >
        Submit
      </button>
    </div>
  );
}
