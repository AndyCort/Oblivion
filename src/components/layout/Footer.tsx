import styled from "styled-components";

type BadgeData = {
  label?: string;
  labelBg?: string;
  value?: string;
  valueBg?: string;
  valueColor?: string;
  url?: string;
};

// 深色标签搭配浅色内容底，避免高亮底色上的白字难以辨认。
const badgesData: BadgeData[] = [
  {
    label: "野ICP备",
    labelBg: "oklch(0.6 0 0)",
    value: "1145141919810号",
    valueBg: "oklch(0.95 0.045 156)",
    valueColor: "oklch(0.4 0.09 152)",
    url: "/",
  },
  {
    label: "Theme",
    labelBg: "oklch(0.6 0 0)",
    value: "Oblivion",
    valueBg: "oklch(0.95 0.03 12.6)",
    valueColor: "oklch(41.03% 0.1502 10.3)",
    url: "/",
  },
  {
    label: "Frame",
    labelBg: "oklch(0.6 0 0)",
    value: "React",
    valueBg: "oklch(0.956262 0.044329 203.388)",
    valueColor: "oklch(0.398206 0.06641 227.392)",
    url: "https://react.dev/",
  },
  {
    label: "CDN",
    labelBg: "oklch(0.6 0 0)",
    value: "Cloudflare",
    valueBg: "oklch(0.95 0.16 73)",
    valueColor: "oklch(0.490423 0.148682 37.432)",
    url: "https://www.cloudflare.com",
  },
  {
    label: "Copyright",
    labelBg: "oklch(0.6 0 0)",
    value: "BY-NC-SA 4.0",
    valueBg: "oklch(0.943348 0.028406 294.588)",
    valueColor: "oklch(0.379642 0.178305 293.745)",
    url: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
  },
];

export default function Footer() {
  return (
    <SiteFooter>
      <FooterContainer>
        <FooterText>
          © 2001 ~ {new Date().getFullYear()} Oblivion · All Rights Reserved
        </FooterText>
        <FooterText>
          Powered by{" "}
          <a href="https://inpa.in" target="_blank" rel="noopener noreferrer">
            Oblivion
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
            Anya
          </a>
        </FooterText>
        <BadgesWrapper>
          {badgesData.map((badge, index) => {
            return (
              <BadgeItem key={index}>
                <BadgePart $bg={badge.labelBg as string}>{badge.label}</BadgePart>
                <BadgeLink
                  href={badge.url as string}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <BadgePart
                    $bg={badge.valueBg as string}
                    $color={badge.valueColor}
                  >
                    {badge.value}
                  </BadgePart>
                </BadgeLink>
              </BadgeItem>
            );
          })}
        </BadgesWrapper>
      </FooterContainer>
    </SiteFooter>
  );
}

// Styled Components

const SiteFooter = styled.footer`
  text-align: center;
  margin: 0px;
  padding: 24px 0 40px;
  height: auto;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  color: var(--text-3); /* 页脚版权等辅助信息。品牌徽章保留其独立配色。 */
  position: relative;
  z-index: 1;
  background: var(--main-bg);
`;

const FooterContainer = styled.div`
  width: var(--content-width);
  margin: 0 auto;
  padding: 32px 20px;
  display: flex;
  flex-direction: column;
  min-width: 0;
  border-radius: var(--card-radius);
  background: var(--footer-bg);
`;

const FooterText = styled.p`
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
`;

const BadgesWrapper = styled.div`
  flex-wrap: nowrap;
  align-self: center;
  width: max-content;
  max-width: 100%;
  overflow-x: auto;
  white-space: nowrap;
  gap: 4px;
  display: flex;
  margin-top: 10px;
`;

const BadgeItem = styled.span`
  display: inline-flex;
  flex-shrink: 0;
  height: 20px;
  border-radius: 0px;
  overflow: hidden;
  font-size: 11px;
  font-family: HarmonyOS_Sans_SC_Regular, sans-serif;
  user-select: none;
  -webkit-user-select: none;
`;

const BadgePart = styled.span<{
  $bg: string;
  $color?: string;
  $isBlock?: boolean;
}>`
  background: ${(props) => props.$bg};
  color: ${(props) => props.$color || "oklch(1 0 0)"};
  display: ${(props) => (props.$isBlock ? "block" : "flex")};
  align-items: center;
  justify-content: center;
  line-height: 1;
  height: 20px;
  padding: 0 6px;
`;

const BadgeLink = styled.a`
  text-decoration: none;
`;
