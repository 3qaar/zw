const express = require('express');
const cors = require('cors');
const multer = require('multer'); // لتخزين الصور

const app = express();
const port = 2256;

// إعداد CORS وقبول JSON
app.use(cors());
app.use(express.json());

// تخزين الملفات باستخدام Multer
const upload = multer({ dest: 'uploads/' }); // المجلد الذي سيتم تخزين الملفات فيه

let properties = []; // مصفوفة لتخزين العقارات

// استرجاع قائمة العقارات
app.get('/properties', (req, res) => {
  res.json(properties);
});

// إضافة عقار جديد مع صور (مرفقات)
app.post('/properties', upload.array('images', 5), (req, res) => {
  const { name, location, price, type, description } = req.body;
  const images = req.files ? req.files.map(file => file.path) : []; // تخزين روابط الصور

  if (!name || !location || !price || !type || !description) {
    return res.status(400).json({ message: 'يرجى ملء جميع الحقول!' });
  }

  const property = { 
    id: Date.now(), 
    name, 
    location, 
    price, 
    type, 
    description, 
    images 
  };

  properties.push(property);
  res.status(201).json({ message: 'تم إضافة العقار بنجاح', property });
});

// حذف العقار
app.delete('/properties/:id', (req, res) => {
  const { id } = req.params;
  properties = properties.filter(property => property.id !== parseInt(id));
  res.status(200).json({ message: 'تم حذف العقار بنجاح' });
});

app.listen(port, () => {
  console.log(`السيرفر يعمل على http://localhost:${port}`);
});
