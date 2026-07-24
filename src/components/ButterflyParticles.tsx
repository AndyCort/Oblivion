// @ts-nocheck
import { useRef, useMemo, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { EffectComposer, Bloom } from '@react-three/postprocessing'
import * as THREE from 'three'
import styled from 'styled-components'
import { useTheme } from '../stores/ThemeContext'

const ButterflyCanvasContainer = styled.div`
  display: flex;
  width: 100vw;
  height: 100vh;
  pointer-events: none;
`

/* ═══════════════════════════════════════════════════════════════════
   GLSL — Main Butterfly Vertex Shader
   ═══════════════════════════════════════════════════════════════════ */
const vertexShader = /* glsl */ `
  uniform float uTime;
  uniform float uPointSize;
  uniform vec3  uMouse;      // normalised mouse in world space
  uniform float uMouseInfluence;

  attribute float aPhase;
  attribute float aIsWing;
  attribute float aBaseZ;
  attribute float aRandom;   // per-particle random [0,1]

  varying vec3  vColor;
  varying float vOpacity;
  varying float vIsWing;
  varying float vDistFromCenter;

  // ── HSL → RGB helper (for iridescent shift) ──
  vec3 hsl2rgb(float h, float s, float l) {
    float c = (1.0 - abs(2.0 * l - 1.0)) * s;
    float x = c * (1.0 - abs(mod(h * 6.0, 2.0) - 1.0));
    float m = l - c * 0.5;
    vec3 rgb;
    float hh = h * 6.0;
    if      (hh < 1.0) rgb = vec3(c, x, 0.0);
    else if (hh < 2.0) rgb = vec3(x, c, 0.0);
    else if (hh < 3.0) rgb = vec3(0.0, c, x);
    else if (hh < 4.0) rgb = vec3(0.0, x, c);
    else if (hh < 5.0) rgb = vec3(x, 0.0, c);
    else               rgb = vec3(c, 0.0, x);
    return rgb + m;
  }

  void main() {
    vec3 pos = position;
    float x = pos.x;

    if (aIsWing > 0.5) {
      // ── Wing flap ──
      float flapIntensity = abs(x) * 0.6;
      float flapSine = sin(uTime * 1.5);
      float foldedness = (flapSine + 1.0) * 0.5;

      // Multi-frequency shimmer for organic feel
      float shimmer = sin(uTime * 2.0 + aPhase) * 0.05
                    + sin(uTime * 4.5 + aPhase * 2.3) * 0.015;
      pos.z = aBaseZ + foldedness * flapIntensity + shimmer;

      // ── Iridescent color shift ──
      // Hue shifts based on position + time → rainbow oil-slick effect
      float distFromBody = length(vec2(pos.x, pos.y));
      float hueShift = sin(distFromBody * 0.8 + uTime * 0.4 + aPhase * 0.3) * 0.08;
      float baseHue = 0.75 + aRandom * 0.15 + hueShift;
      float sat = 0.85;
      float lit = 0.55 + 0.15 * sin(uTime * 1.2 + aPhase);
      // Blend iridescent color with vertex base color
      vec3 iridescentCol = hsl2rgb(fract(baseHue), sat, lit);
      vColor = mix(color, iridescentCol, 0.55);

      vDistFromCenter = distFromBody;
    } else {
      // ── Body / legs / antennae ──
      pos.z = aBaseZ + sin(uTime * 1.5 + aPhase) * 0.02;
      vColor = color;
      vDistFromCenter = 0.0;
    }

    // ── Mouse interaction: gentle repulsion / attraction ──
    if (uMouseInfluence > 0.01) {
      vec3 toMouse = uMouse - pos;
      float mouseDist = length(toMouse);
      float influence = smoothstep(4.0, 0.5, mouseDist) * uMouseInfluence;
      // Particles gently drift away from cursor
      pos -= normalize(toMouse) * influence * 0.3;
      // Slight Z lift near cursor for 3D pop
      pos.z += influence * 0.5;
    }

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);

    // ── Dynamic point size with pulsation ──
    float sizePulse = 1.0 + 0.15 * sin(uTime * 2.5 + aPhase);
    gl_PointSize = uPointSize * sizePulse * (300.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // ── Opacity: wing shimmer, body solid ──
    vOpacity = aIsWing > 0.5
      ? 0.7 + 0.3 * sin(uTime * 3.0 + aPhase)
      : 1.0;
    vIsWing = aIsWing;
  }
`

/* ═══════════════════════════════════════════════════════════════════
   GLSL — Main Butterfly Fragment Shader
   ═══════════════════════════════════════════════════════════════════ */
const fragmentShader = /* glsl */ `
  uniform float uOpacity;
  uniform float uUseAdditiveGlow;
  uniform float uTime;

  varying vec3  vColor;
  varying float vOpacity;
  varying float vIsWing;
  varying float vDistFromCenter;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // ── Multi-layer glow ──
    float outerGlow = 1.0 - smoothstep(0.0, 0.5, dist);
    float innerCore = exp(-dist * dist * 20.0);
    float midRing   = exp(-dist * dist * 8.0) * 0.4;

    // Wing particles get extra ethereal glow
    float wingGlow = vIsWing > 0.5 ? innerCore * 0.3 : 0.0;
    float combinedAlpha = outerGlow + midRing + wingGlow;
    combinedAlpha = mix(combinedAlpha, combinedAlpha + innerCore * 0.5, uUseAdditiveGlow);

    // ── Slight color boost at core ──
    vec3 finalColor = vColor + vec3(innerCore * 0.15);

    gl_FragColor = vec4(finalColor, combinedAlpha * uOpacity * vOpacity);
  }
`

/* ═══════════════════════════════════════════════════════════════════
   GLSL — Sparkle Dust Vertex Shader (ambient floating particles)
   ═══════════════════════════════════════════════════════════════════ */
const dustVertexShader = /* glsl */ `
  uniform float uTime;

  attribute float aPhase;
  attribute float aSpeed;
  attribute float aSize;

  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    vec3 pos = position;

    // Gentle floating motion: each particle orbits slowly
    float t = uTime * aSpeed;
    pos.x += sin(t + aPhase) * 1.5;
    pos.y += cos(t * 0.7 + aPhase * 1.3) * 1.2;
    pos.z += sin(t * 0.5 + aPhase * 0.8) * 0.8;

    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
    gl_PointSize = aSize * (200.0 / -mvPosition.z);
    gl_Position = projectionMatrix * mvPosition;

    // Twinkle: fade in/out
    vAlpha = 0.3 + 0.7 * pow(sin(t * 2.0 + aPhase) * 0.5 + 0.5, 2.0);
    vColor = color;
  }
`

/* ═══════════════════════════════════════════════════════════════════
   GLSL — Sparkle Dust Fragment Shader
   ═══════════════════════════════════════════════════════════════════ */
const dustFragmentShader = /* glsl */ `
  varying float vAlpha;
  varying vec3  vColor;

  void main() {
    float dist = length(gl_PointCoord - vec2(0.5));
    if (dist > 0.5) discard;

    // Very soft star-like glow
    float glow = exp(-dist * dist * 24.0);
    float ring = exp(-pow(dist - 0.2, 2.0) * 60.0) * 0.3;

    gl_FragColor = vec4(vColor, (glow + ring) * vAlpha);
  }
`

/* ═══════════════════════════════════════════════════════════════════
   Butterfly Shape Generator
   ═══════════════════════════════════════════════════════════════════ */
function generateButterfly(particleCount: number) {
  const pos = new Float32Array(particleCount * 3)
  const phs = new Float32Array(particleCount)
  const isW = new Float32Array(particleCount)
  const bZ  = new Float32Array(particleCount)
  const rnd = new Float32Array(particleCount)

  let idx = 0
  function addPoint(x: number, y: number, z: number, flag: number) {
    pos[idx * 3]     = x
    pos[idx * 3 + 1] = y
    pos[idx * 3 + 2] = z
    phs[idx] = Math.random() * Math.PI * 2
    isW[idx] = flag
    bZ[idx]  = z
    rnd[idx] = Math.random()
    idx++
  }

  // 1. Wings (10000 points)
  for (let i = 0; i < 10000; i++) {
    const t = Math.random() * Math.PI * 24
    let x = Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))
    let y = Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))
    x *= 2.0
    y *= 2.0
    y += 0.5

    const scatterRange = 0.4
    const angle = Math.random() * Math.PI * 2
    const scatter = Math.random() * scatterRange
    x += Math.cos(angle) * scatter
    y += Math.sin(angle) * scatter
    const z = (Math.random() - 0.5) * 0.2

    addPoint(x, y, z, 1)
  }

  // 2. Wing vein lines (1500 points — structural detail)
  for (let vein = 0; vein < 8; vein++) {
    const veinAngle = (vein / 8) * Math.PI * 2
    const veinLength = 3.0 + Math.random() * 1.5
    const isRight = vein < 4
    for (let i = 0; i < Math.floor(1500 / 8); i++) {
      const t = Math.random()
      const r = t * veinLength
      const spread = 0.08
      const vx = (isRight ? 1 : -1) * r * Math.cos(veinAngle + Math.sin(t * 2) * 0.3)
      const vy = r * Math.sin(veinAngle + Math.sin(t * 2) * 0.3) + 0.5
      const vz = (Math.random() - 0.5) * 0.05
      addPoint(
        vx + (Math.random() - 0.5) * spread,
        vy + (Math.random() - 0.5) * spread,
        vz,
        1
      )
    }
  }

  // 3. Wing edge highlights (1000 points — brighter edge particles)
  for (let i = 0; i < 1000; i++) {
    const t = Math.random() * Math.PI * 24
    let x = Math.sin(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))
    let y = Math.cos(t) * (Math.exp(Math.cos(t)) - 2 * Math.cos(4 * t) - Math.pow(Math.sin(t / 12), 5))
    x *= 2.15  // Slightly further out than main wing
    y *= 2.15
    y += 0.5
    const z = (Math.random() - 0.5) * 0.1
    addPoint(x, y, z, 1)
  }

  // 4. Body: Thorax and Abdomen (1500 points)
  for (let i = 0; i < 1500; i++) {
    const y = (Math.random() * 4.0) - 2.0
    const radius = 0.3 * Math.sin(((y + 2.0) / 4.0) * Math.PI)
    const angle = Math.random() * Math.PI * 2
    const rT = Math.random() * radius
    const x = Math.cos(angle) * rT
    const z = Math.sin(angle) * rT
    addPoint(x, y, z, 0)
  }

  // 5. Head (400 points)
  for (let i = 0; i < 400; i++) {
    const radius = 0.35
    const u = Math.random()
    const v = Math.random()
    const theta = u * 2.0 * Math.PI
    const phi = Math.acos(2.0 * v - 1.0)
    const rT = Math.cbrt(Math.random()) * radius
    const x = rT * Math.sin(phi) * Math.cos(theta)
    const y = 2.2 + rT * Math.sin(phi) * Math.sin(theta)
    const z = rT * Math.cos(phi)
    addPoint(x, y, z, 0)
  }

  // 6. Antennae (500 points)
  for (let i = 0; i < 500; i++) {
    const isRight = i % 2 === 0
    const t = Math.random()
    const sign = isRight ? 1 : -1
    const x = sign * (t * 1.5 + Math.sin(t * Math.PI) * 0.5)
    const y = 2.4 + t * 2.0
    const z = 0.2 + t * 0.8 - Math.pow(t, 2) * 0.4
    const sc = 0.04
    addPoint(
      x + (Math.random() - 0.5) * sc,
      y + (Math.random() - 0.5) * sc,
      z + (Math.random() - 0.5) * sc,
      0
    )
  }

  // 7. Antennae tips glow (100 points — bright tips)
  for (let side = 0; side < 2; side++) {
    const sign = side === 0 ? 1 : -1
    for (let i = 0; i < 50; i++) {
      const t = 0.85 + Math.random() * 0.15
      const x = sign * (t * 1.5 + Math.sin(t * Math.PI) * 0.5)
      const y = 2.4 + t * 2.0
      const z = 0.2 + t * 0.8 - Math.pow(t, 2) * 0.4
      const sc = 0.12
      addPoint(
        x + (Math.random() - 0.5) * sc,
        y + (Math.random() - 0.5) * sc,
        z + (Math.random() - 0.5) * sc,
        0
      )
    }
  }

  // 8. Legs (900 points, 6 legs)
  const legBases = [
    { x: -0.2, y: 1.0 }, { x: -0.2, y: 0.0 }, { x: -0.2, y: -1.0 },
    { x: 0.2, y: 1.0 },  { x: 0.2, y: 0.0 },  { x: 0.2, y: -1.0 },
  ]
  const perLeg = Math.floor(900 / 6)
  for (let leg = 0; leg < 6; leg++) {
    const base = legBases[leg]
    const signX = base.x > 0 ? 1 : -1
    for (let i = 0; i < perLeg; i++) {
      const t = Math.random()
      const outX = signX * (0.2 + t * 1.5)
      const outY = base.y + base.y * t * 0.5
      const outZ = Math.sin(t * Math.PI) * 0.8 - t * 2.5
      const sc = 0.05
      addPoint(
        outX + (Math.random() - 0.5) * sc,
        outY + (Math.random() - 0.5) * sc,
        outZ + (Math.random() - 0.5) * sc,
        0
      )
    }
  }

  return { positions: pos, phases: phs, isWing: isW, baseZ: bZ, randoms: rnd, count: idx }
}

/* ═══════════════════════════════════════════════════════════════════
   Sparkle Dust Generator (ambient floating particles)
   ═══════════════════════════════════════════════════════════════════ */
const DUST_COUNT = 400

function generateDust() {
  const pos   = new Float32Array(DUST_COUNT * 3)
  const phs   = new Float32Array(DUST_COUNT)
  const spd   = new Float32Array(DUST_COUNT)
  const sizes = new Float32Array(DUST_COUNT)
  const col   = new Float32Array(DUST_COUNT * 3)

  for (let i = 0; i < DUST_COUNT; i++) {
    // Spread dust in a wide area around the butterfly
    pos[i * 3]     = (Math.random() - 0.5) * 25
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18
    pos[i * 3 + 2] = (Math.random() - 0.5) * 10

    phs[i]   = Math.random() * Math.PI * 2
    spd[i]   = 0.15 + Math.random() * 0.35
    sizes[i] = 0.03 + Math.random() * 0.08

    // Soft pastel colors (purple, pink, cyan, white mix)
    const hue = 0.65 + Math.random() * 0.35 // blue-purple-pink range
    const c = new THREE.Color().setHSL(hue, 0.6 + Math.random() * 0.3, 0.7 + Math.random() * 0.25)
    col[i * 3]     = c.r
    col[i * 3 + 1] = c.g
    col[i * 3 + 2] = c.b
  }

  return { positions: pos, phases: phs, speeds: spd, sizes, colors: col }
}

/* ═══════════════════════════════════════════════════════════════════
   Color Generator
   ═══════════════════════════════════════════════════════════════════ */
function generateColors(theme: string, counts: {
  wings: number; veins: number; edges: number;
  body: number; head: number; antennae: number; antennaeTips: number; legs: number
}) {
  const total = Object.values(counts).reduce((a, b) => a + b, 0)
  const col = new Float32Array(total * 3)
  const isDark = theme === 'dark'
  let idx = 0

  function addColor(r: number, g: number, b: number) {
    col[idx * 3]     = r
    col[idx * 3 + 1] = g
    col[idx * 3 + 2] = b
    idx++
  }

  // Wings — rich purple-violet with subtle variation
  for (let i = 0; i < counts.wings; i++) {
    const lightness = isDark ? 0.55 + Math.random() * 0.25 : 0.35 + Math.random() * 0.15
    const hue = 0.73 + Math.random() * 0.17
    const c = new THREE.Color().setHSL(hue, isDark ? 0.85 : 0.9, lightness)
    addColor(c.r, c.g, c.b)
  }
  // Veins — slightly brighter
  for (let i = 0; i < counts.veins; i++) {
    const c = new THREE.Color().setHSL(
      0.78 + Math.random() * 0.1,
      isDark ? 0.9 : 0.95,
      isDark ? 0.7 : 0.4
    )
    addColor(c.r, c.g, c.b)
  }
  // Edge highlights — bright and luminous
  for (let i = 0; i < counts.edges; i++) {
    const c = new THREE.Color().setHSL(
      0.8 + Math.random() * 0.15,
      0.9,
      isDark ? 0.75 : 0.5
    )
    addColor(c.r, c.g, c.b)
  }
  // Body
  for (let i = 0; i < counts.body; i++) {
    const c = new THREE.Color().setHSL(0.75, 0.4, isDark ? 0.15 + Math.random() * 0.1 : 0.2 + Math.random() * 0.1)
    addColor(c.r, c.g, c.b)
  }
  // Head
  for (let i = 0; i < counts.head; i++) {
    const c = new THREE.Color().setHSL(0.75, 0.5, isDark ? 0.2 : 0.15)
    addColor(c.r, c.g, c.b)
  }
  // Antennae
  for (let i = 0; i < counts.antennae; i++) {
    const c = new THREE.Color().setHSL(0.75, 0.8, isDark ? 0.8 : 0.3)
    addColor(c.r, c.g, c.b)
  }
  // Antennae tips — bright glow
  for (let i = 0; i < counts.antennaeTips; i++) {
    const c = new THREE.Color().setHSL(
      0.83 + Math.random() * 0.1,
      0.95,
      isDark ? 0.85 : 0.55
    )
    addColor(c.r, c.g, c.b)
  }
  // Legs
  for (let i = 0; i < counts.legs; i++) {
    const c = new THREE.Color().setHSL(0.75, 0.3, isDark ? 0.15 + Math.random() * 0.1 : 0.2 + Math.random() * 0.1)
    addColor(c.r, c.g, c.b)
  }

  return col
}

/* ═══════════════════════════════════════════════════════════════════
   Sparkle Dust Component (ambient floating particles)
   ═══════════════════════════════════════════════════════════════════ */
function SparkleDust({ theme }: { theme: string }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const { positions, phases, speeds, sizes, colors } = useMemo(() => generateDust(), [])

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime
    }
  })

  const isDark = theme === 'dark'

  const shaderArgs = useMemo(() => ({
    vertexShader: dustVertexShader,
    fragmentShader: dustFragmentShader,
    uniforms: { uTime: { value: 0 } },
    vertexColors: true,
    transparent: true,
    blending: isDark ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: false,
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <points>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={DUST_COUNT} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={DUST_COUNT} array={colors}    itemSize={3} />
        <bufferAttribute attach="attributes-aPhase"   count={DUST_COUNT} array={phases}    itemSize={1} />
        <bufferAttribute attach="attributes-aSpeed"   count={DUST_COUNT} array={speeds}    itemSize={1} />
        <bufferAttribute attach="attributes-aSize"    count={DUST_COUNT} array={sizes}     itemSize={1} />
      </bufferGeometry>
      <shaderMaterial ref={materialRef} attach="material" args={[shaderArgs]} />
    </points>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Main Butterfly Particles
   ═══════════════════════════════════════════════════════════════════ */
const PARTICLE_COUNT = 15900
const PART_COUNTS = {
  wings: 10000, veins: 1500, edges: 1000,
  body: 1500, head: 400, antennae: 500, antennaeTips: 100, legs: 900,
}

function Particles({ theme }: { theme: string }) {
  const pointsRef = useRef<THREE.Points>(null)
  const materialRef = useRef<THREE.ShaderMaterial>(null)
  const mouseWorld = useRef(new THREE.Vector3(0, 100, 0)) // offscreen default

  const { positions, phases, isWing, baseZ, randoms } = useMemo(
    () => generateButterfly(PARTICLE_COUNT), []
  )
  const colors = useMemo(
    () => generateColors(theme, PART_COUNTS), [theme]
  )

  // Update color buffer on theme change
  useEffect(() => {
    if (pointsRef.current) {
      const colorAttr = pointsRef.current.geometry.getAttribute('color') as THREE.BufferAttribute
      colorAttr.array.set(colors)
      colorAttr.needsUpdate = true
    }
  }, [colors])

  // Theme-dependent uniforms
  useEffect(() => {
    if (materialRef.current) {
      const u = materialRef.current.uniforms
      u.uPointSize.value = theme === 'dark' ? 0.08 : 0.15
      u.uOpacity.value = theme === 'dark' ? 0.8 : 0.9
      u.uUseAdditiveGlow.value = theme === 'dark' ? 1.0 : 0.0
      materialRef.current.blending = theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending
      materialRef.current.depthWrite = theme === 'light'
      materialRef.current.needsUpdate = true
    }
  }, [theme])

  useFrame((state) => {
    const time = state.clock.elapsedTime

    if (materialRef.current) {
      const u = materialRef.current.uniforms
      u.uTime.value = time
      u.uMouse.value.copy(mouseWorld.current)
      // Smooth mouse influence
      u.uMouseInfluence.value = THREE.MathUtils.lerp(
        u.uMouseInfluence.value, mouseWorld.current.y < 50 ? 1.0 : 0.0, 0.05
      )
    }

    if (pointsRef.current) {
      const baseRotX = -Math.PI / 2.5
      const baseRotZ = Math.PI / 4
      const baseRotY = Math.PI / 6

      pointsRef.current.rotation.x = baseRotX + Math.sin(time * 0.2) * 0.05
      pointsRef.current.rotation.y = baseRotY + Math.cos(time * 0.15) * 0.05
      pointsRef.current.rotation.z = baseRotZ + Math.sin(time * 0.1) * 0.02

      pointsRef.current.position.y = Math.sin(time * 0.5) * 0.2
      pointsRef.current.position.x = Math.cos(time * 0.3) * 0.1
    }
  })

  const shaderMaterialArgs = useMemo(() => ({
    vertexShader,
    fragmentShader,
    uniforms: {
      uTime:            { value: 0 },
      uPointSize:       { value: theme === 'dark' ? 0.08 : 0.15 },
      uOpacity:         { value: theme === 'dark' ? 0.8 : 0.9 },
      uUseAdditiveGlow: { value: theme === 'dark' ? 1.0 : 0.0 },
      uMouse:           { value: new THREE.Vector3(0, 100, 0) },
      uMouseInfluence:  { value: 0 },
    },
    vertexColors: true,
    transparent: true,
    blending: theme === 'dark' ? THREE.AdditiveBlending : THREE.NormalBlending,
    depthWrite: theme === 'light',
  }), []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={positions.length / 3} array={positions} itemSize={3} />
        <bufferAttribute attach="attributes-color"    count={colors.length / 3}    array={colors}    itemSize={3} />
        <bufferAttribute attach="attributes-aPhase"   count={phases.length}        array={phases}    itemSize={1} />
        <bufferAttribute attach="attributes-aIsWing"  count={isWing.length}        array={isWing}    itemSize={1} />
        <bufferAttribute attach="attributes-aBaseZ"   count={baseZ.length}         array={baseZ}     itemSize={1} />
        <bufferAttribute attach="attributes-aRandom"  count={randoms.length}       array={randoms}   itemSize={1} />
      </bufferGeometry>
      <shaderMaterial ref={materialRef} attach="material" args={[shaderMaterialArgs]} />
    </points>
  )
}

/* ═══════════════════════════════════════════════════════════════════
   Exported Component
   ═══════════════════════════════════════════════════════════════════ */
export default function ButterflyParticles() {
  const { theme } = useTheme()
  const isDark = theme === 'dark'

  return (
    <ButterflyCanvasContainer>
      <Canvas camera={{ position: [0, 0, 15], fov: 60 }}>
        <Particles theme={theme} />
        <SparkleDust theme={theme} />
        <EffectComposer>
          <Bloom
            intensity={isDark ? 1.2 : 0.4}
            luminanceThreshold={isDark ? 0.2 : 0.6}
            luminanceSmoothing={0.9}
            radius={0.8}
          />
        </EffectComposer>
      </Canvas>
    </ButterflyCanvasContainer>
  )
}
