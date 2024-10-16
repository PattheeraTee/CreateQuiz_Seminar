import Image from "next/image";
import winter from "../components/images/taeyeon.png";
import Link from "next/link";

export default function Header() {
  return (
    <header className="flex items-center justify-between bg-white border-b border-black p-4">
      {/* Left: Logo */}
      <div className="flex items-center">
        <span className="text-2xl font-bold text-black">QUIZ LOGO</span>
      </div>

      {/* Right: Home and Profile */}
      <div className="flex items-center space-x-6">
        {/* Home Button */}
        <Link className="flex items-center space-x-2" href="/">
          <span className="rounded-full w-4 h-4 bg-black"></span>
          <p className="text-xl font-semibold text-black">HOME</p>
        </Link>

        {/* Profile Image */}
        <Image
          src={winter}  // ใช้ตัวแปรที่นำเข้าโดยไม่ใช้เครื่องหมายคำพูด
          alt="Profile"
          width={40}    // ปรับขนาดภาพให้ชัดเจน
          height={40}
          className="w-10 h-10 rounded-full object-cover border border-black"
        />
      </div>
    </header>
  );
}
