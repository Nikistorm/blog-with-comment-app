import Link from 'next/link';
import { useRouter } from 'next/router';
import Container from '../components/container';
import { useAuth0 } from '@auth0/auth0-react';

export default function Header() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();
  const router = useRouter();

  const isActive = (path: string) => {
    if (path === '/') {
      return router.pathname === path;
    }
    return router.pathname.startsWith(path);
  };

  return (
    <header className='py-6 border-b border-border'>
      <Container>
        <nav className='flex justify-between items-center'>
          <div className='flex space-x-6'>
            <Link
              href='/'
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              About
            </Link>
            <Link
              href='/articles'
              className={`text-sm font-medium transition-colors hover:text-primary ${
                isActive('/articles') ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              Articles
            </Link>
          </div>
          <div className='flex items-center space-x-4'>
            {isAuthenticated && user ? (
              <>
                <Link
                  href='/editor'
                  className='inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-full transition-colors border border-primary/20 text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary/20'
                >
                  <svg
                    xmlns='http://www.w3.org/2000/svg'
                    width='16'
                    height='16'
                    viewBox='0 0 24 24'
                    fill='none'
                    stroke='currentColor'
                    strokeWidth='2'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  >
                    <path d='M12 5v14M5 12h14' />
                  </svg>
                  New Article
                </Link>
                <Link
                  className='px-3 py-1.5 text-sm font-medium rounded-full transition-colors hover:bg-primary/90 focus:outline-none bg-primary text-primary-foreground'
                  href='/profile'
                >
                  {user.nickname || user.name || user.email}
                </Link>
              </>
            ) : (
              <button
                onClick={() => loginWithRedirect({ redirectUri: window.location.origin })}
                className='px-3 py-1.5 text-sm font-medium rounded-md transition-colors hover:bg-primary/90 focus:outline-none bg-primary text-primary-foreground'
              >
                Log in
              </button>
            )}
          </div>
        </nav>
      </Container>
    </header>
  );
}
