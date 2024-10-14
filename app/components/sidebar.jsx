import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faFileImport, faGlobe,faSimCard} from '@fortawesome/free-solid-svg-icons';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-gray-100 p-4">

      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg">
        <FontAwesomeIcon icon={faGlobe} className="w-6 h-6 text-black"/>
        <span className="text-xl font-semibold text-black">ควิซของฉัน</span>
      </div>

      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg ">
        <FontAwesomeIcon icon={faSimCard} className="w-6 h-6 text-black"/>
        <span className="text-xl font-semibold text-black">เทมเพลต</span>
      </div>

      <div className="flex items-center space-x-2 p-4 mb-4 bg-gray-200 rounded-lg text-black">
        <FontAwesomeIcon icon={faRobot} className="w-6 h-6 text-black" />
        <span className="text-xl font-semibold text-black">AI</span>
      </div>

      <div className="flex items-center space-x-2 p-4 mb-4 bg-purple-200 rounded-lg">
        <FontAwesomeIcon icon={faFileImport} className="w-6 h-6 text-purple-600" />
        <span className="text-xl font-semibold text-purple-600">นำเข้าเอกสาร</span>
      </div>
    </aside>
  );
}
