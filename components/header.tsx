import Link from 'next/link';
import Container from '../components/container';
import { useAuth0 } from '@auth0/auth0-react';

export default function Header() {
  const { user, isAuthenticated, loginWithRedirect, logout } = useAuth0();

  return (
    <header className='py-6'>
      <Container>
        <nav className='flex justify-between items-center'>
          <div className='flex space-x-4'>
            <Link href='/'>About</Link>
            <Link href='/articles'>Article</Link>
          </div>
          <div className='flex items-center space-x-4'>
            {isAuthenticated && user ? (
              <>
                <Link
                  href='/editor'
                  className='px-3 py-1.5 text-sm font-medium rounded-full focus:outline-none bg-background text-foreground'
                >
                  New Article
                </Link>
                <Link
                  className='px-3 py-1.5 text-sm font-medium rounded-full focus:outline-none bg-primary text-primary-foreground'
                  href='/profile'
                >
                  {user.nickname || user.name || user.email}
                </Link>
              </>
            ) : (
              <button
                onClick={() => loginWithRedirect({ redirectUri: window.location.origin })}
                className='px-3 py-1.5 text-sm font-medium rounded-md focus:outline-none bg-primary text-primary-foreground'
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
