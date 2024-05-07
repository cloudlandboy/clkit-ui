import axios from "./axios";

function url(path) {
    return `/extension/${path || ''}`;
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

export function install(id) {
    return axios.post(url(`install/${id}`));
}

export function getTree(filterInstalled) {
    return axios.get(url('tree'), { params: { filterInstalled: !!filterInstalled } });
}

export function getTypes() {
    return axios.get(url('types'));
}