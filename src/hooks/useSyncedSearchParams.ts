import { useCallback, useMemo, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';

/** 解析正整数页码；非法值回退 fallback */
export function parsePositiveInt(raw: string | null, fallback = 1): number {
  const n = Number(raw ?? fallback);
  return Number.isInteger(n) && n > 0 ? n : fallback;
}

type StringDef<T extends string = string> = {
  kind: 'string';
  default: T;
  /** 白名单；不在名单内则回退 default */
  values?: readonly T[];
};

type NumberDef = {
  kind: 'number';
  default: number;
};

export type SearchParamDef = StringDef | NumberDef;

/** 有 values 白名单时收窄为联合类型；否则放宽为 string（避免 default:'' 变成字面量） */
type InferValue<D> = D extends { kind: 'number' }
  ? number
  : D extends { kind: 'string'; values: readonly (infer V)[] }
    ? V
    : D extends { kind: 'string' }
      ? string
      : never;

export type InferSearchState<S extends Record<string, SearchParamDef>> = {
  [K in keyof S]: InferValue<S[K]>;
};

function readParam<D extends SearchParamDef>(raw: string | null, def: D): InferValue<D> {
  if (def.kind === 'number') {
    return parsePositiveInt(raw, def.default) as InferValue<D>;
  }
  if (raw == null || raw === '') {
    return def.default as InferValue<D>;
  }
  if (def.values && !(def.values as readonly string[]).includes(raw)) {
    return def.default as InferValue<D>;
  }
  return raw as InferValue<D>;
}

function writeParam(params: URLSearchParams, key: string, value: string | number, def: SearchParamDef) {
  const asString = String(value);
  const defaultString = String(def.default);
  if (asString === defaultString) {
    params.delete(key);
  } else {
    params.set(key, asString);
  }
}

/**
 * 多查询参数与 URL 同步。默认值不写入 URL；筛选变更时可自动重置 page。
 *
 * 建议把 schema 提成模块级常量；即使内联传入也不会因引用变化死循环。
 *
 * @example
 * const REPORT_QUERY = {
 *   page: { kind: 'number', default: 1 },
 *   status: { kind: 'string', default: '0', values: ['all', '0', '1', '2'] as const },
 * } as const;
 * const [q, setQ] = useSyncedSearchParams(REPORT_QUERY, { resetPageOn: ['status'] });
 */
export function useSyncedSearchParams<S extends Record<string, SearchParamDef>>(
  schema: S,
  options?: {
    /** 修改这些 key 时，若 schema 含 page 则重置为 default */
    resetPageOn?: readonly (keyof S)[];
    replace?: boolean;
  },
): [InferSearchState<S>, (patch: Partial<InferSearchState<S>>) => void] {
  const [searchParams, setSearchParams] = useSearchParams();
  const schemaRef = useRef(schema);
  schemaRef.current = schema;
  const resetPageOnRef = useRef(options?.resetPageOn);
  resetPageOnRef.current = options?.resetPageOn;
  const replace = options?.replace !== false;

  const state = useMemo(() => {
    const current = schemaRef.current;
    const next = {} as InferSearchState<S>;
    for (const key of Object.keys(current) as (keyof S)[]) {
      next[key] = readParam(searchParams.get(String(key)), current[key]);
    }
    return next;
  }, [searchParams]);

  const setState = useCallback(
    (patch: Partial<InferSearchState<S>>) => {
      setSearchParams(
        (prev) => {
          const current = schemaRef.current;
          const params = new URLSearchParams(prev);
          const keys = Object.keys(patch) as (keyof S)[];
          for (const key of keys) {
            const value = patch[key];
            if (value === undefined) continue;
            writeParam(params, String(key), value as string | number, current[key]);
          }
          const resetKeys = resetPageOnRef.current;
          const shouldResetPage =
            current.page != null &&
            resetKeys?.some((k) => Object.prototype.hasOwnProperty.call(patch, k));
          if (shouldResetPage && !Object.prototype.hasOwnProperty.call(patch, 'page')) {
            writeParam(params, 'page', current.page.default as number, current.page);
          }
          return params;
        },
        { replace },
      );
    },
    [setSearchParams, replace],
  );

  return [state, setState];
}
