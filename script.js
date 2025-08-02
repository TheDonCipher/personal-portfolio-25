// Set CSS variables for colors used in JS/CSS
const root = document.documentElement;
root.style.setProperty('--primary-color', '#3b82f6');
root.style.setProperty('--secondary-accent', '#8b5cf6');

document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const menuButton = document.getElementById('mobile-menu-button');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuLinks = mobileMenu.querySelectorAll('.mobile-menu-link');
    const mainNav = document.getElementById('main-nav');

    menuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        mainNav.classList.toggle('mobile-menu-open'); // Optional: add class to nav for styling
        const icon = menuButton.querySelector('i');
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    });

    mobileMenuLinks.forEach(link => {
        link.addEventListener('click', () => {
             mobileMenu.classList.remove('active');
             mainNav.classList.remove('mobile-menu-open');
             const icon = menuButton.querySelector('i');
             icon.classList.remove('fa-times');
             icon.classList.add('fa-bars');
        });
    });

    // --- Active Nav Link Highlighting ---
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('#main-nav .nav-link:not(.contact-btn)'); // Exclude contact button

    function changeNavActiveState() {
        let index = sections.length;

        while(--index && window.scrollY + 100 < sections[index].offsetTop) {} // Add offset

        navLinks.forEach((link) => link.classList.remove('active'));

        // Find the corresponding nav link and add 'active' class
        const activeLink = document.querySelector(`#main-nav .nav-link[data-section="${sections[index].id}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
        }
    }
    // Initial check in case the page loads scrolled down
     changeNavActiveState();
    // Add listener for scroll events
    window.addEventListener('scroll', changeNavActiveState);


    // --- Intersection Observer for Scroll Animations ---
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const animationClass = entry.target.dataset.animation || 'animate-fade-in-up';
                const delay = entry.target.dataset.delay || '0';
                entry.target.style.animationDelay = `${delay}ms`;
                // Add the animation class after a tiny delay to ensure delay is applied
                setTimeout(() => {
                     entry.target.classList.add(animationClass);
                     entry.target.style.opacity = 1; // Make sure it's visible
                }, 10);
                entry.target.classList.remove('animate-on-scroll');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1 // Reduced threshold for earlier trigger
    });

    animatedElements.forEach(el => {
         el.style.opacity = 0; // Explicitly hide elements before animation
         observer.observe(el);
    });


    // --- Three.js Background Animation ---
    const canvas = document.getElementById('three-canvas');
    if (canvas && typeof THREE !== 'undefined') {
        let scene, camera, renderer, particles, particleMaterial, mouseX = 0, mouseY = 0;
        const particleCount = 3500; // Further increased particle count

        function initThree() {
            try {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000); // Even further far plane
                camera.position.z = 120; // Start further back for a grander scale

                renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                const particleGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(particleCount * 3);
                const colors = new Float32Array(particleCount * 3);
                const sizes = new Float32Array(particleCount);

                const baseColors = [
                    new THREE.Color(getComputedStyle(root).getPropertyValue('--primary-color').trim()),
                    new THREE.Color(getComputedStyle(root).getPropertyValue('--secondary-accent').trim()),
                    new THREE.Color('#10b981'), // Secondary Green
                    new THREE.Color('#facc15'),  // Yellow Accent
                    new THREE.Color('#f97316'),  // Orange Accent
                    new THREE.Color('#ec4899'),   // Pink Accent
                    new THREE.Color('#60a5fa'),   // Light Blue
                    new THREE.Color('#a78bfa')    // Light Purple
                ];

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    const radius = 300 + Math.random() * 400; // Even wider distribution
                    const phi = Math.acos(-1 + (2 * Math.random()));
                    const theta = Math.sqrt(particleCount * Math.PI) * phi;

                    positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
                    positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
                    positions[i3 + 2] = radius * Math.cos(phi) + (Math.random() - 0.5) * 250;

                    const color = baseColors[Math.floor(Math.random() * baseColors.length)];
                    colors[i3] = color.r;
                    colors[i3 + 1] = color.g;
                    colors[i3 + 2] = color.b;

                    sizes[i] = Math.random() * 2.5 + 1.0; // Increased size variation
                }

                particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
                particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));

                particleMaterial = new THREE.PointsMaterial({
                    size: 0.7, // Larger base size
                    vertexColors: true,
                    transparent: true,
                    opacity: 0.95, // Higher base opacity
                    blending: THREE.AdditiveBlending,
                    sizeAttenuation: true,
                    depthWrite: false
                });

                particles = new THREE.Points(particleGeometry, particleMaterial);
                scene.add(particles);

                document.addEventListener('mousemove', onDocumentMouseMove, false);
                window.addEventListener('resize', onWindowResize, false);

                animate();
            } catch (error) {
                console.error("Error initializing Three.js:", error);
                if (canvas) canvas.style.display = 'none';
            }
        }

        function onWindowResize() {
            if (camera && renderer) {
                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
            }
        }

        function onDocumentMouseMove(event) {
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        const clock = new THREE.Clock();
        function animate() {
            if (!scene || !camera || !renderer || !particles) return;

            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            particles.rotation.y = elapsedTime * 0.01;
            particles.rotation.x = elapsedTime * 0.002;

            // More dramatic twinkle
            particles.material.opacity = Math.sin(elapsedTime * 2.5) * 0.3 + 0.7;

            camera.position.x += (mouseX * 2 - camera.position.x) * 0.01;
            camera.position.y += (mouseY * 2 - camera.position.y) * 0.01;
            camera.lookAt(scene.position);

            renderer.render(scene, camera);
        }

        initThree();
    } else {
        console.warn("Three.js library not found or canvas element missing.");
        document.body.style.backgroundImage = 'linear-gradient(to bottom, #111827, #1f2937)';
    }
});



