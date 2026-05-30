"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import LogoEVOCHIP from "../../public/resources/LOGO-EVOCHIP.png";
import Image from "next/image";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { PerspectiveCamera, useGLTF } from "@react-three/drei";
import { Mesh, Group, Object3D } from "three";

gsap.registerPlugin(ScrollTrigger);

/* ================= CONFIG ================= */

const CAR_SCALE = 1.9;
const VISIBLE_CAR_RATIO = 0.5;
const CAR_VERTICAL_OFFSET = -4;
const CAR_REFLECTION_OFFSET = -2;
const CAR_REFLECTION_OPACITY = 0.1;
const CAR_REFLECTION_VERTICAL_SCALE = 1;
const CAR_INITIAL_ROTATION: [number, number, number] = [0, -1.6, 0];

/* ================= BACKGROUND ================= */

const Background = ({ isVisible }: { isVisible: boolean }) => {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleResize = () => {
      setIsMobileDevice(window.innerWidth < 768);
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!heroRef.current) return;

    gsap.to(heroRef.current, {
      opacity: isVisible ? 1 : 0,
      filter: isVisible ? "blur(0px)" : "blur(10px)",
      duration: isVisible ? 1 : 0,
      ease: "power3.out",
    });
  }, [isVisible]);

  return (
    <div
      ref={heroRef}
      className="fixed inset-0 z-[-1] h-full w-full overflow-hidden pointer-events-none"
    >
      <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[85%] max-w-[450px] opacity-60 md:opacity-30 select-none">
        <Image src={LogoEVOCHIP} alt="EVOCHIP Logo" priority />
      </div>

      <Canvas
        className="w-full h-full"
        dpr={isMobileDevice ? [1, 1.2] : [1, 1.5]}
        gl={{ powerPreference: "high-performance" }}
      >
        <ambientLight intensity={1} />
        <directionalLight
          position={[0, 2, 2]}
          intensity={isMobileDevice ? 5 : 2.5}
        />

        <PerspectiveCamera makeDefault fov={45} />

        <CameraScrollController isMobile={isMobileDevice} />

        <ContenitorMasina isVisible={isVisible} />
      </Canvas>
    </div>
  );
};

export default Background;

/* ================= CAMERA ================= */

function CameraScrollController({ isMobile }: { isMobile: boolean }) {
  const { camera } = useThree();
  const lookAt = useRef({ x: 0, y: 0.2, z: 0 });

  useEffect(() => {
    if (isMobile) {
      gsap.set(camera.position, { x: 1, y: 1.2, z: 8 });
      gsap.set(lookAt.current, { x: 8, y: 2, z: -12.5 });
      return;
    }

    gsap.set(camera.position, { x: 0, y: 1.5, z: 8 });
    gsap.set(lookAt.current, { x: 0, y: 0.2, z: 0 });

    let tl: ReturnType<typeof gsap.timeline> | null = null;
    let rafId: number | null = null;
    let destroyed = false;

    const setupScrollTrigger = () => {
      const showcasewrapper = document.getElementById("showcase-wrapper");
      const showcase4 = document.getElementById("showcase4");

      if (!showcasewrapper || !showcase4) {
        if (!destroyed) {
          rafId = window.requestAnimationFrame(setupScrollTrigger);
        }
        return;
      }

      if (destroyed) return;

      tl = gsap.timeline({
        scrollTrigger: {
          trigger: showcasewrapper,
          start: () => `top +25%`,
          end: () => `+=${showcasewrapper.scrollHeight}`,
          scrub: 1.5,
          invalidateOnRefresh: true,
        },
      });

      tl.to(camera.position, { x: -5.5, y: -1.55, z: 5 }, 0)
        .to(lookAt.current, { x: -1, y: -1.5, z: -4 }, 0)
        .to(camera.position, { x: -11, y: -1.55, z: -4 }, 0.4)
        .to(lookAt.current, { x: 22.5, y: -1.5, z: 4 }, 0.4)
        .to(camera.position, { x: -5.5, y: -1.55, z: 5 }, 1.2)
        .to(lookAt.current, { x: -1, y: -1.5, z: -4 }, 1.2)
        .to(camera.position, { x: -1.5, y: -0.5, z: -2 }, 2)
        .to(lookAt.current, { x: +1.5, y: -2, z: -6 }, 2);

      ScrollTrigger.refresh();
    };

    setupScrollTrigger();

    return () => {
      destroyed = true;
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      if (tl) {
        tl.scrollTrigger?.kill();
        tl.kill();
      }
    };
  }, [camera, isMobile]);

  useFrame(() => {
    camera.lookAt(lookAt.current.x, lookAt.current.y, lookAt.current.z);
  });

  return null;
}

/* ================= CAR CONTAINER ================= */

function ContenitorMasina({ isVisible }: { isVisible: boolean }) {
  const { viewport } = useThree();
  const grupMasinaRef = useRef<Group | null>(null);

  // IMPORTANT FIX: ref instead of state (fixes wheels bug)
  const isCarAnimating = useRef(false);

  const isMobile = viewport.width < 10;

  const MOBIL_SCALE = 1.1;
  const MOBIL_X = 10;
  const MOBIL_Y = 0;
  const MOBIL_Z = -10.5;
  const MOBIL_ROTATION = -0.7;

  const currentScale = isMobile ? MOBIL_SCALE : CAR_SCALE;
  const currentVerticalOffset = isMobile ? MOBIL_Y : CAR_VERTICAL_OFFSET;

  const pozitieDreaptaViewport = viewport.width * (1.1 - VISIBLE_CAR_RATIO);

  useEffect(() => {
    if (!grupMasinaRef.current) return;

    gsap.killTweensOf(grupMasinaRef.current.position);

    if (!isVisible) {
      isCarAnimating.current = false;
      return;
    }

    if (isMobile) {
      gsap.set(grupMasinaRef.current.position, {
        x: MOBIL_X + 6,
        y: MOBIL_Y - 2,
        z: MOBIL_Z - 4,
      });
    } else {
      gsap.set(grupMasinaRef.current.position, {
        x: pozitieDreaptaViewport * 4,
        y: currentVerticalOffset,
        z: -pozitieDreaptaViewport,
      });
    }

    const tween = gsap.to(grupMasinaRef.current.position, {
      x: isMobile ? MOBIL_X : pozitieDreaptaViewport + 2,
      y: isMobile ? MOBIL_Y - 2 : currentVerticalOffset,
      z: isMobile ? MOBIL_Z : -pozitieDreaptaViewport,
      duration: isMobile ? 2.2 : 2,
      ease: isMobile ? "power3.out" : "power4.out",

      onStart: () => {
        isCarAnimating.current = true;
      },
      onComplete: () => {
        isCarAnimating.current = false;
      },
      onReverseComplete: () => {
        isCarAnimating.current = false;
      },
    });

    return () => {
      tween.kill();
    };
  }, [isVisible, isMobile, currentVerticalOffset, viewport.width]);

  return (
    <group
      ref={grupMasinaRef}
      position={[
        isMobile ? MOBIL_X : 16,
        currentVerticalOffset - 2,
        isMobile ? MOBIL_Z : -pozitieDreaptaViewport,
      ]}
    >
      <group>
        <CarModel
          scale={currentScale}
          isSpinning={isMobile ? false : isCarAnimating.current}
          rotationY={isMobile ? MOBIL_ROTATION : CAR_INITIAL_ROTATION[1]}
        />
      </group>

      {!isMobile && (
        <group position={[0, CAR_REFLECTION_OFFSET + 2, 0]}>
          <CarModel
            scale={CAR_SCALE}
            reflected
            verticalScale={CAR_REFLECTION_VERTICAL_SCALE}
            isSpinning={isCarAnimating.current}
            rotationY={CAR_INITIAL_ROTATION[1]}
          />
        </group>
      )}
    </group>
  );
}

/* ================= CAR MODEL (ROȚI 100% IDENTICE LOGIC) ================= */

function CarModel({
  reflected = false,
  scale,
  verticalScale = 1,
  isSpinning = false,
  rotationY,
}: {
  reflected?: boolean;
  scale: number;
  verticalScale?: number;
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

          if ("blending" in reflectionMaterial) {
            reflectionMaterial.blending = 0;
          }

          object.material = reflectionMaterial;
          object.renderOrder = 1;
        }
      });
    }

    return clone;
  }, [scene, reflected]);

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

  // ===== ROȚI LOGICĂ ORIGINALĂ (NEATINSĂ) =====
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
      model.traverse((object: any) => {
        if (object instanceof Mesh) {
          object.geometry.dispose();

          if (Array.isArray(object.material)) {
            object.material.forEach((m) => m.dispose());
          } else {
            object.material.dispose();
          }
        }
      });
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
