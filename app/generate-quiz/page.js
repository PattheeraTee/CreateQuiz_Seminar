'use client';
import {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} from "@google/generative-ai";
import { useState } from "react";
import { v4 as uuidv4 } from "uuid"; // Import UUID
import Link from 'next/link';

const MODEL_NAME = "gemini-1.5-flash";
const API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

export default function Home() {
  const [data, setData] = useState([]);   // Stores the response data as an array of questions
  const [loading, setLoading] = useState(false);  // Indicates if the request is still loading
  const [errorMessage, setErrorMessage] = useState("");  // Stores the error message
  const [quizTitle, setQuizTitle] = useState("");  // Stores the quiz title

  // Function to create the custom prompt based on user input
  const generatePrompt = (content, questionCount) => {
    return `ช่วยสร้างคำถามเกี่ยวกับเนื้อเรื่องต่อไปนี้ โดยให้สร้างคำถาม ${questionCount} คำถาม พร้อมตัวเลือก 4 ตัวเลือกในแต่ละคำถาม 
    โดยให้คำถามและตัวเลือกเรียงตามตัวอย่างรูปแบบนี้: 
    1. คำถาม? ก. ตัวเลือก ข. ตัวเลือก ค. ตัวเลือก ง. ตัวเลือก ไม่ต้องใส่เครื่องหมาย * และไม่ต้องเฉลยคำตอบ จากเนื้อเรื่องต่อไปนี้:\n\n'${content}'`;
  };

  // Function to parse AI response into structured question and options
  const formatResponse = (response) => {
    console.log("Response from AI:", response); // Log the raw response from AI
    const lines = response.split("\n").filter(line => line.trim() !== "");
    console.log("Parsed lines:", lines); // Log parsed lines from response
    const formattedData = [];
    let currentQuestion = null;

    lines.forEach(line => {
      // Remove special characters (* and excess spaces) from the line
      const cleanedLine = line.replace(/\*/g, "").trim(); // Remove * and trim spaces

      if (/^\d+\./.test(cleanedLine)) {
        // This is a question
        if (currentQuestion) {
          formattedData.push(currentQuestion);
        }
        currentQuestion = { question: cleanedLine, options: [] };
      } else if (/^[ก-ง]\./.test(cleanedLine)) {
        // This is an option
        if (currentQuestion) {
          currentQuestion.options.push(cleanedLine);
        }
      }
    });

    if (currentQuestion) {
      formattedData.push(currentQuestion);
    }

    console.log("Formatted Data:", formattedData); // Log formatted questions and options
    return formattedData;
  };

  // Function to submit quiz data to API
  const handleSubmit = async () => {
    const formData = new FormData(); // Create FormData instance
    formData.append("id", uuidv4()); // Append quiz ID
    formData.append("title", `generatequiz-${Date.now()}`); // Append quiz title

    // Prepare questions in JSON and append
    const questionsData = data.map((question, index) => ({
      id: uuidv4(),
      quiz_id: uuidv4(),
      text: question.question,
      type: "radio",
      answer: question.options[0], // Example: Set first option as correct answer
      options: question.options,
      imageUrl: null,
    }));

    formData.append("questions", JSON.stringify(questionsData)); // Convert to string for formData

    try {
      const response = await fetch('/api/testpost', {
        method: 'POST',
        body: formData, // Send as form data
      });

      if (response.ok) {
        const result = await response.json();
        console.log("Quiz submitted successfully:", result);
      } else {
        console.error("Failed to submit quiz");
      }
    } catch (error) {
      console.error("Error submitting quiz:", error);
    }
  };


  async function runChat(prompt) {
    setLoading(true);  // Start loading
    setData([]);       // Clear previous output
    setErrorMessage(""); // Clear previous error message

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const generationConfig = {
      temperature: 0.9,
      topK: 1,
      topP: 1,
      maxOutputTokens: 2048,
    };

    const safetySettings = [
      {
        category: HarmCategory.HARM_CATEGORY_HARASSMENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
      {
        category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
        threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
      },
    ];

    const chat = model.startChat({
      generationConfig,
      safetySettings,
      history: [
        {
          role: "user",
          parts: [{ text: "HELLO" }],
        },
        {
          role: "model",
          parts: [{ text: "Hello there! How can I assist you today?" }],
        },
      ],
    });

    try {
      const result = await chat.sendMessage(prompt);
      const response = result.response.text();
      console.log("AI Response:", response);  // Log the response to the console
      const formatted = formatResponse(response);  // Format AI response into structured questions
      setData(formatted);  // Set the formatted AI response
    } catch (error) {
      console.error("Error occurred:", error);
      // Set error message
      if (error.response && error.response.status === 500) {
        setErrorMessage("An internal server error occurred. Please try again later.");
      } else {
        setErrorMessage("Error fetching response. Please try again.");
      }
    } finally {
      setLoading(false);  // End loading
    }
  }

  const onSubmit = async (event) => {
    event.preventDefault();
    const content = event.target?.content?.value || "";
    const questionCount = event.target?.questionCount?.value || "";

    if (content.trim() && questionCount.trim()) {
      const prompt = generatePrompt(content, questionCount);
      runChat(prompt);
    } else {
      setErrorMessage("กรุณากรอกเนื้อหาและจำนวนคำถามให้ครบถ้วน.");
    }
  };

  return (


    <main className="max-w-4xl mx-auto p-8 bg-black text-white">
      <h1 className="text-3xl font-bold mb-6 text-center">สร้างแบบทดสอบจากเนื้อหา</h1>
      <Link href="/" className="bg-sky-300 text-black p-3 rounded-md hover:bg-gray-600">
        Back
      </Link>
      <form onSubmit={onSubmit} className=" text-center">
        <p className="mb-2">Enter the content and number of questions</p>
        <textarea
          placeholder="Enter content here"
          name="content"
          rows="6"
          className="border-none outline-none p-4 rounded-lg text-black w-96"
        />{" "}
        <br />
        <input
          type="number"
          placeholder="Enter number of questions"
          name="questionCount"
          className="border-none outline-none p-4 rounded-lg text-black w-96 mt-4"
        />{" "}
        <br />
        <button
          type="submit"
          className="bg-blue-400 hover:bg-blue-600 border border-none outline-none p-2 rounded-lg text-black font-bold uppercase mt-4"
        >
          Submit
        </button>
      </form>

      {/* Error Message */}
      {errorMessage && (
        <p className="mt-4 text-red-500">{errorMessage}</p>
      )}

      {/* Loading State */}
      {loading && (
        <div className="mt-4">
          <p>Loading...</p> {/* You can replace this with a spinner if desired */}
        </div>
      )}

      {/* AI Response as a Formatted Questionnaire */}
      {!loading && data.length > 0 && (
        <>
          <form className="mt-32">
            <h1 className="text-2xl mb-4">Quiz Output</h1>
            {data.map((item, index) => (
              <div key={index} className="mb-4">
                <p className="font-bold">{item.question}</p>
                {item.options.map((option, i) => (
                  <div key={i}>
                    <input type="radio" id={`q${index}_o${i}`} name={`q${index}`} />
                    <label htmlFor={`q${index}_o${i}`} className="ml-2">
                      {option.replace("ก.", "ก. ").replace("ข.", "ข. ").replace("ค.", "ค. ").replace("ง.", "ง. ")}
                    </label>
                  </div>
                ))}
              </div>
            ))}
          </form>
          <Link href="/quizlist">
          <button
            onClick={handleSubmit}
            className="bg-green-500 hover:bg-green-700 border-none outline-none p-2 rounded-lg text-white font-bold uppercase mt-4"
          >
            Submit Quiz to API
          </button>
          </Link>
        </>
      )}
    </main>

  );
}
