import axios from "@/api/axios";
import { CODE_REGEXP_MANAGE } from "@/constants/permission";

function url(path) {
    return `/code/regexp/${path || ''}`;
}

export function getAll() {
    return axios.get(url());
}

export function save(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', CODE_REGEXP_MANAGE]
    });
}

export function updateById(data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', CODE_REGEXP_MANAGE]
    });
}

export function removeById(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', CODE_REGEXP_MANAGE]
    });
}

export function importData(dataList) {
    return axios.post(url('import'), dataList, {
        preAuthorize: ['hasPermission', CODE_REGEXP_MANAGE]
    })
}