export const BASE_URL = 'http://localhost:3000';

export interface CarInfo {
  id: number;
  name: string;
  color: string;
}

export interface GarageResponse {
  cars: CarInfo[];
  totalCount: number | undefined;
}

export enum EngineStatus {
  started = 'started',
  stopped = 'stopped',
  drive = 'drive',
}

export interface EngineResponse {
  velocity: number;
  distance: number;
}

export interface SuccessResponse {
  success: boolean;
}
