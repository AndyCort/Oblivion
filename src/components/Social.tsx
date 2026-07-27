import React from 'react';
import styled from 'styled-components';

export default function Social() {
  return (
    <SocialIcons>
      <SocialLink href="https://github.com" target="_blank" rel="noreferrer">
        <i className="fab fa-github fa-fw"></i>
      </SocialLink>
      <SocialLink href="https://twitter.com" target="_blank" rel="noreferrer">
        <i className="fab fa-twitter fa-fw"></i>
      </SocialLink>
      <SocialLink href="https://weibo.com" target="_blank" rel="noreferrer">
        <i className="fab fa-weibo fa-fw"></i>
      </SocialLink>
      <SocialLink href="https://t.me/Anyaovo" target="_blank" rel="noreferrer">
        <i className="fab fa-telegram fa-fw"></i>
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
  color: var(--text-2);
  transition: color 0.3s ease;
  text-decoration: none;

  &:hover {
    color: var(--main-color);
  }
`;
