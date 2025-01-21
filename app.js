const SERVER_URL = 'http://localhost:3000'; // رابط السيرفر

const propertyList = document.getElementById('propertyList');

// عند تحميل الصفحة، جلب قائمة العقارات
window.onload = () => {
  fetchProperties();
};

// جلب جميع العقارات من السيرفر وعرضها
function fetchProperties() {
  fetch(`${SERVER_URL}/properties`)
    .then(response => response.json())
    .then(data => {
      propertyList.innerHTML = '<h2 class="h5">العقارات المتوفرة</h2>';
      data.forEach(addPropertyToList);
    })
    .catch(error => console.error('Error:', error));
}

// إضافة عقار جديد
function addProperty() {
  const name = document.getElementById("propertyName").value;
  const location = document.getElementById("propertyLocation").value;
  const price = document.getElementById("propertyPrice").value;
  const type = document.getElementById("propertyType").value;
  const description = document.getElementById("propertyDescription").value;
  const images = document.getElementById("propertyImages").files;

  if (!name || !location || !price || !type || !description) {
    alert("يرجى ملء جميع الحقول!");
    return;
  }

  const formData = new FormData();
  formData.append('name', name);
  formData.append('location', location);
  formData.append('price', price);
  formData.append('type', type);
  formData.append('description', description);
  
  // إضافة الصور (المرفقات)
  for (let i = 0; i < images.length; i++) {
    formData.append('images', images[i]);
  }

  fetch(`${SERVER_URL}/properties`, {
    method: 'POST',
    body: formData
  })
    .then(response => response.json())
    .then(data => {
      alert(data.message);
      fetchProperties(); // تحديث قائمة العقارات
    })
    .catch(error => console.error('حدث خطأ:', error));
}

// إضافة العقار إلى واجهة العرض
function addPropertyToList(property) {
  const card = document.createElement('div');
  card.className = 'card mb-3 property-card';

  // عرض صورة أولى إن وجدت
  let firstImageHtml = '';
  if (property.images && property.images.length > 0) {
    firstImageHtml = `<img src="${property.images[0]}" alt="${property.name}" class="img-fluid rounded-start">`;
  }

  card.innerHTML = `
    ${firstImageHtml}
    <div class="card-body">
      <h5 class="card-title">${property.name}</h5>
      <p class="card-text"><strong>الموقع:</strong> ${property.location}</p>
      <p class="card-text"><strong>السعر:</strong> ${property.price} ريال</p>
      <p class="card-text"><strong>النوع:</strong> ${property.type}</p>
      <p class="card-text">${property.description}</p>
    </div>
  `;
  propertyList.appendChild(card);
}
