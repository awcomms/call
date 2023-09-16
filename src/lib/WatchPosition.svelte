<script lang="ts">
  import { onMount } from 'svelte';
  import { createEventDispatcher } from 'svelte';

  /**
   * Threshold for position change in miles.
   * @type {number}
   */
  export let threshold: number = 37; 
  threshold *= 1609.34; // Convert to meters

  /**
   * The last known position.
   * @type {GeolocationPosition | null}
   */
  let previousPosition: GeolocationPosition | null = null;

  const dispatch = createEventDispatcher<{ positionChange: { distance: number, position: GeolocationPosition }, not_available: undefined, available: undefined }>();

  /**
   * Processes the new position.
   * If the distance to the previous position is greater than the threshold,
   * dispatches a 'positionChange' event with the distance as detail.
   * @param {GeolocationPosition} position - The new position.
   */
  const processPosition = (position: GeolocationPosition): void => {
    if (previousPosition) {
      const distance = getDistance(previousPosition, position);
      if (distance > threshold) {
        dispatch('positionChange', { distance, position });
      }
    }
    previousPosition = position;
  };

  /**
   * Handles geolocation errors.
   * @param {GeolocationPositionError} error - The error object.
   */
  const handleError = (error: GeolocationPositionError): void => {
    console.warn(`ERROR(${error.code}): ${error.message}`);
  };

  /**
   * Calculates the distance between two positions using the Haversine formula.
   * @param {GeolocationPosition} pos1 - The first position.
   * @param {GeolocationPosition} pos2 - The second position.
   * @return {number} The distance in meters.
   */
  const getDistance = (pos1: GeolocationPosition, pos2: GeolocationPosition): number => {
    const R = 6371e3; // Radius of the earth in meters
    const lat1 = pos1.coords.latitude * Math.PI/180;
    const lat2 = pos2.coords.latitude * Math.PI/180;
    const deltaLat = (pos2.coords.latitude-pos1.coords.latitude) * Math.PI/180;
    const deltaLon = (pos2.coords.longitude-pos1.coords.longitude) * Math.PI/180;

    const a = Math.sin(deltaLat/2) * Math.sin(deltaLat/2) +
              Math.cos(lat1) * Math.cos(lat2) *
              Math.sin(deltaLon/2) * Math.sin(deltaLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  };

  onMount(() => {
    if ('geolocation' in navigator) {
      dispatch('available');
      navigator.geolocation.watchPosition(processPosition, handleError);
    } else {
      console.warn('Geolocation is not available');
      dispatch('not_available');
    }
  });
</script>