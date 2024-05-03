import axios from "../axios";

function url(path) {
    return `/gen/db_lang_type/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data);
}

export function findAll() {
    return axios.get(url());
}

export function findById(id) {
    return axios.get(url(id));
}

export function update(id, data) {
    return axios.put(url(), data);
}

export function remove(id) {
    return axios.delete(url(id));
}

export function unlock(id) {
    return axios.post(url(`unlock/${id}`));
}

export function getAllLang() {
    return axios.get(url('get_all_lang'))
}