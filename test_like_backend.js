import axios from 'axios';

const BASE_URL = 'http://localhost:3000/api';
let cookie = '';
const randomId = Math.floor(Math.random() * 10000);
const testUser = {
    username: `testuser${randomId}`,
    email: `testuser${randomId}@test.com`,
    password: 'password123'
};

async function signup() {
    console.log('Signing up new user...', testUser.username);
    try {
        const response = await axios.post(`${BASE_URL}/auth/signup`, testUser);
        console.log('Signup successful:', response.data);
    } catch (error) {
        console.error('Signup failed:', error.response ? error.response.data : error.message);
        // If user already exists, we can proceed to login
        if (error.response && error.response.data.message && error.response.data.message.includes('duplicate')) {
            console.log('User already exists, proceeding to login.');
        } else {
            throw error;
        }
    }
}

async function login() {
    console.log('Logging in...');
    try {
        const response = await axios.post(`${BASE_URL}/auth/signin`, {
            email: testUser.email,
            password: testUser.password
        });

        console.log('Login successful:', response.data.username);

        // Extract cookie
        const setCookie = response.headers['set-cookie'];
        if (setCookie) {
            cookie = setCookie[0].split(';')[0];
            console.log('Cookie received:', cookie);
        } else {
            console.log('No cookie received!');
        }
        return response.data;
    } catch (error) {
        console.error('Login failed:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function getPosts() {
    console.log('Fetching posts...');
    try {
        const response = await axios.get(`${BASE_URL}/post/getposts`);
        return response.data.posts;
    } catch (error) {
        console.error('Get posts failed:', error.message);
        throw error;
    }
}

async function likePost(postId) {
    console.log(`Liking post ${postId}...`);
    try {
        const response = await axios.put(`${BASE_URL}/post/likePost/${postId}`, {}, {
            headers: {
                'Cookie': cookie,
            }
        });

        console.log('Like successful. Likes:', response.data.likes);
    } catch (error) {
        console.error('Like failed:', error.response ? error.response.data : error.message);
    }
}

async function run() {
    try {
        await signup();
        await login();
        const posts = await getPosts();
        if (posts.length > 0) {
            console.log(`Found ${posts.length} posts. Testing like on first one: ${posts[0]._id}`);
            await likePost(posts[0]._id);
            // Toggle back
            await likePost(posts[0]._id);
        } else {
            console.log('No posts found.');
        }
    } catch (error) {
        console.error('Script failed:', error.message);
    }
}

run();
