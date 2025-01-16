app.post('/add-property', upload.array('attachments', 5), (req, res) => {
    const { title, description, price, location, property_type, lat, lng } = req.body;
    const query = 'INSERT INTO properties (title, description, price, location, property_type, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?)';
    db.query(query, [title, description, price, location, property_type, lat, lng], (err, result) => {
        if (err) throw err;
        const propertyId = result.insertId;

        // إضافة المرفقات
        if (req.files) {
            req.files.forEach(file => {
                const attachmentQuery = 'INSERT INTO attachments (property_id, file_path, file_type) VALUES (?, ?, ?)';
                db.query(attachmentQuery, [propertyId, file.path, file.mimetype], (err, result) => {
                    if (err) throw err;
                });
            });
        }

        res.send('Property added successfully!');
    });
});
