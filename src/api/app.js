import axios from "./axios";

function url(path) {
    return `/app/${path || ''}`;
}

export function exportData(data) {
    return axios.post(url('export'), data);
}

export function importData(file) {
    const formData = new FormData();
    formData.append('file', file);
    return axios.post(url('import'), formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
}

export function getVersion() {
    return axios.get(url('version'));
}

export function checkUpdate() {
    return axios.get(url('check_update'));
}