import { useCallback, useRef, useState } from 'react';

export type FormErrors<K extends string> = Partial<Record<K, string>>;

/**
 * 表单内联错误管理：配合 components/ui/input 的 FieldError 使用。
 * 提交时用 focusFirstError 一次性写入错误并聚焦第一个出错控件（按 order 优先级）。
 */
export function useFormErrors<K extends string>(order: readonly K[]) {
  const [errors, setErrors] = useState<FormErrors<K>>({});
  const formRef = useRef<HTMLFormElement>(null);

  /** 用户开始修改某字段时清除该字段错误 */
  const clearError = useCallback((field: K) => {
    setErrors((prev) => {
      if (prev[field] === undefined) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const resetErrors = useCallback(() => setErrors({}), []);

  /** 写入错误，并把焦点移到第一个非法字段 */
  const showErrors = useCallback(
    (next: FormErrors<K>) => {
      setErrors(next);
      const first = order.find((field) => next[field]);
      if (!first) return;
      requestAnimationFrame(() => {
        const form = formRef.current;
        if (!form) return;
        const control = form.querySelector<HTMLElement>(`[name="${first}"]`);
        control?.focus();
      });
    },
    [order],
  );

  const hasErrors = Object.keys(errors).length > 0;

  return { errors, hasErrors, showErrors, clearError, resetErrors, formRef };
}
