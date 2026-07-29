import React from 'react';
import styled from 'styled-components';
import { useAutoContrast } from '../hooks/useAutoContrast';
import { GitBranch, MessageCircle, Globe, Send } from 'lucide-react';

export default function Social() {
  const socialRef = useAutoContrast<HTMLDivElement>({
    targetContrast: 7.5,
    customImageUrl: 'src/assets/home-bg.jpg',
  });
  return (
    <SocialIcons ref={socialRef}>
      <SocialLink href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
        <GitBranch size={22} strokeWidth={1.5} />
      </SocialLink>
      <SocialLink href="https://twitter.com" target="_blank" rel="noreferrer" aria-label="Twitter">
        <MessageCircle size={22} strokeWidth={1.5} />
      </SocialLink>
      <SocialLink href="https://weibo.com" target="_blank" rel="noreferrer" aria-label="Weibo">
        <Globe size={22} strokeWidth={1.5} />
      </SocialLink>
      <SocialLink href="https://t.me/Anyaovo" target="_blank" rel="noreferrer" aria-label="Telegram">
        <Send size={22} strokeWidth={1.5} />
      </SocialLink>
    </SocialIcons>
  );
}

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

const SocialLink = styled.a`
  height: clamp(2rem, 4vh, 3rem);
  width: clamp(2rem, 4vh, 3rem);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 clamp(6px, 1.5vw, 12px);
  border-radius: 50%;
  font-size: clamp(1rem, 2vh, 1.5rem);
  /*color: var(--text-2);*/
  transition: color 0.3s ease;
  text-decoration: none;

  &:hover {
    color: var(--main-color);
  }
`;
