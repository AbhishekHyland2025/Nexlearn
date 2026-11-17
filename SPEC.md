# DevPath — content data contract

The app is a single HTML shell (`index.html`) that loads plain JS data files. Content authors only write JS data. No build step.

## Files
- `curriculum.js` → defines `window.CURRICULUM` (the full map: modules → sections → topics). Every topic in the user's list must be here.
- `content-<module>.js` → adds entries to `window.CONTENT[topicId]` (full lesson for a topic). Start file with `window.CONTENT = window.CONTENT || {};`

## curriculum.js shape
```js
window.CURRICULUM = [
  {
    id: 'm5', num: 5,
    title: 'Gen AI, Agentic AI & FDE Foundations',
    short: 'Gen AI & FDE',               // for nav chips
    tagline: 'One sentence in simple English about what this module makes you able to do.',
    accent: '#7c5cff',                     // one accent hex per module (used for progress ring + badges)
    sections: [
      {
        id: 'm5s1', title: 'Foundations',
        topics: [
          {
            id: 'm5-llms',                 // kebab-case, globally unique, stable forever
            title: 'How LLMs & Transformers Work',
            level: 'Beginner',             // one of: 'Beginner' | 'Intermediate' | 'Advanced' | 'Expert'
            mins: 45,                      // realistic study time
            summary: 'One or two short sentences, simple English, what this topic is and why it matters.',
            objectives: ['You can explain ...', 'You can write ...', 'You can decide ...']   // 3-5 items, start with "You can"
          }
        ]
      }
    ]
  }
];
```

## content-<module>.js shape (one entry per topic id)
```js
window.CONTENT = window.CONTENT || {};
window.CONTENT['m5-llms'] = {
  hook: 'One punchy sentence that makes the learner curious.',
  intro: '<p>...</p><p>...</p>',          // 2-4 short paragraphs. Simple English. Explain every new word the first time it appears.
  realLife: { title: 'Short title', body: '<p>...</p>' },   // a concrete, everyday story/analogy + where it shows up at a real company
  levels: [                                 // exactly 3, in this order
    { name: 'Beginner',     body: '<h4>...</h4><p>...</p><ul><li>...</li></ul>' },
    { name: 'Intermediate', body: '...' },
    { name: 'Expert',       body: '...' }
  ],
  flow: {                                   // rendered as an animated step-by-step diagram (play button, steps light up one by one with arrows)
    title: 'What happens when you send a prompt',
    steps: [ { title: 'Tokenize', desc: 'Text is split into small pieces called tokens.' } ]   // 4-8 steps
  },
  code: [                                   // 1-3 blocks. C# first wherever C# is reasonable. Python only where the tooling is Python-only (LangChain/LangGraph).
    { lang: 'csharp', title: 'Call a chat model from .NET', code: '...' }   // lang: csharp | python | typescript | sql | bash | json | text
  ],
  pitfalls: ['Common mistake 1 and how to avoid it', '...'],      // 3-6 items
  quiz: [                                   // 4-6 questions
    { q: 'Question?', options: ['A', 'B', 'C', 'D'], answer: 1, why: 'One or two sentences explaining the right answer in simple words.' }
  ],
  takeaways: ['...', '...', '...'],         // 4-6 one-liners the learner should remember
  interview: [ { q: '...', a: '<p>...</p>' } ]   // optional, 3-5 common interview questions with short model answers
};
```

## Allowed HTML inside body strings
`<p> <h4> <ul> <ol> <li> <strong> <em> <code> <table><thead><tbody><tr><th><td> <blockquote>` plus these helper blocks:
- `<div class="callout tip">...</div>`  (green, "good to know")
- `<div class="callout warn">...</div>` (amber, "watch out")
- `<div class="callout idea">...</div>` (purple, "think about it")
- `<div class="compare"><div><h5>Option A</h5>...</div><div><h5>Option B</h5>...</div></div>` (side by side)
- `<span class="term">word</span>` for a new term being defined
- Inline math is plain text, e.g. O(n log n).

## Writing rules (very important)
1. Simple English. Short sentences. If a 12-year-old could not follow the sentence, rewrite it. No "leverage", "utilize", "paradigm", "robust", "seamless", "delve".
2. Define every technical word the first time, in the same sentence or the next one.
3. Every topic has at least one real-life analogy AND one "where a real company uses this" example.
4. Beginner level = what and why, with pictures-in-words. Intermediate = how it works + hands-on code. Expert = internals, trade-offs, scale, failure modes, what interviewers ask.
5. Be correct. Prefer stable, well-known facts and APIs. Don't invent product names, version numbers or benchmark numbers. If something changes fast (model names, pricing), say "check the provider's current docs" instead of guessing.
6. Code must compile in your head: correct namespaces, async/await, using statements. Keep each block under ~60 lines. Don't use JS backticks or `${` inside code strings (the file itself uses JS template literals).
7. Quizzes test understanding, not trivia. `answer` is the 0-based index.
8. Escape rules for JS: write each string as a template literal with backticks. Never put a backtick or `${` inside. If you need a backtick in code, write a comment instead.
