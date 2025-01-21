const express = require('express');
const cors = require('cors');

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.send('مرحبًا بك في السيرفر Node.js!');
});

app.listen(port, () => {
  console.log(`سيرفر Node.js يعمل على http://localhost:${port}`);
});
