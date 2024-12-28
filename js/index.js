const searchForm = document.getElementById('search-form');
const searchInput = document.getElementById('search-input');
const toggleSearch = document.getElementById('toggle-search');
const resultsDiv = document.getElementById('results');
const detailsDiv = document.getElementById('details');

let searchType = 'users'; // Current search type: 'users' or 'repos'

toggleSearch.addEventListener('click', () => {
  searchType = searchType === 'users' ? 'repos' : 'users';
  toggleSearch.textContent = searchType === 'users' ? 'Search Repos' : 'Search Users';
  searchInput.placeholder = `Search GitHub ${searchType}...`;
  resultsDiv.innerHTML = '';
  detailsDiv.innerHTML = '';
});

searchForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const query = searchInput.value.trim();
  if (!query) return;

  resultsDiv.innerHTML = '<p>Loading...</p>';
  detailsDiv.innerHTML = '';

  try {
    if (searchType === 'users') {
      const users = await searchUsers(query);
      displayUsers(users);
    } else {
      const repos = await searchRepos(query);
      displayRepos(repos);
    }
  } catch (error) {
    resultsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
  }
});

async function searchUsers(query) {
  const response = await fetch(`https://api.github.com/search/users?q=${query}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  const data = await response.json();
  return data.items;
}

async function searchRepos(query) {
  const response = await fetch(`https://api.github.com/search/repositories?q=${query}`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!response.ok) throw new Error('Failed to fetch repositories');
  const data = await response.json();
  return data.items;
}

function displayUsers(users) {
  resultsDiv.innerHTML = users.map(user => `
    <div class="user">
      <img src="${user.avatar_url}" alt="${user.login}" width="50" height="50">
      <a href="${user.html_url}" target="_blank">${user.login}</a>
      <button data-username="${user.login}">View Repos</button>
    </div>
  `).join('');

  document.querySelectorAll('.user button').forEach(button => {
    button.addEventListener('click', async () => {
      const username = button.getAttribute('data-username');
      detailsDiv.innerHTML = '<p>Loading repos...</p>';
      try {
        const repos = await fetchUserRepos(username);
        displayRepos(repos);
      } catch (error) {
        detailsDiv.innerHTML = `<p>Error: ${error.message}</p>`;
      }
    });
  });
}

async function fetchUserRepos(username) {
  const response = await fetch(`https://api.github.com/users/${username}/repos`, {
    headers: { Accept: 'application/vnd.github.v3+json' },
  });
  if (!response.ok) throw new Error('Failed to fetch repositories');
  return await response.json();
}

function displayRepos(repos) {
  detailsDiv.innerHTML = repos.map(repo => `
    <div class="repo">
      <a href="${repo.html_url}" target="_blank">${repo.name}</a>
      <p>${repo.description || 'No description available'}</p>
    </div>
  `).join('');
}
