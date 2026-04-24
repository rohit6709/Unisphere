import { apiRequest, apiRequestRaw } from './serviceUtils';
import { getAllClubs } from './clubService';
import { getAllEvents } from './eventService';

export const getStudentDashboard = (params) => apiRequest('get', '/students/dashboard', { params });

const isNotFoundError = (error) => error?.response?.status === 404;

const getFallbackDashboardData = async () => {
	const [clubsData, eventsData] = await Promise.all([
		getAllClubs(),
		getAllEvents(),
	]);

	return {
		clubs: clubsData?.clubs ?? [],
		events: eventsData?.events ?? [],
	};
};

const getRoleDashboard = async (path) => {
	try {
		return await apiRequest('get', path);
	} catch (error) {
		if (!isNotFoundError(error)) {
			throw error;
		}

		return getFallbackDashboardData();
	}
};

export const getFacultyDashboard = () => getRoleDashboard('/faculty/dashboard');

export const getAdminDashboard = () => getRoleDashboard('/admin/dashboard');

export const dashboardService = {
	getStudentDashboard,
	getFacultyDashboard,
	getAdminDashboard,
};

export { apiRequestRaw };
