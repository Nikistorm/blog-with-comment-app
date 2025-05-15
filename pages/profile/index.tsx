import { useAuth0, User } from '@auth0/auth0-react';
import Container from '../../components/container'; // Adjusted path for container
import Image from 'next/image'; // For displaying user picture

export default function ProfilePage() {
  // Renamed component for clarity, not strictly necessary
  const { user, isAuthenticated, isLoading, logout } = useAuth0<User>();
  console.log(user);

  if (isLoading) {
    return (
      <Container>
        <p>Loading profile...</p>
      </Container>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <Container>
        <p>You are not logged in. Please log in to view your profile.</p>
        {/* Optionally, add a login button here if desired */}
      </Container>
    );
  }

  return (
    <Container>
      <div className='max-w-md mx-auto bg-white shadow-md rounded-lg p-6 mt-10'>
        <div className='flex flex-col items-center'>
          {user.picture && (
            <img
              src={user.picture}
              alt={user.name || user.nickname || 'Profile picture'}
              width={100}
              height={100}
              className='rounded-full mb-4'
            />
          )}
          <h1 className='text-2xl font-semibold mb-2'>{user.nickname}</h1>
          {user.email && <p className='text-gray-600 mb-1'>{user.email}</p>}
          {user.updated_at && (
            <p className='text-sm text-gray-500 mb-4'>Last updated: {new Date(user.updated_at).toLocaleDateString()}</p>
          )}
          <h2 className='text-xl font-medium mt-6 mb-3 self-start'>User Details:</h2>
          <pre className='bg-gray-100 p-4 rounded-md text-sm overflow-x-auto w-full mb-6'>
            {JSON.stringify(user, null, 2)}
          </pre>
          <button
            onClick={() => logout({ returnTo: window.location.origin })}
            className='w-full px-4 py-2 text-sm font-medium text-white bg-primary rounded-full'
          >
            Log out
          </button>
        </div>
      </div>
    </Container>
  );
}
