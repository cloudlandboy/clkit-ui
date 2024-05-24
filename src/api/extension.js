import axios from "@/api/axios";
import { EXTENSION_MANAGE } from "@/constants/permission";

function url(path) {
    return `/extension/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function findAll() {
    return axios.get(url(), {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function findById(id) {
    return axios.get(url(id), {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function update(id, data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function remove(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function install(id) {
    return axios.post(url(`install/${id}`), {
        preAuthorize: ['hasPermission', EXTENSION_MANAGE]
    });
}

export function getTree(filterInstalled) {
    return axios.get(url('tree'), { params: { filterInstalled: !!filterInstalled } });
}

export function getTypes() {
    return axios.get(url('types'));
}