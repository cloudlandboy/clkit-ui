import axios from "@/api/axios";
import { GEN_DB_LANG_TYPE_MANAGE, GEN_DB_LANG_TYPE_VIEW } from "@/constants/permission";

function url(path) {
    return `/gen/db_lang_type/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_MANAGE]
    });
}

export function findAll() {
    return axios.get(url(), {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_VIEW]
    });
}

export function findById(id) {
    return axios.get(url(id), {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_VIEW]
    });
}

export function update(id, data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_MANAGE]
    });
}

export function remove(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_MANAGE]
    });
}

export function unlock(id) {
    return axios.post(url(`unlock/${id}`), {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_MANAGE]
    });
}

export function getAllLang() {
    return axios.get(url('get_all_lang'), {
        preAuthorize: ['hasPermission', GEN_DB_LANG_TYPE_VIEW]
    })
}