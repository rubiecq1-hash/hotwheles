let scene, camera, renderer;
const elementos = [];
let discoAcrecion, discoExterior;
let campoEstrellas, tunelLineas;

let mouseX = 0, mouseY = 0;
let targetX = 0, targetY = 0;

const frases = [
    "Eres único ⚡", "Feliz día para ti 🏎️", "Apareces cuando más hace falta 💙",
    "No necesito un mapa si tú eres el destino 🗺️", "Contigo hasta lo simple brilla ✨",
    "Solo para ti, sin freno 🚀", "Gracias por estar ahí ❤️", "Eres mi persona favorita 🌟",
    "Me alegra conocerte 🎉", "Contigo todo es mejor ✨", "Que este día te alcance hoy 🏆",
    "Hoy celebro tenerte cerca 💙", "Gracias por ser tú 🔥", "Tu risa le hace bien a mis días 😊"
];

const carImagenes = [
    'carro1.jpg', 'carro2.jpg', 'carro3.jpg', 'carro4.jpg',
    'carro5.jpg', 'carro6.jpg', 'carro7.jpg', 'carro8.jpg',
    'carro9.jpg', 'carro10.jpg', 'carro11.jpg', 'carro12.jpg'
];

function init() {
    const container = document.getElementById('canvas-container');

    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x020208, 0.012);

    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 8;

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);

    // 1. Campo Estelar de Túnel Hiperespacial
    const countEstrellas = 3500;
    const geoEstrellas = new THREE.BufferGeometry();
    const posEstrellas = new Float32Array(countEstrellas * 3);

    for (let i = 0; i < countEstrellas * 3; i += 3) {
        posEstrellas[i] = (Math.random() - 0.5) * 140;
        posEstrellas[i + 1] = (Math.random() - 0.5) * 140;
        posEstrellas[i + 2] = -Math.random() * 180;
    }

    geoEstrellas.setAttribute('position', new THREE.BufferAttribute(posEstrellas, 3));

    const canvasStar = document.createElement('canvas');
    canvasStar.width = 32; canvasStar.height = 32;
    const ctxS = canvasStar.getContext('2d');
    const gradS = ctxS.createRadialGradient(16, 16, 0, 16, 16, 16);
    gradS.addColorStop(0, '#ffffff');
    gradS.addColorStop(0.3, '#00f0ff');
    gradS.addColorStop(0.7, '#0044ff');
    gradS.addColorStop(1, 'transparent');
    ctxS.fillStyle = gradS;
    ctxS.fillRect(0, 0, 32, 32);

    const texStar = new THREE.CanvasTexture(canvasStar);
    const matEstrellas = new THREE.PointsMaterial({
        size: 1.8,
        map: texStar,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });

    campoEstrellas = new THREE.Points(geoEstrellas, matEstrellas);
    scene.add(campoEstrellas);

    // 2. Líneas de Velocidad / Túnel de Neón
    crearTunelLineas();

    // 3. Agujero Negro Central Estilo Interstellar
    const blackHoleGeo = new THREE.SphereGeometry(5, 64, 64);
    const blackHoleMat = new THREE.MeshBasicMaterial({ color: 0x000000 });
    const blackHole = new THREE.Mesh(blackHoleGeo, blackHoleMat);
    blackHole.position.z = -40;
    scene.add(blackHole);

    // Disco Interiores Azul Eléctrico
    discoAcrecion = crearDiscoNeón(5.2, 16, '#00ffff', '#0044ff', Math.PI / 2.3);
    discoAcrecion.position.z = -40;
    scene.add(discoAcrecion);

    // Anillo Exterior Naranja Fuego (Efecto Interstellar de Gran Impacto)
    discoExterior = crearDiscoNeón(16.5, 28, '#ff5500', '#ff0055', Math.PI / 2.1);
    discoExterior.position.z = -40;
    scene.add(discoExterior);

    // 4. Frases Neón Volantes
    frases.forEach((texto, index) => {
        const sprite = createTextSprite(texto);
        resetPosition(sprite, true, index, frases.length);
        scene.add(sprite);
        elementos.push({ sprite, speed: 0.22 + Math.random() * 0.1, rotSpeed: (Math.random() - 0.5) * 0.02 });
    });

    // 5. Cargar Carritos con Rotación y Sombra Neón
    carImagenes.forEach((url, index) => {
        cargarImagenSinFondoBlanco(url, (texture) => {
            const mat = new THREE.SpriteMaterial({ map: texture, transparent: true });
            const carSprite = new THREE.Sprite(mat);
            carSprite.scale.set(13, 7, 1);
            resetPosition(carSprite, true, index, carImagenes.length);
            scene.add(carSprite);
            elementos.push({ sprite: carSprite, speed: 0.28 + Math.random() * 0.15, rotSpeed: (Math.random() - 0.5) * 0.03 });
        });
    });

    // Interacción con Mouse / Touch
    window.addEventListener('mousemove', onDocumentMouseMove);
    window.addEventListener('touchmove', onDocumentTouchMove);
    window.addEventListener('resize', onWindowResize);

    animate();
}

function crearDiscoNeón(innerR, outerR, color1, color2, rotX) {
    const ringGeo = new THREE.RingGeometry(innerR, outerR, 64);
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 512;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(256, 256, 120, 256, 256, 256);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.3, color1);
    grad.addColorStop(0.7, color2);
    grad.addColorStop(1, 'transparent');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, 512, 512);

    const tex = new THREE.CanvasTexture(canvas);
    const mat = new THREE.MeshBasicMaterial({
        map: tex,
        side: THREE.DoubleSide,
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    const mesh = new THREE.Mesh(ringGeo, mat);
    mesh.rotation.x = rotX;
    return mesh;
}

function crearTunelLineas() {
    const geo = new THREE.BufferGeometry();
    const count = 150;
    const pos = new Float32Array(count * 6);

    for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const radius = 10 + Math.random() * 15;
        const zStart = -Math.random() * 150;
        const len = 10 + Math.random() * 20;

        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        pos[i * 6] = x; pos[i * 6 + 1] = y; pos[i * 6 + 2] = zStart;
        pos[i * 6 + 3] = x; pos[i * 6 + 4] = y; pos[i * 6 + 5] = zStart + len;
    }

    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    const mat = new THREE.LineBasicMaterial({
        color: 0x00f0ff,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending
    });
    tunelLineas = new THREE.LineSegments(geo, mat);
    scene.add(tunelLineas);
}

function cargarImagenSinFondoBlanco(url, callback) {
    const img = new Image();
    img.crossOrigin = "Anonymous";
    img.src = url;

    img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0);

        const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imgData.data;

        for (let i = 0; i < data.length; i += 4) {
            const r = data[i], g = data[i + 1], b = data[i + 2];
            if (r > 210 && g > 210 && b > 210) {
                data[i + 3] = 0;
            }
        }

        ctx.putImageData(imgData, 0, 0);
        callback(new THREE.CanvasTexture(canvas));
    };
}

function createTextSprite(message) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 1024;
    canvas.height = 256;

    ctx.font = 'bold 50px "Fredoka", cursive, sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.shadowColor = '#00f0ff';
    ctx.shadowBlur = 25;
    ctx.fillText(message, 512, 128);

    const texture = new THREE.CanvasTexture(canvas);
    const spriteMaterial = new THREE.SpriteMaterial({
        map: texture,
        transparent: true,
        blending: THREE.AdditiveBlending
    });
    const sprite = new THREE.Sprite(spriteMaterial);
    sprite.scale.set(14, 3.5, 1);
    return sprite;
}

function resetPosition(sprite, initial = false, index = 0, total = 1) {
    const angle = (index / total) * Math.PI * 2 + (Math.random() * 0.5);
    const radius = 8 + Math.random() * 14;

    sprite.position.x = Math.cos(angle) * radius;
    sprite.position.y = Math.sin(angle) * radius;

    if (initial) {
        sprite.position.z = - (Math.random() * 120);
    } else {
        sprite.position.z = -120;
    }
}

function onDocumentMouseMove(event) {
    mouseX = (event.clientX - window.innerWidth / 2) * 0.0008;
    mouseY = (event.clientY - window.innerHeight / 2) * 0.0008;
}

function onDocumentTouchMove(event) {
    if (event.touches.length > 0) {
        mouseX = (event.touches[0].clientX - window.innerWidth / 2) * 0.0008;
        mouseY = (event.touches[0].clientY - window.innerHeight / 2) * 0.0008;
    }
}

function animate() {
    requestAnimationFrame(animate);

    // Suave seguimiento de la cámara con el mouse/dedo
    targetX += (mouseX - targetX) * 0.05;
    targetY += (-mouseY - targetY) * 0.05;
    camera.position.x = targetX * 15;
    camera.position.y = targetY * 15;
    camera.lookAt(0, 0, -35);

    // Rotación de los discos neón en el centro
    if (discoAcrecion) discoAcrecion.rotation.z += 0.008;
    if (discoExterior) discoExterior.rotation.z -= 0.004;

    // Movimiento fluido del túnel estelar
    if (campoEstrellas) {
        const positions = campoEstrellas.geometry.attributes.position.array;
        for (let i = 2; i < positions.length; i += 3) {
            positions[i] += 0.6;
            if (positions[i] > 15) {
                positions[i] = -180;
            }
        }
        campoEstrellas.geometry.attributes.position.needsUpdate = true;
    }

    // Avance y ligera rotación de frases y carros
    elementos.forEach((item) => {
        item.sprite.position.z += item.speed;
        item.sprite.material.rotation += item.rotSpeed || 0;

        // Evitar que las frases pasen por encima del título arriba
        if (item.sprite.position.y > 6 && item.sprite.position.z > -10) {
            item.sprite.position.y = 5;
        }

        if (item.sprite.position.z > 12) {
            resetPosition(item.sprite, false, Math.random() * 10, 10);
        }
    });

    renderer.render(scene, camera);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function iniciar() {
    document.getElementById('startScreen').style.display = 'none';
    init();
}

function toggleModal(show) {
    const modal = document.getElementById('cardModal');
    if (show) modal.classList.add('active');
    else modal.classList.remove('active');
}