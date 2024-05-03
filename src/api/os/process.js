import axios from "../axios";


function url(path) {
    return `os/process/${path}`;
}

export function findPid(type, value) {
    return axios.get(url(`info/${type}/${value}`));
}

export function killPort(body) {
    return axios.post(url('kill_port'), body);
}

export function killPid(body) {
    return axios.post(url('kill_pid'), body);
}