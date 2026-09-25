// import api from './api';

// export const registerUser = async (payload) => {
//   const { data } = await api.post('/auth/register', payload);
//   return data;
// };

// export const loginUser = async (payload) => {
//   const { data } = await api.post('/auth/login', payload);
//   return data;
// };

// export const googleLogin = async (credential) => {
//   const { data } = await api.post('/auth/google', { credential });
//   return data;
// };


import api from './api.js';

const register = (name, email, password) => {
  return api.post('/auth/register', { name, email, password });
};

const login = (email, password) => {
  return api.post('/auth/login', { email, password });
};

const googleAuth = (idToken) => {
  return api.post('/auth/google', { idToken });
};

const getMe = () => {
  return api.get('/auth/me');
};

export default { register, login, googleAuth, getMe };