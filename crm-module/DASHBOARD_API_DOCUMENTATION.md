# Dashboard API Documentation

## Tổng quan
Module Dashboard cung cấp các endpoint để lấy thống kê và phân tích dữ liệu cho hệ thống CRM. Tất cả các endpoint đều yêu cầu xác thực Bearer Token và quyền truy cập tối thiểu là RECEPTIONIST.

## Base URL
```
/api/dashboard
```

## Authentication
- **Type:** Bearer Token
- **Required Roles:** ADMIN, MANAGER, RECEPTIONIST

---

## 1. Thống kê tổng quan cho Lễ tân

### Endpoint
```
GET /api/dashboard/receptionist/stats
```

### Mô tả
Lấy các thống kê tổng quan cho dashboard của lễ tân, bao gồm dữ liệu theo ngày, tuần, tháng.

### Response Format
```json
{
  "success": true,
  "message": "Receptionist dashboard counts",
  "data": {
    "todayAppointments": 8,
    "todayCompleted": 3,
    "todayNoShows": 1,
    "pendingRequests": 4,
    "newCustomersToday": 2,
    "weekAppointments": 45,
    "weekNewCustomers": 8,
    "monthAppointments": 180,
    "monthNewCustomers": 25,
    "totalCustomers": 320,
    "activeCustomers": 145,
    "scheduled": 12,
    "confirmed": 8,
    "completed": 25,
    "cancelled": 2
  }
}
```

### Ý nghĩa các trường dữ liệu

| Trường | Loại | Ý nghĩa |
|--------|------|---------|
| `todayAppointments` | Long | Tổng số lịch hẹn trong ngày hôm nay |
| `todayCompleted` | Long | Số lịch hẹn đã hoàn thành trong ngày |
| `todayNoShows` | Long | Số lịch hẹn bị hủy/không đến trong ngày |
| `pendingRequests` | Long | Số yêu cầu leads đang chờ xử lý (status = NEW) |
| `newCustomersToday` | Long | Số khách hàng mới đăng ký trong ngày |
| `weekAppointments` | Long | Tổng lịch hẹn trong 7 ngày gần nhất |
| `weekNewCustomers` | Long | Khách hàng mới trong tuần (7 ngày) |
| `monthAppointments` | Long | Tổng lịch hẹn trong 30 ngày gần nhất |
| `monthNewCustomers` | Long | Khách hàng mới trong tháng (30 ngày) |
| `totalCustomers` | Long | Tổng số khách hàng trong hệ thống |
| `activeCustomers` | Long | Khách hàng có hoạt động trong 30 ngày |
| `scheduled` | Long | Tổng lịch hẹn đã lên lịch (toàn hệ thống) |
| `confirmed` | Long | Tổng lịch hẹn đã xác nhận |
| `completed` | Long | Tổng lịch hẹn đã hoàn thành |
| `cancelled` | Long | Tổng lịch hẹn đã bị hủy |

---

## 2. Biểu đồ trạng thái lịch hẹn

### Endpoint
```
GET /api/dashboard/charts/appointment-status
```

### Mô tả
Lấy số lượng lịch hẹn theo từng trạng thái để hiển thị biểu đồ tròn.

### Response Format
```json
{
  "success": true,
  "message": "Appointment status counts",
  "data": {
    "scheduled": 12,
    "confirmed": 8,
    "completed": 25,
    "cancelled": 2
  }
}
```

### Ý nghĩa các trạng thái

| Trạng thái | Ý nghĩa |
|------------|---------|
| `scheduled` | Đã lên lịch - lịch hẹn mới được tạo |
| `confirmed` | Đã xác nhận - khách hàng đã xác nhận tham gia |
| `completed` | Hoàn thành - dịch vụ đã được thực hiện |
| `cancelled` | Đã hủy - lịch hẹn bị hủy bỏ |

---

## 3. Xu hướng lịch hẹn theo ngày

### Endpoint
```
GET /api/dashboard/charts/appointment-trend
```

### Mô tả
Lấy số lượng lịch hẹn trong 7 ngày gần nhất để vẽ biểu đồ đường xu hướng.

### Response Format
```json
{
  "success": true,
  "message": "Appointment trend counts (7 days)",
  "data": [5, 8, 12, 6, 9, 15, 8]
}
```

### Ý nghĩa dữ liệu
- **Định dạng:** Mảng 7 phần tử
- **Thứ tự:** Từ cũ đến mới (7 ngày trước → hôm nay)
- **Giá trị:** Số lượng lịch hẹn trong từng ngày
- **Ví dụ:** `[5, 8, 12, 6, 9, 15, 8]` có nghĩa:
  - 7 ngày trước: 5 lịch hẹn
  - 6 ngày trước: 8 lịch hẹn
  - ...
  - Hôm nay: 8 lịch hẹn

---

## 4. Phân bố khách hàng theo hạng

### Endpoint
```
GET /api/dashboard/charts/customer-tiers
```

### Mô tả
Lấy số lượng khách hàng theo từng hạng thành viên.

### Response Format
```json
{
  "success": true,
  "message": "Customer tier counts",
  "data": {
    "REGULAR": 180,
    "SILVER": 95,
    "GOLD": 35,
    "VIP": 10,
    "NONE": 25
  }
}
```

### Ý nghĩa các hạng thành viên

| Hạng | Ý nghĩa |
|------|---------|
| `REGULAR` | Khách hàng thường - hạng cơ bản |
| `SILVER` | Khách hàng bạc - đã có một số giao dịch |
| `GOLD` | Khách hàng vàng - khách hàng trung thành |
| `VIP` | Khách hàng VIP - khách hàng cao cấp |
| `NONE` | Chưa phân hạng - khách hàng mới |

---

## 5. Xu hướng doanh thu

### Endpoint
```
GET /api/dashboard/charts/revenue-trend
```

### Mô tả
Lấy doanh thu theo ngày trong 30 ngày gần nhất (đơn vị VND).

### Response Format
```json
{
  "success": true,
  "message": "Revenue trend numbers (30 days)",
  "data": [1500000, 2200000, 1800000, ..., 2500000]
}
```

### Ý nghĩa dữ liệu
- **Định dạng:** Mảng 30 phần tử
- **Đơn vị:** VND (Việt Nam Đồng)
- **Thứ tự:** Từ cũ đến mới (30 ngày trước → hôm nay)
- **Giá trị:** Tổng doanh thu trong từng ngày
- **Ví dụ:** `1500000` = 1,500,000 VND doanh thu trong ngày đó

---

## 6. Hiệu suất tháng hiện tại

### Endpoint
```
GET /api/dashboard/performance/monthly
```

### Mô tả
Lấy các chỉ số hiệu suất của tháng hiện tại.

### Response Format
```json
{
  "success": true,
  "message": "Monthly performance counts",
  "data": {
    "totalAppointments": 180,
    "completedAppointments": 165,
    "cancelledAppointments": 15,
    "totalRevenue": 52000000,
    "newCustomers": 25,
    "returningCustomers": 155
  }
}
```

### Ý nghĩa các chỉ số

| Trường | Loại | Ý nghĩa |
|--------|------|---------|
| `totalAppointments` | Long | Tổng số lịch hẹn trong tháng |
| `completedAppointments` | Long | Số lịch hẹn đã hoàn thành |
| `cancelledAppointments` | Long | Số lịch hẹn bị hủy |
| `totalRevenue` | Long | Tổng doanh thu tháng (VND) |
| `newCustomers` | Long | Số khách hàng mới trong tháng |
| `returningCustomers` | Long | Khách hàng quay lại (có ≥2 lịch hẹn) |

---

## Error Handling

### Các lỗi có thể xảy ra:

1. **401 Unauthorized**
   ```json
   {
     "success": false,
     "message": "Token không hợp lệ hoặc đã hết hạn"
   }
   ```

2. **403 Forbidden**
   ```json
   {
     "success": false,
     "message": "Không có quyền truy cập endpoint này"
   }
   ```

3. **500 Internal Server Error**
   - Khi có lỗi database, hệ thống sẽ trả về dữ liệu fallback
   - Dữ liệu fallback là các con số mẫu để đảm bảo giao diện không bị lỗi

---

## Ghi chú kỹ thuật

1. **Caching:** Các endpoint này nên được cache trong 5-10 phút để tối ưu performance
2. **Timezone:** Tất cả thời gian được tính theo timezone của server
3. **Fallback Data:** Khi có lỗi, hệ thống trả về dữ liệu mẫu thay vì lỗi 500
4. **Performance:** Các query được tối ưu với `@Transactional(readOnly = true)`
5. **Security:** Tất cả endpoint đều yêu cầu authentication và authorization

---

## Sử dụng trong Frontend

### Ví dụ call API với JavaScript:
```javascript
// Lấy thống kê tổng quan
fetch('/api/dashboard/receptionist/stats', {
  headers: {
    'Authorization': 'Bearer ' + token,
    'Content-Type': 'application/json'
  }
})
.then(response => response.json())
.then(data => {
  console.log('Today appointments:', data.data.todayAppointments);
  console.log('Total customers:', data.data.totalCustomers);
});

// Lấy xu hướng lịch hẹn 7 ngày
fetch('/api/dashboard/charts/appointment-trend', {
  headers: {
    'Authorization': 'Bearer ' + token
  }
})
.then(response => response.json())
.then(data => {
  // data.data là mảng [5, 8, 12, 6, 9, 15, 8]
  drawLineChart(data.data);
});
```