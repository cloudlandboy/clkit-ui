import axios from "@/api/axios";

function url(path) {
    return `/auth/${path || ''}`;
}

export function loginByUserName(username, password) {
    return axios.post(url('token'), {
        username,
        password,
        grant_type: 'password'
    }, {
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
        },
        ignoreApiErrorIntercept: true
    });
}

export function logout() {
    return axios.post(url('logout'));
}