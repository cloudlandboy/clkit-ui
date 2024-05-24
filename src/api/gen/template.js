import { GEN_CURD_TEMPLATE_MANAGE, GEN_CURD_TEMPLATE_VIEW } from "@/constants/permission";
import axios from "@/api/axios";

function url(path) {
    return `/gen/curd_template/${path || ''}`;
}

export function listAll() {
    return axios.get(url(), {
        preAuthorize: ['hasPermission', GEN_CURD_TEMPLATE_VIEW]
    });
}

export function saveTemplate(data) {
    return axios.post(url(), data, {
        preAuthorize: ['hasPermission', GEN_CURD_TEMPLATE_MANAGE]
    });
}

export function updateTemplate(id, data) {
    return axios.put(url(), data, {
        preAuthorize: ['hasPermission', GEN_CURD_TEMPLATE_MANAGE]
    });
}

export function removeTemplate(id) {
    return axios.delete(url(id), {
        preAuthorize: ['hasPermission', GEN_CURD_TEMPLATE_MANAGE]
    });
}

export function unlockTemplate(id) {
    return axios.put(url(`unlock/${id}`), {
        preAuthorize: ['hasPermission', GEN_CURD_TEMPLATE_MANAGE]
    });
}