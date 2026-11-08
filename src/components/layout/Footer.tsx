import styled from "styled-components";
import { useLocale } from "../../i18n/useLocale";
import { siteConfig } from "../../config/site";

export default function Footer({
  transparent = false,
}: { transparent?: boolean } = {}) {
  const { siteName } = useLocale();
  return (
    <SiteFooter className="site-footer" $transparent={transparent}>
      <div className="footer-container">
        <p className="footer-text">
          © {siteConfig.copyright.startYear} ~ {new Date().getFullYear()}{" "}
          {siteName} · All Rights Reserved
        </p>
        <p className="footer-text">
          Powered by{" "}
          <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
            {siteConfig.copyright.owner}
          </a>
          {" & "}
          <a
            href="https://cloudflare.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Cloudflare
          </a>{" "}
          · Designed by{" "}
          <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
            {siteConfig.author.name}
          </a>
        </p>
        <div className="badges-wrapper">
          {siteConfig.badges.map((badge, index) => (
            <span className="badge-item" key={index}>
              <span
                className="badge-part"
                style={{ background: badge.labelBg, color: badge.labelColor }}
              >
                {badge.label}
              </span>
              <a
                href={badge.url as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  style={{
                    background: badge.valueBg,
                    color: badge.valueColor || "oklch(1 0 0)",
                  }}
                >
                  {badge.value}
                </span>
              </a>
            </span>
          ))}
        </div>
      </div>
    </SiteFooter>
  );
}

// Scoped Styled Root
const SiteFooter = styled.footer<{ $transparent?: boolean }>`
  text-align: center;
  margin: 0px;
  padding: 24px var(--safe-right) calc(40px + var(--safe-bottom)) var(--safe-left);
  height: auto;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: var(--text-3);
  position: relative;
  z-index: 2;
  background: ${(props) =>
    props.$transparent ? "transparent" : "var(--main-bg)"};

  .footer-container {
    width: var(--content-width);
    margin: 0 auto;
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    min-width: 0;
    border-radius: var(--card-radius);
    background: var(--footer-bg);
  }

  .footer-text {
    white-space: normal;
    margin: 5px 0;
    font-family: var(--content-font);
    font-size: var(--text-meta);
    color: var(--text-0);

    a {
      font-weight: var(--weight-regular);

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .badges-wrapper {
    flex-wrap: wrap;
    justify-content: center;
    align-self: center;
    width: max-content;
    max-width: 100%;
    gap: 4px;
    display: flex;
    margin-top: 10px;
  }

  .badge-item {
    display: inline-flex;
    min-width: 0;
    max-width: 100%;
    min-height: 1rem;
    overflow: hidden;
    font-size: var(--text-caption);
    font-family: var(--font-body);
    user-select: none;
    -webkit-user-select: none;
    span {
      display: flex;
      align-items: center;
      justify-content: center;
      line-height: var(--leading-ui);
      padding: 0.125em 0.5em;
      min-width: 0;
      overflow-wrap: anywhere;
    }
  }
`;
