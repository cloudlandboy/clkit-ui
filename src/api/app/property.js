import axios from "@/api/axios";

function url(path) {
    return `app/property/${path || ''}`;
}

export function getAll() {
    return axios.get(url());
}