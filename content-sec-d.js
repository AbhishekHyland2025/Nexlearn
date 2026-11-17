// NexLearn content — Security module, part D: Threat Modelling & Secure Design + Secure SDLC
// Topics: sec-threat-modelling, sec-threat-modelling-practice, sec-design-principles, sec-architecture, sec-sdlc
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* sec-threat-modelling — Threat Modelling Fundamentals                */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-threat-modelling'] = {
  hook: `The cheapest security bug to fix is the one you find on a whiteboard, before anyone has written a line of code.`,
  intro: `<p><span class="term">Threat modelling</span> is a structured way of asking "what could go wrong with this system, and what will we do about it?". You draw how the system works, you look for ways it could be attacked or misused, and you decide on defences. You do all of this early, while changing the design is still cheap.</p>
<p>It is not a tool and it is not a document you write once for an auditor. It is a short thinking exercise that a team does together. A developer, a tester and a product owner in a room for one hour can find problems that no scanner will ever find, because scanners read code and threat modelling reads the <em>design</em>.</p>
<p>A <span class="term">threat</span> is something bad that could happen: someone reads another user's invoices, someone floods the login page, someone changes a price in a request. A threat model is simply the list of those bad things for your system, with a decision next to each one.</p>
<p>In this lesson you learn the four questions that drive every threat model, how to draw a <span class="term">data flow diagram</span>, what a <span class="term">trust boundary</span> is, and the most popular method for finding threats: <span class="term">STRIDE</span>. The next lesson runs a full worked example.</p>`,
  realLife: {
    title: 'Walking around the house plans before the house is built',
    body: `<p>Imagine you are building a house. Before the builders start, you sit down with the plans and ask: where could a burglar get in? The front door has a good lock. But the plans show a small window next to the back door, close enough to reach the handle from outside. On paper, you move the window half a metre. It costs nothing. If you notice the same problem after the house is built, you are knocking down a wall.</p>
<p>You also ask different kinds of questions. What if the burglar is a guest we let in ourselves? What if there is a fire and the smart lock has no power? What is actually worth stealing, and where do we keep it? That is threat modelling: plans on the table, a few people, and the habit of asking "what could go wrong here?" for every door, window and pipe.</p>
<p><strong>How this showed up in the real world:</strong> a large retailer was breached after attackers stole the login of an outside vendor that serviced its stores. From that small foothold they reached the systems that handled payment cards. Every single component may have "worked as designed". The weak spot was a line on the diagram: a path from a low-trust partner network to a high-value system, with nothing checking traffic as it crossed. That kind of problem is exactly what a trust boundary on a data flow diagram is meant to make visible.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The four questions</h4>
<p>Every threat model, big or small, answers four questions. They come from the Threat Modeling Manifesto and the work of Adam Shostack, and they are worth learning by heart.</p>
<ol>
<li><strong>What are we working on?</strong> Draw the system or the feature. Keep it simple.</li>
<li><strong>What can go wrong?</strong> Look for threats. This is where methods like STRIDE help.</li>
<li><strong>What are we going to do about it?</strong> Decide on a defence for each threat, or decide to accept it.</li>
<li><strong>Did we do a good job?</strong> Check the work. Are the defences built and tested? Did we miss a part of the diagram?</li>
</ol>
<h4>Words you need</h4>
<table><thead><tr><th>Word</th><th>Meaning</th><th>Example</th></tr></thead><tbody>
<tr><td><span class="term">Asset</span></td><td>Something worth protecting</td><td>Customer emails, card numbers, the admin account, uptime</td></tr>
<tr><td><span class="term">Actor</span></td><td>Anyone or anything that uses or attacks the system</td><td>Customer, admin, partner API, a curious employee, a criminal</td></tr>
<tr><td><span class="term">Entry point</span></td><td>A place where data or commands come in</td><td>Login form, REST endpoint, file upload, message queue, admin console</td></tr>
<tr><td><span class="term">Trust boundary</span></td><td>A line where the level of trust changes</td><td>Internet to your API, your API to the database, your service to a third party</td></tr>
</tbody></table>
<h4>The data flow diagram (DFD)</h4>
<p>A <span class="term">data flow diagram</span> shows where data comes from, where it goes and where it rests. It uses only five shapes, so anyone can draw one.</p>
<table><thead><tr><th>Shape</th><th>Name</th><th>What it is</th></tr></thead><tbody>
<tr><td>Rectangle</td><td>External entity</td><td>A person or system you do not control: a user, a payment provider</td></tr>
<tr><td>Circle</td><td>Process</td><td>Your running code: the web app, the API, a background worker</td></tr>
<tr><td>Two parallel lines</td><td>Data store</td><td>Where data rests: database, file storage, cache, log files</td></tr>
<tr><td>Arrow</td><td>Data flow</td><td>Data moving between two things, with a label saying what moves</td></tr>
<tr><td>Dashed line</td><td>Trust boundary</td><td>The border between zones of different trust</td></tr>
</tbody></table>
<p>The first code tab shows a complete DFD drawn with plain text.</p>
<div class="callout tip">Most threats live where an arrow crosses a dashed line. When data moves from a less trusted zone to a more trusted one, something must check it: who sent it, is it allowed, is it well formed. If you are short on time, look at the crossings first.</div>
<h4>When do you do it?</h4>
<p>Do a threat model when you design a new system, and again whenever a change adds something new to the diagram: a new entry point, a new kind of sensitive data, a new third party, or a new way to log in. A small feature needs 20 minutes on a whiteboard, not a 40-page report.</p>` },
    { name: 'Intermediate', body: `<h4>STRIDE: six ways things go wrong</h4>
<p><span class="term">STRIDE</span> is a memory aid created at Microsoft. Each letter is one kind of threat, and each one breaks one security property. You walk over your diagram and ask the six questions for each part.</p>
<table><thead><tr><th>Letter</th><th>Threat</th><th>Everyday picture</th><th>Property it breaks</th><th>Typical defences</th></tr></thead><tbody>
<tr><td><strong>S</strong></td><td>Spoofing: pretending to be someone or something else</td><td>A stranger wearing a courier uniform walks into the office</td><td>Authentication</td><td>Strong login, MFA, signed tokens, mutual TLS between services</td></tr>
<tr><td><strong>T</strong></td><td>Tampering: changing data or code without permission</td><td>Someone changes the amount on a signed cheque</td><td>Integrity</td><td>Server-side validation, TLS, hashes and signatures, database permissions</td></tr>
<tr><td><strong>R</strong></td><td>Repudiation: denying you did something, and nobody can prove otherwise</td><td>"I never received that parcel" and there is no signature</td><td>Non-repudiation</td><td>Audit logs with user, action and time; logs the actor cannot edit</td></tr>
<tr><td><strong>I</strong></td><td>Information disclosure: data seen by someone who should not see it</td><td>A doctor's letter delivered to the neighbour</td><td>Confidentiality</td><td>Access checks on every record, encryption, minimal responses, safe error messages</td></tr>
<tr><td><strong>D</strong></td><td>Denial of service: making the system unavailable</td><td>A crowd blocks the shop door so real customers cannot enter</td><td>Availability</td><td>Rate limits, quotas, timeouts, size limits, autoscaling, queues</td></tr>
<tr><td><strong>E</strong></td><td>Elevation of privilege: gaining rights you should not have</td><td>A visitor finds a staff badge and opens the server room</td><td>Authorization</td><td>Deny by default, role and policy checks on the server, least privilege accounts</td></tr>
</tbody></table>
<h4>STRIDE per element</h4>
<p>Not every threat applies to every shape. A data flow cannot "deny it did something". This table tells you which questions to ask for which shape, so you stay fast.</p>
<table><thead><tr><th>Element</th><th>S</th><th>T</th><th>R</th><th>I</th><th>D</th><th>E</th></tr></thead><tbody>
<tr><td>External entity</td><td>Yes</td><td></td><td>Yes</td><td></td><td></td><td></td></tr>
<tr><td>Process</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td><td>Yes</td></tr>
<tr><td>Data store</td><td></td><td>Yes</td><td>Sometimes (logs)</td><td>Yes</td><td>Yes</td><td></td></tr>
<tr><td>Data flow</td><td></td><td>Yes</td><td></td><td>Yes</td><td>Yes</td><td></td></tr>
</tbody></table>
<h4>Writing a threat so it can be fixed</h4>
<p>"The API is insecure" is not a threat, it is a feeling. A good threat statement names who, what, where, why and the damage. Use this template:</p>
<blockquote>An <strong>[actor]</strong> can <strong>[action]</strong> on <strong>[element]</strong> because <strong>[weakness]</strong>, which leads to <strong>[impact]</strong>.</blockquote>
<p>Example: "A logged-in customer can read another customer's invoice through GET /invoices/{id} because the API checks only that the caller is logged in, not that they own the invoice, which leads to disclosure of names, addresses and order history."</p>
<p>From a statement like that, three things follow almost automatically: the <strong>mitigation</strong> (add an ownership check in the query), the <strong>test</strong> (log in as user A, request user B's invoice, expect 404), and the <strong>owner</strong> (the team that owns the invoice service).</p>
<div class="callout warn">STRIDE finds threats; it does not rank them. Do not try to fix all of them with equal energy. The next lesson shows how to rate risk and pick what to fix first.</div>
<h4>From threat to code</h4>
<p>The third code tab shows a small ASP.NET Core API where each defence is labelled with the STRIDE letter it answers. Notice that most of them are a few lines of configuration. The hard part is knowing you need them, and that is what the model gives you.</p>` },
    { name: 'Expert', body: `<h4>Getting the diagram right</h4>
<p>The quality of a threat model depends on the diagram. Experienced teams draw at two levels. A <strong>context diagram</strong> (level 0) shows the whole system as one circle with the outside world around it. A <strong>level 1 diagram</strong> opens that circle into its main processes and stores. Go deeper only for the risky parts, such as login or payments. If a diagram has more than about fifteen elements, split it.</p>
<p>Trust boundaries are where beginners make mistakes. A boundary is not only "the firewall". Draw one wherever any of these change:</p>
<ul>
<li><strong>Network zone:</strong> internet, DMZ, internal network, database subnet.</li>
<li><strong>Process or machine:</strong> browser to server, service to service, container to host.</li>
<li><strong>Privilege:</strong> anonymous to logged-in, user to admin, application code to kernel.</li>
<li><strong>Ownership:</strong> your code to a third-party API, your tenant to another tenant, your pipeline to a public package feed.</li>
</ul>
<h4>Per element or per interaction</h4>
<p><strong>STRIDE per element</strong> (the table in the Intermediate tab) is easy to teach and gives good coverage. <strong>STRIDE per interaction</strong> looks at each arrow as a triple: origin, destination and the data moved. It produces fewer, sharper threats because it focuses on the crossings, and it is what several tools apply under the hood. Pick one and be consistent.</p>
<h4>Write down assumptions</h4>
<p>Every model rests on assumptions: "the cloud provider's key service is trusted", "admins use MFA", "the internal network is not reachable from the internet". Write them next to the diagram. An assumption that turns out to be false is a finding in itself, and reviewers attack assumptions first.</p>
<h4>Question four, taken seriously</h4>
<p>"Did we do a good job?" has concrete checks:</p>
<ul>
<li>Every element and every boundary crossing has been walked through.</li>
<li>Every threat has a decision: mitigate, avoid, transfer or accept, with a named owner.</li>
<li>Every mitigation is a backlog item and has a test that would fail if the defence were removed.</li>
<li>The diagram still matches the code. A model of a system that no longer exists is worse than none, because people trust it.</li>
</ul>
<h4>Where STRIDE is weak</h4>
<ul>
<li><strong>Privacy.</strong> STRIDE asks "can the wrong person read it?". It does not ask "should we collect it at all?". LINDDUN covers that.</li>
<li><strong>Business logic abuse.</strong> Applying a discount code a thousand times breaks no STRIDE property cleanly. Add abuse cases: "how would a greedy but legitimate user misuse this?".</li>
<li><strong>Chained attacks.</strong> STRIDE looks at one element at a time. Attack trees (next lesson) show how small threats combine.</li>
<li><strong>AI features.</strong> A model that follows instructions hidden in a document is a new kind of tampering and elevation of privilege. Treat model input as untrusted data crossing a boundary.</li>
</ul>
<div class="callout idea">A useful habit: for every arrow crossing a boundary, write three words on the diagram: <strong>authenticated?</strong> <strong>authorized?</strong> <strong>validated?</strong> If you cannot answer all three, you have found a threat.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Can you threat model a system you have never seen in ten minutes? They want the four questions and a rough DFD, not a perfect list.</li>
<li>Can you map each STRIDE letter to the property it breaks and to a concrete control?</li>
<li>Do you know when to stop? Good answers mention ranking by risk and accepting some threats on purpose.</li>
</ul>` }
  ],
  flow: {
    title: 'Threat modelling a "reset my password" feature',
    steps: [
      { title: 'Scope it', desc: 'Question 1. We are working on one feature: a user asks for a reset email, clicks a link and sets a new password. Assets: the user account and the reset token.' },
      { title: 'Draw it', desc: 'Browser, web API, email provider, user database. Arrows: reset request, email with link, link click with token, new password write.' },
      { title: 'Mark boundaries', desc: 'Internet to API is one boundary. API to the email provider is another, because that company is outside our control. API to database is a third.' },
      { title: 'Walk STRIDE', desc: 'Question 2. Spoofing: can someone request a reset for another person and catch the link? Information disclosure: does the page reveal which emails have accounts? Denial of service: can someone send 10,000 reset emails?' },
      { title: 'Write threats', desc: 'Use the template. "An anonymous attacker can guess reset tokens because they are short and never expire, which leads to account takeover."' },
      { title: 'Decide', desc: 'Question 3. Long random single-use tokens that expire in 15 minutes. The same reply whether or not the email exists. A rate limit per email and per IP address.' },
      { title: 'Verify', desc: 'Question 4. Each defence becomes a backlog item with a test: reuse a token, expect failure. Use an old token, expect failure. Ask 20 times, expect a 429 response.' },
      { title: 'Revisit', desc: 'Next quarter the team adds reset by SMS. That is a new entry point and a new third party, so the model gets a 20-minute update.' }
    ]
  },
  code: [
    { lang: 'text', title: 'A data flow diagram in plain text, with trust boundaries', code: `SYSTEM: Small online shop (level 1 DFD)

 [ Customer ]                                   [ Payment provider ]
 (external entity)                              (external entity)
      |                                                  ^
      | 1. clicks and typing: login, browse, order       | 5. HTTPS: charge request
      v                                                  |    (token, amount)
 ( Angular app, runs in   )                              |
 ( the customer's browser )                              |
      |                                                  |
      | 2. HTTPS: JSON + access token                    |
- - - - - - - - - - - TRUST BOUNDARY A: internet / our cloud - - - - - - - - - -
      |                                                  |
      v                                                  |
 ( Order API            ) -------------------------------+
 ( ASP.NET Core process )
      |            |
      | 3. SQL     | 4. events
- - - - - - - - - - - TRUST BOUNDARY B: app tier / data tier - - - - - - - - - -
      v            v
 == Orders DB ==  == Audit log ==
 (data store)     (data store)

ELEMENTS
  External entities : Customer, Payment provider
  Processes         : Angular app (runs in the customer's browser), Order API
  Data stores       : Orders DB (names, addresses, orders), Audit log
  Data flows        : 1 to 5, each labelled with WHAT moves and HOW

TRUST BOUNDARIES
  A  Everything above the line is outside our control. Flows 2 and 5 cross it.
  B  Only the Order API may talk to the data stores. Flows 3 and 4 cross it.

ASSUMPTIONS (write them down, reviewers will challenge them)
  - The payment provider handles raw card numbers. We only ever see a token.
  - The browser is NOT trusted. Any check done in Angular is repeated in the API.
  - Staff reach the database only through a separate, logged admin path.

FOR EVERY ARROW THAT CROSSES A BOUNDARY, ASK
  authenticated?   who is on the other end, and how do we know
  authorized?      is this caller allowed to do this to this record
  validated?       is the data the right type, size and shape` },
    { lang: 'text', title: 'STRIDE worksheet and threat statements for the shop', code: `STRIDE PER ELEMENT - which questions to ask where

  Element            S    T    R    I    D    E
  External entity    x         x
  Process            x    x    x    x    x    x
  Data store              x   (x)   x    x          (x) = logs and audit stores
  Data flow               x         x    x

THREAT STATEMENT TEMPLATE
  An [actor] can [action] on [element] because [weakness],
  which leads to [impact].

WORKED THREATS

  T-01  Element: Customer (external entity)        Type: Spoofing
        An attacker with a list of leaked passwords can log in as real
        customers on the Order API because login has no rate limit and no
        second factor, which leads to account takeover.
        Mitigation : rate limit + lockout, optional MFA, breached-password check
        Test       : 20 wrong logins in a minute -> 429 and an alert

  T-02  Element: Flow 2 (browser -> API)           Type: Tampering
        A customer can change the price field in the order JSON because the
        API trusts the total sent by the browser, which leads to goods sold
        for almost nothing.
        Mitigation : API recalculates every price from the Orders DB
        Test       : post an order with price 0.01 -> total is still correct

  T-03  Element: Order API (process)               Type: Repudiation
        A support agent can issue a refund and later deny it because refunds
        are not logged with the agent's id, which leads to fraud nobody can trace.
        Mitigation : audit entry (who, what, which order, when) on every refund
        Test       : issue a refund -> audit log has exactly one matching row

  T-04  Element: Orders DB (data store)            Type: Information disclosure
        A customer can read any order through GET /orders/{id} because the
        query filters by order id only, which leads to leaked names and addresses.
        Mitigation : query filters by order id AND the caller's customer id
        Test       : user A requests user B's order -> 404

  T-05  Element: Order API (process)               Type: Denial of service
        An anonymous client can request huge result pages because page size
        has no upper limit, which leads to slow or failed requests for everyone.
        Mitigation : max page size 100, request timeout, rate limit per client
        Test       : pageSize=1000000 -> 400

  T-06  Element: Order API (process)               Type: Elevation of privilege
        A normal customer can call the admin refund endpoint because it only
        checks that the caller is logged in, which leads to free refunds.
        Mitigation : policy "CanRefund" on the endpoint, deny by default
        Test       : customer token on /refund -> 403` },
    { lang: 'csharp', title: 'Mitigations in ASP.NET Core, labelled with the STRIDE letter they answer', code: `using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// S - Spoofing: every caller must prove who they are with a signed token.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.Authority = builder.Configuration["Auth:Authority"];
        o.Audience  = builder.Configuration["Auth:Audience"];
    });

// E - Elevation of privilege: deny by default, then open up on purpose.
builder.Services.AddAuthorization(o =>
{
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    o.AddPolicy("CanRefund", p => p.RequireRole("SupportLead"));
});

// D - Denial of service: cap how often this operation can be called.
// (A real app partitions the limit by user id or IP address.)
builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddFixedWindowLimiter("refunds", l => { l.PermitLimit = 30; l.Window = TimeSpan.FromMinutes(1); });
});

// ShopDb, Order and AuditEntry are your own EF Core types.
builder.Services.AddDbContext<ShopDb>(o =>
    o.UseSqlServer(builder.Configuration.GetConnectionString("Shop")));

var app = builder.Build();

// T + I - Tampering and Information disclosure on the wire: TLS only.
app.UseHsts();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.UseRateLimiter();

app.MapPost("/orders/{id:int}/refund",
    async (int id, ClaimsPrincipal user, ShopDb db, ILogger<Program> log) =>
{
    var order = await db.Orders.FindAsync(id);
    if (order is null) return Results.NotFound();

    // T - Tampering: the refund amount comes from OUR database, never from the request.
    order.Status = "Refunded";

    // R - Repudiation: record who did what, to which record, and when.
    string userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    db.AuditLog.Add(new AuditEntry(userId, "Refund", id, DateTimeOffset.UtcNow));
    await db.SaveChangesAsync();
    log.LogInformation("Refund issued for order {OrderId} by {UserId}", id, userId);

    // I - Information disclosure: return only what the caller needs.
    return Results.Ok(new { order.Id, order.Status });
})
.RequireAuthorization("CanRefund")
.RequireRateLimiting("refunds");

app.Run();` }
  ],
  pitfalls: [
    `Starting with the threat list instead of the diagram. Without a picture, people argue about different systems in their heads. Draw first.`,
    `Forgetting trust boundaries, or drawing only the firewall. Boundaries also exist between services, between tenants, and between your code and any third party.`,
    `Writing vague threats such as "SQL injection could happen". Name the actor, the element, the weakness and the impact so someone can fix and test it.`,
    `Treating the model as a one-time document. If the diagram no longer matches the code, the model gives false comfort.`,
    `Leaving security people to do it alone. The developers who build the feature know where the real shortcuts are.`,
    `Trying to mitigate everything. Some threats are unlikely or cheap to live with. Accept them on purpose and write down why.`
  ],
  checklist: [
    `Draw a data flow diagram with every external entity, process, data store and labelled flow`,
    `Mark every trust boundary, including third parties and service-to-service calls`,
    `List the assets and write down your assumptions next to the diagram`,
    `Walk each element through its STRIDE letters using the per-element table`,
    `Write each threat with the template: actor, action, element, weakness, impact`,
    `Record a decision and an owner for every threat`,
    `Create a backlog item and a test for every mitigation`,
    `Re-open the model when a new entry point, data type or third party is added`
  ],
  quiz: [
    { q: `Which of these is NOT one of the four threat modelling questions?`, options: [`What are we working on?`, `What can go wrong?`, `Which scanner should we buy?`, `Did we do a good job?`], answer: 2, why: `The four questions are: what are we working on, what can go wrong, what are we going to do about it, and did we do a good job. Tools are optional.` },
    { q: `A support agent issues a refund and later says "that was not me". There is no log to check. Which STRIDE category is this?`, options: [`Spoofing`, `Repudiation`, `Tampering`, `Denial of service`], answer: 1, why: `Repudiation means someone can deny an action and nobody can prove otherwise. The defence is an audit log the actor cannot change.` },
    { q: `On a data flow diagram, what does a trust boundary show?`, options: [`Where the fastest network link is`, `Where data is encrypted at rest`, `Where the level of trust changes`, `Where the development team changes`], answer: 2, why: `A trust boundary separates zones of different trust. Data crossing it should be authenticated, authorized and validated.` },
    { q: `Elevation of privilege breaks which security property?`, options: [`Availability`, `Confidentiality`, `Non-repudiation`, `Authorization`], answer: 3, why: `Elevation of privilege means gaining rights you should not have, which is a failure of authorization.` },
    { q: `Using STRIDE per element, which threats apply to a data flow (an arrow)?`, options: [`Spoofing, repudiation and elevation of privilege`, `Tampering, information disclosure and denial of service`, `Spoofing, tampering, repudiation and elevation of privilege`, `All six categories apply to every element on the diagram`], answer: 1, why: `Data in motion can be changed, read or blocked. Spoofing and repudiation apply to the entities and processes at each end, not to the arrow.` },
    { q: `Which threat statement is the most useful?`, options: [`The API might be hacked by someone on the internet at some point, so the whole team should be more careful with security from now on.`, `We need more security on the orders endpoint because orders are important to the business and customers expect us to protect them.`, `A customer can read another customer's order through GET /orders/{id} because the query does not filter by owner, leaking addresses.`, `Information disclosure is possible somewhere in the order service and should be looked at before the next release if there is time.`], answer: 2, why: `It names the actor, action, element, weakness and impact. A fix and a test follow directly from it.` }
  ],
  takeaways: [
    `Threat modelling answers four questions: what are we working on, what can go wrong, what will we do about it, did we do a good job.`,
    `A data flow diagram needs only five shapes: external entity, process, data store, data flow and trust boundary.`,
    `Most threats sit where a data flow crosses a trust boundary. Ask: authenticated, authorized, validated?`,
    `STRIDE = Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege. Each breaks one security property.`,
    `A good threat names actor, action, element, weakness and impact, and comes with a mitigation, a test and an owner.`,
    `The model is alive. Update it when the diagram changes.`
  ],
  interview: [
    { q: `What is threat modelling and when would you do it?`, a: `<p>It is a structured review of a design to find what could go wrong and decide what to do about it. I use the four questions: what are we working on, what can go wrong, what are we going to do about it, did we do a good job. I do it at design time for new systems, and again in a lighter form whenever a change adds an entry point, a new type of sensitive data, a new third party or a new trust boundary. For a small feature that is a 20-minute whiteboard session, not a large document.</p>` },
    { q: `Explain STRIDE and the property each letter breaks.`, a: `<p>Spoofing breaks authentication. Tampering breaks integrity. Repudiation breaks non-repudiation. Information disclosure breaks confidentiality. Denial of service breaks availability. Elevation of privilege breaks authorization. I apply it per element on a data flow diagram: external entities get S and R, processes get all six, data stores get T, I and D (plus R for logs), and data flows get T, I and D.</p>` },
    { q: `What is a trust boundary? Give examples beyond the firewall.`, a: `<p>A trust boundary is any place where the level of trust changes, so anything crossing it must be checked. Examples: browser to API, one microservice to another, application to database, your system to a third-party API, one tenant's data to another tenant's, the CI pipeline to a public package feed, and a normal user context to an admin context. I mark them as dashed lines and review each crossing for authentication, authorization and validation.</p>` },
    { q: `How do you know a threat model is good enough?`, a: `<p>I check coverage and follow-through. Coverage: every element and every boundary crossing on the diagram has been walked through, and the assumptions are written down. Follow-through: every threat has a decision and an owner, every mitigation is a backlog item with a test, and the diagram still matches what is deployed. I also accept that it is never complete. The goal is to remove the most likely and most damaging problems early, then keep the model current.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-threat-modelling-practice — Worked example, attack trees, risk  */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-threat-modelling-practice'] = {
  hook: `Finding fifty threats is easy. The real skill is deciding which five to fix this sprint, and being able to explain why you left the rest.`,
  intro: `<p>The last lesson gave you the building blocks: the four questions, data flow diagrams, trust boundaries and STRIDE. This lesson puts them to work on a real feature from start to finish, the way a team would do it on a Tuesday afternoon.</p>
<p>Our example is <strong>ShareBox</strong>: a feature that lets a logged-in user upload a file and create a link so that someone else can download it. It sounds simple. It also touches almost every classic problem: logins, file uploads, links that leak, storage that might be public, and email.</p>
<p>You will also learn three tools for the second half of the job. An <span class="term">attack tree</span> shows the different routes an attacker could take to one goal. <span class="term">Risk rating</span> turns a long list of threats into an ordered one. And the <span class="term">four responses</span> (mitigate, avoid, transfer, accept) give you an honest answer for every threat, including the ones you choose not to fix.</p>
<p>Finally you will see how to run the session itself, how to keep the model alive after the meeting, and where other methods such as PASTA and LINDDUN fit.</p>`,
  realLife: {
    title: 'The school trip risk assessment',
    body: `<p>A teacher is planning a hiking trip for forty children. Before anyone books a bus, the teachers sit down with the route and list what could go wrong: a child gets lost, someone has an allergic reaction, the river is too high to cross, it rains.</p>
<p>Then they rate each one. Rain is very likely but mostly harmless. An allergic reaction is unlikely but could be very serious. And then they decide, in four different ways. They change the route so nobody crosses the river (<strong>avoid</strong>). They bring a first-aid kit and a list of allergies, and count heads at every stop (<strong>mitigate</strong>). They take out travel insurance (<strong>transfer</strong>). And they accept that people may get wet (<strong>accept</strong>). They write it all down, and next year they update the same sheet instead of starting again.</p>
<p>That sheet is a threat model with a risk register. Nothing in it is technical. It is just careful thinking, done early, by the people who know the route.</p>
<p><strong>How this showed up in the real world:</strong> more than one file-sharing product has learned the hard way that "anyone with the link" is a real security decision. Links that were short or predictable could be guessed, and links pasted into public pages stayed valid for years. None of that is an exotic hack. It is a design choice that nobody examined, which is exactly what a session like the one below is for.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Step 1: scope (what are we working on?)</h4>
<p>Write three short lists before you draw anything.</p>
<ul>
<li><strong>In scope:</strong> upload a file, create a share link, download through the link, revoke the link.</li>
<li><strong>Out of scope:</strong> the login system itself (it has its own model), billing.</li>
<li><strong>Assets:</strong> the files, the share links, user accounts, our storage bill and our email reputation.</li>
</ul>
<h4>Step 2: draw</h4>
<p>The first code tab has the full diagram. In words: the <strong>owner</strong> uses a browser to call our <strong>API</strong>. The API saves the file in <strong>blob storage</strong> and a row in the <strong>metadata database</strong>. A <strong>scanner</strong> checks the file for malware. A <strong>recipient</strong>, who has no account, opens the link and the API streams the file. Trust boundaries sit between the internet and the API, between the API and the data tier, and around the email provider.</p>
<h4>Step 3: find threats (what can go wrong?)</h4>
<p>Walk the diagram with STRIDE. A few of the twelve threats the team found:</p>
<ul>
<li><strong>Information disclosure:</strong> share links use short numbers, so a stranger can guess other people's links.</li>
<li><strong>Elevation of privilege:</strong> a user can create a link for a file that belongs to someone else.</li>
<li><strong>Denial of service:</strong> someone uploads enormous files until storage is full.</li>
<li><strong>Repudiation:</strong> a user shares a confidential file and later denies it.</li>
</ul>
<h4>Step 4: rate them</h4>
<p><span class="term">Risk</span> is how likely something is, multiplied by how bad it would be. You do not need exact numbers. A three-by-three grid is enough to sort a list.</p>
<table><thead><tr><th>Likelihood / Impact</th><th>Low impact</th><th>Medium impact</th><th>High impact</th></tr></thead><tbody>
<tr><td><strong>High likelihood</strong></td><td>Medium</td><td>High</td><td>Critical</td></tr>
<tr><td><strong>Medium likelihood</strong></td><td>Low</td><td>Medium</td><td>High</td></tr>
<tr><td><strong>Low likelihood</strong></td><td>Low</td><td>Low</td><td>Medium</td></tr>
</tbody></table>
<p>Guessable links are easy to try and expose private files: high likelihood, high impact, so <strong>Critical</strong>. Fix that first.</p>
<h4>Step 5: decide (what are we going to do about it?)</h4>
<table><thead><tr><th>Response</th><th>Meaning</th><th>ShareBox example</th></tr></thead><tbody>
<tr><td><strong>Mitigate</strong></td><td>Add a defence that lowers likelihood or impact</td><td>Long random link tokens that expire</td></tr>
<tr><td><strong>Avoid</strong></td><td>Remove the risky feature or design</td><td>Drop "public folder listing" from the release</td></tr>
<tr><td><strong>Transfer</strong></td><td>Move the risk to someone better placed</td><td>Use a managed malware-scanning service; buy cyber insurance</td></tr>
<tr><td><strong>Accept</strong></td><td>Live with it, on purpose, with a named owner</td><td>A recipient can forward a file after downloading it</td></tr>
</tbody></table>
<div class="callout tip">"Accept" is a real answer, but only when a named person with the authority to do so signs it and a review date is set. A risk nobody decided on is not accepted, it is ignored.</div>` },
    { name: 'Intermediate', body: `<h4>Running a 60-minute session</h4>
<p>Invite four to six people. More than that and half the room stops talking.</p>
<table><thead><tr><th>Role</th><th>Job in the room</th></tr></thead><tbody>
<tr><td>Facilitator</td><td>Keeps time, asks "what could go wrong here?", stops solution debates</td></tr>
<tr><td>Design owner</td><td>Explains how the feature really works and draws the diagram</td></tr>
<tr><td>Scribe</td><td>Writes every threat into the table as it is said</td></tr>
<tr><td>Tester or "attacker"</td><td>Thinks about misuse: what if I send this twice, as someone else, with a huge file?</td></tr>
<tr><td>Product owner</td><td>Knows what the data is worth and can accept a risk</td></tr>
</tbody></table>
<p>A simple agenda: 5 minutes on scope and assets, 15 minutes to draw and agree the diagram, 25 minutes to walk STRIDE (boundary crossings first), 10 minutes to rate and pick the top items, 5 minutes to assign owners. The second code tab has this agenda ready to copy.</p>
<h4>The threat table</h4>
<p>The output of the session is a table: an id, the element, the STRIDE type, the threat, the mitigation and a status. The first code tab shows all twelve rows for ShareBox. Keep it in the repository next to the code, not in a slide deck.</p>
<h4>Attack trees</h4>
<p>STRIDE looks at one element at a time. An <span class="term">attack tree</span> looks from the attacker's side. You write the attacker's <strong>goal</strong> at the top, for example "take over a user account". Under it you list the different ways to reach the goal. An <strong>OR</strong> node means any one child is enough. An <strong>AND</strong> node means all children are needed. You keep splitting until each leaf is a concrete action.</p>
<p>Trees show two useful things. First, the cheapest path: attackers take the easiest route, so the weakest OR branch sets your real security level. Second, good places to cut: a defence high up the tree, or on one child of an AND node, blocks many leaves at once. Multi-factor login, for example, cuts off almost the whole "get the password" branch.</p>
<h4>Rating methods you will hear about</h4>
<ul>
<li><strong>Likelihood x impact.</strong> The grid from the Beginner tab. Simple and good enough for most design reviews.</li>
<li><strong>DREAD.</strong> Score five things, usually 1 to 10, and average them: Damage, Reproducibility, Exploitability, Affected users, Discoverability. It is easy to explain, but it is criticised because scores are subjective. Two people rarely give the same numbers, and "discoverability" rewards hiding things. Microsoft, where it began, moved away from it. If you use it, use it only to sort, never as a precise measure.</li>
<li><strong>CVSS.</strong> The Common Vulnerability Scoring System gives a score from 0.0 to 10.0 based on things like how the attack is delivered, how complex it is, what privileges it needs and the effect on confidentiality, integrity and availability. Bands: Low up to 3.9, Medium 4.0 to 6.9, High 7.0 to 8.9, Critical 9.0 and above. It was built for scoring known vulnerabilities in software, so it fits scanner and pentest findings better than design-stage threats.</li>
</ul>
<div class="callout warn">Do not average away a disaster. A threat with low likelihood and catastrophic impact (all customer files public) deserves attention even if the grid says "Medium". Look at impact on its own as well.</div>
<h4>The risk register</h4>
<p>Each accepted or open risk gets an entry: what it is, the rating, the chosen response, the owner, and a review date. The template is in the second code tab.</p>` },
    { name: 'Expert', body: `<h4>Keeping the model alive</h4>
<p>A threat model dies when it lives in a wiki nobody opens. Practices that keep it useful:</p>
<ul>
<li><strong>Store it with the code.</strong> A markdown file with the diagram and table in the repository gets reviewed in pull requests.</li>
<li><strong>Every mitigation is a backlog item</strong> with the threat id in its title, and has an automated test where possible. "T-06: user A cannot share user B's file" is a normal integration test.</li>
<li><strong>Ask one question in design review:</strong> "does this change add an entry point, a data type, a third party or a trust boundary?" If yes, spend twenty minutes on the delta. If no, move on.</li>
<li><strong>Revisit after incidents and pentests.</strong> A finding the model missed tells you which question you forgot to ask.</li>
</ul>
<h4>Tools, in general terms</h4>
<p>The <strong>Microsoft Threat Modeling Tool</strong> lets you draw a DFD and generates candidate STRIDE threats per interaction from templates. <strong>OWASP Threat Dragon</strong> is an open-source diagramming tool with threat lists attached to elements. There are also "threat model as code" tools where you describe the system in a text file and generate the diagram and threats. All of them produce long lists that need human filtering. A whiteboard photo plus a good table beats a tool-generated report nobody read.</p>
<h4>Other methods and when they fit</h4>
<table><thead><tr><th>Method</th><th>Core idea</th><th>Use it when</th></tr></thead><tbody>
<tr><td><strong>PASTA</strong></td><td>Process for Attack Simulation and Threat Analysis. Seven stages from business objectives, through technical scope, decomposition, threat and vulnerability analysis and attack modelling, to risk and impact analysis.</td><td>A high-value system needs a risk-centred, business-linked analysis and you have time and specialists</td></tr>
<tr><td><strong>LINDDUN</strong></td><td>A privacy version of STRIDE: Linkability, Identifiability, Non-repudiation, Detectability, Disclosure of information, Unawareness, Non-compliance.</td><td>The system handles personal data and you need to answer privacy questions, not only security ones</td></tr>
<tr><td><strong>Attack trees</strong></td><td>Start from the attacker's goal and split into paths.</td><td>You want to study one high-impact goal in depth</td></tr>
<tr><td><strong>Abuser stories</strong></td><td>"As a fraudster, I want to reuse a one-time voucher so that I get free goods."</td><td>Agile teams who want threats in the same shape as user stories</td></tr>
</tbody></table>
<h4>Threat modelling in an agile team</h4>
<p>Do one fuller session when the product or a big epic starts. After that, keep it incremental: add abuser stories during refinement, add security acceptance criteria to stories that touch boundaries, and re-check the diagram each quarter. The unit of work is "the change", not "the system".</p>
<h4>How sessions fail</h4>
<ul>
<li><strong>Solution arguments.</strong> Ten minutes debating which hashing library to use. The facilitator parks it and moves on.</li>
<li><strong>Admiring the problem.</strong> Eighty threats, no ranking, no owners.</li>
<li><strong>Scope creep.</strong> Modelling the whole company instead of the feature.</li>
<li><strong>The missing person.</strong> Nobody in the room knows how the storage is really configured, so the team assumes.</li>
</ul>
<div class="callout idea">Measure the practice lightly: how many features with a new boundary got a model, how many mitigations shipped, and how many production findings were "already in the model" versus "missed". The last number tells you whether the sessions are any good.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Given a feature, can you produce a diagram, five real threats and a ranked plan in fifteen minutes?</li>
<li>Can you explain why you would <em>accept</em> a specific risk, and who should sign that?</li>
<li>Do you know the limits of scoring systems instead of treating a number as truth?</li>
</ul>` }
  ],
  flow: {
    title: 'The ShareBox session, minute by minute',
    steps: [
      { title: 'Scope and assets', desc: 'Minutes 0 to 5. In scope: upload, share link, download, revoke. Assets: the files, the links, accounts, storage cost, our email reputation.' },
      { title: 'Draw the DFD', desc: 'Minutes 5 to 20. Owner, recipient, API, scanner, blob storage, metadata DB, email provider. The team argues about one arrow, which is a good sign: the diagram is now honest.' },
      { title: 'Boundaries first', desc: 'Minutes 20 to 30. Every arrow crossing a dashed line is checked: authenticated, authorized, validated? The anonymous download link gets the most attention.' },
      { title: 'Walk STRIDE', desc: 'Minutes 30 to 45. The scribe fills the table: guessable links, sharing a file you do not own, public storage, oversized uploads, no audit trail. Twelve rows.' },
      { title: 'Grow one attack tree', desc: 'For the scariest goal, "take over a user account", the team sketches the paths. Multi-factor login cuts the biggest branch.' },
      { title: 'Rate', desc: 'Minutes 45 to 55. Each threat gets likelihood and impact. Two are Critical, four High. The rest are Medium or Low.' },
      { title: 'Decide and assign', desc: 'Mitigate the twelve threats in the table. Three more decisions: avoid one risk (drop public folder listing), transfer one (managed scanning), accept one (recipient can forward the file). Each has an owner.' },
      { title: 'Into the backlog', desc: 'Minutes 55 to 60. Mitigations become tickets named with threat ids. Tests are added. The table is committed next to the code.' }
    ]
  },
  code: [
    { lang: 'text', title: 'ShareBox threat model: scope, diagram and the 12-row threat table', code: `FEATURE: ShareBox - upload a file and share it with a link

SCOPE      in : upload, create link, download by link, revoke link
           out: login system (own model), billing
ASSETS     files, share links, user accounts, storage cost, email reputation

DATA FLOW DIAGRAM

 [ Owner ]                      [ Recipient ]            [ Email provider ]
 (has an account)               (no account)                    ^
     | 1. upload file                | 6. GET /s/{token}        | 5. "X shared a file"
     | 2. create link                |                          |
- - - - - - - - - - - - BOUNDARY A: internet / our cloud - - - - - - - - - - - -
     v                               v                          |
 (            ShareBox API - ASP.NET Core process               )
     | 3. write bytes        | 4. write/read rows         | 7. scan job
- - - - - - - - - - - - BOUNDARY B: app tier / data tier - - - - - - - - - - - -
     v                       v                            v
 == Blob storage ==    == Metadata DB ==            ( Scanner worker )
                       == Audit log ==

THREAT TABLE

 ID    Element         STRIDE  Threat                                          Mitigation                                      Status
 ----  --------------  ------  ----------------------------------------------  ----------------------------------------------  --------
 T-01  Owner           S       Attacker logs in with leaked passwords          Rate limit, MFA, breached-password check        Planned
 T-02  Flow 1 upload   T       File name with path characters overwrites       Server generates storage name (GUID); client    Done
                               another user's file                             name is stored as text only
 T-03  Flow 1 upload   T / E   Script or executable disguised as an image is   Allow-list types, check content, serve as       Planned
                               later served from our domain                    attachment from a separate domain, nosniff
 T-04  Flow 6 link     I       Stranger guesses links because ids are short    256-bit random token per link                   Done
 T-05  Flow 6 link     I       Forwarded or leaked link works forever          Expiry date, revoke button, download limit      Planned
 T-06  API             E       User creates a link for a file they do not own  Ownership check inside the query               Done
 T-07  Blob storage    I       Direct storage URL bypasses the API             Private container; API streams the file or      Done
                                                                               issues short-lived signed URLs
 T-08  Metadata DB     I       Database leak exposes working share tokens      Store only a hash of each token                 Planned
 T-09  API             D       Huge or endless uploads fill storage            Size limit, per-user quota, streaming, rate     Planned
                                                                               limit
 T-10  API             R       User denies sharing a confidential file         Audit log: who, file, link id, time, downloads  Planned
 T-11  Scanner         T       Infected file reaches recipients before the     Link stays "pending" until scan is clean;       Planned
                               scan finishes                                   quarantine on detection
 T-12  Email provider  S       "Share by email" is used to send phishing from  Fixed template, no free HTML, rate limit,       Planned
                               our domain                                      SPF / DKIM / DMARC

DECISIONS
 Mitigate : T-01 to T-12 except as noted below
 Avoid    : public folder listing is removed from this release
 Transfer : malware detection quality -> managed scanning service
 Accept   : a recipient can forward a file after downloading it (owner: product lead)` },
    { lang: 'text', title: 'Attack tree, risk matrix, risk register entry and session agenda', code: `ATTACK TREE - GOAL: take over a user account      (OR = any child works, AND = all needed)

 Take over a user account
 OR
 +-- 1. Get the password
 |    OR
 |    +-- 1.1 Try leaked passwords from other sites          -> rate limit, MFA
 |    +-- 1.2 Phish the user with a fake login page          -> MFA, passkeys
 |    +-- 1.3 Read it from our database
 |         AND
 |         +-- 1.3.1 Reach the database (injection, leaked backup)
 |         +-- 1.3.2 Crack weak password hashes              -> slow salted hashing
 +-- 2. Abuse password reset
 |    OR
 |    +-- 2.1 Guess or reuse a reset token                   -> long, single-use, short-lived
 |    +-- 2.2 Take over the user's mailbox first             -> MFA, alert on reset
 |    +-- 2.3 Talk support into changing the email address   -> support verification script
 +-- 3. Steal a live session
 |    OR
 |    +-- 3.1 Run script in the user's browser and read it   -> output encoding, CSP, HttpOnly
 |    +-- 3.2 Use a session left open on a shared computer   -> idle timeout, sign out everywhere
 +-- 4. Skip login entirely
      OR
      +-- 4.1 Call an API that does not check ownership      -> ownership check on every query
      +-- 4.2 Change a user id that the server trusts        -> take identity from the token only

 Reading it: MFA cuts most of branch 1 in one move. Branch 4 ignores login completely,
 so strong passwords do nothing there. The cheapest open leaf is your real security level.

RISK MATRIX
                      IMPACT
                 Low       Medium     High
 LIKELIHOOD
   High          Medium    High       CRITICAL
   Medium        Low       Medium     High
   Low           Low       Low        Medium

 T-04 guessable links : likelihood High, impact High   -> CRITICAL, fix before release
 T-06 share others' file: likelihood Medium, impact High -> High, fix before release
 T-12 phishing by email : likelihood Medium, impact Medium -> Medium, next sprint

RISK REGISTER ENTRY (one per open or accepted risk)
 Id            : R-014                 (link to threat T-05)
 Risk          : A leaked share link stays usable until it expires
 Rating        : likelihood Medium x impact Medium = Medium
 Response      : Mitigate (default expiry 7 days, revoke button) + Accept the rest
 Residual risk : Low
 Owner         : Product lead, ShareBox
 Accepted by   : Head of Engineering
 Review date   : next quarterly review, or on any change to link sharing

60-MINUTE SESSION AGENDA
 00-05  Goal, scope, assets                        (facilitator)
 05-20  Draw and agree the diagram                 (design owner)
 20-45  Find threats: boundary crossings, STRIDE   (everyone; scribe fills the table)
 45-55  Rate, pick the top items, choose responses (product owner decides on accept)
 55-60  Owners, tickets, date of next review       (facilitator)
 Rule: no solution debates longer than two minutes. Park them.` },
    { lang: 'csharp', title: 'Mitigating T-04, T-05, T-06 and T-08: unguessable, expiring, owner-checked share links', code: `using System.Security.Cryptography;
using Microsoft.AspNetCore.WebUtilities;
using Microsoft.EntityFrameworkCore;

// ShareDb, StoredFile and ShareLink are your own EF Core types.
public sealed class ShareLinkService
{
    private readonly ShareDb _db;
    private readonly TimeProvider _clock;

    public ShareLinkService(ShareDb db, TimeProvider clock) { _db = db; _clock = clock; }

    public async Task<string> CreateAsync(Guid fileId, Guid callerId, TimeSpan lifetime)
    {
        // T-06: the ownership check is part of the query. No owner match, no file.
        var file = await _db.Files.SingleOrDefaultAsync(f => f.Id == fileId && f.OwnerId == callerId);
        if (file is null) throw new KeyNotFoundException("File not found");

        // T-04: 32 bytes from the cryptographic random generator = 256 bits. Not guessable.
        byte[] raw = RandomNumberGenerator.GetBytes(32);
        string token = WebEncoders.Base64UrlEncode(raw);

        _db.ShareLinks.Add(new ShareLink
        {
            FileId    = file.Id,
            TokenHash = SHA256.HashData(raw),                 // T-08: a DB leak holds no working links
            ExpiresAt = _clock.GetUtcNow().Add(lifetime),     // T-05: links end on their own
            Revoked   = false
        });
        await _db.SaveChangesAsync();

        return token;   // shown to the owner once; the plain token is never stored
    }

    public async Task<StoredFile?> ResolveAsync(string token)
    {
        byte[] raw;
        try { raw = WebEncoders.Base64UrlDecode(token); }
        catch (FormatException) { return null; }
        if (raw.Length != 32) return null;

        byte[] hash = SHA256.HashData(raw);
        DateTimeOffset now = _clock.GetUtcNow();

        var link = await _db.ShareLinks
            .Include(l => l.File)
            .SingleOrDefaultAsync(l => l.TokenHash == hash && l.ExpiresAt > now && !l.Revoked);

        // Wrong, expired and revoked links all look the same to the caller: not found.
        return link?.File;
    }
}

// The matching test for the threat table:
//   T-06  user A calls CreateAsync with user B's file id  -> KeyNotFoundException
//   T-05  ResolveAsync after ExpiresAt                    -> null
//   T-04  two links for the same file never share a token` }
  ],
  pitfalls: [
    `Ending the session with a long list and no ranking. Rate every threat and pick the top few before people leave the room.`,
    `Treating a DREAD or CVSS number as a measurement. They are opinions in numeric form. Use them to sort, then apply judgement.`,
    `"Accepting" risks silently. Acceptance needs a named owner with the authority to accept, and a review date.`,
    `Letting the facilitator be the only one who talks. The best threats come from the developer who knows which shortcut was taken.`,
    `Modelling once and never again. Each new entry point, third party or data type needs a short update.`,
    `Fixing only what STRIDE found. Draw at least one attack tree for the worst outcome, because attackers chain small weaknesses.`
  ],
  checklist: [
    `Write scope, out-of-scope and assets before drawing anything`,
    `Invite the design owner, a tester, a product owner and a scribe to the session`,
    `Produce a threat table with id, element, STRIDE type, threat, mitigation and status`,
    `Draw an attack tree for the single worst outcome`,
    `Rate every threat by likelihood and impact and sort the list`,
    `Choose mitigate, avoid, transfer or accept for each threat and name an owner`,
    `Record accepted risks in a risk register with a review date`,
    `Create one backlog item and one test per mitigation, tagged with the threat id`,
    `Commit the diagram and table to the repository next to the code`
  ],
  quiz: [
    { q: `In an attack tree, what does an AND node mean?`, options: [`Any one of the child steps is enough`, `All of the child steps are needed to succeed`, `The step has already been mitigated`, `The step is out of scope`], answer: 1, why: `AND means every child is required. Blocking any single child of an AND node blocks that whole path.` },
    { q: `The team decides to remove "public folder listing" from the release because it is too risky. Which response is this?`, options: [`Mitigate`, `Transfer`, `Avoid`, `Accept`], answer: 2, why: `Avoiding a risk means removing the feature or design that causes it.` },
    { q: `What is the main criticism of DREAD?`, options: [`It needs expensive software to calculate`, `Scores are subjective and vary by person`, `It only works for cloud-hosted systems`, `It cannot be used together with STRIDE`], answer: 1, why: `DREAD scores depend heavily on who is scoring. It is fine for rough sorting but not as a precise measure.` },
    { q: `Share links in ShareBox used short sequential numbers. Which fix addresses the root cause?`, options: [`Hide the link in the page with a CSS rule`, `Use a long cryptographically random token`, `Add a longer session timeout for owners`, `Log every download with the caller's IP address`], answer: 1, why: `The weakness is that links can be guessed. A 256-bit random token makes guessing impractical. Logging helps detection but does not prevent it.` },
    { q: `Who should accept a risk?`, options: [`Whoever found it during the session`, `The developer who would have to fix it`, `A named person with the authority to own it`, `Nobody; every risk must be fully mitigated first`], answer: 2, why: `Acceptance is a business decision. It must be explicit, owned and revisited.` },
    { q: `Which method is designed specifically for privacy threats?`, options: [`PASTA`, `LINDDUN`, `Attack trees`, `DREAD`], answer: 1, why: `LINDDUN covers privacy threats such as linkability and identifiability. PASTA is a risk-centred security method, attack trees map the paths to one goal, and DREAD is a scoring system.` }
  ],
  takeaways: [
    `A threat model session produces a diagram, a threat table, ratings, decisions and owners in about an hour.`,
    `Attack trees start from the attacker's goal. The cheapest open path is your real level of security.`,
    `Risk is likelihood times impact. A simple three-by-three grid is enough to sort most lists.`,
    `Every threat gets one of four answers: mitigate, avoid, transfer or accept.`,
    `Scores such as DREAD and CVSS help you sort. They do not replace judgement.`,
    `The model lives in the repository and the backlog, and is updated when the design changes.`
  ],
  interview: [
    { q: `Walk me through how you would threat model a file-sharing feature.`, a: `<p>I start with scope and assets: upload, share link, download, revoke; the assets are the files, the links and the accounts. I draw a DFD with the owner, the anonymous recipient, the API, storage, the metadata database and any third parties, and mark trust boundaries. Then I walk STRIDE, starting with boundary crossings. Typical findings: guessable or never-expiring links, creating links for files you do not own, public storage, unsafe file types, oversized uploads and no audit trail. I rate them by likelihood and impact, choose a response for each, and turn mitigations into backlog items with tests.</p>` },
    { q: `What is an attack tree and why use one alongside STRIDE?`, a: `<p>An attack tree puts the attacker's goal at the root and breaks it into the paths that reach it, using OR and AND nodes. STRIDE examines one element at a time, so it can miss how small weaknesses chain together. The tree shows the cheapest path and where one control, such as multi-factor login, cuts many leaves at once. I usually draw one tree for the worst outcome of the system.</p>` },
    { q: `How do you prioritise threats?`, a: `<p>I rate likelihood and impact on a simple scale and sort by the product, then look at high-impact items separately so a rare disaster is not hidden by an average. For findings in existing software I use CVSS because it is the common language of scanners and advisories. I treat all scores as a way to order the list, then apply context: how exposed the component is, what data it touches and how cheap the fix is.</p>` },
    { q: `What are the four ways to respond to a risk?`, a: `<p>Mitigate: add a control that reduces likelihood or impact. Avoid: remove the feature or design that creates the risk. Transfer: move it to a party better placed to handle it, such as a managed service or insurer. Accept: decide to live with it. Acceptance must be explicit, signed by someone with the authority, recorded in a risk register and reviewed on a date.</p>` },
    { q: `How do you keep threat models from going stale?`, a: `<p>I keep the diagram and threat table in the repository, link each mitigation to a ticket and a test, and add one question to design review: does this change add an entry point, a data type, a third party or a trust boundary? If yes, we update the model for that delta. I also revisit after incidents and penetration tests to see what the model missed.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-design-principles — Least privilege, defence in depth, zero trust */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-design-principles'] = {
  hook: `Attack techniques change every year. The handful of design rules that defeat most of them were written down in the 1970s, and they still work.`,
  intro: `<p>A <span class="term">secure design principle</span> is a rule of thumb for building systems that stay safe even when something goes wrong. Principles are not products you buy or libraries you install. They are habits of design, like "give each part only the access it needs" or "when in doubt, say no".</p>
<p>Why learn principles and not just a list of attacks? Because attacks are endless and principles are few. If your database account can only read two tables, it does not matter which new injection trick appears next year: the damage is limited to those two tables. One principle, applied once, defeats a whole family of problems.</p>
<p>Most of these ideas come from a famous 1975 paper by Jerome Saltzer and Michael Schroeder. Newer names such as <span class="term">defence in depth</span> and <span class="term">zero trust</span> build on the same thinking.</p>
<p>In this lesson each principle gets a plain definition, a real-life picture, and where it fits, a small example in C# or configuration. By the end you should be able to look at any design and ask a dozen sharp questions about it.</p>`,
  realLife: {
    title: 'How a hotel keeps strangers out of your room',
    body: `<p>A hotel is a good security design, and you can see almost every principle in it. Your key card opens your room and the gym, not every room (<strong>least privilege</strong>). There is a front desk, a lift that needs a card, a room lock and a safe inside the room (<strong>defence in depth</strong>). If the card system loses power, the doors stay locked from the outside but still open from the inside (<strong>fail securely</strong>, without trapping people). A new card works for nothing until the desk programs it (<strong>secure by default</strong>). The lock checks your card every single time, even if you walked in a minute ago (<strong>complete mediation</strong>). And one employee cannot both issue a refund and approve it (<strong>separation of duties</strong>).</p>
<p>Notice also what the hotel does not rely on: nobody thinks the building is safe because guests do not know where the staff door is. The safety comes from the locks, not from secrets about the building.</p>
<p><strong>How this showed up in the real world:</strong> in one of the best-known breaches of the last decade, attackers entered a large credit bureau through a web application that had not been patched for a publicly known flaw. That first step was bad, but what turned it into a disaster was what came next: once inside, they were able to move from system to system and reach huge amounts of personal data over a long period. Systems on the inside trusted each other too much. Least privilege, network segmentation and "assume breach" exist for exactly that second half of the story.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Five principles to learn first</h4>
<p><strong>1. Least privilege.</strong> Give every user, service and account only the access it needs for its job, and nothing more. <em>Picture:</em> a cleaner gets a key to the offices, not to the safe. <em>In software:</em> the API's database account can read and write the tables it uses. It cannot drop tables or read the payroll schema. If the API is ever tricked, the attacker inherits only those small rights.</p>
<p><strong>2. Defence in depth.</strong> Use several layers of protection, so that one failure is not a breach. <em>Picture:</em> a castle has a moat, a wall, a gate and guards. <em>In software:</em> input validation, and parameterized queries, and a low-privilege database account, and monitoring. Each layer assumes the one before it might fail.</p>
<p><strong>3. Fail securely.</strong> When something breaks, the system should end up in the safe state. <em>Picture:</em> when a bank's vault timer fails, the vault stays shut. <em>In software:</em> if the permission service times out, the answer is "denied", not "allowed". An exception in a security check must never mean "let them through".</p>
<p><strong>4. Secure by default.</strong> The out-of-the-box settings are the safe ones. People have to take a deliberate step to make something less safe. <em>Picture:</em> a new phone asks you to set a screen lock during setup. <em>In software:</em> a new API endpoint requires login unless a developer explicitly marks it as public. New storage is private until someone chooses to share it.</p>
<p><strong>5. Minimise the attack surface.</strong> The <span class="term">attack surface</span> is everything an attacker can reach: endpoints, ports, features, admin pages, old API versions. Less surface means fewer places to make a mistake. <em>Picture:</em> a shop with one door is easier to guard than a shop with ten. <em>In software:</em> remove unused endpoints, close unused ports, turn off sample pages and debug features in production.</p>
<div class="callout tip">A quick test for any design: "If this one component is fully taken over, what can the attacker reach?" If the answer is "everything", you need more least privilege and more layers.</div>
<h4>How they work together</h4>
<table><thead><tr><th>Principle</th><th>Question to ask</th></tr></thead><tbody>
<tr><td>Least privilege</td><td>Does this account really need that permission?</td></tr>
<tr><td>Defence in depth</td><td>If this check fails, what catches the problem next?</td></tr>
<tr><td>Fail securely</td><td>What happens when this throws an exception or times out?</td></tr>
<tr><td>Secure by default</td><td>What does a new user, endpoint or bucket get if nobody configures it?</td></tr>
<tr><td>Minimise attack surface</td><td>Can we remove this instead of protecting it?</td></tr>
</tbody></table>` },
    { name: 'Intermediate', body: `<h4>Five more principles</h4>
<p><strong>6. Complete mediation.</strong> Check every access to every resource, every time. Do not check once and remember "this user is fine". <em>Picture:</em> the office door reads your badge each time, even if you left two minutes ago, because your badge may have been cancelled in between. <em>In software:</em> every API request re-checks that the caller may touch <em>this</em> record. Hiding a button in Angular is not a check. The server must decide.</p>
<p><strong>7. Separation of duties.</strong> Split a sensitive job so that no single person or account can do all of it. <em>Picture:</em> in a bank, one person prepares a large transfer and a different person approves it. <em>In software:</em> the developer who writes a change cannot be the only one who approves and deploys it. The account that runs the app is not the account that runs database migrations.</p>
<p><strong>8. Economy of mechanism (keep it simple).</strong> Small, simple security code is easier to get right and easier to review. <em>Picture:</em> a door with one good lock beats a door with a homemade system of pulleys nobody understands. <em>In software:</em> one shared authorization component, not a different hand-written check in every controller. Use the framework's features before inventing your own.</p>
<p><strong>9. Open design.</strong> Security must not depend on the design being secret. This is the opposite of <span class="term">security through obscurity</span>. <em>Picture:</em> everyone knows how a pin-tumbler lock works; it is still safe because the <em>key</em> is secret. <em>In software:</em> use published, reviewed algorithms such as AES. Assume attackers can read your client-side code and guess your URLs. An unlisted admin page with no login is not protected.</p>
<p><strong>10. Psychological acceptability.</strong> If the secure way is painful, people will find an insecure way around it. <em>Picture:</em> a fire door that is slow to open gets propped open with a chair. <em>In software:</em> forced password changes every month lead to passwords on sticky notes. A single sign-on with a passkey is both easier and safer. Make the safe path the easy path.</p>
<div class="callout warn">Obscurity is fine as an extra layer, never as the only one. Moving the admin page to an odd URL is harmless. Relying on that instead of a login is a breach waiting to happen.</div>
<h4>Seeing the principles in code</h4>
<p>The first code tab shows a small API that breaks four principles at once: it is open by default, it fails open, it trusts a check done earlier, and it runs with a powerful database account. The second tab fixes each one. The third shows least privilege at the database level, where it limits the damage of any bug above it.</p>
<h4>Least common mechanism</h4>
<p>One more from the original list: avoid sharing mechanisms between users or between trust levels when you do not need to. A cache shared by all tenants, a shared temp folder, a shared admin and customer login page. Shared things become paths for data to leak from one side to the other.</p>` },
    { name: 'Expert', body: `<h4>Zero trust</h4>
<p>The old model was a castle: a hard outer wall (the firewall) and a soft, trusted inside. Once you were on the internal network, systems believed you. That fails as soon as one laptop or one server inside is taken over.</p>
<p><span class="term">Zero trust</span> removes the idea of a trusted inside. Its short form is <strong>"never trust, always verify"</strong>. In practice:</p>
<ul>
<li><strong>Verify explicitly.</strong> Every request is authenticated and authorized using identity, device state and context, not network location. Being "on the VPN" proves nothing.</li>
<li><strong>Least privilege access.</strong> Give just enough access, just in time, and take it away again. Standing admin rights are replaced by short, approved elevation.</li>
<li><strong>Assume breach.</strong> Design as if an attacker is already inside. Segment networks, encrypt traffic between services, log everything, and limit how far one stolen credential can travel.</li>
</ul>
<p>For a .NET system this looks like: services call each other with their own identity (managed identity or mutual TLS) and each service checks the caller's token; databases accept connections only from specific services; secrets are short-lived; admin access goes through an approval step and is logged.</p>
<h4>Blast radius</h4>
<p><span class="term">Blast radius</span> is how much damage one failure can cause. Assume-breach thinking is mostly about shrinking it. Separate accounts per service, separate subscriptions for production and test, per-tenant encryption keys, and network rules that only allow the flows on your diagram. Ask of every credential: "if this leaks tonight, what is the worst morning?"</p>
<h4>When principles pull against each other</h4>
<ul>
<li><strong>Defence in depth vs economy of mechanism.</strong> More layers mean more complexity, and complexity breeds mistakes. Choose a few independent layers that fail in different ways. Three copies of the same check add little.</li>
<li><strong>Fail securely vs availability.</strong> Failing closed on a broken permission service means an outage. That is usually right for a bank transfer and may be wrong for a hospital door. Decide per feature, on purpose, and write it down.</li>
<li><strong>Least privilege vs developer speed.</strong> Tight permissions slow people down if requesting access takes days. Pair least privilege with fast, automated, logged elevation, or people will share an admin account.</li>
<li><strong>Complete mediation vs performance.</strong> Checking every call costs time. Cache decisions briefly and scope the cache to the user and resource, but never cache "allowed" across a permission change you cannot detect.</li>
</ul>
<h4>Fail-safe defaults in authorization logic</h4>
<p>The original name for "secure by default" is <strong>fail-safe defaults</strong>: base decisions on permission, not exclusion. An allow-list ("these roles may") fails closed when you forget a case. A block-list ("everyone except these") fails open. The same logic applies to input validation, CORS origins, outbound URLs and file types.</p>
<div class="callout idea">Review trick: read each authorization check and ask "what happens for a role that did not exist when this was written?". If the new role gets access by accident, the check is a block-list in disguise.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Can you give a concrete example of each principle from a system you built, including one you got wrong?</li>
<li>Can you explain zero trust without buzzwords, and say what changes in service-to-service calls?</li>
<li>Do you recognise trade-offs, such as when failing closed is the wrong choice?</li>
</ul>` }
  ],
  flow: {
    title: 'One stolen password meets a layered design',
    steps: [
      { title: 'Password stolen', desc: 'A support agent is phished and types their password into a fake page. Assume breach: the design expects this to happen one day.' },
      { title: 'Layer 1: MFA', desc: 'Defence in depth. The attacker has the password but not the second factor. Most attacks end here. Suppose this one gets past it with a stolen session.' },
      { title: 'Layer 2: least privilege', desc: 'The agent account can view tickets and issue small refunds. It cannot export customers, change roles or reach the admin console.' },
      { title: 'Layer 3: every request checked', desc: 'Complete mediation. The attacker tries the export API directly. The server checks the permission on each call and returns 403. A hidden button was never the defence.' },
      { title: 'Layer 4: two-person rule', desc: 'Separation of duties. A large refund needs approval from a second person. The request sits in a queue and looks odd to the approver.' },
      { title: 'Layer 5: detection', desc: 'Logins from a new country plus repeated 403 responses raise an alert. The session is revoked within minutes.' },
      { title: 'Small blast radius', desc: 'Result: a few tickets were read. No export, no admin access, no large refunds. No single layer was perfect, and none needed to be.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: open by default, fails open, checks once', code: `// Four principles broken in one small API. Do not copy this.
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddJwtBearer();
builder.Services.AddAuthorization();           // no fallback policy: endpoints are PUBLIC unless marked
builder.Services.AddHttpClient<PermissionClient>();
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// 1. NOT secure by default: the developer forgot RequireAuthorization, so anyone can call this.
app.MapGet("/reports/{id:int}", async (int id, ReportDb db) =>
    await db.Reports.FindAsync(id));

// 2. FAILS OPEN: if the permission service is down, everyone is treated as allowed.
static async Task<bool> CanDeleteAsync(PermissionClient permissions, string userId)
{
    try
    {
        return await permissions.HasAsync(userId, "reports.delete");
    }
    catch (HttpRequestException)
    {
        return true;   // "do not block users when the service is down" = security hole
    }
}

// 3. NO complete mediation: "isAdmin" was decided at login and is trusted from the request.
app.MapDelete("/reports/{id:int}", async (int id, bool isAdmin, ReportDb db) =>
{
    if (!isAdmin) return Results.Forbid();     // the caller chooses the value of isAdmin
    await db.Reports.Where(r => r.Id == id).ExecuteDeleteAsync();
    return Results.NoContent();
});

// 4. NO least privilege: appsettings uses a connection string for a db_owner account,
//    so any injection bug in any endpoint can read or drop every table.
app.Run();` },
    { lang: 'csharp', title: 'Fixed: deny by default, fail closed, check every request against this record', code: `using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddAuthentication().AddJwtBearer();

builder.Services.AddAuthorization(o =>
{
    // Secure by default: every endpoint needs a logged-in user unless it says AllowAnonymous.
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    // Allow-list, not block-list: only these roles may delete. New roles get nothing by accident.
    o.AddPolicy("CanDeleteReports", p => p.RequireRole("ReportAdmin"));
});
builder.Services.AddHttpClient<PermissionClient>();
var app = builder.Build();

app.UseAuthentication();
app.UseAuthorization();

// Complete mediation: the ownership rule is inside the query, on every request.
app.MapGet("/reports/{id:int}", async (int id, ClaimsPrincipal user, ReportDb db) =>
{
    string userId = user.FindFirstValue(ClaimTypes.NameIdentifier)!;
    var report = await db.Reports
        .Where(r => r.Id == id && r.OwnerId == userId)
        .Select(r => new { r.Id, r.Title, r.CreatedAt })   // return only what is needed
        .SingleOrDefaultAsync();
    return report is null ? Results.NotFound() : Results.Ok(report);
});

// Fail securely: any error in the check means "no". Log it so the outage is visible.
static async Task<bool> CanDeleteAsync(PermissionClient permissions, string userId, ILogger log)
{
    try
    {
        return await permissions.HasAsync(userId, "reports.delete");
    }
    catch (Exception ex) when (ex is HttpRequestException or TaskCanceledException)
    {
        log.LogError(ex, "Permission check failed for {UserId}; denying", userId);
        return false;
    }
}

// Identity and role come from the validated token, never from a request parameter.
app.MapDelete("/reports/{id:int}", async (int id, ReportDb db) =>
{
    int rows = await db.Reports.Where(r => r.Id == id).ExecuteDeleteAsync();
    return rows == 0 ? Results.NotFound() : Results.NoContent();
})
.RequireAuthorization("CanDeleteReports");

// The one public endpoint is public on purpose, and it is easy to find in a review.
app.MapGet("/health", () => Results.Ok()).AllowAnonymous();

app.Run();` },
    { lang: 'sql', title: 'Least privilege and separation of duties at the database', code: `-- The application account. It owns nothing and can change no schema.
-- (On Azure SQL with a managed identity: CREATE USER [shop-api] FROM EXTERNAL PROVIDER;)
CREATE USER shop_api WITHOUT LOGIN;   -- replace with your login or managed identity

-- Grant only what the API really does, table by table.
GRANT SELECT, INSERT, UPDATE ON dbo.Orders      TO shop_api;
GRANT SELECT                 ON dbo.Products    TO shop_api;
GRANT SELECT, INSERT         ON dbo.OrderItems  TO shop_api;

-- The audit log is append-only for the app: it can add rows, never change or remove them.
GRANT INSERT                 ON dbo.AuditLog    TO shop_api;
DENY  UPDATE, DELETE         ON dbo.AuditLog    TO shop_api;

-- Nothing is granted on dbo.Payroll or dbo.Users.PasswordHash, so the API cannot read them
-- even if a query is somehow altered. No db_owner, no ALTER, no DROP.

-- Separation of duties: schema changes use a different account,
-- available only to the release pipeline, not to the running app.
CREATE USER shop_migrator WITHOUT LOGIN;
ALTER ROLE db_ddladmin ADD MEMBER shop_migrator;

-- Reporting gets read-only access to a view that leaves out personal columns.
CREATE USER shop_reports WITHOUT LOGIN;
GRANT SELECT ON dbo.vw_OrderTotals TO shop_reports;

-- Check what an account can really do (run as an admin):
EXECUTE AS USER = 'shop_api';
SELECT * FROM fn_my_permissions('dbo.AuditLog', 'OBJECT');
REVERT;` }
  ],
  pitfalls: [
    `Running the app with a database owner or cloud admin account "to keep things simple". Every small bug then becomes a full compromise.`,
    `Catching an exception in a security check and returning true. When the check cannot run, the answer is no.`,
    `Relying on the frontend to hide what users must not do. Buttons are for convenience. The server enforces.`,
    `Treating an internal network as trusted. Internal services still authenticate and authorize each other.`,
    `Using block-lists ("everyone except guests"). New roles and new inputs slip through. Prefer allow-lists.`,
    `Adding security steps so painful that people work around them. An ignored control protects nothing.`
  ],
  checklist: [
    `Give each service its own account with only the permissions it uses`,
    `Set a deny-by-default fallback policy and mark public endpoints explicitly`,
    `Make every security check return "denied" when it errors or times out`,
    `Enforce authorization on the server for every request and every record`,
    `Use allow-lists for roles, input values, origins and outbound hosts`,
    `Remove unused endpoints, ports, features and old API versions`,
    `Require a second person for high-impact actions and for production deploys`,
    `Authenticate and encrypt service-to-service calls, even on internal networks`,
    `For each credential, write down what an attacker could reach if it leaked`
  ],
  quiz: [
    { q: `The permission service times out. What should a "fail securely" design do?`, options: [`Allow the request so users are not blocked`, `Deny the request and log the failure`, `Retry forever`, `Ask the browser whether the user is an admin`], answer: 1, why: `Failing securely means the safe state is the result of any failure. If the check cannot run, access is denied.` },
    { q: `Which is the best example of least privilege?`, options: [`All developers share one admin account`, `The API connects to the database as the schema owner`, `The API's database account can reach only the tables it uses`, `Every new user starts as an administrator`], answer: 2, why: `Least privilege gives each account only the access its job needs, which limits the damage of any bug or stolen credential.` },
    { q: `An admin page has no login but uses a long, unlisted URL. Which principle does this break?`, options: [`Open design`, `Separation of duties`, `Psychological acceptability`, `Economy of mechanism`], answer: 0, why: `This is security through obscurity. Open design says safety must not depend on attackers not knowing how the system is built.` },
    { q: `What does "never trust, always verify" mean in a zero trust design?`, options: [`Users must change their passwords every week without exception`, `Every request is checked on identity, not network location`, `Nobody is ever given access to production systems`, `Only firewalls at the network edge are trusted for security`], answer: 1, why: `Zero trust removes the trusted internal network. Every request proves who it is and is checked, wherever it comes from.` },
    { q: `Why is an allow-list safer than a block-list for authorization?`, options: [`It is faster to run at scale`, `It uses less memory per check`, `Forgotten cases are denied`, `It needs no testing afterwards`], answer: 2, why: `With an allow-list, a new role or unexpected value gets no access by default. With a block-list it slips through.` },
    { q: `Input validation, parameterized queries, a low-privilege database account and monitoring are all in place. Which principle is this?`, options: [`Complete mediation`, `Defence in depth`, `Least common mechanism`, `Open design`], answer: 1, why: `Defence in depth uses several independent layers so that the failure of one is not a breach.` }
  ],
  takeaways: [
    `Principles defeat whole families of attacks, including ones that do not exist yet.`,
    `Least privilege and defence in depth decide how bad a breach can get. Shrink the blast radius.`,
    `When a check fails or is forgotten, the result must be "no": fail securely and be secure by default.`,
    `Check every request on the server, every time. The frontend is never the enforcer.`,
    `Do not depend on secrecy of the design. Keep keys secret, not mechanisms.`,
    `Zero trust: verify explicitly, give least privilege access, and assume breach.`
  ],
  interview: [
    { q: `Explain least privilege and give an example from a .NET application.`, a: `<p>Least privilege means every user, service and account has only the access needed for its job. In a .NET app: the API's database user can read and write only the tables it uses and cannot alter schema; migrations run under a separate account in the pipeline; the app reads secrets through a managed identity that can get only its own secrets; and endpoints use policies so a support agent cannot call admin functions. The point is to limit the blast radius when something is compromised.</p>` },
    { q: `What is defence in depth? Is it not just redundancy?`, a: `<p>It is layering independent controls so that a single failure does not lead to a breach. It differs from simple redundancy because the layers should fail in different ways: validation at the edge, parameterized queries in data access, a restricted database account, encryption of sensitive columns and alerting on unusual queries. Three copies of the same check would share the same blind spot and add complexity without much safety.</p>` },
    { q: `What does zero trust mean in practice?`, a: `<p>There is no trusted internal network. Every request is authenticated and authorized using identity and context. Access is least privilege and often time-limited. And the design assumes an attacker may already be inside, so networks are segmented, service-to-service traffic is authenticated and encrypted, and everything is logged. Concretely: services use managed identities or mutual TLS, each service validates the caller's token and permissions, and data stores accept connections only from named services.</p>` },
    { q: `When would failing closed be the wrong choice?`, a: `<p>When denying access causes more harm than allowing it. Physical safety is the classic case: a fire exit must open when power fails. In software, a read-only status page or a clinical system in an emergency might choose availability. The key is that it is a deliberate, documented decision per feature with compensating controls such as extra logging and review, not an accidental catch block that returns true.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-architecture — Secure architecture patterns & security requirements */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-architecture'] = {
  hook: `A secure system is not one where every developer remembers every rule. It is one where the architecture makes the safe thing happen even when someone forgets.`,
  intro: `<p>So far you have learned how to find threats and which principles defeat them. This lesson is about turning both into two concrete things: <span class="term">security requirements</span> that sit in the backlog next to features, and <span class="term">architecture</span> choices that put each defence in the right place.</p>
<p>A <span class="term">security requirement</span> is a statement of what the system must do, or must never allow, to stay safe. "Sessions end after 15 minutes without activity" is one. Good requirements are specific and testable, exactly like good feature requirements.</p>
<p><span class="term">Security architecture</span> answers questions such as: where do we check who the caller is? Where do we check what they may do? Which parts can talk to which? Where do secrets live? How do we keep one customer's data apart from another's? Get these right once, in shared building blocks, and every team that builds on top inherits the protection.</p>
<p>You will learn how to write abuse cases, where each kind of control belongs (edge, gateway, service, database), how services prove their identity to each other, how to isolate tenants, and how to review an architecture diagram for gaps.</p>`,
  realLife: {
    title: 'An airport is a security architecture you can walk through',
    body: `<p>Think about the last time you took a flight. The airport is divided into zones: the public hall, the area after security, the gate, the aircraft, the baggage area, the control tower. Each time you move to a more sensitive zone there is a check, and the check fits the zone. The hall needs nothing. Airside needs a boarding pass and a scan. The gate checks that <em>your</em> pass matches <em>this</em> flight. The tower needs a staff badge very few people hold.</p>
<p>Notice the design choices. Identity is checked centrally, once, at security. But the final decision, "may this person board this plane?", is made at the gate by the people who know the flight. Passengers of one airline cannot wander onto another airline's aircraft. Baggage moves on separate belts that passengers cannot reach. And a problem in one terminal can be closed off without shutting down the whole airport.</p>
<p>Software is the same: central identity, local decisions, separate zones, separate tenants, and limited damage when one area fails.</p>
<p><strong>How this showed up in the real world:</strong> a large bank running in the cloud suffered a breach that exposed data on a very large number of customers. A misconfigured component at the edge of the system was tricked into requesting temporary cloud credentials, and the role behind those credentials could read far more storage than that component ever needed. Two architecture lessons in one incident: a control at the edge was trusted too much, and a wide-open permission turned a small mistake into a huge blast radius.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Security requirements</h4>
<p>There are two kinds, and you need both.</p>
<ul>
<li><strong>Functional security requirements</strong> are features users can see. "Users can turn on two-step login." "Admins can see who exported data and when." "A user can sign out of all devices."</li>
<li><strong>Non-functional security requirements</strong> are qualities of the whole system. "All traffic uses TLS." "Passwords are stored with a slow, salted hash." "No service can reach the database except the order API."</li>
</ul>
<p>A good requirement can be tested. Compare "the system must be secure" (untestable) with "after 5 failed logins in 10 minutes, the account is locked for 15 minutes and the user is emailed" (a tester can check it in two minutes).</p>
<div class="callout tip">You do not have to invent requirements from nothing. The OWASP Application Security Verification Standard (ASVS) is a free catalogue of testable requirements, grouped by topic such as authentication, sessions, access control, validation and logging, with levels of strictness. Teams pick the level that fits their risk and copy the relevant items into their backlog.</div>
<h4>Abuse cases</h4>
<p>A <span class="term">use case</span> describes what a user wants to do. An <span class="term">abuse case</span> describes what someone might do that you do not want. Write them side by side.</p>
<table><thead><tr><th>Use case</th><th>Abuse case</th><th>Requirement that follows</th></tr></thead><tbody>
<tr><td>A customer applies a discount code</td><td>A customer tries thousands of codes to find a valid one</td><td>Max 5 attempts per order; codes are long and random</td></tr>
<tr><td>A user resets a forgotten password</td><td>An attacker uses reset to discover which emails have accounts</td><td>Same reply whether or not the email exists</td></tr>
<tr><td>A user downloads their invoice</td><td>A user changes the invoice number in the URL</td><td>API returns 404 unless the caller owns the invoice</td></tr>
</tbody></table>
<h4>Where controls live</h4>
<p>Think of a request travelling inward through layers. Each layer has a job it is good at.</p>
<table><thead><tr><th>Layer</th><th>Good at</th><th>Cannot do</th></tr></thead><tbody>
<tr><td><strong>Edge</strong> (CDN, web application firewall)</td><td>TLS, blocking floods and obviously bad traffic, hiding your servers</td><td>Know your business rules or who owns which record</td></tr>
<tr><td><strong>API gateway</strong></td><td>Checking the token is valid, rate limits, routing, request size limits</td><td>Decide whether this user may edit this order</td></tr>
<tr><td><strong>Service</strong> (your ASP.NET Core code)</td><td>Authorization on each record, input validation, business rules, audit logging</td><td>Stop a flood before it reaches you</td></tr>
<tr><td><strong>Database</strong></td><td>Last line: permissions per account, constraints, encryption, row filters</td><td>Understand intent</td></tr>
</tbody></table>
<p>The most common architecture mistake is expecting an outer layer to do an inner layer's job. A firewall cannot know that invoice 1042 belongs to someone else. Only the service can.</p>` },
    { name: 'Intermediate', body: `<h4>Central authentication, local authorization</h4>
<p>Do not let every service build its own login. Use one <span class="term">identity provider</span> (for example Microsoft Entra ID or another OpenID Connect provider). Users sign in there and receive a signed <span class="term">token</span>. The gateway and each service validate the token: signature, issuer, audience and expiry.</p>
<p>Authorization is different. "May Priya refund order 77?" depends on business data, so the decision belongs in the service that owns orders. A good split:</p>
<ul>
<li><strong>Identity provider:</strong> who are you, which roles or groups do you have.</li>
<li><strong>Gateway:</strong> is the token valid at all; coarse rules like "only staff may reach /admin".</li>
<li><strong>Service:</strong> fine-grained rules on the specific record, every request.</li>
</ul>
<h4>The browser is outside the boundary</h4>
<p>Your Angular app runs on the user's machine. Anything it checks can be skipped. Treat it as a helpful user interface, not as part of your defences. Many teams also add a small <span class="term">backend for frontend</span> (BFF): a server component that holds tokens in a secure cookie session so they never sit in browser storage.</p>
<h4>Service-to-service identity</h4>
<p>When the order service calls the payment service, the payment service must know who is calling. "It came from inside the network" is not an answer. Common options:</p>
<ul>
<li><strong>Managed identity:</strong> the cloud platform gives each service its own identity and short-lived tokens. No passwords in configuration.</li>
<li><strong>Mutual TLS (mTLS):</strong> both sides present a certificate, so each proves its identity to the other and traffic is encrypted.</li>
<li><strong>Passing user context:</strong> the call also carries who the end user is, so the downstream service can apply its own rules instead of blindly trusting the caller.</li>
</ul>
<h4>Network segmentation</h4>
<p>Put components in separate network zones and allow only the flows on your diagram. The web tier can reach the API. The API can reach its database. Nothing on the internet can reach the database directly. Data stores use private endpoints, not public addresses. If one zone is compromised, the attacker cannot simply connect to everything else.</p>
<h4>Secrets and keys as a service</h4>
<p>Connection strings, API keys and encryption keys live in a vault (for example Azure Key Vault), not in code or configuration files. Services read them at runtime using their own identity. Keys are rotated on a schedule, and access to the vault is logged. This gives you one place to audit and one place to revoke.</p>
<h4>The paved road</h4>
<p>A <span class="term">paved road</span> is a set of shared templates and libraries with safe defaults built in: a service template that already has token validation, a deny-by-default policy, security headers, structured logging and health checks. Teams that take the paved road get security for free. Teams that leave it must explain why. This scales far better than asking every developer to remember every rule.</p>
<div class="callout warn">Security at the gateway only is a trap. If any path reaches a service without passing the gateway (an internal call, a queue message, a forgotten port), there is no check at all. Each service validates the token itself.</div>` },
    { name: 'Expert', body: `<h4>Multi-tenant isolation</h4>
<p>A <span class="term">tenant</span> is one customer organisation in a shared product. The worst bug in such a product is tenant A seeing tenant B's data. There are three main models.</p>
<table><thead><tr><th>Model</th><th>How it works</th><th>Strength</th><th>Cost and risk</th></tr></thead><tbody>
<tr><td><strong>Shared tables</strong></td><td>One database, every row has a TenantId, every query filters on it</td><td>Cheapest, simplest to operate</td><td>One missing filter leaks data. Needs automatic filters, row-level security and tests</td></tr>
<tr><td><strong>Schema per tenant</strong></td><td>One database, separate schema and database user per tenant</td><td>Database permissions enforce the wall</td><td>Migrations run once per schema; many objects to manage</td></tr>
<tr><td><strong>Database per tenant</strong></td><td>Each tenant has its own database, sometimes its own encryption key</td><td>Strongest isolation, easy per-tenant backup, restore and deletion</td><td>Highest cost and operational effort</td></tr>
</tbody></table>
<p>Whichever you choose, follow three rules. The tenant id comes from the <strong>validated token</strong>, never from a header, URL or body the caller controls. The filter is applied <strong>automatically</strong> in one shared place, not hand-written in each query. And there is an automated test that logs in as tenant A and tries to read tenant B's records through every endpoint. The third code tab shows the first two rules with EF Core.</p>
<p>Isolation also covers shared resources: cache keys include the tenant id, file paths include the tenant id, background jobs carry tenant context, and one tenant's heavy load is limited by quotas so it cannot starve the others (the "noisy neighbour" problem).</p>
<h4>Designing for a small blast radius</h4>
<ul>
<li>One identity per service, each with narrow permissions. No shared "app" account.</li>
<li>Separate cloud accounts or subscriptions for production and non-production.</li>
<li>Per-tenant or per-dataset encryption keys, so one key leak is not total.</li>
<li>Outbound traffic restricted to known destinations, so a tricked service cannot call anywhere.</li>
<li>Admin functions on a separate path with stronger login, approval and full logging.</li>
</ul>
<h4>An architecture review, question by question</h4>
<ol>
<li><strong>Entry points:</strong> is every way in listed, including queues, webhooks, admin tools and file imports?</li>
<li><strong>Identity:</strong> for each arrow, how does the receiver know who is calling?</li>
<li><strong>Authorization:</strong> where exactly is the record-level decision made? Is it deny by default?</li>
<li><strong>Data:</strong> where does sensitive data rest and travel? Encrypted in both? Who holds the keys?</li>
<li><strong>Isolation:</strong> what separates tenants, environments and tiers?</li>
<li><strong>Secrets:</strong> any in code, config or pipelines? How are they rotated?</li>
<li><strong>Failure:</strong> what happens when the identity provider, vault or a dependency is down?</li>
<li><strong>Visibility:</strong> would we notice an attack? Which events are logged and alerted?</li>
<li><strong>Third parties:</strong> what can each one reach, and what if it is compromised?</li>
</ol>
<div class="callout idea">Draw the diagram twice: once as designed, once marking what an attacker can reach after taking over each single component. The second drawing is the one that changes designs.</div>
<h4>Trade-offs to be ready to discuss</h4>
<p>Central policy engines give consistency but add a dependency every request needs. Database-per-tenant gives strong isolation but slows schema changes. A BFF protects tokens but is one more service to run. Good answers name the risk being reduced, the cost, and why the balance fits this product.</p>` }
  ],
  flow: {
    title: 'One request through a layered architecture',
    steps: [
      { title: 'Edge', desc: 'The browser connects over TLS to the CDN and web application firewall. Floods and clearly malformed requests are dropped here. The origin servers are not directly reachable.' },
      { title: 'Gateway', desc: 'The API gateway checks that the access token is present, correctly signed, not expired and meant for this API. It applies a rate limit and a request size limit.' },
      { title: 'Service: who', desc: 'The order service validates the token again itself. It reads the user id and tenant id from the token, never from the request body.' },
      { title: 'Service: may they', desc: 'Authorization on the record: does this user, in this tenant, with this role, have the right to update order 77? Deny by default.' },
      { title: 'Service: is it valid', desc: 'Input is validated against the expected type, size and range. Prices are looked up on the server, not taken from the request.' },
      { title: 'Database', desc: 'The service connects with its own low-privilege identity over a private network path. A tenant filter is added to the query automatically.' },
      { title: 'Downstream call', desc: 'The service calls the payment service using its managed identity and passes the user context. The payment service checks both.' },
      { title: 'Record it', desc: 'An audit entry and structured logs are written: who, what, which record, result. Alerts watch for unusual patterns such as many 403 responses.' }
    ]
  },
  code: [
    { lang: 'text', title: 'Reference architecture for a .NET + Angular product, with where each control lives', code: `                         [ Users ]              [ Identity provider ]
                             |   sign in (OIDC, MFA)   ^
                             v                         |
 ZONE 0  INTERNET  - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                             |
                    ( CDN + WAF / edge )        TLS, DDoS protection, bot rules,
                             |                  static Angular files, security headers
 ZONE 1  PUBLIC EDGE - - - - - - - - - - - - - - - - - - - - - - - - - - - - - -
                             |
                    ( API gateway / BFF )       token validation, rate limits,
                             |                  size limits, routing, CORS, session cookie
 ZONE 2  APPLICATION (private network) - - - - - - - - - - - - - - - - - - - - -
              +--------------+---------------+
              v                              v
      ( Order service )  -- mTLS / -->  ( Payment service )
      ASP.NET Core         managed       ASP.NET Core
      - validates token    identity      - validates caller + user context
      - record-level authZ               - talks to payment provider (allow-listed egress)
      - input validation
      - audit logging
              |                              |
 ZONE 3  DATA (no public endpoints) - - - - - - - - - - - - - - - - - - - - - - -
              v                              v
      == Orders DB ==                 == Payments DB ==       each service: own DB,
      tenant filter, least-           encrypted at rest       own low-privilege identity
      privilege user, encrypted at rest

 SHARED PLATFORM SERVICES (reached with managed identity, access logged)
      [ Key vault ]   secrets, keys, certificates; rotation
      [ Log / SIEM ]  central logs, alerts, audit trail (append-only)
      [ CI/CD ]       separate deploy identity; migrations run here, not in the app

 RULES OF THE DIAGRAM
  1. Only the flows drawn are allowed by network rules. Everything else is denied.
  2. Every arrow carries an identity. No call is trusted for coming from inside.
  3. Authentication is central. Authorization on records lives in the owning service.
  4. No secret is stored in code, images or pipeline variables in plain form.
  5. Production and non-production are separate accounts with separate identities.
  6. Admin tools use a separate entry point with stronger login and full logging.` },
    { lang: 'text', title: 'Security requirements and an abuse case template', code: `SECURITY REQUIREMENTS - written so a tester can check them

 FUNCTIONAL
  SR-01  Users can enable two-step login with an authenticator app or passkey.
  SR-02  Users can see their active sessions and sign out of all of them.
  SR-03  Tenant admins can export an audit log of data exports and role changes.

 NON-FUNCTIONAL
  SR-10  All external and service-to-service traffic uses TLS 1.2 or higher.
  SR-11  Every API endpoint requires a valid token unless listed as public in docs/public-endpoints.md.
  SR-12  A user can only read or change records of their own tenant. Verified by automated
         cross-tenant tests on every endpoint.
  SR-13  After 5 failed logins in 10 minutes the account is locked for 15 minutes.
  SR-14  Sessions expire after 15 minutes idle and 12 hours in total.
  SR-15  No secret appears in source control. Secret scanning blocks the merge.
  SR-16  Security events (login, failed login, role change, export, refund) are logged with
         user id, tenant id, time and result, and kept for 12 months.

 BAD vs GOOD
  Bad : "The system must be secure against attacks."
  Good: "GET /invoices/{id} returns 404 when the invoice belongs to another tenant."

ABUSE CASE TEMPLATE

  Id            : AC-07
  Related story : US-112 "As a customer I can apply a discount code at checkout"
  Abuser        : A customer who wants discounts they are not entitled to
  Goal          : Find valid codes by trying many, or reuse a single-use code
  How           : Scripted requests to POST /cart/discount; replaying a used code
  Impact        : Lost revenue; codes for partners leak
  Controls      : Codes are 16+ random characters; max 5 attempts per cart and per hour;
                  single-use codes are marked used in the same transaction as the order
  Acceptance    : 6th attempt returns 429. Second use of a single-use code returns 409.
  Residual risk : Low. Owner: checkout team.

  As an abuser story:
  "As a fraudster, I want to try many discount codes quickly so that I can find a valid one."` },
    { lang: 'csharp', title: 'Tenant isolation in one shared place: tenant from the token, filter applied automatically', code: `using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

public interface ITenantContext { Guid TenantId { get; } }

// The tenant comes from the VALIDATED token. Never from a header, query string or body.
public sealed class HttpTenantContext : ITenantContext
{
    private readonly IHttpContextAccessor _http;
    public HttpTenantContext(IHttpContextAccessor http) { _http = http; }

    public Guid TenantId
    {
        get
        {
            string? claim = _http.HttpContext?.User.FindFirstValue("tenant_id");
            return Guid.TryParse(claim, out var id)
                ? id
                : throw new UnauthorizedAccessException("No tenant in token");   // fail closed
        }
    }
}

public sealed class Invoice
{
    public int Id { get; set; }
    public Guid TenantId { get; set; }
    public decimal Total { get; set; }
}

public sealed class AppDb : DbContext
{
    private readonly ITenantContext _tenant;
    public AppDb(DbContextOptions<AppDb> options, ITenantContext tenant) : base(options) { _tenant = tenant; }

    private Guid CurrentTenantId => _tenant.TenantId;
    public DbSet<Invoice> Invoices => Set<Invoice>();

    protected override void OnModelCreating(ModelBuilder model)
    {
        // Every query on Invoice gets "WHERE TenantId = current tenant" added automatically.
        model.Entity<Invoice>().HasQueryFilter(i => i.TenantId == CurrentTenantId);
        model.Entity<Invoice>().HasIndex(i => new { i.TenantId, i.Id });
    }

    public override Task<int> SaveChangesAsync(CancellationToken ct = default)
    {
        // New rows are stamped with the caller's tenant. Code cannot forget it or fake it.
        foreach (var entry in ChangeTracker.Entries<Invoice>())
            if (entry.State == EntityState.Added) entry.Entity.TenantId = CurrentTenantId;
        return base.SaveChangesAsync(ct);
    }
}

// Program.cs
//   builder.Services.AddHttpContextAccessor();
//   builder.Services.AddScoped<ITenantContext, HttpTenantContext>();
//   builder.Services.AddDbContext<AppDb>(o => o.UseSqlServer(connectionString));
//
// An endpoint no longer needs to remember the filter:
//   app.MapGet("/invoices/{id:int}", async (int id, AppDb db) =>
//       await db.Invoices.SingleOrDefaultAsync(i => i.Id == id) is { } inv
//           ? Results.Ok(inv) : Results.NotFound());
//
// Keep IgnoreQueryFilters() out of normal code, review every use, and add a second wall
// in the database (row-level security or separate schemas) for defence in depth.` }
  ],
  pitfalls: [
    `Writing requirements nobody can test, such as "must be secure". If a tester cannot check it, it will not be built.`,
    `Doing all security at the gateway. Any path that skips the gateway then has no checks. Each service validates tokens and authorizes records itself.`,
    `Taking the tenant id from a request header or URL. The caller controls those. Use the validated token.`,
    `One shared service account for everything. A single leak then reaches every database and queue.`,
    `Giving data stores public endpoints "temporarily". Temporary openings are how data ends up on the internet.`,
    `Relying on each developer to add filters and headers by hand. Put safe defaults in shared templates and libraries.`
  ],
  checklist: [
    `Write testable security requirements and abuse cases for each feature that crosses a boundary`,
    `Use one identity provider and validate tokens in the gateway and in every service`,
    `Make record-level authorization decisions in the service that owns the data`,
    `Give each service its own identity and authenticate every service-to-service call`,
    `Place data stores on private network paths with no public endpoints`,
    `Read all secrets and keys from a vault using the service's own identity`,
    `Take the tenant id from the token and apply the tenant filter in one shared place`,
    `Run automated cross-tenant access tests against every endpoint`,
    `Ship a service template with deny-by-default, security headers and logging built in`,
    `Review the architecture diagram with the nine-question checklist before building`
  ],
  quiz: [
    { q: `Which is the best-written security requirement?`, options: [`The application shall be secure against all known and future attacks.`, `Hackers must never be able to get in through the login page or the API.`, `After 5 failed logins in 10 minutes, the account is locked for 15 minutes.`, `Use industry best practices for all passwords, sessions and account lockouts.`], answer: 2, why: `It is specific and testable. A tester can perform the steps and observe the result.` },
    { q: `Where should the decision "may this user edit this particular order?" be made?`, options: [`In the Angular app`, `In the web application firewall`, `In the service that owns orders`, `In the CDN`], answer: 2, why: `Only the owning service has the business data needed for a record-level decision. Outer layers cannot know who owns which order.` },
    { q: `In a multi-tenant app, where should the tenant id for a request come from?`, options: [`A query string parameter`, `A custom HTTP header set by the frontend`, `The validated access token`, `A hidden form field`], answer: 2, why: `The caller controls headers, URLs and bodies. Only a claim in a validated, signed token can be trusted.` },
    { q: `What is an abuse case?`, options: [`A bug report from a customer about a broken feature`, `A description of how a feature could be misused`, `A performance test with unusually heavy load`, `A list of users banned for breaking the rules`], answer: 1, why: `Abuse cases describe unwanted behaviour so you can turn it into requirements and tests.` },
    { q: `Why is "the call came from inside our network" a weak reason to trust it?`, options: [`Internal networks are slower than the public internet`, `A compromised internal machine can make the same call`, `Internal calls cannot be encrypted with TLS at all`, `Tokens do not work between internal services`], answer: 1, why: `Network location is not identity. Services should authenticate each other with managed identities or mutual TLS.` },
    { q: `Which tenant isolation model gives the strongest separation, at the highest cost?`, options: [`Shared tables with a TenantId column`, `Schema per tenant`, `Database per tenant`, `One table per feature`], answer: 2, why: `A separate database per tenant gives the strongest wall and easy per-tenant backup and deletion, but costs the most to run.` }
  ],
  takeaways: [
    `Security requirements must be specific and testable. Catalogues such as OWASP ASVS give you a starting list.`,
    `Write an abuse case next to each risky use case, then turn it into controls and acceptance tests.`,
    `Each layer has a job: edge stops floods, gateway validates tokens, the service decides on records, the database is the last wall.`,
    `Authenticate centrally, authorize locally, and give every service its own identity.`,
    `Tenant id from the token, filter in one shared place, and tests that try to cross the wall.`,
    `Build safe defaults into shared templates so the easy path is the secure path.`
  ],
  interview: [
    { q: `How do you turn security into requirements a team will actually build?`, a: `<p>I write them like any other requirement: specific, testable and attached to a story. I start from the threat model and from a catalogue such as OWASP ASVS, pick the items that match our risk level, and phrase each with an acceptance test, for example "GET /invoices/{id} returns 404 for another tenant's invoice". For risky features I add abuse cases next to the use cases, so misuse is discussed during refinement and not after release.</p>` },
    { q: `Where do you put authentication and authorization in a microservice architecture?`, a: `<p>Authentication is central: one identity provider issues signed tokens, and the gateway and every service validate them. Authorization is layered. The gateway applies coarse rules. The service that owns the data makes the record-level decision on every request, deny by default. Services call each other with their own identity, by managed identity or mutual TLS, and pass the user context so the downstream service can apply its own rules.</p>` },
    { q: `Compare tenant isolation models.`, a: `<p>Shared tables with a TenantId are cheapest but one missing filter leaks data, so you need automatic query filters, row-level security and cross-tenant tests. Schema per tenant lets database permissions enforce the wall, at the cost of running migrations per schema. Database per tenant is the strongest and simplifies per-tenant backup, deletion and keys, but is the most expensive to operate. In every model the tenant id must come from the validated token and shared resources such as caches and file paths must be tenant-scoped.</p>` },
    { q: `What do you look for when reviewing an architecture diagram for security?`, a: `<p>I list every entry point, including queues, webhooks and admin tools. For each arrow I ask how the receiver knows who is calling and where authorization happens. I check where sensitive data rests and travels, how it is encrypted and who holds the keys. I look at isolation between tenants, tiers and environments, at where secrets live, at what happens when a dependency fails, and at whether we would detect an attack. Finally I ask, for each component, what an attacker could reach after taking it over.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-sdlc — Secure SDLC & shifting left                              */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-sdlc'] = {
  hook: `You cannot test security into a product at the end, any more than you can add crumple zones to a car after it leaves the factory.`,
  intro: `<p>The <span class="term">software development life cycle</span> (SDLC) is the path every piece of software follows: someone has an idea, the team designs it, writes the code, builds it, tests it, releases it and then runs it in production.</p>
<p>A <span class="term">secure SDLC</span> adds a small, fitting security activity to each of those stages. Requirements get security requirements. Design gets a threat model. Coding gets safe patterns and automatic checks in the editor. The build gets scanners. Testing gets security tests. Release gets a final check. Operations gets monitoring and patching. Security stops being one big, scary gate at the end and becomes many small habits along the way.</p>
<p><span class="term">Shifting left</span> is the short name for this idea. If you draw the life cycle as a line from left (idea) to right (production), shifting left means doing security work earlier on that line, where problems are cheaper and easier to fix.</p>
<p>This lesson walks through each stage, shows what "good" looks like for a .NET and Angular team, and introduces the people side: security champions, a definition of done, and the well-known frameworks Microsoft SDL and OWASP SAMM.</p>`,
  realLife: {
    title: 'How a car factory builds safety in',
    body: `<p>A car maker does not build a car and then ask, on the last day, "is it safe?". Safety is in every stage. The requirements say what crash rating the car must reach. The designers model crumple zones on a computer before any metal is cut. On the line, each station has checks: this bolt is tightened to this force, and a sensor confirms it. Finished cars are crash-tested. And after the car is sold, the maker watches for problems and recalls cars when a fault is found.</p>
<p>Now think about cost. Moving a crumple zone in the design software takes an afternoon. Changing it after the tooling is made costs a fortune. Changing it after a million cars are on the road means a recall, lawsuits and newspaper headlines. Same flaw, three very different bills. Software works the same way, which is the whole argument for shifting left.</p>
<p><strong>How this showed up in the real world:</strong> in the early 2000s a series of fast-spreading worms hit Windows systems around the world. Microsoft responded by pausing feature work on major products so engineers could be trained in security and review existing code. Out of that effort came the Security Development Lifecycle (SDL): a defined set of security practices that every product team had to follow at each stage. It became one of the most copied models in the industry, and the reason is simple. Patching flaws one by one after release was not working. Building security into the process did.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>One security habit per stage</h4>
<table><thead><tr><th>Stage</th><th>The normal question</th><th>The security question</th><th>Activity</th></tr></thead><tbody>
<tr><td><strong>Requirements</strong></td><td>What should it do?</td><td>What must it never allow?</td><td>Security requirements, abuse cases, data classification</td></tr>
<tr><td><strong>Design</strong></td><td>How will we build it?</td><td>What could go wrong?</td><td>Threat model, design review</td></tr>
<tr><td><strong>Coding</strong></td><td>Does it work?</td><td>Is it written the safe way?</td><td>Secure coding standard, editor analyzers, peer review</td></tr>
<tr><td><strong>Build</strong></td><td>Does it compile and pass tests?</td><td>Does it contain known weaknesses?</td><td>Code scanning, dependency scanning, secret scanning</td></tr>
<tr><td><strong>Test</strong></td><td>Does it meet the requirements?</td><td>Can it be misused?</td><td>Security test cases, dynamic scanning, penetration test</td></tr>
<tr><td><strong>Release</strong></td><td>Is it ready to ship?</td><td>Is it configured safely?</td><td>Hardening checks, sign-off on open findings</td></tr>
<tr><td><strong>Operate</strong></td><td>Is it running well?</td><td>Is it being attacked? Is it up to date?</td><td>Monitoring, patching, incident response</td></tr>
</tbody></table>
<h4>Why earlier is cheaper</h4>
<p>Take one flaw: an API that returns any customer's invoice if you change the number in the URL.</p>
<ul>
<li><strong>Found in design:</strong> someone says "we need an ownership check" and a line is added to the story. Cost: one sentence.</li>
<li><strong>Found in code review:</strong> the developer adds a filter to the query. Cost: ten minutes.</li>
<li><strong>Found in a penetration test before release:</strong> a ticket, a fix, a retest, maybe a delayed release. Cost: days.</li>
<li><strong>Found by an attacker in production:</strong> incident response, customer notices, possibly regulators and lost trust. Cost: hard to count.</li>
</ul>
<p>It is the same bug each time. The only thing that changed is when you found it.</p>
<div class="callout tip">Shifting left does not mean dropping the checks on the right. You still test before release and monitor in production. It means the late checks should find very little, because the early ones already caught most of it.</div>
<h4>Small words you will hear</h4>
<ul>
<li><span class="term">SAST</span>: static application security testing. A tool reads your source code looking for risky patterns.</li>
<li><span class="term">SCA</span>: software composition analysis. A tool checks your packages against lists of known vulnerabilities.</li>
<li><span class="term">DAST</span>: dynamic application security testing. A tool attacks your running test site from the outside.</li>
<li><span class="term">DevSecOps</span>: building these checks into the same automated pipeline that builds and deploys the code.</li>
</ul>` },
    { name: 'Intermediate', body: `<h4>Each stage for a .NET and Angular team</h4>
<p><strong>Requirements.</strong> Classify the data the feature touches (public, internal, personal, payment). Add security requirements and abuse cases to the story. Check which rules apply, such as privacy law or card data standards.</p>
<p><strong>Design.</strong> Run a threat model for anything that adds an entry point, sensitive data, a third party or a trust boundary. Use the paved-road templates so safe defaults come for free.</p>
<p><strong>Coding.</strong> Follow a short secure coding standard: parameterized queries only, no secrets in code, validate input on the server, authorize every record. Turn on the .NET analyzers and treat security warnings as errors. Run a secret scanner before commits. Every change gets a peer review, and changes to login, permissions, crypto or file handling get a reviewer who knows security.</p>
<p><strong>Build.</strong> The pipeline runs SAST, SCA (for NuGet and npm), secret scanning and, if you use infrastructure as code, a scan of that too. New high-severity findings fail the build. The pipeline also records what went into the build as a list of components, called an SBOM.</p>
<p><strong>Test.</strong> Write security tests like any other tests: user A cannot read user B's record; an expired token gets 401; an oversized upload gets 413. Run a DAST scan against the test environment. For important releases, have a penetration test done by people who did not write the code.</p>
<p><strong>Release.</strong> Check production configuration: debug features off, HTTPS only, security headers on, least-privilege identities, secrets in the vault. Review any open findings and get an explicit decision on each.</p>
<p><strong>Operate.</strong> Collect logs centrally and alert on security events. Patch dependencies and base images on a schedule. Practise the incident response plan. Feed what you learn back into requirements and the threat model.</p>
<h4>Security champions</h4>
<p>A security team of five cannot review the work of two hundred developers. A <span class="term">security champion</span> is a developer inside each team who has extra interest and training in security. They are not a gatekeeper. They join threat modelling sessions, answer day-to-day questions, triage scanner findings and know when to call the security team. They keep the conversation going between visits from specialists.</p>
<h4>Definition of done</h4>
<p>If security is not in the <span class="term">definition of done</span>, it gets skipped when the sprint is tight. Add a few short, checkable lines. The second code tab has a version you can adapt.</p>
<div class="callout warn">A scanner that produces 2,000 warnings on day one will be ignored on day two. Start by blocking only <em>new</em> high-severity findings, fix or dismiss the old ones over time, and tune out false alarms. Developer trust in the tools is worth more than a long report.</div>` },
    { name: 'Expert', body: `<h4>Frameworks: what they are for</h4>
<table><thead><tr><th>Framework</th><th>What it is</th><th>How teams use it</th></tr></thead><tbody>
<tr><td><strong>Microsoft SDL</strong></td><td>A set of required practices across the life cycle: training, security requirements, threat modelling, secure coding standards, tool-based scanning, security testing, response planning</td><td>As a practical checklist of what every product team should do</td></tr>
<tr><td><strong>OWASP SAMM</strong></td><td>The Software Assurance Maturity Model. It groups practices under five business functions (Governance, Design, Implementation, Verification, Operations) and describes three maturity levels for each</td><td>To measure where you are, choose a target level per practice and plan a roadmap</td></tr>
<tr><td><strong>NIST SSDF</strong></td><td>The Secure Software Development Framework: a vendor-neutral list of outcomes, often referenced in government and customer requirements</td><td>As a common language when customers ask "how do you build securely?"</td></tr>
</tbody></table>
<p>You do not pick one and ignore the rest. SDL tells you what to do, SAMM tells you how well you are doing it and what to improve next, and SSDF helps you explain it to outsiders. Aim for the maturity your risk justifies. A payments platform and an internal lunch-menu app should not have the same target.</p>
<h4>Metrics that drive behaviour</h4>
<ul>
<li><strong>Time to fix, by severity.</strong> For example: critical within days, high within weeks. Track the real median and the worst case against that target.</li>
<li><strong>Open findings by severity and age.</strong> A small, young backlog is healthy. An old pile of highs is a decision someone is avoiding.</li>
<li><strong>Coverage.</strong> Share of repositories with scanning on, share of new features with a threat model, share of services built from the paved-road template.</li>
<li><strong>Escape rate.</strong> How many issues were found in production or by outsiders that an earlier stage should have caught. This is the best measure of whether shifting left is working.</li>
</ul>
<p>Avoid vanity numbers. "Number of findings" goes up when you add a scanner and says nothing about risk. "Number of trainings attended" measures attendance, not skill.</p>
<h4>Gates, exceptions and speed</h4>
<p>Fast teams worry that security gates slow them down. Well-designed gates do the opposite, because they move work earlier. Some rules that help:</p>
<ul>
<li><strong>Gate by risk.</strong> Block on new critical and high issues in changed code. Report the rest.</li>
<li><strong>Make exceptions explicit.</strong> A waiver names the finding, the reason, the approver and an expiry date. It lives in the repository and reappears when it expires.</li>
<li><strong>Keep feedback fast.</strong> Checks in the editor and the pull request take seconds or minutes. Slow, deep scans run nightly.</li>
<li><strong>Fix classes, not instances.</strong> If the same bug keeps appearing, change the template, the library or the analyzer rule so it cannot be written again.</li>
</ul>
<h4>Rolling it out</h4>
<p>Start with visibility: turn scanning on everywhere in report-only mode and see what you have. Add secret scanning and dependency alerts, because they are high value and low noise. Introduce threat modelling for new, risky features only. Recruit champions in the teams that want it. Then tighten gates step by step. Programmes that start by blocking every build usually get switched off.</p>
<div class="callout idea">After every incident or pentest finding, ask one question: "which earlier stage could have caught this, and why did it not?". The answer is your next improvement to the life cycle.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Can you name a concrete security activity for each stage, with a tool or artefact?</li>
<li>How would you introduce security checks to a team that ships daily without stopping them?</li>
<li>Which metrics would you report to leadership, and which would you refuse to report?</li>
</ul>` }
  ],
  flow: {
    title: 'One feature, "export my data", through a secure life cycle',
    steps: [
      { title: 'Requirements', desc: 'The story gets security lines: only the account owner can export, exports are logged, the download link expires. An abuse case is added: someone triggers exports for other users.' },
      { title: 'Design', desc: 'A 20-minute threat model. New entry point, personal data, a file in storage. Threats: guessable links, exporting another user, huge exports as denial of service.' },
      { title: 'Coding', desc: 'The developer uses the service template (deny by default). An analyzer flags a string-built query in the editor and it is fixed before commit. A secret scanner runs before commit.' },
      { title: 'Pull request', desc: 'A peer and the team security champion review. The champion asks for the ownership check to move into the query.' },
      { title: 'Build', desc: 'The pipeline runs code scanning, dependency scanning and secret scanning. A vulnerable package version fails the build and is upgraded.' },
      { title: 'Test', desc: 'Automated tests: user A cannot export user B; an expired link returns 404; an 11th export in an hour returns 429. A dynamic scan runs against the test site.' },
      { title: 'Release', desc: 'Configuration check: storage is private, debug is off, the service identity can write only to its own container. One low finding is accepted with an owner and date.' },
      { title: 'Operate', desc: 'Exports appear in the audit log. An alert watches for unusual export volume. Dependencies are patched monthly. Lessons go back into the next design.' }
    ]
  },
  code: [
    { lang: 'text', title: 'Secure SDLC checklist, phase by phase', code: `SECURE SDLC CHECKLIST            (tick per feature or per release, as marked)

1. REQUIREMENTS                                                      per feature
   [ ] Data touched is classified (public / internal / personal / payment)
   [ ] Security requirements written and testable (see ASVS for ideas)
   [ ] Abuse cases written for risky user stories
   [ ] Legal and contract rules identified (privacy, card data, customer terms)

2. DESIGN                                                            per feature
   [ ] Threat model done or updated if the change adds an entry point,
       sensitive data, a third party or a trust boundary
   [ ] Each threat has a decision, an owner and a ticket
   [ ] Built on the standard service template and shared auth library

3. CODING                                                            every change
   [ ] Secure coding standard followed (parameterized SQL, server-side validation,
       record-level authorization, no secrets in code)
   [ ] Analyzer warnings for security rules are errors in the build
   [ ] Secret scan run before commit
   [ ] Peer review done; security-sensitive areas reviewed by a champion

4. BUILD                                                             every build
   [ ] SAST scan: no new high or critical findings
   [ ] Dependency scan (NuGet + npm): no known high or critical vulnerabilities
   [ ] Secret scan on the repository and the build output
   [ ] Infrastructure-as-code and container image scanned
   [ ] Component list (SBOM) produced and stored with the build

5. TEST                                                              per release
   [ ] Security test cases automated (cross-user access, expired token, limits)
   [ ] DAST scan against the test environment reviewed
   [ ] Penetration test for major releases; findings triaged

6. RELEASE                                                           per release
   [ ] Production config hardened (HTTPS only, headers, debug off, private storage)
   [ ] Service identities and database accounts are least privilege
   [ ] Secrets in the vault; none in pipeline variables in plain form
   [ ] Open findings reviewed; each accepted risk has an approver and expiry
   [ ] Rollback plan and incident contacts confirmed

7. OPERATE                                                           continuous
   [ ] Security events logged centrally; alerts tested
   [ ] Dependencies and base images patched on schedule
   [ ] New vulnerability reports triaged within the agreed time
   [ ] Incident response plan practised
   [ ] Lessons from incidents fed back into phases 1 and 2` },
    { lang: 'text', title: 'Definition of done and pull request template with security built in', code: `DEFINITION OF DONE  (security lines sit next to the normal ones)

  A story is done when:
   - Code is reviewed and merged, tests pass, docs updated          (as usual)
   - Security acceptance criteria on the story are met and tested
   - Any new endpoint requires authentication unless listed as public
   - Access to each record is authorized on the server and covered by a
     "user A cannot reach user B's data" test
   - No new high or critical findings from code, dependency or secret scans
   - No secrets, keys or personal data in code, logs or test fixtures
   - Threat model updated if the change added an entry point, data type,
     third party or trust boundary
   - New security-relevant events are logged (who, what, when, result)

PULL REQUEST TEMPLATE  (.github/pull_request_template.md)

  ## What changed and why

  ## Security check  (tick or write "n/a" with a reason)
  - [ ] Does this add or change an endpoint, queue consumer, webhook or file import?
        If yes: authentication, authorization and validation are in place.
  - [ ] Does this touch login, sessions, permissions, crypto, file upload or SQL?
        If yes: reviewed by the team security champion.
  - [ ] Does this add a new dependency? If yes: it is maintained, scanned and pinned.
  - [ ] Does this handle personal or payment data? If yes: it is not logged, and
        only the needed fields are stored and returned.
  - [ ] Threat model updated or not needed (say which).

  ## How it was tested
  Include at least one negative test (what must NOT work).

RISK EXCEPTION  (security/exceptions/EX-031.md)
  Finding     : SAST rule on string-built SQL in LegacyReportJob.cs
  Reason      : Input is a fixed list of report names, not user input. Rewrite planned.
  Compensating: Job runs with a read-only database account
  Approved by : Engineering manager + security champion
  Expires     : end of next quarter (pipeline fails again after this date)` },
    { lang: 'text', title: 'Security checks in every .NET build: Directory.Build.props, .editorconfig and commands', code: `<!-- Directory.Build.props : applies to every project in the repository -->
<Project>
  <PropertyGroup>
    <Nullable>enable</Nullable>
    <EnableNETAnalyzers>true</EnableNETAnalyzers>
    <AnalysisLevel>latest-recommended</AnalysisLevel>
    <TreatWarningsAsErrors>true</TreatWarningsAsErrors>

    <!-- NuGet audit: flag packages with known vulnerabilities at restore time -->
    <NuGetAudit>true</NuGetAudit>
    <NuGetAuditMode>all</NuGetAuditMode>            <!-- direct and transitive packages -->
    <NuGetAuditLevel>moderate</NuGetAuditLevel>

    <!-- Lock file: the build uses exactly the versions that were reviewed -->
    <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
  </PropertyGroup>
</Project>

# .editorconfig : make the security rules loud. Rule ids can change, so check the
# current analyzer documentation for your SDK.
[*.cs]
dotnet_diagnostic.CA2100.severity = error    # review SQL queries for security vulnerabilities
dotnet_diagnostic.CA3001.severity = error    # possible SQL injection
dotnet_diagnostic.CA5350.severity = error    # weak cryptographic algorithm
dotnet_diagnostic.CA5351.severity = error    # broken cryptographic algorithm
dotnet_diagnostic.CA5394.severity = warning  # insecure random number generator

# Commands a developer or the pipeline can run
dotnet build -warnaserror                               # analyzers run with the build
dotnet list package --vulnerable --include-transitive   # known-vulnerable NuGet packages
dotnet restore --locked-mode                            # fail if the lock file is out of date
npm audit --audit-level=high                            # the same idea for the Angular app
npm ci                                                  # install exactly what the lock file says

# Order of feedback, fastest first:
#   editor squiggle (seconds) -> pre-commit secret scan (seconds) -> pull request checks
#   (minutes) -> nightly deep scan and DAST (hours) -> penetration test (per major release)` }
  ],
  pitfalls: [
    `Leaving security to one big review just before release. By then the design is fixed and every finding is expensive.`,
    `Turning on every scanner rule at once. The flood of noise teaches developers to ignore the tools. Start with new, high-severity findings.`,
    `Treating security champions as gatekeepers or as unpaid security staff. They need time, training and backing from the security team.`,
    `Counting findings as success. The useful numbers are time to fix, age of open issues and how many problems escape to production.`,
    `Granting permanent exceptions. Every waiver needs an owner, a reason and an expiry date.`,
    `Stopping at release. Software that was safe when shipped becomes unsafe as new vulnerabilities are found in its dependencies.`
  ],
  checklist: [
    `Add security requirements and abuse cases to stories that touch sensitive data or boundaries`,
    `Threat model changes that add an entry point, data type, third party or trust boundary`,
    `Turn on analyzers and treat security rule violations as build errors`,
    `Run secret scanning before commit and in the pipeline`,
    `Scan code and dependencies on every build and block new high-severity findings`,
    `Automate negative security tests such as cross-user access and expired tokens`,
    `Check production configuration and least-privilege identities before each release`,
    `Record every accepted finding with an approver and an expiry date`,
    `Name a security champion in each team and give them time for the role`,
    `Track time to fix by severity and review it every month`
  ],
  quiz: [
    { q: `What does "shifting left" mean?`, options: [`Moving servers to a different data centre`, `Doing security work earlier in the life cycle`, `Removing security testing before release`, `Letting only the security team write code`], answer: 1, why: `Shifting left moves security activities toward requirements, design and coding. Later checks stay, but should find far less.` },
    { q: `Which activity belongs to the design stage?`, options: [`Patching dependencies`, `Threat modelling`, `Dynamic scanning of the running site`, `Incident response`], answer: 1, why: `Threat modelling reviews the design to find what could go wrong before code is written.` },
    { q: `What is the role of a security champion?`, options: [`To approve every release personally before it ships`, `To replace the central security team entirely`, `To help the team with day-to-day security questions`, `To run the firewall and the network rules`], answer: 2, why: `Champions are part of the development team. They spread security knowledge and know when to involve specialists. They are not gatekeepers.` },
    { q: `A team enables a scanner and gets 2,000 findings. What is the best first step?`, options: [`Block all builds until every one of the findings is fixed`, `Turn the scanner off until the team has more time for it`, `Block only new high-severity findings and fix old ones over time`, `Hide the report from developers so they are not distracted`], answer: 2, why: `Blocking on new, serious issues keeps things from getting worse without stopping delivery, and keeps developers' trust in the tool.` },
    { q: `What is OWASP SAMM mainly used for?`, options: [`Scanning source code for risky patterns`, `Measuring the maturity of security practices`, `Encrypting databases and backups at rest`, `Scoring the severity of single vulnerabilities`], answer: 1, why: `SAMM is a maturity model. You assess current practices, choose target levels and plan improvements.` },
    { q: `Which metric best shows whether early security activities are working?`, options: [`Total number of scanner findings per month`, `Number of security trainings held per year`, `Number of issues that escape to production`, `Lines of code written per developer`], answer: 2, why: `The escape rate measures the outcome you care about. Raw finding counts and attendance numbers do not reflect risk.` }
  ],
  takeaways: [
    `A secure SDLC adds one fitting security activity to each stage, from requirements to operations.`,
    `The same flaw costs a sentence in design and an incident in production. Find it early.`,
    `Automate the routine checks in the editor and the pipeline, and keep the feedback fast.`,
    `Security champions and a definition of done make security part of normal team work.`,
    `Microsoft SDL lists what to do, OWASP SAMM measures how mature you are, and NIST SSDF gives a shared language.`,
    `Measure time to fix, age of open findings and escapes to production, not the number of findings.`
  ],
  interview: [
    { q: `What is a secure SDLC? Give an activity for each phase.`, a: `<p>It is the normal development life cycle with a security activity built into every stage. Requirements: security requirements, abuse cases and data classification. Design: threat modelling. Coding: secure coding standard, analyzers and peer review. Build: SAST, dependency and secret scanning. Test: automated security tests, DAST and penetration testing. Release: configuration hardening and sign-off on open findings. Operate: monitoring, patching and incident response, with lessons fed back to the start.</p>` },
    { q: `How would you introduce security checks to a team that deploys several times a day?`, a: `<p>I start in report-only mode to see the baseline, then enable low-noise, high-value checks first: secret scanning and dependency alerts. I gate only on new high and critical findings in changed code so existing debt does not stop delivery. Fast checks run in the editor and the pull request, deep scans run nightly. Exceptions are explicit, approved and expire. I also put safe defaults into the service template, which removes whole classes of findings without slowing anyone down.</p>` },
    { q: `What is the difference between Microsoft SDL and OWASP SAMM?`, a: `<p>SDL is a set of practices a team follows across the life cycle, such as training, threat modelling, secure coding standards, scanning and response planning. SAMM is a maturity model: it groups security practices under Governance, Design, Implementation, Verification and Operations, describes three maturity levels for each, and is used to assess the current state, set targets and build a roadmap. They work together. One tells you what to do, the other how well you do it.</p>` },
    { q: `Which security metrics would you report to leadership?`, a: `<p>Time to remediate by severity against agreed targets, open findings by severity and age, coverage of scanning and threat modelling across repositories and features, and the escape rate: issues found in production or by outsiders that earlier stages should have caught. I avoid raw finding counts, because they rise when you add tools and say little about risk.</p>` }
  ]
};
