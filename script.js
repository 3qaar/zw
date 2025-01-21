// رابط ملف السيرفر الذي يستقبل الطلبات
const SERVER_URL = 'http://localhost:3000'; // استبدل الرابط حسب الخادم الخاص بك

// عنصر يحتوي على قائمة العرض
const propertyList = document.getElementById('propertyList');

// لتخزين اسم العقار الحالي عند إضافة مرفق
let currentPropertyName = '';

// عند تحميل الصفحة، نجلب قائمة العقارات
window.onload = () => {
    fetchProperties();
};

// جلب جميع العقارات من الخادم وعرضها
function fetchProperties() {
    fetch(${SERVER_URL}/properties)
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

    if (!name || !location || !price || !type || !description) {
        alert("يرجى ملء جميع الحقول!");
        return;
    }

    const property = { name, location, price, type, description };

    fetch(${SERVER_URL}/properties, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(property),
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم إضافة العقار بنجاح.');
                fetchProperties(); // تحديث قائمة العقارات
            } else {
                alert(data.message || 'حدث خطأ أثناء الإضافة.');
            }
        })
        .catch(error => console.error('حدث خطأ:', error));
}

// عرض العقارات
function addPropertyToList(property) {
    const card = document.createElement('div');
    card.className = 'card mb-3 property-card';

    let firstImageHtml = '';
    if (property.images && property.images.length > 0) {
        firstImageHtml = <img src="${property.images[0]}" alt="${property.name}" class="img-fluid rounded-start" />;
    }

    let attachmentsHtml = '';
    if (property.images && property.images.length > 0) {
        attachmentsHtml = `
            <div class="mt-3 property-attachments">
                ${property.images.map((img, index) => `
                    <div class="attachment-item">
                        <img src="${img}" alt="مرفق ${index + 1}" class="img-thumbnail">
                        <button class="btn btn-danger btn-sm" onclick="deleteAttachment('${property.name}', ${index})">&times;</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const buttonsHtml = `
        <div class="d-flex gap-2 mt-3">
            <button class="btn btn-outline-primary btn-sm" onclick="addAttachment('${property.name}')">إضافة مرفق</button>
            <button class="btn btn-outline-warning btn-sm" onclick="editProperty('${property.name}')">تعديل</button>
            <button class="btn btn-outline-danger btn-sm" onclick="deleteProperty('${property.name}')">حذف</button>
        </div>
    `;

    card.innerHTML = `
        ${firstImageHtml}
        <div class="card-body">
            <h5 class="card-title">${property.name}</h5>
            <p class="card-text"><strong>الموقع:</strong> ${property.location}</p>
            <p class="card-text"><strong>السعر:</strong> ${property.price} ريال</p>
            <p class="card-text"><strong>النوع:</strong> ${property.type}</p>
            <p class="card-text">${property.description}</p>
            ${buttonsHtml}
            ${attachmentsHtml}
        </div>
    `;

    propertyList.appendChild(card);
}

// فتح النافذة المنبثقة لإضافة المرفقات
function addAttachment(propertyName) {
    currentPropertyName = propertyName;
    const modal = document.getElementById('attachmentModal');
    modal.style.display = "block";
}

// إغلاق النافذة المنبثقة
function closeModal() {
    const modal = document.getElementById('attachmentModal');
    modal.style.display = "none";
    document.getElementById('newAttachment').value = '';
}

// حفظ المرفق الجديد
function saveNewAttachment() {
    const newAttachment = document.getElementById('newAttachment').files[0];
    if (!newAttachment) {
        alert('يرجى اختيار صورة جديدة.');
        return;
    }

    const formData = new FormData();
    formData.append('action', 'addAttachment');
    formData.append('propertyName', currentPropertyName);
    formData.append('newAttachment', newAttachment);

    fetch(${SERVER_URL}/attachments, {
        method: 'POST',
        body: formData
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم إضافة المرفق بنجاح.');
                closeModal();
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في إضافة المرفق.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// حذف المرفق
function deleteAttachment(propertyName, index) {
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;

    fetch(${SERVER_URL}/attachments?propertyName=${encodeURIComponent(propertyName)}&index=${index}, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف المرفق بنجاح.');
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في حذف المرفق.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// حذف العقار
function deleteProperty(propertyName) {
    if (!confirm('هل أنت متأكد من حذف العقار بالكامل؟')) return;

    fetch(${SERVER_URL}/properties?propertyName=${encodeURIComponent(propertyName)}, {
        method: 'DELETE',
    })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                alert('تم حذف العقار بنجاح.');
                fetchProperties();
            } else {
                alert(data.message || 'حدث خطأ في حذف العقار.');
            }
        })
        .catch(error => console.error('Error:', error));
}

// تعديل العقار
function editProperty(propertyName) {
    fetch(${SERVER_URL}/properties?propertyName=${encodeURIComponent(propertyName)})
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const property = data.property;
                document.getElementById('propertyName').value = property.name;
                document.getElementById('propertyLocation').value = property.location;
                document.getElementById('propertyPrice').value = property.price;
                document.getElementById('propertyDescription').value = property.description;
                document.getElementById('propertyType').value = property.type;
                deleteProperty(propertyName);
            } else {
                alert(data.message || 'حدث خطأ.');
            }
        })
        .catch(error => console.error('Error:', error));
}
