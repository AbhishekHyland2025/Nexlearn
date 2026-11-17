// NexLearn content — Security module, part A: Security Foundations
// Topics: sec-mindset, sec-social, sec-crypto, sec-authn, sec-authz, sec-web-model
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* sec-mindset — Security Mindset: CIA Triad & How Attackers Think      */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-mindset'] = {
  hook: `A builder asks "how do I make this work?". An attacker asks "how do I make this do something it was never meant to do?". Security begins the day you ask both questions.`,
  intro: `<p><span class="term">Security</span> means protecting the things people care about from people who want to misuse them. In software, those things are usually data (a customer list, a bank balance, a medical record) and the ability to do something (send money, delete an account, deploy code).</p>
<p>Security is not a feature you add at the end, like a search box. It is a property of the whole system, like "fast" or "reliable". One weak spot is enough to lose it. That is why security people talk about a <span class="term">mindset</span>: a habit of looking at every feature and asking, calmly, "what could go wrong here?".</p>
<p>This lesson gives you the vocabulary and the habit. You will learn the three goals that every system protects, known as the <span class="term">CIA triad</span>. You will learn the difference between a threat, a vulnerability, an exploit and a risk. And you will learn to look at your own app the way an attacker does: where can I get in, what is worth taking, and who is trusted too much?</p>
<p>You do not need to become a hacker. You need to stop assuming that every user is polite and every request is the one your frontend would send.</p>`,
  realLife: {
    title: 'Your house, and a patch nobody installed',
    body: `<p>Think about your home. You want three things. First, strangers must not read your letters or see inside your cupboards. Second, nobody should secretly change things: swap your medicine, edit your house papers. Third, you must be able to get in and use your home whenever you need it. A lock that keeps you out is also a failure. These three wishes are confidentiality, integrity and availability.</p>
<p>Now think like a burglar for one minute. The front door has a strong lock. But is the bathroom window open? Is there a spare key under the plant pot? Does the cleaner have a copy of the key? A burglar does not attack the strongest point. He walks around the house and looks for the weakest one.</p>
<p><strong>How this showed up in the real world:</strong> in 2017 the credit agency Equifax lost personal data of about 147 million people. The attackers used a known flaw in a web framework the company was running. A fix for that flaw had already been published, but one system was not updated. No clever trick was needed. The window was open, and somebody checked.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The CIA triad: three things you protect</h4>
<table>
<thead><tr><th>Goal</th><th>Plain meaning</th><th>Everyday example</th><th>When it breaks</th></tr></thead>
<tbody>
<tr><td><strong>Confidentiality</strong></td><td>Only the right people can see it</td><td>Your bank statement in a sealed envelope</td><td>A stranger reads another customer's orders</td></tr>
<tr><td><strong>Integrity</strong></td><td>Only the right people can change it, and changes can be trusted</td><td>A cheque where nobody can alter the amount</td><td>A user edits the price in a request and pays 1 rupee</td></tr>
<tr><td><strong>Availability</strong></td><td>It works when people need it</td><td>An ATM that has cash at midnight</td><td>A flood of fake requests takes the site down</td></tr>
</tbody>
</table>
<p>Almost every security problem is a failure of one of these three. When you hear about a breach, ask: was something seen, changed, or made unavailable?</p>
<h4>Five words you must not mix up</h4>
<ul>
<li><span class="term">Asset</span>: something worth protecting. Customer data, money, your admin panel, your reputation.</li>
<li><span class="term">Threat</span>: something bad that could happen to an asset. "Someone reads other people's invoices."</li>
<li><span class="term">Vulnerability</span>: a weakness that makes a threat possible. "The invoice page does not check who is asking."</li>
<li><span class="term">Exploit</span>: the actual use of a vulnerability. "Someone changed the invoice number in the URL and it worked."</li>
<li><span class="term">Risk</span>: how much you should worry. Roughly, how likely it is multiplied by how bad it would be.</li>
</ul>
<p>An unlocked window is a vulnerability. A burglar in the area is a threat. The burglar climbing in is the exploit. The risk depends on what is inside and how often burglars pass by.</p>
<h4>The one habit: "what could go wrong?"</h4>
<p>For every feature you build, stop for two minutes and ask three questions, one for each letter:</p>
<ul>
<li><strong>C:</strong> Could someone <em>see</em> something here that is not theirs?</li>
<li><strong>I:</strong> Could someone <em>change</em> something they should not?</li>
<li><strong>A:</strong> Could someone <em>break or block</em> this for everyone else?</li>
</ul>
<div class="callout tip">You do not need to know every attack technique to ask these questions. Most serious bugs are found by a developer who simply asked "what if the user sends a different number here?".</div>
<h4>Trust nothing that comes from outside</h4>
<p>Your frontend is polite. It only sends valid data. But an attacker does not use your frontend. They send any request they like, with any values, straight to your server. So the golden rule is: <strong>every check that matters must happen on the server</strong>.</p>` },
    { name: 'Intermediate', body: `<h4>Attack surface: all the ways in</h4>
<p>The <span class="term">attack surface</span> is every place where someone outside can touch your system. Each one is an <span class="term">entry point</span>. More entry points mean more places to defend.</p>
<ul>
<li>Every API endpoint, including the old <code>/v1</code> you forgot about.</li>
<li>Every form field, query string, header, cookie and uploaded file.</li>
<li>Admin panels, debug pages, health endpoints, Swagger pages left open in production.</li>
<li>Messages from queues, webhooks from partners, files from an import job.</li>
<li>Third-party packages and the build pipeline that produces your app.</li>
<li>People: support staff, developers with production access.</li>
</ul>
<p>A simple way to improve security is to make the surface smaller. Delete unused endpoints. Close ports. Remove features nobody uses.</p>
<h4>Trust boundaries: where data changes hands</h4>
<p>A <span class="term">trust boundary</span> is a line where data moves from a place you trust less to a place you trust more. The line between the browser and your API is the most famous one. Others: between your API and the database, between your service and a partner's service, between a normal user and an admin function.</p>
<p>The rule is simple. <strong>Every time data crosses a trust boundary, check it.</strong> Who sent it? Are they allowed? Is the data the shape and size you expect?</p>
<h4>Who attacks, and why</h4>
<table>
<thead><tr><th>Attacker</th><th>Wants</th><th>Typical behaviour</th></tr></thead>
<tbody>
<tr><td>Automated bots</td><td>Anything easy</td><td>Scan the whole internet all day for known weaknesses and leaked passwords</td></tr>
<tr><td>Criminals</td><td>Money</td><td>Steal data to sell, lock data for ransom, commit payment fraud</td></tr>
<tr><td>Curious or unhappy users</td><td>Free stuff, revenge</td><td>Change an id in a URL, replay a coupon, scrape data</td></tr>
<tr><td>Insiders</td><td>Money, grudge, or just a mistake</td><td>Use access they already have</td></tr>
<tr><td>Well-funded groups</td><td>Secrets, disruption</td><td>Patient, targeted, skilled</td></tr>
</tbody>
</table>
<p>Most apps are attacked by the first three. You are usually not "targeted". You are simply found by a scan.</p>
<h4>Misuse cases: the evil twin of a user story</h4>
<p>A user story says: "As a customer, I can download my invoice." A <span class="term">misuse case</span> says: "As a customer, I try to download <em>someone else's</em> invoice." Write one or two misuse cases next to each story. They become security requirements and test cases.</p>
<h4>Defence in depth, in one picture</h4>
<p>A castle has a moat, a wall, a gate, guards and a locked treasure room. If one layer fails, the next still stands. In an app the layers are: input checks, authentication, authorization, safe database access, encryption, logging and alerts. Never rely on a single layer.</p>
<div class="callout warn">"Nobody would ever try that" is the most expensive sentence in software. Bots try everything, all the time, at no cost to the attacker.</div>` },
    { name: 'Expert', body: `<h4>Security is economics</h4>
<p>You cannot make a system impossible to break. You can make it cost more to attack than the attacker would gain. Good security work raises the attacker's cost (more steps, more skill, more time, more chance of being caught) and lowers your loss when something does go wrong. This is why you spend most effort on the assets that matter most, and why a perfect login page on top of a database with a default password is wasted money.</p>
<h4>Assume breach and limit the blast radius</h4>
<p>Mature teams design as if one part <em>will</em> be broken into one day. The question becomes: how far can the attacker get from there? The <span class="term">blast radius</span> is how much damage one compromised account, service or key can cause. You shrink it with least privilege, separate credentials per service, network separation, and data split by tenant. You also plan how you will notice and respond, because a breach found in one hour is very different from one found after six months.</p>
<h4>Beyond CIA</h4>
<ul>
<li><strong>Authentication</strong>: proving who is acting.</li>
<li><strong>Authorization</strong>: deciding what they may do.</li>
<li><strong>Accountability and non-repudiation</strong>: being able to prove later who did what, so nobody can deny it. This needs trustworthy logs.</li>
<li><strong>Privacy</strong>: collecting and keeping only the personal data you need.</li>
</ul>
<h4>No security through obscurity</h4>
<p>A design must stay safe even if the attacker knows exactly how it works. Only the keys and passwords should be secret. This idea is called Kerckhoffs's principle. A hidden admin URL, a secret algorithm or an unusual port slows down a lazy attacker for an hour. It is fine as an extra layer, never as the only one.</p>
<h4>Security versus usability</h4>
<p>If the safe path is painful, people leave it. They write passwords on notes, share accounts, and email files around the secure system. So the safe way must also be the easy way: single sign-on instead of ten passwords, passkeys instead of complex rules, safe defaults instead of settings nobody reads. When you add friction, add it only where risk is high, for example a second confirmation before changing bank details, not before every page view.</p>
<h4>Risk decisions, written down</h4>
<p>For each risk you have four choices: <strong>mitigate</strong> it (add a control), <strong>avoid</strong> it (remove the feature), <strong>transfer</strong> it (insurance, a payment provider that holds the card data) or <strong>accept</strong> it (knowingly, by someone with the authority). The dangerous option is the fifth, unofficial one: ignoring it without telling anyone.</p>
<h4>What interviewers ask</h4>
<ul>
<li>Explain the CIA triad with an example from a system you built.</li>
<li>Difference between threat, vulnerability and risk.</li>
<li>How would you reduce the attack surface of a public API?</li>
<li>What does "defence in depth" look like for one concrete endpoint?</li>
</ul>
<div class="callout idea">Pick a feature you shipped last month. Can you name its asset, its entry points and one misuse case in under a minute? If not, that is your next small exercise.</div>` }
  ],
  flow: {
    title: 'Looking at one feature the way an attacker does',
    steps: [
      { title: 'Name the asset', desc: 'What is worth protecting here? For "download invoice" it is the invoice data of every customer, and the server that produces the files.' },
      { title: 'List the entry points', desc: 'How can someone touch it? The URL with the invoice id, the session cookie, and how many times they may call it.' },
      { title: 'Draw the trust boundary', desc: 'The request comes from the internet into your API. Nothing in it can be trusted yet, not even the id.' },
      { title: 'Ask C, I and A', desc: 'Can I see another customer\'s invoice? Can I change one? Can I request ten thousand large files and slow the site for everyone?' },
      { title: 'Rate the risk', desc: 'How likely is it and how bad would it be? Reading other people\'s invoices is easy to try and very damaging, so it goes first.' },
      { title: 'Choose defences in layers', desc: 'Require login, check that the invoice belongs to the caller, limit the request rate, return a plain "not found", log the refusal.' },
      { title: 'Prove it with a test', desc: 'Write a test that logs in as user A and asks for user B\'s invoice. It must fail. Keep the test forever.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: it works in the demo, and nobody asked "what could go wrong?"', code: `// Minimal API endpoint: download an invoice as PDF.
// The happy path is perfect. Now read it as an attacker.
app.MapGet("/api/invoices/{id}/pdf", async (int id, AppDb db) =>
{
    // C: any id works. Change 1041 to 1042 and you read a stranger's invoice.
    var invoice = await db.Invoices.FindAsync(id);

    // I/C: FileName came from the database, but who wrote it there? A user upload?
    // A:   if invoice is null this throws, and the default error page may leak details.
    var path = "/data/invoices/" + invoice!.FileName;

    // A: no login needed, no limit. A script can ask for every id, all day.
    var bytes = await File.ReadAllBytesAsync(path);   // loads the whole file into memory
    return Results.File(bytes, "application/pdf");
});

// What went wrong was not one line of code.
// It was that nobody stopped to ask three questions:
//   Could someone SEE what is not theirs?        yes
//   Could someone CHANGE what they should not?   maybe (file name)
//   Could someone BREAK it for others?           yes` },
    { lang: 'csharp', title: 'Fixed: the same feature with layers of defence', code: `using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

app.MapGet("/api/invoices/{id:int}/pdf", async (
    int id, ClaimsPrincipal user, AppDb db, IInvoiceStorage storage, ILogger<Program> log) =>
{
    // Layer 1: identity comes from the verified login, never from the request body or URL.
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);

    // Layer 2: ownership is part of the query. Another customer's invoice is simply not found.
    var invoice = await db.Invoices
        .Where(i => i.Id == id && i.OwnerId == userId)
        .Select(i => new { i.Id, i.StorageKey })
        .SingleOrDefaultAsync();

    if (invoice is null)
    {
        // Layer 3: say little to the caller, say a lot to your own logs.
        log.LogWarning("Invoice {InvoiceId} missing or not owned by {UserId}", id, userId);
        return Results.NotFound();
    }

    // Layer 4: the file is found by a key the server created, not by a user-supplied name.
    //          Streaming avoids loading large files into memory.
    var stream = await storage.OpenReadAsync(invoice.StorageKey);
    return Results.File(stream, "application/pdf", "invoice-" + invoice.Id + ".pdf");
})
.RequireAuthorization()              // Layer 0: must be logged in at all
.RequireRateLimiting("downloads");   // Layer 5: one user cannot hammer the endpoint

// The misuse case becomes a test that lives in your suite forever:
//   "As customer A, I request an invoice of customer B"  ->  must return 404.` },
    { lang: 'text', title: 'A two-minute security worksheet for any new feature', code: `FEATURE: Customer can download their invoice as PDF

1. ASSETS (what is worth protecting?)
   - Invoice data of all customers (names, addresses, amounts)
   - The API server's memory and disk

2. ENTRY POINTS (how can someone touch it?)
   - GET /api/invoices/{id}/pdf      id in the URL
   - Session cookie                   who is calling
   - Request rate                     how often

3. TRUST BOUNDARY
   - Internet  ->  API        (check identity, ownership, input)
   - API       ->  file store (use server-made keys only)

4. WHAT COULD GO WRONG?
   C  Read another customer's invoice by changing the id      LIKELY / HIGH impact
   I  Trick the server into reading a different file          POSSIBLE / HIGH impact
   A  Download thousands of files to slow the service         LIKELY / MEDIUM impact

5. DEFENCES
   - Login required
   - Ownership check inside the query
   - Storage key generated by the server
   - Rate limit per user
   - Plain 404, detailed log entry

6. MISUSE TESTS
   - User A asks for user B's invoice           -> 404
   - Anonymous request                          -> 401
   - 200 requests in one minute from one user   -> 429

7. DECISION:  mitigate all three.   Owner: payments team.   Date: ______` }
  ],
  pitfalls: [
    `Thinking "we are too small to be a target". Bots scan every address on the internet. You are found by a scan long before anyone knows your name.`,
    `Trusting the frontend. Hidden fields, disabled buttons and client-side checks stop honest users only. An attacker talks to your API directly.`,
    `Protecting only confidentiality. A changed price (integrity) or a site that is down on sale day (availability) can cost as much as a leak.`,
    `Relying on one strong layer. A firewall, a login page or a "secret" URL alone is a single point of failure.`,
    `Mixing up threat, vulnerability and risk. If you cannot name them clearly, you cannot decide what to fix first.`,
    `Adding so much friction that people work around it. A safe path nobody uses protects nothing.`
  ],
  checklist: [
    `Name the asset each new feature touches and who should be able to see and change it.`,
    `List every entry point: endpoints, parameters, headers, cookies, files and background messages.`,
    `Ask the three questions for each feature: can someone see, change or block what they should not?`,
    `Write at least one misuse case next to every user story and turn it into an automated test.`,
    `Enforce every check that matters on the server, even if the frontend already checks it.`,
    `Remove unused endpoints, debug pages and old API versions before release.`,
    `Put at least two layers of defence around your most valuable asset.`,
    `Record each known risk with a decision: mitigate, avoid, transfer or accept, and an owner.`
  ],
  quiz: [
    { q: `A user changes the price in a checkout request from 4999 to 1 and the order goes through. Which part of the CIA triad failed?`, options: ['Confidentiality', 'Integrity', 'Availability', 'None, this is a usability problem'], answer: 1, why: `Nothing secret was seen and the site stayed up. Data was changed by someone who should not be able to change it. That is an integrity failure.` },
    { q: `"The invoice endpoint does not check who owns the invoice." What is this sentence describing?`, options: ['A threat', 'An exploit', 'A vulnerability', 'A risk assessment'], answer: 2, why: `It describes a weakness in the system. The threat is someone reading other people's invoices. The exploit is the moment someone actually does it.` },
    { q: `Which action reduces the attack surface?`, options: ['Adding a longer privacy policy to the sign-up page', 'Removing an old, unused API version from production', 'Making the admin URL longer and harder to guess', 'Logging more details about every incoming request'], answer: 1, why: `Fewer entry points mean fewer places to attack. A hard-to-guess URL is obscurity, not removal, and logs help you notice but do not remove a way in.` },
    { q: `Where is the most important trust boundary in a typical web app?`, options: ['Between two methods in the same class', 'Between the browser and the server', 'Between the CSS and the HTML', 'Between the test project and the main project'], answer: 1, why: `Everything arriving from the browser is controlled by the user, so it must be checked when it crosses into your server.` },
    { q: `Your team says "the hidden admin page is safe because nobody knows the URL". What is the best reply?`, options: ['Correct, a secret URL is enough as long as nobody shares it', 'Rename the URL every month to be safe', 'It must require login and admin rights anyway', 'Move it to an unusual port that scanners do not check'], answer: 2, why: `A design must stay safe even when the attacker knows how it works. URLs leak through logs, browser history and scanners.` },
    { q: `What does "defence in depth" mean?`, options: ['Using the single strongest firewall you can afford to buy', 'Several independent layers, so one failure is not a breach', 'Hiding how the system works so attackers cannot study it', 'Testing the deepest layer of the code more than others'], answer: 1, why: `Like a castle with a moat, wall and guards. Each layer assumes the one before it might fail.` }
  ],
  takeaways: [
    `Security protects three things: confidentiality (who can see), integrity (who can change) and availability (it works when needed).`,
    `A vulnerability is a weakness, a threat is what could happen, an exploit is it happening, and risk is likelihood times impact.`,
    `Attackers look for the weakest point, not the strongest. Walk around your own house and check the windows.`,
    `Everything from outside your server is untrusted. Check it every time it crosses a trust boundary.`,
    `Use layers. Assume one will fail and make sure the next one still holds.`,
    `The cheapest security tool is a two-minute question: "what could go wrong here?".`
  ],
  interview: [
    { q: 'Explain the CIA triad with a real example.', a: `<p>Confidentiality means only the right people can read data, for example a customer can see only their own orders. Integrity means only the right people can change data and changes are trustworthy, for example the server calculates the price and ignores a price sent by the client. Availability means the system works when needed, for example rate limits stop one client from exhausting the API. A good answer names a control for each one in a system you have worked on.</p>` },
    { q: 'What is the difference between a threat, a vulnerability and a risk?', a: `<p>A threat is a bad event that could happen, such as someone reading other users' data. A vulnerability is a weakness that makes it possible, such as a missing ownership check. Risk combines how likely the threat is with how much damage it would cause, and it is what you use to decide priority.</p>` },
    { q: 'How would you reduce the attack surface of a public API?', a: `<p>Remove unused endpoints and old versions, close debug and documentation pages in production, expose only the fields each client needs, require authentication by default, limit accepted methods, content types and sizes, and put the API behind a gateway with rate limiting. Then keep an inventory so new endpoints are added on purpose, not by accident.</p>` },
    { q: 'Why is "security through obscurity" a weak defence?', a: `<p>Because it fails completely the moment the secret detail leaks, and such details leak easily through logs, source code, error messages and scanning. A design should stay safe when the attacker knows everything except the keys. Obscurity can be an extra layer that slows attackers down, but never the main control.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-social — Social Engineering, Phishing & the Human Side           */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-social'] = {
  hook: `The easiest way into a locked system is to ask someone who already has the key. Attackers know this, and they ask very politely.`,
  intro: `<p><span class="term">Social engineering</span> means tricking a person into doing something that helps an attacker: sharing a password, approving a login, sending money, or opening a door. It attacks trust and habit, not code.</p>
<p>It works because people are helpful, busy and used to following instructions from someone who sounds official. A message that says "your account will be closed in one hour" makes almost everyone act first and think later. Attackers build that feeling on purpose.</p>
<p>Why does a developer need this lesson? Two reasons. First, you are a target yourself. You hold access to source code, cloud consoles and production data. Second, you design the flows that attackers abuse: password resets, support requests, "approve this login" prompts, changes of bank details. A well-designed product makes the trick fail even when a person is fooled.</p>
<p>So this lesson has two halves: how to recognise the tricks, and how to build products and team habits that do not depend on every human being perfect every day.</p>`,
  realLife: {
    title: 'The man with the ladder',
    body: `<p>A man in a bright safety jacket walks into an office building carrying a ladder. Nobody stops him. Someone even holds the door. He looks like he belongs, he looks busy, and questioning him would feel rude. Ten minutes later he is alone in the server room.</p>
<p>He did not pick a lock or break a window. He used three things every person carries: the wish to be helpful, respect for someone who looks official, and the fear of making a scene. Online attacks use exactly the same three things, only by email, chat and phone.</p>
<p><strong>How this showed up in the real world:</strong> in July 2020, attackers phoned employees of Twitter and pretended to be from the company's own IT help desk. Some employees were led to a fake login page and gave away their credentials. With those, the attackers reached an internal support tool and took over well-known accounts to post a cryptocurrency scam. The software had no famous bug. People were talked into opening the door, and the internal tool was powerful enough to do the rest.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The common tricks, in plain words</h4>
<table>
<thead><tr><th>Name</th><th>What happens</th></tr></thead>
<tbody>
<tr><td><span class="term">Phishing</span></td><td>A fake email or message sent to many people. It copies a bank, a delivery company or your employer and asks you to click a link or open a file.</td></tr>
<tr><td><span class="term">Spear phishing</span></td><td>Phishing aimed at one person. It uses your name, your manager's name, your project. Much harder to spot.</td></tr>
<tr><td>Smishing and vishing</td><td>The same trick by SMS (smishing) or by voice call (vishing).</td></tr>
<tr><td><span class="term">Pretexting</span></td><td>The attacker invents a story (a "pretext"): "I am from IT, we see a problem with your laptop."</td></tr>
<tr><td>Baiting</td><td>Something tempting is left for you: a USB stick in the car park, a "free" download.</td></tr>
<tr><td>Tailgating</td><td>Walking through a secure door behind someone who has a badge.</td></tr>
</tbody>
</table>
<h4>Six warning signs</h4>
<ul>
<li><strong>Urgency:</strong> "Act in the next 30 minutes or lose access."</li>
<li><strong>Authority:</strong> it claims to come from the CEO, the bank, the police, IT.</li>
<li><strong>An unusual request:</strong> gift cards, a new bank account, your password, a code from your phone.</li>
<li><strong>Secrecy:</strong> "Do not tell anyone, this is confidential."</li>
<li><strong>A link or sender that is slightly wrong:</strong> <code>micros0ft-support.com</code>, <code>paypa1.com</code>, or a reply address that differs from the sender.</li>
<li><strong>Too good or too scary:</strong> a prize, a refund, a legal threat.</li>
</ul>
<h4>What to do: stop, check, report</h4>
<ol>
<li><strong>Stop.</strong> Strong emotion is the signal. Take one breath before you click.</li>
<li><strong>Check through another channel.</strong> Do not use the link or phone number in the message. Open the site yourself, or call the person on a number you already have.</li>
<li><strong>Report it.</strong> Tell your security or IT team, even if you already clicked. Fast reports save companies.</li>
</ol>
<div class="callout tip">No real IT team, bank or colleague needs your password or the code from your authenticator app. If someone asks for it, the conversation is over.</div>
<h4>Your personal basics</h4>
<ul>
<li>Use a <span class="term">password manager</span>. It creates a different long password for every site, and it will not fill a password into a fake look-alike site.</li>
<li>Turn on <span class="term">multi-factor authentication (MFA)</span>: a second proof besides the password.</li>
<li>Keep your phone, laptop and browser updated.</li>
<li>Lock your screen when you leave your desk.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>Attacks that get past basic MFA</h4>
<ul>
<li><span class="term">MFA fatigue</span>: the attacker already has the password. They trigger dozens of "Approve sign-in?" prompts on your phone, often at night, until you tap Approve to make it stop. Sometimes they also send a message pretending to be IT: "please accept the prompt".</li>
<li><span class="term">SIM swap</span>: the attacker convinces a phone company to move your number to their SIM card. Now your SMS codes arrive on their phone.</li>
<li><span class="term">Business email compromise (BEC)</span>: an email that looks like it is from a supplier or a director asks finance to pay an invoice to a "new bank account". No malware, just a believable request.</li>
<li><strong>Help desk attacks:</strong> the attacker calls support, pretends to be a locked-out employee and asks for a password or MFA reset.</li>
<li><strong>Consent phishing:</strong> a real login page asks you to grant a harmful app access to your mail or files. You never type a password into a fake site, so it feels safe.</li>
</ul>
<h4>Product-side defences: make the trick fail</h4>
<p>As a developer you control the flows attackers aim at. Build them so one fooled person is not enough.</p>
<table>
<thead><tr><th>Flow</th><th>Design rule</th></tr></thead>
<tbody>
<tr><td>Password reset</td><td>Same reply whether the account exists or not. Short-lived, single-use link. Rate limit per account and per address. Notify the user after every reset.</td></tr>
<tr><td>Push approval</td><td>Use <strong>number matching</strong>: the login screen shows a number and the user must type it in the app. Blind tapping no longer works. Limit how many prompts can be sent.</td></tr>
<tr><td>Changing email, phone, bank details</td><td>Ask for the password or a second factor again. Send a notice to the <em>old</em> address. Add a waiting period before payouts go to new details.</td></tr>
<tr><td>Large or unusual payments</td><td>Confirm through a second channel (<span class="term">out-of-band</span>), or require a second person to approve.</td></tr>
<tr><td>Support desk</td><td>A fixed identity script that staff cannot skip. Call back on the number on file. Never read data out to the caller; let them state it.</td></tr>
</tbody>
</table>
<h4>Phishing-resistant sign-in</h4>
<p>Codes by SMS, codes from an app and push prompts can all be typed or approved on a fake site, because the human is the link between the site and the code. <span class="term">Passkeys</span> and hardware security keys work differently. The key is tied to the real website address. On a fake address the browser simply has nothing to offer. This is why they are called phishing-resistant, and why they are the strongest defence you can offer users and staff.</p>
<div class="callout warn">User enumeration helps attackers build target lists. "No account with this email" on login, sign-up or reset tells them who is your customer. Use one neutral message everywhere.</div>` },
    { name: 'Expert', body: `<h4>Design for the day someone clicks</h4>
<p>In any large group, someone will click. Training lowers the number; it never reaches zero. So the real question is what the attacker can do next. Good design makes one stolen login a small event.</p>
<ul>
<li><strong>Least privilege and just-in-time access:</strong> staff have no standing production or admin rights. They request access for a short time, with a reason, and it is logged.</li>
<li><strong>Powerful internal tools get the strongest controls:</strong> phishing-resistant MFA, managed devices only, per-action limits, and a second person for dangerous actions such as changing a customer's email or disabling MFA.</li>
<li><strong>Detection:</strong> alert on sign-in from a new device or country, many MFA prompts in a short time, a mailbox rule that forwards mail outside, a sudden burst of password resets.</li>
<li><strong>Fast response:</strong> one button to end all sessions of a user and rotate their credentials.</li>
</ul>
<h4>Email authentication in three short names</h4>
<ul>
<li><span class="term">SPF</span>: a DNS record that lists which servers may send mail for your domain.</li>
<li><span class="term">DKIM</span>: your mail server signs each message, so receivers can check it was not changed.</li>
<li><span class="term">DMARC</span>: tells receivers what to do when SPF and DKIM fail (nothing, quarantine or reject) and where to send reports.</li>
</ul>
<p>Together they stop strangers from sending mail that truly appears to come from your exact domain. They do not stop look-alike domains, so also watch for registrations that resemble your brand.</p>
<h4>Awareness that works</h4>
<p>Yearly slide decks change little. What works: short, regular practice with realistic simulated phishing; an easy "report" button; quick, friendly feedback; and a <strong>no-blame culture</strong>. If people are punished for clicking, they hide it, and you lose the early warning that matters most. Measure the report rate and the time to first report, not only the click rate.</p>
<h4>New pressure: cloned voices and video</h4>
<p>AI tools can copy a voice from a short recording and produce convincing video. A call "from the director" asking for an urgent transfer may sound exactly right. The defence is process, not ears: money and access changes always need a second channel or a second person, no matter who seems to be asking.</p>
<h4>When credentials are phished</h4>
<ol>
<li>End all sessions and reset the password and MFA of the account.</li>
<li>Check what the account did: logins, mail rules, tokens created, data downloaded.</li>
<li>Look for the same message sent to others and remove it.</li>
<li>Tell the person "thank you for reporting", and mean it.</li>
</ol>
<h4>What interviewers ask</h4>
<ul>
<li>How would you design a password reset flow that resists abuse?</li>
<li>Why are passkeys phishing-resistant while one-time codes are not?</li>
<li>How do you protect an internal admin tool from a phished employee account?</li>
</ul>` }
  ],
  flow: {
    title: 'A phishing attack, and where each defence stops it',
    steps: [
      { title: 'Research', desc: 'The attacker reads public profiles and learns names, roles and the look of your company emails. Defence: share less detail about internal tools in public.' },
      { title: 'The lure', desc: 'An email arrives: "IT: your password expires today, sign in to keep it." Defence: mail filtering, DMARC, and people who know the warning signs.' },
      { title: 'The fake page', desc: 'The link opens a copy of your login page on a look-alike address. Defence: a password manager refuses to fill on the wrong address.' },
      { title: 'Password captured', desc: 'The victim types the password. The attacker now has it. Defence so far has failed, which is why the password must never be enough alone.' },
      { title: 'The second factor', desc: 'The attacker signs in and a prompt appears. A code or a tap can be tricked out of the user. A passkey cannot, because it only answers the real address.' },
      { title: 'New session noticed', desc: 'A sign-in from a new device and country triggers an alert and an email to the user. Defence: detection and a "this was not me" button.' },
      { title: 'Risky action blocked', desc: 'The attacker tries to change the payout bank account. The app asks for a fresh second factor and delays payouts to new details.' },
      { title: 'Report and respond', desc: 'The user reports the email. Security ends all sessions, resets credentials and checks who else received it.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: a reset flow that helps the attacker', code: `// Three gifts for an attacker in one small endpoint.
app.MapPost("/account/forgot-password", async (ForgotRequest req, AppDb db, IMailer mail) =>
{
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);

    // Gift 1: tells the caller which emails are customers (user enumeration).
    if (user is null)
        return Results.NotFound(new { message = "No account with this email." });

    // Gift 2: a short numeric code from a predictable generator, valid forever,
    //         and stored as plain text.
    user.ResetCode = new Random().Next(1000, 10000).ToString();
    await db.SaveChangesAsync();

    // Gift 3: no limit. A script can request thousands of resets,
    //         flood a victim's inbox, or simply try all 9000 codes.
    await mail.SendAsync(user.Email, "Your reset code: " + user.ResetCode);
    return Results.Ok(new { message = "Code sent." });
});` },
    { lang: 'csharp', title: 'Fixed: neutral reply, strong single-use token, rate limit, notification', code: `using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Identity.UI.Services;
using Microsoft.AspNetCore.RateLimiting;

// Reset links expire quickly.
builder.Services.Configure<DataProtectionTokenProviderOptions>(o =>
    o.TokenLifespan = TimeSpan.FromMinutes(30));

// At most 5 reset requests per address every 15 minutes.
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("reset", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 5, Window = TimeSpan.FromMinutes(15) }));
});

app.UseRateLimiter();

app.MapPost("/account/forgot-password", async (
    ForgotRequest req, UserManager<AppUser> users, IEmailSender mail, ILogger<Program> log) =>
{
    var user = await users.FindByEmailAsync(req.Email);
    if (user is not null && await users.IsEmailConfirmedAsync(user))
    {
        // Long, random, signed, single-use token created by ASP.NET Core Identity.
        var token = await users.GeneratePasswordResetTokenAsync(user);
        var link = "https://app.example.com/reset?uid=" + user.Id
                 + "&token=" + Uri.EscapeDataString(token);
        await mail.SendEmailAsync(user.Email!, "Reset your password",
            "Use this link within 30 minutes: " + link + " If you did not ask for it, ignore this email.");
    }
    else
    {
        log.LogInformation("Password reset requested for an unknown or unconfirmed address");
    }

    // The same answer in every case. The caller learns nothing about who has an account.
    return Results.Ok(new { message = "If that address has an account, we have sent a reset link." });
})
.RequireRateLimiting("reset");

app.MapPost("/account/reset-password", async (ResetRequest req, UserManager<AppUser> users, IEmailSender mail) =>
{
    var user = await users.FindByIdAsync(req.UserId);
    if (user is null) return Results.BadRequest(new { message = "The link is invalid or has expired." });

    var result = await users.ResetPasswordAsync(user, req.Token, req.NewPassword);
    if (!result.Succeeded) return Results.BadRequest(new { message = "The link is invalid or has expired." });

    await users.UpdateSecurityStampAsync(user);   // old sessions end at their next cookie check
    await mail.SendEmailAsync(user.Email!, "Your password was changed",
        "If this was not you, contact support immediately.");
    return Results.Ok();
})
.RequireRateLimiting("reset");` },
    { lang: 'text', title: 'Support desk identity script (staff may not skip a step)', code: `GOAL: A caller wants a password reset, an MFA reset or a change of contact details.

RULES FOR EVERY CALL
  1. Never read account data out to the caller. Ask them to state it.
       Wrong:  "Is your email asha@example.com?"
       Right:  "Which email address is on the account?"
  2. Never accept "I am in a hurry" or "I am a manager" as a reason to skip a step.
  3. Never ask for, or accept, a password or a one-time code by phone or chat.

VERIFICATION (all required)
  [ ] Caller states account email and one recent activity (last order, last invoice month)
  [ ] We call back on the phone number ALREADY on file, or send a link to the email on file
  [ ] For MFA reset: wait 24 hours and notify every contact on file first
  [ ] For employees: manager confirms through the internal chat, not by a forwarded email

HIGH-RISK REQUESTS  (change email, change payout details, disable MFA)
  [ ] Second support agent approves in the tool
  [ ] Notification sent to the OLD email and phone
  [ ] Payouts to new bank details held for 72 hours

IF SOMETHING FEELS WRONG
  - Pressure, anger, flattery or secrecy are warning signs, not reasons to hurry.
  - End the call politely: "I cannot do that on this call. Please use the reset link."
  - Log the attempt and tell the security team the same day.` }
  ],
  pitfalls: [
    `Believing "I would never fall for it". Targeted messages arrive when you are busy and use real names and projects. Rely on process, not on confidence.`,
    `Using the phone number or link inside a suspicious message to "verify" it. That only reaches the attacker again. Use a contact you already had.`,
    `Reply messages that reveal whether an account exists. Login, sign-up and reset must all give the same neutral answer.`,
    `Treating SMS codes or tap-to-approve prompts as strong MFA for admins. They can be phished or worn down. Use passkeys or hardware keys for powerful accounts.`,
    `Letting support staff override identity checks for an "urgent" or "important" caller. Urgency is the attacker's main tool.`,
    `Punishing people who click. They will stop reporting, and you will learn about the next attack much later.`
  ],
  checklist: [
    `Return the same neutral message from login, sign-up and password reset whether or not the account exists.`,
    `Make reset links long, random, single-use and valid for 30 minutes or less.`,
    `Rate limit reset, login and MFA prompt requests per account and per address.`,
    `Require a fresh password or second factor before changing email, phone, MFA or bank details.`,
    `Send a notification to the old contact details after every sensitive change.`,
    `Use number matching for push approvals and cap the number of prompts.`,
    `Offer passkeys to users and require phishing-resistant MFA for staff and admin tools.`,
    `Give support staff a written identity script and a second approver for high-risk requests.`,
    `Publish SPF, DKIM and DMARC records for every domain that sends email.`,
    `Provide a one-click way to report suspicious messages and thank people who use it.`
  ],
  quiz: [
    { q: `An email from "IT Support" says your mailbox will be deleted in one hour unless you sign in through a link. What is the strongest warning sign?`, options: ['It was sent early in the morning, before most people start work', 'It creates urgency and asks you to sign in through its link', 'It shows the company logo and uses the company colours', 'It is written in English and is only a few lines long'], answer: 1, why: `Urgency plus a request to enter credentials through a supplied link is the classic phishing pattern. Logos are easy to copy.` },
    { q: `Why do passkeys resist phishing when a 6-digit code from an app does not?`, options: ['A passkey is much longer than a code, so it cannot be guessed in time', 'A passkey is tied to the real site address, so a fake site gets nothing', 'A code expires too slowly, while a passkey expires within a few seconds', 'A passkey is stored in the cloud, where a fake site cannot reach it'], answer: 1, why: `A person can be tricked into typing a code on a fake page. A passkey is checked by the browser against the site address, so the fake site gets nothing.` },
    { q: `Your password reset endpoint answers "No account with this email" for unknown addresses. What is the problem?`, options: ['It makes the reset endpoint slower for users', 'It tells an attacker which emails are registered', 'It uses more server memory for every unknown address', 'Nothing, a clear message like this is helpful to users'], answer: 1, why: `This is user enumeration. Attackers use it to build lists of real customers for phishing and password guessing. Always reply with the same neutral text.` },
    { q: `What is MFA fatigue?`, options: ['Users leaving their phone at home and skipping the second step', 'Sending many approval prompts until the user accepts one', 'An authenticator app that takes too long to show a code', 'Having too many passwords and codes to remember each day'], answer: 1, why: `The attacker already has the password and floods the user with prompts. Number matching and prompt limits stop this.` },
    { q: `Finance receives an email from a known supplier asking to pay future invoices to a new bank account. What should the process require?`, options: ['Pay to the new account quickly so the supplier is not kept waiting', 'Reply to the email and ask the sender to confirm that it is real', 'Call the supplier on a number already on file before any change', 'Check the email for spelling mistakes and a correct logo'], answer: 2, why: `Replying goes to whoever sent the email. Out-of-band confirmation on a known number breaks the attack even when the email looks perfect.` },
    { q: `An employee admits they entered their password on a fake page ten minutes ago. What is the best first reaction from the team?`, options: ['Give them a written warning so that others take more care', 'Thank them, end all sessions and reset the credentials', 'Wait and watch the account to see if anything happens', 'Ask them to change the password at the next planned reset'], answer: 1, why: `Speed matters most, and a blame-free reaction keeps people reporting. Ending sessions and resetting credentials closes the door quickly.` }
  ],
  takeaways: [
    `Social engineering attacks trust, helpfulness and hurry. It needs no bug in your code.`,
    `Warning signs: urgency, authority, an unusual request, secrecy, and a sender or link that is slightly wrong.`,
    `Stop, check through a channel you already trust, and report, even if you already clicked.`,
    `Design flows so one fooled person is not enough: neutral messages, short-lived tokens, re-authentication, notifications, second approvers.`,
    `Passkeys and hardware keys are phishing-resistant because they are bound to the real site address.`,
    `Assume someone will click one day. Limit what a single account can do and make reporting safe and easy.`
  ],
  interview: [
    { q: 'How would you design a secure password reset flow?', a: `<p>The request endpoint always returns the same message, whether or not the account exists, and is rate limited per account and per client. The link contains a long random single-use token that expires within minutes and is stored only as a hash or as a signed value. Using the link sets a new password, ends all existing sessions and sends a notification to the user. The flow never emails the password itself and never logs the token.</p>` },
    { q: 'Why is SMS a weak second factor?', a: `<p>The code can be phished like a password, because the user can be asked to type it into a fake page. The phone number itself can be taken over through a SIM swap or number port. SMS is still better than no second factor, but app codes are stronger and passkeys or hardware keys are stronger again.</p>` },
    { q: 'How do you protect an internal admin tool against a phished employee?', a: `<p>Require phishing-resistant MFA and managed devices to reach it, give each person only the permissions they need and for a limited time, require a second approver for dangerous actions, rate limit and log every action, and alert on unusual use. The goal is that one stolen account cannot cause large damage and is noticed quickly.</p>` },
    { q: 'What makes security awareness training effective?', a: `<p>Short, frequent and realistic practice instead of a yearly lecture, a very easy way to report, fast friendly feedback, and no blame for honest mistakes. Useful measures are the share of people who report and how quickly the first report arrives, because early reports are what limit real incidents.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-crypto — Cryptography Essentials: Hashing, Encryption & Signatures */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-crypto'] = {
  hook: `Encoding hides nothing. Hashing cannot be undone. Encryption needs a key. Mixing up these three is behind a surprising number of data breaches.`,
  intro: `<p><span class="term">Cryptography</span> is the maths that keeps information secret and proves it has not been changed. You use it all day without seeing it: the padlock in your browser, the password check when you log in, the update your phone trusts because it is signed.</p>
<p>As a developer you will almost never invent or implement this maths. Your job is smaller and still easy to get wrong: <strong>pick the right tool for the job and use it the way it was designed</strong>. Use a hash where you needed encryption, or a fast hash where you needed a slow one, and the protection is gone even though the code "works".</p>
<p>This lesson gives you a small, reliable toolbox. You will learn what encoding, hashing, symmetric encryption, asymmetric encryption and digital signatures each do. You will learn how passwords must be stored, how to create random values safely, and where keys should live. Every tool comes with the .NET class you would use for it.</p>
<p>One rule stands above the others: <strong>never invent your own crypto</strong>. Use well-known algorithms through well-known libraries, with their default settings unless you have a strong reason.</p>`,
  realLife: {
    title: 'Envelopes, fingerprints and wax seals',
    body: `<p>Imagine sending a letter in the old days. Writing it in another alphabet does not protect it. Anyone who knows the alphabet can read it. That is <strong>encoding</strong>: a different format, no secret.</p>
<p>Putting the letter in a locked box protects it. Only someone with the key can open it. That is <strong>encryption</strong>. If you and your friend share one key, it is symmetric. If your friend gives everyone an open padlock and keeps the only key, it is asymmetric.</p>
<p>A <strong>hash</strong> is like a fingerprint of the letter. From the fingerprint you cannot rebuild the person. But if even one word of the letter changes, the fingerprint changes too. And a wax seal pressed with your personal ring is a <strong>signature</strong>: it proves the letter came from you and was not opened and altered.</p>
<p><strong>How this showed up in the real world:</strong> in 2012, millions of LinkedIn password hashes were leaked. They had been stored with SHA-1, a fast hash, and without a salt. Because the hash was fast and identical passwords gave identical hashes, attackers recovered most of the passwords in a short time. The data was "hashed", but with the wrong kind of hash, so the protection was thin.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Three things people confuse</h4>
<table>
<thead><tr><th></th><th>Encoding</th><th>Hashing</th><th>Encryption</th></tr></thead>
<tbody>
<tr><td>Purpose</td><td>Change the format so systems can carry the data</td><td>Make a fixed-size fingerprint</td><td>Keep data secret</td></tr>
<tr><td>Needs a key?</td><td>No</td><td>No</td><td>Yes</td></tr>
<tr><td>Can be reversed?</td><td>Yes, by anyone</td><td>No</td><td>Yes, with the key</td></tr>
<tr><td>Examples</td><td>Base64, URL encoding, hex</td><td>SHA-256</td><td>AES, RSA</td></tr>
<tr><td>Use it for</td><td>Putting bytes in JSON or a URL</td><td>Checking that data did not change</td><td>Protecting data at rest and on the wire</td></tr>
</tbody>
</table>
<div class="callout warn">Base64 is not protection. A Base64 string in a config file or a token can be decoded by anyone in one second.</div>
<h4>What a hash does</h4>
<p>A <span class="term">hash function</span> takes any input, a word or a whole film, and returns a short fixed-size value. For SHA-256 it is always 256 bits. Good hash functions have three properties:</p>
<ul>
<li>The same input always gives the same output.</li>
<li>A tiny change in the input changes the output completely.</li>
<li>You cannot work backwards from the output to the input, and you cannot find two inputs with the same output.</li>
</ul>
<p>Hashes are used to check downloads, to detect changed files, and as a building block for signatures and password storage.</p>
<h4>Two kinds of encryption</h4>
<ul>
<li><span class="term">Symmetric</span>: one key locks and unlocks. Very fast. The problem is sharing the key safely. The standard is <strong>AES</strong>.</li>
<li><span class="term">Asymmetric</span>: a pair of keys. The <strong>public key</strong> can be given to everyone. The <strong>private key</strong> is kept secret. What one key locks, only the other opens. Slower, but it solves the sharing problem. Common ones are <strong>RSA</strong> and <strong>elliptic curve (ECC)</strong>.</li>
</ul>
<p>Real systems use both. Asymmetric crypto is used to agree on a temporary symmetric key, and that key encrypts the actual data. This is what happens every time you open an HTTPS page.</p>
<h4>Digital signatures</h4>
<p>To sign, you use your <em>private</em> key on a hash of the message. Anyone with your <em>public</em> key can check the signature. A valid signature proves two things: the message came from the holder of the private key, and it was not changed.</p>
<h4>Passwords are special</h4>
<p>You never encrypt passwords and you never store them as plain text. You store a <strong>slow, salted hash</strong>. The Intermediate level explains why and how.</p>
<div class="callout tip">Choosing a tool: need to read it back later? Encrypt. Only need to check it? Hash. Need to prove who sent it? Sign. Only need a different format? Encode.</div>` },
    { name: 'Intermediate', body: `<h4>Storing passwords correctly</h4>
<p>Attackers who steal a database try billions of guesses per second against fast hashes like MD5, SHA-1 or SHA-256. So for passwords you need a hash that is slow on purpose.</p>
<ul>
<li><span class="term">Salt</span>: a random value, different for every user, stored next to the hash. Two users with the same password get different hashes, and ready-made tables of hashes become useless.</li>
<li><strong>Slow algorithm:</strong> <strong>Argon2id</strong>, <strong>bcrypt</strong>, <strong>scrypt</strong> or <strong>PBKDF2</strong>. Each has a "work factor" that you raise as computers get faster.</li>
</ul>
<p>In ASP.NET Core you do not write this yourself. <code>PasswordHasher&lt;TUser&gt;</code> uses PBKDF2 with a random salt and a high iteration count, and packs everything into one string. When the defaults get stronger in a new version, verification tells you "success, rehash needed" so you can upgrade old hashes at the next login.</p>
<h4>HMAC: a hash with a secret</h4>
<p>A plain hash proves nothing about who made it. An <span class="term">HMAC</span> mixes a secret key into the hash. Only someone with the key can produce or check it. Use it to verify that a webhook really came from your payment provider, or that a value you handed to the browser came back unchanged.</p>
<p>Always compare such values with a <strong>fixed-time comparison</strong> (<code>CryptographicOperations.FixedTimeEquals</code>). A normal comparison stops at the first different byte, and that small time difference can leak information.</p>
<h4>AES-GCM: encryption that also detects changes</h4>
<p>Use <strong>AES-GCM</strong> for symmetric encryption. It is an <span class="term">authenticated</span> mode: it encrypts and also produces a tag that fails if anyone altered the data. You need three things:</p>
<ul>
<li>A <strong>key</strong>: 32 random bytes, kept in a vault.</li>
<li>A <strong>nonce</strong>: 12 bytes, different for every encryption with the same key. It is not secret; store it next to the ciphertext. <strong>Never reuse a nonce with the same key.</strong></li>
<li>The <strong>tag</strong>: 16 bytes produced by encryption and required for decryption.</li>
</ul>
<h4>Random numbers</h4>
<p><code>System.Random</code> is for games and test data. Its output can be predicted. For tokens, reset codes, keys, salts and nonces always use <code>RandomNumberGenerator</code>.</p>
<h4>Do not hand-roll what the framework gives you</h4>
<p>ASP.NET Core <span class="term">Data Protection</span> (<code>IDataProtector</code>) encrypts and signs small values for you, and creates, stores and rotates its own keys. It is ideal for values your own app will read back, such as tokens in links and cookie contents.</p>
<table>
<thead><tr><th>Job</th><th>Use</th><th>Avoid</th></tr></thead>
<tbody>
<tr><td>Password storage</td><td>PasswordHasher, Argon2id, bcrypt</td><td>MD5, SHA-1, plain SHA-256, encryption</td></tr>
<tr><td>Encrypt data</td><td>AES-GCM, Data Protection</td><td>DES, 3DES, AES in ECB mode</td></tr>
<tr><td>Integrity with a shared secret</td><td>HMAC-SHA256</td><td>hash(secret + message) by hand</td></tr>
<tr><td>Signatures</td><td>ECDSA P-256, RSA-PSS</td><td>Home-made schemes</td></tr>
<tr><td>Random values</td><td>RandomNumberGenerator</td><td>System.Random, Guid as a secret</td></tr>
</tbody>
</table>` },
    { name: 'Expert', body: `<h4>Key exchange in plain words</h4>
<p>How do two strangers agree on a secret key while everyone is listening? Picture mixing paint. Both start with the same public colour. Each adds a private colour and sends the mix to the other. Each then adds their own private colour to what they received. Both end with the same final colour, and a listener who saw only the two mixes cannot separate them. This is the idea of <span class="term">Diffie-Hellman</span> key exchange. Modern TLS uses an elliptic curve version of it, with fresh values for every connection. That gives <span class="term">forward secrecy</span>: stealing the server's long-term key later does not unlock old recorded traffic.</p>
<h4>Certificates and TLS in one section</h4>
<p>Key exchange alone does not tell you <em>who</em> you are talking to. A <span class="term">certificate</span> binds a public key to a name such as <code>shop.example.com</code>, and is signed by a <span class="term">certificate authority (CA)</span> that browsers already trust. In the TLS handshake the server sends its certificate chain, proves it holds the matching private key by signing part of the handshake, both sides derive session keys from the key exchange, and all further data is protected with an authenticated cipher such as AES-GCM. So TLS uses every tool in this lesson: signatures for identity, key exchange for the secret, symmetric encryption for speed, hashes throughout.</p>
<h4>Key management is the hard part</h4>
<ul>
<li><strong>Keys never live in source code or config files.</strong> Use a vault or key management service (Azure Key Vault, AWS KMS, HashiCorp Vault).</li>
<li><span class="term">Envelope encryption</span>: encrypt data with a data key, then encrypt the data key with a master key that never leaves the vault. Rotating the master key does not require re-encrypting all data.</li>
<li><strong>Rotate</strong> keys on a schedule and immediately after a suspected leak. Store a key id with each ciphertext so old data can still be read.</li>
<li><strong>Separate keys by purpose</strong> and by environment. A test key must never open production data.</li>
<li>Bind ciphertext to its context with <span class="term">associated data</span> in AES-GCM (for example the record id), so a valid ciphertext cannot be copied onto another record.</li>
</ul>
<h4>Classic mistakes reviewers look for</h4>
<ul>
<li>ECB mode, which leaks patterns because equal blocks encrypt to equal blocks.</li>
<li>A fixed or repeated nonce or IV. With GCM, one reuse can reveal the plaintext relation and allow forgeries.</li>
<li>Encryption without integrity (plain CBC with no MAC), which invites tampering attacks.</li>
<li>RSA with old PKCS#1 v1.5 padding for encryption; prefer OAEP, and PSS for signatures.</li>
<li>Comparing MACs or tokens with <code>==</code>.</li>
<li>Catching the "tag mismatch" exception and continuing anyway.</li>
<li>No upper limit on password length before a slow hash, which lets one request burn seconds of CPU.</li>
</ul>
<h4>Looking ahead: quantum computers</h4>
<p>A large quantum computer would break RSA and elliptic curve crypto, while AES-256 and SHA-2 remain sound. New "post-quantum" algorithms were standardised by NIST in 2024, and TLS libraries are adopting hybrid key exchange. For most teams the action is simple: keep libraries current, avoid hard-coding algorithm choices, and know where long-lived secrets are stored, because traffic recorded today could be decrypted later.</p>
<h4>What interviewers ask</h4>
<ul>
<li>Why is SHA-256 a bad password hash, and what would you use?</li>
<li>What is a salt for, and does it need to be secret?</li>
<li>What breaks if you reuse a nonce in AES-GCM?</li>
<li>Explain how HTTPS combines asymmetric and symmetric crypto.</li>
</ul>
<div class="callout idea">Search your codebase for MD5, SHA1, new Random( and ECB. Each hit is either harmless (a cache key, a test) or a finding. Can you tell which is which?</div>` }
  ],
  flow: {
    title: 'What crypto does during one secure sign-in',
    steps: [
      { title: 'Key exchange', desc: 'Browser and server each send a fresh public value and derive the same secret session key. A listener cannot compute it.' },
      { title: 'Server proves identity', desc: 'The server sends its certificate and signs part of the handshake with its private key. The browser checks the signature and the CA chain.' },
      { title: 'Encrypted channel', desc: 'From now on every byte is protected with an authenticated cipher such as AES-GCM. Your password travels inside it.' },
      { title: 'Look up the stored hash', desc: 'The server loads the user record. It holds a salt and a slow hash, never the password itself.' },
      { title: 'Slow hash the attempt', desc: 'The submitted password is hashed with the same salt and work factor. This takes a noticeable fraction of a second by design.' },
      { title: 'Fixed-time compare', desc: 'The two hashes are compared in a way that takes the same time whether they differ at the first byte or the last.' },
      { title: 'Random session token', desc: 'On success the server creates a long random value from a secure generator and sends it as a cookie. That token, not the password, is used from now on.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: five common crypto mistakes', code: `using System.Security.Cryptography;
using System.Text;

// 1. A fast, unsalted hash for passwords.
//    Same password = same hash for every user, and billions of guesses per second.
string StorePassword(string password) =>
    Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(password)));

// 2. "Encryption" that is only encoding. Anyone can reverse this.
string Hide(string apiKey) => Convert.ToBase64String(Encoding.UTF8.GetBytes(apiKey));

// 3. A predictable generator for a security token.
string NewResetCode() => new Random().Next(100000, 999999).ToString();

// 4. A key in source code, and ECB mode, which leaks patterns in the data.
byte[] EncryptCard(string cardNumber)
{
    using var aes = Aes.Create();
    aes.Key = Encoding.UTF8.GetBytes("MySuperSecretKey1234567890123456");   // lives in git forever
    return aes.EncryptEcb(Encoding.UTF8.GetBytes(cardNumber), PaddingMode.PKCS7);
}

// 5. Comparing a signature with ==, which stops at the first different character.
bool IsValid(string expectedSignature, string givenSignature) =>
    expectedSignature == givenSignature;` },
    { lang: 'csharp', title: 'Fixed: passwords, random tokens and HMAC done the standard way', code: `using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Identity;

// --- Passwords: slow, salted hash through the framework ---
var hasher = new PasswordHasher<AppUser>();
var user = new AppUser { Email = "asha@example.com" };

// Salt, algorithm settings and hash are packed into one string. Store that string.
user.PasswordHash = hasher.HashPassword(user, "correct horse battery staple");

bool CheckPassword(AppUser u, string attempt)
{
    var result = hasher.VerifyHashedPassword(u, u.PasswordHash!, attempt);
    if (result == PasswordVerificationResult.SuccessRehashNeeded)
        u.PasswordHash = hasher.HashPassword(u, attempt);   // quietly upgrade old hashes (then save)
    return result != PasswordVerificationResult.Failed;
}

// --- Random values: always the cryptographic generator ---
string resetToken = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));   // 256 bits
int sixDigitCode  = RandomNumberGenerator.GetInt32(0, 1_000_000);              // 000000-999999
byte[] aesKey     = RandomNumberGenerator.GetBytes(32);                         // keep in a vault

// --- HMAC: prove a webhook came from someone who knows the shared secret ---
static bool IsGenuineWebhook(string rawBody, string signatureHex, byte[] sharedSecret)
{
    byte[] expected = HMACSHA256.HashData(sharedSecret, Encoding.UTF8.GetBytes(rawBody));

    byte[] given;
    try { given = Convert.FromHexString(signatureHex); }
    catch (FormatException) { return false; }

    // Takes the same time wherever the first difference is.
    return CryptographicOperations.FixedTimeEquals(expected, given);
}

// --- Small values your own app reads back: let Data Protection manage the keys ---
// builder.Services.AddDataProtection();
public class InviteTokens(Microsoft.AspNetCore.DataProtection.IDataProtectionProvider provider)
{
    private readonly Microsoft.AspNetCore.DataProtection.IDataProtector _protector =
        provider.CreateProtector("Invites.v1");          // purpose string separates uses

    public string Create(string email) => _protector.Protect(email);      // encrypted and signed
    public string Read(string token)   => _protector.Unprotect(token);    // throws if altered
}` },
    { lang: 'csharp', title: 'Fixed: AES-GCM encryption and an ECDSA signature', code: `using System.Security.Cryptography;
using System.Text;

public static class FieldCrypto
{
    private const int NonceSize = 12;   // bytes, standard for GCM
    private const int TagSize = 16;     // bytes

    // key: 32 random bytes loaded from a vault, never from source code.
    // context: something that identifies the record, e.g. "customer:42:iban".
    public static byte[] Encrypt(byte[] key, string plaintext, string context)
    {
        byte[] nonce = RandomNumberGenerator.GetBytes(NonceSize);   // new for EVERY encryption
        byte[] plain = Encoding.UTF8.GetBytes(plaintext);
        byte[] cipher = new byte[plain.Length];
        byte[] tag = new byte[TagSize];

        using var aes = new AesGcm(key, TagSize);
        aes.Encrypt(nonce, plain, cipher, tag, Encoding.UTF8.GetBytes(context));

        // Store nonce + tag + ciphertext together. Nonce and tag are not secret.
        return [.. nonce, .. tag, .. cipher];
    }

    public static string Decrypt(byte[] key, byte[] blob, string context)
    {
        ReadOnlySpan<byte> nonce = blob.AsSpan(0, NonceSize);
        ReadOnlySpan<byte> tag = blob.AsSpan(NonceSize, TagSize);
        ReadOnlySpan<byte> cipher = blob.AsSpan(NonceSize + TagSize);
        byte[] plain = new byte[cipher.Length];

        using var aes = new AesGcm(key, TagSize);
        // Throws CryptographicException if the data, the tag or the context was changed.
        // Never catch that and carry on: treat it as tampering.
        aes.Decrypt(nonce, cipher, tag, plain, Encoding.UTF8.GetBytes(context));
        return Encoding.UTF8.GetString(plain);
    }
}

// --- Digital signature: sign with the private key, verify with the public key ---
using var signer = ECDsa.Create(ECCurve.NamedCurves.nistP256);
byte[] release = File.ReadAllBytes("app-1.4.2.zip");

byte[] signature = signer.SignData(release, HashAlgorithmName.SHA256);
string publicKeyPem = signer.ExportSubjectPublicKeyInfoPem();    // safe to publish

using var verifier = ECDsa.Create();
verifier.ImportFromPem(publicKeyPem);
bool genuine = verifier.VerifyData(release, signature, HashAlgorithmName.SHA256);
Console.WriteLine(genuine ? "File is authentic and unchanged" : "Do NOT install this file");` }
  ],
  pitfalls: [
    `Calling Base64 or hex "encryption". Encoding has no key and anyone can reverse it.`,
    `Hashing passwords with MD5, SHA-1 or plain SHA-256. These are fast by design. Use a slow, salted password hash through the framework.`,
    `Encrypting passwords instead of hashing them. If the key leaks, every password leaks. The server never needs to read a password back.`,
    `Using System.Random or a Guid for tokens, codes or keys. They are not made to be unpredictable. Use RandomNumberGenerator.`,
    `Reusing a nonce with the same AES-GCM key, or using ECB mode. Both leak information even though the output looks random.`,
    `Keeping keys in source code, config files or the same database as the encrypted data. A stolen backup then contains the lock and the key.`
  ],
  checklist: [
    `Store passwords only as slow, salted hashes using PasswordHasher, Argon2id or bcrypt.`,
    `Search the codebase for MD5, SHA1, DES, ECB and new Random( and review every security-related use.`,
    `Generate tokens, codes, salts, nonces and keys with RandomNumberGenerator.`,
    `Encrypt with an authenticated mode such as AES-GCM and use a fresh nonce for every encryption.`,
    `Compare MACs, tokens and hashes with CryptographicOperations.FixedTimeEquals.`,
    `Load keys from a vault or key management service, never from source code or plain config.`,
    `Store a key id with each ciphertext and have a tested plan to rotate keys.`,
    `Use different keys for different purposes and for each environment.`,
    `Limit password length to a sensible maximum before hashing to avoid wasted CPU.`,
    `Use library defaults and standard algorithms; do not design your own scheme.`
  ],
  quiz: [
    { q: `A config file contains "cGFzc3dvcmQxMjM=" as the database password. A colleague says it is encrypted. What is true?`, options: ['It is safely encrypted with AES and needs the key', 'It is Base64 encoding and anyone can decode it', 'It is a salted hash that cannot be turned back', 'It is a digital signature made with a private key'], answer: 1, why: `Base64 is an encoding. It has no key and is reversed in one step. The secret is effectively stored in plain text.` },
    { q: `Why is SHA-256 alone a poor choice for storing passwords?`, options: ['Its 256-bit output is too short for passwords', 'It is very fast, so stolen hashes can be guessed quickly', 'It can be decrypted by anyone who finds the right key', 'It gives a different result on each server that runs it'], answer: 1, why: `SHA-256 is a fine general hash, but speed helps the attacker here. Password hashes must be slow on purpose and salted.` },
    { q: `What is the job of a salt?`, options: ['To make the hash reversible when a user forgets a password', 'To act as a secret key that must be hidden from attackers', 'To make equal passwords give different stored hashes', 'To shorten the hash so that it takes less space'], answer: 2, why: `A salt is random and unique per user, and it is stored openly next to the hash. It does not need to be secret to do its job.` },
    { q: `You must verify that a payment webhook really came from the provider and was not changed. Which tool fits?`, options: ['Base64 encoding of the body and headers', 'HMAC of the body with a shared secret', 'MD5 hash of the body sent in a header', 'AES-ECB encryption of the body'], answer: 1, why: `An HMAC can only be produced by someone who knows the shared secret, and it changes if the body changes. A plain hash can be recomputed by anyone.` },
    { q: `In AES-GCM, what must be different for every encryption done with the same key?`, options: ['The key length', 'The nonce', 'The tag size', 'The plaintext length'], answer: 1, why: `Reusing a nonce with the same key breaks the security of GCM. Generate a new random 12-byte nonce each time and store it with the ciphertext.` },
    { q: `Which statement about digital signatures is correct?`, options: ['You sign with the public key and verify with the private key', 'You sign with the private key and verify with the public key', 'Signatures keep the message secret from everyone but the receiver', 'Signatures need a password shared by the sender and the receiver'], answer: 1, why: `Only the holder of the private key can sign. Everyone can check with the public key. A signature proves origin and integrity; it does not hide the content.` }
  ],
  takeaways: [
    `Encoding changes format, hashing makes a one-way fingerprint, encryption keeps secrets with a key, signatures prove who sent it.`,
    `Passwords get a slow, salted hash. Never a fast hash, never encryption, never plain text.`,
    `Use AES-GCM for data, HMAC-SHA256 for integrity with a shared secret, and ECDSA or RSA-PSS for signatures.`,
    `Security values must come from RandomNumberGenerator, and secret comparisons must be fixed-time.`,
    `The algorithm is rarely what fails. Keys in the wrong place, reused nonces and wrong tool choice are what fail.`,
    `Never invent your own crypto. Standard algorithms, standard libraries, default settings.`
  ],
  interview: [
    { q: 'What is the difference between hashing and encryption?', a: `<p>Hashing is one-way and has no key. It produces a fixed-size fingerprint and is used to check integrity and to store passwords. Encryption is two-way and needs a key. It is used when the original data must be read again later. Passwords are hashed because the server only needs to check them, never to read them back.</p>` },
    { q: 'How should passwords be stored?', a: `<p>With a password hashing algorithm that is slow by design, such as Argon2id, bcrypt, scrypt or PBKDF2 with a high iteration count, and with a random salt unique to each user. The salt and settings are stored with the hash. The work factor is raised over time and old hashes are upgraded at login. In ASP.NET Core this is what PasswordHasher does.</p>` },
    { q: 'Why does HTTPS use both asymmetric and symmetric encryption?', a: `<p>Asymmetric crypto solves the problem of strangers agreeing on a secret and proving identity, but it is slow. Symmetric crypto is fast but needs a shared key. So TLS uses a certificate and signature to prove the server's identity, a key exchange to agree on a temporary session key, and then a fast authenticated symmetric cipher for the actual data.</p>` },
    { q: 'What goes wrong if a nonce is reused in AES-GCM?', a: `<p>Two messages encrypted with the same key and nonce leak the XOR of their plaintexts, and the attacker can also learn enough to forge valid tags. In practice the confidentiality and integrity guarantees are both lost for that key. The fix is a fresh random 12-byte nonce for each encryption and rotating the key before the number of messages gets very large.</p>` },
    { q: 'Where should encryption keys live?', a: `<p>In a dedicated key management service or vault, accessed with the app's own identity, never in source code or plain configuration. Data is usually protected with envelope encryption: a data key encrypts the data and a master key in the vault encrypts the data key. Keys are separated by purpose and environment, rotated on a schedule, and access to them is logged.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-authn — Authentication: Passwords, MFA, Passkeys & Sessions      */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-authn'] = {
  hook: `A password is a secret that two parties know. Every safe login system starts by admitting how easily that secret leaks.`,
  intro: `<p><span class="term">Authentication</span> answers one question: <em>who are you?</em> It is the front door of your app. If it is weak, nothing behind it matters, because the attacker simply walks in as a real user.</p>
<p>For decades the answer was a password. But people reuse passwords, pick short ones, type them into fake pages, and companies leak them by the million. So a modern login system assumes that passwords <em>will</em> be stolen and adds more layers: limits on guessing, a second proof of identity, and now <span class="term">passkeys</span>, which remove the shared secret completely.</p>
<p>Authentication does not end when the user clicks "Sign in". After login the server gives the browser a <span class="term">session</span>, usually a cookie holding a random id. Whoever holds that cookie <em>is</em> the user until it expires. So protecting the session is as important as protecting the password.</p>
<p>In this lesson you learn how to build each part safely: sign-up, login, password reset, a second factor, passkeys and sessions. The good news for .NET developers is that ASP.NET Core Identity already does most of it. Your job is to configure it well and not to work around it.</p>`,
  realLife: {
    title: 'The ATM, the passport desk and the hotel key card',
    body: `<p>At an ATM you need two things: the card (something you <em>have</em>) and the PIN (something you <em>know</em>). A thief who sees your PIN still needs the card. A thief who steals the card still needs the PIN. That is two-factor authentication, and you have used it for years.</p>
<p>At the airport the officer compares your face (something you <em>are</em>) with the photo in the passport (something you have). Three kinds of proof exist, and strong systems combine at least two.</p>
<p>After check-in at a hotel you get a key card. You do not show your passport at every door. The card is your <strong>session</strong>. If you lose it, whoever finds it can open your room until the hotel cancels it. So the hotel makes cards expire at checkout and can cancel one at the front desk.</p>
<p><strong>How this showed up in the real world:</strong> in 2023 the genetic testing company 23andMe reported that attackers had logged in to thousands of customer accounts. No password database of the company had been stolen. The attackers used email and password pairs leaked from <em>other</em> websites, because people had reused them, and the accounts had no second factor. Through a sharing feature, data about millions of other customers became visible from those accounts. This attack is called credential stuffing, and it is one of the most common attacks on any login page.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Three kinds of proof</h4>
<ul>
<li><strong>Something you know:</strong> password, PIN.</li>
<li><strong>Something you have:</strong> phone, security key, bank card.</li>
<li><strong>Something you are:</strong> fingerprint, face.</li>
</ul>
<p><span class="term">Multi-factor authentication (MFA)</span> means using two or more <em>different</em> kinds. A password plus a security question is not MFA; both are things you know.</p>
<h4>Storing passwords</h4>
<p>The server never stores the password itself. It stores a slow, salted hash (see the cryptography lesson). At login it hashes the attempt the same way and compares. If your database is stolen, the attacker still has to guess each password slowly.</p>
<h4>A modern password policy</h4>
<p>Old rules ("one capital, one symbol, change every 60 days") produced passwords like <code>Summer2024!</code>, which are easy to guess. Current guidance, for example from NIST, is simpler:</p>
<ul>
<li><strong>Length matters most.</strong> Require a decent minimum, such as 12 characters, and allow long passphrases (64 characters or more).</li>
<li><strong>No forced mix of character types.</strong></li>
<li><strong>No forced regular change.</strong> Change only when there is a sign of compromise.</li>
<li><strong>Block known-bad passwords.</strong> Reject passwords that appear in public breach lists and obvious ones like the app name.</li>
<li><strong>Allow paste and password managers.</strong> Never block them.</li>
</ul>
<h4>A safe login, at a glance</h4>
<ol>
<li>The form is sent over HTTPS only.</li>
<li>The server checks the password against the stored hash.</li>
<li>On failure the message is always the same: "Email or password is incorrect." Never say which one was wrong.</li>
<li>Too many failures slow the attacker down (limits and temporary lockout).</li>
<li>On success the server asks for the second factor if one is set up.</li>
<li>The server creates a new session and sends it in a protected cookie.</li>
</ol>
<div class="callout tip">The single most valuable step you can offer users is a second factor. Even a basic one stops the great majority of attacks that use stolen passwords.</div>
<h4>What a session is</h4>
<p>HTTP has no memory. Each request arrives alone. So after login the server creates a long random <span class="term">session id</span>, remembers which user it belongs to, and sends it to the browser in a cookie. The browser returns the cookie with every request. That cookie is now as powerful as the password, so it must be hard to steal and must not live forever.</p>` },
    { name: 'Intermediate', body: `<h4>Three attacks on the login page</h4>
<table>
<thead><tr><th>Attack</th><th>How it works</th><th>Main defences</th></tr></thead>
<tbody>
<tr><td><span class="term">Brute force</span></td><td>Many passwords tried against one account</td><td>Lockout or growing delays per account, rate limits</td></tr>
<tr><td><span class="term">Credential stuffing</span></td><td>Leaked email and password pairs from other sites tried on yours</td><td>MFA, breached-password checks, rate limits per address and device, bot detection</td></tr>
<tr><td><span class="term">Password spraying</span></td><td>One common password tried against many accounts, slowly</td><td>Block common passwords, watch failure counts across accounts, MFA</td></tr>
</tbody>
</table>
<p>Lockout needs care. If five wrong attempts lock an account for a day, an attacker can lock out any user on purpose. Prefer short lockouts (minutes), growing delays, and a CAPTCHA after a few failures.</p>
<h4>Ranking the second factors</h4>
<table>
<thead><tr><th>Factor</th><th>Strength</th><th>Weak point</th></tr></thead>
<tbody>
<tr><td>SMS code</td><td>Weakest, still better than none</td><td>SIM swap, can be phished</td></tr>
<tr><td>Authenticator app code (TOTP)</td><td>Good</td><td>Can be phished on a fake page</td></tr>
<tr><td>Push approval</td><td>Good with number matching</td><td>Prompt flooding if not limited</td></tr>
<tr><td>Passkey or hardware security key</td><td>Strongest</td><td>Needs a recovery plan if the device is lost</td></tr>
</tbody>
</table>
<p><span class="term">TOTP</span> means time-based one-time password: the app and the server share a secret and both compute a 6-digit code from it and the current time. Always give users <strong>recovery codes</strong> when they enable MFA, shown once and stored hashed.</p>
<h4>Password reset is a second login door</h4>
<p>Attackers love reset flows because they skip the password. Rules: the same reply whether the account exists or not, a long random single-use token that expires in minutes, rate limits, and after a reset end every session and notify the user. Security questions ("mother's maiden name") are weak; do not use them.</p>
<h4>Session rules</h4>
<ul>
<li><strong>Cookie flags:</strong> <code>HttpOnly</code> (scripts cannot read it), <code>Secure</code> (HTTPS only), <code>SameSite=Lax</code> or <code>Strict</code> (not sent on most cross-site requests).</li>
<li><strong>New id at login.</strong> Always issue a fresh session at sign-in and at every privilege change. Reusing a pre-login id allows <span class="term">session fixation</span>, where the attacker plants an id and waits for the victim to log in with it.</li>
<li><strong>Two timeouts:</strong> an idle timeout (for example 30 minutes without activity) and an absolute timeout (for example 8 hours or a few days) after which login is required again.</li>
<li><strong>Real logout:</strong> remove the session on the server, not only the cookie in the browser.</li>
<li><strong>Sign out everywhere</strong> after a password change or reset. In ASP.NET Core Identity this is done by updating the user's <code>SecurityStamp</code>.</li>
</ul>
<div class="callout warn">Do not write your own login system if a mature one fits. ASP.NET Core Identity, or an identity provider such as Microsoft Entra ID, already handles hashing, lockout, tokens and MFA. Home-made systems usually miss one of the rules above.</div>` },
    { name: 'Expert', body: `<h4>Passkeys and WebAuthn in plain words</h4>
<p>A <span class="term">passkey</span> replaces the shared secret with a key pair. When you register, your device creates a private key and a public key <em>for that one website</em>. The site stores only the public key. To sign in, the site sends a random challenge. Your device asks for your fingerprint, face or PIN, signs the challenge with the private key, and sends the signature back. The site verifies it with the public key. The browser standard behind this is <span class="term">WebAuthn</span>.</p>
<ul>
<li><strong>Nothing to steal on the server:</strong> a leaked public key is useless.</li>
<li><strong>Nothing to phish:</strong> the browser ties each passkey to the real site address. A fake site gets no answer.</li>
<li><strong>Nothing to reuse:</strong> every site has its own key pair.</li>
<li><strong>Replay is useless:</strong> each challenge is random and single-use.</li>
</ul>
<p>Passkeys may sync through a platform account (convenient, recoverable) or stay on one hardware key (strongest, needs a backup key). The fingerprint or face never leaves the device; it only unlocks the private key locally.</p>
<h4>Recovery is the real weak spot</h4>
<p>An account is only as strong as its weakest way in. If login needs a passkey but "forgot everything" needs only an email link, then the email link is your real security level. Design recovery with the same care: several registered factors, recovery codes, waiting periods and notifications for high-value accounts, and a support process that cannot be talked around.</p>
<h4>Small leaks that enumerate users</h4>
<ul>
<li>Different messages or status codes for "unknown user" and "wrong password".</li>
<li>Different <em>response times</em>: skipping the slow hash for unknown users makes them answer faster. Run a dummy hash so timing matches.</li>
<li>Sign-up that says "email already registered". Send an email to the address instead.</li>
</ul>
<h4>Risk-based and step-up authentication</h4>
<p>Not every action needs the same proof. Reading a dashboard from a known device may need only the session. Changing payout details, viewing full card data or a login from a new country should trigger <span class="term">step-up</span>: ask for the second factor again, even inside a valid session. Signals include a new device, impossible travel, a known-bad address range and unusual time of day.</p>
<h4>Sessions at scale</h4>
<p>Server-side sessions (an id that points to a record in a store such as Redis) are easy to revoke. Self-contained tokens such as JWTs need no lookup but cannot be recalled before they expire, so they are kept short-lived and paired with a revocable refresh token. Whatever you choose, you need an answer to: "how do I end this user's access right now?".</p>
<h4>Other hard edges</h4>
<ul>
<li>Cap password length (for example 128 characters) before hashing, or a huge input becomes a CPU attack.</li>
<li>"Remember me" should be a separate, longer-lived, revocable token, and sensitive actions should still ask for credentials again.</li>
<li>Prefer federated login (OpenID Connect) for staff, so there is one strong identity to protect and one place to disable it.</li>
</ul>
<h4>What interviewers ask</h4>
<ul>
<li>How do you defend a login endpoint against credential stuffing?</li>
<li>What is session fixation and how do you prevent it?</li>
<li>Why are passkeys phishing-resistant?</li>
<li>How would you implement "sign out of all devices"?</li>
</ul>` }
  ],
  flow: {
    title: 'A safe sign-in, step by step',
    steps: [
      { title: 'Submit over HTTPS', desc: 'The browser sends email and password inside an encrypted connection. Nothing travels in the URL.' },
      { title: 'Rate limit check', desc: 'Before any work, the server checks how many attempts came from this address and for this account. Too many means 429, try later.' },
      { title: 'Verify the password', desc: 'The stored salted hash is loaded and the attempt is hashed the same slow way. For unknown users a dummy hash runs so the timing looks the same.' },
      { title: 'Count failures', desc: 'A wrong password increases the failure counter and may lock the account for a few minutes. The reply is always the same neutral message.' },
      { title: 'Second factor', desc: 'If the password is right, the server asks for the passkey, app code or other factor before it creates any session.' },
      { title: 'Issue a new session', desc: 'A fresh random session id is created. Any id from before login is thrown away, which blocks session fixation.' },
      { title: 'Set a protected cookie', desc: 'The id is sent with HttpOnly, Secure and SameSite flags and a limited lifetime.' },
      { title: 'Notify and record', desc: 'The login is logged. If the device is new, the user gets a message with a "this was not me" link.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: a hand-rolled login with six problems', code: `// Every line here "works". Count the problems before reading the comments.
app.MapPost("/login", async (LoginRequest req, AppDb db, HttpContext ctx) =>
{
    var user = await db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);

    // 1. Tells an attacker which emails are registered.
    if (user is null)
        return Results.NotFound("No such user");

    // 2. Fast, unsalted hash. A stolen table is cracked quickly.
    var hash = Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(req.Password)));

    // 3. A different message for a wrong password confirms the email is valid.
    // 4. No limit on attempts: guess as often as you like.
    if (user.PasswordHash != hash)
        return Results.BadRequest("Wrong password");

    // 5. The session value can be guessed (it is just the user id),
    //    and nothing was regenerated at login.
    // 6. No HttpOnly, no Secure, no SameSite, and it never expires.
    ctx.Response.Cookies.Append("session", user.Id.ToString(),
        new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(10) });

    return Results.Ok();
});` },
    { lang: 'csharp', title: 'Fixed: configure ASP.NET Core Identity instead of writing your own', code: `using Microsoft.AspNetCore.Identity;

builder.Services
    .AddIdentity<AppUser, IdentityRole>(o =>
    {
        // Length over complexity, in line with current guidance.
        o.Password.RequiredLength = 12;
        o.Password.RequireUppercase = false;
        o.Password.RequireLowercase = false;
        o.Password.RequireDigit = false;
        o.Password.RequireNonAlphanumeric = false;
        o.Password.RequiredUniqueChars = 5;

        // Short lockout slows guessing without letting attackers lock users out for long.
        o.Lockout.AllowedForNewUsers = true;
        o.Lockout.MaxFailedAccessAttempts = 5;
        o.Lockout.DefaultLockoutTimeSpan = TimeSpan.FromMinutes(10);

        o.User.RequireUniqueEmail = true;
        o.SignIn.RequireConfirmedEmail = true;
    })
    .AddEntityFrameworkStores<AppDb>()
    .AddDefaultTokenProviders()                         // reset tokens, email tokens, TOTP
    .AddPasswordValidator<CommonPasswordValidator>();    // your own extra rule, see below

builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.Name = "__Host-session";                   // prefix: Secure, path "/", no Domain
    o.Cookie.HttpOnly = true;                           // scripts cannot read it
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;  // HTTPS only
    o.Cookie.SameSite = SameSiteMode.Lax;               // not sent on most cross-site requests
    o.ExpireTimeSpan = TimeSpan.FromHours(8);           // lifetime of the login
    o.SlidingExpiration = true;                         // renewed while the user is active
    o.LoginPath = "/login";
});

// Cookies are re-checked against the user's SecurityStamp at this interval.
// Changing the stamp (password change, "sign out everywhere") ends old sessions.
builder.Services.Configure<SecurityStampValidatorOptions>(o =>
    o.ValidationInterval = TimeSpan.FromMinutes(5));

// Reject passwords everybody tries first. In production, also check a breached-password list.
public class CommonPasswordValidator : IPasswordValidator<AppUser>
{
    private static readonly HashSet<string> Blocked = new(StringComparer.OrdinalIgnoreCase)
        { "password1234", "qwertyuiop12", "123456789012", "letmein12345" };

    public Task<IdentityResult> ValidateAsync(UserManager<AppUser> manager, AppUser user, string? password)
    {
        bool bad = password is null
            || password.Length > 128                                  // cap before the slow hash
            || Blocked.Contains(password)
            || (user.Email is not null && password.Contains(user.Email.Split('@')[0], StringComparison.OrdinalIgnoreCase));

        return Task.FromResult(bad
            ? IdentityResult.Failed(new IdentityError { Code = "WeakPassword",
                Description = "Please choose a longer, less common password (12 to 128 characters)." })
            : IdentityResult.Success);
    }
}` },
    { lang: 'csharp', title: 'Fixed: login, second factor and "sign out everywhere" endpoints', code: `using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

// Assumes the user name is the email address.
app.MapPost("/account/login", async (
    LoginRequest req, SignInManager<AppUser> signIn, ILogger<Program> log) =>
{
    // Checks the slow hash, counts failures, applies lockout,
    // and issues a brand-new session cookie on success.
    var result = await signIn.PasswordSignInAsync(
        req.Email, req.Password, isPersistent: false, lockoutOnFailure: true);

    if (result.Succeeded) return Results.Ok(new { next = "home" });
    if (result.RequiresTwoFactor) return Results.Ok(new { next = "two-factor" });

    if (result.IsLockedOut) log.LogWarning("Login attempt on a locked account");

    // One message for unknown user, wrong password and lockout.
    return Results.Problem(statusCode: 401, title: "Email or password is incorrect.");
})
.AllowAnonymous()
.RequireRateLimiting("login");    // e.g. 10 attempts per minute per address

app.MapPost("/account/login/two-factor", async (TwoFactorRequest req, SignInManager<AppUser> signIn) =>
{
    var code = req.Code.Replace(" ", "").Replace("-", "");
    var result = await signIn.TwoFactorAuthenticatorSignInAsync(
        code, isPersistent: false, rememberClient: false);

    return result.Succeeded
        ? Results.Ok(new { next = "home" })
        : Results.Problem(statusCode: 401, title: "The code is incorrect or has expired.");
})
.AllowAnonymous()
.RequireRateLimiting("login");

app.MapPost("/account/logout", async (SignInManager<AppUser> signIn) =>
{
    await signIn.SignOutAsync();
    return Results.NoContent();
})
.RequireAuthorization();

// Ends every session of this user on every device.
app.MapPost("/account/logout-everywhere", async (
    ClaimsPrincipal principal, UserManager<AppUser> users, SignInManager<AppUser> signIn) =>
{
    var user = await users.GetUserAsync(principal);
    if (user is null) return Results.Unauthorized();

    await users.UpdateSecurityStampAsync(user);   // old cookies fail at their next validation
    await signIn.SignOutAsync();
    return Results.NoContent();
})
.RequireAuthorization();` }
  ],
  pitfalls: [
    `Different error messages for "unknown email" and "wrong password". One neutral message everywhere, including sign-up and reset.`,
    `Complex composition rules and forced monthly changes. They produce predictable passwords. Require length and block known-bad passwords instead.`,
    `No limit on login attempts, or a lockout so harsh that attackers can lock out real users on purpose.`,
    `Keeping the same session id before and after login. Always issue a fresh session at sign-in and after privilege changes.`,
    `Logout that only deletes the cookie in the browser. The session must also end on the server.`,
    `A strong login with a weak recovery path. Attackers choose the easiest door, and that is often "forgot password" or the support desk.`
  ],
  checklist: [
    `Use ASP.NET Core Identity or an identity provider instead of a hand-written login system.`,
    `Require at least 12 characters, allow long passphrases and paste, and block common and breached passwords.`,
    `Return one neutral error for unknown user, wrong password and locked account.`,
    `Rate limit login, sign-up and reset per account and per address, with short lockouts.`,
    `Offer MFA to all users, require it for admins, and prefer passkeys or security keys.`,
    `Issue a new session at login and set the cookie with HttpOnly, Secure and SameSite.`,
    `Set both an idle timeout and an absolute timeout for sessions.`,
    `End all sessions after a password change or reset and provide "sign out everywhere".`,
    `Ask for credentials again before sensitive actions such as changing email, MFA or payout details.`,
    `Notify users about new-device logins and security changes, with a "this was not me" link.`
  ],
  quiz: [
    { q: `Attackers try email and password pairs leaked from another website on your login page. What is this called, and what stops it best?`, options: ['SQL injection; parameterized queries for every statement', 'Credential stuffing; MFA and breached-password checks', 'Session fixation; a new session id issued at every login', 'Clickjacking; headers that block framing'], answer: 1, why: `Reused passwords are the cause. A second factor makes a stolen password insufficient, and breached-password checks stop users from choosing passwords that are already public.` },
    { q: `Which password rule follows current guidance?`, options: ['Must be changed every 30 days, and old ones cannot be reused', 'Exactly 8 characters with a capital letter, a digit and a symbol', 'At least 12 characters, with common passwords blocked', 'Pasting into the password field is disabled to stop robots'], answer: 2, why: `Length and blocking known-bad passwords help most. Forced changes and composition rules lead to predictable patterns, and blocking paste hurts password manager users.` },
    { q: `What is session fixation?`, options: ['A session that never expires, so a stolen cookie works forever', 'An attacker plants a session id that the victim then logs in with', 'Two users sharing one account, so their sessions get mixed up', 'A cookie without the Secure flag being read on an open network'], answer: 1, why: `If the id stays the same across login, an id planted by the attacker becomes an authenticated session. Issuing a new id at login prevents it.` },
    { q: `Why can a passkey not be phished the way a one-time code can?`, options: ['It is far longer than a code, so nobody can type it by mistake', 'It only answers a challenge from the real site address', 'It is sent by SMS to the phone number on file', 'It changes every 30 seconds, faster than a fake page can react'], answer: 1, why: `There is no secret the user can type into a fake page. The browser checks the site address before the device signs anything.` },
    { q: `A user changes their password because they suspect a break-in. What should the server do with existing sessions?`, options: ['Keep them so the user is not disturbed', 'End all of them on every device', 'Extend them by 24 hours', 'Only end sessions older than a week'], answer: 1, why: `An attacker who is already signed in would otherwise stay signed in. Updating the security stamp in ASP.NET Core Identity invalidates the old cookies.` },
    { q: `Login for unknown emails returns in 5 ms, and for known emails in 250 ms. Why is that a problem?`, options: ['The slower replies waste CPU for every real customer', 'The timing gap reveals which emails are registered', 'The fast replies arrive before the cookie can be set', 'It is not a problem, because both replies are correct'], answer: 1, why: `The slow hash runs only for existing users, so response time leaks account existence. Running a dummy hash for unknown users evens out the timing.` }
  ],
  takeaways: [
    `Authentication proves who someone is. Assume passwords will leak and add layers on top.`,
    `Store slow salted hashes, require length, block known-bad passwords, and never reveal whether an account exists.`,
    `Limit guessing with rate limits and short lockouts.`,
    `A second factor stops most stolen-password attacks. Passkeys and security keys are the strongest because they cannot be phished.`,
    `The session cookie is as powerful as the password: new id at login, protected flags, two timeouts, real logout.`,
    `Recovery and reset flows are login doors too. Protect them just as carefully.`
  ],
  interview: [
    { q: 'How would you protect a login endpoint against credential stuffing?', a: `<p>Offer and encourage MFA, ideally passkeys. Reject passwords found in breach lists at sign-up and password change. Rate limit by account, address and device, and add bot detection or a CAPTCHA after failures. Use neutral error messages, monitor failure rates across accounts, and notify users of logins from new devices.</p>` },
    { q: 'Explain session fixation and its fix.', a: `<p>The attacker obtains a valid pre-login session id and gets the victim's browser to use it, for example through a link. If the application keeps the same id after the victim signs in, the attacker now holds an authenticated session. The fix is to issue a new session id on login and on any privilege change, and to accept session ids only from cookies.</p>` },
    { q: 'How do passkeys work?', a: `<p>At registration the device creates a key pair for that site and gives the site the public key. At login the site sends a random challenge, the user unlocks the device with a fingerprint, face or PIN, and the device signs the challenge with the private key. The site verifies the signature. The private key is never sent to the site and the browser only uses it for the real site address, so there is nothing to phish or leak.</p>` },
    { q: 'How would you implement "sign out of all devices"?', a: `<p>With server-side sessions, delete all session records for the user. With cookie authentication in ASP.NET Core Identity, update the user's security stamp so existing cookies fail validation. With tokens, revoke all refresh tokens and keep access tokens short-lived, or check a per-user "valid after" time. The same mechanism should run automatically after a password reset.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-authz — Authorization & Access Control: RBAC, ABAC & IDOR        */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-authz'] = {
  hook: `Logging in proves who you are. It says nothing about what you may touch. Most real break-ins of web apps happen in that gap.`,
  intro: `<p><span class="term">Authentication</span> asks "who are you?". <span class="term">Authorization</span> asks the next question: "are <em>you</em> allowed to do <em>this</em> to <em>that</em>?". Every request to your server needs an answer to both.</p>
<p>Authorization is where web applications fail most often. In the OWASP Top 10, the best-known list of web risks, <strong>Broken Access Control</strong> holds first place. The reason is simple. Authentication is built once, in one place. Authorization must be right in <em>every</em> endpoint, for <em>every</em> object, and a single forgotten check is enough.</p>
<p>The most common form of the bug has a clumsy name: <span class="term">IDOR</span>, insecure direct object reference. API people call it <span class="term">BOLA</span>, broken object level authorization. It means: the app shows or changes a record because you supplied its id, without checking that the record is yours. Change <code>/orders/1041</code> to <code>/orders/1042</code> and you see someone else's order.</p>
<p>In this lesson you learn the common models (roles, claims, policies, attributes), how to enforce them in ASP.NET Core, how to close IDOR for good, and how to structure your code so a missing check is hard to write.</p>`,
  realLife: {
    title: 'The hotel key card',
    body: `<p>You arrive at a hotel. At the front desk you show your passport. That is authentication. Then you receive a key card. It opens your room, the gym and the main door. It does not open other rooms, the kitchen or the manager's office. That is authorization: the same building, different rights for each person.</p>
<p>The cleaner's card opens every room on one floor, but only during the day shift. The manager's card opens almost everything. These are <strong>roles</strong>. And the rule "only between 8 and 16" is an <strong>attribute</strong> of the situation, not of the person.</p>
<p>Now imagine a faulty hotel where every door opens for any valid card, and the only thing stopping you is the room number printed on the card sleeve. Any guest could walk into any room by trying the next door. That is exactly what an IDOR is.</p>
<p><strong>How this showed up in the real world:</strong> in 2019 a large US title insurance company, First American, was found to expose hundreds of millions of customer documents. Each document had a web address ending in a number. Changing the number showed another customer's document, with no check of who was asking. No password was cracked. The door simply opened for every card.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Two different questions</h4>
<table>
<thead><tr><th></th><th>Authentication (AuthN)</th><th>Authorization (AuthZ)</th></tr></thead>
<tbody>
<tr><td>Question</td><td>Who are you?</td><td>What may you do?</td></tr>
<tr><td>Proof</td><td>Password, passkey, token</td><td>Roles, permissions, ownership</td></tr>
<tr><td>HTTP status when it fails</td><td>401 Unauthorized ("log in first")</td><td>403 Forbidden ("you may not")</td></tr>
<tr><td>Happens</td><td>Once per session or token</td><td>On every single request</td></tr>
</tbody>
</table>
<h4>Roles: the simplest model</h4>
<p><span class="term">Role-based access control (RBAC)</span> groups permissions into roles such as Customer, Support, Finance and Admin. Users get roles. Code checks roles. It is easy to understand and enough for many apps.</p>
<h4>Two levels of checks</h4>
<ul>
<li><strong>Function level:</strong> may this user call this endpoint at all? "Only Finance may issue refunds."</li>
<li><strong>Object level:</strong> may this user touch <em>this particular record</em>? "You may view orders, but only your own."</li>
</ul>
<p>Teams usually remember the first and forget the second. A role check says nothing about <em>which</em> order.</p>
<h4>IDOR in one example</h4>
<p>Your app has a page <code>/api/orders/1041</code>. Asha is logged in and it shows her order. She changes the number to <code>1042</code>. If the server answers with Ravi's order, you have an IDOR. The server trusted the id from the request and never asked "does order 1042 belong to Asha?".</p>
<h4>Three rules that prevent most problems</h4>
<ol>
<li><strong>Deny by default.</strong> Everything is forbidden unless a rule allows it. A new endpoint should be locked until someone opens it on purpose.</li>
<li><strong>Check on the server, every time.</strong> Hiding a button in Angular is good design, not security. The API must refuse the request itself.</li>
<li><strong>Take identity from the login, never from the request.</strong> The user id, role and tenant come from the verified session or token. Never from a field in the body, a query string or a hidden input.</li>
</ol>
<div class="callout warn">If your API accepts <code>userId</code> or <code>role</code> as a parameter and believes it, any user can act as any other user. The server already knows who is calling. Use that.</div>
<h4>Two directions of escalation</h4>
<ul>
<li><span class="term">Horizontal</span>: reaching data of another user at the same level. Asha reads Ravi's orders.</li>
<li><span class="term">Vertical</span>: gaining a higher level. A customer calls an admin endpoint.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>The ASP.NET Core toolbox</h4>
<ul>
<li><strong><code>[Authorize]</code> / <code>RequireAuthorization()</code></strong>: must be logged in.</li>
<li><strong>Roles:</strong> <code>[Authorize(Roles = "Finance")]</code>.</li>
<li><span class="term">Claims</span>: facts about the user carried in the session or token, such as <code>department=billing</code> or <code>mfa=true</code>.</li>
<li><span class="term">Policies</span>: named rules built from roles, claims or custom code. Endpoints refer to the policy name, so the rule lives in one place.</li>
<li><strong>Fallback policy:</strong> the rule for every endpoint that says nothing. Set it to "authenticated user" and you have deny by default. Public endpoints then need an explicit <code>AllowAnonymous()</code>.</li>
<li><strong>Resource-based authorization:</strong> an <code>IAuthorizationHandler</code> that receives the user <em>and</em> the loaded object, and decides. This is the proper home for "is this yours?".</li>
</ul>
<h4>Two ways to close an IDOR</h4>
<p><strong>1. Put ownership in the query.</strong> Instead of "find order 1042", ask "find order 1042 <em>where owner is the current user</em>". Someone else's order is simply not found.</p>
<p><strong>2. Load, then authorize.</strong> Load the object, pass it with the user to <code>IAuthorizationService.AuthorizeAsync</code>, and continue only on success. Use this when the rule is richer than plain ownership (owner or auditor, only while the order is open, and so on).</p>
<p>Both are fine. What matters is that every endpoint that takes an id does one of them.</p>
<h4>404 or 403?</h4>
<p>When a user asks for an object that exists but is not theirs, returning <strong>404 Not Found</strong> is often better than 403. A 403 confirms that the id exists, which helps someone mapping your data.</p>
<h4>Other places authorization hides</h4>
<ul>
<li><strong>Lists and search:</strong> filters must be applied on the server. <code>/api/orders?customerId=7</code> must not let the caller choose the customer.</li>
<li><strong>Updates:</strong> check ownership on PUT, PATCH and DELETE, not only on GET.</li>
<li><strong>Nested ids:</strong> in <code>/customers/7/orders/1042</code> check that order 1042 really belongs to customer 7 and that customer 7 is the caller.</li>
<li><strong>Mass assignment:</strong> if the update model includes <code>IsAdmin</code> or <code>OwnerId</code>, a user can set them. Bind to a DTO that contains only the fields a user may change.</li>
<li><strong>Files and exports:</strong> a download link needs the same checks as the page that shows the link.</li>
</ul>
<div class="callout tip">Unpredictable ids such as GUIDs make guessing harder, and that is a useful extra layer. They are not a fix. Ids leak through emails, logs, screenshots and referrer headers. The check must exist anyway.</div>
<h4>Angular's part</h4>
<p>Route guards and hidden buttons give a clean experience: users do not see what they cannot use. But everything in the browser can be changed by the user. Treat frontend checks as presentation and let the API be the judge.</p>` },
    { name: 'Expert', body: `<h4>Beyond roles</h4>
<table>
<thead><tr><th>Model</th><th>Decision is based on</th><th>Fits when</th></tr></thead>
<tbody>
<tr><td>RBAC</td><td>The user's roles</td><td>A small, stable set of job functions</td></tr>
<tr><td><span class="term">ABAC</span> (attribute-based)</td><td>Attributes of user, resource, action and context: department, owner, amount, time, device</td><td>Rules like "managers approve expenses under 5000 in their own department"</td></tr>
<tr><td><span class="term">ReBAC</span> (relationship-based)</td><td>Relationships in a graph: "editor of the folder that contains this document"</td><td>Sharing and collaboration, nested teams and folders</td></tr>
</tbody>
</table>
<p>Roles tend to multiply ("Manager-EU-ReadOnly-Temp") when they are stretched to cover attribute rules. When that happens, move the rules into policies or a policy engine and keep roles few. Whichever model you choose, keep decisions in <strong>one central place</strong>, not as scattered <code>if</code> statements.</p>
<h4>Multi-tenant isolation</h4>
<p>In a product serving many companies, the worst bug is one tenant seeing another's data. Defend in layers:</p>
<ul>
<li>The tenant id comes from the token or session, never from the request.</li>
<li>An EF Core <span class="term">global query filter</span> adds the tenant condition to every query automatically, so a developer cannot forget it.</li>
<li>Row-level security in the database, or a database or schema per tenant, as a second wall.</li>
<li>Automated tests that sign in as tenant A and request tenant B's ids across all endpoints.</li>
</ul>
<h4>Stale permissions</h4>
<p>Roles baked into a token or cookie stay valid until it expires. If you remove someone's admin role, their existing token may still say "Admin" for an hour. Keep tokens short-lived, re-validate on a short interval, or check high-risk permissions against the database at the moment of use.</p>
<h4>The confused deputy</h4>
<p>A service with broad rights acts for a user with narrow rights. If the service uses <em>its own</em> rights to fetch what the user asked for, the user gets data they should not have. Background jobs, report generators and internal APIs are typical deputies. Pass the user's identity along and authorize against it at every hop.</p>
<h4>Testing authorization</h4>
<p>Scanners find this class of bug poorly, because they do not know your business rules. What works:</p>
<ul>
<li>An <strong>authorization matrix</strong>: a table of roles against endpoints with the expected result, run as automated tests.</li>
<li>For every endpoint with an id: a test with another user's id that must fail.</li>
<li>A test that lists all routes and fails the build if any has no authorization metadata and is not explicitly marked public.</li>
</ul>
<h4>Design principles to carry with you</h4>
<ul>
<li><strong>Least privilege:</strong> give the minimum rights needed, for the shortest time.</li>
<li><strong>Separation of duties:</strong> the person who creates a payment does not approve it.</li>
<li><strong>Audit:</strong> log who did what to which object, including denied attempts.</li>
</ul>
<h4>What interviewers ask</h4>
<ul>
<li>What is an IDOR and how do you prevent it systematically?</li>
<li>Roles versus policies versus resource-based checks: when do you use each?</li>
<li>How do you guarantee tenant isolation?</li>
<li>Why is hiding a menu item not access control?</li>
</ul>` }
  ],
  flow: {
    title: 'One request passing through the access control gates',
    steps: [
      { title: 'Request arrives', desc: 'GET /api/documents/8f3a... with a session cookie. The id in the URL is chosen by the caller and proves nothing.' },
      { title: 'Authenticate', desc: 'Middleware validates the cookie or token and builds the user identity with its claims. No valid identity means 401.' },
      { title: 'Fallback policy', desc: 'The endpoint has no AllowAnonymous, so the default rule applies: an authenticated user is required. Deny by default.' },
      { title: 'Function-level policy', desc: 'May this user call this kind of endpoint at all? For example, the "CanReadDocuments" policy checks a role or claim. Failure means 403.' },
      { title: 'Load within the tenant', desc: 'The query runs with a global filter on the tenant id taken from the token. Documents of other companies cannot be loaded at all.' },
      { title: 'Object-level check', desc: 'A resource handler compares the document with the user: owner, or an allowed role for this action. Not allowed is answered as 404.' },
      { title: 'Act and record', desc: 'The action runs and an audit entry records who did what to which document. Denied attempts are logged too.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: IDOR, a trusted user id and mass assignment', code: `// 1. IDOR: any logged-in user can read any document by changing the id.
app.MapGet("/api/documents/{id:int}", async (int id, AppDb db) =>
    await db.Documents.FindAsync(id) is { } doc ? Results.Ok(doc) : Results.NotFound())
   .RequireAuthorization();     // "logged in" is checked. "is it yours?" is not.

// 2. The caller decides whose data to list.
app.MapGet("/api/documents", async (int userId, AppDb db) =>
    await db.Documents.Where(d => d.OwnerId == userId).ToListAsync())
   .RequireAuthorization();     // /api/documents?userId=7  -> someone else's list

// 3. Mass assignment: the whole entity is bound from the request body.
//    A user can send  { "ownerId": 7 }  or  { "isAdmin": true }.
app.MapPut("/api/users/{id:int}", async (int id, User incoming, AppDb db) =>
{
    var user = await db.Users.FindAsync(id);          // also an IDOR: any id
    if (user is null) return Results.NotFound();
    db.Entry(user).CurrentValues.SetValues(incoming); // copies EVERY property
    await db.SaveChangesAsync();
    return Results.NoContent();
}).RequireAuthorization();

// 4. An admin function protected only by the fact that the menu hides it.
app.MapDelete("/api/admin/users/{id:int}", async (int id, AppDb db) =>
{
    await db.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
    return Results.NoContent();
}).RequireAuthorization();      // no role, no policy: every user is an "admin"` },
    { lang: 'csharp', title: 'Fixed: deny by default, policies and a resource-based handler', code: `using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Infrastructure;

// --- Program.cs: rules live in one place ---
builder.Services.AddAuthorizationBuilder()
    // Deny by default: every endpoint needs a logged-in user unless it says AllowAnonymous().
    .SetFallbackPolicy(new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build())
    .AddPolicy("ManageUsers", p => p.RequireRole("Admin").RequireClaim("mfa", "true"))
    .AddPolicy("IssueRefunds", p => p.RequireRole("Finance"));

builder.Services.AddScoped<IAuthorizationHandler, DocumentAccessHandler>();

// --- The "is this yours?" rule, written once ---
public static class DocumentOps
{
    public static readonly OperationAuthorizationRequirement Read = new() { Name = nameof(Read) };
    public static readonly OperationAuthorizationRequirement Edit = new() { Name = nameof(Edit) };
}

public class DocumentAccessHandler : AuthorizationHandler<OperationAuthorizationRequirement, Document>
{
    protected override Task HandleRequirementAsync(
        AuthorizationHandlerContext context, OperationAuthorizationRequirement requirement, Document doc)
    {
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        bool isOwner = userId is not null && doc.OwnerId == userId;
        bool isAuditor = context.User.IsInRole("Auditor");

        if (requirement.Name == DocumentOps.Read.Name && (isOwner || isAuditor))
            context.Succeed(requirement);
        if (requirement.Name == DocumentOps.Edit.Name && isOwner && !doc.IsLocked)
            context.Succeed(requirement);

        return Task.CompletedTask;     // not succeeding means denied
    }
}

// --- Endpoints ---
app.MapGet("/api/documents/{id:guid}", async (
    Guid id, ClaimsPrincipal user, AppDb db, IAuthorizationService authz) =>
{
    var doc = await db.Documents.FindAsync(id);
    if (doc is null) return Results.NotFound();

    var check = await authz.AuthorizeAsync(user, doc, DocumentOps.Read);
    return check.Succeeded
        ? Results.Ok(DocumentDto.From(doc))      // a DTO, not the entity
        : Results.NotFound();                    // 404 does not confirm that the id exists
});

// The list is scoped by the caller's identity. No userId parameter exists.
app.MapGet("/api/documents", async (ClaimsPrincipal user, AppDb db) =>
{
    var userId = user.FindFirstValue(ClaimTypes.NameIdentifier);
    return await db.Documents.Where(d => d.OwnerId == userId)
                             .Select(d => new DocumentDto(d.Id, d.Title, d.UpdatedAt))
                             .ToListAsync();
});

// Users edit only their own profile, and only the fields in the DTO.
public record UpdateProfileRequest(string DisplayName, string? Phone);

app.MapPut("/api/me", async (UpdateProfileRequest req, ClaimsPrincipal principal, AppDb db) =>
{
    var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
    var me = await db.Users.SingleAsync(u => u.Id == userId);
    me.DisplayName = req.DisplayName;            // IsAdmin and OwnerId cannot be reached
    me.Phone = req.Phone;
    await db.SaveChangesAsync();
    return Results.NoContent();
});

app.MapDelete("/api/admin/users/{id}", async (string id, AppDb db) =>
{
    await db.Users.Where(u => u.Id == id).ExecuteDeleteAsync();
    return Results.NoContent();
}).RequireAuthorization("ManageUsers");` },
    { lang: 'csharp', title: 'Fixed: tenant isolation by default, and a test that proves it', code: `using System.Net;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public interface ITenantContext { Guid TenantId { get; } }

// The tenant comes from the verified token, never from the request.
public class HttpTenantContext(IHttpContextAccessor http) : ITenantContext
{
    public Guid TenantId =>
        Guid.Parse(http.HttpContext!.User.FindFirstValue("tenant_id")
                   ?? throw new UnauthorizedAccessException("No tenant in token"));
}

public class AppDb(DbContextOptions<AppDb> options, ITenantContext tenant) : DbContext(options)
{
    public DbSet<Document> Documents => Set<Document>();

    protected override void OnModelCreating(ModelBuilder b)
    {
        // Added to EVERY query on Documents. A developer cannot forget it.
        b.Entity<Document>().HasQueryFilter(d => d.TenantId == tenant.TenantId);
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // New rows always get the caller's tenant, whatever the request said.
        foreach (var e in ChangeTracker.Entries<Document>().Where(e => e.State == EntityState.Added))
            e.Entity.TenantId = tenant.TenantId;
        return base.SaveChangesAsync(ct);
    }
}

// --- xUnit: the misuse case as a permanent test ---
public class DocumentAccessTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Theory]
    [InlineData("GET")]
    [InlineData("PUT")]
    [InlineData("DELETE")]
    public async Task Other_users_document_is_not_reachable(string method)
    {
        var asha = factory.CreateClientFor("asha");             // helper: signed-in test client
        Guid ravisDocument = await factory.SeedDocumentFor("ravi");

        var request = new HttpRequestMessage(new HttpMethod(method), "/api/documents/" + ravisDocument);
        if (method == "PUT") request.Content = JsonContent.Create(new { title = "mine now" });

        var response = await asha.SendAsync(request);

        Assert.Equal(HttpStatusCode.NotFound, response.StatusCode);
    }

    [Fact]
    public async Task Customer_cannot_call_admin_endpoint()
    {
        var asha = factory.CreateClientFor("asha");
        var response = await asha.DeleteAsync("/api/admin/users/ravi");
        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}` }
  ],
  pitfalls: [
    `Checking "is the user logged in?" and stopping there. A login check never answers "is this record theirs?".`,
    `Taking the user id, role or tenant id from the request body, query string or a hidden field. Use the identity from the verified session or token.`,
    `Protecting GET but forgetting PUT, PATCH, DELETE, list, search and export endpoints for the same data.`,
    `Relying on hidden buttons or Angular route guards. Anyone can call the API directly.`,
    `Binding request bodies straight onto entities. Users can then set fields such as OwnerId or IsAdmin. Bind to a narrow DTO.`,
    `Believing GUID ids solve IDOR. They make guessing harder but ids leak. The ownership check is still required.`
  ],
  checklist: [
    `Set a fallback policy so every endpoint requires an authenticated user unless marked public.`,
    `For every endpoint that takes an id, scope the query by owner or run a resource-based authorization check.`,
    `Read user id, roles and tenant id only from the authenticated identity, never from request data.`,
    `Apply the same checks to read, update, delete, list, search, export and file download endpoints.`,
    `Protect admin and staff functions with named policies, not only with hidden menus.`,
    `Bind requests to DTOs that contain only the fields the caller may change.`,
    `Add a tenant filter that applies automatically to every query in multi-tenant apps.`,
    `Write a test per endpoint that uses another user's id and must fail.`,
    `Log denied access attempts with user, action and object id.`,
    `Review roles and permissions regularly and remove what is no longer needed.`
  ],
  quiz: [
    { q: `Asha is logged in and changes /api/orders/1041 to /api/orders/1042. She sees Ravi's order. What is this bug called?`, options: ['Cross-site scripting (reflected XSS)', 'Insecure direct object reference (IDOR)', 'SQL injection through the URL path (SQLi)', 'Session fixation'], answer: 1, why: `The server used the id from the request without checking that the object belongs to the caller. This is IDOR, also called broken object level authorization.` },
    { q: `Which status code means "I know who you are, but you may not do this"?`, options: ['400', '401', '403', '500'], answer: 2, why: `401 means the caller is not authenticated. 403 means authenticated but not allowed. For objects owned by someone else, 404 is often used so that the id is not confirmed.` },
    { q: `An API has GET /api/invoices?customerId=7 and returns invoices for whatever customerId is sent. What is the right fix?`, options: ['Make customerId a GUID so that other customers cannot be guessed', 'Hide the parameter in the Angular app from users', 'Filter by the customer id from the authenticated identity', 'Add a CAPTCHA so that scripts cannot loop over customer ids'], answer: 2, why: `The server already knows who is calling. Letting the caller choose whose data to read is the bug. GUIDs and hidden fields do not add a check.` },
    { q: `What does a fallback authorization policy of "RequireAuthenticatedUser" give you?`, options: ['Faster requests, because policy results are cached per user', 'Deny by default: new endpoints need a login unless opened', 'Automatic ownership checks on every object that is loaded', 'Encrypted cookies for every endpoint that has no attribute'], answer: 1, why: `Forgetting an attribute then fails safe: the endpoint needs a login. It does not replace object-level checks, which you still write.` },
    { q: `A user's Admin role is removed, but their token still contains "Admin" for another 50 minutes. Which approach reduces this risk?`, options: ['A longer token lifetime, so that roles are refreshed less often', 'Short-lived tokens, or a live check for high-risk actions', 'Storing the role in localStorage so the app can update it', 'Using GUID user ids so that the old token cannot be matched'], answer: 1, why: `Permissions inside a token are a snapshot. Short lifetimes, periodic re-validation or a live check for dangerous actions keep the snapshot from being trusted too long.` },
    { q: `Why are Angular route guards not a security control?`, options: ['They are too slow to run before every single navigation', 'They run in the browser, and the API can be called directly', 'They only work in development builds, not in production', 'They switch off HTTPS for the routes that they protect'], answer: 1, why: `Guards improve the experience by hiding what a user cannot use. Enforcement must happen on the server for every request.` }
  ],
  takeaways: [
    `Authentication says who you are. Authorization decides what you may do, and it must run on every request.`,
    `Check two levels: may you call this function, and may you touch this particular object.`,
    `IDOR is closed by scoping queries to the caller or by a resource-based check, on every endpoint that takes an id.`,
    `Deny by default. Identity, role and tenant come from the verified login, never from the request.`,
    `Frontend checks are presentation. The server is the only judge.`,
    `Test authorization on purpose: sign in as one user and ask for another user's data.`
  ],
  interview: [
    { q: 'What is the difference between authentication and authorization?', a: `<p>Authentication establishes who the caller is, typically once per session or token, and fails with 401. Authorization decides whether that caller may perform a specific action on a specific resource, must be evaluated on every request, and fails with 403 (or 404 when you do not want to confirm that the resource exists).</p>` },
    { q: 'How do you prevent IDOR across a large API?', a: `<p>Make the safe path the default: a fallback policy that requires authentication, data access that is always scoped by the caller's identity or tenant through query filters, and resource-based authorization handlers for richer rules. Never accept user or tenant ids from the client. Back it with automated tests that request other users' ids on every endpoint and with code review focused on any endpoint that takes an id.</p>` },
    { q: 'When would you use roles, policies and resource-based authorization?', a: `<p>Roles for coarse job functions such as Admin or Finance. Policies to name and centralise rules that combine roles and claims, so endpoints do not repeat logic. Resource-based authorization when the decision depends on the object itself, such as its owner, state or tenant. Most systems use all three together.</p>` },
    { q: 'How would you guarantee tenant isolation in a multi-tenant application?', a: `<p>Take the tenant id from the token only. Apply it automatically to every query with a global filter and set it automatically on inserts. Add a second barrier in the database, such as row-level security or separate schemas or databases. Run automated cross-tenant tests on every endpoint, and log and alert on any denied cross-tenant attempt.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-web-model — The Web Security Model: Same-Origin, Cookies, CORS & CSP */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-web-model'] = {
  hook: `Your browser has your bank open in one tab and a random blog in another. A few quiet rules are all that stop the blog from reading your balance.`,
  intro: `<p>A browser is a strange place. It runs code from hundreds of strangers, the websites you visit, on the same machine where you are logged in to your bank, your email and your company tools. If any page could read any other page, the web would be unusable.</p>
<p>The browser prevents this with a small set of built-in rules, together called the <span class="term">web security model</span>. The most important is the <span class="term">same-origin policy</span>: code from one website may not read data from another. Around it sit a few related tools. <strong>Cookie flags</strong> control when the browser sends your session. <span class="term">CORS</span> lets a server carefully open a door in the same-origin wall. <span class="term">Content Security Policy (CSP)</span> lets a site tell the browser which scripts it trusts.</p>
<p>Most developers meet these rules as error messages: "blocked by CORS policy", "refused to load the script". The usual reaction is to search for the setting that makes the error go away. That setting is often the one that removes the protection.</p>
<p>This lesson explains what each rule protects, so you can fix the error and keep the wall. It matters twice for an Angular and .NET developer: your frontend lives inside these rules, and your API sets most of the headers that control them.</p>`,
  realLife: {
    title: 'An apartment building with strict house rules',
    body: `<p>Picture a large apartment building. Each flat is one website. The building has a simple rule: you may look around your own flat as much as you like, but you may not walk into a neighbour's flat and read their post. That is the same-origin policy.</p>
<p>The postman delivers letters to the right flat automatically. He does not ask who is standing at the door. Those letters are <strong>cookies</strong>: the browser attaches them to every request going to that site, whoever caused the request. That convenience is also a risk, so each letter can carry instructions: "hand only to the resident, not to visitors" (HttpOnly), "only by secure courier" (Secure), "do not deliver if a stranger asked for it" (SameSite).</p>
<p>Sometimes a neighbour really should be let in, for example your frontend at one address calling your API at another. The API puts a note on its door: "the resident of flat 12 may enter". That note is <strong>CORS</strong>. And a notice in the hallway listing which tradespeople are allowed in the building is the <strong>Content Security Policy</strong>.</p>
<p><strong>How this showed up in the real world:</strong> in 2018, attackers changed a JavaScript file used on the British Airways website. For about two weeks the altered script quietly copied payment card details typed by customers and sent them to a server controlled by the attackers. Details of hundreds of thousands of customers were taken. A strict Content Security Policy, which limits where a page may send data and which scripts may run, is one of the defences designed to limit exactly this kind of attack.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What is an origin?</h4>
<p>An <span class="term">origin</span> is three things together: <strong>scheme + host + port</strong>. If any one differs, it is a different origin.</p>
<table>
<thead><tr><th>Compared with <code>https://app.example.com</code></th><th>Same origin?</th><th>Why</th></tr></thead>
<tbody>
<tr><td><code>https://app.example.com/orders/5</code></td><td>Yes</td><td>The path does not matter</td></tr>
<tr><td><code>http://app.example.com</code></td><td>No</td><td>Different scheme (http)</td></tr>
<tr><td><code>https://api.example.com</code></td><td>No</td><td>Different host</td></tr>
<tr><td><code>https://app.example.com:8443</code></td><td>No</td><td>Different port</td></tr>
<tr><td><code>https://example.com</code></td><td>No</td><td>Different host</td></tr>
</tbody>
</table>
<h4>The same-origin policy</h4>
<p>Scripts running on one origin may not <strong>read</strong> responses or page content from another origin. A script on <code>evil.example</code> can make your browser send a request to your bank, but it cannot read what comes back.</p>
<p>Notice the gap in that sentence. The policy stops <em>reading</em>. It does not stop <em>sending</em>. A page can still:</p>
<ul>
<li>Show images, load scripts and styles from other origins.</li>
<li>Submit a form to another origin.</li>
<li>Embed another site in a frame, unless that site forbids it.</li>
</ul>
<p>These gaps are where the classic browser attacks live (you will meet them in the XSS and CSRF lesson), and the other tools in this lesson exist to close them.</p>
<h4>Cookies and their three flags</h4>
<p>A <span class="term">cookie</span> is a small value a site asks the browser to store and send back with every later request to that site. Sessions usually live in cookies. Three flags decide how safe that is:</p>
<table>
<thead><tr><th>Flag</th><th>Meaning</th><th>Protects against</th></tr></thead>
<tbody>
<tr><td><code>HttpOnly</code></td><td>JavaScript cannot read the cookie</td><td>A malicious script stealing the session</td></tr>
<tr><td><code>Secure</code></td><td>Sent only over HTTPS</td><td>Someone on the network reading it</td></tr>
<tr><td><code>SameSite</code></td><td>Limits sending when the request was started by another site</td><td>Other sites making requests in your name</td></tr>
</tbody>
</table>
<div class="callout tip">For a session cookie, the safe starting point is all three: <code>HttpOnly; Secure; SameSite=Lax</code>.</div>
<h4>HTTPS is the floor</h4>
<p>None of this works over plain HTTP. On an open network, anyone between the user and your server could read and change pages and cookies. Serve everything over HTTPS and tell browsers to insist on it with the <span class="term">HSTS</span> header (HTTP Strict Transport Security).</p>` },
    { name: 'Intermediate', body: `<h4>CORS: opening one door on purpose</h4>
<p>Your Angular app runs on <code>https://app.example.com</code> and your API on <code>https://api.example.com</code>. Different origins, so the browser will not let your script read the API's answers. <span class="term">Cross-Origin Resource Sharing (CORS)</span> is how the <em>API</em> tells the <em>browser</em>: "scripts from this other origin may read my responses".</p>
<p>For anything beyond a very simple request, for example JSON with a custom header or a PUT, the browser first sends a <span class="term">preflight</span>: an <code>OPTIONS</code> request asking "may this origin use this method and these headers?". The server answers with headers:</p>
<ul>
<li><code>Access-Control-Allow-Origin</code>: which origin is allowed.</li>
<li><code>Access-Control-Allow-Methods</code> and <code>-Headers</code>: what it may use.</li>
<li><code>Access-Control-Allow-Credentials: true</code>: cookies may be included.</li>
</ul>
<p>If the answer does not match, the browser stops and your script gets an error.</p>
<h4>Three facts about CORS that prevent mistakes</h4>
<ol>
<li><strong>CORS loosens security; it does not add any.</strong> With no CORS headers, browsers block cross-origin reads. Every header you add opens something.</li>
<li><strong>CORS is enforced by browsers only.</strong> Postman, curl and attackers' scripts ignore it. It is not access control for your API. You still need authentication and authorization.</li>
<li><strong>Never combine "any origin" with credentials.</strong> Reflecting whatever origin asks and allowing cookies lets any website the user visits call your API as that user and read the answers.</li>
</ol>
<p>The safe setup is a short, exact list of your own frontend origins.</p>
<h4>SameSite in detail</h4>
<table>
<thead><tr><th>Value</th><th>Cookie is sent when another site...</th><th>Use for</th></tr></thead>
<tbody>
<tr><td><code>Strict</code></td><td>Never</td><td>High-value sessions; users arriving by a link appear logged out at first</td></tr>
<tr><td><code>Lax</code></td><td>Navigates the top-level page with a GET (a normal link)</td><td>Sensible default for sessions</td></tr>
<tr><td><code>None</code> (needs <code>Secure</code>)</td><td>Always</td><td>Only when a cross-site context truly needs the cookie</td></tr>
</tbody>
</table>
<p>"Site" is wider than "origin". <code>app.example.com</code> and <code>blog.example.com</code> are different origins but the <em>same site</em>. So SameSite does not protect you from your own other subdomains. A cookie name starting with <code>__Host-</code> tells the browser to accept it only with <code>Secure</code>, path <code>/</code> and no <code>Domain</code>, which keeps it tied to one exact host.</p>
<h4>Security headers every site should send</h4>
<table>
<thead><tr><th>Header</th><th>What it does</th></tr></thead>
<tbody>
<tr><td><code>Strict-Transport-Security</code></td><td>Browser uses HTTPS only for this site from now on</td></tr>
<tr><td><code>Content-Security-Policy</code></td><td>Lists where scripts, styles, images and connections may come from</td></tr>
<tr><td><code>X-Content-Type-Options: nosniff</code></td><td>Browser must not guess file types, so an uploaded text file is not run as script</td></tr>
<tr><td><code>frame-ancestors</code> (inside CSP)</td><td>Who may show your pages in a frame; <code>'none'</code> blocks clickjacking</td></tr>
<tr><td><code>Referrer-Policy</code></td><td>How much of the current address is told to other sites</td></tr>
<tr><td><code>Permissions-Policy</code></td><td>Switches off features you do not use, such as camera or location</td></tr>
</tbody>
</table>
<div class="callout warn">When you see a CORS error, the fix is almost never <code>AllowAnyOrigin</code>. Add the one origin that needs access, and check whether the request should be cross-origin at all.</div>` },
    { name: 'Expert', body: `<h4>A Content Security Policy that really helps</h4>
<p>CSP is a list of directives. <code>default-src 'self'</code> says "load everything only from my own origin". Others refine it: <code>script-src</code>, <code>style-src</code>, <code>img-src</code>, <code>connect-src</code> (where scripts may send requests), <code>frame-ancestors</code>, <code>form-action</code>, <code>base-uri</code>, <code>object-src</code>.</p>
<p>The value of CSP is in <code>script-src</code>. If injected script cannot run, most script injection attacks stop being useful. Three points decide whether your policy is strong:</p>
<ul>
<li><strong>No <code>'unsafe-inline'</code> for scripts.</strong> It allows exactly the inline script an attacker injects.</li>
<li><strong>Nonces or hashes.</strong> The server puts a fresh random <span class="term">nonce</span> in the header and on each script tag it trusts. Only tags with the right nonce run. <code>'strict-dynamic'</code> lets those trusted scripts load what they need.</li>
<li><strong>Short, exact lists.</strong> Allowing a whole CDN host allows every file anyone has ever published on it.</li>
</ul>
<p>Roll out in steps. Send <code>Content-Security-Policy-Report-Only</code> first, collect violation reports, fix the real problems, then enforce. <code>connect-src</code> and <code>form-action</code> also limit where a page can send data, which reduces what a tampered script can steal.</p>
<h4>Subresource Integrity (SRI)</h4>
<p>When you load a script or stylesheet from a CDN, add an <code>integrity</code> attribute with the hash of the file you reviewed. If the file on the CDN changes by even one byte, the browser refuses to run it. This protects you if the third party is compromised.</p>
<h4>Angular specifics</h4>
<ul>
<li>Angular templates escape values by default, and its sanitizer cleans HTML bound with <code>[innerHTML]</code>. The <code>bypassSecurityTrust...</code> methods switch this off; treat every use as a security review item.</li>
<li>Angular supports CSP nonces for the styles it adds at runtime (the <code>ngCspNonce</code> attribute or the <code>CSP_NONCE</code> token), so you can avoid <code>'unsafe-inline'</code> for styles as well.</li>
<li>Production builds have no need for <code>'unsafe-eval'</code>.</li>
<li><code>HttpClient</code> has built-in XSRF support: it copies a token from a cookie into a header, by default only for same-origin requests.</li>
<li>Serving the app and the API from the same site through a reverse proxy removes CORS completely and lets cookies stay <code>SameSite=Strict</code> or <code>Lax</code>. It is often the simplest secure design.</li>
</ul>
<h4>Edges worth knowing</h4>
<ul>
<li><strong><code>postMessage</code></strong>: when windows talk across origins, always check <code>event.origin</code> on receipt and name the exact target origin when sending.</li>
<li><strong>Subdomain takeover:</strong> a forgotten DNS record pointing at a deleted cloud resource lets someone else serve content under your site. That content is "same-site" for cookies. Clean up DNS.</li>
<li><strong>HSTS preload and <code>includeSubDomains</code></strong> are hard to undo. Be sure every subdomain supports HTTPS first.</li>
<li><strong>Process isolation headers</strong> (<code>Cross-Origin-Opener-Policy</code>, <code>Cross-Origin-Resource-Policy</code>) keep other sites out of your page's browser process. They matter for sensitive apps.</li>
<li><strong>Third-party cookies</strong> are being restricted and partitioned by browsers. Designs that depend on them should be checked against current browser behaviour.</li>
<li><strong>CORS and caching:</strong> if the allowed origin varies, send <code>Vary: Origin</code>, or a cache may serve one origin's permission to another.</li>
</ul>
<h4>What interviewers ask</h4>
<ul>
<li>What exactly is an origin, and what does the same-origin policy block?</li>
<li>Walk through a CORS preflight. Why is reflecting the origin with credentials dangerous?</li>
<li>What do HttpOnly, Secure and SameSite each protect against?</li>
<li>How would you introduce a strict CSP on an existing Angular application?</li>
</ul>` }
  ],
  flow: {
    title: 'A cross-origin API call, with and without permission',
    steps: [
      { title: 'The app makes a call', desc: 'Angular on https://app.example.com sends a JSON POST with cookies to https://api.example.com. Different host, so it is cross-origin.' },
      { title: 'Browser sends a preflight', desc: 'Because the request is not "simple", the browser first sends OPTIONS with the Origin, the method and the headers it wants to use.' },
      { title: 'API answers the preflight', desc: 'The CORS policy lists https://app.example.com exactly, the allowed methods and headers, and Allow-Credentials: true.' },
      { title: 'Browser compares', desc: 'Origin, method and headers all match the answer, so the real request may go. Any mismatch and the browser stops here.' },
      { title: 'Real request with cookie', desc: 'The browser sends the POST and attaches the session cookie, because SameSite rules allow it for this same-site call.' },
      { title: 'Script may read the reply', desc: 'The response carries Access-Control-Allow-Origin for the app, so the browser hands the data to Angular.' },
      { title: 'A stranger tries the same', desc: 'A script on https://evil.example calls the API. The preflight answer does not list that origin, so the browser refuses to send the request or reveal any reply.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: CORS opened to the world, weak cookie, no headers', code: `// "It fixed the CORS error" is how this ends up in production.
builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .SetIsOriginAllowed(_ => true)   // echoes back WHATEVER origin asks
    .AllowAnyHeader()
    .AllowAnyMethod()
    .AllowCredentials()));           // ...and lets that origin use the user's cookies

var app = builder.Build();
app.UseCors();

// Result: any website the user visits can call this API as the user
// and read the answers. The same-origin policy has been switched off.

app.MapPost("/login", (HttpContext ctx) =>
{
    var sessionId = Guid.NewGuid().ToString();

    // No HttpOnly: any script on the page can read it.
    // No Secure:   sent over plain http if a link uses it.
    // No SameSite: left to browser defaults, which differ.
    ctx.Response.Cookies.Append("session", sessionId);
    return Results.Ok();
});

// Missing entirely:
//   - HSTS (browser may still try http first)
//   - Content-Security-Policy (any injected script runs and may send data anywhere)
//   - X-Content-Type-Options (browser may guess that an upload is a script)
//   - frame-ancestors (any site may put this app in an invisible frame)` },
    { lang: 'csharp', title: 'Fixed: exact CORS origins, protected cookie, HSTS and security headers', code: `using System.Security.Cryptography;

// --- CORS: a short, exact list of your own frontends ---
builder.Services.AddCors(o => o.AddPolicy("spa", p => p
    .WithOrigins("https://app.example.com")            // exact scheme + host, no wildcard
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .WithHeaders("Content-Type", "X-XSRF-TOKEN")
    .AllowCredentials()
    .SetPreflightMaxAge(TimeSpan.FromMinutes(10))));    // browsers may cache the preflight

builder.Services.AddHsts(o =>
{
    o.MaxAge = TimeSpan.FromDays(365);
    o.IncludeSubDomains = true;                         // only when every subdomain has HTTPS
});

var app = builder.Build();

if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();

// --- Security headers on every response ---
app.Use(async (ctx, next) =>
{
    // Fresh random nonce per response; put the same value on script tags you render.
    var nonce = Convert.ToBase64String(RandomNumberGenerator.GetBytes(16));
    ctx.Items["csp-nonce"] = nonce;

    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";
    h["Referrer-Policy"] = "strict-origin-when-cross-origin";
    h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    h["Content-Security-Policy"] =
        "default-src 'self'; " +
        "script-src 'self' 'nonce-" + nonce + "'; " +
        "style-src 'self' 'nonce-" + nonce + "'; " +
        "img-src 'self' data:; " +
        "connect-src 'self' https://api.example.com; " +
        "frame-ancestors 'none'; base-uri 'self'; form-action 'self'; object-src 'none'";

    await next();
});

app.UseCors("spa");
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/login", (HttpContext ctx) =>
{
    var sessionId = Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    ctx.Response.Cookies.Append("__Host-session", sessionId, new CookieOptions
    {
        HttpOnly = true,                 // scripts cannot read it
        Secure = true,                   // HTTPS only
        SameSite = SameSiteMode.Lax,     // not sent on cross-site POSTs
        Path = "/",                      // required by the __Host- prefix (and no Domain)
        MaxAge = TimeSpan.FromHours(8)
    });
    return Results.Ok();
});

// Note: CORS is not access control. Postman and scripts outside a browser ignore it.
// Every endpoint still needs authentication and authorization.` },
    { lang: 'typescript', title: 'Angular side: credentials only to your API, XSRF support, safe rendering', code: `import { ApplicationConfig, Component, input } from '@angular/core';
import {
  HttpInterceptorFn, provideHttpClient, withInterceptors, withXsrfConfiguration
} from '@angular/common/http';

const API = 'https://api.example.com';

// Send cookies only to our own API, never to third-party addresses.
const credentialsForOurApi: HttpInterceptorFn = (req, next) =>
  req.url.startsWith(API + '/') ? next(req.clone({ withCredentials: true })) : next(req);

export const appConfig: ApplicationConfig = {
  providers: [
    provideHttpClient(
      // Angular copies the token from this cookie into this header on changing requests.
      // By default it does so for same-origin requests only. If the API is on another
      // origin, either serve it under the same site through a reverse proxy (simplest)
      // or add the header yourself in an interceptor limited to the API address.
      withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }),
      withInterceptors([credentialsForOurApi])
    )
  ]
};

@Component({
  selector: 'app-review',
  standalone: true,
  // Interpolation escapes the value. If the text contains script tags or event
  // handlers, they are shown as plain text and never run.
  template: '<p>{{ text() }}</p>'
})
export class ReviewComponent {
  text = input.required<string>();
}

// index.html: third-party files are pinned by hash (Subresource Integrity).
// If the CDN file changes by one byte, the browser refuses to run it.
//
//   <script src="https://cdn.example.com/charts.min.js"
//           integrity="sha384-(hash of the exact file you reviewed)"
//           crossorigin="anonymous"><\/script>
//
// In the root element, pass the server's CSP nonce so Angular can tag its styles:
//   <app-root ngCspNonce="(nonce from the server)"></app-root>` }
  ],
  pitfalls: [
    `"Fixing" a CORS error with any-origin plus credentials. That hands every website the user's logged-in access to your API.`,
    `Treating CORS as protection for the API. Only browsers obey it. Authentication and authorization are still required.`,
    `Session cookies without HttpOnly, Secure and SameSite. Each missing flag opens a different way to steal or misuse the session.`,
    `A CSP that contains 'unsafe-inline' for scripts or a whole CDN host. It looks like protection and blocks very little.`,
    `Thinking SameSite protects you from your own subdomains. A weak or abandoned subdomain is the same site.`,
    `Loading third-party scripts without Subresource Integrity. If that provider is compromised, so is your page.`
  ],
  checklist: [
    `Serve every page and API over HTTPS and send the Strict-Transport-Security header.`,
    `Set session cookies with HttpOnly, Secure and SameSite, and use the __Host- prefix where possible.`,
    `List exact frontend origins in the CORS policy; never reflect arbitrary origins with credentials.`,
    `Remember that CORS is not access control: keep authentication and authorization on every endpoint.`,
    `Send a Content-Security-Policy without 'unsafe-inline' scripts, starting in report-only mode.`,
    `Add frame-ancestors 'none' (or a short list) to stop other sites framing your pages.`,
    `Send X-Content-Type-Options: nosniff, Referrer-Policy and Permissions-Policy on all responses.`,
    `Pin third-party scripts and styles with Subresource Integrity hashes.`,
    `Review every use of bypassSecurityTrust in Angular code.`,
    `Remove DNS records that point to resources you no longer own.`
  ],
  quiz: [
    { q: `Which pair is the SAME origin?`, options: ['https://app.example.com and http://app.example.com', 'https://app.example.com and https://api.example.com', 'https://app.example.com/a and https://app.example.com/b', 'https://app.example.com and https://app.example.com:8443'], answer: 2, why: `An origin is scheme, host and port. Only the path differs in that pair, and the path is not part of the origin.` },
    { q: `What does the same-origin policy stop a script on evil.example from doing?`, options: ['Making your browser submit a form to your bank', 'Reading the response of a request to your bank', 'Showing an image or loading a script from another site', 'Running any script at all in the browser'], answer: 1, why: `It blocks reading across origins. Sending requests, submitting forms and embedding resources are still possible, which is why other defences exist.` },
    { q: `Which cookie flag stops JavaScript on the page from reading the session cookie?`, options: ['Secure', 'SameSite', 'HttpOnly', 'Path'], answer: 2, why: `HttpOnly hides the cookie from scripts. Secure limits it to HTTPS, and SameSite limits cross-site sending.` },
    { q: `An API responds to every request by echoing the caller's Origin in Access-Control-Allow-Origin and also sends Allow-Credentials: true. What is the result?`, options: ['The API is safer, because every caller must name its origin', 'Any website can call the API as the user and read the answers', 'Only Angular apps on a listed origin can call it', 'Preflight requests are disabled, so all calls are simple'], answer: 1, why: `This removes the same-origin protection for logged-in users. Allowed origins must be a fixed list of your own frontends.` },
    { q: `Does a strict CORS policy stop someone calling your API with curl or Postman?`, options: ['Yes, CORS blocks every unknown client', 'No, CORS is enforced only by browsers', 'Only for POST requests', 'Only when HTTPS is used'], answer: 1, why: `CORS is an instruction to browsers about which scripts may read responses. Other clients ignore it, so real access control must be on the server.` },
    { q: `Why is 'unsafe-inline' in script-src a serious weakness in a Content Security Policy?`, options: ['It slows the page, because every script is checked twice', 'It allows inline scripts, including injected ones', 'It blocks images and styles that come from the same origin', 'It disables HTTPS for scripts that are written in the page'], answer: 1, why: `The main value of CSP is refusing scripts the site did not approve. Allowing all inline script gives that away. Use nonces or hashes instead.` }
  ],
  takeaways: [
    `An origin is scheme + host + port. The same-origin policy stops one origin from reading another's data.`,
    `It stops reading, not sending. Cookie flags, CORS rules and CSP cover the gaps.`,
    `Session cookies need HttpOnly, Secure and SameSite.`,
    `CORS opens doors and is obeyed only by browsers. Allow exact origins, and never any origin with credentials.`,
    `A strict CSP with nonces limits which scripts run and where a page can send data.`,
    `When a browser security error appears, understand which wall it is before you remove it.`
  ],
  interview: [
    { q: 'What is the same-origin policy?', a: `<p>It is the browser rule that scripts from one origin, defined as scheme, host and port, cannot read responses or page content from a different origin. It isolates sites from each other inside the same browser. It does not block sending requests or embedding resources across origins, which is why CSRF defences, cookie flags and CSP are also needed.</p>` },
    { q: 'Explain a CORS preflight request.', a: `<p>For requests that are not simple, such as JSON with custom headers or PUT and DELETE, the browser first sends an OPTIONS request with the Origin and the method and headers it intends to use. The server replies with the Access-Control-Allow headers. If the origin, method and headers are permitted, the browser sends the real request and lets the script read the response; otherwise it blocks the call. The server must still authorize the real request itself.</p>` },
    { q: 'What do HttpOnly, Secure and SameSite protect against?', a: `<p>HttpOnly prevents scripts from reading the cookie, which limits session theft through script injection. Secure sends the cookie only over HTTPS, which protects it on the network. SameSite limits sending the cookie on requests started by other sites, which defends against cross-site request forgery. Together they are the baseline for any session cookie.</p>` },
    { q: 'How would you introduce a Content Security Policy to an existing Angular app?', a: `<p>Start with a policy in report-only mode and collect violation reports. Remove inline scripts and event handlers, add nonces or hashes for what must stay, and use Angular's nonce support for runtime styles. Restrict script, connect and frame sources to exact origins, add object-src none and base-uri self, fix what the reports show, then switch to enforcing mode and keep the reporting endpoint for monitoring.</p>` }
  ]
};
