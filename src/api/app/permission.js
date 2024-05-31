import axios from "@/api/axios";

function url(path) {
    return `/upms/permission/${path || ''}`;
}

export function getTree() {
    return axios.get(url('tree'));
}