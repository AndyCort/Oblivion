import styled from 'styled-components'

const Icons = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`

const SocialLink = styled.div`
  height: clamp(2rem, 4vh, 3rem);
  width: clamp(2rem, 4vh, 3rem);
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 clamp(6px, 1.5vw, 12px);
  border-radius: 50%;

  a {
    font-size: clamp(1rem, 2vh, 1.5rem);

    color: var(--frame-color);
    transition: color 0.3s ease;
    text-decoration: none;

  }
`

export default function Social() {
  return (
    <Icons>
      <SocialLink data-glass-hover=""><a href="https://github.com" target="_blank" rel="noreferrer"><i className="fab fa-github fa-fw"></i></a></SocialLink>
      <SocialLink data-glass-hover=""><a href="https://twitter.com" target="_blank" rel="noreferrer"><i className="fab fa-twitter fa-fw"></i></a></SocialLink>
      <SocialLink data-glass-hover=""><a href="https://weibo.com" target="_blank" rel="noreferrer"><i className="fab fa-weibo fa-fw"></i></a></SocialLink>
      <SocialLink data-glass-hover=""><a href="https://t.me/Anyaovo" target="_blank" rel="noreferrer"><i className="fab fa-telegram fa-fw"></i></a></SocialLink>
    </Icons>
  )
}
