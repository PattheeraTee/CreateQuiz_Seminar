


export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4">
      {/* Quiz Section */}
      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg">
        {/* <FaGlobe className="text-2xl text-black" /> */}
        <span className="text-xl font-semibold text-black">ควิซของฉัน</span>
      </div>

      {/* Game Section */}
      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg">
        {/* <FaGamepad className="text-2xl text-black" /> */}
        <span className="text-xl font-semibold text-black">เกมเพลต</span>
      </div>

      {/* AI Section */}
      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg">
        {/* <FaRobot className="text-2xl text-black" /> */}
        <span className="text-xl font-semibold text-black">AI</span>
      </div>

      {/* Import Section */}
      <div className="flex items-center space-x-2 p-4 bg-purple-200 rounded-lg">
        {/* <FaFileImport className="text-2xl text-purple-600" /> */}
        <span className="text-xl font-semibold text-purple-600">นำเข้าเอกสาร</span>
      </div>
    </aside>
  );
}
