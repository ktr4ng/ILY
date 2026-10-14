import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { romanticAudio } from '../utils/audio';

interface Scene3DProps {
  isNight?: boolean;
  isCelebration?: boolean;
}

interface DuckData {
  duckGroup: THREE.Group;
  headGroup: THREE.Group;
  leftWing: THREE.Mesh;
  rightWing: THREE.Mesh;
  tail: THREE.Mesh;
  leftFoot: THREE.Mesh;
  rightFoot: THREE.Mesh;
  scale: number;
  isMama: boolean;
  x: number;
  z: number;
  targetX: number;
  targetZ: number;
  speed: number;
  waddlePhase: number;
  state: 'walking' | 'pecking' | 'looking';
  stateTime: number;
  hopTimer: number;
}

export const Scene3D: React.FC<Scene3DProps> = ({
  isNight = false,
  isCelebration = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [webglSupported, setWebglSupported] = useState<boolean>(true);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let renderer: THREE.WebGLRenderer | null = null;
    let animationFrameId: number;

    try {
      // Test WebGL support
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setWebglSupported(false);
        return;
      }

      // --- 1. Scene, Camera, Renderer ---
      const scene = new THREE.Scene();
      scene.background = new THREE.Color(isNight ? 0x0f1720 : 0x718b91);
      scene.fog = new THREE.FogExp2(isNight ? 0x0f1720 : 0x718b91, 0.035);

      const camera = new THREE.PerspectiveCamera(
        42,
        container.clientWidth / container.clientHeight,
        0.1,
        100
      );
      camera.position.set(0, 1.8, 6.2);

      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' });
      renderer.setSize(container.clientWidth, container.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.toneMapping = THREE.ACESFilmicToneMapping;
      renderer.toneMappingExposure = 1.1;
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      container.appendChild(renderer.domElement);

      // --- 2. Lighting ---
      const ambientLight = new THREE.AmbientLight(
        isNight ? 0x223344 : 0xe8e4dc,
        isNight ? 0.7 : 1.2
      );
      scene.add(ambientLight);

      const sunLight = new THREE.DirectionalLight(
        isNight ? 0x7fa9cf : 0xf5d98c,
        isNight ? 0.9 : 2.4
      );
      sunLight.position.set(-3.5, 4.8, 2.0);
      sunLight.castShadow = true;
      sunLight.shadow.mapSize.width = 1024;
      sunLight.shadow.mapSize.height = 1024;
      sunLight.shadow.camera.near = 0.5;
      sunLight.shadow.camera.far = 15;
      sunLight.shadow.bias = -0.001;
      scene.add(sunLight);

      // Soft fill light
      const fillLight = new THREE.DirectionalLight(
        isNight ? 0x1a2634 : 0xa8c68a,
        isNight ? 0.3 : 0.6
      );
      fillLight.position.set(4, 2, 3);
      scene.add(fillLight);

      // --- 3. Room Geometry & Walls ---
      const wallMat = new THREE.MeshStandardMaterial({
        color: 0x718b91,
        roughness: 0.92,
        metalness: 0.05,
      });

      // Floor: Deep Grass Green (#174A2D)
      const floorGeo = new THREE.PlaneGeometry(16, 16, 32, 32);
      const posAttr = floorGeo.attributes.position;
      for (let i = 0; i < posAttr.count; i++) {
        const vx = posAttr.getX(i);
        const vy = posAttr.getY(i);
        const vz = Math.sin(vx * 0.8) * Math.cos(vy * 0.8) * 0.04;
        posAttr.setZ(i, vz);
      }
      floorGeo.computeVertexNormals();

      const floorMat = new THREE.MeshStandardMaterial({
        color: 0x174a2d,
        roughness: 0.95,
        metalness: 0.02,
      });
      const floorMesh = new THREE.Mesh(floorGeo, floorMat);
      floorMesh.rotation.x = -Math.PI / 2;
      floorMesh.position.y = 0;
      floorMesh.receiveShadow = true;
      scene.add(floorMesh);

      // Back Wall with Window Cutout
      const windowWidth = 3.6;
      const windowHeight = 2.4;
      const windowBottom = 1.0;
      const roomWidth = 14;
      const roomHeight = 7;
      const wallZ = -3.5;

      const bottomWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, windowBottom, 0.3),
        wallMat
      );
      bottomWall.position.set(0, windowBottom / 2, wallZ);
      bottomWall.receiveShadow = true;
      scene.add(bottomWall);

      const topWallHeight = roomHeight - (windowBottom + windowHeight);
      const topWall = new THREE.Mesh(
        new THREE.BoxGeometry(roomWidth, topWallHeight, 0.3),
        wallMat
      );
      topWall.position.set(0, windowBottom + windowHeight + topWallHeight / 2, wallZ);
      topWall.receiveShadow = true;
      scene.add(topWall);

      const sideWallWidth = (roomWidth - windowWidth) / 2;
      const leftWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideWallWidth, windowHeight, 0.3),
        wallMat
      );
      leftWall.position.set(-windowWidth / 2 - sideWallWidth / 2, windowBottom + windowHeight / 2, wallZ);
      leftWall.receiveShadow = true;
      scene.add(leftWall);

      const rightWall = new THREE.Mesh(
        new THREE.BoxGeometry(sideWallWidth, windowHeight, 0.3),
        wallMat
      );
      rightWall.position.set(windowWidth / 2 + sideWallWidth / 2, windowBottom + windowHeight / 2, wallZ);
      rightWall.receiveShadow = true;
      scene.add(rightWall);

      const roomLeftWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, roomHeight, 12),
        wallMat
      );
      roomLeftWall.position.set(-roomWidth / 2, roomHeight / 2, wallZ + 6);
      roomLeftWall.receiveShadow = true;
      scene.add(roomLeftWall);

      const roomRightWall = new THREE.Mesh(
        new THREE.BoxGeometry(0.3, roomHeight, 12),
        wallMat
      );
      roomRightWall.position.set(roomWidth / 2, roomHeight / 2, wallZ + 6);
      roomRightWall.receiveShadow = true;
      scene.add(roomRightWall);

      // --- 4. Window Frame & Sky Vista ---
      const frameMat = new THREE.MeshStandardMaterial({
        color: 0xded8ce,
        roughness: 0.6,
        metalness: 0.1,
      });

      const sill = new THREE.Mesh(
        new THREE.BoxGeometry(windowWidth + 0.4, 0.14, 0.6),
        frameMat
      );
      sill.position.set(0, windowBottom + 0.05, wallZ + 0.1);
      sill.receiveShadow = true;
      sill.castShadow = true;
      scene.add(sill);

      const lintel = new THREE.Mesh(
        new THREE.BoxGeometry(windowWidth + 0.3, 0.12, 0.35),
        frameMat
      );
      lintel.position.set(0, windowBottom + windowHeight, wallZ + 0.05);
      scene.add(lintel);

      const leftJamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, windowHeight, 0.35),
        frameMat
      );
      leftJamb.position.set(-windowWidth / 2, windowBottom + windowHeight / 2, wallZ + 0.05);
      scene.add(leftJamb);

      const rightJamb = new THREE.Mesh(
        new THREE.BoxGeometry(0.12, windowHeight, 0.35),
        frameMat
      );
      rightJamb.position.set(windowWidth / 2, windowBottom + windowHeight / 2, wallZ + 0.05);
      scene.add(rightJamb);

      const centerMullion = new THREE.Mesh(
        new THREE.BoxGeometry(0.08, windowHeight, 0.25),
        frameMat
      );
      centerMullion.position.set(0, windowBottom + windowHeight / 2, wallZ + 0.05);
      scene.add(centerMullion);

      // Sky Backdrop Plane
      const textureLoader = new THREE.TextureLoader();
      const skyTextureDay = textureLoader.load('/sky-day.jpeg');
      const skyTextureNight = textureLoader.load('/sky-night.jpeg');
      skyTextureDay.wrapS = THREE.RepeatWrapping;
      skyTextureDay.wrapT = THREE.ClampToEdgeWrapping;
      skyTextureNight.wrapS = THREE.RepeatWrapping;
      skyTextureNight.wrapT = THREE.ClampToEdgeWrapping;

      const skyGeo = new THREE.PlaneGeometry(16, 9);
      const skyMat = new THREE.MeshBasicMaterial({
        map: isNight ? skyTextureNight : skyTextureDay,
        fog: false,
      });
      const skyMesh = new THREE.Mesh(skyGeo, skyMat);
      skyMesh.position.set(0, 2.5, wallZ - 2.5);
      scene.add(skyMesh);

      // --- 5. Volumetric Sunlight Shaft (God Rays) ---
      const rayLength = 6.2;
      const rayGeo = new THREE.CylinderGeometry(
        windowWidth * 0.48,
        windowWidth * 0.95,
        rayLength,
        16,
        1,
        true
      );
      const rayMat = new THREE.MeshBasicMaterial({
        color: isNight ? 0x88b7d5 : 0xf5d98c,
        transparent: true,
        opacity: isNight ? 0.08 : 0.16,
        side: THREE.DoubleSide,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sunRay = new THREE.Mesh(rayGeo, rayMat);
      sunRay.rotation.x = Math.PI / 4.2;
      sunRay.rotation.z = -0.15;
      sunRay.position.set(0.3, 1.3, -1.0);
      scene.add(sunRay);

      const poolGeo = new THREE.PlaneGeometry(windowWidth * 1.1, 2.6);
      const poolMat = new THREE.MeshBasicMaterial({
        color: isNight ? 0x6e9ec1 : 0xf5d98c,
        transparent: true,
        opacity: isNight ? 0.1 : 0.28,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const sunlightPool = new THREE.Mesh(poolGeo, poolMat);
      sunlightPool.rotation.x = -Math.PI / 2;
      sunlightPool.rotation.z = -0.15;
      sunlightPool.position.set(0.4, 0.02, 0.4);
      scene.add(sunlightPool);

      // --- 6. Minimalist Bench ---
      const benchGroup = new THREE.Group();
      const woodMat = new THREE.MeshStandardMaterial({
        color: 0x9b7a5a,
        roughness: 0.75,
      });
      const benchLegMat = new THREE.MeshStandardMaterial({
        color: 0x3d352e,
        roughness: 0.6,
      });

      const seatPlank = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.08, 0.65),
        woodMat
      );
      seatPlank.position.y = 0.52;
      seatPlank.castShadow = true;
      seatPlank.receiveShadow = true;
      benchGroup.add(seatPlank);

      const backPlank = new THREE.Mesh(
        new THREE.BoxGeometry(2.2, 0.32, 0.06),
        woodMat
      );
      backPlank.position.set(0, 0.95, -0.28);
      backPlank.rotation.x = -0.12;
      backPlank.castShadow = true;
      benchGroup.add(backPlank);

      const legGeo = new THREE.CylinderGeometry(0.03, 0.035, 0.52, 8);
      const legCoords = [
        [-0.95, 0.26, 0.24],
        [0.95, 0.26, 0.24],
        [-0.95, 0.26, -0.24],
        [0.95, 0.26, -0.24],
      ];
      legCoords.forEach(([x, y, z]) => {
        const leg = new THREE.Mesh(legGeo, benchLegMat);
        leg.position.set(x, y, z);
        leg.castShadow = true;
        benchGroup.add(leg);
      });

      benchGroup.position.set(-1.1, 0, -2.1);
      benchGroup.rotation.y = 0.25;
      scene.add(benchGroup);

      // Tiny potted flower
      const potGeo = new THREE.CylinderGeometry(0.12, 0.09, 0.18, 12);
      const potMat = new THREE.MeshStandardMaterial({ color: 0xba6a4d, roughness: 0.8 });
      const pot = new THREE.Mesh(potGeo, potMat);
      pot.position.set(1.1, windowBottom + 0.14 + 0.09, wallZ + 0.12);
      pot.castShadow = true;
      scene.add(pot);

      const plantGeo = new THREE.DodecahedronGeometry(0.12, 1);
      const plantMat = new THREE.MeshStandardMaterial({ color: 0x4e8557, roughness: 0.9 });
      const plant = new THREE.Mesh(plantGeo, plantMat);
      plant.position.set(1.1, windowBottom + 0.34, wallZ + 0.12);
      scene.add(plant);

      // --- 7. Meadow Grass & Tiny Flowers ---
      const flowerGroup = new THREE.Group();
      const flowerPetalMat = new THREE.MeshStandardMaterial({
        color: 0xf5f0e5,
        roughness: 0.7,
      });
      const flowerCenterMat = new THREE.MeshStandardMaterial({
        color: 0xf5d98c,
        roughness: 0.5,
      });
      const stemMat = new THREE.MeshStandardMaterial({
        color: 0x3d7049,
        roughness: 0.9,
      });

      const flowerCount = 45;
      const flowerMeshes: { group: THREE.Group; initialRotation: number; speed: number }[] = [];

      for (let i = 0; i < flowerCount; i++) {
        const f = new THREE.Group();
        const stemH = 0.16 + Math.random() * 0.12;
        const stem = new THREE.Mesh(
          new THREE.CylinderGeometry(0.01, 0.012, stemH, 5),
          stemMat
        );
        stem.position.y = stemH / 2;
        f.add(stem);

        const center = new THREE.Mesh(
          new THREE.SphereGeometry(0.03, 7, 7),
          flowerCenterMat
        );
        center.position.y = stemH;
        f.add(center);

        const petalGeo = new THREE.ConeGeometry(0.035, 0.08, 4);
        for (let p = 0; p < 5; p++) {
          const petal = new THREE.Mesh(petalGeo, flowerPetalMat);
          const angle = (p / 5) * Math.PI * 2;
          petal.position.set(Math.cos(angle) * 0.045, stemH, Math.sin(angle) * 0.045);
          petal.rotation.x = Math.PI / 2;
          petal.rotation.z = angle;
          f.add(petal);
        }

        const fx = (Math.random() - 0.5) * 7.5;
        const fz = -1.8 + Math.random() * 5.0;
        f.position.set(fx, 0, fz);
        f.scale.setScalar(0.7 + Math.random() * 0.6);
        flowerGroup.add(f);

        flowerMeshes.push({
          group: f,
          initialRotation: Math.random() * Math.PI * 2,
          speed: 1.2 + Math.random() * 1.5,
        });
      }
      scene.add(flowerGroup);

      // --- 8. CUTE LOW-POLY DUCKS IN THE GARDEN ---
      const createLowPolyDuck = (scale: number, isDuckling: boolean): Omit<DuckData, 'x' | 'z' | 'targetX' | 'targetZ' | 'speed' | 'waddlePhase' | 'state' | 'stateTime' | 'hopTimer'> => {
        const duckGroup = new THREE.Group();

        const bodyMat = new THREE.MeshStandardMaterial({
          color: isDuckling ? 0xfdf2bb : 0xfcf9f2,
          roughness: 0.72,
        });
        const billMat = new THREE.MeshStandardMaterial({
          color: 0xf39c12,
          roughness: 0.55,
        });
        const eyeMat = new THREE.MeshBasicMaterial({
          color: 0x181818,
        });
        const footMat = new THREE.MeshStandardMaterial({
          color: 0xe67e22,
          roughness: 0.7,
        });

        // 1. Plump Body (Egg-shaped low-poly)
        const bodyGeo = new THREE.SphereGeometry(0.24 * scale, 10, 8);
        bodyGeo.scale(1.0, 0.85, 1.35);
        const body = new THREE.Mesh(bodyGeo, bodyMat);
        body.position.y = 0.22 * scale;
        body.castShadow = true;
        body.receiveShadow = true;
        duckGroup.add(body);

        // 2. Cute perky tail at back
        const tailGeo = new THREE.ConeGeometry(0.08 * scale, 0.16 * scale, 5);
        const tail = new THREE.Mesh(tailGeo, bodyMat);
        tail.rotation.x = -Math.PI / 3;
        tail.position.set(0, 0.28 * scale, -0.26 * scale);
        tail.castShadow = true;
        duckGroup.add(tail);

        // 3. Head & Bill
        const headGroup = new THREE.Group();
        headGroup.position.set(0, 0.35 * scale, 0.18 * scale);

        const headGeo = new THREE.SphereGeometry(0.14 * scale, 9, 8);
        const head = new THREE.Mesh(headGeo, bodyMat);
        head.castShadow = true;
        headGroup.add(head);

        // Bill (Cute flat duck bill)
        const billGeo = new THREE.ConeGeometry(0.075 * scale, 0.16 * scale, 5);
        billGeo.scale(1.2, 0.5, 1.0);
        const bill = new THREE.Mesh(billGeo, billMat);
        bill.rotation.x = Math.PI / 2;
        bill.position.set(0, -0.02 * scale, 0.18 * scale);
        bill.castShadow = true;
        headGroup.add(bill);

        // Tiny bead eyes
        const eyeGeo = new THREE.SphereGeometry(0.024 * scale, 6, 6);
        const leftEye = new THREE.Mesh(eyeGeo, eyeMat);
        leftEye.position.set(0.105 * scale, 0.04 * scale, 0.07 * scale);
        headGroup.add(leftEye);

        const rightEye = new THREE.Mesh(eyeGeo, eyeMat);
        rightEye.position.set(-0.105 * scale, 0.04 * scale, 0.07 * scale);
        headGroup.add(rightEye);

        // Mama duck has a little daisy flower on her head!
        if (!isDuckling) {
          const miniFlower = new THREE.Mesh(
            new THREE.SphereGeometry(0.04 * scale, 6, 6),
            new THREE.MeshStandardMaterial({ color: 0xf5d98c, roughness: 0.5 })
          );
          miniFlower.position.set(0.08 * scale, 0.13 * scale, 0.02 * scale);
          headGroup.add(miniFlower);
        }

        duckGroup.add(headGroup);

        // 4. Little Wings
        const wingGeo = new THREE.BoxGeometry(0.04 * scale, 0.14 * scale, 0.25 * scale);
        const leftWing = new THREE.Mesh(wingGeo, bodyMat);
        leftWing.position.set(0.23 * scale, 0.22 * scale, -0.02 * scale);
        leftWing.castShadow = true;
        duckGroup.add(leftWing);

        const rightWing = new THREE.Mesh(wingGeo, bodyMat);
        rightWing.position.set(-0.23 * scale, 0.22 * scale, -0.02 * scale);
        rightWing.castShadow = true;
        duckGroup.add(rightWing);

        // 5. Cute Orange Webbed Feet
        const footGeo = new THREE.BoxGeometry(0.09 * scale, 0.02 * scale, 0.14 * scale);
        const leftFoot = new THREE.Mesh(footGeo, footMat);
        leftFoot.position.set(0.09 * scale, 0.02 * scale, 0.02 * scale);
        duckGroup.add(leftFoot);

        const rightFoot = new THREE.Mesh(footGeo, footMat);
        rightFoot.position.set(-0.09 * scale, 0.02 * scale, 0.02 * scale);
        duckGroup.add(rightFoot);

        return {
          duckGroup,
          headGroup,
          leftWing,
          rightWing,
          tail,
          leftFoot,
          rightFoot,
          scale,
          isMama: !isDuckling,
        };
      };

      // Mama and Solo duck wandering waypoints
      const mamaWaypoints = [
        { x: -2.3, z: 1.5 },
        { x: -0.8, z: 2.2 },
        { x: 1.4, z: 1.9 },
        { x: 2.4, z: 0.6 },
        { x: 0.9, z: -0.3 },
        { x: -1.2, z: 0.2 },
      ];

      const soloWaypoints = [
        { x: 1.2, z: 0.3 },
        { x: 2.4, z: 1.3 },
        { x: 1.8, z: 2.3 },
        { x: 0.5, z: 1.3 },
      ];

      // Create 4 ducks: Mama duck + 2 ducklings in a train + 1 adventurous duckling
      const ducks: (DuckData & { waypointIndex: number })[] = [
        {
          ...createLowPolyDuck(1.18, false),
          x: mamaWaypoints[0].x,
          z: mamaWaypoints[0].z,
          targetX: mamaWaypoints[1].x,
          targetZ: mamaWaypoints[1].z,
          speed: 0.75,
          waddlePhase: 0,
          state: 'walking',
          stateTime: 1.0,
          hopTimer: 0,
          waypointIndex: 1,
        },
        {
          ...createLowPolyDuck(0.68, true),
          x: mamaWaypoints[0].x - 0.4,
          z: mamaWaypoints[0].z - 0.3,
          targetX: mamaWaypoints[0].x,
          targetZ: mamaWaypoints[0].z,
          speed: 0.85,
          waddlePhase: 1.2,
          state: 'walking',
          stateTime: 1.0,
          hopTimer: 0,
          waypointIndex: 0,
        },
        {
          ...createLowPolyDuck(0.60, true),
          x: mamaWaypoints[0].x - 0.8,
          z: mamaWaypoints[0].z - 0.6,
          targetX: mamaWaypoints[0].x - 0.4,
          targetZ: mamaWaypoints[0].z - 0.3,
          speed: 0.88,
          waddlePhase: 2.4,
          state: 'walking',
          stateTime: 1.0,
          hopTimer: 0,
          waypointIndex: 0,
        },
        {
          ...createLowPolyDuck(0.62, true),
          x: soloWaypoints[0].x,
          z: soloWaypoints[0].z,
          targetX: soloWaypoints[1].x,
          targetZ: soloWaypoints[1].z,
          speed: 0.65,
          waddlePhase: 3.1,
          state: 'walking',
          stateTime: 1.5,
          hopTimer: 0,
          waypointIndex: 1,
        },
      ];

      ducks.forEach((d) => {
        d.duckGroup.position.set(d.x, 0, d.z);
        scene.add(d.duckGroup);
      });

      // Raycaster for clicking on ducks to make them quack and hop
      const raycaster = new THREE.Raycaster();
      const pointer = new THREE.Vector2();

      const handlePointerDown = (event: MouseEvent | TouchEvent) => {
        if (!container) return;
        const clientX = 'touches' in event ? event.touches[0].clientX : event.clientX;
        const clientY = 'touches' in event ? event.touches[0].clientY : event.clientY;

        const rect = container.getBoundingClientRect();
        pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(pointer, camera);
        const duckObjects = ducks.map((d) => d.duckGroup);
        const intersects = raycaster.intersectObjects(duckObjects, true);

        if (intersects.length > 0) {
          // Find which duck was clicked
          let topObj: THREE.Object3D | null = intersects[0].object;
          while (topObj && !duckObjects.includes(topObj as THREE.Group)) {
            topObj = topObj.parent;
          }
          const clickedDuck = ducks.find((d) => d.duckGroup === topObj);
          if (clickedDuck) {
            clickedDuck.hopTimer = 0.55;
            clickedDuck.state = 'looking';
            clickedDuck.stateTime = 1.5;
            romanticAudio.playQuack();
          }
        }
      };

      container.addEventListener('pointerdown', handlePointerDown);

      // --- 9. Floating Particles ---
      const particleCount = 110;
      const particleGeo = new THREE.BufferGeometry();
      const particlePositions = new Float32Array(particleCount * 3);
      const particleVelocities: { x: number; y: number; z: number }[] = [];

      for (let i = 0; i < particleCount; i++) {
        particlePositions[i * 3] = (Math.random() - 0.5) * 6;
        particlePositions[i * 3 + 1] = Math.random() * 3.5;
        particlePositions[i * 3 + 2] = -2.5 + Math.random() * 6;

        particleVelocities.push({
          x: (Math.random() - 0.5) * 0.003,
          y: 0.002 + Math.random() * 0.004,
          z: (Math.random() - 0.5) * 0.003,
        });
      }

      particleGeo.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

      const particleMat = new THREE.PointsMaterial({
        color: isNight ? 0xa8e6cf : 0xf5d98c,
        size: isNight ? 0.06 : 0.04,
        transparent: true,
        opacity: isNight ? 0.75 : 0.55,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const particles = new THREE.Points(particleGeo, particleMat);
      scene.add(particles);

      // --- 10. Parallax & Animation Loop ---
      let mouseX = 0;
      let mouseY = 0;
      let targetX = 0;
      let targetY = 0;

      const handleMouseMove = (e: MouseEvent) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          mouseX = (e.touches[0].clientX / window.innerWidth) * 2 - 1;
          mouseY = -(e.touches[0].clientY / window.innerHeight) * 2 + 1;
        }
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });

      const handleResize = () => {
        if (!container || !renderer) return;
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(container.clientWidth, container.clientHeight);
      };
      window.addEventListener('resize', handleResize);

      let lastTime = performance.now();
      const startTime = performance.now();

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        const currentTime = performance.now();
        const delta = Math.min((currentTime - lastTime) / 1000, 0.05);
        lastTime = currentTime;
        const elapsedTime = (currentTime - startTime) / 1000;

        targetX += (mouseX * 0.35 - targetX) * 0.04;
        targetY += (mouseY * 0.2 - targetY) * 0.04;

        const baseCamY = isCelebration ? 1.6 : 1.8;
        const baseCamZ = isCelebration ? 4.9 : 6.2;

        camera.position.x = targetX;
        camera.position.y = baseCamY + targetY;
        camera.position.z = THREE.MathUtils.lerp(camera.position.z, baseCamZ, 0.03);
        camera.lookAt(0, 1.45, -0.5);

        if (skyMat.map) {
          skyMat.map.offset.x = (elapsedTime * 0.003) % 1;
        }

        // Sway flowers
        flowerMeshes.forEach((item) => {
          const sway = Math.sin(elapsedTime * item.speed + item.initialRotation) * 0.07;
          item.group.rotation.z = sway;
        });

        // Update ducks wandering in the garden
        ducks.forEach((duck, idx) => {
          // Duck 1 follows Mama Duck (duck 0)
          if (idx === 1 && ducks[0]) {
            const mama = ducks[0];
            const followDist = 0.48;
            const dirX = Math.sin(mama.duckGroup.rotation.y);
            const dirZ = Math.cos(mama.duckGroup.rotation.y);
            duck.targetX = mama.x - dirX * followDist;
            duck.targetZ = mama.z - dirZ * followDist;
            duck.state = 'walking';
          }
          // Duck 2 follows Duck 1
          else if (idx === 2 && ducks[1]) {
            const leader = ducks[1];
            const followDist = 0.42;
            const dirX = Math.sin(leader.duckGroup.rotation.y);
            const dirZ = Math.cos(leader.duckGroup.rotation.y);
            duck.targetX = leader.x - dirX * followDist;
            duck.targetZ = leader.z - dirZ * followDist;
            duck.state = 'walking';
          }

          const dx = duck.targetX - duck.x;
          const dz = duck.targetZ - duck.z;
          const dist = Math.hypot(dx, dz);

          duck.stateTime -= delta;

          if (duck.state === 'walking') {
            const minStopDist = (idx === 1 || idx === 2) ? 0.35 : 0.22;
            if (dist > minStopDist) {
              const targetAngle = Math.atan2(dx, dz);
              let angleDiff = targetAngle - duck.duckGroup.rotation.y;
              while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
              while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
              duck.duckGroup.rotation.y += angleDiff * Math.min(1, 4.5 * delta);

              // Move forward actively
              duck.x += Math.sin(duck.duckGroup.rotation.y) * duck.speed * delta;
              duck.z += Math.cos(duck.duckGroup.rotation.y) * duck.speed * delta;

              // Waddle animation (side-to-side roll, bobbing, tail wagging)
              duck.waddlePhase += 8.5 * delta;
              const waddle = Math.sin(duck.waddlePhase);
              duck.duckGroup.rotation.z = waddle * 0.16;
              duck.duckGroup.position.y = Math.abs(waddle) * (0.05 * duck.scale);
              duck.tail.rotation.y = Math.sin(duck.waddlePhase * 1.5) * 0.35;

              // Feet stepping
              duck.leftFoot.position.z = (0.02 + Math.sin(duck.waddlePhase) * 0.05) * duck.scale;
              duck.rightFoot.position.z = (0.02 - Math.sin(duck.waddlePhase) * 0.05) * duck.scale;

              // Wings subtle sway
              duck.leftWing.rotation.z = Math.max(0, waddle) * 0.28;
              duck.rightWing.rotation.z = -Math.max(0, -waddle) * 0.28;
              duck.headGroup.rotation.x = 0;
            } else {
              // Arrived at waypoint!
              if (idx === 0) {
                // Mama duck pauses briefly then walks to next waypoint
                duck.state = Math.random() > 0.4 ? 'pecking' : 'looking';
                duck.stateTime = 0.8 + Math.random() * 1.2;
                duck.waypointIndex = (duck.waypointIndex + 1) % mamaWaypoints.length;
                duck.targetX = mamaWaypoints[duck.waypointIndex].x + (Math.random() - 0.5) * 0.3;
                duck.targetZ = mamaWaypoints[duck.waypointIndex].z + (Math.random() - 0.5) * 0.3;
              } else if (idx === 3) {
                // Solo duck pauses briefly then advances
                duck.state = Math.random() > 0.4 ? 'pecking' : 'looking';
                duck.stateTime = 1.0 + Math.random() * 1.5;
                duck.waypointIndex = (duck.waypointIndex + 1) % soloWaypoints.length;
                duck.targetX = soloWaypoints[duck.waypointIndex].x + (Math.random() - 0.5) * 0.4;
                duck.targetZ = soloWaypoints[duck.waypointIndex].z + (Math.random() - 0.5) * 0.4;
              } else {
                // Ducklings wait close to leader
                duck.waddlePhase = 0;
                duck.duckGroup.rotation.z = 0;
                duck.duckGroup.position.y = 0;
              }
            }
          } else if (duck.state === 'pecking') {
            // Dip head to peck at grass
            duck.headGroup.rotation.x = 0.35 + Math.sin(elapsedTime * 8) * 0.15;
            duck.duckGroup.rotation.z = 0;
            duck.duckGroup.position.y = 0;
            if (duck.stateTime <= 0) {
              duck.state = 'walking';
            }
          } else if (duck.state === 'looking') {
            // Tilt head side to side curiously
            duck.headGroup.rotation.y = Math.sin(elapsedTime * 3) * 0.35;
            duck.headGroup.rotation.x = 0;
            duck.duckGroup.rotation.z = 0;
            duck.duckGroup.position.y = 0;
            if (duck.stateTime <= 0) {
              duck.state = 'walking';
            }
          }

          // Handle excited hop if clicked
          if (duck.hopTimer > 0) {
            duck.hopTimer -= delta;
            const hopProgress = (0.55 - duck.hopTimer) / 0.55;
            const hopHeight = Math.sin(hopProgress * Math.PI) * 0.4 * duck.scale;
            duck.duckGroup.position.y += hopHeight;
            duck.leftWing.rotation.z = Math.sin(elapsedTime * 30) * 0.6;
            duck.rightWing.rotation.z = -Math.sin(elapsedTime * 30) * 0.6;
          }

          duck.duckGroup.position.x = duck.x;
          duck.duckGroup.position.z = duck.z;
        });

        const pulse = Math.sin(elapsedTime * 1.5) * 0.025;
        rayMat.opacity = (isNight ? 0.08 : 0.16) + pulse;
        poolMat.opacity = (isNight ? 0.1 : 0.28) + pulse * 1.5;

        const positions = particleGeo.attributes.position.array as Float32Array;
        for (let i = 0; i < particleCount; i++) {
          positions[i * 3 + 1] += particleVelocities[i].y;
          positions[i * 3] += Math.sin(elapsedTime + i) * 0.001;

          if (positions[i * 3 + 1] > 3.6) {
            positions[i * 3 + 1] = 0.1;
            positions[i * 3] = (Math.random() - 0.5) * 6;
            positions[i * 3 + 2] = -2.5 + Math.random() * 6;
          }
        }
        particleGeo.attributes.position.needsUpdate = true;

        if (renderer) {
          renderer.render(scene, camera);
        }
      };

      animate();

      return () => {
        cancelAnimationFrame(animationFrameId);
        container.removeEventListener('pointerdown', handlePointerDown);
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('resize', handleResize);
        if (container && renderer && renderer.domElement) {
          container.removeChild(renderer.domElement);
        }
        if (renderer) renderer.dispose();
      };
    } catch (e) {
      console.warn('WebGL initialization failed, falling back to CSS 3D room:', e);
      setWebglSupported(false);
    }
  }, [isNight, isCelebration]);

  return (
    <div ref={mountRef} className="absolute inset-0 w-full h-full overflow-hidden">
      {/* CSS 3D Fallback Environment with cute ducks if WebGL is unavailable */}
      {!webglSupported && (
        <div className="absolute inset-0 w-full h-full pointer-events-none overflow-hidden bg-[#718B91]">
          {/* Sky Outside Window */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] w-[380px] sm:w-[560px] h-[240px] sm:h-[340px] rounded-2xl overflow-hidden border-8 border-[#ded8ce] shadow-2xl z-0"
            style={{
              backgroundImage: `url(${isNight ? '/sky-night.jpeg' : '/sky-day.jpeg'})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-2 bg-[#ded8ce]" />
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-2 bg-[#ded8ce]" />
          </div>

          {/* Sunlight Shaft */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/4 w-[500px] sm:w-[750px] h-[400px] pointer-events-none opacity-30 mix-blend-screen"
            style={{
              background: `linear-gradient(135deg, ${isNight ? 'rgba(136,183,213,0.3)' : 'rgba(245,217,140,0.5)'} 0%, transparent 70%)`,
              clipPath: 'polygon(30% 0%, 70% 0%, 100% 100%, 0% 100%)',
            }}
          />

          {/* Deep Grassy Meadow Floor with Waddling Ducks */}
          <div
            className="absolute bottom-0 left-0 right-0 h-[28vh] bg-gradient-to-t from-[#113821] via-[#174A2D] to-[#1e5836] shadow-inner"
            style={{
              boxShadow: 'inset 0 10px 30px rgba(0,0,0,0.35)',
            }}
          >
            {/* Tiny Daisy Flowers in grass */}
            <div className="relative w-full h-full overflow-hidden">
              {[...Array(24)].map((_, i) => (
                <div
                  key={i}
                  className="absolute animate-pulse"
                  style={{
                    left: `${(i * 17) % 94 + 3}%`,
                    bottom: `${(i * 23) % 75 + 10}%`,
                    animationDelay: `${(i * 200) % 2000}ms`,
                    transform: `scale(${0.6 + ((i % 5) * 0.15)})`,
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-[#F5D98C] shadow-sm relative">
                    <div className="absolute -top-1 left-0.5 w-1.5 h-1.5 rounded-full bg-[#F5F0E5]" />
                    <div className="absolute -bottom-1 left-0.5 w-1.5 h-1.5 rounded-full bg-[#F5F0E5]" />
                    <div className="absolute top-0.5 -left-1 w-1.5 h-1.5 rounded-full bg-[#F5F0E5]" />
                    <div className="absolute top-0.5 -right-1 w-1.5 h-1.5 rounded-full bg-[#F5F0E5]" />
                  </div>
                </div>
              ))}

              {/* Waddling Mama Duck & Ducklings (CSS Fallback) */}
              <div 
                className="absolute bottom-6 flex items-end gap-3 pointer-events-auto cursor-pointer animate-duck-wander"
                onClick={() => romanticAudio.playQuack()}
                title="Click the duck! Quack! ♡"
              >
                {/* Mama Duck */}
                <div className="relative w-10 h-9 bg-[#FCF9F2] rounded-full shadow-md flex items-center justify-center animate-duck-waddle">
                  <div className="absolute -top-3 right-0 w-6 h-6 bg-[#FCF9F2] rounded-full">
                    <div className="absolute top-2 left-1 w-1.5 h-1.5 bg-[#181818] rounded-full" />
                    <div className="absolute top-3 -right-2.5 w-3.5 h-1.5 bg-[#F39C12] rounded-r-full" />
                    <div className="absolute -top-1 right-2 w-2 h-2 bg-[#F5D98C] rounded-full" />
                  </div>
                </div>
                {/* Baby Duckling 1 */}
                <div className="relative w-6 h-5 bg-[#FDF2BB] rounded-full shadow-sm flex items-center justify-center animate-duck-waddle" style={{ animationDelay: '120ms' }}>
                  <div className="absolute -top-2 right-0 w-4 h-4 bg-[#FDF2BB] rounded-full">
                    <div className="absolute top-1 left-0.5 w-1 h-1 bg-[#181818] rounded-full" />
                    <div className="absolute top-2 -right-1.5 w-2 h-1 bg-[#F39C12] rounded-r-full" />
                  </div>
                </div>
                {/* Baby Duckling 2 */}
                <div className="relative w-5 h-4 bg-[#FDF2BB] rounded-full shadow-sm flex items-center justify-center animate-duck-waddle" style={{ animationDelay: '240ms' }}>
                  <div className="absolute -top-2 right-0 w-3.5 h-3.5 bg-[#FDF2BB] rounded-full">
                    <div className="absolute top-1 left-0.5 w-1 h-1 bg-[#181818] rounded-full" />
                    <div className="absolute top-1.5 -right-1.5 w-2 h-1 bg-[#F39C12] rounded-r-full" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
