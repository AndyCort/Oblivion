import { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { useLocale } from '../i18n/useLocale';
import { getLocalizedField, type Locale } from '../i18n/utils';
import type { Moment } from '../data/moments';
import { Clock, MapPin, Heart, Share2, Check } from 'lucide-react';

const LIKED_KEY = (id: string) => `moment-liked:${id}`;

function formatCount(n: number, locale: Locale): string {
  if (n < 10000) return String(n);
  return Intl.NumberFormat(locale === 'zh-CN' ? 'zh-CN' : 'en-US', { notation: 'compact' }).format(n);
}

interface Props {
  moments: Moment[];
}

export default function MomentList({ moments }: Props) {
  const { locale, t } = useLocale();

  if (moments.length === 0) {
    return (
      <EmptyState data-card="base">
        <p>{t('moments.empty')}</p>
      </EmptyState>
    );
  }

  return (
    <Timeline>
      {moments.map((moment, index) => (
        <Item key={moment.id}>
          {/* 轨道：轴线与节点共用同一个中心，保证对齐 */}
          <Rail>
            <RailLine />
            <Dot />
          </Rail>
          <MomentCard moment={moment} locale={locale} index={index} />
        </Item>
      ))}
    </Timeline>
  );
}

function MomentCard({ moment, locale, index }: { moment: Moment; locale: Locale; index: number }) {
  const { t } = useLocale();
  const [likes, setLikes] = useState(moment.likes);
  const [isLiked, setIsLiked] = useState(() => localStorage.getItem(LIKED_KEY(moment.id)) === '1');
  const [shared, setShared] = useState(false);

  const toggleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikes((l) => l + (next ? 1 : -1));
    localStorage.setItem(LIKED_KEY(moment.id), next ? '1' : '0');
  };

  const handleShare = async () => {
    const text = `「${getLocalizedField(moment.content, locale)}」 ${moment.date} · ${moment.location}`;
    try {
      if (navigator.share) {
        await navigator.share({ text });
        return;
      }
      await navigator.clipboard.writeText(text);
      setShared(true);
      setTimeout(() => setShared(false), 1500);
    } catch {
      // 用户取消分享或复制失败，静默处理
    }
  };

  return (
    <Card
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.06, 0.3) }}
    >
      <Meta>
        <DateSpan>
          <Clock size={14} /> {moment.date}
        </DateSpan>
        {moment.location && (
          <Badge>
            <MapPin size={14} /> {moment.location}
          </Badge>
        )}
        {moment.mood && <MoodBadge>{moment.mood}</MoodBadge>}
      </Meta>

      <Content>
        <p>{getLocalizedField(moment.content, locale)}</p>
      </Content>

      <Footer>
        <Tags>
          {moment.tags.map((tag) => (
            <Tag key={tag}>#{tag}</Tag>
          ))}
        </Tags>

        <Actions>
          <ActionButton $active={isLiked} onClick={toggleLike} aria-label={t('moments.like')} title={t('moments.like')}>
            <Heart size={13} fill={isLiked ? 'currentColor' : 'none'} />
            <span>{formatCount(likes, locale)}</span>
          </ActionButton>
          <ActionButton
            onClick={handleShare}
            aria-label={t('moments.share')}
            title={shared ? t('moments.copied') : t('moments.share')}
          >
            {shared ? <Check size={13} /> : <Share2 size={13} />}
          </ActionButton>
        </Actions>
      </Footer>
    </Card>
  );
}

// Styled Components

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

const Item = styled.div`
  display: flex;
  align-items: stretch;
  gap: 20px;
`;

/** 时间轴轨道：只负责承载轴线与节点，避免任何边框偏移计算 */
const Rail = styled.div`
  position: relative;
  width: 16px;
  flex-shrink: 0;
`;

const RailLine = styled.div`
  position: absolute;
  left: 50%;
  top: 0;
  bottom: 0;
  transform: translateX(-50%);
  width: 2px;
  border-radius: 1px;
  background: linear-gradient(
    to bottom,
    var(--main-color),
    color-mix(in srgb, var(--main-color) 25%, transparent) 60%,
    transparent
  );
  opacity: 0.4;
`;

const Dot = styled.div`
  position: absolute;
  left: 50%;
  top: 30px;
  transform: translateX(-50%);
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: var(--bg-0);
  border: 3px solid var(--main-color);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--main-color) 18%, transparent);
`;

const Card = styled(motion.article)`
  position: relative;
  flex: 1;
  min-width: 0;
  background: var(--bg-1);
  border: var(--border);
  border-radius: 20px;
  padding: 24px 24px 10px;
  box-shadow: var(--box-shadow);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    transform: translateY(-3px);
    border-color: color-mix(in srgb, var(--main-color) 30%, transparent);
    box-shadow: 0 10px 30px color-mix(in srgb, var(--main-color) 12%, transparent);
  }

  @media (max-width: 640px) {
    padding: 20px 20px 8px;
  }
`;

const Meta = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
  font-size: 0.85rem;
  color: var(--text-3);
`;

const DateSpan = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  opacity: 0.75;
`;

const Badge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8rem;
  background: color-mix(in srgb, var(--text-1) 7%, transparent);
  border-radius: 999px;
  padding: 3px 10px;
`;

const MoodBadge = styled(Badge)`
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--main-color);
`;

const Content = styled.div`
  font-family: var(--content-font);
  font-size: 1.05rem;
  line-height: 1.75;
  color: var(--text-1);
  margin-bottom: 18px;

  p {
    margin: 0;
  }
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding-top: 14px;
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

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 2px;
`;

/** 紧凑小按钮：无 hover / 无按压缩放，保持安静的内嵌感 */
const ActionButton = styled.button<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 6px;
  background: transparent;
  border: none;
  color: ${props => props.$active ? 'var(--main-color)' : 'var(--text-3)'};
  font-size: 0.72rem;
  line-height: 1;
  cursor: pointer;
  opacity: 0.8;

  svg {
    width: 13px;
    height: 13px;
    flex-shrink: 0;
  }
`;

const EmptyState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  color: var(--text-3);
  font-size: 1rem;
`;
