import React, { useState } from 'react';
import styled from 'styled-components';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField } from '../i18n/utils';

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
          <i className="far fa-clock"></i> {moment.date}
        </DateSpan>
        <Badge>
          <i className="fas fa-location-dot"></i> {moment.location}
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
          <i className={isLiked ? "fas fa-heart" : "far fa-heart"}></i>
          <span className="like-count">{likes}</span>
        </LikeBtn>
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
  background: var(--nav-bg);
  border: 1px solid color-mix(in srgb, var(--text-color) 8%, transparent);
  border-radius: 24px;
  padding: 28px;
  box-shadow: 0 8px 30px color-mix(in srgb, var(--text-color) 6%, transparent);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 14px 40px color-mix(in srgb, var(--text-color) 12%, transparent);
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
  color: var(--frame-color);
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
  padding: 4px 10px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--text-color) 5%, transparent);
  border: 1px solid color-mix(in srgb, var(--text-color) 8%, transparent);
  font-size: 0.8rem;
`;

const Content = styled.div`
  font-family: var(--content-font);
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--text-color);
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
  border-top: 1px solid color-mix(in srgb, var(--text-color) 6%, transparent);
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
  border-radius: 999px;
  background: transparent;
  border: 1px solid color-mix(in srgb, var(--text-color) 10%, transparent);
  color: var(--frame-color);
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;

  i {
    transition: transform 0.2s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  &:hover {
    color: #e63946;
    border-color: color-mix(in srgb, #e63946 30%, transparent);
    background: color-mix(in srgb, #e63946 8%, transparent);
  }

  &:hover i {
    transform: scale(1.15);
  }

  ${props => props.$isLiked && `
    color: #e63946;
    border-color: color-mix(in srgb, #e63946 40%, transparent);
    background: color-mix(in srgb, #e63946 12%, transparent);
    
    i {
      transform: scale(1.1);
    }
  `}
`;
