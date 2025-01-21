const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

// إعداد CORS وقبول JSON
app.use(cors());
app.use(express.json());

let properties = []; // مصفوفة لتخزين العقارات

// استرجاع قائمة العقارات
app.get('/properties', (req, res) => {
  res.json(properties);
});

// إضافة عقار جديد
app.post('/properties', (req, res) => {
  const property = req.body; // استلام البيانات من العميل
  properties.push(property);
  res.status(201).json({ message: 'تم إضافة العقار بنجاح', property });
});

app.listen(port, () => {
  console.log(`السيرفر يعمل على http://localhost:${port}`);
});
