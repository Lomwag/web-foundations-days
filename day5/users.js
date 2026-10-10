const loadButton = document.getElementById("load-users");
const filterInput = document.getElementById("filter-input");
const statusMessage = document.getElementById("status");
const usersList = document.getElementById("users-list");

const API_URL = "https://jsonplaceholder.typicode.com/users";

let users = [];

async function loadUsers() {
  loadButton.disabled = true;
  statusMessage.textContent = "Loading users...";
  usersList.replaceChildren();

  try {
    const response = await fetch(API_URL);

    if (!response.ok) {
      throw new Error(`HTTP error: ${response.status}`);
    }

    const data = await response.json();

    if (!Array.isArray(data)) {
      throw new Error("The API returned an invalid users list.");
    }

    users = data;
    displayFilteredUsers();

    statusMessage.textContent =
      `Successfully loaded ${users.length} users.`;

    if (users.length === 0) {
      statusMessage.textContent = "No users were returned by the API.";
    }
  } catch (error) {
    users = [];
    usersList.replaceChildren();
    statusMessage.textContent =
      `Error loading users: ${error.message}`;
  } finally {
    loadButton.disabled = false;
  }
}

function getFilteredUsers() {
  const searchText = filterInput.value.trim().toLowerCase();

  return users.filter((user) =>
    typeof user.name === "string" &&
    user.name.toLowerCase().includes(searchText)
  );
}

function displayFilteredUsers() {
  const filteredUsers = getFilteredUsers();

  renderUsers(filteredUsers);

  if (users.length > 0 && filteredUsers.length === 0) {
    statusMessage.textContent = "No users match your filter.";
  } else if (users.length > 0) {
    statusMessage.textContent =
      `Showing ${filteredUsers.length} of ${users.length} users.`;
  }
}

function renderUsers(filteredUsers) {
  usersList.replaceChildren();

  filteredUsers.forEach((user) => {
    const item = document.createElement("li");
    const name = document.createElement("h2");
    const email = document.createElement("p");
    const city = document.createElement("p");
    const company = document.createElement("p");

    name.textContent = user.name || "Name unavailable";
    email.textContent = `Email: ${user.email || "Unavailable"}`;
    city.textContent =
      `City: ${user.address?.city || "Unavailable"}`;
    company.textContent =
      `Company: ${user.company?.name || "Unavailable"}`;

    item.append(name, email, city, company);
    usersList.appendChild(item);
  });
}

loadButton.addEventListener("click", loadUsers);

filterInput.addEventListener("input", () => {
  if (users.length === 0) {
    return;
  }

  displayFilteredUsers();
});