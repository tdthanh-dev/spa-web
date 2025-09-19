package com.htttql.crmmodule.service.service;

import java.util.List;
import java.util.Map;

public interface IDashboardService {

    // Chỉ số cho lễ tân: toàn số (count)
    Map<String, Long> getReceptionistDashboardStats();

    // Phân phối trạng thái lịch hẹn: scheduled/confirmed/inProgress/completed/cancelled
    Map<String, Long> getAppointmentStatusChart();

    // Xu hướng lịch hẹn 7 ngày (mặc định 7 phần tử, oldest -> newest)
    List<Long> getAppointmentTrendChart();

    // Phân phối Tier khách hàng
    Map<String, Long> getCustomerTiersChart();

    // Xu hướng doanh thu 30 ngày (đơn vị VND, trả về long)
    List<Long> getRevenueTrendChart();

    // Tổng hợp tháng hiện tại: toàn số
    Map<String, Long> getMonthlyPerformance();
}
