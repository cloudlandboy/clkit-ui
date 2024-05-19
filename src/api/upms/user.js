import axios from "@/api/axios";

function url(path) {
    return `/upms/user/${path || ''}`;
}

export function getInfo() {
    return axios.get(url('info'));
}