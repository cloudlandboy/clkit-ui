import axios from "@/api/axios";
import { GEN_DB_MANAGE, GEN_DB_VIEW } from "@/constants/permission";

function url(path) {
    return `/gen/db/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', GEN_DB_MANAGE]
    })
}

export function remove(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', GEN_DB_MANAGE]
    })
}

export function update(id, data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', GEN_DB_MANAGE]
    })
}

export function listAll() {
    return axios.get(url(), {
        preAuthorize: ['hasPermission', GEN_DB_MANAGE]
    });
}

export function queryTable(id, keyword) {
    return axios.get(url(`query_table/${id}`), {
        params: { keyword },
        preAuthorize: ['hasPermission', GEN_DB_VIEW]
    });
}

export function getSupportedPlatform() {
    return axios.get(url('get_supported_db_platform'));
}