import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTranslation } from '../i18n/useTranslation';
import { API_BASE } from '../api/config';

const CommentsContainer = styled.div`
  margin-top: 40px;
  padding-top: 30px;
  border-top: 1px solid var(--border-color);
`;

const Title = styled.h3`
  font-size: 1.5rem;
  color: var(--title-color);
  margin-bottom: 20px;
  font-family: var(--title-font);
`;

const CommentForm = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 40px;
  background: var(--nav-bg);
  padding: 30px;
  border-radius: 16px;
  border: 1px solid var(--border-color);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.03);
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;

  label {
    font-size: 0.9rem;
    color: var(--text-color);
    opacity: 0.8;
  }

  input, textarea {
    padding: 12px 16px;
    border-radius: 10px;
    border: 1px solid var(--border-color);
    background: var(--input-bg);
    color: var(--title-color);
    font-family: var(--content-font);
    outline: none;
    transition: all 0.3s ease;

    &:focus {
      border-color: var(--accent-color);
      background: var(--nav-bg);
    }
  }

  textarea {
    resize: vertical;
    min-height: 100px;
  }
`;

const SubmitButton = styled.button`
  padding: 12px 24px;
  background: var(--main-color);
  color: var(--theme-color);
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  align-self: flex-start;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.9;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CommentList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CommentItem = styled.div`
  padding: 24px;
  background: var(--nav-bg);
  border: 1px solid var(--border-color);
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.02);
`;

const CommentHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;

  strong {
    color: var(--main-color);
    font-size: 1.1rem;
    display: flex;
    align-items: center;
    gap: 8px;

    i {
      font-size: 0.9rem;
      opacity: 0.7;
    }
  }

  span {
    color: var(--text-color);
    opacity: 0.6;
    font-size: 0.85rem;
  }
`;

const CommentContent = styled.p`
  color: var(--text-color);
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
  word-break: break-word;
`;

const EmptyComments = styled.div`
  text-align: center;
  color: var(--text-color);
  opacity: 0.6;
  padding: 40px 0;
  font-style: italic;
`;


interface CommentType {
  _id: string;
  author: string;
  content: string;
  date: string;
}

interface CommentsProps {
  articleId: string;
}

export default function Comments({ articleId }: CommentsProps) {
  const { locale } = useTranslation();
  const [comments, setComments] = useState<CommentType[]>([]);
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchComments();
  }, [articleId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`${API_BASE}/api/comments/${articleId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error('Failed to load comments');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    setIsSubmitting(true);
    setError('');

    try {
      const res = await fetch(`${API_BASE}/api/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          articleId,
          author: author.trim() || 'Anonymous',
          content: content.trim()
        })
      });

      if (!res.ok) throw new Error('Failed to post comment');

      const newComment = await res.json();
      setComments([newComment, ...comments]);
      setAuthor('');
      setContent('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  return (
    <CommentsContainer>
      <Title>{locale === 'zh-CN' ? '评论' : 'Comments'} ({comments.length})</Title>

      <CommentForm onSubmit={handleSubmit}>
        {error && <div style={{ color: '#ff4d4f', fontSize: '14px' }}>{error}</div>}

        <FormGroup>
          <label>{locale === 'zh-CN' ? '昵称 (选填)' : 'Name (Optional)'}</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder={locale === 'zh-CN' ? '匿名前辈' : 'Anonymous'}
            maxLength={30}
          />
        </FormGroup>

        <FormGroup>
          <label>{locale === 'zh-CN' ? '评论内容' : 'Comment'}</label>
          <textarea
            required
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={locale === 'zh-CN' ? '写下你的想法...' : 'Leave your thoughts here...'}
            maxLength={1000}
          />
        </FormGroup>

        <SubmitButton type="submit" disabled={isSubmitting || !content.trim()}>
          {isSubmitting
            ? (locale === 'zh-CN' ? '提交中...' : 'Submitting...')
            : (locale === 'zh-CN' ? '发送评论' : 'Post Comment')
          }
        </SubmitButton>
      </CommentForm>

      <CommentList>
        {comments.length === 0 ? (
          <EmptyComments>
            {locale === 'zh-CN' ? '暂时还没有评论，来做第一个留言的人吧！' : 'No comments yet. Be the first to share your thoughts!'}
          </EmptyComments>
        ) : (
          comments.map(comment => (
            <CommentItem key={comment._id}>
              <CommentHeader>
                <strong><i className="fas fa-user-circle"></i>{comment.author}</strong>
                <span>{formatDate(comment.date)}</span>
              </CommentHeader>
              <CommentContent>{comment.content}</CommentContent>
            </CommentItem>
          ))
        )}
      </CommentList>
    </CommentsContainer>
  );
}
