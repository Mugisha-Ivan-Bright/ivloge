import axios from 'axios';
import { AuthResponse } from '../types';

const API_URL = '/api/auth/';

class AuthService {
  async login(email: string, password: string): Promise<AuthResponse> {
    const response = await axios.post<AuthResponse>(API_URL + 'signin', { email, password });
    if (response.data.accessToken) {
      localStorage.setItem('user', JSON.stringify(response.data));
    }
    return response.data;
  }

  logout(): void {
    localStorage.removeItem('user');
  }

  register(username: string, email: string, password: string, confirmPassword: string) {
    return axios.post(API_URL + 'signup', {
      username,
      email,
      password,
      confirmPassword
    });
  }

  getCurrentUser(): AuthResponse | null {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  forgotPassword(email: string) {
    return axios.post(API_URL + `forgot-password?email=${email}`);
  }

  resetPassword(token: string, newPassword: string) {
    return axios.post(API_URL + `reset-password?token=${token}&newPassword=${newPassword}`);
  }
}

export default new AuthService();
