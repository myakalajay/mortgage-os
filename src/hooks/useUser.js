/**
 * @file src/hooks/useUser.js
 * @description Global User State Hook
 * * USAGE:
 * const { user, isLoading, isError } = useUser({ redirectTo: '/auth/login' });
 */

import useSWR from 'swr';
import { useRouter } from 'next/router';
import { useEffect } from 'react';

// SWR fetcher wrapper
const fetcher = (url) => fetch(url).then((r) => r.json());

export default function useUser({ redirectTo = '', redirectIfFound = false } = {}) {
  const router = useRouter();

  // Poll the session endpoint
  const { data, error } = useSWR('/api/auth/me', fetcher, {
    shouldRetryOnError: false,
    revalidateOnFocus: false, // Don't re-verify on every window click
  });

  const user = data?.loggedIn ? data.user : null;
  const finished = Boolean(data);
  const hasUser = Boolean(user);

  useEffect(() => {
    if (!redirectTo || !finished) return;

    // SCENARIO 1: User is NOT logged in, but page requires it (e.g., Dashboard)
    if (redirectTo && !redirectIfFound && !hasUser) {
      router.push(redirectTo);
    }

    // SCENARIO 2: User IS logged in, but tries to access Login page
    if (redirectIfFound && hasUser) {
      router.push(redirectTo);
    }
  }, [redirectTo, redirectIfFound, finished, hasUser, router]);

  return {
    user,
    isLoading: !finished,
    isError: error,
  };
}