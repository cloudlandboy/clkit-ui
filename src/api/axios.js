import axios from "axios";
import { ElNotification } from 'element-plus';

const lockState = {
    networkErrorNotify: false
}
axios.defaults.baseURL = import.meta.env.VITE_SERVER_ADDRESS || '';
axios.defaults.baseURL += '/api';

axios.interceptors.response.use(res => {
    return res;
}, err => {
    if (err.code === 'ERR_NETWORK') {
        if (lockState.networkErrorNotify) {
            return Promise.reject(err);
        }
        lockState.networkErrorNotify = true;
        ElNotification({
            type: 'error',
            title: '出错了',
            message: '网络连接失败',
            onClose: () => {
                lockState.networkErrorNotify = false;
            }
        })
        return Promise.reject(err);
    }
    if (err.response) {
        handleApiErrorResponse(err.response)
        return Promise.reject(err);
    }

    ElNotification({
        type: 'error',
        title: '出错了',
        message: err.message
    })
    return Promise.reject(err);
})

function handleApiErrorResponse(response) {
    //忽略api响应错误拦截
    if (response.config.ignoreApiErrorIntercept) {
        return
    }
    const statusHandler = apiErrorResponseStatusHandler[response.status];
    if (statusHandler) {
        statusHandler(response);
        return;
    }

    const data = response.data;
    if (data instanceof Blob && data.type == 'application/json') {
        data.text().then(text => {
            notifyApiResponseMsg(JSON.parse(text));
        })
    } else {
        notifyApiResponseMsg(data);
    }
}

function notifyApiResponseMsg(data) {
    ElNotification({
        type: 'error',
        title: '出错了',
        message: data.msg || '未知错误'
    })
}

/**
 * 接口错误响应状态码处理器
 * response=>{}
 */
const apiErrorResponseStatusHandler = {
}


export function getApiErrorResponseStatusHandler(status) {
    return apiErrorResponseStatusHandler[status];
}

export function setApiErrorResponseStatusHandler(status, handler) {
    apiErrorResponseStatusHandler[status] = handler;
}
export default axios;
