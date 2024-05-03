import axios from "axios";
import { ElNotification } from 'element-plus'

const state = {
    errNetworkNotifyLock: false
}

axios.defaults.baseURL = import.meta.env.VITE_SERVER_ADDRESS || '';
axios.defaults.baseURL += '/api';

axios.interceptors.response.use(res => {
    return res;
}, err => {
    if (err.code === 'ERR_NETWORK' && !state.errNetworkNotifyLock) {
        state.errNetworkNotifyLock = true;
        ElNotification({
            type: 'error',
            title: '出错了',
            message: '网络连接失败',
            onClose: () => {
                state.errNetworkNotifyLock = false;
            }
        })
    } else if (err.response) {
        const data = err.response.data;
        if (data instanceof Blob && data.type == 'application/json') {
            data.text().then(text => {
                console.log(text);
                ifDataMessageAlert(JSON.parse(text));
            })
        } else {
            ifDataMessageAlert(data);
        }

    }
    return Promise.reject(err);
})

function ifDataMessageAlert(data) {
    if (data.msg) {
        ElNotification({
            type: 'error',
            title: '出错了',
            message: data.msg
        })
    }
}

export default axios;
