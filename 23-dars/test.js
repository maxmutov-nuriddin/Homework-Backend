const mongoose = require("mongoose");
const assert = require("assert");

// Load env
require("dotenv").config();

// Override MONGO_URI for test database to avoid clobbering development data
process.env.MONGO_URI = "mongodb://localhost:27017/homework_22_test";

// Start the server (which connects to process.env.MONGO_URI)
const serverFile = require("./src/server");

const BASE_URL = `http://localhost:${process.env.PORT || 3000}`;

async function runTests() {
  console.log("Running tests against:", BASE_URL);

  // Wait for mongoose connection
  await new Promise((resolve) => {
    if (mongoose.connection.readyState === 1) {
      resolve();
    } else {
      mongoose.connection.once("open", resolve);
    }
  });

  console.log("Mongoose connected. Cleaning database...");
  await mongoose.connection.db.dropDatabase();
  console.log("Database cleared.");

  // Test register and login
  let user1Token, user2Token, adminToken;
  let post1Id, post2Id;

  // 1. Register users
  console.log("1. Registering users...");
  const regUser1 = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user1", password: "password123", role: "user" }),
  }).then(r => r.json());
  assert.strictEqual(regUser1.user.username, "user1");
  assert.strictEqual(regUser1.user.role, "user");

  const regUser2 = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user2", password: "password123", role: "user" }),
  }).then(r => r.json());

  const regAdmin = await fetch(`${BASE_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin1", password: "password123", role: "admin" }),
  }).then(r => r.json());
  assert.strictEqual(regAdmin.user.role, "admin");

  // 2. Login users
  console.log("2. Logging in...");
  const loginUser1 = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user1", password: "password123" }),
  }).then(r => r.json());
  user1Token = loginUser1.accessToken;
  assert.ok(user1Token);

  const loginUser2 = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "user2", password: "password123" }),
  }).then(r => r.json());
  user2Token = loginUser2.accessToken;

  const loginAdmin = await fetch(`${BASE_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username: "admin1", password: "password123" }),
  }).then(r => r.json());
  adminToken = loginAdmin.accessToken;

  // 3. Get public posts (should be empty initially)
  console.log("3. Verifying initial public posts...");
  const publicPostsEmpty = await fetch(`${BASE_URL}/posts/public`).then(r => r.json());
  assert.strictEqual(publicPostsEmpty.length, 0);

  // 4. Create public/private posts as user1 and user2
  console.log("4. Creating posts...");
  const post1 = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "User 1 Public Post", content: "Hello world from User 1", isPublic: true }),
  }).then(r => r.json());
  post1Id = post1._id;

  const post2 = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "User 1 Private Post", content: "Private stuff from User 1", isPublic: false }),
  }).then(r => r.json());

  const post3 = await fetch(`${BASE_URL}/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user2Token}`,
    },
    body: JSON.stringify({ title: "User 2 Public Post", content: "Hello from User 2", isPublic: true }),
  }).then(r => r.json());
  post2Id = post3._id;

  // 5. Verify GET /posts/public returns only public posts (post1 and post3)
  console.log("5. Testing GET /posts/public...");
  const publicPosts = await fetch(`${BASE_URL}/posts/public`).then(r => r.json());
  assert.strictEqual(publicPosts.length, 2);
  const titles = publicPosts.map(p => p.title);
  assert.ok(titles.includes("User 1 Public Post"));
  assert.ok(titles.includes("User 2 Public Post"));
  assert.ok(!titles.includes("User 1 Private Post"));

  // 6. Verify GET /posts/me
  console.log("6. Testing GET /posts/me...");
  const mePosts = await fetch(`${BASE_URL}/posts/me`, {
    headers: { "Authorization": `Bearer ${user1Token}` },
  }).then(r => r.json());
  assert.strictEqual(mePosts.length, 2); // post1 and post2

  // 7. Verify PUT /posts/:id access checks
  console.log("7. Testing PUT /posts/:id access control...");
  // User 2 tries to update User 1's post (should fail with 403)
  const putResponseUser2 = await fetch(`${BASE_URL}/posts/${post1Id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user2Token}`,
    },
    body: JSON.stringify({ title: "Hacked!" }),
  });
  assert.strictEqual(putResponseUser2.status, 403);
  const putErrorBody = await putResponseUser2.json();
  assert.strictEqual(putErrorBody.error, "Sizga ruxsat yo'q (owner emas)");

  // User 1 updates their own post (should succeed)
  const putResponseUser1 = await fetch(`${BASE_URL}/posts/${post1Id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${user1Token}`,
    },
    body: JSON.stringify({ title: "Updated title" }),
  });
  assert.strictEqual(putResponseUser1.status, 200);
  const updatedPost1 = await putResponseUser1.json();
  assert.strictEqual(updatedPost1.title, "Updated title");

  // Admin updates User 1's post (should succeed)
  const putResponseAdmin = await fetch(`${BASE_URL}/posts/${post1Id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${adminToken}`,
    },
    body: JSON.stringify({ title: "Admin modified title" }),
  });
  assert.strictEqual(putResponseAdmin.status, 200);
  const adminUpdatedPost1 = await putResponseAdmin.json();
  assert.strictEqual(adminUpdatedPost1.title, "Admin modified title");

  // 8. Verify GET /posts (Admin Only)
  console.log("8. Testing GET /posts (Admin Only)...");
  // User 1 gets all posts (should fail with 403)
  const getPostsUser1 = await fetch(`${BASE_URL}/posts`, {
    headers: { "Authorization": `Bearer ${user1Token}` },
  });
  assert.strictEqual(getPostsUser1.status, 403);

  // Admin gets all posts (should succeed)
  const getPostsAdmin = await fetch(`${BASE_URL}/posts`, {
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  assert.strictEqual(getPostsAdmin.status, 200);
  const allPosts = await getPostsAdmin.json();
  assert.strictEqual(allPosts.length, 3); // User 1 public, User 1 private, User 2 public

  // 9. Verify PATCH /posts/:id/toggle-public (Admin Only)
  console.log("9. Testing PATCH /posts/:id/toggle-public...");
  // User 1 attempts toggle (should fail with 403)
  const toggleUser1 = await fetch(`${BASE_URL}/posts/${post1Id}/toggle-public`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${user1Token}` },
  });
  assert.strictEqual(toggleUser1.status, 403);

  // Admin toggles post 2 (User 1's private post, should become public)
  const privatePostId = post2._id;
  const toggleAdmin = await fetch(`${BASE_URL}/posts/${privatePostId}/toggle-public`, {
    method: "PATCH",
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  assert.strictEqual(toggleAdmin.status, 200);
  const toggledPost = await toggleAdmin.json();
  assert.strictEqual(toggledPost.isPublic, true);

  // Verify that it is now returned in the public posts list
  const publicPostsAfterToggle = await fetch(`${BASE_URL}/posts/public`).then(r => r.json());
  assert.strictEqual(publicPostsAfterToggle.length, 3); // post1, post2 (toggled to public), post3

  // 10. Verify DELETE /posts/:id access checks
  console.log("10. Testing DELETE /posts/:id...");
  // User 1 tries to delete User 2's post (should fail with 403)
  const deleteResponseUser1 = await fetch(`${BASE_URL}/posts/${post2Id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${user1Token}` },
  });
  assert.strictEqual(deleteResponseUser1.status, 403);
  const deleteErrorBody = await deleteResponseUser1.json();
  assert.strictEqual(deleteErrorBody.error, "Sizga ruxsat yo'q (owner emas)");

  // User 2 deletes their own post (should succeed)
  const deleteResponseUser2 = await fetch(`${BASE_URL}/posts/${post2Id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${user2Token}` },
  });
  assert.strictEqual(deleteResponseUser2.status, 200);

  // Admin deletes User 1's post (should succeed)
  const deleteResponseAdmin = await fetch(`${BASE_URL}/posts/${post1Id}`, {
    method: "DELETE",
    headers: { "Authorization": `Bearer ${adminToken}` },
  });
  assert.strictEqual(deleteResponseAdmin.status, 200);

  console.log("All tests passed successfully! 🎉");
  process.exit(0);
}

runTests().catch((err) => {
  console.error("Test execution failed ❌", err);
  process.exit(1);
});
