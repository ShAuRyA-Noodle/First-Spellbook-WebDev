````markdown
# 🌐 How to Host Your Node.js App on Ubuntu 

So… you built a Node.js app? 😎 Now let’s yeet it into the world (aka host it) using Ubuntu, **pm2**, and **nginx**.  
Here’s your step-by-step, easy-to-read, “future-me will understand this” guide. 💖  

---

## 1️⃣ Install Node.js & Build Essentials

First, we need **Node.js** (the brain 🧠) and **build-essential** (the toolkit 🛠) for compiling native modules.

```bash
# Install Node.js (v21.x in this case)
curl -fsSL https://deb.nodesource.com/setup_21.x | sudo -E bash - && \
sudo apt-get install -y nodejs

# Install build tools for compiling native Node modules
sudo apt-get install build-essential
````

💡 *Why?*

* `curl ... | bash` → sets up NodeSource repo for latest Node.js.
* `build-essential` → installs `gcc`, `g++`, and `make` for building native Node modules.

---

## 2️⃣ Create Your Node.js App

You can:

* Use your own app, OR
* Try this **sample app** for testing.

```bash
# Make a new folder and go inside
mkdir my-node-app && cd my-node-app

# Create the sample index.js file
nano index.js
```

Inside `index.js`:

```javascript
const http = require('http');

const server = http.createServer((req, res) => {
    res.end('🚀 Hello from my Node.js app!');
});

server.listen(3000, () => {
    console.log('Server running on http://localhost:3000');
});
```

Run it:

```bash
node index.js
```

Check it by visiting:

```
http://<server-ip>:3000
```

If you see “Hello from my Node.js app!” — ✅ you’re good.

---

## 3️⃣ Install pm2 & Keep Your App Alive 🔄

**pm2** = process manager for Node.js → keeps your app running even after you close the terminal.

```bash
# Install pm2 globally
sudo npm install -g pm2

# Start your app
pm2 start index.js

# Make pm2 auto-start on server reboot
pm2 startup
pm2 save
```

💡 *Why pm2?*

* Auto restarts app if it crashes.
* Lets you manage multiple apps.
* Works with logs out of the box.

---

## 4️⃣ Install & Configure nginx (Reverse Proxy 🕴)

We’ll use **nginx** so your app is accessible without adding `:3000` to the URL.

```bash
# Install nginx
sudo apt install nginx
```

Edit the default site config:

```bash
sudo nano /etc/nginx/sites-available/default
```

Replace/add this in the `server { ... }` block:

```nginx
location / {
    proxy_pass http://localhost:3000;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
}
```

💡 *What’s happening?*

* `proxy_pass` → routes incoming traffic to your Node.js app.
* Headers ensure WebSockets & requests work correctly.

---

## 5️⃣ Test & Restart nginx ✅

```bash
# Test nginx config for syntax errors
sudo nginx -t

# Restart nginx if everything is OK
sudo systemctl restart nginx
```

Now open:

```
http://<your-server-ip>
```

🎉 Your app is live without needing `:3000`.

---

## 📌 pm2 Quick Commands

```bash
pm2 list         # Show all running Node apps
pm2 logs         # View app logs
pm2 restart ID   # Restart an app by ID
pm2 stop ID      # Stop an app by ID
pm2 delete ID    # Remove an app from pm2
```

---

## 🐣 Final Vibes

You went from:

> “uhhh… where do I even start?? 🤔”
> to
> “My app is live 24/7 and I’m basically a DevOps boss ✨👑.”

