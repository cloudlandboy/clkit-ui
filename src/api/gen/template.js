import axios from "../axios";

function url(path) {
    return `/gen/curd_template/${path || ''}`;
}

export function listAll() {
    return axios.get(url());
}

export function saveTemplate(data) {
    return axios.post(url(), data);
}

export function updateTemplate(id, data) {
    return axios.put(url(), data);
}

export function removeTemplate(id) {
    return axios.delete(url(id));
}

export function unlockTemplate(id) {
    return axios.put(url(`unlock/${id}`));
}