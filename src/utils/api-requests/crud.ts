import type { CarInfo, GarageResponse } from './car-interface';
import { BASE_URL } from './car-interface';

export async function getGarage(page?: number, limit?: number): Promise<GarageResponse> {
  const parameters = new URLSearchParams();

  if (page !== undefined) parameters.append('_page', page.toString());
  if (limit !== undefined) parameters.append('_limit', limit.toString());

  const response = await fetch(`${BASE_URL}/garage?${parameters.toString()}`);

  if (!response.ok) {
    throw new Error('Error fetching garage');
  }

  const cars: CarInfo[] = await response.json();

  const totalCountHeader = response.headers.get('X-Total-Count');
  const totalCount = totalCountHeader ? Number(totalCountHeader) : undefined;

  return {
    cars,
    totalCount,
  };
}

export async function deleteCar(id: number): Promise<boolean> {
  const response = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Error deleting car');
  }

  return response.ok;
}

export async function createCar(name: string, color: string): Promise<CarInfo> {
  console.log(name, color);
  const response = await fetch(`${BASE_URL}/garage`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    throw new Error('Error creating car');
  }

  return response.json();
}

export async function updateCar(id: number, name: string, color: string): Promise<CarInfo> {
  const response = await fetch(`${BASE_URL}/garage/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name, color }),
  });

  if (!response.ok) {
    throw new Error('Error updating car');
  }

  return response.json();
}
