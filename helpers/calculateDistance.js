async function calculateDistance(coordinates1, coordinates2) {
  const R = 6371;

  const toRad = (value) => (value * Math.PI) / 180;

  const dLat = toRad(coordinates2[1] - coordinates1[1]);
  const dLon = toRad(coordinates2[0] - coordinates1[0]);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coordinates1[1])) *
      Math.cos(toRad(coordinates2[1])) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  const distance = R * c;

  return distance.toFixed(2);
}

module.exports = calculateDistance;
