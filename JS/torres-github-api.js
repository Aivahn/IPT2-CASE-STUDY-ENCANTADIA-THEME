/**
 * GitHub API Integration
 * Fetches repositories from a GitHub user and displays them dynamically
 * 
 * Configuration: Uses environment variables from .env file
 * Do NOT commit .env to GitHub - keep it in .gitignore
 */

// These will be populated from .env file via loadEnvironment()
let GITHUB_USER = 'Aivahn'; // Default fallback
let GITHUB_TOKEN = ''; // Will be loaded from .env
let GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USER}/repos`;

/**
 * Load environment variables from .env file
 * For development environment variable loading
 */
async function loadEnvironment() {
  try {
    const response = await fetch('.env');
    if (response.ok) {
      const envContent = await response.text();
      
      // Parse .env file
      const lines = envContent.split('\n');
      lines.forEach(line => {
        line = line.trim();
        // Skip comments and empty lines
        if (!line || line.startsWith('#')) return;
        
        const [key, value] = line.split('=').map(s => s.trim());
        if (key === 'GITHUB_TOKEN') {
          GITHUB_TOKEN = value;
          console.log('✓ GitHub token loaded from .env');
        } else if (key === 'GITHUB_USER') {
          GITHUB_USER = value;
          GITHUB_API_URL = `https://api.github.com/users/${GITHUB_USER}/repos`;
          console.log(`✓ GitHub user loaded: ${GITHUB_USER}`);
        }
      });
    }
  } catch (error) {
    console.warn('Could not load .env file. Using fallback values.', error);
  }
}

// Helper function to get fetch headers with auth
function getAuthHeaders() {
  const headers = {
    'Accept': 'application/vnd.github.v3+json'
  };
  
  // Only add auth header if token is properly set
  if (GITHUB_TOKEN && GITHUB_TOKEN.trim() && GITHUB_TOKEN !== 'YOUR_TOKEN_HERE') {
    headers['Authorization'] = `token ${GITHUB_TOKEN}`;
  }
  
  return headers;
}

/**
 * Fetch repositories from GitHub API
 */
async function fetchGitHubRepos() {
  try {
    console.log(`Fetching repositories for user: ${GITHUB_USER}`);
    console.log(`API URL: ${GITHUB_API_URL}`);
    
    const response = await fetch(GITHUB_API_URL, {
      headers: getAuthHeaders()
    });
    
    console.log(`Response status: ${response.status}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub API error response:', errorData);
      throw new Error(`GitHub API error: ${response.status} - ${errorData.message || 'Unknown error'}`);
    }
    
    const repos = await response.json();
    console.log(`Successfully fetched ${repos.length} repositories`);
    displayRepositories(repos);
  } catch (error) {
    console.error('Error fetching GitHub repositories:', error);
    displayError(`Unable to fetch repositories: ${error.message}`);
  }
}

/**
 * Display repositories in the DOM
 */
async function displayRepositories(repos) {
  const container = document.getElementById('github-repos-container');
  
  if (!container) {
    console.warn('GitHub repos container not found');
    return;
  }
  
  // Clear container
  container.innerHTML = '';
  
  if (repos.length === 0) {
    container.innerHTML = '<p>No repositories found.</p>';
    return;
  }
  
  // Fetch language counts for all repos for better sorting
  const reposWithLanguageCounts = await Promise.all(
    repos.map(async (repo) => {
      try {
        const response = await fetch(repo.languages_url, {
          headers: getAuthHeaders()
        });
        if (response.ok) {
          const languages = await response.json();
          return { ...repo, languageCount: Object.keys(languages).length };
        }
      } catch (error) {
        console.error(`Error fetching languages for ${repo.name}:`, error);
      }
      return { ...repo, languageCount: 0 };
    })
  );
  
  // Sort repositories with custom logic:
  // 1. Repos with homepage first
  // 2. Then sort by number of languages (more languages first)
  // 3. Then by updated date (most recent first)
  reposWithLanguageCounts.sort((a, b) => {
    // First priority: repos with homepage come first
    const aHasHomepage = a.homepage ? 1 : 0;
    const bHasHomepage = b.homepage ? 1 : 0;
    
    if (aHasHomepage !== bHasHomepage) {
      return bHasHomepage - aHasHomepage; // b first if it has homepage
    }
    
    // Second priority: more languages first
    const languageDiff = b.languageCount - a.languageCount;
    if (languageDiff !== 0) {
      return languageDiff;
    }
    
    // Third priority: by updated date (most recent first)
    return new Date(b.updated_at) - new Date(a.updated_at);
  });
  
  // Create repo cards
  reposWithLanguageCounts.forEach(repo => {
    const card = createRepoCard(repo);
    container.appendChild(card);
  });
}

/**
 * Create a repository card element
 */
function createRepoCard(repo) {
  // Create the main card wrapper
  const cardWrapper = document.createElement('div');
  cardWrapper.className = 'repo-card-wrapper';
  
  // Create the article card
  const article = document.createElement('article');
  article.className = 'soul-card github-repo-card';
  article.style.cursor = 'pointer';
  
  // Fetch languages for this repo
  fetchRepoLanguages(repo, article);
  
  // Build card HTML
  article.innerHTML = `
    <div class="card-gem">
      <div class="soul-gem card-gem-size">
        <img src="../images/Brilyante_Diwa.png" alt="Brilyante ng Diwa" class="soul-gem-icon" />
      </div>
    </div>
    <h3><a href="${repo.html_url}" target="_blank" rel="noopener noreferrer">${repo.name}</a></h3>
    <p class="repo-description">${repo.description || 'No description provided.'}</p>
    <div class="repo-languages" id="languages-${repo.id}">
      <span class="loading-lang">Loading languages...</span>
    </div>
    <div class="repo-meta">
      <span class="repo-stars">⭐ ${repo.stargazers_count}</span>
      <span class="repo-forks">🔀 ${repo.forks_count}</span>
    </div>
    <div class="repo-footer">
      <small>Updated: ${formatDate(repo.updated_at)}</small>
    </div>
  `;
  
  // Add click event listener to open file browser
  article.addEventListener('click', (e) => {
    // Don't open modal if clicking any link
    if (e.target.closest('a')) {
      return;
    }
    openFileBrowser(repo);
  });
  
  cardWrapper.appendChild(article);
  
  // Create website button below the card if homepage exists
  if (repo.homepage) {
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'repo-button-container';
    const websiteLink = document.createElement('a');
    websiteLink.href = repo.homepage;
    websiteLink.target = '_blank';
    websiteLink.rel = 'noopener noreferrer';
    websiteLink.className = 'repo-website-btn';
    websiteLink.textContent = 'Visit Website';
    buttonContainer.appendChild(websiteLink);
    cardWrapper.appendChild(buttonContainer);
  }
  
  return cardWrapper;
}

/**
 * Fetch languages used in a repository
 */
async function fetchRepoLanguages(repo, cardElement) {
  try {
    const response = await fetch(repo.languages_url, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch languages: ${response.status}`);
    }
    
    const languages = await response.json();
    displayRepoLanguages(languages, repo.id, cardElement);
  } catch (error) {
    console.error(`Error fetching languages for ${repo.name}:`, error);
    // Fallback to primary language if available
    const langContainer = document.getElementById(`languages-${repo.id}`);
    if (langContainer && repo.language) {
      const langColor = getLanguageColor(repo.language);
      langContainer.innerHTML = `
        <span class="repo-language">
          <span class="lang-dot" style="background-color: ${langColor}"></span>
          ${repo.language}
        </span>
      `;
    }
  }
}

/**
 * Display up to 5 languages for a repository
 */
function displayRepoLanguages(languages, repoId, cardElement) {
  const langContainer = document.getElementById(`languages-${repoId}`);
  if (!langContainer) return;
  
  // Sort languages by bytes (most used first) and take top 5
  const sortedLangs = Object.entries(languages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);
  
  if (sortedLangs.length === 0) {
    langContainer.innerHTML = '<span class="no-language">No languages detected</span>';
    return;
  }
  
  // Calculate total bytes for percentage calculation
  const totalBytes = sortedLangs.reduce((sum, [_, bytes]) => sum + bytes, 0);
  
  // Create language tags with icons
  const langHTML = sortedLangs.map(([lang, bytes]) => {
    const percentage = ((bytes / totalBytes) * 100).toFixed(1);
    
    // Skip languages showing 0%
    if (parseFloat(percentage) === 0) {
      return '';
    }
    
    const icon = getLanguageIcon(lang);
    const color = getLanguageColor(lang);
    
    // Change TypeScript display to "TS/React"
    const displayLang = lang === 'TypeScript' ? 'TS/React' : lang;
    
    if (icon) {
      return `
        <span class="repo-language" title="${percentage}% of codebase">
          <img src="${icon}" alt="${displayLang}" class="lang-icon" />
          ${displayLang} <span class="lang-percent">${percentage}%</span>
        </span>
      `;
    } else {
      return `
        <span class="repo-language" title="${percentage}% of codebase">
          <span class="lang-dot" style="background-color: ${color}"></span>
          ${displayLang} <span class="lang-percent">${percentage}%</span>
        </span>
      `;
    }
  }).filter(html => html !== '').join('');
  
  langContainer.innerHTML = `<div class="languages-list">${langHTML}</div>`;
}

/**
 * Get icon/logo URL for programming language
 */
function getLanguageIcon(language) {
  const iconMap = {
    'JavaScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/javascript/javascript-original.svg',
    'TypeScript': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'TSX': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'Python': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/python/python-original.svg',
    'Java': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/java/java-original.svg',
    'C#': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/csharp/csharp-original.svg',
    'VB.NET': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg',
    'Visual Basic .NET': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/dot-net/dot-net-original.svg',
    'HTML': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/html5/html5-original.svg',
    'CSS': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/css3/css3-original.svg',
    'React': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/react/react-original.svg',
    'SQL': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg',
    'PHP': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/php/php-original.svg',
    'Ruby': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/ruby/ruby-original.svg',
    'Go': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/go/go-original.svg',
    'Rust': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/rust/rust-original.svg',
    'C++': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/cplusplus/cplusplus-original.svg',
    'C': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/c/c-original.svg',
    'Vue': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/vuejs/vuejs-original.svg',
    'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/nodejs/nodejs-original.svg',
    'Express': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/express/express-original.svg',
    'MongoDB': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg',
    'Firebase': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/firebase/firebase-plain.svg',
    'Git': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/git/git-original.svg',
    'Docker': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg',
    'Dockerfile': 'https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/docker/docker-original.svg'
  };
  
  return iconMap[language] || null;
}

/**
 * Get color for programming language
 */
function getLanguageColor(language) {
  const colors = {
    'JavaScript': '#f1e05a',
    'TypeScript': '#3178c6',
    'Python': '#3572A5',
    'Java': '#b07219',
    'C#': '#239120',
    'VB.NET': '#945db8',
    'Visual Basic .NET': '#945db8',
    'HTML': '#e34c26',
    'CSS': '#563d7c',
    'React': '#61dafb',
    'SQL': '#336791',
    'PHP': '#777bb4',
    'Ruby': '#cc342d',
    'Go': '#00add8',
    'Rust': '#ce422b'
  };
  
  return colors[language] || '#858585';
}

/**
 * Format date to readable format
 */
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-US', options);
}

/**
 * Display error message
 */
function displayError(message) {
  const container = document.getElementById('github-repos-container');
  
  if (container) {
    container.innerHTML = `<p class="error-message">${message}</p>`;
  }
}

/**
 * Fetch GitHub user statistics
 */
async function fetchGitHubStats() {
  try {
    const userApiUrl = `https://api.github.com/users/${GITHUB_USER}`;
    console.log(`Fetching GitHub stats from: ${userApiUrl}`);
    
    const response = await fetch(userApiUrl, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('GitHub user API error:', errorData);
      throw new Error(`GitHub API error: ${response.status}`);
    }
    
    const userData = await response.json();
    console.log('Successfully fetched GitHub stats:', userData);
    displayGitHubStats(userData);
  } catch (error) {
    console.error('Error fetching GitHub stats:', error);
  }
}

/**
 * Display GitHub user statistics
 */
function displayGitHubStats(userData) {
  const statsContainer = document.getElementById('github-stats-container');
  
  if (!statsContainer) {
    return;
  }
  
  statsContainer.innerHTML = `
    <div class="stat-item">
      <span class="stat-label">Repositories</span>
      <span class="stat-value">${userData.public_repos}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Followers</span>
      <span class="stat-value">${userData.followers}</span>
    </div>
    <div class="stat-item">
      <span class="stat-label">Following</span>
      <span class="stat-value">${userData.following}</span>
    </div>
  `;
}

/**
 * Initialize GitHub API integration
 */
async function initGitHubIntegration() {
  await loadEnvironment();
  fetchGitHubRepos();
  fetchGitHubStats();
  initializeFileBrowser();
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', initGitHubIntegration);

/**
 * File Browser functionality
 */

// Store current file browser state
let fileBrowserState = {
  repoName: null,
  currentPath: '',
  repoUrl: null
};

/**
 * Initialize file browser modal interactions
 */
function initializeFileBrowser() {
  const modal = document.getElementById('file-browser-modal');
  const closeBtn = document.querySelector('.file-browser-close');
  const overlay = document.querySelector('.file-browser-overlay');
  
  closeBtn.addEventListener('click', closeFileBrowser);
  overlay.addEventListener('click', closeFileBrowser);
  
  // Close on ESC key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
      closeFileBrowser();
    }
  });
}

/**
 * Open file browser modal for a repository
 */
async function openFileBrowser(repo) {
  fileBrowserState.repoName = repo.name;
  fileBrowserState.currentPath = '';
  fileBrowserState.repoUrl = repo.url;
  
  const modal = document.getElementById('file-browser-modal');
  modal.classList.add('active');
  
  document.getElementById('file-browser-title').textContent = `${repo.name} - Files`;
  
  // Load root directory
  await loadDirectoryContents(repo.url, '');
}

/**
 * Close file browser modal
 */
function closeFileBrowser() {
  const modal = document.getElementById('file-browser-modal');
  modal.classList.remove('active');
  fileBrowserState.currentPath = '';
}

/**
 * Load directory contents from GitHub API
 */
async function loadDirectoryContents(repoUrl, path) {
  const contentDiv = document.getElementById('file-browser-content');
  const breadcrumbDiv = document.getElementById('file-browser-breadcrumb');
  
  try {
    contentDiv.innerHTML = '<div class="loading-files">Loading files...</div>';
    
    // Construct API URL
    let apiUrl = `${repoUrl}/contents`;
    if (path) {
      apiUrl += `/${path}`;
    }
    
    const response = await fetch(apiUrl, {
      headers: getAuthHeaders()
    });
    
    if (!response.ok) {
      throw new Error(`Failed to load directory: ${response.status}`);
    }
    
    const contents = await response.json();
    fileBrowserState.currentPath = path;
    
    // Update breadcrumb
    updateBreadcrumb(path);
    
    // Display contents
    displayFileContents(contents);
  } catch (error) {
    console.error('Error loading directory:', error);
    contentDiv.innerHTML = `<div class="error-message">Error loading files: ${error.message}</div>`;
  }
}

/**
 * Update breadcrumb navigation
 */
function updateBreadcrumb(path) {
  const breadcrumbDiv = document.getElementById('file-browser-breadcrumb');
  
  const pathParts = path ? path.split('/') : [];
  
  // Create breadcrumb items
  let breadcrumbHTML = '<div class="breadcrumb-list">';
  
  // Root button
  breadcrumbHTML += `<button class="breadcrumb-item" onclick="loadDirectoryContents('${fileBrowserState.repoUrl}', '')">🖿 Root</button>`;
  
  // Path items
  let currentPath = '';
  for (let i = 0; i < pathParts.length; i++) {
    const part = pathParts[i];
    currentPath += (currentPath ? '/' : '') + part;
    breadcrumbHTML += `<span class="breadcrumb-separator">/</span>`;
    breadcrumbHTML += `<button class="breadcrumb-item" onclick="loadDirectoryContents('${fileBrowserState.repoUrl}', '${currentPath}')">${part}</button>`;
  }
  
  breadcrumbHTML += '</div>';
  breadcrumbDiv.innerHTML = breadcrumbHTML;
}

/**
 * Display file contents in the browser
 */
function displayFileContents(contents) {
  const contentDiv = document.getElementById('file-browser-content');
  
  if (!Array.isArray(contents)) {
    contentDiv.innerHTML = '<div class="error-message">This file cannot be browsed as a directory.</div>';
    return;
  }
  
  if (contents.length === 0) {
    contentDiv.innerHTML = '<div class="empty-folder">This folder is empty</div>';
    return;
  }
  
  // Sort: folders first, then files
  contents.sort((a, b) => {
    if (a.type !== b.type) {
      return a.type === 'dir' ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });
  
  let filesHTML = '<div class="files-list">';
  
  contents.forEach(item => {
    const newPath = fileBrowserState.currentPath 
      ? `${fileBrowserState.currentPath}/${item.name}`
      : item.name;
    
    if (item.type === 'dir') {
      filesHTML += `
        <div class="file-item folder-item" onclick="loadDirectoryContents('${fileBrowserState.repoUrl}', '${newPath}')">
          <span class="file-icon">🖿</span>
          <span class="file-name">${item.name}</span>
        </div>
      `;
    } else {
      const icon = getFileIcon(item.name);
      filesHTML += `
        <div class="file-item">
          <span class="file-icon">${icon}</span>
          <span class="file-name">${item.name}</span>
          <span class="file-size">${formatFileSize(item.size)}</span>
        </div>
      `;
    }
  });
  
  filesHTML += '</div>';
  contentDiv.innerHTML = filesHTML;
}

/**
 * Get appropriate icon for file type
 */
function getFileIcon(filename) {
  const ext = filename.split('.').pop().toLowerCase();
  
  const iconMap = {
    'js': '📄',
    'jsx': '⚛️',
    'ts': '📘',
    'tsx': '⚛️',
    'html': '🌐',
    'css': '🎨',
    'json': '📋',
    'md': '📝',
    'txt': '📄',
    'py': '🐍',
    'java': '☕',
    'cs': '🟦',
    'cpp': '⚙️',
    'c': '⚙️',
    'php': '🐘',
    'sql': '🗄️',
    'xml': '📋',
    'yaml': '⚙️',
    'yml': '⚙️',
    'env': '🔐',
    'gitignore': '🚫',
    'package': '📦',
    'lock': '🔒',
    'img': '🖼️',
    'png': '🖼️',
    'jpg': '🖼️',
    'jpeg': '🖼️',
    'gif': '🖼️',
    'svg': '🎨',
    'pdf': '📄',
    'zip': '📦',
    'tar': '📦'
  };
  
  return iconMap[ext] || '📄';
}

/**
 * Format file size to human readable format
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 B';
  
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
