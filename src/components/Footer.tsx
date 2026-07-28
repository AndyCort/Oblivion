import React from 'react';
import styled from 'styled-components';

export default function Footer() {
  return (
    <SiteFooter>
      <FooterText>
        © 2001 ~ {new Date().getFullYear()} Oblivion · All Rights Reserved
      </FooterText>
      <FooterText>
        Powered by{' '}
        <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
          Oblivion
        </a>
        {' & '}
        <a href="https://cloudflare.com" target="_blank" rel="noopener noreferrer">
          Cloudflare
        </a> ·
        Designed by{' '}
        <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
          Anya
        </a>

      </FooterText>

    </SiteFooter>
  );
}

// Styled Components

const SiteFooter = styled.footer`
  text-align: center;
  margin: 0;
  border-top: 1px dashed var(--text-2);
  padding: 20px 16px 20px;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  background: url("https://w.wallhaven.cc/full/j5/wallhaven-j5g6ry.jpg") 25% 80% / cover no-repeat;
  position: relative;
  z-index: 10;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    height: 500px;
    margin-top: -300px; /* 向上延伸的高度差 (500 - 200 = 300) */
  }
`;

const FooterText = styled.p`
  white-space: normal;
  margin: 5px 0;
  font-family: var(--content-font);
  font-size: 0.875rem;
  color: var(--text-3);
`;
