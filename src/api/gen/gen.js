import axios from "@/api/axios";
import { GEN_CRUD } from "@/constants/permission";

function url(path) {
    return `/gen/${path || ''}`;
}

export function genCrud(data) {
    return axios.post(url('crud'), data, {
        responseType: 'blob',
        preAuthorize: ['hasPermission', GEN_CRUD]
    });
}


export function genJavaClass(data) {
    return axios.post(url('java_class'), data, {
        responseType: data.forPreview ? 'json' : 'blob'
    });
}