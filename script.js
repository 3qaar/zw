// مسار السيرفر الذي سيستقبل الطلبات
const SERVER_URL = 'server.php';

const propertyList = document.getElementById('propertyList');

// لتخزين اسم العقار الحالي عند إضافة مرفق
let currentPropertyName = '';

// جلب جميع العقارات وعرضها فور تحميل الصفحة
window.onload = () => {
    fetchProperties();
};

// دالة جلب العقارات من الخادم
function fetchProperties() {
    fetch(`${SERVER_URL}?action=read`)
        .then(response => response.json())
        .then(data => {
            propertyList.innerHTML = '<h2>العقارات المتوفرة</h2>';
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

    // إرسال الطلب للسيرفر
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

// دالة إنشاء العناصر في واجهة العرض
function addPropertyToList(property) {
    const propertyItem = document.createElement('div');
    propertyItem.className = 'property-item';

    // عرض صورة أولى في حال كانت موجودة
    let firstImageHtml = '';
    if (property.images && property.images.length > 0) {
        firstImageHtml = `<img src="${property.images[0]}" alt="${property.name}" style="display: block; max-width: 100%; border-radius: 4px;">`;
    }

    // عرض جميع المرفقات
    let attachmentsHtml = '';
    if (property.images && property.images.length > 0) {
        attachmentsHtml = `
            <div class="attachments">
                ${property.images.map((img, index) => `
                    <div class="attachment-item">
                        <img src="${img}" alt="مرفق ${index + 1}">
                        <button onclick="deleteAttachment('${property.name}', ${index})">حذف</button>
                    </div>
                `).join('')}
            </div>
        `;
    }

    const buttonsHtml = `
        <button onclick="addAttachment('${property.name}')">إضافة مرفق</button>
        <button onclick="editProperty('${property.name}')">تعديل</button>
        <button onclick="deleteProperty('${property.name}')">حذف</button>
    `;

    propertyItem.innerHTML = `
        <h3>${property.name}</h3>
        <p><strong>الموقع:</strong> ${property.location}</p>
        <p><strong>السعر:</strong> ${property.price} ريال</p>
        <p><strong>النوع:</strong> ${property.type}</p>
        <p>${property.description}</p>
        ${firstImageHtml}
        ${buttonsHtml}
        ${attachmentsHtml}
    `;
    propertyList.appendChild(propertyItem);
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

    fetch(`${SERVER_URL}?action=deleteAttachment&propertyName=${encodeURIComponent(propertyName)}&index=${index}`)
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

    fetch(`${SERVER_URL}?action=deleteProperty&propertyName=${encodeURIComponent(propertyName)}`)
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
    // في تطبيق حقيقي، يُفضل إظهار نموذج تعديل منفصل أو نافذة منبثقة.
    // هنا سنقوم فقط بجلب بيانات العقار ووضعها في حقول الإدخال ثم حذف العقار القديم وإعادة إنشاءه عند الضغط على "إضافة العقار".
    fetch(`${SERVER_URL}?action=getProperty&propertyName=${encodeURIComponent(propertyName)}`)
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

    fetch(`${SERVER_URL}?action=read`)
        .then(response => response.json())
        .then(data => {
            const filtered = data.filter(property => {
                const price = parseFloat(property.price);
                const matchesPrice = price >= minPrice && price <= maxPrice;
                const matchesType = type ? (property.type === type) : true;
                return matchesPrice && matchesType;
            });
            propertyList.innerHTML = '<h2>العقارات المتوفرة</h2>';
            filtered.forEach(addPropertyToList);
        })
        .catch(error => console.error('Error:', error));
}
