import api from './api.js';

const register = (name, email, password, accountDetails = {}) => {
  return api.post('/auth/register', { name, email, password, ...accountDetails });
};

const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

const getMe = () => {
  return api.get('/auth/me');
};

export default { register, login, getMe };