<?php

// اسم ملف JSON الذي سيتم تخزين بيانات العقارات فيه
$jsonFile = __DIR__ . '/properties.json';

// اسم المجلد الذي سيتم حفظ الصور بداخله
$uploadsDir = __DIR__ . '/uploads';

// إذا لم يكن ملف JSON موجودًا، ننشئه بداخل مصفوفة فارغة
if (!file_exists($jsonFile)) {
    file_put_contents($jsonFile, json_encode([]));
}

// التأكد من وجود مجلد uploads أو إنشاؤه
if (!file_exists($uploadsDir)) {
    mkdir($uploadsDir, 0777, true);
}

// جلب جميع العقارات من ملف JSON
function getAllProperties($jsonFile) {
    return json_decode(file_get_contents($jsonFile), true);
}

// حفظ العقارات في ملف JSON
function saveAllProperties($jsonFile, $properties) {
    file_put_contents($jsonFile, json_encode($properties, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT));
}

// دالة مساعدة لحفظ الصور في مجلد uploads
function saveUploadedImages($files, $uploadsDir) {
    $savedPaths = [];

    // قد يأتي الملف على شكل مصفوفة (لأننا نستخدم images[])
    foreach ($files['name'] as $index => $name) {
        if ($files['error'][$index] === UPLOAD_ERR_OK) {
            $tmpName = $files['tmp_name'][$index];
            $ext = pathinfo($name, PATHINFO_EXTENSION);
            $uniqueName = uniqid('img_', true) . '.' . $ext;
            $destination = $uploadsDir . '/' . $uniqueName;

            if (move_uploaded_file($tmpName, $destination)) {
                // مسار الوصول إلى الصورة (نسبي أو مطلق حسب الحاجة)
                $savedPaths[] = 'uploads/' . $uniqueName;
            }
        }
    }

    return $savedPaths;
}

// دالة لحفظ مرفق واحد
function saveSingleImage($file, $uploadsDir) {
    if ($file['error'] === UPLOAD_ERR_OK) {
        $name = $file['name'];
        $tmpName = $file['tmp_name'];
        $ext = pathinfo($name, PATHINFO_EXTENSION);
        $uniqueName = uniqid('img_', true) . '.' . $ext;
        $destination = $uploadsDir . '/' . $uniqueName;
        if (move_uploaded_file($tmpName, $destination)) {
            return 'uploads/' . $uniqueName;
        }
    }
    return null;
}

// قراءة باراميتر action لتحديد العملية المطلوبة
$action = isset($_REQUEST['action']) ? $_REQUEST['action'] : null;

// التفرع حسب نوع العملية
switch ($action) {

    // جلب قائمة العقارات كاملة
    case 'read':
        $properties = getAllProperties($jsonFile);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode($properties, JSON_UNESCAPED_UNICODE);
        break;

    // إنشاء عقار جديد
    case 'create':
        // التحقق من القيم المرسلة
        $name = $_POST['name'] ?? '';
        $location = $_POST['location'] ?? '';
        $price = $_POST['price'] ?? '';
        $description = $_POST['description'] ?? '';
        $type = $_POST['type'] ?? '';

        if (!$name || !$location || !$price || !$description || !$type) {
            echo json_encode(['success' => false, 'message' => 'جميع الحقول مطلوبة.']);
            exit;
        }

        // حفظ الصور المرفوعة
        $savedPaths = [];
        if (isset($_FILES['images'])) {
            $savedPaths = saveUploadedImages($_FILES['images'], $uploadsDir);
        }

        // قراءة العقارات
        $properties = getAllProperties($jsonFile);

        // التحقق من عدم تكرار الاسم (مثال بسيط)
        foreach ($properties as $p) {
            if ($p['name'] === $name) {
                echo json_encode(['success' => false, 'message' => 'عقار بنفس الاسم موجود مسبقًا.']);
                exit;
            }
        }

        // إضافة العقار الجديد
        $newProperty = [
            'name' => $name,
            'location' => $location,
            'price' => $price,
            'description' => $description,
            'type' => $type,
            'images' => $savedPaths // مسارات الصور
        ];

        $properties[] = $newProperty;
        saveAllProperties($jsonFile, $properties);

        echo json_encode(['success' => true]);
        break;

    // الحصول على عقار محدد
    case 'getProperty':
        $propertyName = $_GET['propertyName'] ?? '';
        $properties = getAllProperties($jsonFile);

        $property = null;
        foreach ($properties as $p) {
            if ($p['name'] === $propertyName) {
                $property = $p;
                break;
            }
        }

        if ($property) {
            echo json_encode(['success' => true, 'property' => $property], JSON_UNESCAPED_UNICODE);
        } else {
            echo json_encode(['success' => false, 'message' => 'العقار غير موجود.']);
        }
        break;

    // حذف العقار بالكامل
    case 'deleteProperty':
        $propertyName = $_GET['propertyName'] ?? '';
        $properties = getAllProperties($jsonFile);

        // البحث عن العقار وإزالته
        $found = false;
        foreach ($properties as $index => $p) {
            if ($p['name'] === $propertyName) {
                // يمكن هنا أيضًا حذف الصور من المجلد إن أردت
                // foreach ($p['images'] as $imgPath) {
                //   @unlink(__DIR__ . '/' . $imgPath);
                // }
                $found = true;
                array_splice($properties, $index, 1);
                break;
            }
        }

        if ($found) {
            saveAllProperties($jsonFile, $properties);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'العقار غير موجود.']);
        }
        break;

    // إضافة مرفق (صورة جديدة) لعقار موجود
    case 'addAttachment':
        $propertyName = $_POST['propertyName'] ?? '';
        $properties = getAllProperties($jsonFile);

        // البحث عن العقار
        $propertyIndex = null;
        foreach ($properties as $index => $p) {
            if ($p['name'] === $propertyName) {
                $propertyIndex = $index;
                break;
            }
        }

        if ($propertyIndex === null) {
            echo json_encode(['success' => false, 'message' => 'العقار غير موجود.']);
            exit;
        }

        // حفظ الصورة الجديدة
        if (isset($_FILES['newAttachment'])) {
            $attachmentPath = saveSingleImage($_FILES['newAttachment'], $uploadsDir);
            if ($attachmentPath) {
                $properties[$propertyIndex]['images'][] = $attachmentPath;
                saveAllProperties($jsonFile, $properties);
                echo json_encode(['success' => true]);
            } else {
                echo json_encode(['success' => false, 'message' => 'فشل في رفع الملف.']);
            }
        } else {
            echo json_encode(['success' => false, 'message' => 'لم يتم إرسال ملف مرفق.']);
        }
        break;

    // حذف مرفق من عقار
    case 'deleteAttachment':
        $propertyName = $_GET['propertyName'] ?? '';
        $index = $_GET['index'] ?? '';
        $properties = getAllProperties($jsonFile);

        // البحث عن العقار
        $propertyIndex = null;
        foreach ($properties as $i => $p) {
            if ($p['name'] === $propertyName) {
                $propertyIndex = $i;
                break;
            }
        }

        if ($propertyIndex === null) {
            echo json_encode(['success' => false, 'message' => 'العقار غير موجود.']);
            exit;
        }

        // حذف المرفق إذا كان الفهرس صحيحًا
        if (isset($properties[$propertyIndex]['images'][$index])) {
            // يمكن أيضًا حذف الملف من المجلد لو أردت
            // @unlink(__DIR__ . '/' . $properties[$propertyIndex]['images'][$index]);

            array_splice($properties[$propertyIndex]['images'], $index, 1);
            saveAllProperties($jsonFile, $properties);
            echo json_encode(['success' => true]);
        } else {
            echo json_encode(['success' => false, 'message' => 'المرفق غير موجود.']);
        }
        break;

    default:
        echo json_encode(['success' => false, 'message' => 'لم يتم تحديد الإجراء المطلوب بشكل صحيح.']);
        break;
}
