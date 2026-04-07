"use client";

import { useRef, useMemo, useEffect, useCallback, useState, Suspense } from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { CameraControls, Environment, ContactShadows, AccumulativeShadows, RandomizedLight } from "@react-three/drei";
import { EffectComposer, N8AO, Bloom, SMAA, ToneMapping } from "@react-three/postprocessing";
import { BlendFunction, ToneMappingMode } from "postprocessing";
import * as THREE from "three";
import { ProfileConfig, CameraPreset, getCameraPresets } from "@/lib/data";

// ─── Geometry ─────────────────────────────────────────────────────────────────

/**
 * Build the cross-section shape for ExtrudeGeometry.
 * Adds a subtle fillet at wave base/crest transitions via intermediate points,
 * and a tiny stiffening rib in each flat zone (matches real product geometry).
 */
/**
 * Helper: trace one wave period on the shape (outer or inner surface).
 * dir=+1 → left-to-right (outer), dir=-1 → right-to-left (inner).
 * yOffset shifts the entire profile in Y (0 for outer, -sheetThickness for inner).
 */
function traceWavePeriod(
  shape: THREE.Shape,
  base: number,
  flat: number,
  slopeWidth: number,
  crestWidth: number,
  waveHeight: number,
  r: number,
  cosA: number,
  sinA: number,
  ribH: number,
  ribW: number,
  yOff: number,
  dir: 1 | -1,
) {
  const p = base + flat + slopeWidth + crestWidth + slopeWidth; // period end x
  const ribSign = dir === 1 ? 1 : -1; // rib groove direction

  if (dir === 1) {
    // ── outer: left → right ──────────────────────────────────────
    if (flat > ribW * 3) {
      const rx = base + flat * 0.4;
      shape.lineTo(rx - ribW / 2, yOff);
      shape.lineTo(rx, yOff - ribH * ribSign);
      shape.lineTo(rx + ribW / 2, yOff);
    }
    // flat → left slope
    shape.lineTo(base + flat - r, yOff);
    shape.quadraticCurveTo(base + flat, yOff, base + flat + r * cosA, yOff + r * sinA);
    // left slope
    shape.lineTo(base + flat + slopeWidth - r * cosA, yOff + waveHeight - r * sinA);
    // slope → crest
    shape.quadraticCurveTo(base + flat + slopeWidth, yOff + waveHeight, base + flat + slopeWidth + r, yOff + waveHeight);
    // crest
    shape.lineTo(base + flat + slopeWidth + crestWidth - r, yOff + waveHeight);
    // crest → right slope
    shape.quadraticCurveTo(base + flat + slopeWidth + crestWidth, yOff + waveHeight, base + flat + slopeWidth + crestWidth + r * cosA, yOff + waveHeight - r * sinA);
    // right slope
    shape.lineTo(p - r * cosA, yOff + r * sinA);
    // right slope → flat
    shape.quadraticCurveTo(p, yOff, p + r, yOff);
  } else {
    // ── inner: right → left ──────────────────────────────────────
    // right flat → right slope bottom corner
    shape.lineTo(p + r, yOff);
    shape.quadraticCurveTo(p, yOff, p - r * cosA, yOff + r * sinA);
    // right slope going up-left
    shape.lineTo(base + flat + slopeWidth + crestWidth + r * cosA, yOff + waveHeight - r * sinA);
    // right slope top → crest corner
    shape.quadraticCurveTo(base + flat + slopeWidth + crestWidth, yOff + waveHeight, base + flat + slopeWidth + crestWidth - r, yOff + waveHeight);
    // crest going left
    shape.lineTo(base + flat + slopeWidth + r, yOff + waveHeight);
    // crest → left slope corner
    shape.quadraticCurveTo(base + flat + slopeWidth, yOff + waveHeight, base + flat + slopeWidth - r * cosA, yOff + waveHeight - r * sinA);
    // left slope going down-left
    shape.lineTo(base + flat + r * cosA, yOff + r * sinA);
    // left slope bottom → flat corner
    shape.quadraticCurveTo(base + flat, yOff, base + flat - r, yOff);
    // micro-rib (inverted: groove points upward on inner surface)
    if (flat > ribW * 3) {
      const rx = base + flat * 0.4;
      shape.lineTo(rx + ribW / 2, yOff);
      shape.lineTo(rx, yOff + ribH);
      shape.lineTo(rx - ribW / 2, yOff);
    }
  }
}

function buildTopSheetShape(cfg: ProfileConfig): THREE.Shape {
  const { width, waveHeight, numWaves, crestWidth, slopeWidth, sheetThickness: st } = cfg;
  const period = width / numWaves;
  const flat = (period - crestWidth - 2 * slopeWidth) / 2;
  const halfW = width / 2;

  const r  = Math.min(waveHeight * 0.12, slopeWidth * 0.18, flat * 0.12, 6);
  const angle = Math.atan2(waveHeight, slopeWidth);
  const cosA  = Math.cos(angle);
  const sinA  = Math.sin(angle);
  const ribH  = Math.min(waveHeight * 0.04, 2.5);
  const ribW  = Math.max(slopeWidth * 0.08, 2);

  const shape = new THREE.Shape();

  // ── OUTER SURFACE: left → right at y = 0 ─────────────────────────
  shape.moveTo(-halfW, 0);
  for (let i = 0; i < numWaves; i++) {
    traceWavePeriod(shape, -halfW + i * period, flat, slopeWidth, crestWidth, waveHeight, r, cosA, sinA, ribH, ribW, 0, 1);
  }
  shape.lineTo(halfW, 0);

  // Right edge: down from outer to inner surface
  shape.lineTo(halfW, -st);

  // ── INNER SURFACE: right → left at y = -st ───────────────────────
  // Mirror of outer profile, offset downward by sheetThickness
  for (let i = numWaves - 1; i >= 0; i--) {
    traceWavePeriod(shape, -halfW + i * period, flat, slopeWidth, crestWidth, waveHeight, r, cosA, sinA, ribH, ribW, -st, -1);
  }
  shape.lineTo(-halfW, -st);

  // Left edge: up from inner to outer surface — closes the loop
  shape.closePath();

  return shape;
}


function buildFoamShape(cfg: ProfileConfig): THREE.Shape {
  const { width, waveHeight, numWaves, crestWidth, slopeWidth, sheetThickness: st, coreThickness } = cfg;
  const coreH = coreThickness ?? 0;
  const period = width / numWaves;
  const flat = (period - crestWidth - 2 * slopeWidth) / 2;
  const halfW = width / 2;

  const r = Math.min(waveHeight * 0.12, slopeWidth * 0.18, flat * 0.12, 6);
  const angle = Math.atan2(waveHeight, slopeWidth);
  const cosA = Math.cos(angle);
  const sinA = Math.sin(angle);
  const ribH = Math.min(waveHeight * 0.04, 2.5);
  const ribW = Math.max(slopeWidth * 0.08, 2);

  const shape = new THREE.Shape();
  // Top surface of foam = inner surface of top steel sheet (same wave at y = -st)
  shape.moveTo(-halfW, -st);
  for (let i = 0; i < numWaves; i++) {
    traceWavePeriod(shape, -halfW + i * period, flat, slopeWidth, crestWidth, waveHeight, r, cosA, sinA, ribH, ribW, -st, 1);
  }
  shape.lineTo(halfW, -st);
  // Right edge down
  shape.lineTo(halfW, -st - coreH);
  // Flat bottom
  shape.lineTo(-halfW, -st - coreH);
  // Close (left edge up)
  shape.closePath();

  return shape;
}

function buildInnerFaceShape(cfg: ProfileConfig, ribbed: boolean): THREE.Shape {
  const { width, sheetThickness: st } = cfg;
  const halfW = width / 2;
  const shape = new THREE.Shape();

  if (!ribbed) {
    // Flat: simple rectangle, top at y=0, bottom at y=-st
    shape.moveTo(-halfW, 0);
    shape.lineTo(halfW, 0);
    shape.lineTo(halfW, -st);
    shape.lineTo(-halfW, -st);
    shape.closePath();
    return shape;
  }

  // Micro-ribbed: small trapezoidal stiffening ribs on the visible face (bottom)
  const ribH = Math.min(4, st * 2);
  const ribTopW = 18;
  const ribBaseW = 10;
  const nbRibs = Math.floor(width / 60);
  const spacing = width / nbRibs;

  // Top surface (against foam) — flat
  shape.moveTo(-halfW, 0);
  shape.lineTo(halfW, 0);
  // Right edge down to bottom surface level
  shape.lineTo(halfW, -st);
  // Bottom surface right → left with ribs
  for (let i = nbRibs - 1; i >= 0; i--) {
    const cx = -halfW + i * spacing + spacing / 2;
    const rhs = cx + ribTopW / 2;
    const lhs = cx - ribTopW / 2;
    const rbR = cx + ribBaseW / 2;
    const rbL = cx - ribBaseW / 2;
    shape.lineTo(rhs, -st);
    shape.lineTo(rbR, -(st - ribH));
    shape.lineTo(rbL, -(st - ribH));
    shape.lineTo(lhs, -st);
  }
  shape.lineTo(-halfW, -st);
  shape.closePath();
  return shape;
}

// ─── Panel Mesh ───────────────────────────────────────────────────────────────

function PanelMesh({ cfg, color, reflectivity = 60, innerColor = "#B8B8B8", innerFaceRibbed = false }: { cfg: ProfileConfig; color: string; reflectivity?: number; innerColor?: string; innerFaceRibbed?: boolean }) {
  const topGeo = useMemo(() => {
    const shape = buildTopSheetShape(cfg);
    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: cfg.length,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -cfg.length / 2);
    geo.computeVertexNormals();
    return geo;
  }, [cfg]);

  useEffect(() => () => { topGeo.dispose(); }, [topGeo]);

  const isSandwich = cfg.type === "sandwich";
  const coreH = cfg.coreThickness ?? 0;
  const st = cfg.sheetThickness;

  const foamGeo = useMemo(() => {
    if (!isSandwich || !coreH) return null;
    const shape = buildFoamShape(cfg);
    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: cfg.length,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -cfg.length / 2);
    geo.computeVertexNormals();
    return geo;
  }, [cfg, isSandwich, coreH]);

  useEffect(() => () => { foamGeo?.dispose(); }, [foamGeo]);

  const innerFaceGeo = useMemo(() => {
    if (!isSandwich) return null;
    const shape = buildInnerFaceShape(cfg, innerFaceRibbed);
    const geo = new THREE.ExtrudeGeometry(shape, {
      steps: 1,
      depth: cfg.length,
      bevelEnabled: false,
    });
    geo.translate(0, 0, -cfg.length / 2);
    geo.computeVertexNormals();
    return geo;
  }, [cfg, isSandwich, innerFaceRibbed]);

  useEffect(() => () => { innerFaceGeo?.dispose(); }, [innerFaceGeo]);

  // Lacquered steel: flatShading=true gives crisp face-per-face shading
  // matching the visual appearance of bent sheet metal (each planar face uniform)
  const topMaterial = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(color),
    metalness: 0.60,
    roughness: 0.25,
    clearcoat: 0.9,
    clearcoatRoughness: 0.06,
    reflectivity: 0.88,
    envMapIntensity: 1.5,
    flatShading: true,
  }), [color]);

  useEffect(() => {
    topMaterial.metalness = 0.2 + (reflectivity / 100) * 0.7;
    topMaterial.clearcoat = 0.3 + (reflectivity / 100) * 0.7;
    topMaterial.needsUpdate = true;
  }, [topMaterial, reflectivity]);

  useEffect(() => () => { topMaterial.dispose(); }, [topMaterial]);

  return (
    <group>
      {/* Top lacquered face */}
      <mesh geometry={topGeo} material={topMaterial} castShadow receiveShadow />

      {/* PIR foam core — sandwich only, geometry follows top sheet wave profile */}
      {isSandwich && foamGeo && (
        <mesh geometry={foamGeo} castShadow receiveShadow>
          <meshPhysicalMaterial
            color="#DDD8B4"
            roughness={0.92}
            metalness={0}
            clearcoat={0}
          />
        </mesh>
      )}

      {/* Bottom inner face — sandwich only */}
      {isSandwich && innerFaceGeo && (
        <mesh geometry={innerFaceGeo} position={[0, -(st + coreH), 0]} castShadow receiveShadow>
          <meshPhysicalMaterial
            color={innerColor}
            roughness={0.38}
            metalness={0.75}
            envMapIntensity={0.8}
          />
        </mesh>
      )}
    </group>
  );
}

// ─── Lighting ────────────────────────────────────────────────────────────────

function StudioLighting() {
  return (
    <>
      {/* Key light — strong, front-top-left */}
      <directionalLight
        position={[600, 1800, -800]}
        intensity={2.8}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-bias={-0.0001}
        shadow-camera-near={100}
        shadow-camera-far={8000}
        shadow-camera-left={-800}
        shadow-camera-right={800}
        shadow-camera-top={800}
        shadow-camera-bottom={-800}
      />
      {/* Fill light — soft, opposite side */}
      <directionalLight position={[-800, 600, 1200]} intensity={0.7} />
      {/* Rim light — strong back, creates edge definition */}
      <directionalLight position={[0, 400, 2000]} intensity={1.1} />
      {/* Underside bounce — lights wave valley interiors */}
      <directionalLight position={[0, -800, 0]} intensity={0.45} />
      {/* Soft ambient */}
      <ambientLight intensity={0.40} />
    </>
  );
}

// ─── Post-processing ─────────────────────────────────────────────────────────

function PostFX({ panelWidth }: { panelWidth: number }) {
  return (
    <EffectComposer multisampling={0} enableNormalPass>
      {/* N8AO: ambient occlusion — subtle depth in wave valleys */}
      <N8AO
        aoRadius={panelWidth * 0.03}
        intensity={0.9}
        aoSamples={16}
        denoiseSamples={4}
        denoiseRadius={20}
        distanceFalloff={1.5}
        halfRes
        color="black"
      />
      {/* Subtle bloom on metallic highlights */}
      <Bloom
        luminanceThreshold={0.92}
        luminanceSmoothing={0.12}
        intensity={0.12}
        mipmapBlur
      />
      {/* ACES tone mapping for photographic look */}
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      {/* Quality anti-aliasing */}
      <SMAA />
    </EffectComposer>
  );
}

// ─── Scene Contents ───────────────────────────────────────────────────────────

function SceneContents({
  cfg,
  color,
  activePreset,
  whiteBg,
  reflectivity,
  shadowStrength,
  showGrid,
  logoDataUrl,
  innerColor,
  innerFaceRibbed,
  onExportRegister,
}: {
  cfg: ProfileConfig;
  color: string;
  activePreset: CameraPreset | null;
  whiteBg: boolean;
  reflectivity: number;
  shadowStrength: number;
  showGrid: boolean;
  logoDataUrl: string | null;
  innerColor: string;
  innerFaceRibbed: boolean;
  onExportRegister: (fn: () => void) => void;
}) {
  const controlsRef = useRef<CameraControls>(null);
  const { gl, scene, camera } = useThree();
  const prevPresetId = useRef<string | null>(null);

  useEffect(() => {
    if (!activePreset || !controlsRef.current) return;
    if (prevPresetId.current === activePreset.id) return;
    prevPresetId.current = activePreset.id;
    controlsRef.current.setLookAt(
      activePreset.position[0], activePreset.position[1], activePreset.position[2],
      activePreset.target[0],   activePreset.target[1],   activePreset.target[2],
      true
    );
  }, [activePreset]);

  useEffect(() => {
    onExportRegister(() => {
      const prevBgColor = new THREE.Color();
      gl.getClearColor(prevBgColor);
      const prevAlpha = gl.getClearAlpha();
      gl.setClearColor(0xffffff, 1);
      gl.render(scene, camera);

      const glCanvas = gl.domElement;
      const out = document.createElement("canvas");
      out.width = glCanvas.width;
      out.height = glCanvas.height;
      const ctx = out.getContext("2d")!;
      ctx.drawImage(glCanvas, 0, 0);

      gl.setClearColor(prevBgColor, prevAlpha);
      gl.render(scene, camera);

      const download = (dataUrl: string) => {
        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = "steel-panel.png";
        a.click();
      };

      if (logoDataUrl) {
        const logoImg = new Image();
        logoImg.onload = () => {
          const h = 48;
          const w = (logoImg.width / logoImg.height) * h;
          ctx.globalAlpha = 0.85;
          ctx.drawImage(logoImg, 20, out.height - h - 20, w, h);
          ctx.globalAlpha = 1;
          download(out.toDataURL("image/png"));
        };
        logoImg.src = logoDataUrl;
      } else {
        download(out.toDataURL("image/png"));
      }
    });
  }, [gl, scene, camera, logoDataUrl, onExportRegister]);

  // Ground shadow offset below the panel
  const shadowY = cfg.type === "sandwich"
    ? -(cfg.sheetThickness + (cfg.coreThickness ?? 0) + cfg.sheetThickness + 8)
    : -(cfg.sheetThickness + 8);

  return (
    <>
      {/* Scene background — white or transparent (CSS gradient shows through) */}
      {whiteBg
        ? <color attach="background" args={["#ffffff"]} />
        : <color attach="background" args={["transparent"]} />
      }

      <StudioLighting />

      {/* HDR environment for reflections — background={false} prevents env from overriding bg */}
      <Environment preset="city" background={false} />

      <PanelMesh cfg={cfg} color={color} reflectivity={reflectivity} innerColor={innerColor} innerFaceRibbed={innerFaceRibbed} />

      {/* Soft contact shadow under the panel — scale matches exact panel footprint [width, length] */}
      <ContactShadows
        position={[0, shadowY, 0]}
        opacity={(shadowStrength / 100) * 0.45}
        scale={[cfg.width * 1.15, cfg.length * 1.15]}
        blur={2.5}
        far={Math.abs(shadowY) + 80}
        resolution={512}
        color="#000000"
      />

      {/* Reference grid — shown when enabled in settings */}
      {showGrid && (
        <gridHelper args={[20000, 40, "#999999", "#cccccc"]} position={[0, shadowY - 2, 0]} />
      )}

      {/* Post-processing */}
      <PostFX panelWidth={cfg.width} />

      <CameraControls
        ref={controlsRef}
        makeDefault
        minDistance={50}
        maxDistance={12000}
      />
    </>
  );
}

// ─── PanelViewer ─────────────────────────────────────────────────────────────

interface PanelViewerProps {
  cfg: ProfileConfig;
  color: string;
  reflectivity?: number;
  shadowStrength?: number;
  showGrid?: boolean;
  companyLogo?: string | null;
  exportWithLogo?: boolean;
  innerColor?: string;
  innerFaceRibbed?: boolean;
}

export default function PanelViewer({ cfg, color, reflectivity = 60, shadowStrength = 44, showGrid = false, companyLogo = null, exportWithLogo = false, innerColor = "#B8B8B8", innerFaceRibbed = false }: PanelViewerProps) {
  const presets = useMemo(() => getCameraPresets(cfg), [cfg]);
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(presets[0]);
  const [whiteBg, setWhiteBg] = useState(false);
  const exportFnRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    setActivePreset(presets[0]);
  }, [presets]);

  const handleExportRegister = useCallback((fn: () => void) => {
    exportFnRef.current = fn;
  }, []);

  const initPos = presets[0].position;

  const bgStyle = whiteBg
    ? { background: "#ffffff" }
    : { background: "#f6f6f6" };

  return (
    <div className="relative w-full h-full" style={bgStyle}>
      <Canvas
        gl={{ preserveDrawingBuffer: true, antialias: true, alpha: true, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
        camera={{ fov: 45, near: 10, far: 20000, position: initPos }}
        shadows
      >
        <Suspense fallback={null}>
          <SceneContents
            cfg={cfg}
            color={color}
            activePreset={activePreset}
            whiteBg={whiteBg}
            reflectivity={reflectivity}
            shadowStrength={shadowStrength}
            showGrid={showGrid}
            logoDataUrl={exportWithLogo ? companyLogo : null}
            innerColor={innerColor}
            innerFaceRibbed={innerFaceRibbed}
            onExportRegister={handleExportRegister}
          />
        </Suspense>
      </Canvas>

      {/* Company logo overlay */}
      {companyLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={companyLogo}
          alt="logo"
          className="absolute bottom-14 left-4 max-h-8 max-w-[120px] object-contain opacity-75 pointer-events-none"
        />
      )}

      {/* Camera preset buttons */}
      <div className="absolute bottom-4 left-0 right-0 flex gap-1.5 flex-wrap justify-center px-4">
        {presets.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePreset(p)}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border backdrop-blur-sm transition-all duration-150 ${
              activePreset?.id === p.id
                ? "bg-zinc-900 text-white border-zinc-900 shadow-sm"
                : "bg-white/80 text-zinc-600 border-zinc-200 hover:border-zinc-400 hover:text-zinc-900"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Toolbar: white bg toggle + export */}
      <div className="absolute top-4 right-4 flex items-center gap-2">
        {/* White background toggle */}
        <button
          onClick={() => setWhiteBg(v => !v)}
          title={whiteBg ? "Fond dégradé" : "Fond blanc"}
          className={`w-8 h-8 flex items-center justify-center rounded-lg border transition-all duration-150 backdrop-blur-sm active:scale-95 ${
            whiteBg
              ? "bg-zinc-900 text-white border-zinc-900"
              : "bg-white/80 text-zinc-500 border-zinc-200 hover:border-zinc-400 hover:text-zinc-800"
          }`}
        >
          {/* Square = white canvas icon */}
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <path d="M3 9h18M9 21V9" strokeWidth="1.5" />
          </svg>
        </button>

        {/* Export PNG */}
        <button
          onClick={() => exportFnRef.current?.()}
          className="flex items-center gap-1.5 px-3 py-2 bg-zinc-900/90 text-white text-xs font-medium rounded-lg hover:bg-zinc-800 active:scale-[0.97] transition-all shadow-sm backdrop-blur-sm"
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export PNG
        </button>
      </div>
    </div>
  );
}
