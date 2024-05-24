import axios from "@/api/axios";
import { NET_LAN_VIEW } from "@/constants/permission";


function url(path) {
    return `net/lan/${path}`;
}

export function getLanIp() {
    return axios.get(url('ip_list'), {
        preAuthorize: ['hasPermission', NET_LAN_VIEW]
    });
}

export function scanLanPort(query) {
    return axios.get(url('scan_port'), {
        params: query,
        preAuthorize: ['hasPermission', NET_LAN_VIEW]
    });
}