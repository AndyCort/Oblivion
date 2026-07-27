import React from 'react';
import styled from 'styled-components';

export default function Footer() {
  return (
    <SiteFooter>
      <FooterText>
        © 2001 ~ {new Date().getFullYear()} Oblivion. Designed by{' '}
        <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
          Anya
        </a>
        .
      </FooterText>
      <FooterText>All rights reserved.</FooterText>
      <FooterText>
        Powered by{' '}
        <a href="https://astro.build" target="_blank" rel="noopener noreferrer">
          Astro
        </a>
        .
      </FooterText>
    </SiteFooter>
  );
}

// Styled Components

const SiteFooter = styled.footer`
  text-align: center;
  margin: 0;
  border-top: var(--border);
  margin-top: -1px;
  padding: 20px 16px calc(20px + env(safe-area-inset-bottom, 0px));
`;

const FooterText = styled.p`
  white-space: normal;
  margin: 5px 0;
  font-family: var(--content-font);
  font-size: 1em;
  color: var(--text-3);
`;
