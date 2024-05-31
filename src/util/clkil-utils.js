import { ElMessageBox, ElNotification } from "element-plus";
import { h } from "vue";

/**
 * 构建Vnode <div>前缀 <b>重点</b> 后缀<div>
 * @param {string} prefix 前缀
 * @param {string} point 重点
 * @param {string} suffix 后缀
 * @param {string} color 重点部分颜色值
 * @returns Vnode
 */
export function hPointText(prefix, point, suffix, color = '#f03752') {
    return h('div', [prefix + ' ', h('b', {
        style: {
            color
        }
    }, [point]), ' ' + suffix])
}

/**
 * 操作确认弹窗
 * @param {string|import("vue").VNode} message 消息
 * @param {string} title 标题,可选
 * @returns Promise
 */
export function operationConfirm(message, title = '操作确认') {
    return ElMessageBox({
        title,
        message,
        type: 'warning',
        center: true,
        buttonSize: 'small',
        showCancelButton: true,
        roundButton: true,
        confirmButtonClass: 'el-button--danger',
        customStyle: {
            width: 'max-content'
        }
    });
}

/**
 * 操作成功通知
 * @param {string} message 消息
 * @returns Promise
 */
export function operationSuccessNotify(message = '操作成功') {
    ElNotification.success({ message });
}

/**
 * 操作结果弹窗
 * @param {string|import("vue").VNode} message 消息
 * @param {string} title 标题
 * @returns Promise
 */
export function operationResultAlert(message, title = '操作结果') {
    return ElMessageBox({
        title,
        message,
        type: 'success',
        center: true,
        buttonSize: 'small',
        showCancelButton: false,
        roundButton: true,
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        customStyle: {
            padding: '16px',
            width: 'max-content'
        }
    });
}

