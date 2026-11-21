import type { ReactNode } from "react";
import styled from "styled-components";
import { MapPin } from "lucide-react";
import { siteConfig } from "../../config/site";
import type { Moment } from "../../api/moments";

export const MomentCard = styled.article`
  width: 100%;
  min-width: 0;
  padding: 20px;
  color: var(--text-1);
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
    font-family: var(--content-font);
    font-size: var(--text-body);
    line-height: var(--leading-body);
    white-space: pre-wrap;
  }

  .moment-footer {
    display: grid;
    gap: 4px;
    margin-top: 10px;
    color: var(--text-3);
    font-size: var(--text-meta);
    line-height: var(--leading-ui);
  }

  .moment-time-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
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

export function MomentAvatar({ size = 36 }: { size?: number }) {
  const { avatar } = siteConfig.author;
  return (
    <img
      className="moment-avatar"
      src={avatar || "/favicon.png"}
      alt=""
      width={size}
      height={size}
      loading="lazy"
      onError={({ currentTarget }) => {
        if (currentTarget.getAttribute("src") !== "/favicon.png") currentTarget.src = "/favicon.png";
      }}
    />
  );
}

export function MomentAuthor({ mood, children }: { mood: string; children?: ReactNode }) {
  return (
    <header className="moment-author">
      <MomentAvatar />
      <span>{siteConfig.author.name}{mood && ` · ${mood}`}</span>
      {children}
    </header>
  );
}

export function MomentLocation({ location }: Pick<Moment, "location">) {
  if (!location) return null;
  return (
    <span className="moment-location">
      <MapPin size={14} aria-hidden="true" />
      <span>{location}</span>
    </span>
  );
}

type MomentFooterProps = Pick<Moment, "location" | "date"> & {
  music?: ReactNode;
  children: ReactNode;
};

export function MomentFooter({ location, date, music, children }: MomentFooterProps) {
  return (
    <footer className="moment-footer">
      <MomentLocation location={location} />
      {music}
      <div className="moment-time-row">
        <time dateTime={date.replace(" ", "T")}>{date}</time>
        {children}
      </div>
    </footer>
  );
}
