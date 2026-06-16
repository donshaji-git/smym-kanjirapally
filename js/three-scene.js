/* ═══════════════════════════════════════════════════════
   THREE-SCENE.JS — 3D Hero Element
   Renders a premium 3D floating Liturgical Golden Cross
   with dynamic lighting and mouse-parallax interaction.
   ═══════════════════════════════════════════════════════ */

(function () {
    const canvas = document.getElementById('three-canvas');
    if (!canvas) return;

    const container = document.getElementById('hero-right');
    if (!container) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();

    // Camera
    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 100);
    camera.position.z = 8;

    // Renderer
    const renderer = new THREE.WebGLRenderer({
        canvas: canvas,
        alpha: true,
        antialias: true
    });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // --- Create 3D Cross Group ---
    const crossGroup = new THREE.Group();

    // Materials: Liturgical Gold (#D4AF37)
    const goldMaterial = new THREE.MeshStandardMaterial({
        color: 0xD4AF37,
        metalness: 0.9,
        roughness: 0.15,
        bumpScale: 0.05
    });

    // Vertical Bar: 0.6 wide, 3.2 high, 0.4 deep
    const verticalGeom = new THREE.BoxGeometry(0.6, 3.2, 0.4);
    const verticalBar = new THREE.Mesh(verticalGeom, goldMaterial);
    crossGroup.add(verticalBar);

    // Horizontal Bar: 2.0 wide, 0.6 high, 0.4 deep
    // Placed at y = 0.6 (upper third of vertical bar)
    const horizontalGeom = new THREE.BoxGeometry(2.0, 0.6, 0.4);
    const horizontalBar = new THREE.Mesh(horizontalGeom, goldMaterial);
    horizontalBar.position.y = 0.6;
    crossGroup.add(horizontalBar);

    // Add crossGroup to scene
    scene.add(crossGroup);

    // --- Lights ---
    // Soft Ambient Light
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);

    // Main Golden Key Light (Front-Right-Top)
    const keyLight = new THREE.DirectionalLight(0xF4C542, 2.5);
    keyLight.position.set(5, 5, 4);
    scene.add(keyLight);

    // Soft Crimson Fill Light (Front-Left-Bottom)
    const fillLight = new THREE.DirectionalLight(0x8B0000, 1.5);
    fillLight.position.set(-5, -3, 2);
    scene.add(fillLight);

    // Rim Light (Back-Center) to highlight the edges of the cross
    const rimLight = new THREE.PointLight(0xffffff, 3, 15);
    rimLight.position.set(0, 0, -3);
    scene.add(rimLight);

    // --- Interactive Mouse Movement ---
    let mouse = { x: 0, y: 0 };
    let targetRotation = { x: 0, y: 0 };

    window.addEventListener('mousemove', (e) => {
        // Normalize mouse coordinates from -0.5 to 0.5
        mouse.x = (e.clientX / window.innerWidth) - 0.5;
        mouse.y = (e.clientY / window.innerHeight) - 0.5;

        // Map to rotation angles (in radians)
        targetRotation.y = mouse.x * 0.8;
        targetRotation.x = mouse.y * 0.6;
    });

    // --- Animation Loop ---
    const clock = new THREE.Clock();

    function animate() {
        requestAnimationFrame(animate);

        const elapsedTime = clock.getElapsedTime();

        // 1. Gentle Floating motion (sin wave on Y position)
        crossGroup.position.y = Math.sin(elapsedTime * 1.5) * 0.25;

        // 2. Slow base rotation + mouse responsive rotation
        // Lerp rotation for smooth easing
        crossGroup.rotation.y += (targetRotation.y + (Math.sin(elapsedTime * 0.5) * 0.1) - crossGroup.rotation.y) * 0.05;
        crossGroup.rotation.x += (targetRotation.x - crossGroup.rotation.x) * 0.05;

        // 3. Gentle wobble/tilt
        crossGroup.rotation.z = Math.cos(elapsedTime * 0.8) * 0.03;

        // Render scene
        renderer.render(scene, camera);
    }

    animate();

    // --- Responsive Resize ---
    window.addEventListener('resize', () => {
        const width = container.clientWidth;
        const height = container.clientHeight;

        camera.aspect = width / height;
        camera.updateProjectionMatrix();

        renderer.setSize(width, height);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    });

})();
