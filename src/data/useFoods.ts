import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import type { FoodItem } from '../types/food';

export const FOODS_QUERY_KEY = ['foods'] as const;

export async function fetchFoods(): Promise<FoodItem[]> {
  const res = await fetch('/data/foods.json');
  if (!res.ok) throw new Error(`Failed to load catalog: ${res.status}`);
  return (await res.json()) as FoodItem[];
}

export function useFoods(): UseQueryResult<FoodItem[], Error> {
  return useQuery({ queryKey: FOODS_QUERY_KEY, queryFn: fetchFoods });
}
