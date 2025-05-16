import type { Comment } from '../../interfaces';
import distanceToNow from '../../lib/dateRelative';
import { useAuth0 } from '@auth0/auth0-react';

type CommentListProps = {
  comments?: Comment[];
  onDelete: (comment: Comment) => Promise<void>;
};

export default function CommentList({ comments, onDelete }: CommentListProps) {
  const { user } = useAuth0();

  return (
    <div className='space-y-6 mt-10'>
      {comments &&
        comments.map((comment) => {
          const isAuthor = user && user.sub === comment.user.sub;
          const isAdmin = user && user.email === process.env.NEXT_PUBLIC_AUTH0_ADMIN_EMAIL;

          return (
            <div
              key={comment.created_at}
              className='flex gap-4 p-4 rounded-lg bg-card border border-border hover:border-primary/50 transition-colors'
            >
              <div className='flex-shrink-0'>
                <img
                  src={comment.user.picture}
                  alt={comment.user.name}
                  width={40}
                  height={40}
                  className='rounded-full ring-2 ring-primary/20'
                />
              </div>

              <div className='flex-grow space-y-2'>
                <div className='flex items-center gap-2'>
                  <span className='font-medium text-foreground'>{comment.user.name}</span>
                  <span className='text-sm text-muted-foreground'>{distanceToNow(comment.created_at)}</span>
                  {(isAdmin || isAuthor) && (
                    <button
                      className='ml-auto p-1 rounded-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors'
                      onClick={() => onDelete(comment)}
                      aria-label='Delete comment'
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
                        <path d='M3 6h18'></path>
                        <path d='M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6'></path>
                        <path d='M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2'></path>
                      </svg>
                    </button>
                  )}
                </div>

                <p className='text-foreground/90'>{comment.text}</p>
              </div>
            </div>
          );
        })}
    </div>
  );
}
