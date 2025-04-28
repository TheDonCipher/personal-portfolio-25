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
        const particleCount = 2000; // Increased particle count slightly

        function initThree() {
            try {
                scene = new THREE.Scene();
                camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1200); // Increased far plane
                camera.position.z = 70; // Start slightly further back

                renderer = new THREE.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true });
                renderer.setSize(window.innerWidth, window.innerHeight);
                renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

                const particleGeometry = new THREE.BufferGeometry();
                const positions = new Float32Array(particleCount * 3);
                const colors = new Float32Array(particleCount * 3); // For color variation
                const colorPrimary = new THREE.Color(getComputedStyle(root).getPropertyValue('--primary-color').trim());
                const colorAccent = new THREE.Color(getComputedStyle(root).getPropertyValue('--secondary-accent').trim());

                for (let i = 0; i < particleCount; i++) {
                    const i3 = i * 3;
                    // Position particles in a sphere-like distribution
                    const radius = 150 + Math.random() * 150; // Spread out more
                    const phi = Math.acos(-1 + (2 * Math.random()));
                    const theta = Math.sqrt(particleCount * Math.PI) * phi;

                    positions[i3] = radius * Math.cos(theta) * Math.sin(phi);
                    positions[i3 + 1] = radius * Math.sin(theta) * Math.sin(phi);
                    positions[i3 + 2] = radius * Math.cos(phi) + (Math.random() - 0.5) * 100; // Add depth variation

                    // Assign colors (mix between primary and accent)
                    const color = Math.random() > 0.5 ? colorPrimary : colorAccent;
                    colors[i3] = color.r;
                    colors[i3 + 1] = color.g;
                    colors[i3 + 2] = color.b;
                }
                particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
                particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3)); // Add color attribute

                particleMaterial = new THREE.PointsMaterial({
                    size: 0.4, // Slightly larger particles
                    vertexColors: true, // Use vertex colors
                    transparent: true,
                    opacity: 0.8,
                    blending: THREE.AdditiveBlending,
                    sizeAttenuation: true, // Particles smaller further away
                    depthWrite: false // Prevents particles obscuring each other weirdly
                });

                particles = new THREE.Points(particleGeometry, particleMaterial);
                scene.add(particles);

                // Mouse move listener
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
            // Normalize mouse position (-1 to +1)
            mouseX = (event.clientX / window.innerWidth) * 2 - 1;
            mouseY = -(event.clientY / window.innerHeight) * 2 + 1;
        }

        const clock = new THREE.Clock();
        function animate() {
            if (!scene || !camera || !renderer || !particles) return;

            requestAnimationFrame(animate);
            const elapsedTime = clock.getElapsedTime();

            // Rotate particles slowly
            particles.rotation.y = elapsedTime * 0.03;
            particles.rotation.x = elapsedTime * 0.015;

            // Move camera slightly based on mouse position for parallax effect
            // Dampen the movement for smoother effect
            camera.position.x += (mouseX * 5 - camera.position.x) * 0.02; // Adjust multiplier (5) for sensitivity
            camera.position.y += (mouseY * 5 - camera.position.y) * 0.02;
            camera.lookAt(scene.position); // Keep camera focused on the center

            renderer.render(scene, camera);
        }

        initThree();
    } else {
        console.warn("Three.js library not found or canvas element missing.");
        // Add fallback background if canvas fails
        document.body.style.backgroundImage = 'linear-gradient(to bottom, #111827, #1f2937)';
    }
});
