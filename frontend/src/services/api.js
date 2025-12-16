import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

/**
 * Get list of available test functions
 */
export const getFunctions = async () => {
    const response = await api.get('/functions');
    return response.data;
};

/**
 * Calculate a single approximation with visualization data
 * @param {Object} params
 * @param {string} params.function_id - Function ID (e.g., 'smooth_sin')
 * @param {string} params.custom_expression - Custom expression (alternative to function_id)
 * @param {string} params.method - Integration method ('trapezoidal', 'midpoint', 'simpson')
 * @param {number} params.a - Lower bound
 * @param {number} params.b - Upper bound
 * @param {number} params.n - Number of subintervals
 */
export const calculate = async (params) => {
    const response = await api.post('/calculate', params);
    return response.data;
};

/**
 * Perform convergence analysis
 * @param {Object} params
 * @param {string} params.function_id - Function ID
 * @param {string} params.custom_expression - Custom expression
 * @param {string[]} params.methods - Methods to analyze
 * @param {number} params.a - Lower bound
 * @param {number} params.b - Upper bound
 * @param {number[]} params.n_values - N values to test
 */
export const analyze = async (params) => {
    const response = await api.post('/analyze', params);
    return response.data;
};

export default api;
