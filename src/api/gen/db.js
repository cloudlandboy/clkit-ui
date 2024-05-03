import axios from "../axios";

function url(path) {
    return `/gen/db/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data)
}

export function remove(id) {
    return axios.delete(url(id))
}

export function update(id, data) {
    return axios.put(url(), data)
}

export function listAll() {
    return axios.get(url());
}

export function queryTable(id, keyword) {
    return axios.get(url(`query_table/${id}`), { params: { keyword } });
}

export function getSupportedPlatform() {
    return axios.get(url('get_supported_db_platform'));
}