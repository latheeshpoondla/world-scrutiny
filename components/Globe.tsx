"use client"

import { useRef, useMemo, useState, useEffect } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, AdaptiveDpr } from "@react-three/drei"
import * as THREE from "three"

/* ══════════════════════════════════════════════
   TEXTURE-BASED CONTINENT SAMPLING
   ══════════════════════════════════════════════ */

function useLandData(imageSrc: string): ImageData | null {
  const [data, setData] = useState<ImageData | null>(null)

  useEffect(() => {
    const img = new Image()
    img.crossOrigin = "anonymous"
    img.onload = () => {
      const canvas = document.createElement("canvas")
      canvas.width = img.width
      canvas.height = img.height
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      setData(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.src = imageSrc
  }, [imageSrc])

  return data
}

function isLand(imageData: ImageData, lat: number, lng: number): boolean {
  const u = (lng + 180) / 360
  const v = (90 - lat) / 180
  const x = Math.floor(u * imageData.width) % imageData.width
  const y = Math.floor(v * imageData.height) % imageData.height
  const idx = (y * imageData.width + x) * 4
  return imageData.data[idx] < 80
}

function latLngToVec3(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180)
  const theta = (lng + 180) * (Math.PI / 180)
  return new THREE.Vector3(
    -r * Math.sin(phi) * Math.cos(theta),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  )
}

function generateTexturePoints(imageData: ImageData, radius: number, count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  let attempts = 0
  const maxAttempts = count * 12
  while (points.length < count && attempts < maxAttempts) {
    const lat = Math.asin(2 * Math.random() - 1) * (180 / Math.PI)
    const lng = Math.random() * 360 - 180
    attempts++
    if (isLand(imageData, lat, lng)) {
      points.push(latLngToVec3(lat, lng, radius + (Math.random() - 0.5) * 0.015))
    }
  }
  return points
}

function generateOceanDots(imageData: ImageData, radius: number, count: number): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  let attempts = 0
  const maxAttempts = count * 12
  while (points.length < count && attempts < maxAttempts) {
    const lat = Math.asin(2 * Math.random() - 1) * (180 / Math.PI)
    const lng = Math.random() * 360 - 180
    attempts++
    if (!isLand(imageData, lat, lng)) points.push(latLngToVec3(lat, lng, radius))
  }
  return points
}

/* ══════════════════════════════════════════════
   NETWORK LINES
   ══════════════════════════════════════════════ */

function NetworkLines({ points, maxDistance, color, opacity }: { points: THREE.Vector3[]; maxDistance: number; color: string; opacity: number }) {
  const geometry = useMemo(() => {
    const positions: number[] = []
    const subset = points.slice(0, Math.min(points.length, 800))
    for (let i = 0; i < subset.length; i++) {
      for (let j = i + 1; j < subset.length; j++) {
        const dist = subset[i].distanceTo(subset[j])
        if (dist < maxDistance && dist > maxDistance * 0.3) {
          positions.push(subset[i].x, subset[i].y, subset[i].z)
          positions.push(subset[j].x, subset[j].y, subset[j].z)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3))
    return geo
  }, [points, maxDistance])

  return (
    <lineSegments geometry={geometry}>
      <lineBasicMaterial color={color} transparent opacity={opacity} blending={THREE.AdditiveBlending} />
    </lineSegments>
  )
}

/* ══════════════════════════════════════════════
   EARTH POINTS (texture-sampled)
   ══════════════════════════════════════════════ */

function EarthPoints({ radius, count, landData }: { radius: number; count: number; landData: ImageData }) {
  const pointsRef = useRef<THREE.Points>(null!)
  const glowRef = useRef<THREE.Points>(null!)
  const continentPts = useMemo(() => generateTexturePoints(landData, radius, count), [landData, radius, count])

  const { geometry, glowGeometry } = useMemo(() => {
    const positions = new Float32Array(continentPts.length * 3)
    const colors = new Float32Array(continentPts.length * 3)
    const glowPos = new Float32Array(continentPts.length * 3)
    const cyan = new THREE.Color("#00e5ff"), teal = new THREE.Color("#00bfa5"), bright = new THREE.Color("#b0ffff"), white = new THREE.Color("#ffffff")

    continentPts.forEach((p, i) => {
      positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z
      const dir = p.clone().normalize()
      glowPos[i * 3] = p.x + dir.x * 0.005; glowPos[i * 3 + 1] = p.y + dir.y * 0.005; glowPos[i * 3 + 2] = p.z + dir.z * 0.005
      const t = Math.random()
      const color = t < 0.5 ? cyan : t < 0.75 ? teal : t < 0.92 ? bright : white
      colors[i * 3] = color.r; colors[i * 3 + 1] = color.g; colors[i * 3 + 2] = color.b
    })

    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    const gGeo = new THREE.BufferGeometry()
    gGeo.setAttribute("position", new THREE.BufferAttribute(glowPos, 3))
    return { geometry: geo, glowGeometry: gGeo }
  }, [continentPts])

  useFrame(({ clock }) => {
    if (pointsRef.current) (pointsRef.current.material as THREE.PointsMaterial).opacity = 0.8 + Math.sin(clock.elapsedTime * 1.5) * 0.1
    if (glowRef.current) (glowRef.current.material as THREE.PointsMaterial).opacity = 0.25 + Math.sin(clock.elapsedTime * 1.2) * 0.1
  })

  return (
    <group>
      <points ref={pointsRef} geometry={geometry}>
        <pointsMaterial vertexColors size={0.018} transparent opacity={0.9} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
      <points ref={glowRef} geometry={glowGeometry}>
        <pointsMaterial color="#00ccff" size={0.045} transparent opacity={0.2} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
      <NetworkLines points={continentPts} maxDistance={0.3} color="#00c8ff" opacity={0.06} />
    </group>
  )
}

/* ══════════════════════════════════════════════
   COASTLINE EDGES
   ══════════════════════════════════════════════ */

function CoastlineGlow({ radius, landData }: { radius: number; landData: ImageData }) {
  const geometry = useMemo(() => {
    const points: number[] = []
    for (let lat = -85; lat <= 85; lat += 1) {
      for (let lng = -180; lng < 180; lng += 1) {
        const land = isLand(landData, lat, lng)
        const neighbors = [isLand(landData, lat + 1, lng), isLand(landData, lat - 1, lng), isLand(landData, lat, lng + 1), isLand(landData, lat, lng - 1)]
        if (land && neighbors.some((n) => n !== land)) {
          const v = latLngToVec3(lat, lng, radius + 0.003)
          points.push(v.x, v.y, v.z)
        }
      }
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.Float32BufferAttribute(points, 3))
    return geo
  }, [radius, landData])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#55ffee" size={0.012} transparent opacity={0.95} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ══════════════════════════════════════════════
   OCEAN POINTS
   ══════════════════════════════════════════════ */

function OceanPoints({ radius, count, landData }: { radius: number; count: number; landData: ImageData }) {
  const pts = useMemo(() => generateOceanDots(landData, radius, count), [landData, radius, count])
  const geometry = useMemo(() => {
    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => { positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [pts])

  return (
    <points geometry={geometry}>
      <pointsMaterial color="#0a3d5c" size={0.006} transparent opacity={0.3} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ══════════════════════════════════════════════
   ACCENT GLOW POINTS (pink pulsing)
   ══════════════════════════════════════════════ */

function AccentPoints({ radius, landData, count }: { radius: number; landData: ImageData; count: number }) {
  const ref = useRef<THREE.Points>(null!)
  const geometry = useMemo(() => {
    const pts = generateTexturePoints(landData, radius + 0.01, count)
    const positions = new Float32Array(pts.length * 3)
    pts.forEach((p, i) => { positions[i * 3] = p.x; positions[i * 3 + 1] = p.y; positions[i * 3 + 2] = p.z })
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return geo
  }, [radius, landData, count])

  useFrame(({ clock }) => {
    if (ref.current) {
      const mat = ref.current.material as THREE.PointsMaterial
      mat.size = 0.045 + Math.sin(clock.elapsedTime * 2.5) * 0.02
      mat.opacity = 0.5 + Math.sin(clock.elapsedTime * 3) * 0.35
    }
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#ff40ff" size={0.045} transparent opacity={0.7} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ══════════════════════════════════════════════
   ATMOSPHERE GLOW SHADERS
   ══════════════════════════════════════════════ */

function AtmosphereGlow({ radius }: { radius: number }) {
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.BackSide, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#006688") }, uIntensity: { value: 0.5 } },
    vertexShader: `varying vec3 vNormal; void main() { vNormal = normalize(normalMatrix * normal); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uColor; uniform float uIntensity; varying vec3 vNormal; void main() { float intensity = pow(0.65 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 3.0); gl_FragColor = vec4(uColor, intensity * uIntensity); }`,
  }), [])

  return <mesh material={shaderMaterial}><sphereGeometry args={[radius * 1.18, 64, 64]} /></mesh>
}

function InnerGlow({ radius }: { radius: number }) {
  const shaderMaterial = useMemo(() => new THREE.ShaderMaterial({
    transparent: true, blending: THREE.AdditiveBlending, side: THREE.FrontSide, depthWrite: false,
    uniforms: { uColor: { value: new THREE.Color("#003344") } },
    vertexShader: `varying vec3 vNormal; varying vec3 vViewPosition; void main() { vNormal = normalize(normalMatrix * normal); vec4 mvPos = modelViewMatrix * vec4(position, 1.0); vViewPosition = -mvPos.xyz; gl_Position = projectionMatrix * mvPos; }`,
    fragmentShader: `uniform vec3 uColor; varying vec3 vNormal; varying vec3 vViewPosition; void main() { vec3 viewDir = normalize(vViewPosition); float fresnel = 1.0 - abs(dot(viewDir, vNormal)); float intensity = pow(fresnel, 2.5) * 0.35; gl_FragColor = vec4(uColor, intensity); }`,
  }), [])

  return <mesh material={shaderMaterial}><sphereGeometry args={[radius * 0.98, 64, 64]} /></mesh>
}

/* ══════════════════════════════════════════════════════
   ADVANCED HOLOGRAPHIC PLANT SYSTEM
   Realistic branching stem with sub-branches,
   detailed leaves with full vein networks,
   bud with unfolding petals
   ══════════════════════════════════════════════════════ */

const GLOBE_R = 1.1
const PLANT_BASE = latLngToVec3(70, 0, GLOBE_R)
const PLANT_UP = PLANT_BASE.clone().normalize()

// Helper: get a vector orthogonal to a given "up"
function getOrthoBasis(up: THREE.Vector3) {
  const arbitrary = Math.abs(up.y) < 0.99 ? new THREE.Vector3(0, 1, 0) : new THREE.Vector3(1, 0, 0)
  const tangent = new THREE.Vector3().crossVectors(up, arbitrary).normalize()
  const bitangent = new THREE.Vector3().crossVectors(up, tangent).normalize()
  return { tangent, bitangent }
}

// Build a curve that starts at base, going along "up" direction, with organic wobble
function buildStemCurve(base: THREE.Vector3, up: THREE.Vector3, length: number, segments: number, wobble: number): THREE.CatmullRomCurve3 {
  const { tangent, bitangent } = getOrthoBasis(up)
  const pts: THREE.Vector3[] = []
  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    const h = length * t
    const w = wobble * Math.sin(t * Math.PI * 2 + 1.3) * t
    const w2 = wobble * 0.7 * Math.cos(t * Math.PI * 1.7 + 0.7) * t
    pts.push(
      base.clone()
        .add(up.clone().multiplyScalar(h))
        .add(tangent.clone().multiplyScalar(w))
        .add(bitangent.clone().multiplyScalar(w2))
    )
  }
  return new THREE.CatmullRomCurve3(pts)
}

/* ── MAIN STEM with sub-branches ── */

function PlantStem() {
  const stemRef = useRef<THREE.Group>(null!)

  const { mainCurve, branches, stemParticleGeo, nodePositions } = useMemo(() => {
    const length = 1.0
    const main = buildStemCurve(PLANT_BASE, PLANT_UP, length, 12, 0.03)
    const mainPts = main.getPoints(120)

    // Sub-branches emerge from the main stem at intervals
    const branchCurves: { curve: THREE.CatmullRomCurve3; depth: number }[] = []
    const branchStarts = [0.2, 0.32, 0.45, 0.55, 0.65, 0.75, 0.85]

    branchStarts.forEach((t, idx) => {
      const origin = main.getPoint(t)
      const tangentDir = main.getTangent(t).normalize()
      const side = idx % 2 === 0 ? 1 : -1
      const { tangent: orthT, bitangent: orthB } = getOrthoBasis(tangentDir)

      const branchDir = tangentDir.clone().multiplyScalar(0.3)
        .add(orthT.clone().multiplyScalar(side * (0.4 + Math.random() * 0.3)))
        .add(orthB.clone().multiplyScalar((Math.random() - 0.5) * 0.3))
        .normalize()

      const branchLen = 0.08 + Math.random() * 0.12
      const pts: THREE.Vector3[] = []
      for (let i = 0; i <= 6; i++) {
        const bt = i / 6
        pts.push(
          origin.clone()
            .add(branchDir.clone().multiplyScalar(branchLen * bt))
            .add(tangentDir.clone().multiplyScalar(branchLen * bt * 0.3))
            .add(new THREE.Vector3((Math.random() - 0.5) * 0.008, (Math.random() - 0.5) * 0.008, (Math.random() - 0.5) * 0.008))
        )
      }
      branchCurves.push({ curve: new THREE.CatmullRomCurve3(pts), depth: 1 })

      // Sub-sub-branches
      if (Math.random() > 0.3 && pts.length > 3) {
        const subOrigin = pts[3]
        const subDir = branchDir.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.6, Math.random() * 0.3, (Math.random() - 0.5) * 0.6)).normalize()
        const subLen = 0.05 + Math.random() * 0.08
        const subPts: THREE.Vector3[] = []
        for (let i = 0; i <= 4; i++) {
          subPts.push(subOrigin.clone().add(subDir.clone().multiplyScalar(subLen * (i / 4))))
        }
        branchCurves.push({ curve: new THREE.CatmullRomCurve3(subPts), depth: 2 })
      }
    })

    // Stem particles (energy dots along the stem)
    const particlePositions = new Float32Array(mainPts.length * 3)
    mainPts.forEach((p, i) => {
      const jitter = 0.01
      particlePositions[i * 3] = p.x + (Math.random() - 0.5) * jitter
      particlePositions[i * 3 + 1] = p.y + (Math.random() - 0.5) * jitter
      particlePositions[i * 3 + 2] = p.z + (Math.random() - 0.5) * jitter
    })
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute("position", new THREE.BufferAttribute(particlePositions, 3))

    // Node points where branches emerge (bright spots)
    const nodes = branchStarts.map(t => main.getPoint(t))

    return { mainCurve: main, branches: branchCurves, stemParticleGeo: pGeo, nodePositions: nodes }
  }, [])

  useFrame(({ clock }) => {
    if (stemRef.current) stemRef.current.rotation.y = Math.sin(clock.elapsedTime * 0.2) * 0.02
  })

  return (
    <group ref={stemRef}>
      {/* Main stem core */}
      <mesh>
        <tubeGeometry args={[mainCurve, 80, 0.016, 8, false]} />
        <meshBasicMaterial color="#22ff66" transparent opacity={0.85} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Stem inner bright line */}
      <mesh>
        <tubeGeometry args={[mainCurve, 80, 0.006, 6, false]} />
        <meshBasicMaterial color="#aaffcc" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Stem outer glow */}
      <mesh>
        <tubeGeometry args={[mainCurve, 80, 0.045, 8, false]} />
        <meshBasicMaterial color="#11cc44" transparent opacity={0.08} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Wide atmospheric glow */}
      <mesh>
        <tubeGeometry args={[mainCurve, 80, 0.09, 8, false]} />
        <meshBasicMaterial color="#0a6630" transparent opacity={0.03} blending={THREE.AdditiveBlending} />
      </mesh>

      {/* Branches */}
      {branches.map(({ curve, depth }, i) => (
        <group key={`branch-${i}`}>
          <mesh>
            <tubeGeometry args={[curve, 24, depth === 2 ? 0.004 : 0.008, 6, false]} />
            <meshBasicMaterial color={depth === 2 ? "#33aa55" : "#22ee55"} transparent opacity={depth === 2 ? 0.5 : 0.7} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh>
            <tubeGeometry args={[curve, 24, depth === 2 ? 0.012 : 0.02, 6, false]} />
            <meshBasicMaterial color="#11aa33" transparent opacity={0.05} blending={THREE.AdditiveBlending} />
          </mesh>
        </group>
      ))}

      {/* Node glow points */}
      {nodePositions.map((pos, i) => (
        <mesh key={`node-${i}`} position={pos}>
          <sphereGeometry args={[0.015, 12, 12]} />
          <meshBasicMaterial color="#88ffbb" transparent opacity={0.7} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* Stem particles */}
      <points geometry={stemParticleGeo}>
        <pointsMaterial color="#66ffaa" size={0.016} transparent opacity={0.45} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

/* ── ADVANCED LEAF ── */

function DetailedLeaf({
  position,
  rotation,
  scale = 1,
  flip = false,
}: {
  position: [number, number, number]
  rotation: [number, number, number]
  scale?: number
  flip?: boolean
}) {
  const ref = useRef<THREE.Group>(null!)
  const s = flip ? -1 : 1

  const { outlineCurve, midribCurve, primaryVeins, secondaryVeins, tertiaryVeins, fillParticles, edgeParticles } = useMemo(() => {
    // Leaf outline with more control points for realism
    const tipY = 0.95 * scale
    const maxW = 0.18 * scale
    const right = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.04 * s, 0.08 * scale, 0.01 * s),
      new THREE.Vector3(0.1 * s, 0.2 * scale, 0.015 * s),
      new THREE.Vector3(maxW * s, 0.32 * scale, 0.01 * s),
      new THREE.Vector3(maxW * 0.95 * s, 0.45 * scale, 0.005 * s),
      new THREE.Vector3(maxW * 0.8 * s, 0.58 * scale, 0),
      new THREE.Vector3(maxW * 0.55 * s, 0.72 * scale, -0.005 * s),
      new THREE.Vector3(maxW * 0.3 * s, 0.84 * scale, -0.008 * s),
      new THREE.Vector3(0.02 * s, tipY, 0),
    ]
    const left = [
      new THREE.Vector3(0.02 * s, tipY, 0),
      new THREE.Vector3(-maxW * 0.25 * s, 0.84 * scale, 0.008 * s),
      new THREE.Vector3(-maxW * 0.5 * s, 0.72 * scale, 0.005 * s),
      new THREE.Vector3(-maxW * 0.75 * s, 0.58 * scale, 0),
      new THREE.Vector3(-maxW * 0.9 * s, 0.45 * scale, -0.005 * s),
      new THREE.Vector3(-maxW * 0.95 * s, 0.32 * scale, -0.01 * s),
      new THREE.Vector3(-0.08 * s, 0.2 * scale, -0.015 * s),
      new THREE.Vector3(-0.03 * s, 0.08 * scale, -0.01 * s),
      new THREE.Vector3(0, 0, 0),
    ]

    const outline = new THREE.CatmullRomCurve3([...right, ...left], true)

    // Midrib (central vein) with slight curve
    const midPts = [
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0.005 * s, 0.15 * scale, 0.002),
      new THREE.Vector3(0.012 * s, 0.3 * scale, 0),
      new THREE.Vector3(0.015 * s, 0.45 * scale, -0.002),
      new THREE.Vector3(0.012 * s, 0.6 * scale, 0),
      new THREE.Vector3(0.008 * s, 0.75 * scale, 0.001),
      new THREE.Vector3(0.02 * s, tipY, 0),
    ]
    const midrib = new THREE.CatmullRomCurve3(midPts)

    // Primary lateral veins (7 pairs, alternating)
    const pVeins: THREE.CatmullRomCurve3[] = []
    const veinTs = [0.12, 0.22, 0.33, 0.44, 0.55, 0.66, 0.78]
    veinTs.forEach((t, idx) => {
      const origin = midrib.getPoint(t)
      const leafWidth = maxW * Math.sin(t * Math.PI) * 0.95

      // Right side vein
      const rEnd = new THREE.Vector3(
        origin.x + leafWidth * s * (0.85 + Math.random() * 0.1),
        origin.y + 0.04 * scale * (1 - t * 0.5),
        origin.z + (Math.random() - 0.5) * 0.008
      )
      const rMid = origin.clone().lerp(rEnd, 0.5).add(new THREE.Vector3(0, 0.02 * scale, (Math.random() - 0.5) * 0.005))
      pVeins.push(new THREE.CatmullRomCurve3([origin.clone(), rMid, rEnd]))

      // Left side vein
      const lEnd = new THREE.Vector3(
        origin.x - leafWidth * s * (0.85 + Math.random() * 0.1),
        origin.y + 0.04 * scale * (1 - t * 0.5),
        origin.z + (Math.random() - 0.5) * 0.008
      )
      const lMid = origin.clone().lerp(lEnd, 0.5).add(new THREE.Vector3(0, 0.02 * scale, (Math.random() - 0.5) * 0.005))
      pVeins.push(new THREE.CatmullRomCurve3([origin.clone(), lMid, lEnd]))
    })

    // Secondary veins branching from primary veins
    const sVeins: THREE.CatmullRomCurve3[] = []
    pVeins.forEach(vein => {
      const veinPts = vein.getPoints(10)
      for (let i = 3; i < veinPts.length; i += 3) {
        const p = veinPts[i]
        const dir = veinPts[i].clone().sub(veinPts[i - 1]).normalize()
        const perpUp = new THREE.Vector3(0, 1, 0).cross(dir).normalize().multiplyScalar(0.015 * scale)
        sVeins.push(new THREE.CatmullRomCurve3([
          p.clone(),
          p.clone().add(dir.clone().multiplyScalar(0.02 * scale)).add(perpUp),
          p.clone().add(dir.clone().multiplyScalar(0.04 * scale)).add(perpUp.clone().multiplyScalar(1.5)),
        ]))
      }
    })

    // Tertiary fine veins (network fill)
    const tVeins: THREE.CatmullRomCurve3[] = []
    for (let i = 0; i < 30; i++) {
      const t1 = 0.1 + Math.random() * 0.8
      const p1 = midrib.getPoint(t1)
      const leafW = maxW * Math.sin(t1 * Math.PI) * 0.7
      const offsetX = (Math.random() - 0.5) * 2 * leafW * s
      const start = new THREE.Vector3(p1.x + offsetX, p1.y + (Math.random() - 0.5) * 0.03 * scale, p1.z + (Math.random() - 0.5) * 0.005)
      const end = start.clone().add(new THREE.Vector3((Math.random() - 0.5) * 0.03 * scale, Math.random() * 0.03 * scale, (Math.random() - 0.5) * 0.003))
      tVeins.push(new THREE.CatmullRomCurve3([start, end]))
    }

    // Fill particles inside the leaf shape
    const fillPts: number[] = []
    const outlineSampled = outline.getPoints(200)
    for (let i = 0; i < 200; i++) {
      const t2 = 0.05 + Math.random() * 0.9
      const midP = midrib.getPoint(t2)
      const lw = maxW * Math.sin(t2 * Math.PI) * (0.3 + Math.random() * 0.6)
      const ox = (Math.random() - 0.5) * 2 * lw * s
      fillPts.push(midP.x + ox, midP.y + (Math.random() - 0.5) * 0.01, midP.z + (Math.random() - 0.5) * 0.005)
    }
    const fGeo = new THREE.BufferGeometry()
    fGeo.setAttribute("position", new THREE.Float32BufferAttribute(fillPts, 3))

    // Edge sparkle particles
    const edgePts = new Float32Array(outlineSampled.length * 3)
    outlineSampled.forEach((p, i) => { edgePts[i * 3] = p.x; edgePts[i * 3 + 1] = p.y; edgePts[i * 3 + 2] = p.z })
    const eGeo = new THREE.BufferGeometry()
    eGeo.setAttribute("position", new THREE.BufferAttribute(edgePts, 3))

    return { outlineCurve: outline, midribCurve: midrib, primaryVeins: pVeins, secondaryVeins: sVeins, tertiaryVeins: tVeins, fillParticles: fGeo, edgeParticles: eGeo }
  }, [scale, s])

  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.z = rotation[2] + Math.sin(clock.elapsedTime * 0.6 + position[1] * 2) * 0.03
  })

  return (
    <group ref={ref} position={position} rotation={rotation}>
      {/* Leaf outline */}
      <mesh>
        <tubeGeometry args={[outlineCurve, 80, 0.004 * scale, 6, true]} />
        <meshBasicMaterial color="#33ff77" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Outline glow */}
      <mesh>
        <tubeGeometry args={[outlineCurve, 80, 0.014 * scale, 6, true]} />
        <meshBasicMaterial color="#22cc55" transparent opacity={0.1} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Midrib (central vein) */}
      <mesh>
        <tubeGeometry args={[midribCurve, 40, 0.005 * scale, 6, false]} />
        <meshBasicMaterial color="#44ffaa" transparent opacity={0.8} blending={THREE.AdditiveBlending} />
      </mesh>
      <mesh>
        <tubeGeometry args={[midribCurve, 40, 0.002 * scale, 6, false]} />
        <meshBasicMaterial color="#ccffdd" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
      </mesh>
      {/* Primary lateral veins */}
      {primaryVeins.map((v, i) => (
        <mesh key={`pv-${i}`}>
          <tubeGeometry args={[v, 16, 0.003 * scale, 4, false]} />
          <meshBasicMaterial color="#33dd77" transparent opacity={0.55} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* Secondary veins */}
      {secondaryVeins.map((v, i) => (
        <mesh key={`sv-${i}`}>
          <tubeGeometry args={[v, 8, 0.0015 * scale, 4, false]} />
          <meshBasicMaterial color="#2bb85a" transparent opacity={0.3} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* Tertiary fine veins */}
      {tertiaryVeins.map((v, i) => (
        <mesh key={`tv-${i}`}>
          <tubeGeometry args={[v, 4, 0.001 * scale, 3, false]} />
          <meshBasicMaterial color="#229944" transparent opacity={0.18} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
      {/* Fill particles */}
      <points geometry={fillParticles}>
        <pointsMaterial color="#33ff88" size={0.008 * scale} transparent opacity={0.15} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
      {/* Edge sparkle */}
      <points geometry={edgeParticles}>
        <pointsMaterial color="#77ffcc" size={0.01 * scale} transparent opacity={0.35} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

/* ── LEAF BUD (top of plant) ── */

function LeafBud() {
  const ref = useRef<THREE.Group>(null!)
  const budTip = PLANT_BASE.clone().add(PLANT_UP.clone().multiplyScalar(1.0))

  const petalCurves = useMemo(() => {
    const petals: THREE.CatmullRomCurve3[] = []
    const { tangent, bitangent } = getOrthoBasis(PLANT_UP)
    for (let i = 0; i < 5; i++) {
      const a = (i / 5) * Math.PI * 2
      const dir = tangent.clone().multiplyScalar(Math.cos(a)).add(bitangent.clone().multiplyScalar(Math.sin(a)))
      const pts = [
        budTip.clone(),
        budTip.clone().add(dir.clone().multiplyScalar(0.03)).add(PLANT_UP.clone().multiplyScalar(0.08)),
        budTip.clone().add(dir.clone().multiplyScalar(0.015)).add(PLANT_UP.clone().multiplyScalar(0.16)),
        budTip.clone().add(PLANT_UP.clone().multiplyScalar(0.2)),
      ]
      petals.push(new THREE.CatmullRomCurve3(pts))
    }
    return petals
  }, [budTip])

  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.15 })

  return (
    <group ref={ref}>
      {petalCurves.map((c, i) => (
        <group key={i}>
          <mesh><tubeGeometry args={[c, 20, 0.005, 6, false]} /><meshBasicMaterial color="#44ff88" transparent opacity={0.85} blending={THREE.AdditiveBlending} /></mesh>
          <mesh><tubeGeometry args={[c, 20, 0.016, 6, false]} /><meshBasicMaterial color="#22aa44" transparent opacity={0.06} blending={THREE.AdditiveBlending} /></mesh>
        </group>
      ))}
      {/* Bud tip glow */}
      <mesh position={budTip.clone().add(PLANT_UP.clone().multiplyScalar(0.2))}>
        <sphereGeometry args={[0.02, 12, 12]} />
        <meshBasicMaterial color="#aaffdd" transparent opacity={0.6} blending={THREE.AdditiveBlending} />
      </mesh>
    </group>
  )
}

/* ══════════════════════════════════════════════════════
   ADVANCED ROOT SYSTEM
   Roots spread in ALL directions from plant base,
   equal probability, with varying lengths, thicknesses,
   branching depth, and holographic glow
   ══════════════════════════════════════════════════════ */

function generateSurfaceRoot(
  startPos: THREE.Vector3,
  direction: THREE.Vector3,
  length: number,
  segments: number,
  wobble: number,
  radiusOffset: number
): THREE.Vector3[] {
  const points: THREE.Vector3[] = []
  let current = startPos.clone()
  let dir = direction.clone().normalize()

  for (let i = 0; i <= segments; i++) {
    const t = i / segments
    // Project onto sphere surface with slight offset
    const surfaceR = GLOBE_R + radiusOffset + Math.sin(t * Math.PI) * 0.02
    const projected = current.clone().normalize().multiplyScalar(surfaceR)
    points.push(projected)

    // Walk forward: project direction onto tangent plane of sphere
    const normal = current.clone().normalize()
    const tangentDir = dir.clone().sub(normal.clone().multiplyScalar(dir.dot(normal))).normalize()

    // Add organic wobble
    const wobbleVec = new THREE.Vector3(
      (Math.random() - 0.5) * wobble,
      (Math.random() - 0.5) * wobble,
      (Math.random() - 0.5) * wobble
    )
    const stepDir = tangentDir.add(wobbleVec).normalize()
    const stepLen = (length / segments) * (0.8 + Math.random() * 0.4)
    current = current.clone().add(stepDir.multiplyScalar(stepLen))
    dir = stepDir
  }
  return points
}

function RootSystem() {
  const rootsRef = useRef<THREE.Group>(null!)

  const { rootCurves, rootParticleGeo, rootTipPositions } = useMemo(() => {
    const curves: { curve: THREE.CatmullRomCurve3; depth: number; thickness: number }[] = []
    const allPts: THREE.Vector3[] = []
    const tipPositions: THREE.Vector3[] = []

    const { tangent, bitangent } = getOrthoBasis(PLANT_UP)

    // 16 main roots radiating in ALL directions uniformly
    const numMain = 16
    for (let i = 0; i < numMain; i++) {
      const angle = (i / numMain) * Math.PI * 2 + (Math.random() - 0.5) * 0.2
      // Mix in some downward and upward biases for variety
      const downBias = -0.1 + (Math.random() - 0.5) * 0.3
      const direction = tangent.clone().multiplyScalar(Math.cos(angle))
        .add(bitangent.clone().multiplyScalar(Math.sin(angle)))
        .add(PLANT_UP.clone().multiplyScalar(downBias))
        .normalize()

      const rootLength = 0.3 + Math.random() * 0.6 // varying lengths
      const segments = 14 + Math.floor(Math.random() * 10)
      const thickness = 0.008 + Math.random() * 0.008 // varying thickness

      const pts = generateSurfaceRoot(PLANT_BASE, direction, rootLength, segments, 0.15, 0.008 + Math.random() * 0.01)
      if (pts.length >= 2) {
        curves.push({ curve: new THREE.CatmullRomCurve3(pts), depth: 0, thickness })
        allPts.push(...pts)
        tipPositions.push(pts[pts.length - 1])
      }

      // Secondary branches from main root
      for (let j = 3; j < pts.length - 1; j += 2 + Math.floor(Math.random() * 2)) {
        if (Math.random() > 0.2) {
          const branchOrigin = pts[j]
          const branchDir = pts[j].clone().sub(pts[Math.max(0, j - 2)]).normalize()
          // Perpendicular deviation
          const perpVec = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize()
          const newDir = branchDir.clone().add(perpVec.multiplyScalar(0.8)).normalize()

          const subLen = 0.1 + Math.random() * 0.25
          const subSegs = 6 + Math.floor(Math.random() * 6)
          const subThickness = thickness * (0.4 + Math.random() * 0.3)

          const subPts = generateSurfaceRoot(branchOrigin, newDir, subLen, subSegs, 0.2, 0.005)
          if (subPts.length >= 2) {
            curves.push({ curve: new THREE.CatmullRomCurve3(subPts), depth: 1, thickness: subThickness })
            allPts.push(...subPts)
            tipPositions.push(subPts[subPts.length - 1])
          }

          // Tertiary (finest) branches
          if (Math.random() > 0.35 && subPts.length > 3) {
            const terOrigin = subPts[Math.min(3, subPts.length - 1)]
            const terDir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize()
            const terLen = 0.04 + Math.random() * 0.1
            const terPts = generateSurfaceRoot(terOrigin, terDir, terLen, 4, 0.25, 0.003)
            if (terPts.length >= 2) {
              curves.push({ curve: new THREE.CatmullRomCurve3(terPts), depth: 2, thickness: subThickness * 0.5 })
              allPts.push(...terPts)
            }
          }

          // Quaternary (hair roots)
          if (Math.random() > 0.6 && subPts.length > 2) {
            for (let k = 1; k < subPts.length; k += 3) {
              if (Math.random() > 0.5) {
                const hairOrigin = subPts[k]
                const hairDir = new THREE.Vector3((Math.random() - 0.5), (Math.random() - 0.5), (Math.random() - 0.5)).normalize()
                const hairPts = generateSurfaceRoot(hairOrigin, hairDir, 0.02 + Math.random() * 0.04, 3, 0.3, 0.002)
                if (hairPts.length >= 2) {
                  curves.push({ curve: new THREE.CatmullRomCurve3(hairPts), depth: 3, thickness: 0.002 })
                  allPts.push(...hairPts)
                }
              }
            }
          }
        }
      }
    }

    // Particle cloud hugging roots
    const positions = new Float32Array(allPts.length * 3)
    allPts.forEach((p, i) => {
      const norm = p.clone().normalize()
      const jitter = 0.015
      positions[i * 3] = p.x + norm.x * (Math.random() * jitter)
      positions[i * 3 + 1] = p.y + norm.y * (Math.random() * jitter)
      positions[i * 3 + 2] = p.z + norm.z * (Math.random() * jitter)
    })
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3))

    return { rootCurves: curves, rootParticleGeo: pGeo, rootTipPositions: tipPositions }
  }, [])

  useFrame(({ clock }) => {
    if (rootsRef.current) {
      rootsRef.current.children.forEach((child, i) => {
        if ((child as THREE.Mesh).material) {
          const mat = (child as THREE.Mesh).material as THREE.MeshBasicMaterial
          if (mat.opacity !== undefined) {
            if (!mat.userData.baseOpacity) mat.userData.baseOpacity = mat.opacity
            mat.opacity = mat.userData.baseOpacity + Math.sin(clock.elapsedTime * 1.0 + i * 0.3) * 0.08
          }
        }
      })
    }
  })

  const depthColor = (d: number) => d === 0 ? "#22ff66" : d === 1 ? "#33dd66" : d === 2 ? "#22bb55" : "#1a9944"
  const depthOpacity = (d: number) => d === 0 ? 0.7 : d === 1 ? 0.5 : d === 2 ? 0.35 : 0.2

  return (
    <group>
      <group ref={rootsRef}>
        {rootCurves.map(({ curve, depth, thickness }, i) => (
          <group key={i}>
            <mesh>
              <tubeGeometry args={[curve, depth < 2 ? 32 : 16, thickness, 6, false]} />
              <meshBasicMaterial color={depthColor(depth)} transparent opacity={depthOpacity(depth)} blending={THREE.AdditiveBlending} />
            </mesh>
            {/* Glow halo for primary and secondary roots */}
            {depth <= 1 && (
              <mesh>
                <tubeGeometry args={[curve, 32, thickness * 3, 6, false]} />
                <meshBasicMaterial color="#11aa44" transparent opacity={0.04 + (depth === 0 ? 0.03 : 0)} blending={THREE.AdditiveBlending} />
              </mesh>
            )}
          </group>
        ))}
      </group>

      {/* Root tip glow nodes */}
      {rootTipPositions.map((pos, i) => (
        <mesh key={`tip-${i}`} position={pos}>
          <sphereGeometry args={[0.008, 8, 8]} />
          <meshBasicMaterial color="#66ffaa" transparent opacity={0.5} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}

      {/* Particle cloud */}
      <points geometry={rootParticleGeo}>
        <pointsMaterial color="#44ff88" size={0.01} transparent opacity={0.25} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
      </points>
    </group>
  )
}

/* ══════════════════════════════════════════════
   BACKGROUND AND EFFECTS
   ══════════════════════════════════════════════ */

function Stars({ count }: { count: number }) {
  const ref = useRef<THREE.Points>(null!)
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const colors = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50
      positions[i * 3 + 2] = (Math.random() - 0.5) * 50
      const bright = 0.5 + Math.random() * 0.5
      colors[i * 3] = bright * (0.8 + Math.random() * 0.2)
      colors[i * 3 + 1] = bright * (0.85 + Math.random() * 0.15)
      colors[i * 3 + 2] = bright
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))
    return geo
  }, [count])

  useFrame(({ clock }) => {
    if (ref.current) (ref.current.material as THREE.PointsMaterial).opacity = 0.5 + Math.sin(clock.elapsedTime * 0.4) * 0.1
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial vertexColors size={0.03} transparent opacity={0.6} sizeAttenuation depthWrite={false} />
    </points>
  )
}

function LightRays() {
  const ref = useRef<THREE.Group>(null!)
  const rays = useMemo(() => {
    const r: { curve: THREE.CatmullRomCurve3; opacity: number }[] = []
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2 + Math.random() * 0.4
      const startR = 1.5 + Math.random() * 0.3
      const endR = 3.2 + Math.random() * 1.8
      const y = (Math.random() - 0.3) * 2
      r.push({
        curve: new THREE.CatmullRomCurve3([
          new THREE.Vector3(Math.cos(angle) * startR, y, Math.sin(angle) * startR),
          new THREE.Vector3(Math.cos(angle + 0.08) * (startR + endR) * 0.5, y + (Math.random() - 0.5), Math.sin(angle + 0.08) * (startR + endR) * 0.5),
          new THREE.Vector3(Math.cos(angle + 0.15) * endR, y + (Math.random() - 0.5) * 2, Math.sin(angle + 0.15) * endR),
        ]),
        opacity: 0.03 + Math.random() * 0.06,
      })
    }
    return r
  }, [])

  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.015 })

  return (
    <group ref={ref}>
      {rays.map((ray, i) => (
        <mesh key={i}>
          <tubeGeometry args={[ray.curve, 20, 0.006, 4, false]} />
          <meshBasicMaterial color="#3377aa" transparent opacity={ray.opacity} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  )
}

function RotatingGlobe({ children }: { children: React.ReactNode }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => { if (ref.current) ref.current.rotation.y = clock.elapsedTime * 0.055 })
  return <group ref={ref} rotation={[0.15, 0, -0.1]}>{children}</group>
}

function EnergyParticles() {
  const ref = useRef<THREE.Points>(null!)
  const count = 250
  const { geometry, velocities } = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const vels: THREE.Vector3[] = []
    for (let i = 0; i < count; i++) {
      const theta = Math.random() * Math.PI * 2
      const phi = Math.random() * Math.PI
      const r = 0.9 + Math.random() * 0.6
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      positions[i * 3 + 1] = r * Math.cos(phi)
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta)
      vels.push(new THREE.Vector3(0, 0.0015 + Math.random() * 0.003, 0))
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
    return { geometry: geo, velocities: vels }
  }, [])

  useFrame(() => {
    if (!ref.current) return
    const posAttr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < count; i++) {
      const y = posAttr.getY(i) + velocities[i].y
      if (y > 2.5) {
        const theta = Math.random() * Math.PI * 2
        const phi = Math.random() * Math.PI * 0.5
        const r = 0.9 + Math.random() * 0.2
        posAttr.setXYZ(i, r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
      } else {
        posAttr.setY(i, y)
        posAttr.setX(i, posAttr.getX(i) * 0.998)
        posAttr.setZ(i, posAttr.getZ(i) * 0.998)
      }
    }
    posAttr.needsUpdate = true
  })

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial color="#66ffcc" size={0.018} transparent opacity={0.35} blending={THREE.AdditiveBlending} sizeAttenuation depthWrite={false} />
    </points>
  )
}

/* ══════════════════════════════════════════════
   MAIN SCENE
   ══════════════════════════════════════════════ */

// Compute leaf positions relative to the stem
const STEM_TIP = PLANT_BASE.clone().add(PLANT_UP.clone().multiplyScalar(1.0))

function Scene() {
  const landData = useLandData("WS_Media/dev/earth-map.jpg")

  // Leaf positions along the stem
  const leafConfigs: { position: [number, number, number]; rotation: [number, number, number]; scale: number; flip: boolean }[] = useMemo(() => {
    const stemBase = PLANT_BASE
    const up = PLANT_UP
    return [
      {
        position: stemBase.clone().add(up.clone().multiplyScalar(0.45)).toArray() as [number, number, number],
        rotation: [0.2, 0.4, -0.7] as [number, number, number],
        scale: 0.35,
        flip: false,
      },
      {
        position: stemBase.clone().add(up.clone().multiplyScalar(0.58)).toArray() as [number, number, number],
        rotation: [-0.15, -0.3, 0.6] as [number, number, number],
        scale: 0.32,
        flip: true,
      },
      {
        position: stemBase.clone().add(up.clone().multiplyScalar(0.72)).toArray() as [number, number, number],
        rotation: [0.1, 0.6, -0.5] as [number, number, number],
        scale: 0.28,
        flip: false,
      },
      {
        position: stemBase.clone().add(up.clone().multiplyScalar(0.85)).toArray() as [number, number, number],
        rotation: [-0.1, -0.5, 0.5] as [number, number, number],
        scale: 0.24,
        flip: true,
      },
    ]
  }, [])
  if (!landData) return null
  return (
    <>
      <ambientLight intensity={0.03} />

      <Stars count={3500} />
      <LightRays />

      <RotatingGlobe>
        {/* Earth */}
        <EarthPoints radius={GLOBE_R} count={5000} landData={landData} />
        <CoastlineGlow radius={GLOBE_R} landData={landData} />
        <OceanPoints radius={GLOBE_R} count={1200} landData={landData} />
        <AccentPoints radius={GLOBE_R} count={35} landData={landData} />
        <AtmosphereGlow radius={GLOBE_R} />
        <InnerGlow radius={GLOBE_R} />

        {/* Plant */}
        {/* <PlantStem />
        {leafConfigs.map((cfg, i) => (
          <DetailedLeaf key={i} {...cfg} />
        ))}
        <LeafBud /> */}

        {/* Roots */}
        {/* <RootSystem /> */}

        {/* Energy */}
        <EnergyParticles />
      </RotatingGlobe>

      <OrbitControls enablePan={false} enableZoom minDistance={2.2} maxDistance={8} autoRotate autoRotateSpeed={0.3} target={[0, 0.3, 0]} />
    </>
  )
}

/* ══════════════════════════════════════════════
   EXPORTED COMPONENT
   ══════════════════════════════════════════════ */

export default function GlobeScene() {
  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden">
      <Canvas
        camera={{ position: [0, 1.0, 2.5], fov: 50, near: 0.1, far: 100 }}
        dpr={[1, 2]}
        gl={{ antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.2 }}
        style={{ background: "transparent" }}
        onCreated={({ gl }) => { gl.setClearColor(0x000000, 0) }}
      >
        <AdaptiveDpr pixelated />
        <Scene />
      </Canvas>
    </div>
  )
}
