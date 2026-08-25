const API_BASE: string = (import.meta.env.VITE_API_BASE as string | undefined)?.replace(/\/$/, '') ?? '';

export function apiUrl(path: string): string {
  return `${API_BASE}${path}`;
}
