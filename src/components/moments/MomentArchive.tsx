import { Fragment, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import styled from "styled-components";
import type { Moment } from "../../api/moments";
import { t, type Locale } from "../../i18n/utils";

interface Props {
  moments: Moment[];
  locale: Locale;
  children: (moment: Moment, index: number) => ReactNode;
}

function groupByMonth(moments: Moment[]) {
  const groups = new Map<string, { key: string; start: number; entries: Moment[] }>();
  moments.forEach((moment, index) => {
    const key = moment.date.slice(0, 7);
    const group = groups.get(key);
    if (group) group.entries.push(moment);
    else groups.set(key, { key, start: index, entries: [moment] });
  });
  return Array.from(groups.values());
}

export default function MomentArchive({ moments, locale, children }: Props) {
  const groups = useMemo(() => groupByMonth(moments), [moments]);
  const [activeId, setActiveId] = useState("");
  const timeline = useRef<HTMLDivElement>(null);
  const jumpedToHash = useRef(false);
  const month = locale === "zh-CN" ? "numeric" : "long";
  const monthName = new Intl.DateTimeFormat(locale, { month, timeZone: "UTC" });
  const monthYear = new Intl.DateTimeFormat(locale, { month, year: "numeric", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const countLabel = (count: number) =>
    t(count === 1 ? "moments.countOne" : "moments.countOther", locale, { count });

  useEffect(() => {
    const sections = Array.from(timeline.current?.querySelectorAll<HTMLElement>("section[id]") ?? []);
    if (!sections.length) return;

    if (!jumpedToHash.current) {
      jumpedToHash.current = true;
      sections.find(section => `#${section.id}` === window.location.hash)?.scrollIntoView({ behavior: "instant" });
    }

    let frame = 0;
    const update = () => {
      frame = 0;
      let active = sections[0];
      if (window.scrollY > 0 && window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 1) {
        active = sections[sections.length - 1];
      } else {
        for (const section of sections) {
          if (section.getBoundingClientRect().top > 90) break;
          active = section;
        }
      }
      setActiveId(active.id);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, [groups]);

  return (
    <Archive>
      <nav className="month-nav" aria-label={t("moments.monthArchive", locale)}>
        {groups.map(({ key, entries }, index) => {
          const year = key.slice(0, 4);
          const date = new Date(`${key}-01T00:00:00Z`);
          return (
            <Fragment key={key}>
              {year !== groups[index - 1]?.key.slice(0, 4) && <h2>{year}</h2>}
              <a href={`#month-${key}`} aria-current={activeId === `month-${key}` ? "location" : undefined}>
                <span>{monthName.format(date)}</span>
                <span className="month-count">{entries.length}</span>
              </a>
            </Fragment>
          );
        })}
      </nav>
      <div className="moment-timeline" ref={timeline}>
        {groups.map(({ key, start, entries }) => (
          <section key={key} id={`month-${key}`}>
            <h2 className="month-heading">
              {monthYear.format(new Date(`${key}-01T00:00:00Z`))}
              <span className="month-count">{countLabel(entries.length)}</span>
            </h2>
            <ol>
              {entries.map((moment, index) => {
                const day = moment.date.slice(0, 10);
                const firstOfDay = day !== entries[index - 1]?.date.slice(0, 10);
                return (
                  <li key={moment.id} className={firstOfDay ? "day-start" : undefined}>
                    {firstOfDay && (
                      <time className="moment-day" dateTime={day}>
                        <span className="day-num">{day.slice(8)}</span>
                        <span className="day-meta">{weekday.format(new Date(`${day}T00:00:00Z`))}</span>
                      </time>
                    )}
                    {children(moment, start + index)}
                  </li>
                );
              })}
            </ol>
          </section>
        ))}
      </div>
    </Archive>
  );
}

const Archive = styled.div`
  .month-nav { display: none; }
  .moment-timeline { display: grid; gap: 36px; min-width: 0; }
  section { min-width: 0; scroll-margin-top: 86px; }
  ol { display: grid; gap: 16px; list-style: none; margin: 0; padding: 0; grid-template-columns: minmax(0, 1fr); }
  li.day-start:not(:first-child) { margin-top: 8px; }

  .month-heading {
    display: flex;
    align-items: baseline;
    justify-content: space-between;
    gap: 12px;
    margin-bottom: 14px;
    padding-bottom: 8px;
    border-bottom: 1px solid color-mix(in srgb, var(--text-2) 20%, transparent);
    color: var(--text-1);
    font-family: var(--title-font);
    font-size: var(--text-section);
  }
  .month-count {
    color: var(--text-3);
    font-family: var(--content-font);
    font-size: var(--text-caption);
    font-weight: var(--weight-regular);
    font-variant-numeric: tabular-nums;
  }

  .moment-day {
    display: flex;
    align-items: baseline;
    gap: 8px;
    margin: 0 0 8px 4px;
    line-height: 1;
  }
  .day-num {
    color: var(--main-color);
    font-family: var(--title-font);
    font-size: 1.75rem;
    font-weight: var(--weight-strong);
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.02em;
  }
  .day-meta {
    color: var(--text-2);
    font-size: var(--text-caption);
  }

  @media (min-width: 62.5rem) {
    display: grid;
    grid-template-columns: minmax(8rem, 1fr) minmax(0, 45.5rem);
    gap: 112px;
    align-items: start;

    .month-heading {
      position: absolute;
      width: 1px;
      height: 1px;
      min-width: 0;
      padding: 0;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }

    .month-nav {
      display: block;
      position: sticky;
      top: 86px;
      max-height: calc(100svh - 106px);
      overflow-y: auto;
      padding-left: 2px;
      border-left: 1px solid color-mix(in srgb, var(--text-2) 20%, transparent);
    }
    .month-nav h2 {
      margin: 0 14px 6px;
      color: var(--text-1);
      font-family: var(--title-font);
      font-size: var(--text-section);
    }
    .month-nav a + h2 { margin-top: 18px; }
    .month-nav a {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      min-height: 40px;
      padding: 4px 14px;
      border-radius: 0 9px 9px 0;
      color: var(--text-2);
      transition: color 0.2s ease, background-color 0.2s ease;
    }
    .month-nav a::before {
      content: "";
      position: absolute;
      left: -3px;
      top: 10px;
      bottom: 10px;
      width: 3px;
      border-radius: 3px;
      background: transparent;
      transition: background-color 0.2s ease;
    }
    .month-nav a:hover { color: var(--text-1); background: color-mix(in srgb, var(--main-color) 6%, transparent); }
    .month-nav a[aria-current] { color: var(--main-color); font-weight: var(--weight-strong); }
    .month-nav a[aria-current]::before { background: var(--main-color); }
    .month-nav a:focus-visible { outline: 2px solid var(--main-color); outline-offset: -2px; }

    .moment-timeline { gap: 16px; }
    .moment-timeline, li { position: relative; }
    .moment-timeline::before {
      content: "";
      position: absolute;
      left: -24px;
      top: 28px;
      bottom: 0;
      width: 1px;
      background: linear-gradient(
        color-mix(in srgb, var(--text-2) 36%, transparent) 85%,
        transparent
      );
    }
    li::before {
      content: "";
      position: absolute;
      left: -27px;
      top: 26px;
      width: 7px;
      height: 7px;
      border-radius: 50%;
      background: color-mix(in srgb, var(--text-2) 50%, var(--bg-0));
    }
    li.day-start::before {
      left: -30px;
      top: 23px;
      width: 13px;
      height: 13px;
      box-sizing: border-box;
      border: 3px solid var(--bg-0);
      background: var(--main-color);
      box-shadow: 0 0 0 1px var(--main-color);
    }
    li.day-start:not(:first-child) { margin-top: 12px; }

    .moment-day {
      position: absolute;
      right: calc(100% + 46px);
      top: 14px;
      flex-direction: column;
      align-items: flex-end;
      gap: 6px;
      margin: 0;
    }
    .day-num { font-size: 2rem; }
  }
`;
