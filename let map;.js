let map;
let marker;
let geocoder;

function initMap() {
    // إنشاء الخريطة في الموقع الجغرافي الافتراضي
    const initialLocation = { lat: 30.033, lng: 31.233 }; // القاهرة كموقع افتراضي
    map = new google.maps.Map(document.getElementById("map"), {
        center: initialLocation,
        zoom: 15,
    });

    // إنشاء الماركر (علامة الموقع)
    marker = new google.maps.Marker({
        position: initialLocation,
        map: map,
        draggable: true,
    });

    // إعداد geocoder لتحويل العنوان إلى إحداثيات
    geocoder = new google.maps.Geocoder();

    // تحديث حقل "الموقع" عند تحريك الماركر
    google.maps.event.addListener(marker, "dragend", function () {
        const position = marker.getPosition();
        geocodeLatLng(position.lat(), position.lng());
    });
}

function geocodeLatLng(lat, lng) {
    const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };
    geocoder.geocode({ location: latlng }, function (results, status) {
        if (status === "OK") {
            if (results[0]) {
                document.getElementById("location").value = results[0].formatted_address;
            }
        }
    });
}

// عند إرسال النموذج، أرسل الإحداثيات إلى الخادم
document.getElementById('propertyForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData(this);
    const position = marker.getPosition();

    // إضافة إحداثيات الموقع إلى البيانات المرسلة
    formData.append('lat', position.lat());
    formData.append('lng', position.lng());

    fetch('http://localhost:3000/add-property', {
        method: 'POST',
        body: formData
    })
    .then(response => response.text())
    .then(data => {
        alert(data);
    })
    .catch(error => {
        console.error('Error:', error);
    });
});
