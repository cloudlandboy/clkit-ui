import axios from "@/api/axios";
import { OS_PROCESS_VIEW } from "@/constants/permission";


function url(path) {
    return `os/process/${path}`;
}

export function findPid(type, value) {
    return axios.get(url(`info/${type}/${value}`), {
        preAuthorize: ['hasPermission', OS_PROCESS_VIEW]
    });
}

export function killPort(body) {
    return axios.post(url('kill_port'), body, {
        preAuthorize: ['hasPermission', OS_PROCESS_VIEW]
    });
}

export function killPid(body) {
    return axios.post(url('kill_pid'), body, {
        preAuthorize: ['hasPermission', OS_PROCESS_VIEW]
    });
}