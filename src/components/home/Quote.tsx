import { useEffect, useState } from "react";
import styled, { keyframes } from "styled-components";
import { useReducedMotion } from "framer-motion";
import { useLocale } from "../../i18n/useLocale";
import { siteConfig } from "../../config/site";
import { useCardStyle } from "../../stores/themeStore";
import { Quote as QuoteIcon, RefreshCw, SkipForward } from "lucide-react";

const QUOTE_API = "https://oiapi.net/api/Daily";

export default function Quote() {
  const { cardStyle } = useCardStyle();
  const { locale, t } = useLocale();
  const reduceMotion = useReducedMotion();
  const fallback = siteConfig.description[locale === "zh-CN" ? "zh" : "en"];
  const [quote, setQuote] = useState(fallback);
  const [displayedText, setDisplayedText] = useState(fallback);
  const [loading, setLoading] = useState(false);
  const [animate, setAnimate] = useState(false);
  const [requestId, setRequestId] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    let disposed = false;
    const timeout = setTimeout(() => controller.abort(), 6000);
    setQuote(fallback);
    setDisplayedText(fallback);
    setAnimate(false);
    setLoading(true);

    async function loadQuote() {
      try {
        const response = await fetch(QUOTE_API, { signal: controller.signal });
        if (!response.ok) throw new Error("Quote unavailable");
        const data = await response.json();
        const text = locale === "zh-CN" ? data?.data?.zh : data?.data?.en;
        if (typeof text !== "string" || !text.trim())
          throw new Error("Empty quote");
        if (!disposed) {
          setQuote(text.trim());
          setDisplayedText("");
          setAnimate(true);
        }
      } catch {
        // A local greeting keeps the hero readable when the quote service is unavailable.
      } finally {
        clearTimeout(timeout);
        if (!disposed) setLoading(false);
      }
    }

    void loadQuote();
    return () => {
      disposed = true;
      clearTimeout(timeout);
      controller.abort();
    };
  }, [locale, fallback, requestId]);

  const isTyping =
    animate && !reduceMotion && displayedText.length < quote.length;
  useEffect(() => {
    if (!isTyping) return;
    const timeout = setTimeout(
      () => setDisplayedText(quote.slice(0, displayedText.length + 1)),
      65,
    );
    return () => clearTimeout(timeout);
  }, [displayedText, quote, isTyping]);

  return (
    <QuoteBox data-card={cardStyle}>
      <QuoteIcon size={16} aria-hidden="true" className="quote-icon" />
      <div className="quote-copy">
        <span className="sr-only">{quote}</span>
        <div aria-hidden="true" className="quote-stage">
          <span className="quote-measure">{quote}</span>
          <span className={`quote-text${isTyping ? " animating" : ""}`}>
            {isTyping ? displayedText : quote}
          </span>
        </div>
      </div>
      <button
        type="button"
        className="quote-action"
        disabled={loading}
        aria-label={
          isTyping
            ? locale === "zh-CN"
              ? "显示完整句子"
              : "Show full quote"
            : t("quote.refresh")
        }
        title={
          isTyping
            ? locale === "zh-CN"
              ? "显示完整句子"
              : "Show full quote"
            : t("quote.refresh")
        }
        onClick={() =>
          isTyping ? setAnimate(false) : setRequestId((value) => value + 1)
        }
      >
        {isTyping ? (
          <SkipForward size={16} aria-hidden="true" />
        ) : (
          <RefreshCw size={16} aria-hidden="true" />
        )}
      </button>
    </QuoteBox>
  );
}

const quoteBlink = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
`;

const QuoteBox = styled.div`
  display: flex;
  align-items: center;
  gap: clamp(8px, 1.5vw, 16px);
  color: var(--text-1);
  width: 90%;
  max-width: 720px;
  border-radius: 50px;
  padding: 12px clamp(20px, 3vw, 32px);

  .quote-icon {
    flex-shrink: 0;
    transform: scaleX(-1);
  }
  .quote-copy {
    flex: 1;
    min-width: 0;
    font-family: var(--content-font);
    font-size: var(--text-reading);
    line-height: var(--leading-body);
    min-height: 1.4em;
    text-align: center;
    overflow-wrap: anywhere;
  }
  .quote-stage {
    display: grid;
  }
  .quote-stage > span {
    grid-area: 1 / 1;
  }
  .quote-measure {
    visibility: hidden;
  }
  .quote-text {
    align-self: center;
    &.animating::after {
      content: "|";
      margin-left: 2px;
      animation: ${quoteBlink} 1s infinite;
    }
  }
  .sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip-path: inset(50%);
    white-space: nowrap;
  }
  .quote-action {
    width: 24px;
    height: 24px;
    flex-shrink: 0;
    display: grid;
    place-items: center;
    border: 0;
    border-radius: 50%;
    background: transparent;
    color: inherit;
    cursor: pointer;
    transition: background-color 0.2s ease;
    &:hover:not(:disabled) {
      background: color-mix(in srgb, var(--text-1) 12%, transparent);
    }
    &:focus-visible {
      outline: 2px solid currentColor;
      outline-offset: 2px;
    }
    &:disabled {
      opacity: 0.45;
      cursor: wait;
    }
  }
  @media (max-width: 48rem) {
    width: calc(100% - 32px);
    padding: 10px 20px;
  }
  @media (prefers-reduced-motion: reduce) {
    .quote-text::after {
      animation: none;
    }
    .quote-action {
      transition: none;
    }
  }
`;
