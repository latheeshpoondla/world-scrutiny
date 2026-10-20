"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/** Soft round sprite so points render as glowing dots instead of squares. */
function makeDot() {
  const c = document.createElement("canvas")
  c.width = c.height = 64
  const g = c.getContext("2d")!
  const grd = g.createRadialGradient(32, 32, 0, 32, 32, 32)
  grd.addColorStop(0, "rgba(255,255,255,1)")
  grd.addColorStop(0.35, "rgba(255,255,255,0.7)")
  grd.addColorStop(1, "rgba(255,255,255,0)")
  g.fillStyle = grd
  g.fillRect(0, 0, 64, 64)
  return new THREE.CanvasTexture(c)
}

/* A golden/green neural "living network" sphere: fibonacci-distributed nodes,
   short-range links, travelling light pulses, orbit rings and a breathing core. */

const R = 1.35

function fibonacciSphere(n: number, r: number) {
  const pts: THREE.Vector3[] = []
  const phi = Math.PI * (Math.sqrt(5) - 1)
  for (let i = 0; i < n; i++) {
    const y = 1 - (i / (n - 1)) * 2
    const rad = Math.sqrt(1 - y * y)
    const t = phi * i
    const jitter = 1 + (Math.random() - 0.5) * 0.08
    pts.push(new THREE.Vector3(Math.cos(t) * rad * r * jitter, y * r * jitter, Math.sin(t) * rad * r * jitter))
  }
  return pts
}

const lineShader = {
  vertexShader: `
    attribute float aProgress;
    attribute float aSeed;
    varying float vProgress;
    varying float vSeed;
    varying float vDepth;
    void main() {
      vProgress = aProgress;
      vSeed = aSeed;
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vDepth = clamp((-mv.z - 2.0) / 4.0, 0.0, 1.0);
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragmentShader: `
    uniform float uTime;
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform float uBase;
    uniform float uSpeed;
    varying float vProgress;
    varying float vSeed;
    varying float vDepth;
    void main() {
      float head = fract(uTime * uSpeed * (0.25 + vSeed * 0.35) + vSeed * 7.0);
      float pulse = smoothstep(0.18, 0.0, abs(vProgress - head));
      vec3 col = mix(uColorA, uColorB, vSeed);
      float base = (0.05 + 0.09 * (1.0 - vDepth)) * uBase;
      gl_FragColor = vec4(col + pulse * 0.9, base + pulse * 0.85 * (1.0 - vDepth * 0.6));
    }
  `,
}

function Network({ count }: { count: number }) {
  const group = useRef<THREE.Group>(null!)
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const arcMat = useRef<THREE.ShaderMaterial>(null!)

  const { pointsGeo, linesGeo, arcsGeo, hubs } = useMemo(() => {
    const pts = fibonacciSphere(count, R)
    const pos = new Float32Array(pts.length * 3)
    const col = new Float32Array(pts.length * 3)
    const gold = new THREE.Color("#f6c96b")
    const mint = new THREE.Color("#7dffc4")
    const white = new THREE.Color("#fffbe8")
    pts.forEach((p, i) => {
      pos.set([p.x, p.y, p.z], i * 3)
      const c = Math.random() < 0.6 ? gold : Math.random() < 0.8 ? mint : white
      col.set([c.r, c.g, c.b], i * 3)
    })
    const pGeo = new THREE.BufferGeometry()
    pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    pGeo.setAttribute("color", new THREE.BufferAttribute(col, 3))

    const lp: number[] = []
    const prog: number[] = []
    const seed: number[] = []
    const maxD = R * 0.3
    for (let i = 0; i < pts.length; i++) {
      let links = 0
      for (let j = i + 1; j < pts.length && links < 3; j++) {
        if (pts[i].distanceTo(pts[j]) < maxD) {
          // slight outward arc so links feel organic
          const mid = pts[i].clone().add(pts[j]).multiplyScalar(0.5).normalize().multiplyScalar(R * 1.04)
          const curve = new THREE.QuadraticBezierCurve3(pts[i], mid, pts[j])
          const seg = curve.getPoints(6)
          const s = Math.random()
          for (let k = 0; k < seg.length - 1; k++) {
            lp.push(seg[k].x, seg[k].y, seg[k].z, seg[k + 1].x, seg[k + 1].y, seg[k + 1].z)
            prog.push(k / 6, (k + 1) / 6)
            seed.push(s, s)
          }
          links++
        }
      }
    }
    const lGeo = new THREE.BufferGeometry()
    lGeo.setAttribute("position", new THREE.Float32BufferAttribute(lp, 3))
    lGeo.setAttribute("aProgress", new THREE.Float32BufferAttribute(prog, 1))
    lGeo.setAttribute("aSeed", new THREE.Float32BufferAttribute(seed, 1))

    const hubList = pts.filter(() => Math.random() < 0.03)

    // Long "data flight" arcs between hubs, lifted above the surface
    const ap: number[] = []
    const aprog: number[] = []
    const aseed: number[] = []
    const SEG = 48
    for (let n = 0; n < hubList.length * 2; n++) {
      const a = hubList[Math.floor(Math.random() * hubList.length)]
      const b = hubList[Math.floor(Math.random() * hubList.length)]
      const d = a.distanceTo(b)
      if (a === b || d < R * 0.5) continue
      const lift = R * (1 + d * 0.35)
      const mid = a.clone().add(b).normalize().multiplyScalar(lift)
      const seg = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(SEG)
      const s = Math.random()
      for (let k = 0; k < SEG; k++) {
        ap.push(seg[k].x, seg[k].y, seg[k].z, seg[k + 1].x, seg[k + 1].y, seg[k + 1].z)
        aprog.push(k / SEG, (k + 1) / SEG)
        aseed.push(s, s)
      }
    }
    const aGeo = new THREE.BufferGeometry()
    aGeo.setAttribute("position", new THREE.Float32BufferAttribute(ap, 3))
    aGeo.setAttribute("aProgress", new THREE.Float32BufferAttribute(aprog, 1))
    aGeo.setAttribute("aSeed", new THREE.Float32BufferAttribute(aseed, 1))

    return { pointsGeo: pGeo, linesGeo: lGeo, arcsGeo: aGeo, hubs: hubList }
  }, [count])

  const dot = useMemo(() => makeDot(), [])
  const uniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBase: { value: 0.6 }, uSpeed: { value: 1 }, uColorA: { value: new THREE.Color("#f6c96b") }, uColorB: { value: new THREE.Color("#3ee08f") } }),
    []
  )
  const arcUniforms = useMemo(
    () => ({ uTime: { value: 0 }, uBase: { value: 2.2 }, uSpeed: { value: 0.7 }, uColorA: { value: new THREE.Color("#ffd27a") }, uColorB: { value: new THREE.Color("#7dffc4") } }),
    []
  )

  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime
    if (mat.current) mat.current.uniforms.uTime.value = t
    if (arcMat.current) arcMat.current.uniforms.uTime.value = t
    if (group.current) {
      group.current.rotation.y = t * 0.08 + pointer.x * 0.4
      group.current.rotation.x = THREE.MathUtils.lerp(group.current.rotation.x, -pointer.y * 0.3 + 0.2, 0.05)
    }
  })

  return (
    <group ref={group}>
      <lineSegments geometry={linesGeo}>
        <shaderMaterial
          ref={mat}
          uniforms={uniforms}
          vertexShader={lineShader.vertexShader}
          fragmentShader={lineShader.fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <lineSegments geometry={arcsGeo}>
        <shaderMaterial
          ref={arcMat}
          uniforms={arcUniforms}
          vertexShader={lineShader.vertexShader}
          fragmentShader={lineShader.fragmentShader}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </lineSegments>
      <points geometry={pointsGeo}>
        <pointsMaterial map={dot} vertexColors size={0.08} sizeAttenuation transparent opacity={0.95} depthWrite={false} blending={THREE.AdditiveBlending} />
      </points>
      {hubs.map((p, i) => (
        <Hub key={i} position={p} delay={i * 0.7} />
      ))}
    </group>
  )
}

function Hub({ position, delay }: { position: THREE.Vector3; delay: number }) {
  const ref = useRef<THREE.Mesh>(null!)
  useFrame(({ clock }) => {
    const s = 1 + Math.sin(clock.elapsedTime * 2 + delay) * 0.35
    ref.current?.scale.setScalar(s)
  })
  return (
    <mesh ref={ref} position={position}>
      <sphereGeometry args={[0.035, 12, 12]} />
      <meshBasicMaterial color="#fff1c2" transparent opacity={0.9} blending={THREE.AdditiveBlending} />
    </mesh>
  )
}

function Core() {
  const ref = useRef<THREE.Mesh>(null!)
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        uniforms: { uTime: { value: 0 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; void main(){ vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform float uTime; varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(normalize(vV), vN)), 2.2); vec3 c = mix(vec3(0.96,0.78,0.42), vec3(0.24,0.88,0.56), 0.5 + 0.5*sin(uTime*0.6)); gl_FragColor = vec4(c, f*0.22); }`,
      }),
    []
  )
  useFrame(({ clock }) => {
    material.uniforms.uTime.value = clock.elapsedTime
    ref.current?.scale.setScalar(1 + Math.sin(clock.elapsedTime * 0.9) * 0.03)
  })
  return (
    <mesh ref={ref} material={material}>
      <sphereGeometry args={[R * 1.06, 64, 64]} />
    </mesh>
  )
}

function Rings() {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock }) => {
    if (!ref.current) return
    ref.current.children.forEach((c, i) => {
      c.rotation.z = clock.elapsedTime * (0.05 + i * 0.03) * (i % 2 ? -1 : 1)
    })
  })
  return (
    <group ref={ref}>
      {[
        { r: R * 1.45, tilt: [1.2, 0.2, 0], color: "#f6c96b", o: 0.35 },
        { r: R * 1.65, tilt: [1.4, -0.5, 0], color: "#7dffc4", o: 0.22 },
        { r: R * 1.9, tilt: [1.0, 0.6, 0], color: "#c4f56a", o: 0.14 },
      ].map((ring, i) => (
        <group key={i} rotation={ring.tilt as [number, number, number]}>
          <mesh>
            <torusGeometry args={[ring.r, 0.0035, 8, 200]} />
            <meshBasicMaterial color={ring.color} transparent opacity={ring.o} blending={THREE.AdditiveBlending} />
          </mesh>
          <mesh position={[ring.r, 0, 0]}>
            <sphereGeometry args={[0.03, 10, 10]} />
            <meshBasicMaterial color={ring.color} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

function Dust() {
  const ref = useRef<THREE.Points>(null!)
  const dot = useMemo(() => makeDot(), [])
  const geo = useMemo(() => {
    const n = 500
    const pos = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = R * (1.6 + Math.random() * 2.2)
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      pos.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3))
    return g
  }, [])
  useFrame(({ clock }) => {
    if (ref.current) ref.current.rotation.y = -clock.elapsedTime * 0.02
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial map={dot} color="#f6dca0" size={0.04} transparent opacity={0.55} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

/** Intro: the whole orb scales up from a seed and spins into place on its own. */
function Intro({ children, onReady }: { children: React.ReactNode; onReady?: () => void }) {
  const ref = useRef<THREE.Group>(null!)
  const clock = useThree((st) => st.clock)
  const [start] = useState(() => clock.elapsedTime)
  useEffect(() => {
    onReady?.()
  }, [onReady])
  useFrame(({ clock }) => {
    const k = Math.min((clock.elapsedTime - start) / 2.4, 1)
    const e = 1 - Math.pow(1 - k, 4)
    if (ref.current) {
      ref.current.scale.setScalar(0.35 + 0.65 * e)
      ref.current.rotation.y = (1 - e) * -2.2
      ref.current.rotation.z = (1 - e) * 0.6
    }
  })
  return <group ref={ref}>{children}</group>
}

export default function NetworkOrb({ active = true, onReady }: { active?: boolean; onReady?: () => void }) {
  const [small] = useState(() => typeof window !== "undefined" && window.innerWidth < 768)
  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 0, 5.2], fov: 45 }}
        dpr={[1, small ? 1.25 : 1.75]}
        gl={{ alpha: true, antialias: true }}
        resize={{ scroll: false }}
        style={{ touchAction: "pan-y" }}
      >
        <Intro onReady={onReady}>
          <Core />
          <Network count={small ? 300 : 460} />
          <Rings />
        </Intro>
        <Dust />
      </Canvas>
    </div>
  )
}
