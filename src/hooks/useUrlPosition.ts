import { useSearchParams } from 'react-router-dom';

export function useUrlPosition() {
  const [searchParams] = useSearchParams();
  const lat = searchParams.get('lat');
  const lng = searchParams.get('lng');

  if (!lat || !lng) return [40, 0];

  // Parse lat and lng to numbers.
  const latNumber = parseFloat(lat);
  const lngNumber = parseFloat(lng);

  return [latNumber, lngNumber];
}
