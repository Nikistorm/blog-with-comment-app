import CommentForm from './form';
import CommentList from './list';
import useComments from '../../hooks/useComment';

export default function Comment({ articleSlug }: { articleSlug: string }) {
  const { text, setText, comments, onSubmit, onDelete } = useComments(articleSlug);

  return (
    <div className='mt-20'>
      <CommentForm onSubmit={onSubmit} text={text} setText={setText} />
      <CommentList comments={comments} onDelete={onDelete} />
    </div>
  );
}
