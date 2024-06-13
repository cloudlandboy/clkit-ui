import { watch } from "vue";

class LocalStore {
    key;
    vueWatchStopHandle;
    constructor(key) {
        this.key = `clkit-${key}`;
    }

    /**
     * 获取值，为空使用默认值
     * @param {any} defaultValue 默认值 
     * @param {function} convertFunc 转换函数
     */
    getOrDefault(defaultValue, convertFunc) {
        const value = localStorage.getItem(this.key);
        if (!value || value.trim().length < 1) {
            return defaultValue;
        }
        return convertFunc ? convertFunc(value) : value;
    }

    /**
     * 获取JSON，为空使用默认值
     * @param {object} defaultValue 默认值 
     */
    getJsonOrDefault(defaultValue) {
        return this.getOrDefault(defaultValue, v => JSON.parse(v));
    }

    /**
    * 获取JSON，为空返回空对象
    */
    getJsonOrEmpty() {
        return this.getJsonOrDefault({});
    }

    /**
     * 获取数值类型，为空使用默认值
     * @param {object} defaultValue 默认值 
     */
    getNumberOrDefault(defaultValue) {
        return this.getOrDefault(defaultValue, v => Number(v))
    }

    /**
     * 获取布尔类型，为空返回false
     */
    getBoolean() {
        return Boolean(localStorage.getItem(this.key));
    }

    /**
     * 存储到localStorage
     * @param {any} value 值
     */
    store(value) {
        const type = (typeof value)
        if (!type || type === 'function') {
            return
        } else if (type === 'object') {
            localStorage.setItem(this.key, JSON.stringify(value));
        } else {
            localStorage.setItem(this.key, value + '');
        }
    }

    /**
     * 从localStorage中删除
     */
    clear() {
        localStorage.removeItem(this.key);
    }

    /**
     * 使用vue的watch监听，同步更新localStorage
     * @param {any} source 监听源 
     */
    vueWatch(source) {
        if (this.vueWatchStopHandle) {
            this.vueWatchStopHandle();
        }
        this.vueWatchStopHandle = watch(source, (value) => {
            this.store(value);
        }, { deep: true })
    }
}

/**
 * 获取LocalStore实例
 * @param {string} key 键名 
 */
export function getLocalStore(key) {
    return new LocalStore(key);
}
