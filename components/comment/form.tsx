import { useAuth0 } from '@auth0/auth0-react';

type CommentFormProps = {
  text: string;
  setText: Function;
  onSubmit: (e: React.FormEvent) => Promise<void>;
};

export default function CommentForm({ text, setText, onSubmit }: CommentFormProps) {
  const { isAuthenticated, logout, loginWithPopup } = useAuth0();

  return (
    <form onSubmit={onSubmit} className='space-y-4'>
      <textarea
        className='w-full p-4 rounded-lg resize-y bg-card text-foreground placeholder-muted-foreground border border-border focus:border-primary focus:ring-1 focus:ring-primary transition-colors'
        rows={3}
        placeholder={isAuthenticated ? `What are your thoughts?` : 'Please login to leave a comment'}
        onChange={(e) => setText(e.target.value)}
        value={text}
        disabled={!isAuthenticated}
      />

      <div className='flex items-center gap-4'>
        {isAuthenticated ? (
          <div className='flex items-center gap-4'>
            <button
              type='submit'
              className='px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors'
              disabled={!text.trim()}
            >
              Send Comment
            </button>
            <button
              type='button'
              className='px-4 py-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
              onClick={() => logout({ returnTo: window.location.origin })}
            >
              Log Out
            </button>
          </div>
        ) : (
          <button
            type='button'
            className='px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors'
            onClick={() => loginWithPopup()}
          >
            Log In to Comment
          </button>
        )}
      </div>
    </form>
  );
}
