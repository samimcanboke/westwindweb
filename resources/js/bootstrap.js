import axios from 'axios';


window.axios = axios;




window.axios.interceptors.response.use(response => {
    return response;
}, error => {
    if (error.response.status === 419) {
        window.location.href = '/login';
    }
    return Promise.reject(error);
});


window.axios.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
