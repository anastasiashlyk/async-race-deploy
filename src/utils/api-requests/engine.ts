import type { EngineResponse, SuccessResponse } from './car-interface';
import { BASE_URL, EngineStatus } from './car-interface';

export async function startEngine(id: number, status: EngineStatus): Promise<EngineResponse> {
  const parameters = new URLSearchParams();
  parameters.append('id', id.toString());
  parameters.append('status', status);

  const response = await fetch(`${BASE_URL}/engine?${parameters.toString()}`, {
    method: 'PATCH',
  });

  if (!response.ok) {
    throw new Error('Error starting engine');
  }
  return response.json();
}

export async function drive(id: number): Promise<SuccessResponse> {
  const parameters = new URLSearchParams();
  parameters.append('id', id.toString());
  parameters.append('status', EngineStatus.drive);

  const response = await fetch(`${BASE_URL}/engine?${parameters.toString()}`, {
    method: 'PATCH',
  });

  if (response.status === 500) {
    return { success: false };
  }

  if (!response.ok) {
    const errorMessage = await response.text();
    throw new Error(errorMessage || 'Error switching to drive mode');
  }

  return response.json();
}
