/**
 * Permissions Service - Bridge for Capacitor native permissions
 *
 * On web, all permissions are treated as granted.
 * On Android via Capacitor, these call native permission APIs.
 */

export type PermissionType = 'READ_SMS' | 'SEND_SMS' | 'RECEIVE_SMS' | 'READ_CONTACTS';

export interface PermissionStatus {
  permission: PermissionType;
  granted: boolean;
}

const isNative = (): boolean => {
  try {
    return !!(window as any).Capacitor?.isNativePlatform();
  } catch {
    return false;
  }
};

/**
 * Check if a specific permission is granted.
 */
export async function checkPermission(permission: PermissionType): Promise<boolean> {
  if (!isNative()) return true; // Web mode — always granted
  // TODO: Use Capacitor Permissions plugin
  return false;
}

/**
 * Request multiple permissions at once.
 */
export async function requestPermissions(
  permissions: PermissionType[]
): Promise<PermissionStatus[]> {
  if (!isNative()) {
    // Web — simulate all granted
    return permissions.map(p => ({ permission: p, granted: true }));
  }

  // TODO: Use Capacitor Permissions plugin
  // const results = await Permissions.request({ permissions });
  return permissions.map(p => ({ permission: p, granted: false }));
}

/**
 * Check if all required SMS permissions are granted.
 */
export async function hasAllSMSPermissions(): Promise<boolean> {
  const required: PermissionType[] = ['READ_SMS', 'SEND_SMS', 'RECEIVE_SMS', 'READ_CONTACTS'];
  const results = await Promise.all(required.map(checkPermission));
  return results.every(Boolean);
}
