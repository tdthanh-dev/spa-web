import apiClient from './apiClient'
import { extractApiResponse } from '@/utils/apiUtils'
import { API_ENDPOINTS } from '@/config/constants'

// Dashboard Statistics API
export const dashboardApi = {
    // Receptionist Dashboard Stats
    async getReceptionistStats() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/receptionist/stats`)
        return extractApiResponse(response)
    },

    // Charts Data
    async getAppointmentStatusChart() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/charts/appointment-status`)
        return extractApiResponse(response)
    },

    async getAppointmentTrendChart() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/charts/appointment-trend`)
        return extractApiResponse(response)
    },

    async getServicePopularityChart() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/charts/service-popularity`)
        return extractApiResponse(response)
    },

    async getCustomerTiersChart() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/charts/customer-tiers`)
        return extractApiResponse(response)
    },

    async getRevenueTrendChart() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/charts/revenue-trend`)
        return extractApiResponse(response)
    },

    // Performance Metrics
    async getMonthlyPerformance() {
        const response = await apiClient.get(`${API_ENDPOINTS.DASHBOARD}/performance/monthly`)
        return extractApiResponse(response)
    },

    // Get all dashboard data at once
    async getDashboardData() {
        try {
            const [
                receptionistStats,
                appointmentStatusChart,
                appointmentTrendChart,
                servicePopularityChart,
                customerTiersChart,
                revenueTrendChart,
                monthlyPerformance
            ] = await Promise.all([
                this.getReceptionistStats(),
                this.getAppointmentStatusChart(),
                this.getAppointmentTrendChart(),
                this.getServicePopularityChart(),
                this.getCustomerTiersChart(),
                this.getRevenueTrendChart(),
                this.getMonthlyPerformance()
            ])

            // extractApiResponse đã extract data rồi, không cần .data nữa
            return {
                stats: receptionistStats || {},
                charts: {
                    appointmentStatus: appointmentStatusChart || [],
                    appointmentTrend: appointmentTrendChart || [],
                    servicePopularity: servicePopularityChart || [],
                    customerTiers: customerTiersChart || [],
                    revenueTrend: revenueTrendChart || []
                },
                performance: monthlyPerformance || {}
            }
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
            // Return empty data structure on error
            return {
                stats: {},
                charts: {
                    appointmentStatus: [],
                    appointmentTrend: [],
                    servicePopularity: [],
                    customerTiers: [],
                    revenueTrend: []
                },
                performance: {}
            }
        }
    }
}

export default dashboardApi
