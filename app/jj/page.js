'use client';
import { useState } from 'react';
import mammoth from 'mammoth';

const QuizPage = () => {
  const [content, setContent] = useState([]);

  // Function to handle the file upload
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    if (file) {
      console.log('File selected:', file.name);
      const reader = new FileReader();
      reader.onload = async (e) => {
        const arrayBuffer = e.target.result;

        // Use mammoth to extract text and images from the .docx file
        try {
          console.log('Reading file and extracting content...');
          const { value } = await mammoth.convertToHtml({ arrayBuffer }, {
            convertImage: mammoth.images.inline((element) => {
              return element.read("base64").then((imageBuffer) => {
                console.log('Image detected and converted to base64');
                return {
                  src: `data:${element.contentType};base64,${imageBuffer}`,
                };
              });
            }),
          });

          console.log('Extracted content:', value);
          const parsedContent = parseContent(value);
          console.log('Parsed content:', parsedContent);
          setContent(parsedContent);
        } catch (error) {
          console.error('Error reading file:', error);
        }
      };
      reader.readAsArrayBuffer(file);
    }
  };

  // Function to parse the extracted HTML content
  const parseContent = (html) => {
    console.log('Parsing content...');
    // Split the HTML into lines based on <br> tags or paragraph breaks
    const lines = html.split(/<br\s*\/?>/).filter((line) => line.trim() !== '');
    const parsedElements = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      console.log(`Processing line ${index + 1}:`, trimmedLine);

      // Check if the line contains an image
      if (/<img\s+src=/.test(trimmedLine)) {
        console.log('Detected an image line.');
        parsedElements.push({ type: 'image', contentType: 'image', html: trimmedLine });
      }
      // Check if the line starts with a number (indicating a question)
      else if (/^\d+\./.test(trimmedLine)) {
        console.log('Detected a question line.');
        parsedElements.push({ type: 'question', contentType: 'question', text: trimmedLine });
      }
      // Check if the line starts with a letter followed by a closing parenthesis (indicating an option)
      else if (/^[a-dA-D]\)/.test(trimmedLine)) {
        console.log('Detected an option line.');
        parsedElements.push({ type: 'option', contentType: 'option', text: trimmedLine });
      } else {
        // Default case for any other type of line
        console.log('Detected a generic text line.');
        parsedElements.push({ type: 'text', contentType: 'text', text: trimmedLine });
      }
    });

    console.log('Finished parsing content.');
    return parsedElements;
  };

  return (
    <div>
      <h1>Upload Quiz File</h1>
      <input type="file" accept=".docx" onChange={handleFileUpload} />
      <div>
        {content.map((element, index) => {
          console.log(`Rendering element ${index + 1}:`, element);
          if (element.type === 'question') {
            return <p key={index}>{element.text}</p>;
          } else if (element.type === 'option') {
            return (
              <div key={index} style={{ marginLeft: '20px' }}>
                <input type="radio" name={`question-${index}`} id={`option-${index}`} />
                <label htmlFor={`option-${index}`}>{element.text}</label>
              </div>
            );
          } else if (element.type === 'image') {
            return <div key={index} dangerouslySetInnerHTML={{ __html: element.html }} />;
          } else {
            return <p key={index}>{element.text}</p>;
          }
        })}
      </div>
    </div>
  );
};

export default QuizPage;
