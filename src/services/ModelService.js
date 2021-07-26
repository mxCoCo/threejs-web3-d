/**
 * 统一服务接口
 * meixin
 */

import {postFile, post, get,patch} from '../comm/http';
import {message} from 'antd';

export const requestPostFile = async (url, params) => {
    return new Promise((resolve, reject) => {
        postFile(url, params).then(res => {
            if (res.code == '0') {
                resolve(res.data);
            } else {
                message.error(res.message);
                resolve(res.data);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}

export const requestPost = async (url, params, headers) => {
    return new Promise((resolve, reject) => {
        post(url, params, headers).then(res => {
            if (res.code == '0') {
                resolve(res.data);
            } else {
                message.error(res.message);
                resolve(res.data);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}
export const requestGet = async (url, params, headers) => {
    return new Promise((resolve, reject) => {
        get(url, params, headers).then(res => {
            if (res.status == '0') {
                resolve(res);
            } else {
                message.error(res.msg);
                reject(res);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}

export const requestPostRes = (url, params, headers) => {
    return new Promise((resolve, reject) => {
        post(url, params, headers).then(res => {
            if (res.code == '0') {
                resolve(res);
            } else {
                message.error(res.message);
                resolve(res);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}

export const requestGetRes = (url, params, headers) => {
    return new Promise((resolve, reject) => {
        get(url, params, headers).then(res => {
            if (res.code == '0') {
                resolve(res);
            } else {
                message.error(res.message);
                resolve(res);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}

export const requestPatchRes = (url, params, headers) => {
    return new Promise((resolve, reject) => {
        patch(url, params, headers).then(res => {
            if (res.code == '0') {
                resolve(res);
            } else {
                message.error(res.message);
                resolve(res);
            }
        }).catch(res => {
            message.error(res.message);
        });
    });
}