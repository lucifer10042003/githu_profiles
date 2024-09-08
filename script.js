const APIURL = "https://api.github.com/users/";

const main = document.getElementById("main");
const form = document.getElementById("form");
const search = document.getElementById("search");

async function getUser(username) {
  try {
    const { data } = await axios(APIURL + username);
    return data;
  } catch (err) {
    if (err.response.status === 404) {
      return { error: "No profile with this username" };
    }
    return { error: "Problem fetching user data" };
  }
}

async function getRepos(username) {
  try {
    const { data } = await axios(APIURL + username + "/repos?sort=created");
    return data;
  } catch (err) {
    return { error: "Problem fetching repos" };
  }
}

async function processUsers(usernames) {
  const userPromises = usernames.map(async (username) => {
    const user = await getUser(username.trim());
    if (user.error) {
      return { username, error: user.error };
    } else {
      const repos = await getRepos(username.trim());
      return { ...user, repos };
    }
  });

  const users = await Promise.all(userPromises);
  displayUsers(users);
}

function displayUsers(users) {
  main.innerHTML = "";
  users.forEach((user) => {
    if (user.error) {
      createErrorCard(user.username, user.error);
    } else {
      createUserCard(user);
      addReposToCard(user.repos, user.login);
    }
  });
}

function createUserCard(user) {
  const userID = user.name || user.login;
  const userBio = user.bio ? `<p>${user.bio}</p>` : "";
  const cardHTML = `
    <div class="card">
      <div>
        <img src="${user.avatar_url}" alt="${user.name}" class="avatar">
      </div>
      <div class="user-info">
        <h2>${userID}</h2>
        ${userBio}
        <ul>
          <li>${user.followers} <strong>Followers</strong></li>
          <li>${user.following} <strong>Following</strong></li>
          <li>${user.public_repos} <strong>Repos</strong></li>
        </ul>
        <div id="repos-${user.login}"></div>
      </div>
    </div>
  `;
  main.innerHTML += cardHTML;
}

function createErrorCard(username, msg) {
  const cardHTML = `
    <div class="card">
      <h1>${username}: ${msg}</h1>
    </div>
  `;
  main.innerHTML += cardHTML;
}

function addReposToCard(repos, username) {
  const reposEl = document.getElementById(`repos-${username}`);

  if (reposEl) {
    repos.slice(0, 5).forEach((repo) => {
      const repoEl = document.createElement("a");
      repoEl.classList.add("repo");
      repoEl.href = repo.html_url;
      repoEl.target = "_blank";
      repoEl.innerText = repo.name;

      reposEl.appendChild(repoEl);
    });
  }
}

form.addEventListener("submit", (e) => {
  e.preventDefault();

  const users = search.value
    .split(/[\n,]/)
    .map((user) => user.trim())
    .filter((user) => user);

  if (users.length > 0) {
    processUsers(users);
    search.value = "";
  }
});
