// --- 1. GLOBE INITIALIZATION ---
let scene, camera, renderer, globe;

function initGlobe() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    const loader = new THREE.TextureLoader();
    const geometry = new THREE.SphereGeometry(2, 64, 64);
    const material = new THREE.MeshPhongMaterial({
        map: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
        bumpMap: loader.load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
        bumpScale: 0.05
    });
    
    globe = new THREE.Mesh(geometry, material);
    scene.add(globe);
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    camera.position.z = 6;

    function animate() {
        requestAnimationFrame(animate);
        globe.rotation.y += 0.0015;
        renderer.render(scene, camera);
    }
    animate();
}

// --- 2. AI SYNTHESIS ENGINE ---
async function initiateSynthesis() {
    const user = document.getElementById('targetUser').value.trim();
    if (!user) return;

    document.getElementById('portfolio-root').classList.add('hidden-root');
    const term = document.getElementById('status-terminal');
    term.style.display = 'block';
    term.innerHTML = `<p>> INITIALIZING DEEP SCAN FOR NODE: ${user}...</p>`;

    try {
        const [uData, rData, readmeRes] = await Promise.all([
            fetch(`https://api.github.com/users/${user}`).then(res => res.json()),
            fetch(`https://api.github.com/users/${user}/repos?sort=stars&per_page=12`).then(res => res.json()),
            fetch(`https://api.github.com/repos/${user}/${user}/readme`).catch(() => null)
        ]);

        term.innerHTML += `<p>> IDENTITY VERIFIED. PARSING REPOSITORY ARCHITECTURE...</p>`;

        // Populate Static Info
        document.getElementById('avatar').src = uData.avatar_url;
        document.getElementById('fullName').innerText = uData.name || user;
        document.getElementById('headline').innerText = uData.bio || "DIGITAL ARCHITECT";
        
        // AI Narrative Summary (Guarantees no blank space)
        const summary = synthesizeDossier(uData, rData);
        document.getElementById('aiSummary').innerText = summary;

        // Dynamic Skill Extraction
        const techStack = new Set();
        const rBox = document.getElementById('repos');
        rBox.innerHTML = '';
        
        rData.forEach(repo => {
            if (repo.language) techStack.add(repo.language);
            rBox.innerHTML += `
                <a href="${repo.html_url}" target="_blank" class="repo-item">
                    <div style="display:flex; justify-content:space-between">
                        <strong>${repo.name}</strong>
                        <span style="color:var(--primary)">★ ${repo.stargazers_count}</span>
                    </div>
                    <p style="font-size:0.85rem; color:var(--text-dim); margin-top:8px;">${repo.description || 'System repository identified.'}</p>
                </a>`;
        });

        const skillBox = document.getElementById('skills');
        skillBox.innerHTML = '';
        techStack.forEach(t => skillBox.innerHTML += `<span class="tag">${t}</span>`);

        lucide.createIcons();
        term.innerHTML += `<p>> SYNTHESIS COMPLETE. RENDERING DASHBOARD...</p>`;
        
        setTimeout(() => {
            term.style.display = 'none';
            document.getElementById('portfolio-root').classList.remove('hidden-root');
        }, 800);

    } catch (e) {
        term.innerHTML += `<p style="color:red">> CRITICAL ERROR: NODE ACCESS DENIED.</p>`;
    }
}

// Logic to build a professional bio even if user info is sparse
function synthesizeDossier(u, repos) {
    const topLang = repos[0]?.language || "modern development";
    const stars = repos.reduce((a, b) => a + b.stargazers_count, 0);
    
    return `${u.name || u.login} is a software engineering professional focused on ${topLang}. ` +
           `With a global footprint across ${u.public_repos} public nodes, they have established ` +
           `a technical ecosystem validated by ${stars} cumulative community endorsements (stars). ` +
           `Located in ${u.location || 'Distributed Network'}, they continue to push digital boundaries.`;
}

window.onload = initGlobe;
