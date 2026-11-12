import { getPetList } from '../api/pet';
import { useAsyncEffect } from './useAsync';
import { useSyncedSearchParams } from './useSyncedSearchParams';
import { PetInfo, PetListParams } from '../types/pet';
import { reportError } from '../utils/errorReport';

const PET_LIST_QUERY = {
  type: { kind: 'number', default: 0 },
  keyword: { kind: 'string', default: '' },
} as const;

/**
 * 宠物列表 hook
 *
 * 管理宠物类型筛选 + 关键词搜索 + 列表加载。
 * type/keyword 与 URL 同步。
 */
export function usePetList(pageSize = 20) {
  const [query, setQuery] = useSyncedSearchParams(PET_LIST_QUERY, {
    resetPageOn: ['type', 'keyword'],
  });
  const petType = query.type;
  const keyword = query.keyword;

  const params: PetListParams = {
    petType: petType || undefined,
    keyword: keyword || undefined,
    page: 1,
    pageSize,
  };

  const { loading, data } = useAsyncEffect(
    () => getPetList(params),
    [petType, keyword, pageSize],
    { onError: (err) => reportError('获取宠物列表失败', err) },
  );

  const pets: PetInfo[] = data?.list ?? [];

  const setPetType = (type: number) => setQuery({ type });
  const setKeyword = (value: string) => setQuery({ keyword: value });

  return { pets, loading, petType, setPetType, keyword, setKeyword };
}
