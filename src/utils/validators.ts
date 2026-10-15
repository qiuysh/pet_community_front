// front/src/utils/validators.ts

export interface ValidationRule {
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    pattern?: RegExp;
    validator?: (value: any) => boolean | string;
    message?: string;
}

export interface ValidationRules {
    [key: string]: ValidationRule[];
}

export const validators = {
    required: (message: string = 'This field is required') => ({
        validator: (value: any) => {
            if (typeof value === 'string') {
                return value.trim().length > 0;
            }
            return value !== null && value !== undefined;
        },
        message,
    }),

    minLength: (length: number, message?: string) => ({
        validator: (value: string) => value.length >= length,
        message: message || `Minimum length is ${length} characters`,
    }),

    maxLength: (length: number, message?: string) => ({
        validator: (value: string) => value.length <= length,
        message: message || `Maximum length is ${length} characters`,
    }),

    pattern: (regex: RegExp, message: string) => ({
        validator: (value: string) => regex.test(value),
        message,
    }),

    email: (message: string = 'Invalid email format') => ({
        validator: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
        message,
    }),

    phone: (message: string = 'Invalid phone number') => ({
        validator: (value: string) => /^1[3-9]\d{9}$/.test(value),
        message,
    }),

    password: (message: string = '密码需包含大小写字母和数字') => ({
        validator: (value: string) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d]{6,}$/.test(value),
        message,
    }),

    passwordStrong: (message: string = '密码需包含大小写字母和数字') => ({
        validator: (value: string) => {
            const hasLower = /[a-z]/.test(value);
            const hasUpper = /[A-Z]/.test(value);
            const hasNumber = /\d/.test(value);
            return hasLower && hasUpper && hasNumber;
        },
        message,
    }),

    message: (message: string = '消息长度应在 1-500 字符之间') => ({
        validator: (value: string) => value.length >= 1 && value.length <= 500,
        message,
    }),

    searchKeyword: (message: string = '搜索关键词长度应在 1-50 字符之间') => ({
        validator: (value: string) => value.length >= 1 && value.length <= 50,
        message,
    }),

    nickname: (message: string = '昵称长度应在 1-20 字符之间') => ({
        validator: (value: string) => value.length >= 1 && value.length <= 20,
        message,
    }),

    signature: (message: string = '个性签名不能超过 100 字符') => ({
        validator: (value: string) => value.length <= 100,
        message,
    }),

    activityTitle: (message: string = '活动标题长度应在 1-50 字符之间') => ({
        validator: (value: string) => value.length >= 1 && value.length <= 50,
        message,
    }),
};

export const validateTimeRange = (startTime: string, endTime: string): string | null => {
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
        return '活动时间格式无效';
    }

    if (start >= end) {
        return '结束时间必须晚于开始时间';
    }

    const diffDays = (end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24);
    if (diffDays > 30) {
        return '活动时长不能超过 30 天';
    }

    return null;
};

export const validate = (value: any, rules: ValidationRule[]): string | null => {
    for (const rule of rules) {
        if (rule.required) {
            if (typeof value === 'string' && !value.trim()) {
                return rule.message || 'This field is required';
            }
            if (value === null || value === undefined) {
                return rule.message || 'This field is required';
            }
        }

        if (value && typeof value === 'string') {
            if (rule.minLength && value.length < rule.minLength) {
                return rule.message || `Minimum length is ${rule.minLength} characters`;
            }

            if (rule.maxLength && value.length > rule.maxLength) {
                return rule.message || `Maximum length is ${rule.maxLength} characters`;
            }

            if (rule.pattern && !rule.pattern.test(value)) {
                return rule.message || 'Invalid format';
            }
        }

        if (rule.validator) {
            const result = rule.validator(value);
            if (result === false) {
                return rule.message || 'Validation failed';
            }
            if (typeof result === 'string') {
                return result;
            }
        }
    }

    return null;
};

export const validateForm = (data: Record<string, any>, rules: ValidationRules): Record<string, string> => {
    const errors: Record<string, string> = {};

    for (const field in rules) {
        const fieldRules = rules[field];
        const error = validate(data[field], fieldRules);
        if (error) {
            errors[field] = error;
        }
    }

    return errors;
};

export const isValidForm = (errors: Record<string, string>): boolean => {
    return Object.keys(errors).length === 0;
};