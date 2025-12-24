import { cookies } from 'next/headers';
import { jwtDecode } from 'jwt-decode';

export function decodeToken(token: string) {
  try {
    return jwtDecode<any>(token);
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;
  if (!token) return null;
  return decodeToken(token);
}

export async function isAdmin() {
  const user = await getCurrentUser();

  if (!user) return false;
  const role = (user as any).role 
  return role === 'admin';
}