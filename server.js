const express = require('express');
const multer = require('multer');
const path = require('path');

const app = express();
const port = 22;

// إعداد تخزين الملفات
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // تحديد المجلد الذي سيتم تخزين الملفات فيه
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname)); // إضافة الوقت الحالي مع اسم الملف
  },
});

const upload = multer({ storage: storage });

// إنشاء مجلد `uploads` إذا لم يكن موجودًا
const fs = require('fs');
const uploadDir = './uploads';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// معالجة رفع الملف
app.post('/upload', upload.single('file'), (req, res) => {
  if (!req.file) {
    return res.status(400).send('لم يتم رفع الملف.');
  }
  res.status(200).send('تم رفع الملف بنجاح!');
});

// بدء الخادم
app.listen(port, () => {
  console.log(`الخادم يعمل على http://localhost:${port}`);
});
