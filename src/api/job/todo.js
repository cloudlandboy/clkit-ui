import axios from "@/api/axios";
import { JOB_TODO_MANAGE, JOB_TODO_VIEW } from "@/constants/permission";

function url(path) {
    return `/job/todo/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', JOB_TODO_MANAGE]
    })
}

export function update(id, data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', JOB_TODO_MANAGE]
    })
}

export function updateStatus(id, isDone) {
    return axios.post(url(`update_status/${id}`), { isDone }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        preAuthorize: ['hasPermission', JOB_TODO_MANAGE]
    })
}

export function queryPage(query) {
    return axios.get(url('page'), {
        params: query,
        preAuthorize: ['hasPermission', JOB_TODO_VIEW]
    })
}