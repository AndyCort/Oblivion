import type { ReactNode } from "react";
import styled from "styled-components";
import { MapPin } from "lucide-react";
import { siteConfig } from "../../config/site";
import type { Moment } from "../../api/moments";

export const MomentCard = styled.article`
  --moment-muted: #b3b3b3;
  width: 100%;
  min-width: 0;
  padding: 20px;
  border: 1px solid #00000020;
  border-radius: 12px;
  background: #000000bb;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: none;
  color: #fff;
  overflow-wrap: anywhere;

  .moment-author {
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: var(--text-section);
    line-height: 1.3;
  }

  .moment-avatar {
    width: 36px;
    height: 36px;
    flex-shrink: 0;
    border-radius: 50%;
    object-fit: cover;
  }

  .moment-content {
    margin: 10px 0 5px;
    color: inherit;
    font-family: Georgia, "LXGW WenKai", serif;
    font-size: 0.9375rem;
    line-height: 1.625;
    letter-spacing: 0.025em;
    white-space: pre-wrap;
  }

  .moment-footer, .moment-stamp {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 8px;
    color: var(--moment-muted);
    font-size: var(--text-meta);
    line-height: var(--leading-ui);
  }

  .moment-footer {
    justify-content: space-between;
    gap: 4px 12px;
    margin-top: 10px;
  }

  .moment-location {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
    margin-left: -2px;
  }

  svg { flex-shrink: 0; }
`;

export function MomentAuthor({ mood, children }: { mood: string; children?: ReactNode }) {
  const { name, avatar } = siteConfig.author;
  return (
    <header className="moment-author">
      <img
        className="moment-avatar"
        src={avatar || "/favicon.png"}
        alt=""
        width={36}
        height={36}
        loading="lazy"
        onError={({ currentTarget }) => {
          if (currentTarget.getAttribute("src") !== "/favicon.png") currentTarget.src = "/favicon.png";
        }}
      />
      <span>{name}{mood && ` · ${mood}`}</span>
      {children}
    </header>
  );
}

export function MomentStamp({ location, date }: Pick<Moment, "location" | "date">) {
  return (
    <span className="moment-stamp">
      {location && (
        <>
          <span className="moment-location"><MapPin size={14} aria-hidden="true" /><span>{location}</span></span>
          <span aria-hidden="true">·</span>
        </>
      )}
      <time dateTime={date.replace(" ", "T")}>{date}</time>
    </span>
  );
}
