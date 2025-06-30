const installButton = document.getElementById("install-button");
const playButton = document.getElementById("play-button");
const updateButton = document.getElementById("update-button");

const sidebarLinks = document.querySelectorAll('.sidebar .nav-link');
const topbarLinks = document.querySelectorAll('.topbar div');
const contentDiv = document.querySelector('.content');

function setContent(html) {
    contentDiv.innerHTML = html;
}

const topbar = document.querySelector('.topbar');
let underline = document.createElement('div');
underline.className = 'topbar-underline';
underline.style.position = 'absolute';
underline.style.bottom = '3px';
underline.style.height = '3px';
underline.style.background = 'orange';
underline.style.borderRadius = '2px';
underline.style.transition = 'left 0.3s cubic-bezier(.4,0,.2,1), width 0.3s cubic-bezier(.4,0,.2,1)';
topbar.appendChild(underline);

function moveUnderlineTo(element) {
    const rect = element.getBoundingClientRect();
    const parentRect = topbar.getBoundingClientRect();
    underline.style.left = (rect.left - parentRect.left) + 'px';
    underline.style.width = rect.width + 'px';
}

// Topbar navigation with sliding underline
topbarLinks.forEach(link => {
    link.addEventListener('click', () => {
        topbarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        moveUnderlineTo(link);
        if (link.textContent === 'Play') setContent(dummyPages.play);
        else if (link.textContent === 'FAQ') setContent(dummyPages.faq);
        else if (link.textContent === 'Version') setContent(dummyPages.version);
    });
});

// On load, position the underline under the active tab
window.addEventListener('DOMContentLoaded', () => {
    const active = document.querySelector('.topbar .active');
    if (active) moveUnderlineTo(active);
});

const dummyPages = {
    imperial: `<h2>Imperial Page</h2><p>This is a dummy Imperial page.</p>`,
    minigames: `<h2>Minigames Page</h2><p>This is a dummy Minigames page.</p>`,
    news: `<h2>News Page</h2><p>This is a dummy News page.</p>`,
    settings: `<h2>Settings Page</h2><p>This is a dummy Settings page.</p>`,
    play: `<h2>Play Page</h2><p>This is the Play page. (Default)</p>`,
    faq: `<h2>FAQ Page</h2><p>This is a dummy FAQ page.</p>`,
    version: `<h2>Version Page</h2><p>This is a dummy Version page.</p>`
};


async function installGame(e) {

    const result = await window.electronApi.startDownload();

    if (result.success) {
        console.log('Download complete!');
    } else {
        console.log('Error: ' + result.error);
        console.log('Stack: ' + result.stack);
    }
}

async function launchGame(e) {

    const result = await window.electronApi.launchGame();

    if (result.success) {
        console.log('Run complete!');
    } else {
        console.log('Error: ' + result.error);
        console.log('Stack: ' + result.stack);
    }
}

// Sidebar navigation
sidebarLinks.forEach(link => {
    link.addEventListener('click', () => {
        if (link.textContent.includes('Imperial')) setContent(dummyPages.imperial);
        else if (link.textContent.includes('Minigames')) setContent(dummyPages.minigames);
        else if (link.textContent.includes('News')) setContent(dummyPages.news);
        else if (link.textContent.includes('Settings')) setContent(dummyPages.settings);
    });
});

// Topbar navigation
topbarLinks.forEach(link => {
    link.addEventListener('click', () => {
        topbarLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
        if (link.textContent === 'Play') setContent(dummyPages.play);
        else if (link.textContent === 'FAQ') setContent(dummyPages.faq);
        else if (link.textContent === 'Version') setContent(dummyPages.version);
    });
});

// Set default content on load
setContent(dummyPages.play);
moveUnderlineTo(topbarLinks[0]);


playButton.addEventListener('click', launchGame);

installButton.addEventListener('click', installGame);

playButton.addEventListener('mouseover', (e) => {
    e.target.style.background = 'linear-gradient(to right,rgb(212, 0, 0), #d45c00)';
});

playButton.addEventListener('mouseout', (e) => {
    e.target.style.background = 'linear-gradient(to right, #d45c00, #f9aa2e)';
});
installButton.addEventListener('mouseover', (e) => {
    e.target.style.background = 'linear-gradient(to right,rgb(212, 0, 0), #d45c00)';
});

installButton.addEventListener('mouseout', (e) => {
    e.target.style.background = 'linear-gradient(to right, #d45c00, #f9aa2e)';
});
updateButton.addEventListener('mouseover', (e) => {
    e.target.style.background = 'linear-gradient(to right,rgb(212, 0, 0), #d45c00)';
});

updateButton.addEventListener('mouseout', (e) => {
    e.target.style.background = 'linear-gradient(to right, #d45c00, #f9aa2e)';
});