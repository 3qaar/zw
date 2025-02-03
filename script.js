// عنصر يحتوي على قائمة العرض
const propertyList = document.getElementById('propertyList');

// لتخزين اسم العقار الحالي عند إضافة مرفق
let currentPropertyName = '';

// عند تحميل الصفحة، نجلب قائمة العقارات
window.onload = () => {
    fetchProperties();
};

// جلب جميع العقارات من localStorage
function fetchProperties() {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    
    // إضافة قيمة افتراضية للصور إذا كانت غير موجودة
    const normalizedProperties = properties.map(property => ({
        images: [],
        ...property
    }));
    
    propertyList.innerHTML = '<h2 class="h5">العقارات المتوفرة</h2>';
    normalizedProperties.forEach(addPropertyToList);
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

    const property = { 
        id: Date.now(),
        name, 
        location, 
        price, 
        type, 
        description,
        images: [] // إضافة خاصية الصور بشكل افتراضي
    };

    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    properties.push(property);
    localStorage.setItem('properties', JSON.stringify(properties));

    alert('تمت إضافة العقار بنجاح!');
    resetForm();
    fetchProperties();
}

// عرض العقارات في واجهة المستخدم
function displayProperties() {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const propertyList = document.getElementById("propertyList");
    propertyList.innerHTML = "";

    properties.forEach(property => {
        // إضافة قيمة افتراضية للصور
        if (!property.images) property.images = [];
        
        const propertyCard = `
            <div class="card mb-3 property-card">
                <div class="row g-0">
                    <div class="col-md-4">
                        ${property.images?.length ? 
                            `<img src="${property.images[0]}" alt="صورة العقار" class="img-fluid rounded-start">` : 
                            '<div class="bg-secondary h-100 d-flex align-items-center justify-content-center">لا توجد صور</div>'}
                    </div>
                    <div class="col-md-8">
                        <div class="card-body">
                            <h5 class="card-title">${property.name}</h5>
                            <p class="card-text">${property.description}</p>
                            <p class="card-text"><small class="text-muted">الموقع: ${property.location}</small></p>
                            <p class="card-text"><small class="text-muted">السعر: ${property.price} ريال</small></p>
                        </div>
                    </div>
                </div>
            </div>`;
        propertyList.innerHTML += propertyCard;
    });
}

// إضافة العقار إلى واجهة العرض
function addPropertyToList(property) {
    const card = document.createElement('div');
    card.className = 'card mb-3 property-card';

    // عرض صورة أولى في حال كانت موجودة
    let firstImageHtml = '';
    if (property.images?.length > 0) {
        firstImageHtml = `<img src="${property.images[0]}" alt="${property.name}" class="img-fluid rounded-start">`;
    } else {
        firstImageHtml = '<div class="placeholder-image bg-secondary text-center p-3">لا توجد صور</div>';
    }

    // إعداد المرفقات (جميع الصور)
    let attachmentsHtml = '';
    if (property.images?.length > 0) {
        attachmentsHtml = `
            <div class="mt-3 property-attachments d-flex flex-wrap gap-2">
                ${property.images.map((img, index) => `
                    <div class="attachment-item position-relative" style="width: 100px;">
                        <img src="${img}" alt="مرفق ${index + 1}" class="img-thumbnail">
                        <button class="btn btn-danger btn-sm position-absolute top-0 start-0" 
                            onclick="deleteAttachment('${property.name}', ${index})">&times;</button>
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
        <div class="row g-0">
            <div class="col-md-4">
                ${firstImageHtml}
            </div>
            <div class="col-md-8">
                <div class="card-body">
                    <h5 class="card-title">${property.name}</h5>
                    <p class="card-text"><strong>الموقع:</strong> ${property.location}</p>
                    <p class="card-text"><strong>السعر:</strong> ${Number(property.price).toLocaleString()} ريال</p>
                    <p class="card-text"><strong>النوع:</strong> ${property.type}</p>
                    <p class="card-text">${property.description}</p>
                    ${buttonsHtml}
                    ${attachmentsHtml}
                </div>
            </div>
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

    const reader = new FileReader();
    reader.onload = function(e) {
        const properties = JSON.parse(localStorage.getItem('properties')) || [];
        const property = properties.find(p => p.name === currentPropertyName);
        if (property) {
            property.images.push(e.target.result);
            localStorage.setItem('properties', JSON.stringify(properties));
            alert('تم إضافة المرفق بنجاح.');
            closeModal();
            fetchProperties();
        }
    };
    reader.readAsDataURL(newAttachment);
}

// حذف المرفق
function deleteAttachment(propertyName, index) {
    if (!confirm('هل أنت متأكد من حذف هذا المرفق؟')) return;

    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = properties.find(p => p.name === propertyName);
    if (property) {
        property.images.splice(index, 1);
        localStorage.setItem('properties', JSON.stringify(properties));
        alert('تم حذف المرفق بنجاح.');
        fetchProperties();
    }
}

// حذف العقار بالكامل
function deleteProperty(propertyName) {
    if (!confirm('هل أنت متأكد من حذف العقار بالكامل؟')) return;

    let properties = JSON.parse(localStorage.getItem('properties')) || [];
    properties = properties.filter(p => p.name !== propertyName);
    localStorage.setItem('properties', JSON.stringify(properties));
    alert('تم حذف العقار بنجاح.');
    fetchProperties();
}

// تعديل العقار
function editProperty(propertyName) {
    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const property = properties.find(p => p.name === propertyName);
    if (property) {
        document.getElementById('propertyName').value = property.name;
        document.getElementById('propertyLocation').value = property.location;
        document.getElementById('propertyPrice').value = property.price;
        document.getElementById('propertyDescription').value = property.description;
        document.getElementById('propertyType').value = property.type;
        deleteProperty(propertyName);
    }
}

// تصفية العقارات
function filterPropertiesAdmin() {
    const minPrice = parseFloat(document.getElementById('minPriceAdmin').value) || 0;
    const maxPrice = parseFloat(document.getElementById('maxPriceAdmin').value) || Number.MAX_VALUE;
    const type = document.getElementById('propertyTypeAdmin').value;

    const properties = JSON.parse(localStorage.getItem('properties')) || [];
    const filtered = properties.filter(property => {
        const price = parseFloat(property.price);
        return price >= minPrice && 
               price <= maxPrice &&
               (type === "" || property.type === type);
    });
    propertyList.innerHTML = '<h2 class="h5">النتائج المصفاة</h2>';
    filtered.forEach(addPropertyToList);
}

// تهيئة النموذج
function resetForm() {
    document.getElementById('propertyName').value = '';
    document.getElementById('propertyLocation').value = '';
    document.getElementById('propertyPrice').value = '';
    document.getElementById('propertyType').selectedIndex = 0;
    document.getElementById('propertyDescription').value = '';
    document.getElementById('propertyImages').value = '';
}
