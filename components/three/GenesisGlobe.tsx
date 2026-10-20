"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import * as THREE from "three"

/*
  "Genesis": a dotted data-earth with an atmosphere, energy ripples and light arcs
  from Calicut to the world, with a faceted crystal sprout (the WS logo's three leaves)
  growing from the north pole. Everything plays a short intro on its own.
*/

const R = 1
const D2R = Math.PI / 180
const clamp01 = (x: number) => Math.min(Math.max(x, 0), 1)
const easeOut = (x: number) => 1 - Math.pow(1 - clamp01(x), 3)
const easeBack = (x: number) => {
  const t = clamp01(x)
  const c1 = 1.5
  return 1 + (c1 + 1) * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2)
}

function latLng(lat: number, lng: number, r = R) {
  const phi = (90 - lat) * D2R
  const theta = (lng + 180) * D2R
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta))
}

function glowTexture() {
  const c = document.createElement("canvas")
  c.width = c.height = 128
  const g = c.getContext("2d")!
  const grd = g.createRadialGradient(64, 64, 0, 64, 64, 64)
  grd.addColorStop(0, "rgba(255,255,255,1)")
  grd.addColorStop(0.2, "rgba(255,255,255,0.55)")
  grd.addColorStop(0.5, "rgba(255,255,255,0.12)")
  grd.addColorStop(1, "rgba(255,255,255,0)")
  g.fillStyle = grd
  g.fillRect(0, 0, 128, 128)
  return new THREE.CanvasTexture(c)
}

function useLandMask(src: string) {
  const [data, setData] = useState<ImageData | null>(null)
  useEffect(() => {
    const img = new Image()
    img.onload = () => {
      const c = document.createElement("canvas")
      c.width = img.width
      c.height = img.height
      const ctx = c.getContext("2d")!
      ctx.drawImage(img, 0, 0)
      setData(ctx.getImageData(0, 0, img.width, img.height))
    }
    img.src = src
  }, [src])
  return data
}

function isLand(img: ImageData, lat: number, lng: number) {
  const x = Math.floor(((lng + 180) / 360) * img.width) % img.width
  const y = Math.floor(((90 - lat) / 180) * img.height) % img.height
  return img.data[(y * img.width + x) * 4] < 80
}

/* ── Dotted earth ───────────────────────────────── */

const dotShader = {
  vertex: /* glsl */ `
    attribute float aRand;
    uniform float uTime;
    uniform float uReveal;
    uniform float uSize;
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      vec3 n = normalize(position);
      float polar = acos(clamp(n.y, -1.0, 1.0));                  // 0 at north pole
      float rev = smoothstep(polar - 0.35, polar, uReveal * 3.6);  // sweep from the pole down
      float ripple = pow(max(0.0, sin(polar * 7.0 - uTime * 1.6)), 14.0) * smoothstep(1.9, 0.0, polar);
      float twinkle = 0.65 + 0.35 * sin(uTime * 1.7 + aRand * 60.0);
      vec4 mv = modelViewMatrix * vec4(position, 1.0);
      vec3 vn = normalize(normalMatrix * n);
      float limb = smoothstep(-0.05, 0.45, dot(vn, normalize(-mv.xyz)));
      vAlpha = rev * (0.25 + 0.75 * limb) * twinkle;
      vec3 base = mix(vec3(0.16, 0.78, 0.5), vec3(0.5, 1.0, 0.84), aRand);
      if (aRand > 0.975) base = vec3(0.86, 1.0, 0.55);
      vColor = base + ripple * vec3(0.7, 1.0, 0.6);
      gl_PointSize = uSize * (1.0 + ripple * 1.4) * rev / -mv.z;
      gl_Position = projectionMatrix * mv;
    }
  `,
  fragment: /* glsl */ `
    varying float vAlpha;
    varying vec3 vColor;
    void main() {
      float d = length(gl_PointCoord - 0.5);
      if (d > 0.5) discard;
      gl_FragColor = vec4(vColor, smoothstep(0.5, 0.15, d) * vAlpha);
    }
  `,
}

function DotEarth({ land, start }: { land: ImageData; start: number }) {
  const mat = useRef<THREE.ShaderMaterial>(null!)
  const { gl } = useThree()
  const geo = useMemo(() => {
    const pos: number[] = []
    const rnd: number[] = []
    const step = 1.3
    for (let lat = -82; lat <= 84; lat += step) {
      const n = Math.max(8, Math.floor((360 * Math.cos(lat * D2R)) / step))
      for (let i = 0; i < n; i++) {
        const lng = -180 + (i * 360) / n
        if (!isLand(land, lat, lng)) continue
        const v = latLng(lat, lng, R)
        pos.push(v.x, v.y, v.z)
        rnd.push(Math.random())
      }
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
    g.setAttribute("aRand", new THREE.Float32BufferAttribute(rnd, 1))
    return g
  }, [land])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uReveal: { value: 0 }, uSize: { value: 14 * Math.min(gl.getPixelRatio(), 2) } }), [gl])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    uniforms.uTime.value = t
    uniforms.uReveal.value = easeOut(t / 2.6)
  })

  return (
    <points geometry={geo}>
      <shaderMaterial ref={mat} uniforms={uniforms} vertexShader={dotShader.vertex} fragmentShader={dotShader.fragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function Body({ start }: { start: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        uniforms: { uTime: { value: 0 }, uReveal: { value: 0 } },
        vertexShader: `varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){ vP = normalize(position); vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`,
        fragmentShader: `uniform float uTime; uniform float uReveal; varying vec3 vN; varying vec3 vV; varying vec3 vP;
          void main(){
            float f = pow(1.0 - max(dot(normalize(vV), vN), 0.0), 2.4);
            vec3 col = mix(vec3(0.006,0.035,0.024), vec3(0.03,0.17,0.11), f);
            float lat = asin(clamp(vP.y,-1.0,1.0));
            float lon = atan(vP.z, vP.x);
            float grid = max(smoothstep(0.992,1.0,abs(cos(lat*9.0))), smoothstep(0.992,1.0,abs(cos(lon*9.0)))) * 0.06;
            float scan = smoothstep(0.035, 0.0, abs(vP.y - sin(uTime*0.35))) * 0.18;
            col += vec3(0.25,1.0,0.65) * (f*0.4 + grid + scan);
            gl_FragColor = vec4(col, uReveal);
          }`,
      }),
    []
  )
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    material.uniforms.uTime.value = t
    material.uniforms.uReveal.value = easeOut(t / 1.4)
  })
  return (
    <mesh material={material} renderOrder={-1}>
      <sphereGeometry args={[R * 0.995, 96, 96]} />
    </mesh>
  )
}

function Atmosphere({ start }: { start: number }) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        transparent: true,
        depthWrite: false,
        side: THREE.BackSide,
        blending: THREE.AdditiveBlending,
        uniforms: { uReveal: { value: 0 } },
        vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
        fragmentShader: `uniform float uReveal; varying vec3 vN;
          void main(){ float i = pow(0.62 - dot(vN, vec3(0.0,0.0,1.0)), 4.0);
            vec3 c = mix(vec3(0.2,1.0,0.6), vec3(0.25,0.85,1.0), vN.y*0.5+0.5);
            gl_FragColor = vec4(c, i * 0.5 * uReveal); }`,
      }),
    []
  )
  useFrame(({ clock }) => {
    material.uniforms.uReveal.value = easeOut((clock.elapsedTime - start) / 2)
  })
  return (
    <mesh material={material}>
      <sphereGeometry args={[R * 1.14, 64, 64]} />
    </mesh>
  )
}

/* ── Light arcs from Calicut to the world ───────── */

const HOME: [number, number] = [11.32, 75.93]
const CITIES: [number, number][] = [
  [51.5, -0.12], [40.7, -74.0], [35.7, 139.7], [-33.9, 151.2], [-33.9, 18.4], [-23.5, -46.6],
  [25.2, 55.3], [37.8, -122.4], [1.35, 103.8], [-1.3, 36.8], [55.75, 37.6], [19.4, -99.1],
]

const arcShader = {
  vertex: `attribute float aT; attribute float aSeed; varying float vT; varying float vSeed;
    void main(){ vT = aT; vSeed = aSeed; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragment: `uniform float uTime; uniform float uShow; varying float vT; varying float vSeed;
    void main(){
      float head = fract(uTime*0.28 + vSeed);
      float pulse = smoothstep(0.12, 0.0, abs(vT - head)) * step(vT, head + 0.001);
      float drawn = step(vT, uShow);
      vec3 c = mix(vec3(0.97,0.8,0.42), vec3(0.5,1.0,0.8), vT);
      gl_FragColor = vec4(c + pulse*0.6, (0.12 + pulse*0.9) * drawn);
    }`,
}

function Arcs({ start, glow }: { start: number; glow: THREE.Texture }) {
  const { geo, ends } = useMemo(() => {
    const p: number[] = []
    const tt: number[] = []
    const sd: number[] = []
    const a = latLng(HOME[0], HOME[1], R)
    const SEG = 64
    const endPts: THREE.Vector3[] = []
    CITIES.forEach(([lat, lng], i) => {
      const b = latLng(lat, lng, R)
      endPts.push(b)
      const mid = a.clone().add(b).normalize().multiplyScalar(R + a.distanceTo(b) * 0.38)
      const pts = new THREE.QuadraticBezierCurve3(a, mid, b).getPoints(SEG)
      for (let k = 0; k < SEG; k++) {
        p.push(pts[k].x, pts[k].y, pts[k].z, pts[k + 1].x, pts[k + 1].y, pts[k + 1].z)
        tt.push(k / SEG, (k + 1) / SEG)
        sd.push(i / CITIES.length, i / CITIES.length)
      }
    })
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.Float32BufferAttribute(p, 3))
    g.setAttribute("aT", new THREE.Float32BufferAttribute(tt, 1))
    g.setAttribute("aSeed", new THREE.Float32BufferAttribute(sd, 1))
    return { geo: g, ends: endPts }
  }, [])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uShow: { value: 0 } }), [])
  const homeRef = useRef<THREE.Sprite>(null!)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    uniforms.uTime.value = t
    uniforms.uShow.value = easeOut((t - 2.2) / 2.2)
    homeRef.current?.scale.setScalar((0.16 + Math.sin(t * 3) * 0.03) * easeOut((t - 2) / 1))
  })

  const home = latLng(HOME[0], HOME[1], R * 1.005)
  return (
    <group>
      <lineSegments geometry={geo}>
        <shaderMaterial uniforms={uniforms} vertexShader={arcShader.vertex} fragmentShader={arcShader.fragment} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </lineSegments>
      <sprite ref={homeRef} position={home}>
        <spriteMaterial map={glow} color="#ffd27a" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      {ends.map((e, i) => (
        <CityPing key={i} position={e} delay={i * 0.4} start={start} glow={glow} />
      ))}
    </group>
  )
}

function CityPing({ position, delay, start, glow }: { position: THREE.Vector3; delay: number; start: number; glow: THREE.Texture }) {
  const ref = useRef<THREE.Sprite>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    const show = easeOut((t - 3.4 - delay * 0.25) / 0.8)
    ref.current?.scale.setScalar((0.07 + Math.sin(t * 2.2 + delay) * 0.015) * show)
  })
  return (
    <sprite ref={ref} position={position.clone().multiplyScalar(1.005)}>
      <spriteMaterial map={glow} color="#9dffd6" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
    </sprite>
  )
}

/* ── Crystal sprout ─────────────────────────────── */

const STEM = new THREE.CatmullRomCurve3([
  new THREE.Vector3(0, -0.03, 0),
  new THREE.Vector3(0.03, 0.22, 0.01),
  new THREE.Vector3(-0.035, 0.5, -0.01),
  new THREE.Vector3(0.015, 0.76, 0.01),
  new THREE.Vector3(0, 0.98, 0),
])
const STEM_R = 0.03

function Stem({ start }: { start: number }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uGrow: { value: 0 } }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    uniforms.uTime.value = t
    uniforms.uGrow.value = easeOut((t - 1.2) / 1.8)
  })
  const vertex = `uniform float uGrow; varying vec2 vUv; varying vec3 vN; varying vec3 vV; uniform float uR; uniform float uTaper;
    void main(){ vUv = uv; vec3 center = position - normal * uR; vec3 p = center + normal * uR * mix(1.0, uTaper, uv.x);
      vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(p,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`
  return (
    <group>
      <mesh>
        <tubeGeometry args={[STEM, 96, STEM_R, 12, false]} />
        <shaderMaterial
          uniforms={{ ...uniforms, uR: { value: STEM_R }, uTaper: { value: 0.4 } }}
          vertexShader={vertex}
          fragmentShader={`uniform float uTime; uniform float uGrow; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
            void main(){ if (vUv.x > uGrow) discard;
              float f = pow(1.0 - abs(dot(normalize(vV), normalize(vN))), 2.0);
              vec3 col = mix(vec3(0.04,0.42,0.2), vec3(0.6,1.0,0.62), vUv.x);
              float flow = smoothstep(0.1, 0.0, abs(fract(vUv.x*2.0 - uTime*0.5) - 0.5));
              float tip = smoothstep(0.06, 0.0, uGrow - vUv.x) * step(uGrow, 0.995);
              col += vec3(0.6,1.0,0.75)*(flow*0.45 + f*0.7) + vec3(0.9,1.0,0.7)*tip*1.5;
              gl_FragColor = vec4(col, 1.0); }`}
        />
      </mesh>
      {/* soft halo around the stem */}
      <mesh>
        <tubeGeometry args={[STEM, 96, STEM_R * 3.2, 12, false]} />
        <shaderMaterial
          uniforms={{ ...uniforms, uR: { value: STEM_R * 3.2 }, uTaper: { value: 0.5 } }}
          vertexShader={vertex}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          fragmentShader={`uniform float uGrow; varying vec2 vUv; varying vec3 vN; varying vec3 vV;
            void main(){ if (vUv.x > uGrow) discard; float c = pow(abs(dot(normalize(vV), normalize(vN))), 2.5);
              gl_FragColor = vec4(vec3(0.3,1.0,0.6), c*0.22); }`}
        />
      </mesh>
    </group>
  )
}

/** Faceted leaf: a low-poly grid folded along the midrib, flat-shaded like cut glass. */
function leafGeometry(len: number, width: number, fold = 0.3, curl = 0.1, rows = 7) {
  const cols = [-1, -0.5, 0, 0.5, 1]
  const grid: THREE.Vector3[][] = []
  const uvs: [number, number][][] = []
  for (let i = 0; i <= rows; i++) {
    const t = i / rows
    const w = i === rows ? 0 : width * (0.1 + 0.9 * Math.pow(Math.sin(Math.PI * Math.min(t * 1.08, 1)), 0.8)) * (1 - 0.25 * t)
    grid.push(
      cols.map((c) => {
        const ridge = fold * w * (1 - Math.abs(c))
        const jag = (i % 2 ? 0.012 : -0.012) * Math.abs(c) * width * 4
        return new THREE.Vector3(c * w, t * len, ridge - curl * len * t * t + jag)
      })
    )
    uvs.push(cols.map((c) => [(c + 1) / 2, t]))
  }
  const pos: number[] = []
  const uv: number[] = []
  const push = (i: number, j: number) => {
    const v = grid[i][j]
    pos.push(v.x, v.y, v.z)
    uv.push(...uvs[i][j])
  }
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols.length - 1; j++) {
      push(i, j); push(i + 1, j); push(i + 1, j + 1)
      push(i, j); push(i + 1, j + 1); push(i, j + 1)
    }
  }
  const g = new THREE.BufferGeometry()
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3))
  g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

const leafFragment = /* glsl */ `
  uniform float uTime; uniform float uOpacity;
  varying vec3 vN; varying vec2 vUv; varying vec3 vV;
  void main(){
    vec3 n = normalize(vN); if (!gl_FrontFacing) n = -n;
    vec3 L = normalize(vec3(0.55, 0.75, 0.6));
    float diff = 0.3 + 0.7 * max(dot(n, L), 0.0);
    float f = pow(1.0 - abs(dot(normalize(vV), n)), 2.0);
    vec3 deep = vec3(0.02, 0.34, 0.17);
    vec3 bright = vec3(0.42, 1.0, 0.6);
    vec3 lime = vec3(0.8, 0.97, 0.42);
    vec3 col = mix(deep, bright, clamp(vUv.y * 0.7 + diff * 0.35, 0.0, 1.0));
    col = mix(col, lime, smoothstep(0.55, 1.0, vUv.y) * 0.35);
    col *= 0.55 + diff * 0.75;
    float sheen = smoothstep(0.12, 0.0, abs(vUv.y - fract(uTime * 0.22))) * 0.45;
    col += vec3(0.6, 1.0, 0.8) * (f * 0.55 + sheen);
    gl_FragColor = vec4(col, (0.82 + f * 0.18) * uOpacity);
  }
`

type LeafCfg = { at: number; len: number; width: number; rot: [number, number, number]; delay: number }
const LEAVES: LeafCfg[] = [
  { at: 0.4, len: 0.72, width: 0.3, rot: [0.25, 0.15, 1.0], delay: 2.0 },
  { at: 0.58, len: 0.9, width: 0.36, rot: [-0.2, -0.15, -0.92], delay: 2.4 },
  { at: 0.995, len: 0.46, width: 0.17, rot: [0.05, 0, 0.08], delay: 2.9 },
]

function Leaf({ cfg, start, glow }: { cfg: LeafCfg; start: number; glow: THREE.Texture }) {
  const group = useRef<THREE.Group>(null!)
  const edgeMat = useRef<THREE.LineBasicMaterial>(null!)
  const { geo, edges } = useMemo(() => {
    const g = leafGeometry(cfg.len, cfg.width)
    return { geo: g, edges: new THREE.EdgesGeometry(g, 1) }
  }, [cfg.len, cfg.width])
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uOpacity: { value: 0 } }), [])
  const pos = STEM.getPoint(cfg.at)

  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    const k = easeBack((t - cfg.delay) / 1.3)
    const o = easeOut((t - cfg.delay) / 0.6)
    uniforms.uTime.value = t + cfg.delay
    uniforms.uOpacity.value = o
    if (edgeMat.current) edgeMat.current.opacity = 0.5 * o
    if (group.current) {
      group.current.scale.setScalar(Math.max(k, 0.0001))
      group.current.rotation.z = cfg.rot[2] + Math.sin(t * 0.9 + cfg.at * 5) * 0.05
    }
  })

  return (
    <group ref={group} position={pos} rotation={cfg.rot}>
      <mesh geometry={geo}>
        <shaderMaterial
          uniforms={uniforms}
          vertexShader={`varying vec3 vN; varying vec2 vUv; varying vec3 vV; void main(){ vUv = uv; vN = normalize(normalMatrix*normal); vec4 mv = modelViewMatrix*vec4(position,1.0); vV = -mv.xyz; gl_Position = projectionMatrix*mv; }`}
          fragmentShader={leafFragment}
          transparent
          side={THREE.DoubleSide}
          depthWrite={false}
        />
      </mesh>
      <lineSegments geometry={edges}>
        <lineBasicMaterial ref={edgeMat} color="#9dffd0" transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </lineSegments>
      <sprite position={[0, cfg.len * 0.45, 0.02]} scale={[cfg.len * 1.5, cfg.len * 1.5, 1]}>
        <spriteMaterial map={glow} color="#3ee08f" opacity={0.35} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

function Spores({ start, glow }: { start: number; glow: THREE.Texture }) {
  const ref = useRef<THREE.Points>(null!)
  const N = 140
  const { geo, speed } = useMemo(() => {
    const p = new Float32Array(N * 3)
    const s = new Float32Array(N)
    for (let i = 0; i < N; i++) {
      const a = Math.random() * Math.PI * 2
      const r = 0.1 + Math.random() * 0.7
      p.set([Math.cos(a) * r, Math.random() * 1.8, Math.sin(a) * r], i * 3)
      s[i] = 0.002 + Math.random() * 0.005
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(p, 3))
    return { geo: g, speed: s }
  }, [])
  useFrame(({ clock }) => {
    if (!ref.current) return
    const attr = ref.current.geometry.attributes.position as THREE.BufferAttribute
    for (let i = 0; i < N; i++) {
      let y = attr.getY(i) + speed[i]
      if (y > 1.9) y = 0
      attr.setY(i, y)
      attr.setX(i, attr.getX(i) * 1.0008)
      attr.setZ(i, attr.getZ(i) * 1.0008)
      if (y === 0) {
        const a = Math.random() * Math.PI * 2
        const r = 0.1 + Math.random() * 0.5
        attr.setX(i, Math.cos(a) * r)
        attr.setZ(i, Math.sin(a) * r)
      }
    }
    attr.needsUpdate = true
    ;(ref.current.material as THREE.PointsMaterial).opacity = 0.75 * easeOut((clock.elapsedTime - start - 2.5) / 1.5)
  })
  return (
    <points ref={ref} geometry={geo}>
      <pointsMaterial map={glow} color="#a6ffcf" size={0.05} transparent opacity={0} depthWrite={false} blending={THREE.AdditiveBlending} />
    </points>
  )
}

function BaseHalo({ start, glow }: { start: number; glow: THREE.Texture }) {
  const uniforms = useMemo(() => ({ uTime: { value: 0 }, uShow: { value: 0 } }), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    uniforms.uTime.value = t
    uniforms.uShow.value = easeOut((t - 1) / 1.2)
  })
  return (
    <group>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.012, 0]}>
        <circleGeometry args={[0.42, 64]} />
        <shaderMaterial
          uniforms={uniforms}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
          vertexShader={`varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`}
          fragmentShader={`uniform float uTime; uniform float uShow; varying vec2 vP;
            void main(){ float r = length(vP) / 0.42;
              float rings = pow(max(0.0, sin(r*18.0 - uTime*3.0)), 10.0);
              float a = (rings*0.7 + 0.25*(1.0-r)) * (1.0 - r) * uShow;
              gl_FragColor = vec4(vec3(0.45,1.0,0.7), a); }`}
        />
      </mesh>
      <sprite position={[0, 0.03, 0]} scale={[0.7, 0.7, 1]}>
        <spriteMaterial map={glow} color="#5dffa8" opacity={0.6} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

function Sprout({ start, glow }: { start: number; glow: THREE.Texture }) {
  const ref = useRef<THREE.Group>(null!)
  const budRef = useRef<THREE.Sprite>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    if (ref.current) ref.current.rotation.y = Math.sin(t * 0.35) * 0.55
    budRef.current?.scale.setScalar((0.32 + Math.sin(t * 2) * 0.05) * easeOut((t - 3) / 0.8))
  })
  const tip = STEM.getPoint(1)
  return (
    <group ref={ref} position={[0, R, 0]}>
      <BaseHalo start={start} glow={glow} />
      <Stem start={start} />
      {LEAVES.map((cfg, i) => (
        <Leaf key={i} cfg={cfg} start={start} glow={glow} />
      ))}
      <sprite ref={budRef} position={[tip.x, tip.y + 0.42, tip.z]}>
        <spriteMaterial map={glow} color="#e4ffb0" transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
      <Spores start={start} glow={glow} />
    </group>
  )
}

/* ── Orbits and backdrop ───────────────────────── */

function Orbit({ radius, tilt, speed, color, start, glow, delay }: { radius: number; tilt: [number, number, number]; speed: number; color: string; start: number; glow: THREE.Texture; delay: number }) {
  const sat = useRef<THREE.Sprite>(null!)
  const ring = useRef<THREE.MeshBasicMaterial>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime - start
    const show = easeOut((t - delay) / 1.5)
    if (ring.current) ring.current.opacity = 0.22 * show
    if (sat.current) {
      sat.current.position.set(Math.cos(t * speed) * radius, Math.sin(t * speed) * radius, 0)
      sat.current.scale.setScalar(0.12 * show)
    }
  })
  return (
    <group rotation={tilt}>
      <mesh>
        <torusGeometry args={[radius, 0.0025, 6, 220]} />
        <meshBasicMaterial ref={ring} color={color} transparent opacity={0} blending={THREE.AdditiveBlending} depthWrite={false} />
      </mesh>
      <sprite ref={sat}>
        <spriteMaterial map={glow} color={color} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </sprite>
    </group>
  )
}

function Starfield() {
  const geo = useMemo(() => {
    const n = 900
    const p = new Float32Array(n * 3)
    for (let i = 0; i < n; i++) {
      const r = 8 + Math.random() * 12
      const th = Math.random() * Math.PI * 2
      const ph = Math.acos(2 * Math.random() - 1)
      p.set([r * Math.sin(ph) * Math.cos(th), r * Math.cos(ph), r * Math.sin(ph) * Math.sin(th)], i * 3)
    }
    const g = new THREE.BufferGeometry()
    g.setAttribute("position", new THREE.BufferAttribute(p, 3))
    return g
  }, [])
  return (
    <points geometry={geo}>
      <pointsMaterial color="#cfeee0" size={0.035} transparent opacity={0.55} depthWrite={false} />
    </points>
  )
}

function Rig({ children, start }: { children: React.ReactNode; start: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ pointer, clock }) => {
    if (!ref.current) return
    const t = clock.elapsedTime - start
    const intro = easeOut(t / 2.4)
    ref.current.scale.setScalar(0.72 + 0.28 * intro)
    ref.current.position.y = -0.4 * (1 - intro)
    ref.current.rotation.x = THREE.MathUtils.lerp(ref.current.rotation.x, 0.12 - pointer.y * 0.1, 0.04)
    ref.current.rotation.z = THREE.MathUtils.lerp(ref.current.rotation.z, -pointer.x * 0.06, 0.04)
  })
  return <group ref={ref}>{children}</group>
}

function Spin({ children, start }: { children: React.ReactNode; start: number }) {
  const ref = useRef<THREE.Group>(null!)
  useFrame(({ clock, pointer }) => {
    const t = clock.elapsedTime - start
    if (ref.current) ref.current.rotation.y = 3.15 + t * 0.07 + (1 - easeOut(t / 3)) * -0.8 + pointer.x * 0.25
  })
  return <group ref={ref}>{children}</group>
}

function World({ land, onReady }: { land: ImageData; onReady?: () => void }) {
  const clock = useThree((s) => s.clock)
  const [start] = useState(() => clock.elapsedTime)
  const glow = useMemo(() => glowTexture(), [])
  useEffect(() => {
    onReady?.()
  }, [onReady])

  return (
    <Rig start={start}>
      <Body start={start} />
      <Atmosphere start={start} />
      <Spin start={start}>
        <DotEarth land={land} start={start} />
        <Arcs start={start} glow={glow} />
      </Spin>
      <Sprout start={start} glow={glow} />
      <Orbit radius={1.45} tilt={[1.35, 0.25, 0]} speed={0.35} color="#7dffc4" start={start} glow={glow} delay={2.6} />
      <Orbit radius={1.7} tilt={[1.15, -0.45, 0.2]} speed={-0.22} color="#f6c96b" start={start} glow={glow} delay={3.1} />
    </Rig>
  )
}

function Scene({ onReady }: { onReady?: () => void }) {
  const land = useLandMask("/WS_Media/dev/earth-map.jpg")
  return (
    <>
      <Starfield />
      {land && <World land={land} onReady={onReady} />}
    </>
  )
}

export default function GenesisGlobe({ active = true, onReady }: { active?: boolean; onReady?: () => void }) {
  const [dpr] = useState(() => (typeof window !== "undefined" && window.innerWidth < 768 ? 1.25 : 1.75))
  return (
    <div className="absolute inset-0">
      <Canvas
        frameloop={active ? "always" : "never"}
        camera={{ position: [0, 1.05, 5.5], fov: 40, near: 0.1, far: 60 }}
        onCreated={({ camera }) => camera.lookAt(0, 0.62, 0)}
        dpr={[1, dpr]}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        resize={{ scroll: false }}
        style={{ touchAction: "pan-y" }}
      >
        <Scene onReady={onReady} />
      </Canvas>
    </div>
  )
}
