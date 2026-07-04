import axios from 'axios';

const API = axios.create({ baseURL: process.env.REACT_APP_API_URL });

export const getInvoices = () => API.get('/invoices');
export const createInvoice = (data) => API.post('/invoices', data);
export const updateInvoice = (id, data) => API.patch(`/invoices/${id}`, data);