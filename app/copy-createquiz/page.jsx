// pages/create-quiz.js
'use client';
import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faImage } from '@fortawesome/free-solid-svg-icons';

export default function CreateQuiz() {
  const [sections, setSections] = useState([
    { id: 1, title: '', description: '', questions: [] },
  ]);

  const questionTypes = [
    { label: 'คำถามเลือกตอบ', icon: '⭕', value: 'multiple_choice' },
    { label: 'ช่องกาเครื่องหมาย', icon: '✔️', value: 'checkbox' },
    { label: 'ดรอปดาวน์', icon: '⬇️', value: 'dropdown' },
    { label: 'การให้คะแนน', icon: '⭐', value: 'rating' },
    { label: 'เติมคำตอบ', icon: '✍️', value: 'text_input' },
    { label: 'วันที่', icon: '📅', value: 'date' },
  ];

  const addSection = () => {
    const newSection = {
      id: sections.length + 1,
      title: '',
      description: '',
      questions: [],
    };
    setSections([...sections, newSection]);
  };

  const addQuestion = (sectionId, type) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: [
            ...section.questions,
            { id: section.questions.length + 1, type, options: [''], maxSelect: 1, isRequired: false },
          ],
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const updateOption = (sectionId, questionId, optionIndex, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId) {
              const updatedOptions = [...question.options];
              updatedOptions[optionIndex] = value;
              return { ...question, options: updatedOptions };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const addOption = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId) {
              return { ...question, options: [...question.options, ''] };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const removeOption = (sectionId, questionId, optionIndex) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            const updatedOptions = question.options.filter((_, idx) => idx !== optionIndex);
            return { ...question, options: updatedOptions };
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const updateMaxSelect = (sectionId, questionId, value) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            if (question.id === questionId && question.type === 'checkbox') {
              return { ...question, maxSelect: value };
            }
            return question;
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const toggleRequired = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.map((question) => {
            return { ...question, isRequired: !question.isRequired };
          }),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const deleteQuestion = (sectionId, questionId) => {
    const updatedSections = sections.map((section) => {
      if (section.id === sectionId) {
        return {
          ...section,
          questions: section.questions.filter((question) => question.id !== questionId),
        };
      }
      return section;
    });
    setSections(updatedSections);
  };

  const deleteSection = (sectionId) => {
    if (sectionId === 1) return;
    const updatedSections = sections.filter((section) => section.id !== sectionId);
    setSections(updatedSections);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      {/* Cover Page */}
      <div className="max-w-2xl mx-auto bg-white p-6 rounded-lg shadow">
        <h2 className="text-2xl font-semibold mb-4 text-black">หน้าปก</h2>
        <div className="flex flex-col items-center mb-6">
          <img src="/path-to-image.jpg" alt="Cover" className="w-full h-48 object-cover mb-4" />
          <input
            type="text"
            placeholder="ชื่อแบบสอบถาม"
            className="w-full px-4 py-2 mb-2 border border-gray-300 rounded text-black"
          />
          <input
            type="text"
            placeholder="อธิบายแบบสอบถาม"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          />
          <button className="px-6 py-2 bg-[#03A9F4] text-white rounded-full">เริ่มต้น</button>
        </div>
      </div>

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.id} className="max-w-2xl mx-auto mt-6 bg-white p-6 rounded-lg shadow relative">
          <h3 className="text-xl font-semibold mb-2 text-black">ส่วนที่ {section.id}</h3>
          <input
            type="text"
            placeholder={`ชื่อส่วนที่ ${section.id}`}
            className="w-full px-4 py-2 mb-2 border border-gray-300 rounded text-black"
          />
          <textarea
            placeholder="คำอธิบาย"
            className="w-full px-4 py-2 mb-4 border border-gray-300 rounded text-black"
          />

          {/* Display question types */}
          <div className="mb-4">
            <button className="text-[#03A9F4] font-bold mb-2">+ เพิ่มคำถามใหม่</button>
            <div className="grid grid-cols-3 gap-2">
              {questionTypes.map((qType) => (
                <button
                  key={qType.value}
                  onClick={() => addQuestion(section.id, qType.value)}
                  className="flex items-center px-4 py-2 bg-gray-200 rounded-full"
                >
                  <span className="mr-2">{qType.icon}</span>
                  <span className="text-black">{qType.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* List of questions */}
          {section.questions.map((question) => (
            <div key={question.id} className="mt-4 p-4 border border-gray-300 rounded bg-white">
              <div className="flex items-center mb-2">
                <input
                  type="text"
                  placeholder="คำถาม"
                  className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                />
                <button className="ml-4 text-gray-500">
                  <FontAwesomeIcon icon={faImage} className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {/* If multiple choice, show options */}
              {question.type === 'multiple_choice' && (
                <div>
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input type="radio" className="mr-2" disabled />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(section.id, question.id, idx, e.target.value)}
                        placeholder={`ตัวเลือก ${idx + 1}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                      />
                      <button className="ml-2 text-gray-500">
                        <FontAwesomeIcon icon={faImage} className="w-6 h-6 text-gray-500" />
                      </button>
                      <button
                        onClick={() => removeOption(section.id, question.id, idx)}
                        className="ml-2 text-red-500"
                      >
                        ✖️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(section.id, question.id)}
                    className="text-[#03A9F4] underline mb-2"
                  >
                    + เพิ่มตัวเลือกใหม่
                  </button>
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => deleteQuestion(section.id, question.id)} className="text-red-500">
                      ลบคำถาม
                    </button>
                    <div className="flex items-center">
                      <span className="text-black mr-2">จำเป็น</span>
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="toggle-checkbox"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* If checkbox, show options with maxSelect */}
              {question.type === 'checkbox' && (
                <div>
                  {question.options.map((option, idx) => (
                    <div key={idx} className="flex items-center mb-2">
                      <input type="checkbox" className="mr-2" disabled />
                      <input
                        type="text"
                        value={option}
                        onChange={(e) => updateOption(section.id, question.id, idx, e.target.value)}
                        placeholder={`ตัวเลือก ${idx + 1}`}
                        className="w-full px-4 py-2 border border-gray-300 rounded text-black"
                      />
                      <button className="ml-2 text-gray-500">
                        <FontAwesomeIcon icon={faImage} className="w-6 h-6 text-gray-500" />
                      </button>
                      <button
                        onClick={() => removeOption(section.id, question.id, idx)}
                        className="ml-2 text-red-500"
                      >
                        ✖️
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => addOption(section.id, question.id)}
                    className="text-[#03A9F4] underline mb-2"
                  >
                    + เพิ่มตัวเลือกใหม่
                  </button>
                  <div className="flex items-center mb-4">
                    <span className="mr-2 text-black">เลือกสูงสุด:</span>
                    <select
                      value={question.maxSelect}
                      onChange={(e) => updateMaxSelect(section.id, question.id, parseInt(e.target.value))}
                      className="border border-gray-300 text-black rounded px-2 py-1"
                    >
                      {question.options.map((_, idx) => (
                        <option key={idx} value={idx + 1}>
                          {idx + 1}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-between items-center mt-4">
                    <button onClick={() => deleteQuestion(section.id, question.id)} className="text-red-500">
                      ลบคำถาม
                    </button>
                    <div className="flex items-center">
                      <span className="text-black mr-2">จำเป็น</span>
                      <input
                        type="checkbox"
                        checked={question.isRequired}
                        onChange={() => toggleRequired(section.id, question.id)}
                        className="toggle-checkbox"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          <div className="flex justify-between items-center mt-6 space-x-3">
            <button
              onClick={() => addSection()}
              className="w-full mt-2 px-4 py-2 bg-gray-200 rounded text-black"
            >
              + เพิ่มส่วนใหม่
            </button>
            {section.id !== 1 && (
              <button
                onClick={() => deleteSection(section.id)}
                className="w-1/5 mt-2 px-4 py-2 bg-red-500 rounded text-white"
              >
                ลบส่วนนี้
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
