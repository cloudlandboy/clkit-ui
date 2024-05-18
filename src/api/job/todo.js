import axios from "@/api/axios";

function url(path) {
    return `/job/todo/${path || ''}`;
}

export function create(data) {
    return axios.post(url(), data)
}

export function update(id, data) {
    return axios.put(url(), data)
}

export function queryPage(query) {
    return axios.get(url('page'), { params: query })
}