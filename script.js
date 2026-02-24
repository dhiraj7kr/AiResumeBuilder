// --- 1. THREE.JS GLOBAL ENVIRONMENT ---
let scene, camera, renderer, earthGroup;

function init3D() {
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.getElementById('canvas-container').appendChild(renderer.domElement);

    earthGroup = new THREE.Group();
    const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(2, 64, 64),
        new THREE.MeshPhongMaterial({
            map: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_atmos_2048.jpg'),
            bumpMap: new THREE.TextureLoader().load('https://raw.githubusercontent.com/mrdoob/three.js/master/examples/textures/planets/earth_normal_2048.jpg'),
            bumpScale: 0.05
        })
    );
    earthGroup.add(sphere);
    scene.add(earthGroup);

    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const sun = new THREE.DirectionalLight(0xffffff, 1);
    sun.position.set(5, 3, 5);
    scene.add(sun);
    camera.position.z = 6;

    function animate() {
        requestAnimationFrame(animate);
        earthGroup.rotation.y += 0.001;
        renderer.render(scene, camera);
    }
    animate();
}

// --- 2. AI LOGGING UTILITY ---
async function terminalLog(msg) {
    const t = document.getElementById('terminal');
    t.style.display = 'block';
    const p = document.createElement('p');
    p.innerText = `[AI LOG] ${new Date().toLocaleTimeString()}: ${msg}`;
    t.appendChild(p);
    t.scrollTop = t.scrollHeight;
    await new Promise(r => setTimeout(r, 120));
}

// --- 3. THE DATA ENGINE ---
async function initiateAIBuild() {
    const user = document.getElementById('targetUser').value.trim();
    if (!user) return;

    document.getElementById('terminal').innerHTML = '';
    document.getElementById('portfolio-root').classList.add('hidden');

    await terminalLog("Establishing secure handshake with GitHub API...");

    try {
        const [uRes, rRes, readmeRes] = await Promise.all([
            fetch(`https://api.github.com/users/${user}`),
            fetch(`https://api.github.com/users/${user}/repos?sort=stars&per_page=12`),
            fetch(`https://api.github.com/repos/${user}/${user}/readme`)
        ]);

        const userData = await uRes.json();
        const repos = await rRes.json();
        let rawReadme = "";

        if (readmeRes.ok) {
            const data = await readmeRes.json();
            rawReadme = atob(data.content).replace(/<[^>]*>?/gm, '').replace(/ðŸ‘‹/g, '👋');
        }

        await terminalLog(`Node Located: ${userData.name || user}`);
        await terminalLog("Synthesizing professional narrative...");

        // Populate Dashboard
        document.getElementById('avatar').src = userData.avatar_url;
        document.getElementById('fullName').innerText = userData.name || user;
        document.getElementById('headline').innerText = userData.bio || "Full-Stack Development Specialist";
        
        // Narrative Synthesis (The AI Summary)
        const summary = synthesizeBio(userData, repos, rawReadme);
        document.getElementById('aiSummary').innerText = summary;

        // Social Links Command Center
        const sGrid = document.getElementById('socialLinks');
        sGrid.innerHTML = '';
        const platforms = [
            { id: 'linkedin', label: 'LinkedIn', url: `https://linkedin.com/in/${user}` },
            { id: 'twitter', label: 'Twitter / X', url: userData.twitter_username ? `https://x.com/${userData.twitter_username}` : `https://x.com/${user}` },
            { id: 'github', label: 'GitHub Network', url: userData.html_url }
        ];

        platforms.forEach(p => {
            sGrid.innerHTML += `
                <a href="${p.url}" target="_blank" class="social-link">
                    <i data-lucide="${p.id}"></i> <span>${p.label}</span>
                </a>`;
        });

        // Repos & Technical Skills
        const rBox = document.getElementById('repos');
        const skillBox = document.getElementById('skills');
        rBox.innerHTML = ''; skillBox.innerHTML = '';
        const techStack = new Set();

        repos.forEach(repo => {
            if (repo.language) techStack.add(repo.language);
            rBox.innerHTML += `
                <a href="${repo.html_url}" target="_blank" class="repo-card">
                    <div style="display:flex; justify-content:space-between">
                        <strong>${repo.name}</strong>
                        <span class="accent-text">★ ${repo.stargazers_count}</span>
                    </div>
                    <p style="font-size:0.9rem; color:#94a3b8; margin-top:10px;">${repo.description || 'System-level repository identified.'}</p>
                </a>`;
        });

        techStack.forEach(t => {
            skillBox.innerHTML += `<span style="padding:6px 15px; border:1px solid var(--accent); border-radius:30px; font-size:12px;">${t}</span>`;
        });

        lucide.createIcons();
        await terminalLog("Global dossier generation finalized.");
        
        setTimeout(() => {
            document.getElementById('terminal').style.display = 'none';
            document.getElementById('portfolio-root').classList.remove('hidden');
        }, 600);

    } catch (e) {
        await terminalLog("CRITICAL FAILURE: Node connection timeout.");
    }
}

// Logic to ensure no blank "About Me"
function synthesizeBio(user, repos, readme) {
    const name = user.name || user.login;
    const topLang = repos[0]?.language || "modern technologies";
    
    let base = `${name} is a high-performance software engineering professional based in ${user.location || 'a remote-first global environment'}. `;
    
    if (readme.length > 50) {
        base += `Their mission, as stated in their global profile, centers on: "${readme.substring(0, 180).trim()}...". `;
    } else {
        base += `With a focused trajectory in ${topLang}, they have established a robust digital footprint across ${user.public_repos} repositories. `;
    }

    base += `Known for engineering excellence, they have amassed a cumulative ${repos.reduce((a, b) => a + b.stargazers_count, 0)} stars, signifying significant community impact and code validation.`;
    
    return base;
}

window.addEventListener('load', init3D);
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
