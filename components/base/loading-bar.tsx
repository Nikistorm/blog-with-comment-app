import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useComponentLoading } from '@/contexts/loading-context';

const LoadingBar = () => {
  const router = useRouter();
  const [routeLoading, setRouteLoading] = useState(false);
  const { isComponentLoading } = useComponentLoading();

  useEffect(() => {
    const handleStart = () => setRouteLoading(true);
    const handleComplete = () => setRouteLoading(false);

    router.events.on('routeChangeStart', handleStart);
    router.events.on('routeChangeComplete', handleComplete);
    router.events.on('routeChangeError', handleComplete);

    return () => {
      router.events.off('routeChangeStart', handleStart);
      router.events.off('routeChangeComplete', handleComplete);
      router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  if (!routeLoading && !isComponentLoading) return null;

  return (
    <div className='fixed top-0 left-0 right-0 h-0.5 z-50'>
      <div className='animate-loading-bar' />
    </div>
  );
};

export default LoadingBar;
