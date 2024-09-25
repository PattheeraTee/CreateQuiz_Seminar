'use client';

import { useState } from 'react';
import mammoth from 'mammoth'; // For extracting text from .docx files
import JSZip from 'jszip'; // For extracting images from .docx files

export default function QuizUploadPage() {
    const [content, setContent] = useState([]); // To store text and image objects
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
        if (fileType === 'doc' || fileType === 'docx') {
            handleDocFile(file);
        } else {
            alert('Supported formats are .doc and .docx only.');
        }
    };

    const handleDocFile = async (file) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            try {
                const arrayBuffer = e.target.result;
                const zip = await JSZip.loadAsync(arrayBuffer); // Load the docx file as a zip
                const textWithMarkers = await extractTextWithMarkers(arrayBuffer);
                const images = await extractImagesFromDocx(zip);
                combineContentWithImages(textWithMarkers, images);
            } catch (err) {
                setErrorMessage('Error reading the DOC/DOCX file.');
                console.error(err);
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const extractTextWithMarkers = async (arrayBuffer) => {
        const result = await mammoth.extractRawText({ arrayBuffer: arrayBuffer });
        const text = result.value;
        // Mammoth does not provide image markers, so we return the plain text split by lines
        return text.split('\n').map((line) => ({ type: 'text', content: line.trim() }));
    };

    const extractImagesFromDocx = async (zip) => {
        const images = [];
        const mediaFolder = zip.folder('word/media');
        if (mediaFolder) {
            const files = mediaFolder.file(/.+/); // Get all files in 'word/media'
            for (const file of files) {
                const blob = await file.async('blob');
                const imageUrl = URL.createObjectURL(blob);
                images.push(imageUrl); // Store images in the array in the order they are found
            }
        }
        return images;
    };

    const combineContentWithImages = (textContent, images) => {
        const combinedContent = [];
        let imageIndex = 0;

        textContent.forEach((item, index) => {
            // Push the text content
            if (item.content) {
                combinedContent.push({ type: 'text', content: item.content });
            }

            // For simplicity, we alternate between text and images if images are available
            if (imageIndex < images.length) {
                combinedContent.push({ type: 'image', content: images[imageIndex] });
                imageIndex++;
            }
        });

        console.log('Combined content to be displayed:', combinedContent); // Log combined content
        setContent(combinedContent);
    };

    const displayContent = () => {
        console.log('Content to display on the web:', content); // Log content before displaying
        return content.map((item, index) => {
            if (item.type === 'text') {
                return (
                    <p key={index} className="text-black mb-4">{item.content}</p>
                );
            } else if (item.type === 'image') {
                return (
                    <img key={index} src={item.content} alt={`Extracted ${index}`} className="w-full h-auto mb-4" />
                );
            }
            return null;
        });
    };

    return (
        <div className="max-w-4xl mx-auto p-8 bg-gray-50">
            <h1 className="text-3xl font-bold mb-6 text-center text-black">Create Quiz from .doc and .docx</h1>
            <div className="flex justify-center mb-6">
                <input
                    type="file"
                    accept=".doc, .docx"
                    onChange={handleFileUpload}
                    className="bg-blue-50 border border-blue-300 rounded-lg p-2 w-full max-w-lg text-black"
                />
            </div>
            {errorMessage && (
                <p className="text-red-500 mb-4 text-center">{errorMessage}</p>
            )}
            <div id="contentContainer">
                {content.length > 0 ? (
                    displayContent()
                ) : (
                    <p className="text-center text-gray-900">Upload a file to display content</p>
                )}
            </div>
        </div>
    );
}
