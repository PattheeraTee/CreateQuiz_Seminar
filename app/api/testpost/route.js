import { writeFile } from "fs/promises";
import { NextResponse } from "next/server";
import path from 'path';
import pool from "../../db/mysql.js"; // Import database pool configuration

// Disable body parsing for this API route
export const config = {
  api: {
    bodyParser: false,
  },
};

// Helper function to upload images and return the path
async function uploadImage(file) {
  if (!file) return null; // Return null if no file is provided

  const buffer = Buffer.from(await file.arrayBuffer());
  const imageName = `${new Date().getTime()}${path.extname(file.name)}`;
  const imagePath = `/images/${imageName}`;
  const fullImagePath = path.join(process.cwd(), 'public', imagePath); // Ensure the image is saved to the 'public/images' directory

  await writeFile(fullImagePath, buffer);
  return imagePath; // Return the path to be stored in the database
}

export async function POST(request) {
  const connection = await pool.getConnection(); // Connect to the database

  try {
    // Get data from formData
    const formData = await request.formData();
    const id = formData.get('id');
    const title = formData.get('title');
    const questionsData = formData.get('questions');
    const questions = JSON.parse(questionsData); // Parse JSON string to Object

    // Check if required data is provided
    if (!id || !title || !questions || !Array.isArray(questions)) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 }
      );
    }

    // Start a transaction to ensure data is inserted completely
    await connection.beginTransaction();

    // Insert quiz into quizzes table
    const insertQuizQuery = "INSERT INTO quizzes (id, title) VALUES (?, ?)";
    await connection.query(insertQuizQuery, [id, title]);

    // Insert questions into the questions table, including image upload
    const insertQuestionQuery =
      "INSERT INTO questions (quiz_id, text, type, answer, date, image_url) VALUES (?, ?, ?, ?, ?, ?)";

    for (const question of questions) {
      let imageUrl = null;

      // Check if there's an image file for the question
      const questionImageKey = `questionImage-${question.index}`;
      if (formData.has(questionImageKey)) {
        const imageFile = formData.get(questionImageKey);
        if (imageFile) {
          imageUrl = await uploadImage(imageFile);
        }
      }

      const { text, type, options, date, answer } = question;
      const [result] = await connection.query(insertQuestionQuery, [id, text, type, answer, date || null, imageUrl]);
      const questionId = result.insertId;

      // Insert options into the options table for types that support options (radio, checkbox, dropdown)
      if (type === "radio" || type === "checkbox" || type === "dropdown") {
        const insertOptionQuery =
          "INSERT INTO options (question_id, option_text, option_image_url) VALUES (?, ?, ?)";
        for (let i = 0; i < options.length; i++) {
          let optionImageUrl = null;

          // Check if there's an image file for the option (if applicable)
          const optionImageKey = `optionImage-${question.index}-${i}`;
          if (formData.has(optionImageKey)) {
            const optionImageFile = formData.get(optionImageKey);
            if (optionImageFile) {
              optionImageUrl = await uploadImage(optionImageFile);
            }
          }

          const optionText = options[i];
          await connection.query(insertOptionQuery, [questionId, optionText, optionImageUrl]);
        }
      }
    }

    // Commit the transaction
    await connection.commit();
    connection.release();

    // Return the response
    return NextResponse.json({ id, title, questions });
  } catch (error) {
    await connection.rollback(); // Rollback the transaction in case of error
    connection.release();
    console.error("Error saving quiz:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  const connection = await pool.getConnection(); // Connect to the database

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id'); // Get `id` from query string

    if (!id) {
      return NextResponse.json(
        { error: "Quiz ID is required" },
        { status: 400 }
      );
    }

    // Fetch quiz data from the database
    const [quizResult] = await connection.query("SELECT * FROM quizzes WHERE id = ?", [id]);

    // Check if the quiz is found
    if (quizResult.length === 0) {
      return NextResponse.json(
        { error: "Quiz not found" },
        { status: 404 }
      );
    }

    const quiz = quizResult[0]; // Quiz data

    // Fetch all questions for the quiz, including image_url
    const [questionsResult] = await connection.query("SELECT * FROM questions WHERE quiz_id = ?", [id]);

    // For each question, fetch options (if any) including option_image_url
    for (const question of questionsResult) {
      if (question.type === 'radio' || question.type === 'checkbox' || question.type === 'dropdown') {
        const [optionsResult] = await connection.query("SELECT option_text, option_image_url FROM options WHERE question_id = ?", [question.id]);
        question.options = optionsResult.map(option => ({
          text: option.option_text,
          imageUrl: option.option_image_url,
        })); 
      } else {
        question.options = []; // If not a type that has options, set as empty array
      }
    }

    connection.release(); // Release connection after query

    // Return quiz data and questions
    return NextResponse.json({ id: quiz.id, title: quiz.title, questions: questionsResult });

  } catch (error) {
    connection.release(); // Release connection in case of error
    console.error("Error fetching quiz:", error);

    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
