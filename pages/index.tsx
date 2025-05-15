import Container from '../components/container';
import Image from 'next/image';

function HomePage() {
  return (
    <>
      <Container>
        <div className='space-y-6'>
          <h1 className='text-3xl font-bold'>欢迎来到文章分享平台</h1>
          <p className='text-lg'>这是一个支持 Markdown 编辑、评论、点赞、标签分类的现代化博客/文章分享平台。你可以：</p>
          <ul className='list-disc pl-6 text-base'>
            <li>注册并登录后发布自己的文章，支持 Markdown 格式</li>
            <li>为每篇文章添加多个标签，方便分类和检索</li>
            <li>浏览他人发布的内容，支持分页浏览</li>
            <li>对喜欢的文章进行点赞，实时统计喜欢数</li>
            <li>在文章详情页下方发表评论，与作者和其他读者互动</li>
          </ul>
          <p className='text-base'>
            本项目基于 Next.js、Redis、Tailwind CSS、Auth0 等技术栈构建，适合个人博客、技术分享、团队知识库等多种场景。
          </p>
        </div>
      </Container>

      <div className='container max-w-4xl m-auto px-4 mt-20'>
        <img src='https://picsum.photos/seed/picsum/960/640' alt='random' width={960} height={640} />
      </div>
    </>
  );
}

export default HomePage;
