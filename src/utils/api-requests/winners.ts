import type { WinnerInfo, WinnersResponse } from './car-interface';
import { BASE_URL } from './car-interface';

export type SortField = 'id' | 'wins' | 'time';
export type SortOrder = 'ASC' | 'DESC';

export async function getWinners(
  page?: number,
  limit?: number,
  sort?: SortField,
  order?: SortOrder
): Promise<WinnersResponse> {
  const parameters = new URLSearchParams();

  if (page !== undefined) parameters.append('_page', page.toString());
  if (limit !== undefined) parameters.append('_limit', limit.toString());
  if (sort) parameters.append('_sort', sort);
  if (order) parameters.append('_order', order);

  const response = await fetch(`${BASE_URL}/winners?${parameters.toString()}`);

  if (!response.ok) {
    throw new Error('Error fetching winners');
  }

  const winners: WinnerInfo[] = await response.json();
  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader ? Number(totalCountHeader) : undefined;

  return { winners, totalCount };
}

export async function getWinner(id: number): Promise<WinnerInfo | undefined> {
  const response = await fetch(`${BASE_URL}/winners/${id}`);

  if (response.status === 404) {
    return undefined;
  }

  if (!response.ok) {
    throw new Error('Error fetching winner');
  }

  return response.json();
}

export async function createWinner(id: number, wins: number, time: number): Promise<WinnerInfo> {
  const response = await fetch(`${BASE_URL}/winners`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, wins, time }),
  });

  if (!response.ok) {
    throw new Error('Error creating winner');
  }

  return response.json();
}

export async function updateWinner(id: number, wins: number, time: number): Promise<WinnerInfo> {
  const response = await fetch(`${BASE_URL}/winners/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ wins, time }),
  });

  if (!response.ok) {
    throw new Error('Error updating winner');
  }

  return response.json();
}

export async function deleteWinner(id: number): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/winners/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting winner');
  }

  return response.ok;
}

export async function saveWinner(id: number, time: number): Promise<void> {
  const existingWinner = await getWinner(id);

  if (existingWinner) {
    const newWins = existingWinner.wins + 1;
    const bestTime = Math.min(existingWinner.time, time);
    await updateWinner(id, newWins, bestTime);
  } else {
    await createWinner(id, 1, time);
  }
}
