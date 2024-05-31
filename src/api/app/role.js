import axios from "@/api/axios";
import { UPMS_ROLE_MANAGE, UPMS_ROLE_VIEW } from "@/constants/permission";

function url(path) {
    return `/upms/role/${path || ''}`;
}

export function getPage(query) {
    return axios.get(url('page'), {
        params: query
    });
}

export function getAll() {
    return axios.get(url(), {
        preAuthorize: ['hasPermission', UPMS_ROLE_VIEW]
    });
}

export function save(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', UPMS_ROLE_MANAGE]
    });
}

export function updateById(id, data) {
    return axios.put(url(id), data, {
        preAuthorize: ['hasPermission', UPMS_ROLE_MANAGE]
    });
}

export function removeById(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', UPMS_ROLE_MANAGE]
    });
}