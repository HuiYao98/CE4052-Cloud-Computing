import axios from 'axios';
import config from '../config/endpoints.config';

// Create a custom Axios instance with a base URL
const axiosInstance = axios.create({
  baseURL: config.BASE_TELEGRAM_BOT_API_FILE_ENDPOINT, // Telegram bot file base URL
  // Add other custom configuration options here
  // For sending and recieving cookies for requests
  withCredentials: true,
});

export default axiosInstance;