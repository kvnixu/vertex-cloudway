/* ============================================================
   Ophelia — download page logic
   ============================================================
   Configure this block then deploy. Everything else (download
   buttons, footer, FAQ links) wires itself up automatically.
   ============================================================ */

const CONFIG = {
  // GitHub username/org and repo name that hosts the Releases.
  // Used to build all download / source / issues / release links.
  githubRepo: 'kvnixu/vertex-cloudway',

  // Default version shown in the hero badge.
  // 'latest' -> fetch newest tag from the GitHub API on page load.
  // Or hard-code something like '1.0.1'.
  version: 'latest',

  // Download filename templates. {VERSION} is substituted at runtime.
  // These match electron-builder's default output names.
  fileNames: {
    macArm64:    'Ophelia-{VERSION}-arm64.dmg',
    macX64:      'Ophelia-{VERSION}.dmg',
    winSetup:    'Ophelia-Setup-{VERSION}.exe',
    winPortable: 'Ophelia-{VERSION}-portable.zip',
    linuxApp:    'Ophelia-{VERSION}.AppImage',
    linuxDeb:    'ophelia_{VERSION}_amd64.deb',
  },
}

/* -----------------------------------------------------------
   Helpers
   ----------------------------------------------------------- */

const $ = (id) => document.getElementById(id)

function fileUrl(name, version) {
  const v = (version || CONFIG.version || 'latest').replace(/^v/, '')
  const filled = name.replace('{VERSION}', v)
  if ((CONFIG.version || 'latest') === 'latest') {
    return `https://github.com/${CONFIG.githubRepo}/releases/latest/download/${filled}`
  }
  return `https://github.com/${CONFIG.githubRepo}/releases/download/v${v}/${filled}`
}

/* -----------------------------------------------------------
   1. Detect platform / architecture
   ----------------------------------------------------------- */

function detectOS() {
  const ua = navigator.userAgent || ''
  const platform = (navigator.userAgentData?.platform || navigator.platform || '').toLowerCase()
  const isMac     = /mac/.test(platform) || /Mac OS X/.test(ua)
  const isWindows = /win/.test(platform) || /Windows/.test(ua)
  const isLinux   = /linux/.test(platform) || /Linux/.test(ua)
  const isIOS     = /iphone|ipad|ipod/i.test(ua)
  const isAndroid = /android/i.test(ua)
  const isMobile  = isIOS || isAndroid

  // Best-effort Apple Silicon detection
  let arch = 'x64'
  if (navigator.userAgentData?.architecture) {
    arch = navigator.userAgentData.architecture
  } else if (/arm|aarch64/i.test(ua)) {
    arch = 'arm64'
  } else if (isMac) {
    // macOS doesn't expose CPU type to the browser — but if the
    // machine is recent (year ≥ 2021) it's almost certainly arm64.
    arch = 'arm64'
  }

  return { isMac, isWindows, isLinux, isMobile, arch }
}

/* -----------------------------------------------------------
   2. Apply detected OS to the hero CTA + highlight card
   ----------------------------------------------------------- */

const APPLE_ICON = '<svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor"><path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.57-.12 0-.23-.02-.3-.03-.01-.06-.04-.22-.04-.39 0-1.15.572-2.27 1.206-2.98.804-.94 2.142-1.64 3.248-1.68.03.13.05.28.05.43zm4.565 15.71c-.03.07-.463 1.58-1.518 3.12-.945 1.34-1.94 2.71-3.43 2.71-1.517 0-1.9-.88-3.63-.88-1.698 0-2.302.91-3.67.91-1.377 0-2.332-1.26-3.428-2.8-1.287-1.82-2.323-4.65-2.323-7.34 0-4.31 2.797-6.6 5.552-6.6 1.448 0 2.675.95 3.6.95.865 0 2.222-1.01 3.902-1.01.613 0 2.886.06 4.374 2.19-.13.09-2.383 1.37-2.383 4.19 0 3.26 2.854 4.42 2.955 4.45z"/></svg>'

function applyOSDetection(version) {
  const os = detectOS()
  const heroBtn   = $('hero-primary-download')
  const heroIcon  = $('hero-os-icon')
  const heroName  = $('hero-os-name')
  const heroDetail= $('hero-os-detail')
  if (!heroBtn) return

  let detectedCardOS = null
  let downloadUrl = `#download`
  let label = 'your Mac'
  let detail = ''
  let icon = ''

  if (os.isMac) {
    detectedCardOS = 'mac'
    icon  = APPLE_ICON
    if (os.arch === 'arm64') {
      label = 'Mac (Apple Silicon)'
      downloadUrl = fileUrl(CONFIG.fileNames.macArm64, version)
      detail = 'Apple Silicon · macOS 11 or later'
    } else {
      label = 'Mac (Intel)'
      downloadUrl = fileUrl(CONFIG.fileNames.macX64, version)
      detail = 'Intel · macOS 11 or later'
    }
  } else if (os.isWindows) {
    label = 'Mac'
    detail = 'Ophelia is Mac-only for now. Windows is on the roadmap.'
    heroBtn.classList.add('btn-secondary')
    heroBtn.classList.remove('btn-primary')
  } else if (os.isLinux) {
    label = 'Mac'
    detail = 'Ophelia is Mac-only for now. Linux is on the roadmap.'
    heroBtn.classList.add('btn-secondary')
    heroBtn.classList.remove('btn-primary')
  } else if (os.isMobile) {
    label = 'Mac'
    detail = 'Ophelia is a Mac desktop app — open this page on your Mac to install.'
    heroBtn.classList.add('btn-secondary')
    heroBtn.classList.remove('btn-primary')
  }

  heroIcon.innerHTML = icon
  heroName.textContent = label
  heroBtn.href = downloadUrl
  heroDetail.textContent = detail || 'Pick your platform below.'

  if (detectedCardOS) {
    document.querySelectorAll('.download-card').forEach(card => {
      if (card.dataset.os === detectedCardOS) card.classList.add('detected')
    })
  }
}

/* -----------------------------------------------------------
   3. Wire all download buttons to GitHub Releases
   ----------------------------------------------------------- */

function wireDownloadButtons(version) {
  const links = {
    'dl-mac-arm64':       fileUrl(CONFIG.fileNames.macArm64,    version),
    'dl-mac-x64':         fileUrl(CONFIG.fileNames.macX64,      version),
  }
  for (const [id, url] of Object.entries(links)) {
    const el = $(id)
    if (el) el.href = url
  }
}

/* -----------------------------------------------------------
   4. Wire all GitHub-related links (nav, footer, FAQ)
   ----------------------------------------------------------- */

function wireGitHubLinks() {
  const repoUrl     = `https://github.com/${CONFIG.githubRepo}`
  const releasesUrl = `${repoUrl}/releases`
  const issuesUrl   = `${repoUrl}/issues`

  for (const id of ['nav-github', 'footer-github']) {
    const el = $(id); if (el) el.href = repoUrl
  }
  for (const id of ['footer-source']) {
    const el = $(id); if (el) el.href = repoUrl
  }
  for (const id of ['footer-releases', 'footer-releases-2']) {
    const el = $(id); if (el) el.href = releasesUrl
  }
  for (const id of ['faq-issues']) {
    const el = $(id); if (el) el.href = issuesUrl
  }
}

/* -----------------------------------------------------------
   5. Optional: fetch latest version from GitHub
   ----------------------------------------------------------- */

async function fetchLatestVersion() {
  if (CONFIG.version !== 'latest') return CONFIG.version
  if (CONFIG.githubRepo.includes('YOUR_USERNAME')) return null

  try {
    const res = await fetch(`https://api.github.com/repos/${CONFIG.githubRepo}/releases/latest`, {
      headers: { 'Accept': 'application/vnd.github+json' },
    })
    if (!res.ok) return null
    const json = await res.json()
    if (json.tag_name) {
      const v = json.tag_name.replace(/^v/, '')
      const versionEl = $('hero-version')
      if (versionEl) versionEl.textContent = v
      return v
    }
  } catch { /* offline / rate-limited — silently fall back */ }
  return null
}

/* -----------------------------------------------------------
   6. Footer year
   ----------------------------------------------------------- */

function setFooterYear() {
  const el = $('footer-year')
  if (el) el.textContent = new Date().getFullYear()
}

/* -----------------------------------------------------------
   Boot
   ----------------------------------------------------------- */

async function init() {
  setFooterYear()
  wireGitHubLinks()
  wireDownloadButtons(CONFIG.version)
  applyOSDetection(CONFIG.version)
  const v = await fetchLatestVersion()
  if (v) {
    wireDownloadButtons(v)
    applyOSDetection(v)
  }
}

document.addEventListener('DOMContentLoaded', init)
