import Header from "./header";
import Sidebar from "./sidebar";
import ImportFile from "./import-file";
import TestFile from "../test-import-copy/ver2/page";

export default function Page() {
  return (
    <div className="bg-[#F9F8F6] text-black h-screen">
      <Header />
      <div className="flex mt-4 h-full">
        <div className="w-1/5">
          <Sidebar />
        </div>
        <div className="w-4/5">
          <ImportFile />
          {/* <TestFile /> */}
        </div>
      </div>
    </div>
  );
}
