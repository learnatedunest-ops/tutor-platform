/**
 * Removes precise location details from non-admin profile responses.
 * Coordinates and street addresses stay in the database for matching and
 * admin operations, but are never exposed in tutor or parent/student APIs.
 */
export function redactPrivateLocation<T extends {
  latitude: string | null;
  longitude: string | null;
  fullAddress: string | null;
}>(profile: T | null) {
  if (!profile) return null;

  const { latitude, longitude, fullAddress, ...safeProfile } = profile;
  return {
    ...safeProfile,
    hasPrivateLocation: Boolean(latitude && longitude),
  };
}
