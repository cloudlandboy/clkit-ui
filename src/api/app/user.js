import axios from "@/api/axios";
import { UPMS_USER_RESET_PASSWORD } from "@/constants/permission";

function url(path) {
    return `/upms/user/${path || ''}`;
}

export function getInfo() {
    return axios.get(url('info'));
}

export function getPage(query) {
    return axios.get(url('page'), {
        params: query
    });
}

export function save(data) {
    return axios.post(url(), data, {

    });
}

export function updateById(id, data) {
    return axios.put(url(id), data, {

    });
}

export function removeById(id) {
    return axios.delete(url(id), {

    });
}

export function resetUserPassword(id) {
    return axios.put(url(`reset_user_password/${id}`), {}, {
        preAuthorize: ['hasPermission', UPMS_USER_RESET_PASSWORD]
    });
}

export function updatePassword(data) {
    return axios.put(url('password'), data);
}