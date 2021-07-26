import axios from 'axios';
import {
    message,
    message as Message,
} from "antd";
import {BASE_URL} from './config.js';

// 请求超时时间
axios.defaults.timeout = 20 * 1000;
axios.defaults.baseURL = BASE_URL;
axios.defaults.retry = 4;
axios.defaults.retryDelay = 1000;
axios.defaults.headers = {
    'Content-Type': 'application/json;charset=UTF-8',
}

// 请求拦截器
axios.interceptors.request.use(
    config => {
        // const token = sessionStorage.getItem('token');
        // let loginResult = {
        //     token: "",
        // };
        // if (token) {
        //     loginResult = JSON.parse(token);
        // }

        // if (config.headers && config.headers["Content-Type"]) {
        //     config.headers = {
        //         'x-auth-token': loginResult.token || '',
        //         'Content-Type': config.headers["Content-Type"],
        //     };
        // } else {
        //     config.headers = {
        //         'x-auth-token': loginResult.token || '',
        //         'Content-Type': 'application/json',
        //     };
        // }
        config.headers = {
            'Content-Type': 'application/json',
        };
        return config;
    },
    error => {
        message.error({message: '请求超时!'});
        return Promise.error(error);
    })

// 响应拦截器
axios.interceptors.response.use(
    response => {
        // Toast.clear();
        const { data } = response;

        if (response.status === 200) {
            if (data && data.code == 900) {
                Message.error("用户登录超时,重新登录");
                sessionStorage.clear();
                localStorage.clear();
                window.location.replace("/login");
                return;
            }
            return Promise.resolve(response);
        } else {
            return Promise.reject(response);
        }
    },
    error => {
        if (error.code === "ECONNABORTED" && error.message.indexOf("timeout") !== -1) {
            Message.error("请求超时！");
        }
        switch (error.response.status) {
            case 404:
                Message.success("网络请求不存在");
                break;
            default:
                Message.error(error.message);
                break;
        }
        return Promise.reject(error.response);
    }
);

export function postFile(url, params) {
    return new Promise((resolve, reject) => {
        // document.getElementById('edc-loading').style.display = '';
        axios.post(url, params ? params : {}, {
            headers: {"Content-Type": "multipart/form-data"},
        })
            .then(res => {
                // document.getElementById('edc-loading').style.display = 'none';
                resolve(res.data);
            })
            .catch(err => {
                // document.getElementById('edc-loading').style.display = 'none';
                reject(err)
            })
    });
}

export function post(url, params, headers) {

    return new Promise((resolve, reject) => {
        // document.getElementById('edc-loading').style.display = '';
        axios.post(url, params ? JSON.stringify(params) : {}, {
            headers
        })
            .then(res => {
                // document.getElementById('edc-loading').style.display = 'none';
                resolve(res.data);
            })
            .catch(err => {
                // document.getElementById('edc-loading').style.display = 'none';
                reject(err)
            })
    });
}

export function get(url, params, headers) {
    return new Promise((resolve, reject) => {
        // document.getElementById('edc-loading').style.display = '';
        axios.get(url, {
            params,
            headers
        })
            .then(res => {
                // document.getElementById('edc-loading').style.display = 'none';
                resolve(res.data);
            })
            .catch(err => {
                // document.getElementById('edc-loading').style.display = 'none';
                reject(err)
            })
    });
}

export function patch(url, params, headers) {
    return new Promise((resolve, reject) => {
        // document.getElementById('edc-loading').style.display = '';
        axios.patch(url, {
            params,
            headers
        })
            .then(res => {
                // document.getElementById('edc-loading').style.display = 'none';
                resolve(res.data);
            })
            .catch(err => {
                // document.getElementById('edc-loading').style.display = 'none';
                reject(err)
            })
    });
}