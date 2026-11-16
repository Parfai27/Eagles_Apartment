// Interactive 3D model of the Eagles Apartment building, built with Three.js.
// Any element with [data-tour3d] becomes a viewer: "full" adds hotspots, a peek-inside
// apartment and a toolbar; "compact" is a lighter drag-to-rotate preview.

const tr = key => (window.siteT ? window.siteT(key) : key);

const W = 14, D = 12, FH = 3.2, LV = 5, TOP = LV * FH;
const FZ = D / 2 - 0.3;                  // front wall plane
const WINGS = { L: -3.65, R: 3.65 };      // wing centres (x)
const WING_W = 5.1;
const ROOM_Y = 2 * FH + 0.15;            // floor of the apartment you can peek into

const HOTSPOTS = [
  { id: "roof", pos: [3.65, 14.4, FZ + 1.6], normal: [0, 0, 1], img: "rooftop-lounge-sm.webp", link: "amenities.html" },
  { id: "apt", pos: [-3.65, ROOM_Y + 1.5, FZ + 1.6], normal: [0, 0, 1], peek: true },
  { id: "lift", pos: [0, 10.5, FZ + 0.6], normal: [0, 0, 1], img: "stairwell-sm.webp", link: "amenities.html" },
  { id: "gate", pos: [-2.5, 2.9, D / 2 + 2.8], normal: [0, 0, 1], img: "courtyard-sm.webp", link: "amenities.html" },
  { id: "lake", pos: [0, TOP + 2, -D / 2], normal: [0, 0.3, -1], img: "lake-view-sm.webp", link: "location.html" }
];

document.querySelectorAll("[data-tour3d]").forEach(root => {
  const io = new IntersectionObserver(entries => {
    if (entries.some(e => e.isIntersecting)) { io.disconnect(); start(root); }
  }, { rootMargin: "300px" });
  io.observe(root);
});

function webglAvailable() {
  try {
    const c = document.createElement("canvas");
    return !!(window.WebGLRenderingContext && (c.getContext("webgl2") || c.getContext("webgl")));
  } catch (e) { return false; }
}

async function start(root) {
  if (!webglAvailable()) { root.classList.add("is-fallback"); return; }
  root.classList.add("is-loading");
  try {
    const [THREE, { OrbitControls }] = await Promise.all([
      import("three"),
      import("three/addons/controls/OrbitControls.js")
    ]);
    createViewer(root, THREE, OrbitControls, root.dataset.tour3d === "full");
    root.classList.remove("is-loading");
    root.classList.add("is-ready");
  } catch (err) {
    console.error(err);
    root.classList.remove("is-loading");
    root.classList.add("is-fallback");
  }
}

// ---------- Procedural textures ----------
function canvasTexture(THREE, w, h, draw, repeat = [1, 1]) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  draw(c.getContext("2d"), w, h);
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(...repeat);
  tex.anisotropy = 4;
  return tex;
}

function rng(seed) {
  return () => ((seed = (seed * 16807) % 2147483647) - 1) / 2147483646;
}

function stoneTex(THREE) {
  const r = rng(7);
  return canvasTexture(THREE, 128, 512, (g, w, h) => {
    g.fillStyle = "#5e4632"; g.fillRect(0, 0, w, h);
    for (let y = 0; y < h; y += 14) {
      let x = -r() * 40;
      while (x < w) {
        const len = 30 + r() * 50, shade = 80 + r() * 70;
        g.fillStyle = `rgb(${shade + 40},${shade + 10},${shade - 25})`;
        g.fillRect(x + 1, y + 1, len - 2, 12);
        x += len;
      }
    }
  }, [1, 6]);
}

function fenceTex(THREE) {
  return canvasTexture(THREE, 512, 128, (g, w, h) => {
    g.fillStyle = "#1d2023"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#cbbf9f";
    const rows = [[10, 0, 160], [10, 220, 120], [36, 60, 200], [36, 330, 150], [62, 0, 90], [62, 140, 260],
      [88, 40, 180], [88, 300, 170], [112, 120, 230]];
    rows.forEach(([y, x, len]) => g.fillRect(x, y, len, 7));
    g.fillStyle = "#8f8a7c";
    for (let x = 0; x < w; x += 128) g.fillRect(x, 0, 4, h);
  }, [5, 1]);
}

function woodTex(THREE) {
  const r = rng(3);
  return canvasTexture(THREE, 256, 256, (g, w, h) => {
    for (let y = 0; y < h; y += 32) {
      for (let x = (y / 32) % 2 ? -64 : 0; x < w; x += 128) {
        const s = 150 + r() * 30;
        g.fillStyle = `rgb(${s + 20},${s - 15},${s - 60})`;
        g.fillRect(x, y, 127, 31);
      }
    }
  }, [3, 3]);
}

function paintingTex(THREE) {
  return canvasTexture(THREE, 128, 192, (g, w, h) => {
    g.fillStyle = "#e0622a"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1c1c1c";
    g.beginPath(); g.ellipse(64, 60, 46, 14, 0, 0, Math.PI * 2); g.fill();      // hat brim
    g.fillRect(40, 30, 48, 30);                                                  // hat
    g.fillStyle = "#f1e6d6";
    g.beginPath(); g.ellipse(64, 92, 18, 24, 0, 0, Math.PI * 2); g.fill();      // face
    g.fillStyle = "#1c1c1c"; g.fillRect(36, 118, 56, 74);                        // dress
  });
}

function skyTex(THREE, top, horizon) {
  return canvasTexture(THREE, 2, 256, (g, w, h) => {
    const grd = g.createLinearGradient(0, 0, 0, h);
    grd.addColorStop(0, top); grd.addColorStop(0.62, horizon); grd.addColorStop(1, horizon);
    g.fillStyle = grd; g.fillRect(0, 0, w, h);
  });
}

// ---------- Scene ----------
function buildScene(THREE) {
  const scene = new THREE.Scene();
  const M = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...o });
  const mat = {
    grey: M(0x80858a), greyDark: M(0x5c6064), beige: M(0xeadfc6), tan: M(0xd3ad74),
    stone: M(0xffffff, { map: stoneTex(THREE) }), frame: M(0x1b1f22, { roughness: 0.5 }),
    // light glass: the real windows show white curtains behind them
    glass: M(0x98a9b0, { roughness: 0.25, metalness: 0.15 }),
    glassLit: M(0x98a9b0, { roughness: 0.25, metalness: 0.15, emissive: 0xffc77a, emissiveIntensity: 0 }),
    slot: M(0x5d8fa3, { roughness: 0.08, metalness: 0.6, emissive: 0xffe2b0, emissiveIntensity: 0 }),
    railing: new THREE.MeshStandardMaterial({ color: 0xcde9f0, transparent: true, opacity: 0.3, roughness: 0.05, depthWrite: false }),
    fence: M(0xffffff, { map: fenceTex(THREE), roughness: 0.6 }),
    paving: M(0x9b978d), street: M(0x5f5c57), ground: M(0xa9a18a),
    leaf: M(0x4b7535, { side: THREE.DoubleSide }), trunk: M(0x8a7458),
    flower: M(0xd8478f), green: M(0x3f6b33),
    white: M(0xf3f0ea), wood: M(0xffffff, { map: woodTex(THREE) }), darkWood: M(0x4a3426),
    sofa: M(0x9c9993, { roughness: 1 }), velvet: M(0xa9a6a0, { roughness: 1 }), rug: M(0xd9d2c3, { roughness: 1 }),
    tv: M(0x0d0d0d, { roughness: 0.3 }), screen: M(0x10202a, { emissive: 0x3d8bc4, emissiveIntensity: 0.9 }),
    warm: M(0xfff1d6, { emissive: 0xffd28a, emissiveIntensity: 1.6 }),
    painting: M(0xffffff, { map: paintingTex(THREE) }),
    felt: M(0x2f7a3b), rattan: M(0x7d8a3c), water: M(0x3a7891, { roughness: 0.12, metalness: 0.35 }),
    hill: M(0x5b7a4a, { flatShading: true }), volcano: M(0x55504a, { flatShading: true }),
    roofRed: M(0xa4553a), wallA: M(0xe2d2b6), wallB: M(0xd8c3b0), wallC: M(0xcfd2cc)
  };

  const building = new THREE.Group();
  scene.add(building);
  const peekParts = [];   // meshes hidden when looking inside the apartment

  const box = (w, h, d, m, x, y, z, parent = building) => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x, y, z);
    mesh.castShadow = mesh.receiveShadow = true;
    parent.add(mesh);
    return mesh;
  };

  // Shell: thick grey side walls, back wall, floor slabs, top frame
  [-1, 1].forEach(s => box(0.8, TOP + 0.9, D, mat.grey, s * 6.6, (TOP + 0.9) / 2, 0));
  box(12.4, TOP, 0.3, mat.grey, 0, TOP / 2, -D / 2 + 0.15);
  for (let i = 0; i < LV; i++) box(12.4, 0.3, D, mat.greyDark, 0, i * FH, 0);
  box(7.3, 0.3, D, mat.grey, -2.55, TOP, 0);                                   // roof (left + centre)
  box(WING_W, 0.3, FZ - 3 + D / 2, mat.grey, 3.65, TOP, (-D / 2 + FZ - 3) / 2); // roof behind lounge
  for (let k = 0; k < 10; k++) box(WING_W, 0.22, 0.14, mat.greyDark, 3.65, TOP + 0.05, FZ - 2.8 + k * 0.46); // pergola
  box(W, 0.9, 0.8, mat.grey, 0, TOP + 0.45, FZ + 0.2);
  box(W, 0.9, 0.4, mat.grey, 0, TOP + 0.45, -D / 2 + 0.2);

  // Centre column: grey pilasters, stacked stone, glass stairwell slot
  [-1, 1].forEach(s => box(0.4, TOP + 0.9, 0.8, mat.grey, s * 0.9, (TOP + 0.9) / 2, FZ + 0.2));
  box(1.4, TOP, 0.3, mat.stone, 0, TOP / 2, FZ + 0.05);
  box(0.55, TOP - 1.6, 0.1, mat.slot, 0, 0.6 + (TOP - 1.6) / 2, FZ + 0.25);

  // Windows: dark glass with black frames and mullions
  // z is the wall surface, s = +1 for the front, -1 for the back
  const windowAt = (w, h, x, yc, group, lit, z = FZ + 0.1, s = 1) => {
    box(w, h, 0.05, lit ? mat.glassLit : mat.glass, x, yc, z + s * 0.02, group);
    box(w + 0.12, 0.08, 0.1, mat.frame, x, yc + h / 2, z + s * 0.04, group);
    box(w + 0.12, 0.08, 0.1, mat.frame, x, yc - h / 2, z + s * 0.04, group);
    const bars = w > 2 ? 3 : 1;
    for (let b = 0; b <= bars + 1; b++) box(0.07, h, 0.1, mat.frame, x - w / 2 + (b * w) / (bars + 1), yc, z + s * 0.04, group);
    box(w, 0.06, 0.1, mat.frame, x, yc + h * 0.28, z + s * 0.04, group);
  };

  const r = rng(11);
  for (let i = 0; i < LV; i++) {
    for (const [side, cx] of Object.entries(WINGS)) {
      const isLounge = i === LV - 1 && side === "R";
      const isPeek = i === 2 && side === "L";
      const unit = new THREE.Group();
      building.add(unit);
      const wallZ = isLounge ? FZ - 3 : FZ;
      const panel = box(WING_W, FH - 0.3, 0.2, mat.beige, cx, i * FH + 0.15 + (FH - 0.3) / 2, wallZ, unit);
      const h = i === 0 ? 2.5 : 2.0, yc = i * FH + (i === 0 ? 0.35 : 0.6) + h / 2;
      const dir = Math.sign(cx);
      if (isLounge) {
        unit.position.z = 0;
        box(4.2, 2.3, 0.05, mat.glassLit, cx, yc + 0.1, FZ - 2.88, unit);
        [1.55, 5.85].forEach(x => box(0.55, FH - 0.3, 0.55, mat.grey, x, i * FH + 1.6, FZ + 0.9));
      } else {
        windowAt(2.3, h, cx + dir * 1.05, yc, unit, r() > 0.35);
        windowAt(1.25, h, cx - dir * 1.5, yc, unit, r() > 0.35);
      }
      if (isPeek) peekParts.push(unit);
      void panel;

      // Balcony band with glass railing (upper floors)
      if (i > 0) {
        box(WING_W, 0.35, 1.5, mat.tan, cx, i * FH, FZ + 0.65);
        const rail = new THREE.Group(); building.add(rail);
        box(WING_W - 0.1, 1.0, 0.04, mat.railing, cx, i * FH + 0.68, FZ + 1.36, rail).castShadow = false;
        box(WING_W - 0.1, 0.05, 0.07, mat.frame, cx, i * FH + 1.2, FZ + 1.36, rail);
        if (isPeek) peekParts.push(rail);
        if (side === "R" && !isLounge) box(0.3, 2.3, 1.1, mat.grey, 3.15, i * FH + 1.3, FZ + 0.55);
      }
    }
  }

  // Back (lake side): windows on every upper floor
  for (let i = 1; i < LV; i++) {
    [-4.3, -1.9, 1.9, 4.3].forEach(x => windowAt(1.5, 1.9, x, i * FH + 1.55, building, r() > 0.4, -D / 2 - 0.02, -1));
  }
  // Sides: tan band and the small upper window seen in the photos
  [-1, 1].forEach(s => {
    box(0.12, 0.5, D + 0.1, mat.tan, s * 7.04, 3 * FH + 0.4, 0);
    box(0.06, 1.2, 2.2, mat.glass, s * 7.03, TOP - 1.3, FZ - 1.6);
    box(0.08, 1.32, 0.08, mat.frame, s * 7.05, TOP - 1.3, FZ - 1.6);
  });

  // Rooftop lounge furniture: billiards table and rattan chairs
  const loungeY = (LV - 1) * FH + 0.15;
  box(2.1, 0.16, 1.15, mat.darkWood, 3.6, loungeY + 0.78, FZ - 1.4);
  box(1.9, 0.03, 0.95, mat.felt, 3.6, loungeY + 0.87, FZ - 1.4);
  [[-0.9, -0.45], [0.9, -0.45], [-0.9, 0.45], [0.9, 0.45]].forEach(([dx, dz]) => box(0.14, 0.72, 0.14, mat.darkWood, 3.6 + dx, loungeY + 0.36, FZ - 1.4 + dz));
  [[5.2, FZ + 0.1], [5.2, FZ - 0.8], [2.0, FZ + 0.2]].forEach(([x, z]) => {
    const c = new THREE.Mesh(new THREE.CylinderGeometry(0.32, 0.28, 0.75, 12), mat.rattan);
    c.position.set(x, loungeY + 0.38, z); c.castShadow = true; building.add(c);
  });

  // Ground: plot paving, street, fence with bougainvillea
  box(18, 0.1, 22, mat.paving, 0, 0, 2);
  const ground = new THREE.Mesh(new THREE.CircleGeometry(420, 48), mat.ground);
  ground.rotation.x = -Math.PI / 2; ground.position.y = -0.06; ground.receiveShadow = true;
  scene.add(ground);
  const street = new THREE.Mesh(new THREE.PlaneGeometry(300, 10), mat.street);
  street.rotation.x = -Math.PI / 2; street.position.set(0, -0.02, 18); street.receiveShadow = true;
  scene.add(street);

  box(14.6, 2.2, 0.15, mat.fence, 0, 1.1, D / 2 + 2.6);
  for (let x = -7.3; x <= 7.4; x += 2.9) box(0.35, 2.5, 0.35, mat.grey, x, 1.25, D / 2 + 2.6);
  const blossom = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.18, 0), mat.flower, 160);
  const leafy = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.22, 0), mat.green, 120);
  const dummy = new THREE.Object3D();
  for (let n = 0; n < 160; n++) {
    dummy.position.set(-7 + r() * 14, 2.2 + r() * 0.6, D / 2 + 2.45 + r() * 0.4);
    dummy.scale.setScalar(0.7 + r() * 0.8); dummy.updateMatrix();
    blossom.setMatrixAt(n, dummy.matrix);
    if (n < 120) { dummy.position.y -= 0.15; dummy.updateMatrix(); leafy.setMatrixAt(n, dummy.matrix); }
  }
  scene.add(blossom, leafy);

  // Palm trees
  const palm = (x, z, h, lean) => {
    const g = new THREE.Group(); g.position.set(x, 0, z);
    let px = 0, py = 0;
    for (let s = 0; s < 6; s++) {
      const seg = new THREE.Mesh(new THREE.CylinderGeometry(0.17 - s * 0.01, 0.2 - s * 0.01, h / 6, 8), mat.trunk);
      px += lean * s * 0.05;
      seg.position.set(px, py + h / 12, 0); seg.castShadow = true; g.add(seg);
      py += h / 6;
    }
    const leafGeo = new THREE.PlaneGeometry(3.4, 0.7, 10, 1);
    leafGeo.rotateX(-Math.PI / 2);
    leafGeo.translate(1.7, 0, 0);
    const p = leafGeo.attributes.position;
    for (let v = 0; v < p.count; v++) {
      const t = p.getX(v) / 3.4;
      p.setZ(v, p.getZ(v) * (1 - t * 0.8));
      p.setY(v, -1.1 * t * t);
    }
    leafGeo.computeVertexNormals();
    for (let k = 0; k < 11; k++) {
      const leaf = new THREE.Mesh(leafGeo, mat.leaf);
      leaf.position.set(px, py, 0);
      leaf.rotation.set(0, (k / 11) * Math.PI * 2 + r() * 0.3, 0.25 + r() * 0.35);
      leaf.castShadow = true; g.add(leaf);
    }
    scene.add(g);
  };
  palm(9.5, 8.5, 9, 1.2); palm(11.5, 6, 7.5, 0.8); palm(-9.5, 9.5, 6, -1);

  // Neighbourhood: low houses, kept outside the plot, street and lake
  const houseMats = [mat.wallA, mat.wallB, mat.wallC];
  for (let n = 0, tries = 0; n < 26 && tries < 400; tries++) {
    const x = (r() - 0.5) * 150, z = -40 + r() * 110;
    if (Math.abs(x) < 13 && z > -14 && z < 26) continue;
    if (z > 12 && z < 24) continue;
    const w = 6 + r() * 6, d = 6 + r() * 6, h = 3 + r() * (r() > 0.8 ? 7 : 3);
    const house = new THREE.Group(); house.position.set(x, 0, z); house.rotation.y = (r() - 0.5) * 0.3;
    const body = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), houseMats[n % 3]);
    body.position.y = h / 2; body.castShadow = body.receiveShadow = true; house.add(body);
    if (r() > 0.4) {
      const roof = new THREE.Mesh(new THREE.ConeGeometry(Math.max(w, d) * 0.72, 1.8, 4), mat.roofRed);
      roof.position.y = h + 0.9; roof.rotation.y = Math.PI / 4; roof.scale.set(w / Math.max(w, d), 1, d / Math.max(w, d));
      roof.castShadow = true; house.add(roof);
    }
    scene.add(house); n++;
  }

  // Lake Kivu behind the building, hills across the water, Nyiragongo in the distance
  const lake = new THREE.Mesh(new THREE.PlaneGeometry(1400, 700), mat.water);
  lake.rotation.x = -Math.PI / 2; lake.position.set(0, 0.02, -45 - 350);
  scene.add(lake);
  [[-260, -470, 150, 55], [-40, -520, 190, 70], [210, -480, 170, 60], [420, -400, 160, 50], [-430, -380, 140, 45]].forEach(([x, z, sx, sy]) => {
    const hill = new THREE.Mesh(new THREE.IcosahedronGeometry(1, 1), mat.hill);
    hill.position.set(x, -sy * 0.15, z); hill.scale.set(sx, sy, 70); scene.add(hill);
  });
  const volcano = new THREE.Mesh(new THREE.CylinderGeometry(22, 170, 150, 18, 1, true), mat.volcano);
  volcano.position.set(-170, 72, 520); scene.add(volcano);

  // Apartment interior (2nd floor, left wing) revealed by "Look inside"
  const room = buildRoom(THREE, mat, box);
  building.add(room.group);

  return { scene, mat, peekParts, room };
}

function buildRoom(THREE, mat, box) {
  const g = new THREE.Group();
  const cx = WINGS.L, y0 = ROOM_Y, back = FZ - 5.5, mid = FZ - 2.75, hh = FH - 0.3;
  box(WING_W, 0.04, 5.5, mat.wood, cx, y0 + 0.02, mid, g);
  box(WING_W, 0.05, 5.5, mat.white, cx, y0 + hh - 0.02, mid, g);
  box(WING_W, hh, 0.1, mat.white, cx, y0 + hh / 2, back, g);
  box(0.1, hh, 5.5, mat.white, -6.15, y0 + hh / 2, mid, g);
  box(0.1, hh, 5.5, mat.white, -1.15, y0 + hh / 2, mid, g);
  // cove lighting around the ceiling
  box(4.5, 0.05, 0.06, mat.warm, cx, y0 + hh - 0.12, back + 0.25, g);
  box(0.06, 0.05, 5.0, mat.warm, -5.85, y0 + hh - 0.12, mid, g);
  box(0.06, 0.05, 5.0, mat.warm, -1.45, y0 + hh - 0.12, mid, g);
  // TV wall
  box(0.4, 0.35, 1.9, mat.darkWood, -5.88, y0 + 0.2, mid - 0.2, g);
  box(0.06, 0.78, 1.38, mat.tv, -6.06, y0 + 1.45, mid - 0.2, g);
  box(0.02, 0.7, 1.28, mat.screen, -6.02, y0 + 1.45, mid - 0.2, g);
  // sofas
  box(0.95, 0.42, 2.3, mat.sofa, -2.15, y0 + 0.21, mid - 0.2, g);
  box(0.25, 0.55, 2.3, mat.sofa, -1.6, y0 + 0.62, mid - 0.2, g);
  [-1, 1].forEach(s => box(0.95, 0.6, 0.22, mat.sofa, -2.15, y0 + 0.3, mid - 0.2 + s * 1.15, g));
  box(2.0, 0.42, 0.95, mat.velvet, cx, y0 + 0.21, back + 0.75, g);
  box(2.0, 0.55, 0.25, mat.velvet, cx, y0 + 0.62, back + 0.2, g);
  // rug and round coffee table
  box(2.6, 0.01, 2.2, mat.rug, cx + 0.1, y0 + 0.05, mid - 0.2, g);
  const top = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.06, 24), mat.wood);
  top.position.set(cx + 0.1, y0 + 0.42, mid - 0.2); g.add(top);
  const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.12, 0.4, 8), mat.darkWood);
  leg.position.set(cx + 0.1, y0 + 0.2, mid - 0.2); g.add(leg);
  // art on the back wall
  box(0.85, 1.25, 0.04, mat.painting, cx - 1.3, y0 + 1.6, back + 0.07, g);
  // arc floor lamp
  const post = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.9, 8), mat.frame);
  post.position.set(-5.7, y0 + 0.95, back + 0.4); g.add(post);
  const arc = new THREE.Mesh(new THREE.TorusGeometry(0.6, 0.025, 6, 20, Math.PI / 2), mat.frame);
  arc.position.set(-5.1, y0 + 1.9, back + 0.4); arc.rotation.z = Math.PI / 2; g.add(arc);
  const shade = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.25, 0.25, 16), mat.warm);
  shade.position.set(-4.5, y0 + 1.75, back + 0.4); g.add(shade);
  // sputnik chandelier
  const ch = new THREE.Group(); ch.position.set(cx + 0.1, y0 + hh - 0.75, mid - 0.2);
  ch.add(new THREE.Mesh(new THREE.SphereGeometry(0.07, 10, 8), mat.frame));
  for (let k = 0; k < 8; k++) {
    const a = (k / 8) * Math.PI * 2, rr = 0.45;
    const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, rr, 4), mat.frame);
    rod.position.set(Math.cos(a) * rr / 2, (k % 2) * 0.12 - 0.06, Math.sin(a) * rr / 2);
    rod.rotation.set(0, -a, Math.PI / 2); ch.add(rod);
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 10, 8), mat.warm);
    bulb.position.set(Math.cos(a) * rr, (k % 2) * 0.12 - 0.06, Math.sin(a) * rr); ch.add(bulb);
  }
  g.add(ch);
  const cable = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.01, 0.7, 4), mat.frame);
  cable.position.set(cx + 0.1, y0 + hh - 0.38, mid - 0.2); g.add(cable);
  // curtains and a plant
  [-5.85, -1.45].forEach(x => box(0.5, hh - 0.2, 0.08, mat.velvet, x, y0 + (hh - 0.2) / 2 + 0.05, FZ - 0.25, g));
  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.2, 0.16, 0.4, 12), mat.frame);
  pot.position.set(-1.55, y0 + 0.2, FZ - 0.8); g.add(pot);
  const bush = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 1), mat.green);
  bush.position.set(-1.55, y0 + 0.75, FZ - 0.8); g.add(bush);

  const light = new THREE.PointLight(0xffd6a0, 14, 9, 2);
  light.position.set(cx, y0 + hh - 0.5, mid - 0.4);
  light.visible = false;
  g.add(light);
  return { group: g, light };
}

// ---------- Viewer ----------
function createViewer(root, THREE, OrbitControls, full) {
  const stage = root.querySelector(".tour3d__stage");
  const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, full ? 2 : 1.5));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  stage.appendChild(renderer.domElement);

  const { scene, mat, peekParts, room } = buildScene(THREE);
  const camera = new THREE.PerspectiveCamera(full ? 38 : 34, 1, 0.3, 2000);
  const HOME = { pos: new THREE.Vector3(24, 12, 30), target: new THREE.Vector3(0, 7.5, 0) };
  if (!full) HOME.pos.set(30, 13, 38);
  camera.position.copy(HOME.pos);

  const hemi = new THREE.HemisphereLight(0xdcebf7, 0xb8a888, 1.1);
  const sun = new THREE.DirectionalLight(0xfff2dc, 2.4);
  sun.castShadow = true;
  sun.shadow.mapSize.set(full ? 2048 : 1024, full ? 2048 : 1024);
  Object.assign(sun.shadow.camera, { left: -30, right: 30, top: 30, bottom: -30, near: 1, far: 140 });
  sun.shadow.bias = -0.0004;
  const fill = new THREE.DirectionalLight(0xdfe8f0, 0.7);   // soft light on the shaded sides
  fill.position.set(-30, 18, -25);
  scene.add(hemi, sun, sun.target, fill);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.copy(HOME.target);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.enablePan = false;
  controls.minDistance = 14;
  controls.maxDistance = 85;
  controls.maxPolarAngle = Math.PI * 0.49;
  controls.autoRotate = !matchMedia("(prefers-reduced-motion: reduce)").matches;
  controls.autoRotateSpeed = 0.7;
  controls.enableZoom = full;

  // Compact viewer on touch screens: don't trap page scrolling
  if (!full && matchMedia("(pointer: coarse)").matches) {
    controls.enabled = false;
    renderer.domElement.style.touchAction = "pan-y";
  }

  let resumeTimer;
  controls.addEventListener("start", () => {
    controls.autoRotate = false;
    root.classList.add("is-touched");
    clearTimeout(resumeTimer);
  });
  controls.addEventListener("end", () => {
    clearTimeout(resumeTimer);
    if (!peeking && !full) resumeTimer = setTimeout(() => { controls.autoRotate = true; }, 6000);
  });

  // ---- Day / evening ----
  let evening = false;
  function setMood(night) {
    evening = night;
    scene.background = night ? skyTex(THREE, "#0e1a33", "#e0875a") : skyTex(THREE, "#7fb2d9", "#e8eef0");
    scene.fog = new THREE.Fog(night ? 0x3a3346 : 0xdfe8ec, 120, 700);
    hemi.intensity = night ? 0.75 : 1.1;
    fill.intensity = night ? 0.35 : 0.7;
    hemi.color.set(night ? 0x8a97c9 : 0xdcebf7);
    sun.intensity = night ? 1.5 : 2.4;
    sun.color.set(night ? 0xff9c63 : 0xfff2dc);
    sun.position.set(night ? -60 : 30, night ? 14 : 45, night ? -40 : 28);
    mat.glassLit.emissiveIntensity = night ? 1.3 : 0;
    mat.slot.emissiveIntensity = night ? 0.9 : 0;
    mat.water.color.set(night ? 0x2c4766 : 0x3a7891);
    room.light.visible = night || peeking;
    root.classList.toggle("is-evening", night);
  }

  // ---- Peek inside the apartment ----
  let peeking = false, tween = null;
  const PEEK = { pos: new THREE.Vector3(WINGS.L + 1.4, ROOM_Y + 1.9, FZ + 8.6), target: new THREE.Vector3(WINGS.L, ROOM_Y + 1.25, FZ - 3) };
  function flyTo(view, ms = 1400, done) {
    tween = { from: camera.position.clone(), fromT: controls.target.clone(), to: view.pos, toT: view.target, t0: performance.now(), ms, done };
    controls.enabled = false;
  }
  function setLimits(peek) {
    controls.minDistance = peek ? 3 : 14;
    controls.maxDistance = peek ? 13 : 85;
    controls.minAzimuthAngle = peek ? -0.75 : -Infinity;
    controls.maxAzimuthAngle = peek ? 0.75 : Infinity;
    controls.minPolarAngle = peek ? Math.PI * 0.32 : 0;
    controls.maxPolarAngle = peek ? Math.PI * 0.56 : Math.PI * 0.49;
  }
  function peek(on) {
    peeking = on;
    controls.autoRotate = false;
    peekParts.forEach(p => { p.visible = !on; });
    room.light.visible = on || evening;
    setLimits(false);
    flyTo(on ? PEEK : HOME, 1500, () => setLimits(on));
    root.classList.toggle("is-peeking", on);
    hideCard();
  }

  // ---- Hotspots, card and toolbar (full viewer only) ----
  const labels = [];
  const card = root.querySelector(".tour3d__card");
  function hideCard() { if (card) card.hidden = true; labels.forEach(l => l.el.classList.remove("is-active")); }
  function showCard(h, el) {
    labels.forEach(l => l.el.classList.toggle("is-active", l.el === el));
    card.innerHTML = `
      <button type="button" class="tour3d__card-close" aria-label="Close">×</button>
      ${h.img ? `<img src="images/${h.img}" alt="">` : ""}
      <div class="tour3d__card-body">
        <h3 data-i18n="tour.h.${h.id}.t">${tr(`tour.h.${h.id}.t`)}</h3>
        <p data-i18n="tour.h.${h.id}.b">${tr(`tour.h.${h.id}.b`)}</p>
        ${h.peek
          ? `<button type="button" class="btn btn--gold btn--sm" data-peek data-i18n="tour.look">${tr("tour.look")}</button>`
          : `<a class="link-arrow" href="${h.link}" data-i18n="tour.more">${tr("tour.more")}</a>`}
      </div>`;
    card.hidden = false;
    card.querySelector(".tour3d__card-close").addEventListener("click", hideCard);
    const pb = card.querySelector("[data-peek]");
    if (pb) pb.addEventListener("click", () => peek(true));
  }

  if (full) {
    const layer = root.querySelector(".tour3d__labels");
    HOTSPOTS.forEach(h => {
      const el = document.createElement("button");
      el.type = "button";
      el.className = "tour3d__hotspot";
      el.innerHTML = `<span class="tour3d__dot"></span><span class="tour3d__tag" data-i18n="tour.h.${h.id}.t">${tr(`tour.h.${h.id}.t`)}</span>`;
      el.addEventListener("click", () => { controls.autoRotate = false; showCard(h, el); });
      layer.appendChild(el);
      labels.push({ el, pos: new THREE.Vector3(...h.pos), normal: new THREE.Vector3(...h.normal).normalize(), h });
    });

    root.querySelectorAll("[data-jump]").forEach(b => b.addEventListener("click", () => {
      const h = HOTSPOTS.find(x => x.id === b.dataset.jump);
      if (h.peek) { peek(true); return; }
      if (peeking) peek(false);
      const p = new THREE.Vector3(...h.pos), n = new THREE.Vector3(...h.normal).normalize();
      const view = { pos: p.clone().add(n.multiplyScalar(26)).add(new THREE.Vector3(8, 6, 0)), target: p.clone().setY(Math.min(p.y, 12)) };
      controls.autoRotate = false;
      flyTo(view, 1300);
      const l = labels.find(x => x.h === h);
      setTimeout(() => showCard(h, l.el), 900);
    }));

    root.querySelector("[data-back]")?.addEventListener("click", () => peek(false));
    root.querySelector("[data-reset]")?.addEventListener("click", () => { if (peeking) peek(false); else { hideCard(); flyTo(HOME, 1000); } });
    root.querySelector("[data-mood]")?.addEventListener("click", e => {
      setMood(!evening);
      e.currentTarget.setAttribute("aria-pressed", evening);
    });
    root.querySelectorAll("[data-zoom-step]").forEach(b => b.addEventListener("click", () => {
      const f = +b.dataset.zoomStep;
      const off = camera.position.clone().sub(controls.target).multiplyScalar(f);
      const len = THREE.MathUtils.clamp(off.length(), controls.minDistance, controls.maxDistance);
      camera.position.copy(controls.target).add(off.setLength(len));
      controls.autoRotate = false;
    }));
    root.querySelector("[data-fullscreen]")?.addEventListener("click", () => {
      if (document.fullscreenElement) document.exitFullscreen();
      else root.requestFullscreen?.();
    });
  }

  setMood(false);

  // ---- Sizing, visibility and render loop ----
  function resize() {
    const w = stage.clientWidth, h = stage.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(stage);
  resize();

  let onScreen = true;
  new IntersectionObserver(([e]) => { onScreen = e.isIntersecting; }).observe(root);

  const tmp = new THREE.Vector3(), toCam = new THREE.Vector3();
  const ease = t => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

  renderer.setAnimationLoop(now => {
    if (!onScreen || document.hidden) return;
    if (tween) {
      const t = Math.min(1, (now - tween.t0) / tween.ms), k = ease(t);
      camera.position.lerpVectors(tween.from, tween.to, k);
      controls.target.lerpVectors(tween.fromT, tween.toT, k);
      if (t === 1) { const done = tween.done; tween = null; controls.enabled = true; done?.(); }
    }
    controls.update();
    renderer.render(scene, camera);

    if (labels.length) {
      const w = stage.clientWidth, h = stage.clientHeight;
      labels.forEach(l => {
        toCam.copy(camera.position).sub(l.pos);
        const facing = toCam.dot(l.normal) > 0;
        tmp.copy(l.pos).project(camera);
        const show = facing && tmp.z < 1 && !(peeking && l.h.peek);
        l.el.classList.toggle("is-hidden", !show);
        if (show) l.el.style.transform = `translate(${(tmp.x + 1) / 2 * w}px, ${(1 - tmp.y) / 2 * h}px)`;
      });
    }
  });
}
