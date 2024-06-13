import { ref } from "vue";
import { defineStore } from 'pinia'
import { getLocalStore } from "@/util/local-store";
import dayjs from "dayjs";
import { ElMessageBox } from "element-plus";
import { getInfo } from "@/api/app/user";
import { logout, refreshToken } from "@/api/app/auth";
import { AxiosError } from "axios";
import { ROLE_ADMIN } from "@/constants/permission";
import { NORM_DATETIME_PATTERN } from "@/constants/common";
import { default as axios, setApiResponseErrorStatusHandler, setAxiosErrorCodeHandler } from "@/api/axios";
import { shardWorker } from "@/stores/worker";


const UNAUTHORIZE_ERROR_CODE = "ERR_UNAUTHORIZE";
const BEARER_PREFIX = "Bearer "
const ANONYMOUS_USER_INFO = {
    isAnonymous: true,
    name: "",
    nickname: "匿名",
    realName: "匿名",
    email: "",
    roleNameList: [],
    permissionList: [],
}
const tokenLocalStore = getLocalStore("token");
const userIdLocalStore = getLocalStore("userId");
export const useAuthStore = defineStore('auth', () => {

    //定时器
    const timer = {
        refreshToken: null
    };

    const isInLogin = ref(false);

    const authInfo = ref({
        token: null,
        user: ANONYMOUS_USER_INFO
    });

    const lockState = {
        unauthorizedHandle: false,
        authInitPromise: Promise.resolve()
    }

    const authChecker = {
        hasPermission: (permission) => {
            const userPermissions = authInfo.value.user.permissionList;
            if (!permission || !userPermissions || userPermissions.length === 0) {
                return false;
            }

            for (const pms of userPermissions) {
                if (pms === ROLE_ADMIN || permission === pms) {
                    return true;
                }
            }

            return false;

        }
    }

    //拦截请求，1.判断权限，无权限不发送请求，2.请求头加上accessToken
    axios.interceptors.request.use(async function (config) {
        if (config.preAuthorize) {
            await waitForInited();
            console.debug('preAuthorize reuqest: ', config.url);
            const method = authChecker[config.preAuthorize[0]];
            const access = method && method.apply(null, config.preAuthorize.slice(1));
            if (!access) {
                return Promise.reject(new AxiosError('权限不足', UNAUTHORIZE_ERROR_CODE, config))
            }
        }

        if (authInfo.value.token && authInfo.value.token.accessToken) {
            config.headers.Authorization = BEARER_PREFIX + authInfo.value.token.accessToken;
        }
        return config;
    }, function (error) {
        return Promise.reject(error);
    });

    /**
     * 未授权请求处理
     * @param {*} err 
     * @returns err
     */
    function unauthorizeHandler(err) {
        if (lockState.unauthorizedHandle) {
            return Promise.reject(err);
        }
        lockState.unauthorizedHandle = true;
        if (authInfo.value.user.isAnonymous) {
            //弹窗登录
            actionLogin();
            lockState.unauthorizedHandle = false;
            return Promise.reject(err);
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
        return Promise.reject(err);
    }

    //未授权请求拦截处理
    setAxiosErrorCodeHandler(UNAUTHORIZE_ERROR_CODE, unauthorizeHandler);

    //未授权响应拦截处理
    setApiResponseErrorStatusHandler('401', unauthorizeHandler);

    /**
     * 执行登录
     */
    function actionLogin() {
        isInLogin.value = true;
    }

    /**
     * 执行退出登录
     */
    function actionLogout() {
        logout().then(() => {
            //清除授权信息
            clearAuthInfo();
            //通知推出,由于页面刷新不需要处理
            //shardWorker.port.postMessage({ type: "authentication-logout" });
            //刷新页面
            window.location.reload();
        });
    }

    /**
     * 刷新用户信息 
     */
    function refreshUserInfo() {
        lockState.authInitPromise = new Promise((resolve) => {
            getInfo().then(res => {
                res.data.data.isAnonymous = false;
                authInfo.value.user = res.data.data;
                userIdLocalStore.store(res.data.data.id);
            }).catch(err => {
                if (err.response && err.response.status === 401) {
                    //说明token已过期，删除token
                    clearAuthInfo();
                }
            }).finally(() => {
                resolve(authInfo.value.user);
            })
        })
        return lockState.authInitPromise;
    }

    /**
     * 更新token定时器
     * @param {object} tokenDuration 
     */
    function updateTokenTimer(tokenDuration) {
        if (timer.refreshToken) {
            clearTimeout(timer.refreshToken);
        }
        timer.refreshToken = setTimeout(() => {
            actionRefreshToken(authInfo.value.token.refreshToken);
        }, (tokenDuration.accesToken - 10) * 1000);

    }

    /**
     * 更新token
     * @param {object} token 
     */
    function updateToken(token) {
        authInfo.value.token = token;
        updateTokenTimer(calculateTokenDuration(token));
        refreshUserInfo().then(() => {
            //建立websocket连接
            const protocol = axios.defaults.baseURL.startsWith("https://") ? "wss" : "ws";
            const apiPath = axios.defaults.baseURL.substring(axios.defaults.baseURL.indexOf('://'));
            shardWorker.port.postMessage({
                type: "authentication-success",
                websocketUrl: `${protocol}${apiPath}/websocket?accessToken=${token.accessToken}`
            });
        });
    }

    /**
     * 清除授权信息
     */
    function clearAuthInfo() {
        authInfo.value.token = null;
        tokenLocalStore.clear();
        authInfo.value.user = ANONYMOUS_USER_INFO;
    }

    /**
     * 计算token剩余时间，单位秒
     * @param {object} token 
     */
    function calculateTokenDuration(token) {
        const nowTimestamp = dayjs().valueOf();
        const aceessTokenExpireTimestamp = dayjs(token.accessTokenExpireTime, NORM_DATETIME_PATTERN).valueOf();
        const refreshTokenExpireTimestamp = dayjs(token.refreshTokenExpireTime, NORM_DATETIME_PATTERN).valueOf();
        return {
            accesToken: dayjs.duration(aceessTokenExpireTimestamp - nowTimestamp).asSeconds(),
            refreshToken: dayjs.duration(refreshTokenExpireTimestamp - nowTimestamp).asSeconds()
        }
    }

    /**
     * 执行刷新token
     * @param {string} token refreshToken 
     */
    function actionRefreshToken(token) {
        console.debug('刷新token');
        refreshToken(token).then(res => {
            updateToken(res.data.data);
        }).catch(err => {
            if (err.response && err.response.status === 401) {
                //refreshToken无效，删除token
                clearAuthInfo();
            }
        })
    }

    /**
     * 等待初始化完成 
     */
    function waitForInited() {
        return lockState.authInitPromise;
    }

    //最后执行，保证请求在设置拦截器之后执行
    const storeToken = tokenLocalStore.getJsonOrDefault(null);
    if (storeToken) {
        console.debug('初始化阶段-加载用户信息');
        const tokenDuration = calculateTokenDuration(storeToken)
        if (tokenDuration.accesToken > 10) {
            //访问令牌有效
            updateToken(storeToken);
        } else if (tokenDuration.refreshToken > 10) {
            //刷新令牌有效，刷新token
            actionRefreshToken(storeToken.refreshToken);
        } else {
            //都无效，退出登录
            clearAuthInfo();
        }
    }

    return {
        authInfo,
        isInLogin,
        authChecker,
        tokenLocalStore,
        actionLogin,
        actionLogout,
        clearAuthInfo,
        refreshUserInfo,
        waitForInited
    }
})
