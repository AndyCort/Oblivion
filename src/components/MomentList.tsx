import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';
import { Clock, MapPin, Heart, MessageSquare, Share2 } from 'lucide-react';

interface Moment {
  date: string;
  location: string;
  mood: string;
  content: any;
  tags: string[];
  likes: number;
}

interface Props {
  moments: Moment[];
}

export default function MomentList({ moments }: Props) {
  const { locale } = useLocale();

  return (
    <Timeline>
      {moments.map((moment, idx) => (
        <MomentCard key={idx} moment={moment} locale={locale} />
      ))}
    </Timeline>
  );
}

function MomentCard({ moment, locale }: { moment: Moment, locale: string }) {
  const [likes, setLikes] = useState(moment.likes);
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    if (isLiked) {
      setLikes(likes - 1);
      setIsLiked(false);
    } else {
      setLikes(likes + 1);
      setIsLiked(true);
    }
  };

  return (
    <Card>
      <Meta>
        <DateSpan>
          <Clock size={14} /> {moment.date}
        </DateSpan>
        <Badge>
          <MapPin size={14} /> {moment.location}
        </Badge>
        <Badge className="mood-badge">{moment.mood}</Badge>
      </Meta>

      <Content>
        <p>{getLocalizedField(moment.content, locale as any)}</p>
      </Content>

      <Footer>
        <Tags>
          {moment.tags.map((tag, i) => (
            <Tag key={i}>#{tag}</Tag>
          ))}
        </Tags>

        <LikeBtn
          $isLiked={isLiked}
          aria-label="Like post"
          onClick={handleLike}
        >
          <Heart size={14} fill={isLiked ? 'currentColor' : 'none'} />
          <span className="like-count">{likes}</span>
        </LikeBtn>
        <CommentBtn
          aria-label="Comment post"
        //onClick={handleComment}
        >
          <MessageSquare size={14} />
          {/*<span className="comment-count">{commentCount}</span>*/}
        </CommentBtn>
        <ShareBtn
          aria-label="Share post"
        //onClick={handleShare}
        >
          <Share2 size={14} />
        </ShareBtn>
      </Footer>
    </Card>
  );
}

// Styled Components

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 28px;
`;

const Card = styled.article`
  background: var(--bg-1);
  border: var(--border);
  border-radius: 24px;
  padding: 28px 28px 8px;
  box-shadow: var(--box-shadow);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: var(--box-shadow);
    border-color: color-mix(in srgb, var(--main-color) 20%, transparent);
  }

  @media (max-width: 640px) {
    padding: 20px;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: var(--text-3);
`;

const DateSpan = styled.span`
  display: flex;
  align-items: center;
  gap: 6px;
  opacity: 0.75;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: transparent;
  border: 0;
  font-size: 0.8rem;
`;

const Content = styled.div`
  font-family: var(--content-font);
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-1);
  margin-bottom: 20px;

  p {
    margin: 0;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 16px;
  border-top: var(--border);
`;

const Tags = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

const Tag = styled.span`
  font-size: 0.82rem;
  color: var(--main-color);
  opacity: 0.85;
  font-weight: 500;
`;

const LikeBtn = styled.button<{ $isLiked?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &:hover {
    color: var(--main-color);

  }

  ${props => props.$isLiked && `
    color: var(--main-color);
  `}
`
const CommentBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &:hover {
    color: var(--main-color);

  }
`
const ShareBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  background: transparent;
  border: none;
  color: var(--text-3);
  cursor: pointer;
  font-size: 0.7rem;
  transition: all 0.2s ease;

  svg {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &:hover {
    color: var(--main-color);

  }
`
