## How to setup Tailwind CSS

Step 1: Run the following commands

``` 
sudo npm install -D tailwindcss@3
npx tailwindcss init
```

Step 2: Update tailwind.conf.js file to include this line:
```
content: ["*.html"],
```

Step 3: create src/input.css to include:
```
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Step 4: Include the src/output.css file to your html

Step 5: Run the following command:
```
npx tailwindcss -i ./src/input.css -o ./src/output.css --watch
```

Step 6: Go into Package.json
```
Into scripts add "build": "npx tailwindcss -i ./src/input.css -o ./src/output.css --watch"
then execute the command npm run build
```