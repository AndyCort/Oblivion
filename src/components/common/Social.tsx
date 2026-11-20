import styled from "styled-components";
import { siteConfig } from "../../config/site";

function SocialIcon({ name, size = 20 }: { name: "github" | "x" | "whatsapp" | "telegram"; size?: number }) {
  switch (name) {
    case "github":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
        </svg>
      );
    case "x":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z" />
        </svg>
      );
    case "whatsapp":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.031 2c-5.516 0-9.969 4.453-9.969 9.969 0 1.766.469 3.484 1.344 5l-1.406 5.156 5.281-1.375c1.469.797 3.109 1.219 4.75 1.219 5.516 0 9.969-4.453 9.969-9.969S17.547 2 12.031 2zm5.813 14.125c-.25.703-1.438 1.344-2 1.422-.516.078-1.172.109-1.891-.125-.438-.141-1-.328-1.719-.641-3.031-1.313-5-4.375-5.156-4.578-.156-.203-1.234-1.641-1.234-3.125s.781-2.219 1.063-2.516c.281-.297.609-.375.813-.375h.578c.188 0 .438-.078.688.531.25.609.859 2.094.938 2.25s.125.344.016.547c-.109.203-.156.328-.313.5-.156.172-.328.391-.469.516-.156.156-.313.328-.141.641.172.313.781 1.281 1.672 2.078 1.156 1.031 2.125 1.344 2.438 1.5.313.156.484.125.672-.078.188-.203.766-.891.969-1.203.203-.313.406-.266.688-.156.281.109 1.781.844 2.094 1 .313.156.516.234.594.359.078.125.078.734-.172 1.438z" />
        </svg>
      );
    case "telegram":
      return (
        <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z" />
        </svg>
      );
  }
}

export default function Social() {
  const { social } = siteConfig;
  const links = [
    { href: social.github, label: "GitHub", icon: "github" as const },
    { href: social.twitter, label: "X", icon: "x" as const },
    { href: social.whatsapp, label: "WhatsApp", icon: "whatsapp" as const },
    { href: social.telegram, label: "Telegram", icon: "telegram" as const },
  ].filter((item): item is { href: string; label: string; icon: "github" | "x" | "whatsapp" | "telegram" } => Boolean(item.href));

  return (
    <SocialIcons className="social-icons">
      {links.map((item) => (
        <a
          key={item.icon}
          className="social-link"
          href={item.href}
          target="_blank"
          rel="noreferrer"
          aria-label={item.label}
        >
          <SocialIcon name={item.icon} />
        </a>
      ))}
    </SocialIcons>
  );
}

const SocialIcons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  .social-link {
    height: clamp(2rem, 4vh, 3rem);
    width: clamp(2rem, 4vh, 3rem);
    display: flex;
    justify-content: center;
    align-items: center;
    margin: 0 clamp(6px, 1.5vw, 12px);
    border-radius: 50%;
    font-size: clamp(1rem, 2vh, 1.5rem);
    color: var(--hero-foreground, var(--text-1));
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
