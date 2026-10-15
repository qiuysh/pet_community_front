import { describe, it, expect } from 'vitest';
import { validators, validate, validateForm, isValidForm, validateTimeRange } from './validators';

describe('validators', () => {
  describe('required', () => {
    it('空字符串应返回默认必填提示', () => {
      const rule = validators.required();
      expect(rule.validator('')).toBe(false);
      expect(rule.message).toBe('This field is required');
    });

    it('自定义提示信息应生效', () => {
      const rule = validators.required('请输入内容');
      expect(rule.validator('')).toBe(false);
      expect(rule.message).toBe('请输入内容');
    });

    it('非空字符串应通过校验', () => {
      const rule = validators.required();
      expect(rule.validator('hello')).toBe(true);
    });

    it('非 null/undefined 值应通过校验', () => {
      const rule = validators.required();
      expect(rule.validator(0)).toBe(true);
      expect(rule.validator(false)).toBe(true);
    });
  });

  describe('minLength', () => {
    it('长度不足时应返回提示', () => {
      const rule = validators.minLength(5);
      expect(rule.validator('abc')).toBe(false);
      expect(rule.message).toBe('Minimum length is 5 characters');
    });

    it('满足长度时应通过', () => {
      const rule = validators.minLength(5);
      expect(rule.validator('abcde')).toBe(true);
      expect(rule.validator('abcdef')).toBe(true);
    });
  });

  describe('maxLength', () => {
    it('超出长度时应返回提示', () => {
      const rule = validators.maxLength(5);
      expect(rule.validator('abcdef')).toBe(false);
      expect(rule.message).toBe('Maximum length is 5 characters');
    });

    it('未超出长度时应通过', () => {
      const rule = validators.maxLength(5);
      expect(rule.validator('abcde')).toBe(true);
      expect(rule.validator('abc')).toBe(true);
    });
  });

  describe('email', () => {
    it('无效邮箱应返回提示', () => {
      const rule = validators.email();
      expect(rule.validator('not-an-email')).toBe(false);
      expect(rule.validator('test@')).toBe(false);
    });

    it('有效邮箱应通过', () => {
      const rule = validators.email();
      expect(rule.validator('test@example.com')).toBe(true);
    });
  });

  describe('phone', () => {
    it('无效手机号应返回提示', () => {
      const rule = validators.phone();
      expect(rule.validator('12345678901')).toBe(false);
      expect(rule.validator('1380013800')).toBe(false);
    });

    it('有效手机号应通过', () => {
      const rule = validators.phone();
      expect(rule.validator('13800138001')).toBe(true);
    });
  });

  describe('password', () => {
    // 与注册/重置密码 UI 一致：至少 6 位，含大小写字母和数字
    it('少于6位应失败', () => {
      const rule = validators.password();
      expect(rule.validator('Abc12')).toBe(false);
    });

    it('缺少数字应失败', () => {
      const rule = validators.password();
      expect(rule.validator('Abcdefgh')).toBe(false);
    });

    it('缺少字母应失败', () => {
      const rule = validators.password();
      expect(rule.validator('12345678')).toBe(false);
    });

    it('符合规则的密码应通过', () => {
      const rule = validators.password();
      expect(rule.validator('Abc123')).toBe(true);
      expect(rule.validator('Abc12345')).toBe(true);
    });
  });

  describe('validate', () => {
    it('应返回第一个失败的校验错误', () => {
      const error = validate('', [
        { required: true },
        validators.minLength(5),
      ]);
      expect(error).toBe('This field is required');
    });

    it('全部通过时应返回 null', () => {
      const error = validate('hello', [
        { required: true },
        validators.minLength(3),
        validators.maxLength(10),
      ]);
      expect(error).toBeNull();
    });
  });

  describe('validateForm', () => {
    it('应返回所有字段的错误信息', () => {
      const errors = validateForm(
        { name: '', email: 'invalid' },
        {
          name: [{ required: true, message: '请输入昵称' }],
          email: [validators.email()],
        }
      );
      expect(errors.name).toBe('请输入昵称');
      expect(errors.email).toBe('Invalid email format');
    });

    it('无错误时应返回空对象', () => {
      const errors = validateForm(
        { name: 'Tom', email: 'tom@example.com' },
        {
          name: [{ required: true }],
          email: [validators.email()],
        }
      );
      expect(Object.keys(errors)).toHaveLength(0);
    });
  });

  describe('isValidForm', () => {
    it('空错误对象应表示校验通过', () => {
      expect(isValidForm({})).toBe(true);
    });

    it('存在错误时应表示校验失败', () => {
      expect(isValidForm({ name: '错误' })).toBe(false);
    });
  });

  describe('message', () => {
    it('空消息应失败', () => {
      const rule = validators.message();
      expect(rule.validator('')).toBe(false);
    });

    it('超过 500 字符应失败', () => {
      const rule = validators.message();
      expect(rule.validator('a'.repeat(501))).toBe(false);
    });

    it('合法长度消息应通过', () => {
      const rule = validators.message();
      expect(rule.validator('你好')).toBe(true);
      expect(rule.validator('a'.repeat(500))).toBe(true);
    });
  });

  describe('searchKeyword', () => {
    it('空关键词应失败', () => {
      const rule = validators.searchKeyword();
      expect(rule.validator('')).toBe(false);
    });

    it('超过 50 字符应失败', () => {
      const rule = validators.searchKeyword();
      expect(rule.validator('a'.repeat(51))).toBe(false);
    });

    it('合法关键词应通过', () => {
      const rule = validators.searchKeyword();
      expect(rule.validator('猫咪')).toBe(true);
    });
  });

  describe('nickname', () => {
    it('空昵称和超长昵称应失败', () => {
      const rule = validators.nickname();
      expect(rule.validator('')).toBe(false);
      expect(rule.validator('a'.repeat(21))).toBe(false);
    });

    it('合法昵称应通过', () => {
      const rule = validators.nickname();
      expect(rule.validator('小明')).toBe(true);
    });
  });

  describe('signature', () => {
    it('超过 100 字符应失败', () => {
      const rule = validators.signature();
      expect(rule.validator('a'.repeat(101))).toBe(false);
    });

    it('未超过 100 字符应通过', () => {
      const rule = validators.signature();
      expect(rule.validator('爱生活，爱宠物')).toBe(true);
    });
  });

  describe('activityTitle', () => {
    it('空标题和超长标题应失败', () => {
      const rule = validators.activityTitle();
      expect(rule.validator('')).toBe(false);
      expect(rule.validator('a'.repeat(51))).toBe(false);
    });

    it('合法标题应通过', () => {
      const rule = validators.activityTitle();
      expect(rule.validator('夏日萌宠大作战')).toBe(true);
    });
  });

  describe('validateTimeRange', () => {
    it('结束时间早于开始时间应返回错误', () => {
      expect(validateTimeRange('2026-07-23 10:00', '2026-07-22 10:00')).toBe('结束时间必须晚于开始时间');
    });

    it('时间间隔超过 30 天应返回错误', () => {
      expect(validateTimeRange('2026-07-01 10:00', '2026-08-05 10:00')).toBe('活动时长不能超过 30 天');
    });

    it('无效时间格式应返回错误', () => {
      expect(validateTimeRange('invalid', '2026-07-23 10:00')).toBe('活动时间格式无效');
    });

    it('合法时间范围应返回 null', () => {
      expect(validateTimeRange('2026-07-23 10:00', '2026-07-25 10:00')).toBeNull();
    });
  });
});
