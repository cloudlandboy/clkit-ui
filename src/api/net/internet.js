import axios from "../axios";


function url(path) {
    return `net/internet/${path}`;
}

export function getInfo() {
    return axios.get(url('info'));
}