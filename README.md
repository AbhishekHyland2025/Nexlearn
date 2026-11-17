# NexLearn

A self-contained learning site: 125 lessons across five modules (DSA, System Design, Security Engineering, Gen AI / Agentic AI / FDE, and electives on networks, operating systems and optimization).

No build step. `index.html` loads the lesson data files (`curriculum.js`, `content-*.js`) directly.

## Host on GitHub Pages

1. Create a new repository on GitHub (for example `nexlearn`).
2. Upload every file in this folder to the root of the repository (keep `.nojekyll`).
3. Go to **Settings -> Pages**, choose **Deploy from a branch**, pick `main` and `/ (root)`, click **Save**.
4. After about a minute, open `https://<your-username>.github.io/nexlearn/`.

## Run locally

Extract the whole zip first (right-click -> Extract All). Do not open `index.html` from inside the zip: the lesson files next to it will not load.

Then open `index.html`, or simply open `NexLearn.html`, a single file with every lesson inside it that works on its own.

## Add or edit lessons

Lesson text lives in the `content-*.js` files as plain data; the map of modules and topics is in `curriculum.js`. See `SPEC.md` for the shape. Security lessons also carry a `checklist` array.
