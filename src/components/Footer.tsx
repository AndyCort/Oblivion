import { useState, useEffect } from 'react'
import styled from 'styled-components'
import { API_BASE } from '../api/config'

const FooterWrapper = styled.footer`

  text-align: center;
  margin: 0;
  border-top: none;
  margin-top: -1px;
  padding: 20px 0;

  p {
    margin: 5px 0;
    font-family: var(--content-font);
    font-size: 1em;
  }


`

export default function Footer() {
  const [settings, setSettings] = useState({
    authorName: 'Anya',
    authorUrl: 'https://inpa.in'
  })

  useEffect(() => {
    // Fetch settings for footer text and author info
    fetch(`${API_BASE}/api/settings`)
      .then(res => res.json())
      .then(data => {
        if (data) {
          setSettings({
            authorName: data.authorName || settings.authorName,
            authorUrl: data.authorUrl || settings.authorUrl
          })
        }
      })
      .catch(() => { })

  }, [])

  return (
    <FooterWrapper>
      <p>© 2001 ~ {new Date().getFullYear()} Oblivion. Designed by{' '}<a href={settings.authorUrl} target="_blank" rel="noopener noreferrer">{settings.authorName}</a>.</p>
      <p>All rights reserved.</p>
    </FooterWrapper>
  )
}
