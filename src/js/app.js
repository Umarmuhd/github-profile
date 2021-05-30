/////////////////////////////////////
//Model
const state = {
  user: {},
};

//Loading Profile
const loadProfile = async function (username) {
  try {
    const res = await fetch(`https://api.github.com/graphql`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Authorization: "Bearer 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",
        Authorization: `Bearer ${process.env.API_KEY}`,
      },
      body: JSON.stringify({
        query: `
      query{
        
          user(login: "${username}") {
            name
            twitterUsername
            email
            websiteUrl
            company
            bio
            location
            avatarUrl
            followers{
              totalCount
            }
            
            following{
              totalCount
            }
            starredRepositories{
              totalCount
            }
            repositories(last: 20) {
              nodes {
                name
                id
                isFork
                url
                updatedAt
                stargazerCount
                description
                primaryLanguage{
                  color
                  name
                }
              }
              pageInfo {
                hasNextPage
              }
              totalCount
            }
          }
      }`,
      }),
    });
    const data = await res.json();

    if (!res.ok) throw new Error(`${errors.message} ${res.status}`);

    const { user } = data.data;

    state.user = {
      userName: username,
      name: user.name,
      image: user.avatarUrl,
      company: user.company,
      bio: user.bio,
      location: user.location,
      email: user.email,
      website: user.websiteUrl,
      twitter: user.twitterUsername,
      followers: user.followers.totalCount,
      followings: user.following.totalCount,
      stars: user.starredRepositories.totalCount,
      repositories: user.repositories.nodes,
      repoCount: user.repositories.totalCount,
    };

    console.log(user);
  } catch (error) {
    alert(error);
  }
};

//////////////////////////////////////
//view
class userView {
  #profileContainer = document.getElementById("profile");
  #repositories = document.getElementById("repositories");
  #repoCount = document.getElementById("repoCount");
  #repoCountMobile = document.getElementById("repoCountMobile");
  #navAvatar = document.getElementById("profileAvatar");

  #data;

  render(data) {
    this.#data = data;
    this.#profileContainer.innerHTML = this.#generateProfileMarkup();
    this.#repositories.innerHTML = this.#generateRepoMarkup();
    this.#repoCount.textContent = this.#data.repoCount;
    this.#repoCountMobile.textContent = this.#data.repoCount;
    this.#navAvatar.setAttribute("src", `${this.#data.image}`);
  }

  #generateProfileMarkup() {
    return `
  <div class="d-flex names-image">
  <div class="image">
    <a href="#"
      ><img src="${this.#data.image}" alt="${this.#data.name}"
    /></a>
  </div>
  <div class="name-username">
    <h1 class="name">${this.#data.name}</h1>
    <p class="username">${this.#data.userName}</p>
  </div>
</div>
<div class="profile">
  <div class="bio">
    <p>${this.#data.bio}</p>
  </div>
  <div class="fol-udetails">
    <div class="followings-stars">
      <div class="d-flex">
        <div class="followers">
          <img src="src/images/users.svg" alt="followers" />
          <span>${this.#data.followers}</span>
          <a href="#">Followers</a>
        </div>
        <div class="following">
          &#x2219;
          <span>${this.#data.followings}</span>
          <a href="#">Following</a>
        </div>
        <div class="stars">
          &#x2219;
          <img src="src/images/star.svg" alt="stars" />
          <span>${this.#data.stars}</span>
          <a href="#">Stars</a>
        </div>
      </div>
    </div>
    <ul class="user-details">
      <li class="current-company">
        <img src="src/images/organisation.svg" alt="${this.#data.company}" />
        <span>${this.#data.company && this.#data.company}</span>
      </li>
      <li class="current-location">
        <img src="src/images/location.svg" alt="${this.#data.location}" />
        <span>${this.#data.location && this.#data.location}</span>
      </li>

      ${
        this.#data.email &&
        ` <li class="email-address">
      <img src="src/images/mail.svg" alt="email address" />
      <a href="mailto:${this.#data.email}" target="_blank"
        >${this.#data.email}</a
      >
    </li>`
      }
       
      ${
        this.#data.website &&
        `<li class="user-websites">
      <img src="src/images/link.svg" alt="${this.#data.name}" />
      <a href="${this.#data.website}" target="_blank"
        ><span>${this.#data.website}</span></a
      >
    </li>`
      } 
      
      <li class="twitter-username">
        <img src="src/images/twitter.svg" alt="${this.#data.twitter}" />
        <a href="http://twitter.com/${this.#data.twitter}" target="_blank"
          ><span>@${this.#data.twitter && this.#data.twitter}</span></a
        >
      </li>
    </ul>
  </div>
</div>
  `;
  }

  convertDate(date) {
    let newFormat = date.split("T")[0];

    let dob = new Date(newFormat);
    let dobArr = dob.toDateString().split(" ");
    // let dobFormat = dobArr[2] + " " + dobArr[1] + " " + dobArr[3];
    let dobFormat = dobArr[2] + " " + dobArr[1];

    return dobFormat;
  }

  #generateRepoMarkup() {
    return `<ul class="repo-list">
  ${this.#data.repositories
    .reverse()
    .map((repo) => {
      return `
      <li class="repo-item">
    <div class="left">
      <h3 class="repo-title">
        <a href="${repo.url}">${repo.name}</a>
      </h3>
      <div class="repo-desc">
        <p>${repo.description ? repo.description : ""}</p>
      </div>

      <div class="repo-short">
        <span class="repo-lang">
          <span class="repo-lang-color" style="background: ${
            repo.primaryLanguage.color
          }"></span> ${repo.primaryLanguage.name}
        </span>
        <span class="repo-update"> Updated ${this.convertDate(
          repo.updatedAt
        )} </span>
      </div>
    </div>
    <div class="right">
      <div class="star-repo">
        <form action="/" method="put">
          <button type="submit">
            <!-- <input type="checkbox" name="star" id="star" /> -->
            <img src="src/images/star-repo.svg" alt="star repo" />
            Star
          </button>
        </form>
      </div>
    </div>
  </li>`;
    })
    .join("")}
  
</ul>`;
  }
}

const userRender = new userView();

/////////////////////////////////////
//Controller
window.addEventListener("load", async () => {
  const params = new URL(document.location).searchParams;
  const username = params.get("username");

  ////Loading
  await loadProfile(username);

  const { user } = state;

  ////Rendering
  userRender.render(state.user);

  console.log(user);
});

//Time out controller
const timeout = function (s) {
  return new Promise(function (_, reject) {
    setTimeout(function () {
      reject(new Error(`Request took too long! Timeout after ${s} second`));
    }, s * 1000);
  });
};
