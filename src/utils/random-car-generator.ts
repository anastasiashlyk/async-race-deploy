const CAR_BRANDS = [
  'Tesla',
  'Ford',
  'BMW',
  'Mercedes',
  'Audi',
  'Porsche',
  'Toyota',
  'Honda',
  'Ferrari',
  'Lamborghini',
  'Chevrolet',
  'Nissan',
];

const CAR_MODELS = [
  'Model S',
  'Mustang',
  'Series 3',
  'AMG',
  'R8',
  '911',
  'Supra',
  'Civic',
  'F40',
  'Aventador',
  'Camaro',
  'GT-R',
];

function getRandomElement<T>(array: T[]): T {
  const index = Math.floor(Math.random() * array.length);
  return array[index] as T;
}

function generateRandomColor(): string {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let index = 0; index < 6; index += 1) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

export function generateRandomCarName(): string {
  return `${getRandomElement(CAR_BRANDS)} ${getRandomElement(CAR_MODELS)}`;
}

export function generateRandomCar(): { name: string; color: string } {
  return {
    name: generateRandomCarName(),
    color: generateRandomColor(),
  };
}

export function generateRandomCars(count: number): { name: string; color: string }[] {
  return Array.from({ length: count }, () => generateRandomCar());
}
