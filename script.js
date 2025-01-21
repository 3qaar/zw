// رابط ملف السيرفر الذي يستقبل الطلبات
const SERVER_URL = 'http://127.0.0.1:5000/properties'; // استبدل الرابط حسب الخادم الخاص بك

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
    fetch(SERVER_URL)
        .then(response => response.json())
        .then(data => {
            propertyList.innerHTML = '<h2 class="h5">العقارات المتوفرة</h2>';
            data.forEach(addPropertyToList);
        })
        .catch(error => console.error('Error:', error));
}

// إضافة عقار جديد
function addProperty() {
    const name = document.getElementById('propertyName').value.trim();
    const location = document.getElementById('propertyLocation').value.trim();
    const price = document.getElementById('propertyPrice').value.trim();
    const description = document.getElementById('propertyDescription').value.trim();
    const type = document.getElementById('propertyType').value;
    const imageInput = document.getElementById('propertyImages');

    if (!name || !location || !price || !description || !type) {
        alert('يرجى تعبئة جميع الحقول.');
        return;
    }

    if (imageInput.files.length === 0) {
        alert('يرجى اختيار صورة واحدة على الأقل.');
        return;
    }
 
    // نستخدم FormData لإرسال البيانات والملفات للسيرفر
    const formData = new FormData();
    formData.append('action', 'create');
    formData.append('name', name);
    formData.append('location', location);
    formData.append('price', price);
    formData.append('description', description);
    formData.append('type', type);
    
    // إضافة الملفات لـ FormData
    for (let i = 0; i < imageInput.files.length; i++) {
        formData.append('images[]', imageInput.files[i]);
    }
    
    fetch(SERVER_URL, {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert('تم إضافة العقار بنجاح.');
            // إعادة تعيين الحقول
            document.getElementById('propertyName').value = '';
            document.getElementById('propertyLocation').value = '';
            document.getElementById('propertyPrice').value = '';
            document.getElementById('propertyDescription').value = '';
            document.getElementById('propertyImages').value = '';
            // تحديث القائمة
            fetchProperties();
        } else {
            alert(data.message || 'حدث خطأ في إضافة العقار.');
        }
    })
    .catch(error => console.error('Error:', error));
}

// إضافة العقار إلى واجهة العرض
function addPropertyToList(property) {
    const card = document.createElement('div');
    card.className = 'card mb-3 property-card';

    // عرض صورة أولى في حال كانت موجودة
    let firstImageHtml = '';
    if (property.images && property.images.length > 0) {
        firstImageHtml = <img src="${property.images[0]}" alt="${property.name}" />;
    }

    // إعداد المرفقات (جميع الصور)
    let attachmentsHtml = '';
    if (property.images && property.images.length > 0) {
        attachmentsHtml = `
            <div class="mt-3 property-attachments">
                ${property.images.map((img, index) => `
                    <div class="attachment-item">
                        <img src="${img}" alt="مرفق ${index + 1}">
                        <button onclick="deleteAttachment('${property.name}', ${index})">&times;</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // أزرار التحكم (إضافة مرفق، تعديل، حذف)
    const buttonsHtml = `
      <div class="d-flex gap-2 mt-3">
        <button class="btn btn-outline-primary btn-sm" onclick="addAttachment('${property.name}')">
          <i class="bi bi-paperclip"></i> إضافة مرفق
        </button>
        <button class="btn btn-outline-warning btn-sm" onclick="editProperty('${property.name}')">
          <i class="bi bi-pencil-square"></i> تعديل
        </button>
        <button class="btn btn-outline-danger btn-sm" onclick="deleteProperty('${property.name}')">
          <i class="bi bi-trash"></i> حذف
        </button>
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

    fetch(SERVER_URL, {
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

    fetch(${SERVER_URL}?action=deleteAttachment&propertyName=${encodeURIComponent(propertyName)}&index=${index})
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

// حذف العقار بالكامل
function deleteProperty(propertyName) {
    if (!confirm('هل أنت متأكد من حذف العقار بالكامل؟')) return;

    fetch(${SERVER_URL}?action=deleteProperty&propertyName=${encodeURIComponent(propertyName)})
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
    // في تطبيق حقيقي، يمكن إظهار نافذة أو صفحة خاصة بالتعديل.
    // هنا سنقوم فقط بجلب بيانات العقار وعرضها في الحقول ثم حذفه وإعادة إدخاله عند الضغط على "إضافة العقار".
    fetch(${SERVER_URL}?action=getProperty&propertyName=${encodeURIComponent(propertyName)})
        .then(response => response.json())
        .then(data => {
            if (!data.success) {
                alert(data.message);
                return;
            }
            const property = data.property;
            document.getElementById('propertyName').value = property.name;
            document.getElementById('propertyLocation').value = property.location;
            document.getElementById('propertyPrice').value = property.price;
            document.getElementById('propertyDescription').value = property.description;
            document.getElementById('propertyType').value = property.type;
            // حذف العقار القديم
            deleteProperty(propertyName);
        })
        .catch(error => console.error('Error:', error));
}

// تصفية العقارات
function filterPropertiesAdmin() {
    const minPrice = parseFloat(document.getElementById('minPriceAdmin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPriceAdmin').value) || Number.MAX_VALUE;
    const type = document.getElementById('propertyTypeAdmin').value;

    fetch(${SERVER_URL}?action=read)
        .then(response => response.json())
        .then(data => {
            const filtered = data.filter(property => {
                const price = parseFloat(property.price);
                const matchesPrice = price >= minPrice && price <= maxPrice;
                const matchesType = type ? (property.type === type) : true;
                return matchesPrice && matchesType;
            });

            propertyList.innerHTML = '<h2 class="h5">العقارات المتوفرة</h2>';
            filtered.forEach(addPropertyToList);
        })
        .catch(error => console.error('Error:', error));
}
