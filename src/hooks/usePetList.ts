import { useState } from 'react';
import { getPetList } from '../api/pet';
import { useAsyncEffect } from './useAsync';
import { PetInfo, PetListParams } from '../types/pet';

/**
 * 宠物列表 hook
 *
 * 管理宠物类型筛选 + 关键词搜索 + 列表加载。
 *
 * 用法:
 *   const { pets, loading, petType, setPetType, keyword, setKeyword } = usePetList();
 */
export function usePetList(pageSize = 20) {
  const [petType, setPetType] = useState(0);
  const [keyword, setKeyword] = useState('');

  const params: PetListParams = {
    petType: petType || undefined,
    keyword: keyword || undefined,
    page: 1,
    pageSize,
  };

  const { loading, data } = useAsyncEffect(
    () => getPetList(params),
    [petType, keyword],
    { onError: (err) => console.error('获取宠物列表失败', err) },
  );

  const pets: PetInfo[] = data?.list ?? [];

  return { pets, loading, petType, setPetType, keyword, setKeyword };
}
