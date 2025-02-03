const express = require('express');
const app = express();
const port = 2256;

// Middleware للتعامل مع JSON
app.use(express.json());

// تخزين العقارات (بديل عن قاعدة البيانات)
let properties = [];

// جلب جميع العقارات
app.get('/properties', (req, res) => {
    res.json(properties);
});

// إضافة عقار جديد
app.post('/properties', (req, res) => {
    const newProperty = {
        id: Date.now(),
        ...req.body
    };
    properties.push(newProperty);
    res.json({ message: 'تمت إضافة العقار بنجاح!', property: newProperty });
});

// حذف عقار
app.delete('/properties/:id', (req, res) => {
    const id = parseInt(req.params.id);
    properties = properties.filter(property => property.id !== id);
    res.json({ message: 'تم حذف العقار بنجاح!' });
});

// تشغيل السيرفر
app.listen(port, () => {
    console.log(`السيرفر يعمل على http://localhost:${port}`);
});
