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
    if (axios.isAxiosError(err)) {
        const handler = getAxiosErrorCodeHandler(err.code);
        if (handler) {
            return handler(err);
        }
    }
    if (err.response) {
        return handleApiErrorResponse(err)
    }
    ElNotification({
        type: 'error',
        title: '出错了',
        message: err.message
    })
    return Promise.reject(err);
})

function handleApiErrorResponse(err) {
    const response = err.response;
    //忽略api响应错误拦截
    if (response.config.ignoreApiErrorIntercept) {
        return Promise.reject(err);
    }
    const handler = getApiResponseErrorStatusHandler(response.status);
    if (handler) {
        return handler(err);
    }

    const data = response.data;
    if (data instanceof Blob && data.type == 'application/json') {
        data.text().then(text => {
            notifyApiResponseMsg(JSON.parse(text));
        })
    } else {
        notifyApiResponseMsg(data);
    }
    return Promise.reject(err);
}

function notifyApiResponseMsg(data) {
    ElNotification({
        type: 'error',
        title: '出错了',
        message: data.msg || '未知错误'
    })
}

const ERROR_HANDLER_MAPPING = {
    apiResponseErrorStatus: {
    },
    axiosErrorCode: {
        "ERR_NETWORK": (err) => {
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
    }
}

export function getAxiosErrorCodeHandler(code) {
    return ERROR_HANDLER_MAPPING.axiosErrorCode[code];
}

export function setAxiosErrorCodeHandler(code, handler) {
    return ERROR_HANDLER_MAPPING.axiosErrorCode[code] = handler;
}

export function getApiResponseErrorStatusHandler(status) {
    return ERROR_HANDLER_MAPPING.apiResponseErrorStatus[status];
}

export function setApiResponseErrorStatusHandler(status, handler) {
    ERROR_HANDLER_MAPPING.apiResponseErrorStatus[status] = handler;
}
export default axios;
