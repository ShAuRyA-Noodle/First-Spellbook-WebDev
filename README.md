# First Spellbook: A Web Dev Journey

My first web dev grimoire, where confusion turned into clarity, curiosity into craft, and tiny commits into real magic. These notes mark the beginning of my journey from zero to building worlds with code.

This repository is a living spellbook: a lecture by lecture record of learning web development from the very first HTML tag to building interactive React apps backed by Express and MongoDB. Each folder is one "spell" (a lesson, a quiz, or a mini project) kept exactly as it was written while learning.

## What is inside

The work is organized as a numbered path. Follow it in order to walk the same journey, or jump to any topic you want to revisit.

### Foundations: HTML
- Structure of a web page, headings, paragraphs, and links
- Images, lists, tables, forms, and media (video and audio)
- Inline vs block elements, IDs and classes, semantic tags
- SEO basics and Core Web Vitals

### Styling: CSS
- Selectors, specificity, and the cascade
- Box model, sizing units, display, and positioning
- Flexbox, Grid, float, and clear
- Variables, media queries, transforms, transitions, and animations
- Shadows, filters, object fit, and a Figma to layout workflow
- A Netflix style clone built with HTML and CSS

### Logic: JavaScript
- Variables, data types, objects, conditionals, loops, and functions
- Strings, arrays, and the Document Object Model (DOM)
- Events, timers, callbacks, promises, async await, and the Fetch API
- Error handling, object oriented programming, and advanced topics
- A Spotify style music player clone built with vanilla HTML, CSS, and JavaScript (Lec 84)

### Backend: Node and Express
- Node.js and NPM, CommonJS vs ECMAScript modules
- File system and path modules
- Express routing, requests, responses, and middleware
- EJS templating

### Data: MongoDB
- MongoDB and MongoDB Compass
- CRUD operations
- Mongoose with Express

### Modern frontend: React
- Intro to React, components, props, and JSX
- Hooks and state, useEffect, and useRef
- Conditional rendering and rendering lists
- Handling events, designing and displaying cards from an API
- A ToDo List app built with React and Tailwind (Lec 114)
- React Router for client side routing
- useContext, useMemo, and useCallback hooks
- Handling forms and connecting React to an Express backend
- Redux Toolkit for global state management

### Full stack framework: Next.js
- Intro to Next.js and file based routing with the App Router (Lec 121)
- Server Components vs Client Components (Lec 122)
- The Script, Link, and Image optimization components (Lec 123)
- Building API route handlers inside Next.js (Lec 124)
- Server Actions with the "use server" directive (Lec 125)

### Capstone clones
- Netflix clone with HTML and CSS (Lec 53)
- Spotify clone with vanilla JavaScript (Lec 84)
- X (Twitter) clone with Tailwind CSS (Lec 101)

### Practice
- Quiz folders throughout, each paired with a solution, covering layouts, animations, calculators, generators, and dynamic builders
- A `Web Dev Quickies` folder and a `Basic Notes` folder with reference material

## How to use this repo

Most of the early lessons are plain HTML, CSS, and JavaScript: open the `index.html` file of any lecture folder in a browser to see it run.

The React lessons (Lec 105 and later) are full projects. To run one:

```bash
cd "Lec-106 Components, Props and JSX in React /shaurya-project"
npm install
npm run dev
```

The Express and MongoDB lessons are Node projects. Install dependencies and run the entry file, for example:

```bash
cd "Lec-88 Intro to ExpressJS"
npm install
node index.js
```

The Next.js lessons (Lec 121 and later) each contain an app in a subfolder. To run one:

```bash
cd "Lec-121 NextJS/first"
npm install
npm run dev
```

Every lecture folder from Lec 84 onward also carries its own in-depth README with full lecture notes: concept deep-dives, file by file code walkthroughs, run instructions, pitfalls, and practice exercises.

## Tech covered

HTML, CSS, Tailwind CSS, JavaScript, Node.js, Express, EJS, MongoDB, Mongoose, React, Vite, React Router, Redux Toolkit, and Next.js.

## A note on the journey

This is a learning repository, not a polished product. The lessons are kept honest, mistakes and all, because the point is the path: from zero to building worlds with code. If you are starting your own journey, I hope it helps.
