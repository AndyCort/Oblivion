import styled from 'styled-components'
import { motion, useScroll, useSpring } from 'framer-motion'

const Bar = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 2px;
  background-color: #ff8d9f;
  z-index: 10000;
  transform-origin: left;
`

export default function ScrollingBar() {
    const { scrollYProgress } = useScroll()
    const scaleX = useSpring(scrollYProgress, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    return <Bar style={{ scaleX }} />
}
