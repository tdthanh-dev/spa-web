# 🧪 TEST API LEADS (YÊU CẦU TƯ VẤN)

## 🚀 **API ENDPOINT MỚI**

### **GET Leads List**

```bash
GET http://localhost:8081/api/leads?page=0&size=20
Authorization: Bearer {JWT_TOKEN}
```

**Expected Response Structure:**

```json
{
  "success": true,
  "data": {
    "content": [
      {
        "leadId": 60,
        "fullName": "Thành",
        "phone": "0123456789",
        "note": "string",
        "status": "NEW",
        "ipAddress": "0:0:0:0:0:0:0:1",
        "createdAt": [2025, 8, 23, 9, 52, 48, 906764000],
        "updatedAt": [2025, 8, 23, 9, 52, 48, 906764000]
      }
    ],
    "pageable": {
      "pageNumber": 0,
      "pageSize": 20,
      "sort": { "empty": true, "sorted": false, "unsorted": true },
      "offset": 0,
      "paged": true,
      "unpaged": false
    },
    "last": false,
    "totalPages": 2,
    "totalElements": 26,
    "size": 20,
    "number": 0,
    "sort": { "empty": true, "sorted": false, "unsorted": true },
    "numberOfElements": 20,
    "first": true,
    "empty": false
  },
  "timestamp": [2025, 8, 23, 17, 1, 56, 441099000]
}
```

---

## ✅ **CHANGES IMPLEMENTED**

### **1. API Endpoints Updated**

- ✅ `CUSTOMER_REQUESTS` → `LEADS`
- ✅ New endpoint: `http://localhost:8081/api/leads`
- ✅ Pagination support: `?page=0&size=20`

### **2. API Service Updated**

- ✅ `customerRequestsAPI` → `leadsAPI`
- ✅ Added `updateStatus` method
- ✅ All CRUD operations supported

### **3. Frontend Updates**

- ✅ `ConsultationDashboard` uses `leadsAPI`
- ✅ Field mapping updated:
  - `request.id` → `request.leadId`
  - `request.name` → `request.fullName`
  - `request.phoneNumber` → `request.phone`
  - `request.customerNote` → `request.note`
- ✅ Status handling for leads

---

## 🧪 **TESTING STEPS**

### **Step 1: Start Services**

```bash
# Terminal 1: Backend
cd crm-module
mvn spring-boot:run

# Terminal 2: Frontend
cd admin-spa-management
npm run dev
```

### **Step 2: Test Authentication**

1. **Login**: `2251120247@ut.edu.vn` / `Thanh1410@`
2. **Enter OTP**: Any 6 digits (e.g., `123456`)
3. **Verify**: Redirect to ADMIN dashboard

### **Step 3: Test Leads API**

1. **Navigate**: Receptionist → Consultation
2. **Check Console**: Should see leads API calls
3. **Verify Data**: Leads display correctly
4. **Check Pagination**: 26 total elements, 20 per page

---

## 🔍 **DEBUG INFORMATION**

### **Console Logs to Check**

```javascript
// API Call
Fetching customer requests with new paginated response structure...
API Response: { success: true, data: { content: [...], totalElements: 26 } }

// Data Structure
Response structure: {
  content: 20,
  totalElements: 26,
  totalPages: 2,
  currentPage: 0,
  pageSize: 20
}
```

### **Network Tab Check**

- ✅ `GET /api/leads?page=0&size=20` → 200 OK
- ✅ Authorization header present
- ✅ Response structure matches expected format

---

## 📊 **DATA MAPPING**

### **Field Mapping (Old → New)**

| **Old Field**  | **New Field** | **Description**       |
| -------------- | ------------- | --------------------- |
| `id`           | `leadId`      | Unique identifier     |
| `name`         | `fullName`    | Customer full name    |
| `phoneNumber`  | `phone`       | Phone number          |
| `customerNote` | `note`        | Consultation note     |
| `status`       | `status`      | Request status        |
| `createdAt`    | `createdAt`   | Creation timestamp    |
| `updatedAt`    | `updatedAt`   | Last update timestamp |

### **Status Values**

- ✅ `NEW` → "Mới" (status-new class)
- ✅ `IN_PROGRESS` → "Đang tư vấn" (status-in-progress class)
- ✅ `SUCCESS` → "Thành công" (status-success class)
- ✅ `CANCELLED` → "Đã hủy" (status-cancelled class)

---

## 🚨 **TROUBLESHOOTING**

### **Issue 1: "Cannot connect to server"**

- **Check**: Backend running on port 8081
- **Solution**: Run `mvn spring-boot:run` in crm-module

### **Issue 2: "401 Unauthorized"**

- **Check**: JWT token valid
- **Solution**: Re-login to get fresh token

### **Issue 3: "No data displayed"**

- **Check**: API response structure
- **Solution**: Verify `response.data.data.content` exists

### **Issue 4: "Field mapping errors"**

- **Check**: Console for undefined field errors
- **Solution**: Verify field names match API response

---

## 🎯 **SUCCESS CRITERIA**

✅ **API Integration**: Leads API working correctly  
✅ **Data Display**: 26 leads shown with pagination  
✅ **Field Mapping**: All fields display correctly  
✅ **Status Handling**: Status badges work properly  
✅ **Pagination**: 20 items per page, 2 total pages  
✅ **Authentication**: JWT token working for protected endpoint

---

## 📋 **API ENDPOINTS SUMMARY**

| **Method** | **Endpoint**                             | **Description**                |
| ---------- | ---------------------------------------- | ------------------------------ |
| `GET`      | `/api/leads?page=0&size=20`              | Get leads list with pagination |
| `GET`      | `/api/leads/{id}`                        | Get lead by ID                 |
| `POST`     | `/api/leads`                             | Create new lead                |
| `PUT`      | `/api/leads/{id}`                        | Update lead                    |
| `PUT`      | `/api/leads/{id}/status?status={status}` | Update lead status             |
| `DELETE`   | `/api/leads/{id}`                        | Delete lead                    |

---

## 🎉 **READY FOR TESTING**

**🚀 API Leads đã được cập nhật hoàn toàn!**

**📋 Next Steps:**

1. **Test leads API** với authentication
2. **Verify data display** trong ConsultationDashboard
3. **Check pagination** hoạt động đúng
4. **Validate field mapping** không có lỗi
5. **Test CRUD operations** nếu cần

**💡 Tip**: Sử dụng browser Network tab để monitor API calls!

**🏆 Your consultation system is now ready with the updated leads API!** ✨📊
