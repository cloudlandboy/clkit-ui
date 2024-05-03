import axios from "../axios";

function url(path) {
    return `/gen/${path || ''}`;
}

export function genCrud(data) {
    return axios.post(url('crud'), data, {
        responseType: 'blob'
    });
}


export function genJavaClass(data) {
    return axios.post(url('java_class'), data, {
        responseType: data.forPreview ? 'json' : 'blob'
    });
}