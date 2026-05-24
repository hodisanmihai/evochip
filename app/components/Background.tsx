"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import LogoEVOCHIP from "../../public/resources/LOGO-EVOCHIP.png";
import Image from "next/image";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Mesh, Group, Object3D } from "three";

// Setări originale PC
const CAR_SCALE = 1.9;
const VISIBLE_CAR_RATIO = 0.5;
const CAR_VERTICAL_OFFSET = 0.85;
const CAR_REFLECTION_OFFSET = -2;
const CAR_REFLECTION_OPACITY = 0.1;
const CAR_REFLECTION_VERTICAL_SCALE = 1;
const CAR_INITIAL_ROTATION: [number, number, number] = [0, -1.6, 0];

const Background = ({ isVisible }: { isVisible: boolean }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero) return;

    gsap.to(hero, {
      opacity: isVisible ? 1 : 0,
      filter: isVisible ? "blur(0px)" : "blur(10px)",
      duration: isVisible ? 1 : 0,
      ease: "power3.out",
    });
  }, [isVisible]);

  return (
    <div
      ref={heroRef}
      className="absolute inset-0 w-full h-screen overflow-hidden"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[450px] md:w-auto md:max-w-none select-none pointer-events-none -z-10 opacity-30">
        <Image
          src={LogoEVOCHIP}
          alt="EVOCHIP Logo"
          className="w-full h-auto md:w-auto md:h-auto"
          priority
        />
      </div>

      <Canvas
        className="w-full h-full"
        dpr={
          typeof window !== "undefined" && window.innerWidth < 768
            ? [1, 1.2]
            : [1, 1.5]
        }
        gl={{ powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <PerspectiveCamera makeDefault position={[8, 0.5, 0]} fov={60} />
        <directionalLight position={[0, 2, 2]} intensity={2.5} />

        <ContenitorMasina isVisible={isVisible} />
      </Canvas>
    </div>
  );
};

export default Background;

function ContenitorMasina({ isVisible }: { isVisible: boolean }) {
  const { camera, viewport } = useThree();
  const grupMasinaRef = useRef<Group | null>(null);
  const [isCarAnimating, setIsCarAnimating] = useState(false);

  // Detectăm dacă ecranul este de mobil
  const isMobile = viewport.width < 10;

  // ========================================================
  // COORDONATELE TALE FINALE ȘI STABILE PENTRU MOBIL
  // ========================================================
  const MOBIL_SCALE = 1.1;
  const MOBIL_X = 10;
  const MOBIL_Y = 0;
  const MOBIL_Z = -10.5;
  const MOBIL_ROTATION = -0.7;
  // ========================================================

  const currentScale = isMobile ? MOBIL_SCALE : CAR_SCALE;
  const currentVerticalOffset = isMobile ? MOBIL_Y : CAR_VERTICAL_OFFSET;

  const currentViewport = viewport.getCurrentViewport(camera, [0, 0, 0]);
  const pozitieDreaptaViewport =
    currentViewport.width * (1.1 - VISIBLE_CAR_RATIO);

  useEffect(() => {
    if (!grupMasinaRef.current) return;

    gsap.killTweensOf(grupMasinaRef.current.position);

    if (!isVisible) {
      setIsCarAnimating(false);
      return;
    }

    // SPAWN POINT (De unde pleacă mașina înainte de animație)
    if (isMobile) {
      gsap.set(grupMasinaRef.current.position, {
        x: MOBIL_X + 6, // Pleacă puțin mai din spate pe axa X
        y: MOBIL_Y - 2, // Aliniere pe Y (Three.js group compensation)
        z: MOBIL_Z - 4, // Pleacă puțin mai din dreapta pe ecran
      });
    } else {
      // Codul original de PC
      gsap.set(grupMasinaRef.current.position, {
        x: pozitieDreaptaViewport * 4,
        y: currentVerticalOffset - 2,
        z: -pozitieDreaptaViewport,
      });
    }

    // ANIMAȚIA GSAP (Unde ajunge mașina)
    const tween = gsap.to(grupMasinaRef.current.position, {
      x: isMobile ? MOBIL_X : pozitieDreaptaViewport + 4,
      y: isMobile ? MOBIL_Y - 2 : currentVerticalOffset - 2,
      z: isMobile ? MOBIL_Z : -pozitieDreaptaViewport,
      duration: isMobile ? 2.2 : 2, // O animație fină de 2.2 secunde pe mobil
      ease: isMobile ? "power3.out" : "power4.out",
      delay: isMobile ? 0.5 : 1, // Începe după jumătate de secundă pe mobil
      onStart: () => setIsCarAnimating(true), // Pornește rotația roților în timpul mișcării
      onComplete: () => setIsCarAnimating(false),
      onReverseComplete: () => setIsCarAnimating(false),
    });

    return () => {
      tween.kill();
      setIsCarAnimating(false);
    };
  }, [
    isVisible,
    pozitieDreaptaViewport,
    isMobile,
    MOBIL_X,
    MOBIL_Y,
    MOBIL_Z,
    currentVerticalOffset,
  ]);

  return (
    <group
      ref={grupMasinaRef}
      // Poziționare fallback în caz că GSAP nu s-a încărcat instant în prima milisecundă
      position={[
        isMobile ? MOBIL_X : 16,
        currentVerticalOffset - 2,
        isMobile ? MOBIL_Z : -pozitieDreaptaViewport,
      ]}
    >
      <group position={[0, 0, 0]}>
        <CarModel
          scale={currentScale}
          grupParinteRef={grupMasinaRef}
          isSpinning={isCarAnimating}
          rotationY={isMobile ? MOBIL_ROTATION : CAR_INITIAL_ROTATION[1]}
        />
      </group>

      {/* Fără reflexie pe mobil pentru performanță brută */}
      {!isMobile && (
        <group position={[0, CAR_REFLECTION_OFFSET + 2, 0]}>
          <CarModel
            scale={CAR_SCALE}
            reflected
            verticalScale={CAR_REFLECTION_VERTICAL_SCALE}
            grupParinteRef={grupMasinaRef}
            isSpinning={isCarAnimating}
            rotationY={CAR_INITIAL_ROTATION[1]}
          />
        </group>
      )}
    </group>
  );
}

function CarModel({
  reflected = false,
  scale,
  verticalScale = 1,
  grupParinteRef,
  isSpinning = false,
  rotationY,
}: {
  reflected?: boolean;
  scale: number;
  verticalScale?: number;
  grupParinteRef: React.RefObject<Group | null>;
  isSpinning?: boolean;
  rotationY: number;
}) {
  const { scene } = useGLTF("/models/EVOCHIP.glb");
  const subPieseRotiRef = useRef<Object3D[]>([]);
  const baseRotationsRef = useRef<
    Record<string, { x: number; y: number; z: number }>
  >({});
  const timpStartAnimatie = useRef<number | null>(null);
  const wheelRotations = useRef<Record<string, number>>({});

  const model = useMemo(() => {
    const clone = scene.clone(true);

    if (reflected) {
      clone.traverse((object) => {
        if (object instanceof Mesh) {
          const reflectionMaterial = object.material.clone();
          reflectionMaterial.transparent = true;
          reflectionMaterial.opacity = CAR_REFLECTION_OPACITY;
          reflectionMaterial.depthWrite = true;
          reflectionMaterial.depthTest = true;
          reflectionMaterial.premultipliedAlpha = true;
          if ("blending" in reflectionMaterial) reflectionMaterial.blending = 0;
          object.material = reflectionMaterial;
          object.renderOrder = 1;
        }
      });
    }

    return clone;
  }, [reflected, scene]);

  useEffect(() => {
    if (!model) return;

    const rotiGasite: Object3D[] = [];
    baseRotationsRef.current = {};
    wheelRotations.current = {};

    model.traverse((object) => {
      if (object.name.toLowerCase().includes("wheel")) {
        object.matrixAutoUpdate = true;
        object.rotation.reorder("YXZ");
        rotiGasite.push(object);

        baseRotationsRef.current[object.uuid] = {
          x: object.rotation.x,
          y: object.rotation.y,
          z: object.rotation.z,
        };

        wheelRotations.current[object.uuid] = 0;
      }
    });

    subPieseRotiRef.current = rotiGasite;
  }, [model]);

  useEffect(() => {
    if (!isSpinning) {
      timpStartAnimatie.current = null;
    }
  }, [isSpinning]);

  useFrame((state) => {
    if (!isSpinning || subPieseRotiRef.current.length === 0) return;

    const t = state.clock.getElapsedTime();

    if (timpStartAnimatie.current === null) {
      timpStartAnimatie.current = t;
    }

    const elapsed = t - timpStartAnimatie.current;
    const progress = Math.min(1, elapsed / 2);
    const speed = Math.pow(1 - progress, 4);

    const rotStep = speed * 0.2 * (reflected ? -verticalScale : 1);

    if (progress < 1) {
      subPieseRotiRef.current.forEach((wheel) => {
        const base = baseRotationsRef.current[wheel.uuid];
        if (base) {
          wheelRotations.current[wheel.uuid] += rotStep;
          wheel.rotation.x = base.x + wheelRotations.current[wheel.uuid];
          wheel.rotation.y = base.y;
          wheel.rotation.z = base.z;
        }
      });
    }
  });

  useEffect(() => {
    return () => {
      if (model) {
        model.traverse((object: any) => {
          if (object instanceof Mesh) {
            object.geometry.dispose();
            if (Array.isArray(object.material)) {
              object.material.forEach((mat) => mat.dispose());
            } else {
              object.material.dispose();
            }
          }
        });
      }
    };
  }, [model]);

  return (
    <primitive
      object={model}
      scale={[scale, reflected ? -scale * verticalScale : scale, scale]}
      rotation={[0, rotationY, 0]}
    />
  );
}
