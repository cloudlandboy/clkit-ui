import { ref } from "vue";
import { defineStore } from 'pinia'
import { default as axios, setApiErrorResponseStatusHandler } from "@/api/axios";
import localStorage from "@/util/local-store";
import dayjs from "dayjs";
import { ElMessageBox, ElNotification } from "element-plus";
import { getInfo } from "@/api/upms/user";
import { logout } from "@/api/auth";

const TOKEN_INFO_KEY = "tokenInfo";
const BEARER_PREFIX = "Bearer "
const ANONYMOUS_USER_INFO = {
    isAnonymous: true,
    name: "",
    nickname: "匿名",
    realName: "匿名",
    email: "",
    permissionList: [],
}

export const useAuthStore = defineStore('auth', () => {
    const lockState = {
        unauthorizedHandle: false
    }

    const authInfo = ref({
        token: localStorage.getJsonOrDefault(TOKEN_INFO_KEY, null),
        user: ANONYMOUS_USER_INFO
    });

    const loginDialogVisible = ref(false);

    //请求头加上accessToken
    axios.interceptors.request.use(function (config) {
        if (authInfo.value.token && authInfo.value.token.accessToken) {
            config.headers.Authorization = BEARER_PREFIX + authInfo.value.token.accessToken;
        }
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    //未授权处理
    setApiErrorResponseStatusHandler('401', res => {
        if (lockState.unauthorizedHandle) {
            return;
        }
        lockState.unauthorizedHandle = true;
        if (authInfo.value.user.isAnonymous) {
            //弹窗登录
            actionLogin();
            lockState.unauthorizedHandle = false;
            return;
        }

        ElMessageBox.confirm("权限不足", "", {
            type: 'warning',
            center: true,
            showCancelButton: false,
            showClose: false,
            buttonSize: 'small',
            customStyle: {
                width: '220px',
                "--el-messagebox-content-color": 'red',
                "--el-messagebox-content-font-size": "18px"
            }
        }).finally(() => {
            lockState.unauthorizedHandle = false;
        })
    })

    function actionLogin() {
        loginDialogVisible.value = true;
    }

    function actionLogout() {
        logout().finally(clearAuthInfo);
    }

    function refreshUserInfo() {
        getInfo().then(res => {
            res.data.data.isAnonymous = false;
            authInfo.value.user = res.data.data;
        })
    }

    function updateToken(token) {
        localStorage.set(TOKEN_INFO_KEY, token);
        authInfo.value.token = token;
        refreshUserInfo();
    }

    function clearAuthInfo() {
        authInfo.value.token = null;
        localStorage.remove(TOKEN_INFO_KEY);
        authInfo.value.user = ANONYMOUS_USER_INFO;
    }

    if (authInfo.value.token) {
        //访问令牌有效，获取用户信息
        if (true) {
            refreshUserInfo();
        } else {
            //都无效，退出登录
            clearAuthInfo();
        }
        //刷新令牌有效，刷新token


    }
    return {
        authInfo,
        loginDialogVisible,
        actionLogin,
        actionLogout,
        updateToken,
        clearAuthInfo,
        refreshUserInfo
    }
})