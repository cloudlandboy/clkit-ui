import axios from "@/api/axios";
import { APP_PROPERTY_CONFIG } from "@/constants/permission";

function url(path) {
    return `app/property/${path || ''}`;
}

export function getAll() {
    return axios.get(url());
}

export function updateValueById(id, value) {
    return axios.put(url(id), { value }, {
        headers: {
            'Content-Type': 'multipart/form-data'
        },
        preAuthorize: ['hasPermission', APP_PROPERTY_CONFIG]
    });
}