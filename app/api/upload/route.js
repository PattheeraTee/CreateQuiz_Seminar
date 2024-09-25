import multer from 'multer';
import path from 'path';
import nextConnect from 'next-connect';

// กำหนดตำแหน่งที่เก็บไฟล์ในเครื่อง
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(process.cwd(), 'public', 'uploads')); // เก็บใน public/uploads
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`); // ตั้งชื่อไฟล์ตามเวลาปัจจุบัน
  },
});

const upload = multer({ storage: storage });

const apiRoute = nextConnect({
  onError(error, req, res) {
    res.status(501).json({ error: `Something went wrong: ${error.message}` });
  },
  onNoMatch(req, res) {
    res.status(405).json({ error: `Method ${req.method} not allowed` });
  },
});

// ใช้ multer ในการจัดการการอัปโหลด
apiRoute.use(upload.single('image'));

apiRoute.post((req, res) => {
  // หลังจากอัปโหลดเสร็จ return URL ของไฟล์ที่เก็บไว้
  const imageUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({ imageUrl });
});

export default apiRoute;

export const config = {
  api: {
    bodyParser: false, // ปิดการใช้ body parser เพื่อรองรับ multer
  },
};
