import styled from "styled-components";
import { SiGithub, SiX, SiWhatsapp, SiTelegram } from "react-icons/si";
import { siteConfig } from "../../config/site";

export default function Social() {
  const iconSize = 20;
  const { social } = siteConfig;

  return (
    <SocialIcons className="social-icons">
      {social.github && (
        <a
          className="social-link"
          href={social.github}
          target="_blank"
          rel="noreferrer"
          aria-label="GitHub"
        >
          <SiGithub size={iconSize} />
        </a>
      )}
      {social.twitter && (
        <a
          className="social-link"
          href={social.twitter}
          target="_blank"
          rel="noreferrer"
          aria-label="X"
        >
          <SiX size={iconSize} />
        </a>
      )}
      {social.whatsapp && (
        <a
          className="social-link"
          href={social.whatsapp}
          target="_blank"
          rel="noreferrer"
          aria-label="WhatsApp"
        >
          <SiWhatsapp size={iconSize} />
        </a>
      )}
      {social.telegram && (
        <a
          className="social-link"
          href={social.telegram}
          target="_blank"
          rel="noreferrer"
          aria-label="Telegram"
        >
          <SiTelegram size={iconSize} />
        </a>
      )}
    </SocialIcons>
  );
}

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);

  .social-link {
    height: clamp(44px, 4vh, 48px);
    width: clamp(44px, 4vh, 48px);
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 50%;
    font-size: clamp(1rem, 2vh, 1.5rem);
    color: var(--text-1);
    transition: color 0.2s ease, background-color 0.2s ease;
    text-decoration: none;

    &:hover {
      color: var(--main-color);
      background: color-mix(in srgb, var(--main-color) 12%, transparent);
    }

    &:focus-visible {
      outline: 2px solid var(--main-color);
      outline-offset: 3px;
    }
  }
`;
