type Vec3 = [number, number, number]
type Rgb = [number, number, number]
type Face = { pts: Vec3[]; c: Vec3; kind: string; panel: number; edge: Vec3[] }
type Pal = { pent: string; hex: string; edge: string; sage: string; bronze: string }

/**
 * Draws and drives the soccer ball on the landing page.
 *
 * The ball is a truncated icosahedron projected through a perspective camera.
 * Its panels are drawn as great-circle arcs and clipped to a circle, so the
 * silhouette stays round at every rotation instead of turning into the polygon
 * hull of the visible faces. It holds that shape in flight and only deforms on
 * contact, where the struck side flattens and the ball bulges at right angles
 * to the blow.
 *
 * Everything is imperative and lives outside React's render cycle. Returns a
 * teardown that cancels the frame loop, the timer, the observer and every
 * listener, so the route can be navigated away from without leaking.
 */
export function mountBall(root: HTMLElement): () => void {
  /* mandatory snap belongs to this route only, so it goes on and comes off
     with the component rather than living in a global stylesheet */
  document.documentElement.classList.add("ftp-snap");

  const _off: Array<() => void> = [];
  let raf = 0;
  let revealTimer = 0;
  let themeObserver: MutationObserver | null = null;
  let schemeMql: MediaQueryList | null = null;

  function on(
    target: EventTarget,
    ev: string,
    fn: EventListenerOrEventListenerObject,
    opt?: AddEventListenerOptions,
  ) {
    target.addEventListener(ev, fn, opt);
    _off.push(function () { target.removeEventListener(ev, fn, opt); });
  }




    var reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    /* ---------------- geometry: truncated icosahedron ---------------- */
    var PHI = (1 + Math.sqrt(5)) / 2;

    function norm(v: number[]): Vec3 {
      var l = Math.hypot(v[0], v[1], v[2]);
      return [v[0] / l, v[1] / l, v[2] / l];
    }

    var ico: Vec3[] = [];
    [1, -1].forEach(function (a) {
      [1, -1].forEach(function (b) {
        ico.push(norm([0, a, b * PHI]));
        ico.push(norm([a, b * PHI, 0]));
        ico.push(norm([a * PHI, 0, b]));
      });
    });

    function dist(a: Vec3, b: Vec3) { return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]); }

    /* nearest-neighbour edge length */
    var minD = Infinity;
    for (var i = 0; i < ico.length; i++) {
      for (var j = i + 1; j < ico.length; j++) {
        var d = dist(ico[i], ico[j]);
        if (d < minD) minD = d;
      }
    }
    var EPS = minD * 0.12;

    var nbrs = ico.map(function (v, idx) {
      var out: number[] = [];
      ico.forEach(function (w, k) {
        if (k !== idx && Math.abs(dist(v, w) - minD) < EPS) out.push(k);
      });
      return out;
    });

    /* triangular faces */
    var tris: number[][] = [];
    for (var a = 0; a < 12; a++) {
      for (var bI = 0; bI < nbrs[a].length; bI++) {
        var b = nbrs[a][bI];
        if (b < a) continue;
        for (var cI = 0; cI < nbrs[a].length; cI++) {
          var c = nbrs[a][cI];
          if (c < b) continue;
          if (nbrs[b].indexOf(c) !== -1) tris.push([a, b, c]);
        }
      }
    }

    function cut(p: Vec3, q: Vec3, t: number): Vec3 {
      return norm([
        p[0] + (q[0] - p[0]) * t,
        p[1] + (q[1] - p[1]) * t,
        p[2] + (q[2] - p[2]) * t
      ]);
    }

    var faces: Face[] = [];   /* { pts, centroid, kind, panel } */

    /* 12 pentagons - one per icosahedron vertex */
    ico.forEach(function (v, idx) {
      var pts = nbrs[idx].map(function (k) { return cut(v, ico[k], 1 / 3); });

      /* order around the vertex normal */
      var ref = norm([pts[0][0] - v[0], pts[0][1] - v[1], pts[0][2] - v[2]]);
      var side = norm([
        v[1] * ref[2] - v[2] * ref[1],
        v[2] * ref[0] - v[0] * ref[2],
        v[0] * ref[1] - v[1] * ref[0]
      ]);
      pts.sort(function (p, q) {
        function ang(p2: Vec3) {
          var d2 = [p2[0] - v[0], p2[1] - v[1], p2[2] - v[2]];
          return Math.atan2(
            d2[0] * side[0] + d2[1] * side[1] + d2[2] * side[2],
            d2[0] * ref[0] + d2[1] * ref[1] + d2[2] * ref[2]
          );
        }
        return ang(p) - ang(q);
      });

      faces.push({ pts: pts, c: v.slice() as Vec3, kind: "pent", panel: idx, edge: [] });
    });

    /* 20 hexagons - one per triangular face */
    tris.forEach(function (t) {
      var A = ico[t[0]], B = ico[t[1]], C = ico[t[2]];
      var pts = [
        cut(A, B, 1 / 3), cut(A, B, 2 / 3),
        cut(B, C, 1 / 3), cut(B, C, 2 / 3),
        cut(C, A, 1 / 3), cut(C, A, 2 / 3)
      ];
      var c = norm([
        (A[0] + B[0] + C[0]) / 3,
        (A[1] + B[1] + C[1]) / 3,
        (A[2] + B[2] + C[2]) / 3
      ]);
      faces.push({ pts: pts, c: c, kind: "hex", panel: -1, edge: [] });
    });

    /* which pentagon belongs to which feature */
    var PANELS = [0, 3, 5, 8, 10];

    /* A real ball is inflated: panel edges are great-circle arcs, not straight
       lines, so the outline of the ball is always a circle. Walk each edge in
       steps and push every step back onto the sphere, then pull the whole
       boundary a little toward the panel centre to leave a seam. */
    var SEG = 7;
    var SEAM = 0.05;

    faces.forEach(function (f) {
      var b: Vec3[] = [];
      var n = f.pts.length;
      for (var i = 0; i < n; i++) {
        var a = f.pts[i], c = f.pts[(i + 1) % n];
        for (var s = 0; s < SEG; s++) {
          var t = s / SEG;
          var p = norm([
            a[0] + (c[0] - a[0]) * t,
            a[1] + (c[1] - a[1]) * t,
            a[2] + (c[2] - a[2]) * t
          ]);
          b.push(norm([
            p[0] + (f.c[0] - p[0]) * SEAM,
            p[1] + (f.c[1] - p[1]) * SEAM,
            p[2] + (f.c[2] - p[2]) * SEAM
          ]));
        }
      }
      f.edge = b;
    });

    /* rotate about X then Y */
    function rotate(p: Vec3, ax: number, ay: number): Vec3 {
      var cx = Math.cos(ax), sx = Math.sin(ax);
      var y1 = p[1] * cx - p[2] * sx;
      var z1 = p[1] * sx + p[2] * cx;
      var cy = Math.cos(ay), sy = Math.sin(ay);
      return [p[0] * cy + z1 * sy, y1, -p[0] * sy + z1 * cy];
    }

    /* angles that bring vector v to face the camera (+z) */
    function facingAngles(v: Vec3): [number, number] {
      var ax = Math.atan2(v[1], v[2]);
      var z1 = v[1] * Math.sin(ax) + v[2] * Math.cos(ax);
      var ay = Math.atan2(-v[0], z1);
      return [ax, ay];
    }

    var targets = PANELS.map(function (idx) { return facingAngles(ico[idx]); });

    /* ---------------- palette ---------------- */
    var pal: Pal = { pent: '', hex: '', edge: '', sage: '', bronze: '' };
    var palDirty = true;

    function readPalette() {
      var cs = getComputedStyle(document.documentElement);
      pal.pent = cs.getPropertyValue("--ball-pent").trim() || "#2C2C28";
      pal.hex = cs.getPropertyValue("--ball-hex").trim() || "#FBFAF7";
      pal.edge = cs.getPropertyValue("--ball-edge").trim() || "#D9D1C0";
      pal.sage = cs.getPropertyValue("--sage").trim() || "#8B9E7E";
      pal.bronze = cs.getPropertyValue("--bronze").trim() || "#A0845C";
      palDirty = false;
    }

    function toRgb(hex: string): Rgb {
      var h = hex.replace("#", "");
      if (h.length === 3) h = h[0] + h[0] + h[1] + h[1] + h[2] + h[2];
      var n = parseInt(h, 16);
      return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
    }

    function mix(c1: Rgb, c2: Rgb, t: number): Rgb {
      return [
        c1[0] + (c2[0] - c1[0]) * t,
        c1[1] + (c2[1] - c1[1]) * t,
        c1[2] + (c2[2] - c1[2]) * t
      ];
    }

    function shade(rgb: Rgb, k: number) {
      var f = function (v: number) { return Math.max(0, Math.min(255, Math.round(v * k))); };
      return "rgb(" + f(rgb[0]) + "," + f(rgb[1]) + "," + f(rgb[2]) + ")";
    }

    /* ---------------- canvas ---------------- */
    var layer = root.querySelector<HTMLElement>("#ftp-ballLayer")!;
    var cv = root.querySelector<HTMLCanvasElement>("#ftp-ball")!;
    var ctx = cv.getContext("2d")!;
    var W = 0, H = 0, dpr = 1;

    function resize() {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = layer.clientWidth;
      H = layer.clientHeight;
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    var stage = root.querySelector<HTMLElement>("#ftp-stage")!;
    var stageIn = stage.firstElementChild as HTMLElement;

    /* Where the ball sits for each step, as a fraction of the content column.
       It alternates sides and the copy alternates with it, so the two swap
       places as you scroll. Order must match the .feat--left/--right classes. */
    var HERO_POS = { x: 0.735, y: 0.50, r: 0.235 };
    var STAGE_POS = [
      { x: 0.245, y: 0.47, r: 0.215 },
      { x: 0.755, y: 0.53, r: 0.215 },
      { x: 0.245, y: 0.47, r: 0.215 },
      { x: 0.755, y: 0.53, r: 0.215 },
      { x: 0.245, y: 0.50, r: 0.245 }
    ];

    function ballTarget() {
      var pos = (active >= 0 && active < STAGE_POS.length) ? STAGE_POS[active] : HERO_POS;

      if (window.innerWidth <= 900) {
        /* clear of the sticky nav above and the veil's fade below; the
           side-to-side swing is compressed to a drift at this width */
        return {
          x: W * (0.5 + (pos.x - 0.5) * 0.34),
          y: H * 0.24,
          r: Math.min(W * 0.30, H * 0.155)
        };
      }

      var rect = stageIn.getBoundingClientRect();
      return {
        x: rect.left + rect.width * pos.x,
        y: H * pos.y,
        r: Math.min(rect.width * pos.r, H * 0.335)
      };
    }

    /* The ball is sprung to its anchor rather than eased to it, so it carries
       momentum, overshoots slightly and settles - a struck ball, not a slide. */
    var bx = 0, by = 0, br = 0, vx = 0, vy = 0, boxReady = false;
    var SPRING = 22, DAMP = 6.6;

    function ballBox(dt: number) {
      var t = ballTarget();

      if (!boxReady) {
        bx = t.x; by = t.y; br = t.r; vx = 0; vy = 0;
        boxReady = true;
      } else if (reduced) {
        var k = 1 - Math.exp(-dt * 3.1);
        bx += (t.x - bx) * k;
        by += (t.y - by) * k;
        vx = 0; vy = 0;
      } else {
        vx += ((t.x - bx) * SPRING - vx * DAMP) * dt;
        vy += ((t.y - by) * SPRING - vy * DAMP) * dt;
        bx += vx * dt;
        by += vy * dt;
      }

      br += (t.r - br) * (1 - Math.exp(-dt * 3.4));
      return { x: bx, y: by, r: br };
    }

    /* ---------------- state ---------------- */
    var curAx = -0.36, curAy = 0.4;
    var tgtAx = -0.36, tgtAy = 0.4;
    var active = -1;
    var live = false;
    var glow = PANELS.map(function () { return 0; });
    var last = 0;
    var spin = 0;
    var wobble = 0;      /* spin picked up from scrolling, decays to nothing */
    var prevScroll = 0;
    var kick = 0;        /* spin off the strike when the ball is played to a new step */
    var trail: { x: number; y: number; r: number }[] = [];      /* recent positions, drawn as motion blur when it travels fast */

    /* A pressurised ball holds its shape in flight. It only deforms while
       something is touching it, and then it flattens on the side that took the
       blow and bulges out at right angles to it. dent is that compression,
       (dnx,dny) is the side the hit came from, and both die off in about a tenth
       of a second, so the ball is a circle at every other moment. */
    var dent = 0, dnx = 0, dny = 1;

    /* Radial scale that depends only on direction, so the panels and the outline
       warp as one piece instead of the ball being scaled into an oval. */
    function dentScale(dx: number, dy: number) {
      var m = Math.sqrt(dx * dx + dy * dy);
      if (m < 1e-6) return 1;
      var c = (dx * dnx + dy * dny) / m;
      var flat = c > 0 ? c * c : 0;
      return 1 - dent * flat + dent * 0.42 * (1 - c * c);
    }

    function setActive(n: number) {
      if (n === active) return;
      active = n;
      if (n >= 0) {
        var t = targets[n];
        tgtAx = t[0];
        /* unwrap so the ball always turns the short way round */
        var ay = t[1];
        while (ay - curAy > Math.PI) ay -= Math.PI * 2;
        while (curAy - ay > Math.PI) ay += Math.PI * 2;
        tgtAy = ay;
      } else {
        /* back to the idle turn, picking up from wherever it stopped */
        spin = curAy - 0.4;
      }

      /* Play the ball to its new anchor: loft it so it travels on an arc, and
         put spin on it in the direction it is struck. The spring does the rest. */
      if (boxReady && !reduced) {
        var dx = ballTarget().x - bx;
        var reach = Math.abs(dx);
        var loft = Math.min(reach * 1.05, 820);
        vy -= loft;
        kick += (dx >= 0 ? 1 : -1) * Math.min(0.6 + reach / 380, 2.5);
        /* the contact is behind and below the way it is about to travel, so the
           dent sits on that side and the ball squeezes away from the boot */
        var ml = Math.sqrt(dx * dx + loft * loft) || 1;
        dnx = -dx / ml;
        dny = loft / ml;
        dent = Math.min(0.09 + reach / 4200, 0.17);
      }

      for (var i = 0; i < railDots.length; i++) {
        railDots[i].classList.toggle("on", i === n);
      }
    }

    var CAM = 3.15;
    /* From a camera CAM radii away, the sphere's visible cap is z > 1/CAM, and
       that horizon projects to SIL of the model scale. Deriving it means the
       drawn ball fills exactly the radius ballBox() asks for. */
    var HORIZON = 1 / CAM;
    var SIL = Math.sqrt(1 - 1 / (CAM * CAM)) * (CAM * CAM) / (1 + CAM * CAM);
    var AMB = 0.62;   /* ambient floor - the shaded side never goes fully black */
    var DIF = 0.55;   /* how hard the key light falls across a panel */

    function draw(now: number) {
      var dt = last ? Math.min((now - last) / 1000, 0.05) : 0.016;
      last = now;

      tick(now);
      if (palDirty) readPalette();

      if (active < 0) {
        spin += dt * (reduced ? 0 : 0.22);
        tgtAy = 0.4 + spin;
        tgtAx = -0.36;
      }

      var k = 1 - Math.exp(-dt * 3.6);
      curAx += (tgtAx - curAx) * k;
      curAy += (tgtAy - curAy) * k;

      /* scroll gives the ball a nudge of spin, and being played to a new step
         gives it a harder one; both bleed off so it settles onto its panel */
      wobble *= Math.exp(-dt * 2.7);
      kick *= Math.exp(-dt * 2.0);
      dent *= Math.exp(-dt * 6.4);

      var breathe = reduced ? 0 : Math.sin(now / 2600) * 0.035;

      for (var g = 0; g < glow.length; g++) {
        var want = (g === active) ? 1 : 0;
        glow[g] += (want - glow[g]) * (1 - Math.exp(-dt * 4.5));
      }

      ctx.clearRect(0, 0, W, H);
      if (!live) { raf = requestAnimationFrame(draw); return; }

      var box = ballBox(dt);
      var L = norm([-0.42, 0.66, 0.85]);

      var pentRgb = toRgb(pal.pent);
      var hexRgb = toRgb(pal.hex);
      var sageRgb = toRgb(pal.sage);
      var bronzeRgb = toRgb(pal.bronze);
      var seamRgb = toRgb(pal.edge);

      /* the last step is about repetition, so the ball is juggled there */
      var beat = (!reduced && active === 4) ? Math.abs(Math.sin(now / 430)) : 0;
      var groundY = box.y;
      box.y -= beat * box.r * 0.26;

      /* each time it comes back down onto the foot it takes a squeeze from
         underneath, sharp enough that you only catch it at the bottom */
      if (active === 4 && !reduced) {
        var hit = 1 - beat;
        hit = hit * hit * hit * 0.15;
        if (hit > dent) { dent = hit; dnx = 0; dny = 1; }
      }

      /* contact shadow, tightening and fading as the ball lifts off it */
      ctx.save();
      ctx.globalAlpha = 0.16 * (1 - beat * 0.55);
      var shy = groundY + box.r * 1.04;
      var sg = ctx.createRadialGradient(box.x, shy, 0, box.x, shy, box.r * 0.95);
      sg.addColorStop(0, "rgba(60,52,38,0.55)");
      sg.addColorStop(1, "rgba(60,52,38,0)");
      ctx.fillStyle = sg;
      ctx.beginPath();
      ctx.ellipse(box.x, shy, box.r * (0.92 - beat * 0.16), box.r * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      /* motion blur: ghosts of where it just was, only while it is really moving */
      var speed = Math.hypot(vx, vy);
      trail.push({ x: box.x, y: box.y, r: box.r });
      if (trail.length > 9) trail.shift();

      /* Only at real pace, and faint. Full-size ghosts at a quarter opacity read
         as a stack of shadows trailing the ball rather than one ball moving fast,
         so these sit inside its own outline and stay under a tenth. */
      if (speed > 620 && !reduced) {
        ctx.save();
        ctx.fillStyle = shade(mix(hexRgb, pentRgb, 0.5), 1);
        for (var g = trail.length - 5; g < trail.length - 1; g += 2) {
          if (g < 0) continue;
          var age = g / trail.length;
          ctx.globalAlpha = age * Math.min(speed / 6000, 0.09);
          ctx.beginPath();
          ctx.arc(trail[g].x, trail[g].y, trail[g].r * (0.80 + age * 0.14), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      var ax = curAx + breathe;
      var ay = curAy + wobble + kick;
      var scale = box.r / SIL;

      /* The outline is a circle at every moment except the few frames after a
         contact, when the struck side flattens. Nothing here scales the ball as
         a whole, so it can never read as an oval in mid-air. */
      var dented = dent > 0.004;

      ctx.save();
      ctx.beginPath();
      if (dented) {
        for (var o = 0; o <= 96; o++) {
          var th = o / 96 * Math.PI * 2;
          var ux = Math.cos(th), uy = Math.sin(th);
          var ur = dentScale(ux, uy) * box.r;
          if (o === 0) ctx.moveTo(box.x + ux * ur, box.y + uy * ur);
          else ctx.lineTo(box.x + ux * ur, box.y + uy * ur);
        }
        ctx.closePath();
      } else {
        ctx.arc(box.x, box.y, box.r, 0, Math.PI * 2);
      }
      ctx.clip();

      /* a touch wider than the ball so the sideways bulge is never left bare */
      var pad = box.r * 1.12;
      ctx.fillStyle = shade(seamRgb, 0.5);
      ctx.fillRect(box.x - pad, box.y - pad, pad * 2, pad * 2);

      var vis: { f: Face; n: Vec3; z: number }[] = [];
      for (var f = 0; f < faces.length; f++) {
        var fc = faces[f];
        var rc = rotate(fc.c, ax, ay);
        /* keep any panel that could still reach over the horizon - the clip
           trims whatever spills past the edge of the sphere */
        if (rc[2] < HORIZON - 0.45) continue;
        vis.push({ f: fc, n: rc, z: rc[2] });
      }
      vis.sort(function (p, q) { return p.z - q.z; });

      for (var v = 0; v < vis.length; v++) {
        var item = vis[v];
        var fc2 = item.f;
        var b = fc2.edge;
        var np = b.length;
        var xs: number[] = [], ys: number[] = [];
        var loLit = 2, hiLit = -2, lo = 0, hi = 0;

        for (var p = 0; p < np; p++) {
          var rp = rotate(b[p], ax, ay);
          var pf = CAM / (rp[2] + CAM);
          var px = rp[0] * pf * scale;
          var py = -rp[1] * pf * scale;
          if (dented) {
            var pds = dentScale(px, py);
            px *= pds; py *= pds;
          }
          xs.push(box.x + px);
          ys.push(box.y + py);
          /* on a unit sphere the surface normal IS the point, so brightness can
             be evaluated per boundary point and graded across the panel -
             a single flat tone per panel is what made it look faceted */
          var l = rp[0] * L[0] + rp[1] * L[1] + rp[2] * L[2];
          if (l < loLit) { loLit = l; lo = p; }
          if (l > hiLit) { hiLit = l; hi = p; }
        }

        ctx.beginPath();
        ctx.moveTo(xs[0], ys[0]);
        for (var q = 1; q < np; q++) ctx.lineTo(xs[q], ys[q]);
        ctx.closePath();

        var base;
        if (fc2.kind === "pent") {
          var slot = PANELS.indexOf(fc2.panel);
          base = (slot >= 0 && glow[slot] > 0.001)
            ? mix(pentRgb, slot === 3 ? bronzeRgb : sageRgb, glow[slot] * 0.92)
            : pentRgb;
        } else {
          base = hexRgb;
        }

        var spanX = xs[hi] - xs[lo], spanY = ys[hi] - ys[lo];
        if (spanX * spanX + spanY * spanY > 4) {
          var grad = ctx.createLinearGradient(xs[lo], ys[lo], xs[hi], ys[hi]);
          grad.addColorStop(0, shade(base, AMB + DIF * Math.max(0, loLit)));
          grad.addColorStop(1, shade(base, AMB + DIF * Math.max(0, hiLit)));
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = shade(base, AMB + DIF * Math.max(0, (loLit + hiLit) / 2));
        }
        ctx.fill();
      }

      /* marker ring on the live panel */
      for (var m = 0; m < vis.length; m++) {
        var it = vis[m];
        if (it.f.kind !== "pent") continue;
        var sl = PANELS.indexOf(it.f.panel);
        if (sl < 0 || glow[sl] <= 0.02 || it.n[2] < 0.6) continue;
        var mf = CAM / (it.n[2] + CAM);
        var mx = it.n[0] * mf * scale, my = -it.n[1] * mf * scale;
        if (dented) {
          var mds = dentScale(mx, my);
          mx *= mds; my *= mds;
        }
        ctx.save();
        ctx.globalAlpha = glow[sl] * 0.9;
        ctx.strokeStyle = shade(hexRgb, 1);
        ctx.lineWidth = Math.max(1, box.r * 0.008);
        ctx.beginPath();
        ctx.arc(box.x + mx, box.y + my, box.r * 0.055, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }

      /* limb darkening - the surface curves away from the eye at the rim */
      var limb = ctx.createRadialGradient(
        box.x, box.y, box.r * 0.52,
        box.x, box.y, box.r
      );
      limb.addColorStop(0, "rgba(0,0,0,0)");
      limb.addColorStop(0.76, "rgba(0,0,0,0.07)");
      limb.addColorStop(1, "rgba(0,0,0,0.36)");
      ctx.fillStyle = limb;
      ctx.fillRect(box.x - pad, box.y - pad, pad * 2, pad * 2);

      /* specular sheen, placed where the surface normal actually meets the key
         light rather than at an eyeballed offset */
      var lf = CAM / (L[2] + CAM);
      var spx = box.x + L[0] * lf * scale;
      var spy = box.y - L[1] * lf * scale;
      var spec = ctx.createRadialGradient(spx, spy, 0, spx, spy, box.r * 0.46);
      spec.addColorStop(0, "rgba(255,255,255,0.26)");
      spec.addColorStop(0.40, "rgba(255,255,255,0.07)");
      spec.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = spec;
      ctx.fillRect(box.x - box.r, box.y - box.r, box.r * 2, box.r * 2);

      ctx.restore();

      raf = requestAnimationFrame(draw);
    }

    raf = requestAnimationFrame(draw);

    /* ---------------- scroll-driven state ----------------
       Deliberately not IntersectionObserver: everything here is measured from
       live rects, so a missed callback can never leave the page blank. */
    var railEl = root.querySelector<HTMLElement>("#ftp-rail")!;
    var railDots = Array.prototype.slice.call(railEl.querySelectorAll("span"));
    var feats = Array.prototype.slice.call(document.querySelectorAll(".feat"));
    var pending = Array.prototype.slice.call(document.querySelectorAll(".rise"));

    pending.forEach(function (el, i) {
      el.style.transitionDelay = (Math.min(i % 6, 5) * 55) + "ms";
    });

    /* only hide things once we know we can bring them back */
    root.classList.add("is-revealing");

    /* last-resort net: if anything below throws, copy still appears */
    revealTimer = window.setTimeout(function () {
      var all = document.querySelectorAll(".rise");
      var vh = window.innerHeight || 800;
      for (var i = 0; i < all.length; i++) {
        if (all[i].getBoundingClientRect().top < vh) all[i].classList.add("in");
      }
    }, 2500);

    function update() {
      var vh = window.innerHeight || document.documentElement.clientHeight || 800;
      var vw = window.innerWidth || document.documentElement.clientWidth || 1200;

      for (var i = pending.length - 1; i >= 0; i--) {
        var r = pending[i].getBoundingClientRect();
        if (r.top < vh * 0.94 && r.bottom > -80) {
          pending[i].classList.add("in");
          pending.splice(i, 1);
        }
      }

      var sr = stage.getBoundingClientRect();
      /* retire the ball once the stage is mostly past, so it can't bleed into
         the sections below on short pages or very tall viewports */
      var nowLive = sr.top < vh && sr.bottom > vh * 0.3;
      if (nowLive !== live) {
        live = nowLive;
        layer.classList.toggle("is-live", live);
      }
      railEl.classList.toggle("is-live", live && vw > 900);

      /* the feature whose middle sits closest to the middle of the screen wins */
      var mid = vh * 0.5, best = -1, bestD = Infinity;
      for (var f = 0; f < feats.length; f++) {
        var fr = feats[f].getBoundingClientRect();
        if (fr.bottom < vh * 0.15 || fr.top > vh * 0.85) continue;
        var d = Math.abs((fr.top + fr.bottom) / 2 - mid);
        if (d < bestD) { bestD = d; best = f; }
      }
      setActive(best);
    }

    var lastY = NaN, lastCheck = -1e9;
    function tick(now: number) {
      var y = window.scrollY || window.pageYOffset || 0;
      if (y !== lastY || now - lastCheck > 250) {
        lastY = y;
        lastCheck = now;
        update();
      }
    }

    /* Driven from the events themselves, not only from rAF: background tabs and
       throttled renderers pause rAF, and copy must never depend on a frame. */
    function refresh() {
      var y = window.scrollY || window.pageYOffset || 0;
      if (!reduced) {
        wobble += (y - prevScroll) * 0.0016;
        if (wobble > 0.9) wobble = 0.9;
        if (wobble < -0.9) wobble = -0.9;
      }
      prevScroll = y;
      lastY = y;
      update();
    }

    on(window, "scroll", refresh, { passive: true });
    on(window, "orientationchange", refresh);
    on(window, "pageshow", refresh);
    on(document, "visibilitychange", refresh);
    on(window, "resize", function () {
      resize();
      boxReady = false;   /* snap to the new anchor instead of gliding to it */
      refresh();
    }, { passive: true });

    refresh();

    /* nav hairline */
    var nav = root.querySelector<HTMLElement>("#ftp-nav")!;
    function onScroll() { nav.classList.toggle("is-stuck", window.scrollY > 8); }
    on(window, "scroll", onScroll, { passive: true });
    onScroll();

    /* ---------------- theme ----------------
       The real theme toggle lives in the app's own <ThemeToggle> (next-themes),
       rendered in the nav alongside this canvas. All this does is notice when
       next-themes flips the .dark class on <html> (its click handler, system
       preference changes, another tab) and re-read the ball's palette so it
       repaints in the new theme rather than waiting for the next scroll tick. */
    themeObserver = new MutationObserver(function () { palDirty = true; });
    themeObserver.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    schemeMql = window.matchMedia("(prefers-color-scheme: dark)");
    on(schemeMql, "change", function () { palDirty = true; });

    resize();

  return function cleanup() {
    cancelAnimationFrame(raf);
    clearTimeout(revealTimer);
    if (themeObserver) themeObserver.disconnect();
    _off.forEach(function (f) { f(); });
    document.documentElement.classList.remove("ftp-snap");
  };

}
