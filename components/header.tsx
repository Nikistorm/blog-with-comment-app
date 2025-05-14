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
            <Link href='/posts'>Posts</Link>
          </div>
          <div className='flex items-center space-x-4'>
            {isAuthenticated && user ? (
              <>
                <Link
                  className='px-3 py-1.5 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none'
                  href='/profile'
                >
                  {user.nickname || user.name || user.email}
                </Link>
              </>
            ) : (
              <button
                onClick={() => loginWithRedirect({ redirectUri: window.location.origin })}
                className='px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none'
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
