import { useRouter } from 'expo-router';

// Central place to define allowed string routes (typed)
export type AppRoute =
  | '/now-playing'
  | '/queue'
  | '/playlists'
  | '/premium'
  | '/settings'
  | '/mixes';

export function useTypedRouter() {
  const router = useRouter();
  function push(route: AppRoute | { pathname: AppRoute; params?: Record<string, any> }) {
    router.push(route as any); // enforce our narrowed union at compile time
  }
  return { ...router, push } as const;
}
