import axios from "../axios";


function url(path) {
    return `net/lan/${path}`;
}

export function getLanIp() {
    return axios.get(url('ip_list'));
}

export function scanLanPort(query) {
    return axios.get(url('scan_port'), { params: query });
}