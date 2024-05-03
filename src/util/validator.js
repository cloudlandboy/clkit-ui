import { hasText } from "./string-utils";
export function hasTextValidator(rule, value, callback) {
    if (hasText(value)) {
        callback();
        return
    }
    callback(new Error(`${rule.label}不能为空`));
}
