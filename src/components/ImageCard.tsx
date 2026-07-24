import styled from 'styled-components'

const Container = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`

const CardEl = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  background: #fff;
  box-shadow: none;
  border: 1px solid #ddd;
  transition: 0.5s;

  &:hover { height: 420px; }
`

const ImgBx = styled.div`
  position: relative;
  width: 100%;
  height: 260px;
  background: #555;

  &::before {
    content: "";
    position: absolute;
    bottom: -40px;
    width: 100%;
    height: 80px;
    border-radius: 40px;
    background: #fff;
  }

  &::after {
    content: '';
    position: relative;
    right: 0;
    bottom: 40px;
    width: 80px;
    height: 80px;
    background: #0f0;
    border-radius: 50%;
    box-shadow: 75px 70px 0 40px #fff;
  }
`

const Content = styled.div`
  position: relative;
  top: -40px;
  z-index: 10;
  padding: 0 30px;
  transition: 0.5s;
  h3 { font-size: 1.25em; }
`

export default function ImageCard() {
  return (
    <Container>
      <CardEl><ImgBx /><Content /></CardEl>
      <CardEl><ImgBx /><Content /></CardEl>
    </Container>
  )
}
