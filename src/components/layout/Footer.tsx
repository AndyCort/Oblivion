import styled from "styled-components";
import { useLocale } from "../../i18n/useLocale";
import { siteConfig } from "../../config/site";

export default function Footer() {
  const { siteName } = useLocale();
  return (
    <SiteFooter className="site-footer">
      <div className="footer-container">
        <p className="footer-text">
          © {siteConfig.copyright.startYear} ~ {new Date().getFullYear()} {siteName} · All Rights Reserved
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
              <span className="badge-part" style={{ background: badge.labelBg }}>
                {badge.label}
              </span>
              <a
                className="badge-link"
                href={badge.url as string}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span
                  className="badge-part"
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
const SiteFooter = styled.footer`
  text-align: center;
  margin: 0px;
  padding: 24px 0 40px;
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: var(--text-3);
  position: relative;
  z-index: 2;
  background: var(--main-bg);

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
    font-size: 0.875rem;
    color: var(--text-3);

    a {
      font-weight: 500;

      &:hover {
        text-decoration: underline;
      }
    }
  }

  .badges-wrapper {
    flex-wrap: nowrap;
    align-self: center;
    width: max-content;
    max-width: 100%;
    overflow-x: auto;
    white-space: nowrap;
    gap: 4px;
    display: flex;
    margin-top: 10px;
  }

  .badge-item {
    display: inline-flex;
    flex-shrink: 0;
    height: 20px;
    border-radius: 0px;
    overflow: hidden;
    font-size: 11px;
    font-family: HarmonyOS_Sans_SC_Regular, sans-serif;
    user-select: none;
    -webkit-user-select: none;
  }

  .badge-part {
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
    height: 20px;
    padding: 0 6px;
  }

  .badge-link {
    text-decoration: none;
  }
`;
