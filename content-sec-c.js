// NexLearn content — Security module, Secure Coding Practices (part 2)
// Topics: sec-errors-logging, sec-api, sec-owasp-top10, sec-data-protection, sec-dotnet-checklist
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* sec-errors-logging — Secure Error Handling & Logging                */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-errors-logging'] = {
  hook: `Every error writes two letters. One goes to a stranger on the internet, the other goes to your team. Most security leaks happen when the wrong letter goes to the wrong reader.`,
  intro: `<p>Things go wrong in every app. A database is down. A user sends bad data. Your code has a bug. What your app <em>says</em> at that moment matters a lot for security.</p>
<p><span class="term">Error handling</span> is the code that decides what happens when something fails. <span class="term">Logging</span> is writing down what happened so your team can read it later. They work as a pair. The user gets a short, polite message. The log gets the full story.</p>
<p>Attackers love errors. A <span class="term">stack trace</span> (the list of code lines that were running when the app crashed) tells them your framework, your file paths, your table names and sometimes your SQL. A login page that says "wrong password" for one email and "no such user" for another tells them which emails are real customers.</p>
<p>Logs can hurt you too. If you write passwords, tokens or card numbers into a log, then anyone who can read the log can read those secrets. And if you log nothing useful, you will not notice an attack until a customer or a journalist tells you about it.</p>
<p>This lesson teaches four habits: say little to the outside, write a lot to the inside, never write secrets, and fail closed.</p>`,
  realLife: {
    title: 'The bank teller and the two notebooks',
    body: `<p>You hand a cheque to a bank teller and something is wrong. The teller says: "Sorry, I cannot process this today. Here is a reference number." That is all you hear. The teller does <strong>not</strong> say: "The signature check failed on the third stroke and our fraud system is the old version in the back room." That detail would help a forger try again.</p>
<p>But behind the counter the teller writes a full note in the bank's own book: time, account, what failed, which desk, the reference number. If you call later with that number, the bank can find the full story in seconds. One event, two messages, two readers.</p>
<p>Now imagine the teller also wrote your PIN in that book "to help with support". The book is now more valuable to a thief than the cash drawer. That is what logging a password does.</p>
<p><strong>How this showed up in the real world:</strong> More than one very large internet company has had to tell users to change their passwords after finding that a bug wrote passwords in plain text into an internal log file. No outsider had broken in. The log itself was the leak. In another well-known case, a popular logging library treated text inside log messages as instructions. Attackers only had to get a special string logged, for example in a user name field, to make servers run their code. Both stories teach the same thing: logs are not a safe dustbin. What goes into them needs the same care as what goes into a database.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Two readers, two messages</h4>
<p>Every failure has two readers.</p>
<table>
<thead><tr><th>Reader</th><th>What they need</th><th>What they must not get</th></tr></thead>
<tbody>
<tr><td>The user (or an attacker)</td><td>A short, kind message. What to do next. A reference id.</td><td>Stack traces, SQL, file paths, server names, library versions.</td></tr>
<tr><td>Your team</td><td>Time, who, what, where in the code, the full exception, the reference id.</td><td>Passwords, tokens, card numbers, full personal data.</td></tr>
</tbody>
</table>
<h4>What a safe error looks like</h4>
<p>Bad: <code>SqlException: Invalid column name 'pasword' at OrdersRepo.cs line 88</code>.</p>
<p>Good: <code>Something went wrong on our side. Reference: 7f3a91</code>.</p>
<p>The good message is boring on purpose. The reference id links it to the detailed log entry.</p>
<h4>Fail closed, not open</h4>
<p><span class="term">Fail closed</span> (also called fail secure) means: when a check breaks, the answer is "no". Think of a hotel door lock with a dead battery. A safe design stays locked from the outside. An unsafe design pops open.</p>
<p>In code, this bug is common:</p>
<pre><code>bool allowed = true;          // wrong starting value
try { allowed = CheckPermission(user); }
catch { /* ignore */ }        // error means "allowed" stays true
</code></pre>
<p>Start with <code>false</code>. Let an error mean "denied".</p>
<h4>What to write in the log</h4>
<ul>
<li>Logins: success and failure.</li>
<li>Access denied: someone asked for something they may not have.</li>
<li>Admin actions: role changes, user deletes, settings changes.</li>
<li>Input that failed validation in a strange way.</li>
<li>Every unhandled error.</li>
</ul>
<h4>What never to write in the log</h4>
<ul>
<li>Passwords, even wrong ones. A wrong password is often one typo away from the right one.</li>
<li>Session ids, access tokens, API keys.</li>
<li>Card numbers, bank details, government id numbers.</li>
<li>Full request bodies "just in case".</li>
</ul>
<div class="callout warn">A log line lives much longer than a request. It is copied to other servers, to backups and to search tools. Treat anything you log as something many people will be able to read for years.</div>` },
    { name: 'Intermediate', body: `<h4>One global handler in ASP.NET Core</h4>
<p>Do not scatter try/catch blocks in every controller. Put one handler at the edge of the app. In ASP.NET Core you register a class that implements <code>IExceptionHandler</code> and call <code>app.UseExceptionHandler()</code>. The handler does two things: it logs the full exception, and it writes a <span class="term">ProblemDetails</span> response. ProblemDetails is a standard JSON shape for errors (type, title, status, plus extras such as a trace id).</p>
<p>The <span class="term">developer exception page</span> shows the stack trace in the browser. It is great on your laptop and dangerous in production. It only turns on when the environment is <code>Development</code>, so make sure production never runs with that setting.</p>
<h4>Structured logging</h4>
<p><span class="term">Structured logging</span> means each log entry is a set of named fields, not one long sentence. In .NET you write a message template with named holes:</p>
<pre><code>log.LogWarning("Login failed for {UserId} from {Ip}", userId, ip);
</code></pre>
<p>The logger stores <code>UserId</code> and <code>Ip</code> as separate fields. You can then search "all failures for this ip" in seconds. Never build the message with string concatenation.</p>
<h4>Log injection</h4>
<p>If you paste user text straight into a plain text log, the user can add a line break and then write a fake log line of their own. This is <span class="term">log injection</span> (the line break characters are called CR and LF, so you will also hear "CRLF injection"). A fake line can hide an attack or blame another user. Defences: use structured logging with a JSON output, strip line breaks from values, and cap the length of what you log.</p>
<h4>Correlation ids</h4>
<p>A <span class="term">correlation id</span> (or trace id) is one id that follows a request through every service. Put it in every log line and in the error you return. A support ticket with that id takes you straight to the right logs.</p>
<h4>User enumeration</h4>
<p><span class="term">User enumeration</span> means an attacker can find out which accounts exist. It leaks in three ways:</p>
<ul>
<li><strong>Different messages.</strong> "No such user" versus "Wrong password".</li>
<li><strong>Different status codes.</strong> 404 for unknown users, 401 for known ones.</li>
<li><strong>Different timing.</strong> You skip the slow password hash when the user does not exist, so that answer comes back faster.</li>
</ul>
<p>The fix is the same answer every time: "Email or password is incorrect". For password reset: "If this email is registered, we sent a link". And do the same amount of work on both paths.</p>
<div class="callout tip">Log the real reason on the inside ("unknown user", "bad password", "account locked"). Only the outside message is generic.</div>
<h4>Security events worth an alert</h4>
<table>
<thead><tr><th>Event</th><th>Why it matters</th></tr></thead>
<tbody>
<tr><td>Many failed logins for one account</td><td>Password guessing</td></tr>
<tr><td>Failed logins for many accounts from one address</td><td>Trying leaked password lists</td></tr>
<tr><td>Burst of 403 responses for one user</td><td>Someone probing for other people's data</td></tr>
<tr><td>Role or permission change</td><td>Possible account takeover</td></tr>
<tr><td>Spike in 500 errors on one endpoint</td><td>Someone feeding it strange input</td></tr>
</tbody>
</table>` },
    { name: 'Expert', body: `<h4>Logs are evidence, so protect them</h4>
<p>After a break-in, the first thing a skilled attacker does is clean the logs. Design for that.</p>
<ul>
<li><strong>Ship logs off the machine quickly.</strong> A central store that the app can write to but not edit or delete.</li>
<li><strong>Append-only or write-once storage</strong> for audit logs. Many cloud stores offer an immutability setting.</li>
<li><strong>Separate access.</strong> The people who run the app should not be able to delete its audit trail alone.</li>
<li><strong>Clock discipline.</strong> Log in UTC with synced clocks, or you cannot line up events across services.</li>
</ul>
<h4>Retention and privacy pull in opposite directions</h4>
<p>Security wants to keep logs for a long time, because many intrusions are found months later. Privacy law wants you to keep personal data only as long as you need it. Resolve this on purpose: log ids instead of names, hash or shorten IP addresses where you can, set a retention period per log type, and write it down. Audit logs often stay a year or more. Debug logs can go after days.</p>
<h4>Redaction as a system, not a habit</h4>
<p>"Remember not to log tokens" does not scale to fifty developers. Build guard rails:</p>
<ul>
<li>Never log whole objects such as a request or a user entity. Log chosen fields.</li>
<li>Override <code>ToString()</code> on secret holding types so they print <code>***</code>.</li>
<li>Add a redaction step in the logging pipeline that masks fields by name or by data class. .NET has compliance and redaction extension packages for this. Check the current docs for the exact APIs.</li>
<li>Scrub headers such as <code>Authorization</code> and <code>Cookie</code> in HTTP logging middleware. Never log query strings that can carry tokens.</li>
<li>Add a test that sends a known fake secret through the app and fails if it appears in log output.</li>
</ul>
<h4>Failure modes that bite at scale</h4>
<ul>
<li><strong>Fail open in middleware.</strong> An exception inside a custom auth filter that is caught and ignored lets the request continue as if the check had passed.</li>
<li><strong>Swallowed exceptions.</strong> An empty <code>catch { }</code> hides both bugs and attacks.</li>
<li><strong>Errors that pass through.</strong> Returning <code>ex.Message</code> from a database or an HTTP client can leak connection details even with no stack trace.</li>
<li><strong>Log flooding.</strong> An attacker triggers millions of error lines to fill the disk or bury the real event. Rate limit noisy log sources and alert on volume.</li>
<li><strong>Timing leaks.</strong> Equal messages are not enough if one path is clearly faster. Run the password hash on both paths, and answer reset requests from a background job.</li>
<li><strong>Logs as an input.</strong> Log viewers are web apps. A logged script tag can run in an admin's browser if the viewer does not encode output.</li>
</ul>
<h4>Detection is the point</h4>
<p>A log nobody reads is only a cost. Decide which events mean "wake someone up", send them to your alerting tool, and test the alert by causing the event on purpose. Track how long it takes from the event to a human looking at it.</p>
<div class="callout idea">Interview angle: when asked "how would you design error handling for a public API?", cover the two readers, ProblemDetails with a trace id, fail closed, no enumeration, structured logs with redaction, tamper resistant storage, and alerts. That is a complete answer.</div>` }
  ],
  flow: {
    title: 'One failed request, two very different messages',
    steps: [
      { title: 'Something breaks', desc: 'A request hits a bug or bad data. Deep in the code an exception is thrown with a full stack trace.' },
      { title: 'Global handler catches it', desc: 'No controller handles it, so it bubbles up to the one exception handler at the edge of the app.' },
      { title: 'Default to "no"', desc: 'Nothing was saved halfway and nothing was allowed by accident. The request fails closed.' },
      { title: 'Write the inside story', desc: 'The handler logs the full exception with named fields: trace id, user id, path, status. Secrets are redacted.' },
      { title: 'Send the outside message', desc: 'The user gets a small ProblemDetails body: a generic title, the status code and the trace id. Nothing else.' },
      { title: 'Ship the log away', desc: 'The log entry leaves the server and lands in a central store that the app cannot edit.' },
      { title: 'Alert on patterns', desc: 'A rule sees fifty of these in a minute from one address and notifies the on-call engineer.' },
      { title: 'Find it by id', desc: 'The user reports the trace id. The engineer searches for it and reads the full story in seconds.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: leaking details and logging secrets', code: `// DO NOT COPY. Each numbered comment is a real problem.
[HttpPost("login")]
public async Task<IActionResult> Login(LoginRequest req)
{
    // 1. Logs the password. Concatenation also allows fake log lines (log injection).
    _log.LogInformation("Login attempt: " + req.Email + " / " + req.Password);

    try
    {
        var user = await _db.Users.SingleOrDefaultAsync(u => u.Email == req.Email);

        // 2. Different answers tell an attacker which emails are real customers.
        if (user is null)
            return NotFound("No account with this email");

        if (!_hasher.Verify(user.PasswordHash, req.Password))
            return Unauthorized("Wrong password");

        return Ok(_tokens.Create(user));
    }
    catch (Exception ex)
    {
        // 3. Sends the stack trace, SQL text and file paths to the caller.
        return StatusCode(500, ex.ToString());
    }
}

// 4. Fail open: if the permission service is down, everyone is an admin.
public bool IsAdmin(string userId)
{
    try { return _permissions.Check(userId, "admin"); }
    catch { return true; }
}` },
    { lang: 'csharp', title: 'Fixed: one global handler, ProblemDetails, structured logs', code: `using System.Diagnostics;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

var app = builder.Build();
app.UseExceptionHandler();   // the developer page only exists in Development
app.MapControllers();
app.Run();

public sealed class GlobalExceptionHandler(
    ILogger<GlobalExceptionHandler> log,
    IProblemDetailsService problems) : IExceptionHandler
{
    public async ValueTask<bool> TryHandleAsync(
        HttpContext ctx, Exception ex, CancellationToken ct)
    {
        var traceId = Activity.Current?.Id ?? ctx.TraceIdentifier;
        var userId = ctx.User.FindFirst("sub")?.Value ?? "anonymous";

        // Map known errors to safe public answers. Unknown ones become a plain 500.
        var (status, title) = ex switch
        {
            NotFoundException   => (404, "Not found"),
            ForbiddenException  => (403, "You are not allowed to do this"),
            ValidationException => (400, "The request is not valid"),
            _                   => (500, "Something went wrong on our side")
        };

        // Inside story: full exception, named fields, no request body, no headers.
        if (status >= 500)
            log.LogError(ex, "Unhandled error {TraceId} {Method} {Path} user {UserId}",
                traceId, ctx.Request.Method, ctx.Request.Path.Value, userId);
        else
            log.LogWarning("Request rejected {Status} {TraceId} {Path} user {UserId}",
                status, traceId, ctx.Request.Path.Value, userId);

        // Outside story: generic title, status, trace id. Nothing from ex.
        ctx.Response.StatusCode = status;
        return await problems.TryWriteAsync(new ProblemDetailsContext
        {
            HttpContext = ctx,
            ProblemDetails = new ProblemDetails
            {
                Status = status,
                Title = title,
                Extensions = { ["traceId"] = traceId }
            }
        });
    }
}

public sealed class NotFoundException(string message) : Exception(message);
public sealed class ForbiddenException(string message) : Exception(message);
public sealed class ValidationException(string message) : Exception(message);

// Fail closed: an error in the check means "no".
public static class Permissions
{
    public static bool IsAdmin(IPermissionService svc, string userId, ILogger log)
    {
        try { return svc.Check(userId, "admin"); }
        catch (Exception ex)
        {
            log.LogError(ex, "Permission check failed for {UserId}; denying", userId);
            return false;
        }
    }
}
public interface IPermissionService { bool Check(string userId, string role); }` },
    { lang: 'csharp', title: 'Fixed: the same answer for every login failure (no user enumeration)', code: `using Microsoft.AspNetCore.Identity;

public sealed class LoginService(
    UserManager<AppUser> users,
    IPasswordHasher<AppUser> hasher,
    ILogger<LoginService> log)
{
    // A real hash of a random throwaway password, created once at startup.
    private static readonly AppUser Dummy = new();
    private static readonly string DummyHash =
        new PasswordHasher<AppUser>().HashPassword(Dummy, Guid.NewGuid().ToString());

    public async Task<LoginResult> LoginAsync(string email, string password, string ip)
    {
        var user = await users.FindByEmailAsync(email);

        if (user is null)
        {
            // Do the same slow work as the real path, so timing does not leak.
            hasher.VerifyHashedPassword(Dummy, DummyHash, password);
            log.LogWarning("Login failed {Reason} from {Ip}", "unknown-user", ip);
            return LoginResult.Failed;               // same outside answer
        }

        if (await users.IsLockedOutAsync(user))
        {
            hasher.VerifyHashedPassword(Dummy, DummyHash, password);   // same slow work here too
            log.LogWarning("Login failed {Reason} {UserId} from {Ip}", "locked", user.Id, ip);
            return LoginResult.Failed;               // same outside answer
        }

        if (!await users.CheckPasswordAsync(user, password))
        {
            await users.AccessFailedAsync(user);     // counts towards lockout
            log.LogWarning("Login failed {Reason} {UserId} from {Ip}", "bad-password", user.Id, ip);
            return LoginResult.Failed;               // same outside answer
        }

        await users.ResetAccessFailedCountAsync(user);
        log.LogInformation("Login ok {UserId} from {Ip}", user.Id, ip);
        return LoginResult.Ok(user.Id);
    }
}

// The controller turns every Failed into: 401 "Email or password is incorrect".
public sealed record LoginResult(bool Success, string? UserId)
{
    public static readonly LoginResult Failed = new(false, null);
    public static LoginResult Ok(string userId) => new(true, userId);
}
public sealed class AppUser : IdentityUser { }` }
  ],
  pitfalls: [
    `<strong>Returning <code>ex.Message</code> to the client.</strong> Database and HTTP exceptions often carry server names, table names or connection details. Return a fixed title and a trace id.`,
    `<strong>Running production in Development mode.</strong> One wrong environment variable turns on the developer exception page for the whole internet. Check the environment in your deploy pipeline.`,
    `<strong>Logging the whole request "for debugging".</strong> Request bodies hold passwords and headers hold tokens. Log chosen fields only.`,
    `<strong>An empty catch block.</strong> It hides the bug today and the attack tomorrow. Log the error and let the request fail, or rethrow.`,
    `<strong>Friendly login errors.</strong> "We could not find that email" feels helpful, but it hands an attacker a tool to list your customers.`,
    `<strong>Logs that nobody watches.</strong> If no alert is tied to failed logins, access denied bursts or error spikes, the logs only help after the damage is done.`
  ],
  checklist: [
    `Register one global exception handler and return ProblemDetails with a trace id`,
    `Confirm production does not run with the Development environment setting`,
    `Search the code for ex.Message, ex.ToString() and StackTrace in any response`,
    `Use message templates with named fields; remove string concatenation from log calls`,
    `Remove passwords, tokens, cookies, card numbers and full bodies from all log calls`,
    `Give every login and reset failure the same message, status code and similar timing`,
    `Make every permission and validation check default to "deny" when it throws`,
    `Log logins, access denied, admin actions and unhandled errors with user id and trace id`,
    `Send logs to a central store the app cannot edit, with a written retention period`,
    `Create alerts for failed login bursts, 403 bursts and 500 spikes, and test them`
  ],
  quiz: [
    { q: `A user sees an error page with a stack trace in production. What is the main security problem?`, options: [`It slows the page down, because the trace is large`, `It reveals file paths, libraries and queries to an attacker`, `It breaks the browser cache, so later pages show old data`, `It fills the server disk, because each trace is stored for ever`], answer: 1, why: `A stack trace is a map of your app's insides. Attackers use it to choose their next step. Users should only get a generic message and a reference id.` },
    { q: `Which login failure design best prevents user enumeration?`, options: [`"No such user" for unknown emails and "Wrong password" for known ones`, `Status 404 for unknown emails and 401 for known ones`, `The same message, status and similar timing for every failure`, `No message at all, only a blank page`], answer: 2, why: `If the message, the status code or the timing differs, an attacker can tell which accounts exist. Make every failure look the same from the outside.` },
    { q: `What does "fail closed" mean?`, options: [`The app shuts down completely whenever any error happens`, `When a security check errors, access is denied`, `Errors are closed off from the logs so nobody can read them`, `The database closes all its connections after a failed query`], answer: 1, why: `Fail closed means an error in a check counts as "no". The opposite, fail open, lets people in when the check breaks.` },
    { q: `Why is log.LogWarning("Failed for {UserName}", name) safer than log.LogWarning("Failed for " + name)?`, options: [`It is shorter to type, and the logger adds the line break for you`, `The name is stored as its own field, not mixed into the message text`, `It encrypts the user name before the entry is written to the log`, `It hides the entry from administrators who should not see names`], answer: 1, why: `With a message template the value stays a value. With concatenation, line breaks in the input can create fake log entries (log injection).` },
    { q: `Which item should never be written to a log?`, options: [`The user id of the person who logged in`, `The time of a failed login`, `The password that was typed in a failed login`, `The trace id of the request`], answer: 2, why: `Even a wrong password is sensitive. It is often the right password with a typo, or the right password for another site.` },
    { q: `Why should logs be sent to a separate, append-only store?`, options: [`So developers on the team can never read production log entries`, `Because local disks are always too slow for writing log files`, `So an attacker on the server cannot easily erase the evidence`, `Because structured logs cannot be stored in ordinary files`], answer: 2, why: `Attackers clean up after themselves. If the app can only add entries to a remote store, the trail survives even when the server is compromised.` }
  ],
  takeaways: [
    `Every failure has two readers: tell the outside very little and the inside everything except secrets.`,
    `One global handler plus ProblemDetails with a trace id beats try/catch in every method.`,
    `Fail closed: an error in a security check means "deny".`,
    `Use structured logging with named fields. It helps stop log injection and makes searching easy.`,
    `Passwords, tokens, card numbers and full request bodies never belong in a log.`,
    `Logs only protect you when they are tamper resistant and tied to alerts that someone answers.`
  ],
  interview: [
    { q: `How do you handle exceptions in a public ASP.NET Core API?`, a: `<p>I use one global handler with <code>IExceptionHandler</code> and <code>UseExceptionHandler</code>. It logs the full exception with a trace id and user id, then returns a ProblemDetails body with a generic title, the status code and the trace id. Known error types map to 400, 403 or 404. Everything else is a plain 500. The developer exception page is only on in Development. Nothing from the exception text goes to the client.</p>` },
    { q: `What is user enumeration and how do you prevent it?`, a: `<p>It is when an attacker can learn which accounts exist. It leaks through different messages, different status codes or different response times on login, registration and password reset. I return one generic answer for all failures, run the password hash even when the user does not exist so timing is similar, send reset emails from a background job, and add rate limits. The real reason is still written to the internal log.</p>` },
    { q: `What would you log for security, and what would you never log?`, a: `<p>I log authentication events, access denied, admin and permission changes, validation failures that look like probing, and unhandled errors, each with time in UTC, user id, source address and trace id. I never log passwords, tokens, session ids, card data or full request bodies. For personal data I log ids instead of names and set a retention period.</p>` },
    { q: `What is log injection and how do you stop it?`, a: `<p>Log injection is when user controlled text changes the structure of the log, for example by adding line breaks and a fake entry. I stop it with structured logging so values are stored as fields, a JSON output format, removing control characters and capping length. I also make sure the log viewer encodes output, because a log viewer is a web page too.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-api — API Security: The OWASP API Top 10                        */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-api'] = {
  hook: `Your Angular app is a polite guest. An attacker does not use your app. They talk to your API directly, change one number in the URL, and see what comes back.`,
  intro: `<p>An <span class="term">API</span> (Application Programming Interface) is the set of URLs your server offers to other programs. Your web app, your mobile app and your partners all talk to it. So can anyone else with a tool that sends HTTP requests.</p>
<p>That is the key idea of API security: <strong>the client is not under your control</strong>. A button hidden in the Angular UI is still a URL on the server. A field your form never sends can still be added to the JSON by hand. An id of 1001 in the address can be changed to 1002.</p>
<p><span class="term">OWASP</span> is a non-profit community that publishes free security guidance. Its <span class="term">API Security Top 10</span> is a list of the ten most common ways APIs get broken. It is a different list from the well-known web Top 10, because APIs fail in their own ways. Most items are not clever hacks. They are missing checks.</p>
<p>In this lesson we walk through all ten in plain words, with the ASP.NET Core fix for each. The names used here follow the 2023 edition. The list is updated from time to time, so check the current edition when you use it for a review.</p>`,
  realLife: {
    title: 'The hotel where every key card opens every room',
    body: `<p>Picture a hotel. The front desk checks your passport and gives you a key card. So far so good. That is <strong>authentication</strong>: proving who you are.</p>
<p>Now imagine the room doors only check "is this a valid hotel card?" and not "is this the card for <em>this</em> room?". You can walk down the corridor and open room 502, 503, 504. Nobody picked a lock. The hotel simply forgot to ask the second question at each door. That is the number one API bug: <strong>broken object level authorization</strong>.</p>
<p>The other items have hotel versions too. A staff-only lift with no lock (function level). A guest form with a hidden box "room rate" that the guest can fill in (mass assignment). A breakfast buffet with no limit that one guest empties with a truck (resource consumption). A forgotten side entrance from an old building wing that is still open (inventory).</p>
<p><strong>How this showed up in the real world:</strong> Many of the largest data leaks of recent years needed no malware at all. In several widely reported cases, an API returned a customer record for any id it was given. Attackers wrote a small loop that counted upwards and saved every answer. In other cases an old test version of an API, long forgotten and with weaker checks, was still reachable from the internet. Companies found out when the data appeared for sale.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The ten, in one sentence each</h4>
<table>
<thead><tr><th>#</th><th>Name</th><th>Plain words</th></tr></thead>
<tbody>
<tr><td>1</td><td>Broken Object Level Authorization (BOLA)</td><td>You can read or change someone else's record by changing an id.</td></tr>
<tr><td>2</td><td>Broken Authentication</td><td>The login or token system can be guessed, skipped or faked.</td></tr>
<tr><td>3</td><td>Broken Object Property Level Authorization</td><td>You can see or set fields inside a record that you should not.</td></tr>
<tr><td>4</td><td>Unrestricted Resource Consumption</td><td>No limits, so one caller can use up your CPU, memory or money.</td></tr>
<tr><td>5</td><td>Broken Function Level Authorization (BFLA)</td><td>A normal user can call an admin action.</td></tr>
<tr><td>6</td><td>Unrestricted Access to Sensitive Business Flows</td><td>A working feature is abused by a bot, such as buying all the tickets.</td></tr>
<tr><td>7</td><td>Server Side Request Forgery (SSRF)</td><td>The server fetches a URL chosen by the attacker.</td></tr>
<tr><td>8</td><td>Security Misconfiguration</td><td>Unsafe settings: open CORS, debug pages, default passwords.</td></tr>
<tr><td>9</td><td>Improper Inventory Management</td><td>Old or unknown API versions are still online.</td></tr>
<tr><td>10</td><td>Unsafe Consumption of APIs</td><td>You trust data from a third-party API without checking it.</td></tr>
</tbody>
</table>
<h4>The two questions</h4>
<p>Items 1, 3 and 5 are all about <span class="term">authorization</span>: deciding what a logged-in user may do. Ask two questions on every request:</p>
<ul>
<li><strong>May this user call this action at all?</strong> (function level)</li>
<li><strong>May this user touch this exact record, and these exact fields?</strong> (object and property level)</li>
</ul>
<p>The first is easy with an <code>[Authorize]</code> attribute. The second cannot be done with an attribute alone, because it depends on the data. That is why BOLA is number one.</p>
<h4>Never trust the client</h4>
<p>Your UI hides the "Delete user" button for normal users. Good for user experience. Useless for security. The server must check again, every time.</p>
<div class="callout warn">A hidden button, a disabled field and a route guard in Angular are all decorations. Only checks on the server count.</div>` },
    { name: 'Intermediate', body: `<h4>1. BOLA: put the owner in the query</h4>
<p>Vulnerable: <code>db.Orders.FindAsync(id)</code>. Fixed: <code>db.Orders.Where(o => o.Id == id &amp;&amp; o.CustomerId == currentUserId)</code>. Take the user id from the token, never from the request. Return 404 when nothing matches, so you do not confirm that the record exists.</p>
<h4>2. Broken authentication</h4>
<p>Validate tokens fully (signature, issuer, audience, expiry). Rate limit login and reset endpoints. Do not accept API keys in the URL, because URLs end up in logs. Use a well-tested identity library instead of your own scheme.</p>
<h4>3. Property level: DTOs in, DTOs out</h4>
<p>A <span class="term">DTO</span> (Data Transfer Object) is a small class that lists exactly the fields that travel over the wire. Two bugs vanish when you use them:</p>
<ul>
<li><span class="term">Mass assignment</span>: the client adds <code>"isAdmin": true</code> to the JSON and your code copies it onto the entity. An input DTO has no such field, so it is ignored.</li>
<li><span class="term">Excessive data exposure</span>: you return the whole entity and "let the UI pick". The password hash and internal notes go out too. An output DTO only has safe fields.</li>
</ul>
<h4>4. Resource consumption: limits everywhere</h4>
<ul>
<li>Rate limits per user and per address.</li>
<li>A maximum page size. <code>?pageSize=1000000</code> must be clamped.</li>
<li>A maximum request body size and upload size.</li>
<li>Timeouts on database and outbound calls.</li>
<li>Spending caps on paid services such as SMS, email or AI calls.</li>
</ul>
<h4>5. BFLA: deny by default</h4>
<p>Set a fallback policy so every endpoint needs a logged-in user unless you mark it otherwise. Put admin actions behind a named policy. Changing <code>GET</code> to <code>DELETE</code> or <code>/users/me</code> to <code>/admin/users</code> must not work for a normal user.</p>
<h4>6. Sensitive business flows</h4>
<p>Some features are fine once and harmful ten thousand times: buying limited stock, creating accounts, sending invites, redeeming coupons. Add per-user limits, device or bot checks, and a step-up check for unusual volume.</p>
<h4>7. SSRF</h4>
<p>If your API takes a URL (webhook address, image to import), the server will call it from inside your network. Allow only known hosts, block internal address ranges, and do not follow redirects blindly.</p>
<h4>8. Misconfiguration</h4>
<p>No wildcard CORS with credentials. HTTPS only. No debug endpoints or open API docs with "try it" in production unless that is intended. Remove default accounts.</p>
<h4>9. Inventory</h4>
<p>Know every host, version and environment. Retire <code>/v1</code> when <code>/v3</code> ships. Old versions keep old bugs.</p>
<h4>10. Unsafe consumption</h4>
<p>Data from a partner API is still untrusted input. Validate it, set timeouts, limit response size, and never pass it straight into SQL or HTML.</p>
<div class="callout tip">Write one automated test per endpoint: log in as user A, ask for user B's record, expect 404 or 403. This single test style catches most BOLA bugs before release.</div>` },
    { name: 'Expert', body: `<h4>Why BOLA survives code review</h4>
<p>The vulnerable code looks normal. <code>FindAsync(id)</code> is what every tutorial shows. Nothing is "wrong" on the line. The bug is a line that is <em>missing</em>. So fight it with structure, not attention:</p>
<ul>
<li><strong>Scoped repositories.</strong> A repository that takes the current user or tenant in its constructor and adds the filter to every query. Controllers cannot forget it.</li>
<li><strong>EF Core global query filters</strong> for tenant id in multi-tenant systems, so the default is isolation.</li>
<li><strong>Resource based authorization</strong> with <code>IAuthorizationService.AuthorizeAsync(user, resource, policy)</code> when rules are richer than "owner".</li>
<li><strong>Ids that are hard to guess</strong> (GUIDs) slow down enumeration. They are a speed bump, never the lock.</li>
</ul>
<h4>Property level in depth</h4>
<p>Watch for the indirect paths: PATCH with JSON Patch documents, OData or GraphQL field selection, and "include" or "expand" query options. Each can read or write properties outside your DTO if you allow free navigation. Use allow-lists of fields, and separate DTOs per role when admins and users see different fields.</p>
<h4>Rate limiting design</h4>
<table>
<thead><tr><th>Choice</th><th>Notes</th></tr></thead>
<tbody>
<tr><td>Partition key</td><td>User id for signed-in calls, address for anonymous ones. Behind a proxy, read the real client address from trusted forwarded headers only.</td></tr>
<tr><td>Algorithm</td><td>Token bucket allows short bursts. Fixed or sliding window suits login attempts.</td></tr>
<tr><td>Where</td><td>Coarse limits at the gateway, fine limits in the app where you know the user and the cost of the call.</td></tr>
<tr><td>Many instances</td><td>In-memory limiters count per instance. For a strict global limit use a shared store or the gateway.</td></tr>
</tbody>
</table>
<p>Also limit by <em>cost</em>, not only by count. One search with a wildcard and a deep sort can cost more than a thousand simple reads. GraphQL needs depth and complexity limits for the same reason.</p>
<h4>Business flow abuse is a product problem</h4>
<p>No scanner finds "bots buy all the stock". You find it by threat modelling the flow: who gains if this runs ten thousand times? Controls are layered: per-account and per-payment-method limits, queues or lotteries for scarce items, delay and review for unusual patterns, and monitoring of conversion ratios.</p>
<h4>Inventory at scale</h4>
<p>Generate OpenAPI documents from code and collect them in one catalogue. Compare the catalogue with what the gateway actually serves, so undocumented ("shadow") endpoints stand out. Give every version an owner and an end date. Non-production environments with production data need the same controls as production.</p>
<h4>Third-party APIs</h4>
<p>Treat every integration as a trust boundary: TLS with certificate validation left on, strict schema validation of responses, size and time limits, circuit breakers, and no automatic following of redirects to other hosts. Webhooks you receive must be verified with a signature and protected against replays.</p>
<div class="callout idea">Interview angle: if asked "how would you secure this API?", structure the answer as authentication, the two authorization questions, input and output shaping with DTOs, limits, configuration, inventory, and monitoring. Naming BOLA and showing the owner filter in the query is usually what the interviewer is listening for.</div>` }
  ],
  flow: {
    title: "A request for someone else's order, and where it gets stopped",
    steps: [
      { title: 'Attacker logs in', desc: 'They create a normal account and get a valid token. Authentication is working as designed.' },
      { title: 'Rate limiter', desc: 'The request passes the per-user limit. Later, a loop of thousands of requests will hit 429 here.' },
      { title: 'Function check', desc: 'The fallback policy confirms a signed-in user. GET /orders/{id} is allowed for customers, so the request continues.' },
      { title: 'Change the id', desc: 'The attacker asks for order 1002, which belongs to another customer. The token is still valid.' },
      { title: 'Owner in the query', desc: 'The query asks for order 1002 AND customer = the id from the token. No row matches.' },
      { title: 'Safe answer', desc: 'The API returns 404 with a generic body. It does not confirm that order 1002 exists.' },
      { title: 'Output DTO', desc: "For the attacker's own orders, only listed fields leave the server. Internal notes and cost price stay inside." },
      { title: 'Log and alert', desc: 'Repeated 404 and 403 answers for one user are logged with the user id and raise an alert for id probing.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: no owner check, entity in, entity out, no limits', code: `// DO NOT COPY. A valid login is the only check here.
[ApiController, Route("api/orders"), Authorize]
public class OrdersController(AppDb db) : ControllerBase
{
    // BOLA: any signed-in user can read any order by changing the id.
    // Data exposure: the whole entity goes out, including InternalNote and CostPrice.
    [HttpGet("{id:int}")]
    public async Task<Order?> Get(int id) => await db.Orders.FindAsync(id);

    // Mass assignment: the client can send "status":"Refunded" or "customerId":7.
    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, Order order)
    {
        order.Id = id;
        db.Orders.Update(order);
        await db.SaveChangesAsync();
        return NoContent();
    }

    // Resource consumption: pageSize=5000000 loads the whole table into memory.
    [HttpGet]
    public async Task<List<Order>> List(int page = 1, int pageSize = 20) =>
        await db.Orders.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

    // BFLA: an admin action that only checks "is signed in".
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        await db.Orders.Where(o => o.Id == id).ExecuteDeleteAsync();
        return NoContent();
    }
}` },
    { lang: 'csharp', title: 'Fixed: owner filter, DTOs both ways, page cap, admin policy', code: `using System.ComponentModel.DataAnnotations;
using System.Security.Claims;

// Only these fields may come in. There is no Status, CustomerId or price here.
public sealed record UpdateOrderRequest(
    [Required, StringLength(200)] string ShippingAddress,
    [StringLength(500)] string? CustomerNote);

// Only these fields may go out.
public sealed record OrderResponse(int Id, string Status, decimal Total, string ShippingAddress);

[ApiController, Route("api/orders"), Authorize]
public class OrdersController(AppDb db) : ControllerBase
{
    private const int MaxPageSize = 100;

    // The user id always comes from the token, never from the request.
    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    [HttpGet("{id:int}")]
    public async Task<ActionResult<OrderResponse>> Get(int id)
    {
        var order = await db.Orders
            .Where(o => o.Id == id && o.CustomerId == UserId)      // owner in the query
            .Select(o => new OrderResponse(o.Id, o.Status, o.Total, o.ShippingAddress))
            .SingleOrDefaultAsync();

        return order is null ? NotFound() : order;                  // 404, not 403
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> Update(int id, UpdateOrderRequest req)
    {
        var order = await db.Orders
            .SingleOrDefaultAsync(o => o.Id == id && o.CustomerId == UserId);
        if (order is null) return NotFound();
        if (order.Status != "Pending") return Conflict();           // business rule on the server

        order.ShippingAddress = req.ShippingAddress;                // copy field by field
        order.CustomerNote = req.CustomerNote;
        await db.SaveChangesAsync();
        return NoContent();
    }

    [HttpGet]
    public async Task<List<OrderResponse>> List(int page = 1, int pageSize = 20)
    {
        page = Math.Max(page, 1);
        pageSize = Math.Clamp(pageSize, 1, MaxPageSize);            // hard cap

        return await db.Orders
            .Where(o => o.CustomerId == UserId)
            .OrderByDescending(o => o.Id)
            .Skip((page - 1) * pageSize).Take(pageSize)
            .Select(o => new OrderResponse(o.Id, o.Status, o.Total, o.ShippingAddress))
            .ToListAsync();
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = "OrdersAdmin")]                             // function level check
    public async Task<IActionResult> Delete(int id)
    {
        var rows = await db.Orders.Where(o => o.Id == id).ExecuteDeleteAsync();
        return rows == 0 ? NotFound() : NoContent();
    }
}` },
    { lang: 'csharp', title: 'Fixed: Program.cs with deny-by-default, rate limits and size limits', code: `using System.Security.Claims;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Body size cap for every request (uploads get their own, larger limit).
builder.WebHost.ConfigureKestrel(k => k.Limits.MaxRequestBodySize = 1_000_000);

builder.Services.AddControllers();
builder.Services.AddAuthentication().AddJwtBearer();   // settings come from configuration

builder.Services.AddAuthorization(o =>
{
    // Deny by default: every endpoint needs a signed-in user unless marked [AllowAnonymous].
    o.FallbackPolicy = new AuthorizationPolicyBuilder().RequireAuthenticatedUser().Build();
    o.AddPolicy("OrdersAdmin", p => p.RequireRole("OrdersAdmin"));
});

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    // General API traffic: 60 calls a minute per user, small bursts allowed.
    o.AddPolicy("api", ctx => RateLimitPartition.GetTokenBucketLimiter(
        ctx.User.FindFirstValue(ClaimTypes.NameIdentifier)
            ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new TokenBucketRateLimiterOptions
        {
            TokenLimit = 60, TokensPerPeriod = 60,
            ReplenishmentPeriod = TimeSpan.FromMinutes(1), QueueLimit = 0
        }));

    // Login and password reset: 5 tries a minute per address.
    o.AddPolicy("auth", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 5, Window = TimeSpan.FromMinutes(1), QueueLimit = 0
        }));
});

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseRateLimiter();          // after authentication, so the user id is known
app.UseAuthorization();

app.MapControllers().RequireRateLimiting("api");
// On the login action itself: [EnableRateLimiting("auth")] and [AllowAnonymous].

app.Run();` }
  ],
  pitfalls: [
    `<strong>Checking "is logged in" and stopping there.</strong> Authentication tells you who the caller is. It does not tell you whether order 1002 is theirs. Put the owner or tenant in every query.`,
    `<strong>Taking the user id from the request.</strong> A <code>userId</code> in the URL, body or a custom header can be changed. Read it from the validated token only.`,
    `<strong>Binding entities directly.</strong> Using your EF Core entity as the request or response type invites mass assignment and data leaks. Use DTOs in both directions.`,
    `<strong>Filtering in the frontend.</strong> If the API sends every field and Angular hides some, the fields are still visible in the browser's network tab.`,
    `<strong>Unlimited page size.</strong> A single request with a huge <code>pageSize</code> can take the database down. Clamp it on the server.`,
    `<strong>Forgotten versions.</strong> The old <code>/v1</code> that "nobody uses" keeps running without the fixes you added to <code>/v2</code>. Retire it or protect it the same way.`
  ],
  checklist: [
    `Add the owner or tenant id from the token to every query that loads a record by id`,
    `Replace entity classes in request and response types with explicit DTOs`,
    `Set a fallback authorization policy so endpoints are closed unless marked otherwise`,
    `Put every admin or staff action behind a named role or policy`,
    `Clamp page size and set a maximum request body size`,
    `Add rate limits per user, with tighter limits on login, reset and other costly flows`,
    `Write a test per endpoint: user A asks for user B's record and gets 404 or 403`,
    `Restrict any server-side URL fetch to an allow-list of hosts`,
    `List every API host and version, name an owner, and retire the old ones`,
    `Validate and limit data received from third-party APIs before using it`
  ],
  quiz: [
    { q: `A signed-in user changes /api/invoices/301 to /api/invoices/302 and sees another customer's invoice. Which risk is this?`, options: [`Broken Authentication`, `Broken Object Level Authorization`, `Security Misconfiguration`, `Broken Function Level Authorization`], answer: 1, why: `The login worked. What is missing is the check that this user may access this exact object. That is BOLA, the top API risk.` },
    { q: `What is the most reliable fix for mass assignment?`, options: [`Hide the field in the Angular form so users cannot edit it`, `Bind the request to an input DTO with only the allowed fields`, `Rename the sensitive field so that attackers cannot guess its name`, `Use HTTPS so the JSON body cannot be changed by the client`], answer: 1, why: `If the input class has no IsAdmin or Status property, extra JSON fields have nowhere to go. Hiding a field in the UI changes nothing on the server.` },
    { q: `Where should the current user's id come from when checking ownership?`, options: [`A userId query string parameter`, `A hidden form field`, `The validated token or session on the server`, `A custom X-User-Id header set by the client`], answer: 2, why: `Anything the client sends can be changed. Only the identity inside the validated token can be trusted.` },
    { q: `An endpoint accepts pageSize with no upper bound. Which risk is this?`, options: [`Unrestricted Resource Consumption`, `Broken Function Level Authorization`, `Improper Inventory Management`, `SSRF`], answer: 0, why: `Without a cap, one request can make the server load and send a huge amount of data. Limits on size, rate and time are the fix.` },
    { q: `A normal user calls DELETE /api/admin/users/9 and it works. What was missing?`, options: [`An output DTO that hides the admin fields from the response`, `A role or policy check on the action itself`, `A stricter rate limit on calls to the admin endpoints`, `A shorter token lifetime for normal users`], answer: 1, why: `The action itself should only be callable by admins. A role or policy on the endpoint, plus deny by default, stops this.` },
    { q: `Why is an old, undocumented API version a security risk?`, options: [`It uses more server memory than the newer versions do`, `It is still reachable but lacks the newer fixes`, `Browsers refuse to call it, so users see confusing errors`, `It cannot be rate limited once it is undocumented`], answer: 1, why: `Forgotten versions keep their old bugs. Attackers look for them because they are less protected. Keep an inventory and retire old versions.` }
  ],
  takeaways: [
    `Attackers talk to the API directly, so every rule must be enforced on the server.`,
    `Ask two questions on every request: may this user call this action, and may they touch this exact record and these fields?`,
    `Put the owner or tenant id from the token into the query. Return 404 when nothing matches.`,
    `DTOs in and out stop mass assignment and stop extra fields from leaking.`,
    `Limits are a security feature: rate, page size, body size, time and money.`,
    `Know every API version you run. What you have forgotten is what gets attacked.`
  ],
  interview: [
    { q: `What is BOLA and how do you prevent it in ASP.NET Core?`, a: `<p>Broken Object Level Authorization is when a user can access another user's object by changing an identifier. I prevent it by including the owner or tenant id from the token in the query that loads the record, or by using resource based authorization with <code>IAuthorizationService</code>. For multi-tenant apps I add EF Core global query filters so isolation is the default. I return 404 for records the user may not see, and I add tests where user A requests user B's data.</p>` },
    { q: `What is the difference between BOLA and BFLA?`, a: `<p>BOLA is about data: the action is allowed, but not on that record. BFLA (Broken Function Level Authorization) is about the action itself: a normal user reaches an admin function. BOLA needs a check against the data. BFLA is fixed with roles or policies on endpoints and a deny-by-default fallback policy.</p>` },
    { q: `How do you protect an API from abuse and overload?`, a: `<p>Layered limits. A gateway limit per address, then per-user limits in the app with the built-in rate limiter, tighter on login and other costly flows. A cap on page size, body size and upload size. Timeouts on database and outbound calls. Spending caps for paid services. For flows like checkout or sign-up I add per-account business limits and bot checks, and I monitor for unusual patterns.</p>` },
    { q: `Why are DTOs a security control and not only a design choice?`, a: `<p>An input DTO defines exactly which fields a client may set, so mass assignment of fields like role or price is impossible. An output DTO defines exactly which fields leave the server, so password hashes and internal notes cannot leak by accident. They also keep the API stable when the database model changes.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-owasp-top10 — OWASP Top 10 Walkthrough                          */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-owasp-top10'] = {
  hook: `Most break-ins are not new ideas. They are the same ten mistakes, made again by a new team, in a new app, this year.`,
  intro: `<p>The <span class="term">OWASP Top 10</span> is the best-known list in web security. OWASP (the Open Worldwide Application Security Project) is a non-profit community. Every few years it studies data from many thousands of real applications and publishes the ten most important kinds of risk.</p>
<p>The list is not a law and it is not a complete standard. Think of it as the "most common causes of accidents" poster on a factory wall. If your team avoids these ten, you have removed most of the easy ways in.</p>
<p>This lesson uses the ten categories from the 2021 edition, which you will meet in most training, tools and audit reports: broken access control, cryptographic failures, injection, insecure design, security misconfiguration, vulnerable and outdated components, identification and authentication failures, software and data integrity failures, security logging and monitoring failures, and server side request forgery.</p>
<p>The list is revised every few years. Categories get renamed, merged or moved up and down as attacks change. A newer edition, the Top 10:2025, is already published. It keeps broken access control at number one, widens "vulnerable and outdated components" into software supply chain failures, moves server side request forgery into broken access control, and adds a category for badly handled errors. So learn the <em>ideas</em> here, and check the current edition on the OWASP site before you use the list for an audit.</p>
<p>For each item you get a real-life picture, how it looks in a .NET and Angular app, and the main defence.</p>`,
  realLife: {
    title: 'A building inspector with a ten-point clipboard',
    body: `<p>A building inspector does not invent new tests for every house. They carry a clipboard with the things that most often go wrong: doors that do not lock, wiring without fuses, no smoke alarm, weak foundations, a spare key under the mat. Ten minutes with that clipboard finds most dangers.</p>
<p>The OWASP Top 10 is that clipboard for web apps. "Does every door check who you are?" is access control. "Is the safe made of real steel?" is cryptography. "Does the smoke alarm work?" is logging and monitoring. "Were the bricks from a supplier you trust?" is components and integrity.</p>
<p><strong>How this showed up in the real world:</strong> The list reads like a history of famous incidents. A large credit bureau was breached through a web framework with a known flaw, for which a fix already existed but had not been installed (outdated components). A major bank lost customer data when an attacker made a cloud server fetch an internal address that handed out access keys (SSRF plus misconfiguration). A widely used IT management product shipped an update with hidden malicious code after its build system was compromised (software integrity). A tiny logging library present in countless Java apps could be made to run attacker code through one crafted text string (injection in a component). None of these needed a brand new technique.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The ten in plain words (2021 edition)</h4>
<table>
<thead><tr><th>#</th><th>Category</th><th>Real-life picture</th></tr></thead>
<tbody>
<tr><td>A01</td><td>Broken Access Control</td><td>A hotel key card that opens every room.</td></tr>
<tr><td>A02</td><td>Cryptographic Failures</td><td>Sending your bank PIN on a postcard.</td></tr>
<tr><td>A03</td><td>Injection</td><td>A form where "Name" is read aloud as an order to the staff.</td></tr>
<tr><td>A04</td><td>Insecure Design</td><td>A bank vault with a window. Built exactly as drawn, still unsafe.</td></tr>
<tr><td>A05</td><td>Security Misconfiguration</td><td>A good lock, left on the factory code 0000.</td></tr>
<tr><td>A06</td><td>Vulnerable and Outdated Components</td><td>A car with a recalled brake part that was never replaced.</td></tr>
<tr><td>A07</td><td>Identification and Authentication Failures</td><td>A guard who accepts any badge that looks about right.</td></tr>
<tr><td>A08</td><td>Software and Data Integrity Failures</td><td>Accepting a parcel without checking the seal or the sender.</td></tr>
<tr><td>A09</td><td>Security Logging and Monitoring Failures</td><td>A shop with no cameras and no alarm.</td></tr>
<tr><td>A10</td><td>Server Side Request Forgery (SSRF)</td><td>Asking the office assistant to fetch a file, and they fetch one from the locked archive for you.</td></tr>
</tbody>
</table>
<h4>Three groups make it easier to remember</h4>
<ul>
<li><strong>Who may do what:</strong> A01 access control, A07 authentication.</li>
<li><strong>How data is handled:</strong> A02 cryptography, A03 injection, A10 SSRF, A08 integrity.</li>
<li><strong>How the system is built and run:</strong> A04 design, A05 configuration, A06 components, A09 logging.</li>
</ul>
<h4>Why access control is number one</h4>
<p>In the 2021 data, broken access control had more recorded findings than any other category, and it is still number one in the 2025 edition. The reason is simple. Frameworks protect you from many injection bugs by default. No framework can know that invoice 302 belongs to another customer. Only your code knows that, so only your code can check it.</p>
<div class="callout tip">You do not need to memorise the numbers. Remember the ideas. The numbers and names shift between editions; the mistakes stay the same.</div>` },
    { name: 'Intermediate', body: `<h4>How each one looks in a .NET + Angular app, and the main defence</h4>
<table>
<thead><tr><th>Risk</th><th>How it looks</th><th>Main defence</th></tr></thead>
<tbody>
<tr><td>A01 Access control</td><td><code>FindAsync(id)</code> with no owner check. Admin API hidden only by an Angular route guard.</td><td>Deny by default. Owner or tenant in every query. Policies on the server.</td></tr>
<tr><td>A02 Cryptography</td><td>Passwords hashed with MD5 or SHA-256 alone. HTTP inside the network. A key in appsettings.json.</td><td>TLS everywhere. A slow, salted password hash (ASP.NET Core Identity does this). Keys in a vault.</td></tr>
<tr><td>A03 Injection</td><td><code>FromSqlRaw("... '" + name + "'")</code>. <code>[innerHTML]</code> with trust bypass in Angular.</td><td>Parameterized queries. Let Angular encode output. Validate input.</td></tr>
<tr><td>A04 Insecure design</td><td>Password reset by "secret question". No limit on coupon use. Trusting the price sent by the client.</td><td>Threat model before building. Write abuse cases. Enforce business rules on the server.</td></tr>
<tr><td>A05 Misconfiguration</td><td>Developer exception page in production. CORS open to any origin with credentials. Default admin password.</td><td>Hardened defaults in code. Same config path for every environment. Automated checks.</td></tr>
<tr><td>A06 Components</td><td>NuGet or npm packages with known flaws. A base Docker image from years ago.</td><td><code>dotnet list package --vulnerable</code>, <code>npm audit</code>, automatic update pull requests.</td></tr>
<tr><td>A07 Authentication</td><td>No lockout or rate limit on login. Tokens that never expire. Weak password rules, no second factor.</td><td>A proven identity provider. Multi-factor login. Short token life with rotation.</td></tr>
<tr><td>A08 Integrity</td><td>A script from a CDN with no integrity hash. A pipeline anyone can edit. Deserializing objects from untrusted bytes.</td><td>Signed packages and artifacts. Protected pipeline. Never deserialize untrusted data into arbitrary types.</td></tr>
<tr><td>A09 Logging</td><td>Failed logins not logged. Logs only on the server disk. No alerts.</td><td>Log security events centrally. Alert on patterns. Practise the response.</td></tr>
<tr><td>A10 SSRF</td><td>"Import image from URL" that fetches any address, including internal ones.</td><td>Allow-list of hosts. Block internal ranges. Network egress rules.</td></tr>
</tbody>
</table>
<h4>The Angular side</h4>
<p>Angular protects you from most cross-site scripting by encoding values in templates. You lose that protection when you call <code>bypassSecurityTrustHtml</code> on user content or build HTML strings yourself. Route guards and hidden buttons improve the experience but protect nothing. And any secret placed in the frontend bundle is public.</p>
<h4>Using the list in a review</h4>
<p>For each new feature, walk down the ten and ask one question per row. "Who may call this? What data crosses the wire? What input reaches a query, a file path, a URL or HTML? Which new packages did we add? What will we log?" It takes ten minutes and finds real bugs.</p>
<div class="callout warn">Passing a "Top 10 scan" does not mean the app is secure. Scanners are good at A03, A05 and A06. They are poor at A01 and A04, which need a human who understands the business rules.</div>` },
    { name: 'Expert', body: `<h4>What the list is, and what it is not</h4>
<p>The Top 10 is an <strong>awareness document</strong>. Each category is a bucket of many weakness types (called CWEs, entries in a public catalogue of weakness kinds). The ranking mixes measured data, such as how often a category is found in tested apps, with a community survey that captures risks tools cannot see yet.</p>
<p>For a real standard to build and test against, OWASP offers the <span class="term">ASVS</span> (Application Security Verification Standard), a long list of checkable requirements in levels. Use the Top 10 to teach and to start conversations. Use ASVS, or your own control list based on it, to verify.</p>
<h4>Root causes versus symptoms</h4>
<p>Some categories are symptoms (injection, SSRF) and some are root causes (insecure design, misconfiguration). One incident often spans several. The bank case from the story was SSRF made possible by an over-permissive cloud role and a metadata service that answered any internal caller. Fixing only the URL check would have left the deeper problem. When you analyse an incident, name every category that contributed.</p>
<h4>Insecure design deserves the most thought</h4>
<p>A perfect implementation of a bad design is still unsafe. Signals of insecure design:</p>
<ul>
<li>The client decides something the server should decide (price, role, discount).</li>
<li>No limit exists on an action that costs money or reveals data.</li>
<li>Recovery flows are weaker than the login they bypass.</li>
<li>All tenants share one database user and rely on every query to remember a filter.</li>
</ul>
<p>The defences are process, not code: threat modelling, abuse cases next to user stories, reference architectures, and paved-road libraries that make the safe way the easy way.</p>
<h4>Supply chain and integrity at scale</h4>
<p>Most of your app is code you did not write. Mature teams pin versions with lock files, restore packages only from approved feeds, produce a software bill of materials (a list of every component in a build), sign build outputs, require review for pipeline changes, and can answer "are we affected?" within hours when a new flaw is announced. Newer editions of the Top 10 put growing weight here.</p>
<h4>Making it systemic</h4>
<table>
<thead><tr><th>Instead of</th><th>Build</th></tr></thead>
<tbody>
<tr><td>Reminding people to add owner checks</td><td>Repositories and query filters that add them</td></tr>
<tr><td>Reviewing each CORS setting by hand</td><td>One shared, tested startup extension</td></tr>
<tr><td>Yearly dependency clean-ups</td><td>Automatic update pull requests and a build that fails on critical findings</td></tr>
<tr><td>Hoping someone reads logs</td><td>Alerts with owners and tested runbooks</td></tr>
</tbody>
</table>
<div class="callout idea">Interview angle: do not recite the ten like a poem. Pick two or three, give a concrete bug you could find in a .NET API, the fix, and how you would stop the whole class of bug. Then mention that the list changes between editions and that ASVS is the deeper standard. That shows understanding, not memory.</div>` }
  ],
  flow: {
    title: 'Walking one feature down the Top 10 clipboard',
    steps: [
      { title: 'Pick the feature', desc: 'Example: "Customer can download their invoice as a PDF by id". Draw the request from browser to API to database to file store.' },
      { title: 'Who may do what', desc: 'A01 and A07: is the caller signed in, and does this invoice belong to them? The owner must be part of the query.' },
      { title: 'Data in', desc: 'A03 and A10: where does input reach a query, a file path, a URL or HTML? Use parameters, fixed paths and allow-lists.' },
      { title: 'Data at rest and in transit', desc: 'A02: is the call over TLS? Are stored files and keys protected? Is anything sensitive placed in the URL?' },
      { title: 'Design', desc: 'A04: what happens if this is called ten thousand times, or with ids in a loop? Add limits and make ids hard to guess.' },
      { title: 'Build and settings', desc: 'A05, A06, A08: did we add packages? Are they current and from a trusted feed? Are production settings safe?' },
      { title: 'See it happen', desc: 'A09: log downloads and denied attempts with user id. Alert when one user is denied many times.' },
      { title: 'Record and test', desc: "Write down the answers and turn the key ones into automated tests: user A cannot fetch user B's invoice." }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: five Top 10 risks in one small controller', code: `// DO NOT COPY. Find the five problems before reading the comments.
[ApiController, Route("api/invoices")]
public class InvoicesController(AppDb db, HttpClient http) : ControllerBase
{
    // A01: no [Authorize], and no owner check. Any id returns any invoice.
    [HttpGet("{id:int}")]
    public async Task<Invoice?> Get(int id) => await db.Invoices.FindAsync(id);

    // A03: user text is glued into the SQL string.
    [HttpGet("search")]
    public async Task<List<Invoice>> Search(string customer) =>
        await db.Invoices
            .FromSqlRaw("SELECT * FROM Invoices WHERE CustomerName = '" + customer + "'")
            .ToListAsync();

    // A10: the server fetches whatever address the caller sends.
    [HttpPost("import-logo")]
    public async Task<byte[]> ImportLogo(string url) => await http.GetByteArrayAsync(url);

    // A02: a fast, unsalted hash for a password.
    public static string HashPassword(string password) =>
        Convert.ToHexString(System.Security.Cryptography.MD5.HashData(
            System.Text.Encoding.UTF8.GetBytes(password)));

    // A05 + A09: full error text goes to the caller, and nothing is logged.
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        try { await db.Invoices.Where(i => i.Id == id).ExecuteDeleteAsync(); return NoContent(); }
        catch (Exception ex) { return StatusCode(500, ex.ToString()); }
    }
}` },
    { lang: 'csharp', title: 'Fixed: the same controller with each risk closed', code: `using System.Security.Claims;
using Microsoft.AspNetCore.Identity;

[ApiController, Route("api/invoices"), Authorize]           // A01/A07: signed-in users only
public class InvoicesController(
    AppDb db, IHttpClientFactory clients, ILogger<InvoicesController> log) : ControllerBase
{
    private static readonly HashSet<string> LogoHosts =
        new(StringComparer.OrdinalIgnoreCase) { "cdn.example.com", "images.example.com" };

    private string UserId => User.FindFirstValue(ClaimTypes.NameIdentifier)!;

    // A01: the owner is part of the query. Output is a DTO, not the entity.
    [HttpGet("{id:int}")]
    public async Task<ActionResult<InvoiceDto>> Get(int id)
    {
        var dto = await db.Invoices
            .Where(i => i.Id == id && i.CustomerId == UserId)
            .Select(i => new InvoiceDto(i.Id, i.Number, i.Total))
            .SingleOrDefaultAsync();
        if (dto is null)
        {
            log.LogWarning("Invoice {InvoiceId} denied or missing for {UserId}", id, UserId); // A09
            return NotFound();
        }
        return dto;
    }

    // A03: LINQ is translated to a parameterized query. The text stays data.
    [HttpGet("search")]
    public async Task<List<InvoiceDto>> Search(string number) =>
        await db.Invoices
            .Where(i => i.CustomerId == UserId && i.Number.StartsWith(number))
            .Select(i => new InvoiceDto(i.Id, i.Number, i.Total))
            .Take(50)
            .ToListAsync();

    // A10: https only, host from an allow-list, redirects off (set on the named client).
    [HttpPost("import-logo")]
    public async Task<IActionResult> ImportLogo(string url)
    {
        if (!Uri.TryCreate(url, UriKind.Absolute, out var uri)
            || uri.Scheme != Uri.UriSchemeHttps
            || !LogoHosts.Contains(uri.Host))
            return BadRequest();

        var bytes = await clients.CreateClient("no-redirect").GetByteArrayAsync(uri);
        return File(bytes, "application/octet-stream");
    }

    // A05/A09: admin only. Errors go to the global handler, which logs and returns ProblemDetails.
    [HttpDelete("{id:int}"), Authorize(Policy = "BillingAdmin")]
    public async Task<IActionResult> Delete(int id)
    {
        var rows = await db.Invoices.Where(i => i.Id == id).ExecuteDeleteAsync();
        log.LogInformation("Invoice {InvoiceId} deleted by {UserId}", id, UserId);
        return rows == 0 ? NotFound() : NoContent();
    }
}

public sealed record InvoiceDto(int Id, string Number, decimal Total);

// A02: use the framework's slow, salted password hasher. Never MD5 or plain SHA.
public sealed class Passwords(IPasswordHasher<AppUser> hasher)
{
    public string Hash(AppUser user, string password) => hasher.HashPassword(user, password);
    public bool Verify(AppUser user, string hash, string password) =>
        hasher.VerifyHashedPassword(user, hash, password) != PasswordVerificationResult.Failed;
}` },
    { lang: 'typescript', title: 'Angular: what the frontend can and cannot do for security', code: `import { Component, inject, input } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// A01: a route guard is user experience, not security.
// It stops honest users from seeing a page they cannot use.
// The API must still check the role on every admin call.
export const adminGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  return auth.hasRole('admin') ? true : inject(Router).parseUrl('/');
};

@Component({
  selector: 'app-review',
  standalone: true,
  // SAFE: interpolation encodes the text. A script tag is shown as plain text.
  template: '<p>{{ text() }}</p>'
})
export class ReviewComponent {
  text = input.required<string>();
}

@Component({
  selector: 'app-unsafe-review',
  standalone: true,
  template: '<div [innerHTML]="html"></div>'
})
export class UnsafeReviewComponent {
  private sanitizer = inject(DomSanitizer);
  html: SafeHtml = '';

  // A03 (XSS) VULNERABLE: this switches Angular's protection off for user content.
  setReview(userText: string) {
    this.html = this.sanitizer.bypassSecurityTrustHtml(userText);
  }
  // FIX: bind userText with interpolation, or bind plain [innerHTML]="userText"
  // without the bypass call so Angular sanitizes it.
}

// A02/A05: anything in the bundle is public. Never put secrets here.
export const environment = {
  apiUrl: 'https://api.example.com',   // fine: not a secret
  // paymentSecretKey: '...'           // never: every visitor can read it
};

export abstract class AuthService { abstract hasRole(role: string): boolean; }` }
  ],
  pitfalls: [
    `<strong>Treating the Top 10 as the full job.</strong> It is a starting list of common risks, not a complete standard. Use ASVS or your own control list for real verification.`,
    `<strong>Believing a clean scanner report.</strong> Tools miss most access control and design flaws. Those need a person who knows the business rules.`,
    `<strong>Fixing only the symptom.</strong> Patching one SSRF check while the server role can still read every secret leaves the real problem in place.`,
    `<strong>Relying on Angular for security.</strong> Guards, hidden buttons and client-side validation help users. They do not stop someone who calls the API directly.`,
    `<strong>Arguing about the numbers.</strong> The order and names change between editions. Teams that learn the ideas adapt easily; teams that memorise "A03" get confused.`,
    `<strong>Updating packages once a year.</strong> A known flaw with a published fix is the easiest way in. Make updates small, automatic and frequent.`
  ],
  checklist: [
    `Check that every endpoint has an authorization rule and every record lookup includes the owner`,
    `Confirm passwords use a slow, salted hash and all traffic uses TLS`,
    `Search for string-built SQL, shell commands and bypassSecurityTrust calls`,
    `Write at least one abuse case for each new feature and enforce its rule on the server`,
    `Verify production settings: no debug pages, strict CORS, no default accounts`,
    `Run dotnet list package --vulnerable and npm audit in the pipeline`,
    `Add rate limiting, lockout and a second factor to login`,
    `Pin dependencies with lock files and protect who can change the pipeline`,
    `Log logins, denials and admin actions centrally, with alerts`,
    `Restrict server-side URL fetching to an allow-list and check the current OWASP edition`
  ],
  quiz: [
    { q: `What is the OWASP Top 10?`, options: [`A law that all public websites must follow before going live`, `A list of the ten most important web security risks`, `A tool that scans your code for the ten most common bugs`, `A yearly ranking of the ten most attacked websites`], answer: 1, why: `It is an awareness document from a non-profit community, based on real data. It is revised every few years, so check the current edition.` },
    { q: `An API returns any customer's invoice when you change the id in the URL. Which category is this?`, options: [`Cryptographic Failures`, `Injection`, `Broken Access Control`, `Security Misconfiguration`], answer: 2, why: `The app does not check that the invoice belongs to the caller. Missing or wrong permission checks are broken access control.` },
    { q: `Passwords are stored as plain MD5 hashes. Which category fits best?`, options: [`Cryptographic Failures`, `Insecure Design`, `SSRF`, `Software and Data Integrity Failures`], answer: 0, why: `MD5 is fast and unsalted, so stolen hashes are quickly guessed. Using the wrong or weak cryptography for the job is a cryptographic failure.` },
    { q: `Which risk is a scanner LEAST likely to find?`, options: [`A NuGet package with a publicly known flaw`, `A missing security header on the responses`, `A coupon code that can be used without any limit`, `A developer error page left on in production`], answer: 2, why: `Insecure design and many access control flaws depend on business meaning. Tools do not know your rules. People have to check them.` },
    { q: `A company is breached through a library flaw that had a fix available for months. Which category of the 2021 edition is this?`, options: [`Injection`, `Vulnerable and Outdated Components`, `Security Logging and Monitoring Failures`, `Identification and Authentication Failures`], answer: 1, why: `The weakness was in a third-party component and a patch existed. Not updating known-vulnerable components is its own Top 10 category. The 2025 edition widens it into Software Supply Chain Failures.` },
    { q: `Why does an Angular route guard not fix broken access control?`, options: [`Guards only run on mobile devices, not in desktop browsers`, `Guards run in the browser, and attackers can call the API directly`, `Guards are much slower than server checks, so they are skipped under load`, `Guards cannot read tokens, so they never know who the user is`], answer: 1, why: `Anything in the browser can be skipped. The server must enforce every permission on every request.` }
  ],
  takeaways: [
    `The OWASP Top 10 is the common-accidents poster of web security: avoid these and you remove most easy ways in.`,
    `Broken access control leads the list because only your own code knows who owns what.`,
    `Frameworks help with injection and XSS, but only if you do not switch their protections off.`,
    `Insecure design cannot be patched later. Think about abuse before you build.`,
    `Outdated components and weak pipelines let attackers in through code you did not write.`,
    `The list changes every few years. Learn the ideas and check the current edition.`
  ],
  interview: [
    { q: `Walk me through the OWASP Top 10.`, a: `<p>I group them. Who may do what: broken access control and authentication failures. How data is handled: cryptographic failures, injection, SSRF, and integrity failures. How the system is built and run: insecure design, misconfiguration, vulnerable components, and logging failures. For a .NET API the ones I check first are access control (owner in every query, deny by default), injection (parameterized queries only) and components (automated package audits). I also note that the list is revised every few years, so names and order change.</p>` },
    { q: `Why is broken access control ranked so high?`, a: `<p>Because it is very common and tools cannot find it well. A framework can encode output or parameterize a query for you, but it cannot know that record 302 belongs to another customer. The check depends on business meaning, so developers must write it, and one missing line is enough. I reduce it with deny-by-default policies, scoped repositories or query filters, and tests where one user requests another user's data.</p>` },
    { q: `What is the difference between insecure design and a security bug in the implementation?`, a: `<p>An implementation bug is a mistake in building a sound plan, for example forgetting to parameterize one query. Insecure design means the plan itself is unsafe, for example trusting a price sent by the client, or a password reset that is weaker than login. Perfect code cannot fix it. It is prevented earlier, with threat modelling, abuse cases and security requirements.</p>` },
    { q: `Is an application secure if it passes an OWASP Top 10 scan?`, a: `<p>No. The Top 10 is an awareness list, and scanners only cover part of it well. They are good at known vulnerable packages, missing headers and some injection. They are weak on access control and design flaws. I use scans as a baseline, add manual review and tests for authorization, and use a fuller standard such as OWASP ASVS when we need real assurance.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-data-protection — Data Protection & Privacy                     */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-data-protection'] = {
  hook: `The safest data is data you never collected. The second safest is data that is useless to whoever steals it.`,
  intro: `<p>People hand your app their names, addresses, health details and card numbers. They trust you to look after them. <span class="term">Data protection</span> is how you keep that promise in code and in the database.</p>
<p>It has three parts. First, <strong>know what you hold</strong> and how sensitive it is. Second, <strong>protect it</strong> while it moves over the network and while it sits on disk. Third, <strong>hold as little as you can, for as short a time as you can</strong>.</p>
<p>A key word in this lesson is <span class="term">PII</span>, short for Personally Identifiable Information. It means any data that points to a real person: a name, an email, a phone number, an IP address, a face photo, a government id. Privacy laws such as the EU's <span class="term">GDPR</span> (General Data Protection Regulation) set rules for how PII is collected, used, stored and deleted.</p>
<p>You do not need to be a lawyer. But as a developer you make the choices that decide whether a stolen database is a disaster or a non-event: which columns are encrypted, where the keys live, what goes in the logs, and when old rows are deleted.</p>`,
  realLife: {
    title: 'The armoured van, the vault and the shredder',
    body: `<p>Think about how a bank handles cash. On the road, cash travels in an <strong>armoured van</strong>. Inside the branch it sits in a <strong>vault</strong>. The vault key is not taped to the vault door; it is held by someone else, somewhere else. And old paperwork goes into a <strong>shredder</strong> on a schedule, because paper that no longer exists cannot be stolen.</p>
<p>Data works the same way. The armoured van is <span class="term">encryption in transit</span> (TLS, the lock icon in the browser). The vault is <span class="term">encryption at rest</span> (data scrambled on disk). The key held elsewhere is <span class="term">key management</span>. The shredder is your <span class="term">retention policy</span>.</p>
<p>A bank also does not keep a photocopy of every customer's passport at every desk. Each desk gets only what it needs. That is <span class="term">data minimisation</span>.</p>
<p><strong>How this showed up in the real world:</strong> Again and again, companies have leaked millions of records without any break-in. A database backup or an export file was left in a cloud storage folder that anyone on the internet could read. In several widely reported breaches of large companies, investigators found that some of the most sensitive fields, such as passport numbers, were stored unencrypted, or that the encryption keys were kept on the same system as the data. In each case the fix was known and cheap: encrypt, separate the keys, and delete what you no longer need.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Step one: classify your data</h4>
<p><span class="term">Data classification</span> means putting every kind of data into a small number of labelled boxes. Each box has rules. Four boxes are enough for most teams.</p>
<table>
<thead><tr><th>Class</th><th>Examples</th><th>Rule of thumb</th></tr></thead>
<tbody>
<tr><td>Public</td><td>Marketing pages, product prices</td><td>Anyone may see it.</td></tr>
<tr><td>Internal</td><td>Team wiki, non-sensitive metrics</td><td>Staff only. A leak is embarrassing, not harmful.</td></tr>
<tr><td>Confidential</td><td>Customer names, emails, orders, contracts</td><td>Need-to-know. Encrypted at rest and in transit. Access is logged.</td></tr>
<tr><td>Restricted</td><td>Passwords, card numbers, health data, government ids, keys</td><td>Strongest controls. Field-level encryption or hashing. Very few people and services can read it.</td></tr>
</tbody>
</table>
<h4>Three states of data</h4>
<ul>
<li><strong>In transit:</strong> moving over a network. Protect with TLS (HTTPS).</li>
<li><strong>At rest:</strong> sitting in a database, a file or a backup. Protect with encryption on disk.</li>
<li><strong>In use:</strong> loaded in memory while your code works on it. Protect by limiting who and what can run that code.</li>
</ul>
<h4>Five tools that sound alike</h4>
<table>
<thead><tr><th>Tool</th><th>What it does</th><th>Can you get the original back?</th></tr></thead>
<tbody>
<tr><td>Encryption</td><td>Scrambles data with a key</td><td>Yes, with the key</td></tr>
<tr><td>Hashing</td><td>Turns data into a fixed fingerprint</td><td>No. Used for passwords and integrity checks</td></tr>
<tr><td>Tokenisation</td><td>Swaps the value for a random stand-in; the real value lives in a separate vault</td><td>Only by asking the token vault</td></tr>
<tr><td>Masking</td><td>Hides part of a value on display, like ****1234</td><td>The stored value is unchanged</td></tr>
<tr><td>Pseudonymisation</td><td>Replaces names with codes so a record does not point to a person on its own</td><td>Yes, with the separate lookup table</td></tr>
</tbody>
</table>
<h4>Collect less</h4>
<p>Before adding a field, ask: "What will we do with this?" If there is no clear answer, do not collect it. A date of birth you never stored cannot leak.</p>
<div class="callout tip">A quick test for any column: "If this table were posted on the internet tomorrow, would this column hurt someone?" If yes, it needs more than a login in front of it.</div>` },
    { name: 'Intermediate', body: `<h4>Encryption at rest comes in layers</h4>
<p>Each layer protects against a different person. Choose by asking "who am I worried about?"</p>
<table>
<thead><tr><th>Layer</th><th>Protects against</th><th>Does not protect against</th></tr></thead>
<tbody>
<tr><td>Disk or volume encryption</td><td>A stolen disk or laptop</td><td>Anyone logged into the running server</td></tr>
<tr><td>Database file encryption (TDE in SQL Server)</td><td>Stolen database files and backups</td><td>A database user or a SQL injection: queries return plain text</td></tr>
<tr><td>Column encryption (for example Always Encrypted)</td><td>Database admins and anyone reading the tables directly; the keys stay with the client app</td><td>A compromised application that holds the key</td></tr>
<tr><td>Application-level encryption</td><td>Everything below the app, including backups and exports</td><td>A compromised application; also harder to search and sort</td></tr>
</tbody>
</table>
<p>TDE means Transparent Data Encryption. "Transparent" means your queries do not change. It is a good baseline, and it is not enough alone for Restricted data.</p>
<h4>Keys are the real secret</h4>
<p>Encrypted data with the key next to it is a locked door with the key in the lock. Rules for keys:</p>
<ul>
<li>Keep keys in a <span class="term">key vault</span> or key management service, never in source code or config files.</li>
<li>Give the app an identity that may <em>use</em> a key without being able to <em>export</em> it.</li>
<li><strong>Rotate</strong> keys on a schedule, and immediately after a suspected leak.</li>
<li>Store a key id next to each encrypted value, so you know which key opens it after rotation.</li>
</ul>
<h4>Envelope encryption in plain words</h4>
<p>Imagine every letter goes into its own small locked box, each with its own small key. Then all the small keys go into one big safe. To rotate, you only change the lock on the big safe, not on every box.</p>
<p>In practice: a <span class="term">data key</span> encrypts your data. A <span class="term">master key</span> in the vault encrypts ("wraps") the data key. You store the wrapped data key beside the data. The master key never leaves the vault.</p>
<h4>The ASP.NET Core Data Protection API</h4>
<p>.NET has a built-in service for protecting short-lived values such as cookies, reset links and anti-forgery tokens. You ask for a protector with a <span class="term">purpose string</span>, then call <code>Protect</code> and <code>Unprotect</code>. It handles algorithms and key rotation for you. Two rules: store the key ring in a shared, protected place when you run more than one server, and use a different purpose string per use, so a token made for one feature cannot be replayed in another.</p>
<h4>Retention, deletion and backups</h4>
<ul>
<li>Write down how long each data class is kept. Automate the delete job.</li>
<li>Backups hold the same data, so they need the same encryption and access rules.</li>
<li>Exports, reports, test databases and analytics copies count too. Mask or generate fake data for non-production.</li>
</ul>
<div class="callout warn">Dynamic masking in a database is a display convenience. Users with enough rights, or clever queries, can still reach the real values. Use it together with encryption and permissions, not instead of them.</div>` },
    { name: 'Expert', body: `<h4>GDPR for developers, the short version</h4>
<p>GDPR applies when you process personal data of people in the EU, wherever your company is. Other regions have similar laws. This is engineering guidance, not legal advice; your privacy or legal team decides the details.</p>
<ul>
<li><strong>Lawful basis.</strong> You need a valid reason for each use of personal data. There are six: consent, a contract with the person, a legal obligation, vital interests, a public task, and legitimate interests.</li>
<li><strong>Consent</strong> must be freely given, specific, informed and as easy to withdraw as to give. Store when and to what the person agreed.</li>
<li><strong>Purpose limitation and minimisation.</strong> Use data only for the stated purpose, and collect only what that purpose needs.</li>
<li><strong>Data subject rights.</strong> People can ask for a copy of their data (access), a correction, deletion (erasure), a machine-readable export (portability), and can object to some uses. Your system must be able to find, export and delete one person's data.</li>
<li><strong>Privacy by design and by default.</strong> Build protection in from the start, and make the most private setting the default.</li>
<li><strong>Breach notification.</strong> A personal data breach must be reported to the regulator without undue delay, where feasible within 72 hours of becoming aware of it. That only works if you can detect and assess a breach quickly.</li>
</ul>
<h4>Designing for erasure</h4>
<p>Deleting one person from a live system is the hard part. Plan for it:</p>
<ul>
<li>Keep personal fields in few tables, keyed by a person id, so one routine can find them all.</li>
<li>Where the law requires you to keep records such as invoices, anonymise the personal fields and keep the rest.</li>
<li><span class="term">Crypto-shredding</span>: encrypt each person's or tenant's data with their own key. Deleting the key makes every copy unreadable, including copies in old backups.</li>
<li>Remember search indexes, caches, logs, analytics stores and message queues.</li>
</ul>
<h4>Pseudonymous is not anonymous</h4>
<p>Pseudonymised data can be linked back with extra information, so it is still personal data. Truly anonymous data cannot be linked to a person by anyone, which is much harder than removing the name column. A postcode, a birth date and a gender together identify many people.</p>
<h4>Trade-offs of field-level encryption</h4>
<ul>
<li><strong>Search and sort break.</strong> Random encryption gives a different result each time, so you cannot use equality or range queries. Deterministic encryption allows equality but reveals which rows share a value. A <span class="term">blind index</span> (a keyed hash stored beside the ciphertext) allows exact-match lookups with less leakage.</li>
<li><strong>Rotation strategy.</strong> Re-wrapping data keys under a new master key is cheap. Re-encrypting all data is slow; do it lazily on read or with a background job, guided by the key id.</li>
<li><strong>Performance.</strong> Do not call the vault for every row. Cache unwrapped data keys in memory for a short time.</li>
<li><strong>Bind ciphertext to its place.</strong> Authenticated encryption with associated data, such as AES-GCM with the record id as extra input, stops an attacker from copying one user's encrypted value into another user's row.</li>
</ul>
<h4>Multi-tenant and regional needs</h4>
<p>Large customers may ask for their own keys, for data to stay in one region, and for proof of who accessed what. Per-tenant keys, region-pinned storage and access logs for Restricted data make these requests possible without a redesign.</p>
<div class="callout idea">Interview angle: when asked "how would you store card or health data?", start with "do we need to store it at all?", then classification, tokenisation or field-level encryption with envelope keys in a vault, least-privilege access, masking on display, audit logs, retention and erasure. Mention that TDE alone does not stop SQL injection.</div>` }
  ],
  flow: {
    title: 'The life of one passport number in your system',
    steps: [
      { title: 'Ask "do we need it?"', desc: 'Data minimisation first. If a yes/no "identity verified" flag is enough, store that and never keep the number.' },
      { title: 'Classify', desc: 'A passport number is Restricted. That label decides everything else: encryption, access, logging, retention.' },
      { title: 'Protect in transit', desc: 'The browser sends it over TLS. Inside your network, service-to-service calls use TLS too.' },
      { title: 'Encrypt the field', desc: 'The app creates a data key and encrypts the value with AES-GCM, binding it to the record id.' },
      { title: 'Wrap the data key', desc: 'The key vault encrypts the data key with a master key that never leaves the vault. The wrapped key is stored beside the ciphertext.' },
      { title: 'Store and back up', desc: 'The database holds only ciphertext. TDE and encrypted backups add another layer underneath.' },
      { title: 'Read with care', desc: 'Only one service may unwrap and decrypt. Screens show a masked value. Each read of the real value is logged.' },
      { title: 'Delete on time', desc: 'A retention job removes the value when it is no longer needed. Deleting a per-person key makes old backup copies unreadable.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'ASP.NET Core Data Protection API: time-limited, purpose-bound tokens', code: `using System.Security.Cryptography;
using Microsoft.AspNetCore.DataProtection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddDataProtection()
    .SetApplicationName("nexshop")                           // same name on every instance
    .PersistKeysToFileSystem(new DirectoryInfo("/var/dp-keys"))  // shared, access-controlled store
    .SetDefaultKeyLifetime(TimeSpan.FromDays(90));           // automatic key rotation
// In the cloud, persist the key ring to blob storage and protect it with a key vault key.
// The Azure extension packages offer PersistKeysToAzureBlobStorage and
// ProtectKeysWithAzureKeyVault. Check the current docs for your platform.

builder.Services.AddSingleton<InviteLinks>();
var app = builder.Build();
app.Run();

public sealed class InviteLinks(IDataProtectionProvider provider)
{
    // The purpose string isolates this use. A token made here cannot be
    // unprotected by a protector created with any other purpose.
    private readonly ITimeLimitedDataProtector _protector =
        provider.CreateProtector("Invites.v1").ToTimeLimitedDataProtector();

    public string Create(int userId) =>
        _protector.Protect(userId.ToString(), TimeSpan.FromHours(24));

    public int? Read(string token)
    {
        try
        {
            return int.Parse(_protector.Unprotect(token));
        }
        catch (CryptographicException)
        {
            return null;    // tampered with, expired, or made for another purpose
        }
    }
}

// Good uses: cookies, reset and invite links, anti-forgery tokens, short-lived state.
// For long-term encryption of database fields, use explicit keys in a vault (next tab),
// so you control key ids, rotation and deletion yourself.` },
    { lang: 'csharp', title: 'Field-level encryption with AES-GCM and envelope keys', code: `using System.Security.Cryptography;
using System.Text;

// A thin wrapper over your key vault or key management service.
// The master key never leaves the vault. The app can only ask it to wrap and unwrap.
public interface IKeyWrapper
{
    string CurrentKeyId { get; }
    Task<byte[]> WrapAsync(string keyId, byte[] dataKey);
    Task<byte[]> UnwrapAsync(string keyId, byte[] wrappedKey);
}

// Everything here is safe to store in the database row.
public sealed record EncryptedField(
    string KeyId, byte[] WrappedKey, byte[] Nonce, byte[] Ciphertext, byte[] Tag);

public sealed class FieldEncryptor(IKeyWrapper vault)
{
    public async Task<EncryptedField> EncryptAsync(string plaintext, string recordId)
    {
        byte[] dataKey = RandomNumberGenerator.GetBytes(32);   // fresh 256-bit data key
        byte[] nonce = RandomNumberGenerator.GetBytes(12);     // never reuse a nonce with a key
        byte[] plain = Encoding.UTF8.GetBytes(plaintext);
        byte[] cipher = new byte[plain.Length];
        byte[] tag = new byte[16];
        byte[] bindTo = Encoding.UTF8.GetBytes(recordId);      // ties the value to this row

        using (var aes = new AesGcm(dataKey, tagSizeInBytes: 16))
            aes.Encrypt(nonce, plain, cipher, tag, bindTo);

        string keyId = vault.CurrentKeyId;
        byte[] wrapped = await vault.WrapAsync(keyId, dataKey);

        CryptographicOperations.ZeroMemory(dataKey);           // do not leave keys in memory
        CryptographicOperations.ZeroMemory(plain);
        return new EncryptedField(keyId, wrapped, nonce, cipher, tag);
    }

    public async Task<string> DecryptAsync(EncryptedField f, string recordId)
    {
        byte[] dataKey = await vault.UnwrapAsync(f.KeyId, f.WrappedKey);
        byte[] plain = new byte[f.Ciphertext.Length];
        try
        {
            using var aes = new AesGcm(dataKey, tagSizeInBytes: 16);
            // Throws if the ciphertext, tag or record id was changed.
            aes.Decrypt(f.Nonce, f.Ciphertext, f.Tag, plain, Encoding.UTF8.GetBytes(recordId));
            return Encoding.UTF8.GetString(plain);
        }
        finally
        {
            CryptographicOperations.ZeroMemory(dataKey);
            CryptographicOperations.ZeroMemory(plain);
        }
    }
}

// Display rule: screens and logs get the masked form, never the real value.
public static class Mask
{
    public static string Last4(string value) =>
        value.Length <= 4 ? "****" : new string('*', value.Length - 4) + value[^4..];
}

// At scale, use one data key per tenant or per day and cache it briefly,
// so you are not calling the vault for every row.` },
    { lang: 'sql', title: 'SQL Server: masking for support staff, retention and erasure', code: `-- 1) Dynamic data masking: low-privilege readers see masked values.
--    This is a display aid. Combine it with permissions and encryption.
ALTER TABLE dbo.Customers
    ALTER COLUMN Email ADD MASKED WITH (FUNCTION = 'email()');
ALTER TABLE dbo.Customers
    ALTER COLUMN Phone ADD MASKED WITH (FUNCTION = 'partial(0,"XXX-XXX-",4)');

GRANT SELECT ON dbo.Customers TO SupportRole;     -- sees aXXX@XXXX.com
GRANT UNMASK TO PrivacyOfficerRole;               -- the few who may see real values

-- 2) Retention: delete old rows in small batches so the table is not locked for long.
DECLARE @cutoff datetime2 = DATEADD(YEAR, -2, SYSUTCDATETIME());
WHILE 1 = 1
BEGIN
    DELETE TOP (5000) FROM dbo.LoginAudit WHERE CreatedUtc < @cutoff;
    IF @@ROWCOUNT = 0 BREAK;
END;

-- 3) Erasure request: remove the personal fields, keep the rows that
--    accounting rules require (orders keep their totals and dates).
DECLARE @CustomerId int = 4711;
BEGIN TRANSACTION;
    UPDATE dbo.Customers
    SET FullName    = 'Deleted user',
        Email       = CONCAT('deleted-', CustomerId, '@invalid.example'),
        Phone       = NULL,
        DateOfBirth = NULL,
        ErasedUtc   = SYSUTCDATETIME()
    WHERE CustomerId = @CustomerId;

    DELETE FROM dbo.CustomerAddresses  WHERE CustomerId = @CustomerId;
    DELETE FROM dbo.MarketingConsents  WHERE CustomerId = @CustomerId;
COMMIT;
-- Also remove the person from search indexes, caches and analytics copies.

-- 4) Encryption at rest for the whole database and its backups (one-time DBA setup):
--    create a certificate and a database encryption key, then
--    ALTER DATABASE Shop SET ENCRYPTION ON;
-- PostgreSQL has no built-in dynamic masking: use views with restricted columns,
-- and disk or storage-level encryption for data at rest.` }
  ],
  pitfalls: [
    `<strong>Thinking TDE solves everything.</strong> Database file encryption protects stolen files and backups. A SQL injection or an over-privileged login still reads plain text.`,
    `<strong>Keys next to the data.</strong> An encryption key in appsettings.json, in the same database, or in the same backup gives away everything at once. Keep keys in a vault with separate access.`,
    `<strong>Production data in test.</strong> Test and developer databases have weaker controls. Copying real customer data into them multiplies your risk. Mask it or generate fake data.`,
    `<strong>Forgetting the copies.</strong> Exports, spreadsheets, logs, caches, search indexes and analytics stores hold personal data too, and are usually less protected than the main database.`,
    `<strong>Keeping data forever.</strong> "We might need it one day" turns a small breach into a huge one. Set a retention period and automate the delete.`,
    `<strong>Calling pseudonymised data anonymous.</strong> If anyone can link the codes back to people, it is still personal data and the rules still apply.`
  ],
  checklist: [
    `List the personal and sensitive fields you store and give each a class`,
    `Remove fields you collect but do not use`,
    `Enforce TLS for every external and internal connection`,
    `Turn on encryption at rest for databases, file stores and backups`,
    `Add field-level encryption or tokenisation for Restricted data`,
    `Move all keys to a vault, store a key id with ciphertext, and schedule rotation`,
    `Mask sensitive values on screens, in exports and in logs`,
    `Write a retention period per data class and automate deletion`,
    `Build and test the "export my data" and "delete my data" routines`,
    `Replace production data in test environments with masked or fake data`
  ],
  quiz: [
    { q: `What does data minimisation mean?`, options: [`Compressing stored data so it takes less disk space`, `Collecting and keeping only the data you really need`, `Encrypting every column so each value is as small as possible`, `Deleting all backups every day to keep storage costs down`], answer: 1, why: `Data you never collected or have already deleted cannot leak. It is the cheapest and strongest protection.` },
    { q: `A database uses TDE (file-level encryption). An attacker exploits a SQL injection. What do they see?`, options: [`Encrypted bytes, because TDE protects every row that a query returns`, `Plain data, because the engine decrypts it for any query`, `Nothing, because TDE blocks injected SQL before it runs`, `Only masked values, because TDE masks columns for web logins`], answer: 1, why: `TDE protects files and backups on disk. Queries through the database engine return plain data. Restricted fields need column or application-level encryption as well.` },
    { q: `In envelope encryption, what is stored next to the encrypted data?`, options: [`The master key, so the data can be opened offline`, `The plain data key, ready for the next read`, `The data key, wrapped by the master key`, `The user's password, hashed with the master key`], answer: 2, why: `The data key encrypts the data, and the master key in the vault wraps the data key. Only the wrapped data key is stored with the data. The master key never leaves the vault.` },
    { q: `Which technique can NOT be reversed to get the original value?`, options: [`Encryption`, `Tokenisation`, `Hashing`, `Pseudonymisation`], answer: 2, why: `A hash is a one-way fingerprint. Encryption, tokenisation and pseudonymisation can all be reversed by someone holding the key, the token vault or the lookup table.` },
    { q: `Why give each use of the ASP.NET Core Data Protection API its own purpose string?`, options: [`It makes the protected tokens shorter and easier to share`, `So a token made for one feature is not accepted by another`, `It is required before the app can serve pages over HTTPS`, `It switches off key rotation so old tokens keep working`], answer: 1, why: `Purpose strings isolate protectors. A reset token cannot be replayed as an invite token, because a protector with a different purpose cannot unprotect it.` },
    { q: `Under GDPR, a user asks you to delete their data. Which design makes this easiest?`, options: [`Personal fields spread across many tables, logs and exports with no person id`, `Personal fields kept in few places, keyed by a person id`, `Keeping everything in backups forever`, `Storing data only in spreadsheets`], answer: 1, why: `You can only delete what you can find. Keeping personal data in few, well-known places with one routine to erase it turns a hard request into a routine job.` }
  ],
  takeaways: [
    `Classify data first. The class decides the encryption, access, logging and retention rules.`,
    `Collect less and delete on time. Data that does not exist cannot be breached.`,
    `Protect data in transit with TLS and at rest with layered encryption.`,
    `Keys are the real secret: keep them in a vault, away from the data, and rotate them.`,
    `Envelope encryption lets you rotate the master key without re-encrypting everything.`,
    `Build find, export and delete for one person's data into the system from the start.`
  ],
  interview: [
    { q: `What is the difference between encryption in transit and encryption at rest?`, a: `<p>In transit protects data while it moves over a network, using TLS, so nobody on the path can read or change it. At rest protects data stored on disk, in databases, files and backups, so a stolen disk or backup is unreadable. You need both, and they do not replace access control: a logged-in user or an injected query still sees plain data unless sensitive fields have their own encryption.</p>` },
    { q: `Explain envelope encryption and why it is used.`, a: `<p>Data is encrypted with a data key. The data key is then encrypted, or wrapped, with a master key that lives in a key vault and never leaves it. The wrapped data key is stored next to the data. Benefits: the master key stays in protected hardware, large data is encrypted locally and fast, and rotating the master key only means re-wrapping small data keys, not re-encrypting all the data.</p>` },
    { q: `How would you store a sensitive field such as a national id number?`, a: `<p>First I would ask whether we need to store it at all, or whether a verified flag or the last four digits is enough. If we must store it, I classify it as restricted, encrypt it at field level with an authenticated mode such as AES-GCM, use envelope keys in a vault with a key id stored beside the value, restrict decryption to one service, show a masked value in the UI, log each read of the real value, and set a retention period. If we need exact-match lookup I add a keyed blind index.</p>` },
    { q: `What do developers need to build to support GDPR rights?`, a: `<p>The ability to find all data for one person, export it in a machine-readable format, correct it, and delete or anonymise it across the main database, search indexes, caches and analytics copies. Also consent records with time and purpose, a retention job per data type, privacy-friendly defaults, and detection and logging good enough to assess and report a breach quickly.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-dotnet-checklist — Secure Coding in C# & .NET: The Checklist    */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-dotnet-checklist'] = {
  hook: `Pilots with thirty years of experience still read a checklist before every take-off. It is not because they forget how to fly. It is because one skipped switch is enough.`,
  intro: `<p>You have now seen many separate security topics: injection, access control, secrets, logging, data protection. This lesson pulls them together into one list for a .NET developer. It is the page you open before a release.</p>
<p>ASP.NET Core is a safe framework in many ways. It encodes HTML output, it has a strong identity system, and it ships with rate limiting and data protection. But some of the safe behaviour is <strong>opt-in</strong>. You must switch it on in <code>Program.cs</code>. And some risks live in plain C# code, where no framework can help: a predictable random number, a number that grows too large and wraps around, or two requests that change the same row at the same moment.</p>
<p>So the checklist has two halves. The first half is <span class="term">hardening</span>: the settings that make the web app safe by default. The second half is <strong>safe coding habits</strong>: which .NET APIs to use and which to avoid.</p>
<p>You do not need to memorise it. You need to run it, the same way, every time.</p>`,
  realLife: {
    title: 'The pre-flight checklist',
    body: `<p>Before take-off, two pilots read a card out loud. "Flaps?" "Set." "Fuel?" "Checked." Each item is simple. Each item has, at some point in history, caused a crash when someone skipped it. The card exists so that safety does not depend on anyone's memory on a busy day.</p>
<p>Surgeons do the same before an operation: right patient, right side, instruments counted. Hospitals that introduced such lists saw fewer mistakes, even among very skilled teams.</p>
<p>Your release is the take-off. "HTTPS forced?" "Yes." "Endpoints closed by default?" "Yes." "Packages scanned?" "Yes." Boring, quick, and it works.</p>
<p><strong>How this showed up in the real world:</strong> Post-incident reports from many companies read like a list of skipped checklist items. A debug setting left on in production. A storage account open to the public. A password reset code created with a predictable random generator, so attackers could guess the next one. A payment endpoint where two requests sent at the same instant both passed the balance check, so money was spent twice. None of these teams lacked skill. They lacked a routine that caught the one switch left in the wrong position.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Safe by default</h4>
<p><span class="term">Secure by default</span> means that if a developer does nothing special, the result is safe. A new endpoint is closed until you open it. A new cookie is protected until you relax it. The checklist below sets up those defaults once, so every new feature inherits them.</p>
<h4>The six areas</h4>
<table>
<thead><tr><th>Area</th><th>What you switch on</th><th>Plain reason</th></tr></thead>
<tbody>
<tr><td>Transport</td><td>HTTPS redirection and HSTS</td><td>Nobody on the network can read or change traffic. HSTS tells browsers "always use HTTPS for this site".</td></tr>
<tr><td>Browser rules</td><td>Security headers, cookie flags, strict CORS, anti-forgery</td><td>Other websites cannot use your user's browser against you.</td></tr>
<tr><td>Who may call</td><td>Authentication plus a deny-by-default authorization policy</td><td>A forgotten attribute means "closed", not "open".</td></tr>
<tr><td>Limits</td><td>Rate limiting, request size limits, timeouts</td><td>One caller cannot use up the whole server.</td></tr>
<tr><td>Input</td><td>Model validation and strict JSON settings</td><td>Bad data is rejected at the door.</td></tr>
<tr><td>Failure</td><td>Global error handler, safe logs, secrets in a vault</td><td>Errors tell attackers nothing, and no secret sits in the code.</td></tr>
</tbody>
</table>
<h4>Safe API, unsafe API</h4>
<p>Some .NET classes look alike but one is for games and one is for security.</p>
<table>
<thead><tr><th>Need</th><th>Do not use</th><th>Use</th></tr></thead>
<tbody>
<tr><td>A secret random value (token, code)</td><td><code>System.Random</code></td><td><code>RandomNumberGenerator</code></td></tr>
<tr><td>Store a password</td><td>MD5, SHA-256 alone</td><td>The Identity password hasher</td></tr>
<tr><td>Compare two secrets</td><td><code>==</code> on strings</td><td><code>CryptographicOperations.FixedTimeEquals</code></td></tr>
<tr><td>Run SQL</td><td>String concatenation</td><td>Parameters, LINQ, <code>FromSql</code> with interpolation handled by EF</td></tr>
<tr><td>Protect a cookie or link</td><td>Your own encryption</td><td>The Data Protection API</td></tr>
</tbody>
</table>
<div class="callout tip">If you find yourself writing security code from scratch (your own token format, your own encryption, your own login), stop and look for the built-in feature. It almost always exists.</div>` },
    { name: 'Intermediate', body: `<h4>The order of the pipeline matters</h4>
<p>Middleware runs in the order you add it. A safe order for an API is: exception handler, HSTS, HTTPS redirection, security headers, CORS, authentication, rate limiter, authorization, then your endpoints.</p>
<h4>Hardening items, one by one</h4>
<ul>
<li><strong>HTTPS and HSTS.</strong> <code>UseHttpsRedirection()</code> and <code>UseHsts()</code> outside development. Behind a reverse proxy, configure forwarded headers so the app knows the original scheme.</li>
<li><strong>Security headers.</strong> <code>X-Content-Type-Options: nosniff</code> stops browsers from guessing file types. <code>X-Frame-Options: DENY</code> or the CSP <code>frame-ancestors</code> rule stops your pages being shown inside another site. A <code>Content-Security-Policy</code> limits where scripts may load from.</li>
<li><strong>Cookies.</strong> <code>HttpOnly</code> (scripts cannot read it), <code>Secure</code> (HTTPS only), <code>SameSite</code> Lax or Strict (not sent on most cross-site requests). A name starting with <code>__Host-</code> makes browsers enforce Secure and a fixed host.</li>
<li><strong>CORS.</strong> List exact origins. Never combine "any origin" with credentials.</li>
<li><strong>Anti-forgery.</strong> Needed when the browser sends credentials automatically, which means cookie authentication. Add anti-forgery token validation for every state-changing request.</li>
<li><strong>Deny by default.</strong> Set <code>FallbackPolicy</code> to require an authenticated user. Mark the few public endpoints with <code>[AllowAnonymous]</code>.</li>
<li><strong>Rate limiting.</strong> A global limiter per user or address, with stricter named policies for login and other costly calls.</li>
<li><strong>Size and time limits.</strong> Kestrel limits for body size, header size and header timeout. A separate, explicit limit on upload endpoints.</li>
<li><strong>Model validation.</strong> <code>[ApiController]</code> returns 400 automatically when validation attributes fail. Validate lengths and ranges on every DTO.</li>
<li><strong>JSON.</strong> Keep the default depth limit, and consider rejecting unknown properties so surprise fields are an error.</li>
<li><strong>Server header.</strong> <code>AddServerHeader = false</code> removes a free hint about your stack.</li>
</ul>
<h4>Let the build help you</h4>
<p>Three settings in the project file turn the compiler into a reviewer:</p>
<pre><code>&lt;Nullable&gt;enable&lt;/Nullable&gt;
&lt;AnalysisLevel&gt;latest-recommended&lt;/AnalysisLevel&gt;
&lt;TreatWarningsAsErrors&gt;true&lt;/TreatWarningsAsErrors&gt;
</code></pre>
<p><span class="term">Nullable reference types</span> make the compiler warn when a value may be null, which removes a whole family of crashes. The built-in analyzers flag risky calls such as weak hash algorithms and SQL built from strings.</p>
<p>And check your packages on every build:</p>
<pre><code>dotnet list package --vulnerable --include-transitive
dotnet list package --outdated
</code></pre>
<div class="callout warn">"Transitive" packages are the packages your packages depend on. Most known-vulnerable code arrives this way, so always include them in the scan.</div>` },
    { name: 'Expert', body: `<h4>Race conditions and TOCTOU</h4>
<p>A <span class="term">race condition</span> is a bug that only appears when two things happen at almost the same time. The classic form is <span class="term">TOCTOU</span>: time of check to time of use. You check a condition, then act on it, and something changes in between.</p>
<p>Example: read the balance, see it is enough, subtract, save. Two requests at the same instant both read 100, both see "enough", both subtract 80. The account has paid out 160 from a balance of 100. The same shape appears with coupons, stock, seat booking and "one vote per user".</p>
<p>Fixes, in order of preference:</p>
<ul>
<li><strong>One atomic statement</strong> that checks and changes together: <code>UPDATE ... SET Balance = Balance - @amt WHERE Id = @id AND Balance >= @amt</code>, then look at the rows affected.</li>
<li><strong>A concurrency token</strong> (a row version column). The save fails if the row changed since you read it, and you retry.</li>
<li><strong>A unique constraint</strong> for "only once" rules, so the database refuses the second insert.</li>
<li>A transaction with a suitable isolation level or lock, when several rows must change together.</li>
</ul>
<p>An in-process <code>lock</code> does not help when you run more than one server. Files have the same trap: <code>File.Exists</code> followed by open can be raced. Open the file and handle the failure instead.</p>
<h4>Numbers that wrap around</h4>
<p>By default C# integer maths wraps silently. A quantity times a price that goes past the maximum becomes a negative number, and a negative total can become a refund. Validate ranges, use <code>checked</code> for money and size calculations, or turn on overflow checking for the project. Use <code>decimal</code> for money.</p>
<h4>Secrets and timing</h4>
<p><code>System.Random</code> is predictable: seeing a few outputs can be enough to work out the next ones. Use <code>RandomNumberGenerator</code> for anything an attacker must not guess. When comparing a secret (an API key, a webhook signature), a normal comparison stops at the first different character, and the tiny time difference leaks how much was right. <code>FixedTimeEquals</code> always takes the same time.</p>
<h4>Regular expressions as a denial of service</h4>
<p>Some patterns take a very long time on certain inputs because the engine tries many paths. This is called <span class="term">ReDoS</span>. Always pass a match timeout, cap input length before matching, and consider <code>RegexOptions.NonBacktracking</code> for patterns that run on untrusted text.</p>
<h4>Memory safety</h4>
<p>Normal C# is memory safe: array and <code>Span&lt;T&gt;</code> access is bounds-checked. You leave that safety when you use <code>unsafe</code> blocks, pointers, <code>Unsafe.*</code> or <code>MemoryMarshal</code> helpers that skip checks, or <code>stackalloc</code> with a size taken from user input (which can overflow the stack). Keep <code>AllowUnsafeBlocks</code> off unless a reviewed hot path needs it.</p>
<h4>Other sharp edges</h4>
<ul>
<li><strong>Deserialization.</strong> Never use <code>BinaryFormatter</code>. Do not enable type name handling for untrusted JSON. Deserialize into fixed, known types.</li>
<li><strong>Paths.</strong> Combine a user file name with a base folder, resolve the full path, and verify it still starts with the base folder.</li>
<li><strong>Processes.</strong> Pass arguments as a list, never as one concatenated string through a shell.</li>
<li><strong>XML.</strong> Keep DTD processing prohibited on readers that parse untrusted XML.</li>
</ul>
<div class="callout idea">Interview angle: "How do you prevent double spending in a web API?" is a TOCTOU question. Answer with the conditional update or a concurrency token, mention idempotency keys for retried requests, and explain why a lock in application memory fails behind a load balancer.</div>` }
  ],
  flow: {
    title: 'One request through a hardened ASP.NET Core pipeline',
    steps: [
      { title: 'Kestrel limits', desc: 'The server checks header size, body size and timeouts before your code runs. An oversized request is rejected at once.' },
      { title: 'HTTPS', desc: 'A plain HTTP request is redirected. The HSTS header tells the browser to use HTTPS on its own next time.' },
      { title: 'Security headers', desc: 'Every response gets nosniff, frame and content security policy headers, so browsers apply stricter rules.' },
      { title: 'CORS', desc: 'A cross-site call from an origin that is not on the list gets no permission headers, so the browser blocks it.' },
      { title: 'Authentication', desc: 'The token or cookie is validated. The request now carries a trusted user identity, or none.' },
      { title: 'Rate limiter', desc: "The caller's bucket is checked. Too many requests in the window returns 429." },
      { title: 'Authorization', desc: 'The endpoint has no attribute? The fallback policy still requires a signed-in user. Closed by default.' },
      { title: 'Validation and action', desc: 'The body binds to a DTO and is validated. Only then does your code run, using parameters, safe APIs and atomic updates.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Fixed: a hardened Program.cs you can start from', code: `using System.Text.Json.Serialization;
using System.Threading.RateLimiting;
using Microsoft.AspNetCore.Authorization;

var builder = WebApplication.CreateBuilder(args);

// Server limits, and no "Server: Kestrel" header.
builder.WebHost.ConfigureKestrel(k =>
{
    k.AddServerHeader = false;
    k.Limits.MaxRequestBodySize = 2 * 1024 * 1024;              // our app-wide cap: 2 MB
    k.Limits.MaxRequestHeadersTotalSize = 16 * 1024;
    k.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(15);
});

// Secrets come from a vault or the environment, never from the repository.
// Add your vault configuration provider here (check the current docs).

builder.Services.AddHsts(o => { o.MaxAge = TimeSpan.FromDays(365); o.IncludeSubDomains = true; });

builder.Services.AddCors(o => o.AddPolicy("spa", p => p
    .WithOrigins("https://app.example.com")                     // exact origins only
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .WithHeaders("Content-Type", "Authorization")));

builder.Services.AddAuthentication().AddJwtBearer();            // settings from configuration
builder.Services.AddAuthorization(o =>
    o.FallbackPolicy = new AuthorizationPolicyBuilder()         // deny by default
        .RequireAuthenticatedUser().Build());

builder.Services.AddControllers().AddJsonOptions(o =>
{
    o.JsonSerializerOptions.MaxDepth = 32;
    o.JsonSerializerOptions.UnmappedMemberHandling =
        JsonUnmappedMemberHandling.Disallow;                    // unknown fields are an error
});
// With cookie authentication, also add anti-forgery validation for unsafe methods
// and set cookies to HttpOnly, Secure, SameSite and a "__Host-" name.

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(ctx =>
        RateLimitPartition.GetFixedWindowLimiter(
            ctx.User.Identity?.Name ?? ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
            _ => new FixedWindowRateLimiterOptions
            { PermitLimit = 100, Window = TimeSpan.FromMinutes(1), QueueLimit = 0 }));
});

builder.Services.AddProblemDetails();

var app = builder.Build();

if (!app.Environment.IsDevelopment())
{
    app.UseExceptionHandler();                                  // generic ProblemDetails, no stack trace
    app.UseHsts();
}
app.UseHttpsRedirection();

app.Use(async (ctx, next) =>                                    // security headers on every response
{
    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";
    h["X-Frame-Options"] = "DENY";
    h["Referrer-Policy"] = "strict-origin-when-cross-origin";
    h["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";  // JSON API
    await next();
});

app.UseCors("spa");
app.UseAuthentication();
app.UseRateLimiter();
app.UseAuthorization();
app.MapControllers();                                           // [ApiController] gives automatic 400s
app.Run();` },
    { lang: 'csharp', title: 'Safe building blocks: random, comparison, overflow, regex, spans', code: `using System.Security.Cryptography;
using System.Text;
using System.Text.RegularExpressions;

public static class SafeBlocks
{
    // 1) Secret random values. WRONG: new Random().Next() is predictable.
    public static string NewResetToken() =>
        Convert.ToHexString(RandomNumberGenerator.GetBytes(32));

    public static string NewSixDigitCode() =>
        RandomNumberGenerator.GetInt32(0, 1_000_000).ToString("D6");

    // 2) Comparing secrets. WRONG: expectedHex == providedHex leaks timing.
    public static bool WebhookSignatureIsValid(string body, string providedHex, byte[] secret)
    {
        byte[] expected = HMACSHA256.HashData(secret, Encoding.UTF8.GetBytes(body));
        byte[] provided;
        try { provided = Convert.FromHexString(providedHex); }
        catch (FormatException) { return false; }
        return CryptographicOperations.FixedTimeEquals(expected, provided);
    }

    // 3) Integer overflow. Without "checked", a huge quantity wraps to a negative total.
    public static int TotalCents(int quantity, int unitPriceCents)
    {
        if (quantity is < 1 or > 10_000) throw new ArgumentOutOfRangeException(nameof(quantity));
        if (unitPriceCents < 0) throw new ArgumentOutOfRangeException(nameof(unitPriceCents));
        return checked(quantity * unitPriceCents);   // throws OverflowException instead of wrapping
    }

    // 4) Regex on untrusted text: simple pattern, length cap, and a timeout.
    //    \\z is the true end of the text. A dollar sign would also accept a final line break.
    private static readonly Regex Sku = new(
        @"^[A-Z0-9-]{3,20}\\z", RegexOptions.CultureInvariant, TimeSpan.FromMilliseconds(100));

    public static bool IsValidSku(string? value)
    {
        if (value is null || value.Length > 20) return false;
        try { return Sku.IsMatch(value); }
        catch (RegexMatchTimeoutException) { return false; }    // treat a timeout as "invalid"
    }

    // 5) Spans are bounds-checked. Check sizes yourself before copying,
    //    and never stackalloc a size that comes from user input.
    public static void CopyHeader(ReadOnlySpan<byte> input, Span<byte> destination)
    {
        if (input.Length > destination.Length)
            throw new ArgumentException("Input is larger than the buffer.", nameof(input));
        input.CopyTo(destination);
    }

    // 6) File paths: the result must stay inside the base folder.
    public static string SafePath(string baseFolder, string userFileName)
    {
        string root = Path.GetFullPath(baseFolder + Path.DirectorySeparatorChar);
        string full = Path.GetFullPath(Path.Combine(root, Path.GetFileName(userFileName)));
        if (!full.StartsWith(root, StringComparison.Ordinal))
            throw new UnauthorizedAccessException("Path escapes the base folder.");
        return full;
    }
}` },
    { lang: 'csharp', title: 'Race condition (TOCTOU): vulnerable balance update and two fixes', code: `using System.ComponentModel.DataAnnotations;
using Microsoft.EntityFrameworkCore;

public class Account
{
    public int Id { get; set; }
    public decimal Balance { get; set; }
    [Timestamp] public byte[] RowVersion { get; set; } = [];   // concurrency token (fix B)
}

public class WalletService(AppDb db)
{
    // VULNERABLE: check, then act. Two requests at the same instant both read 100,
    // both pass the check for 80, and both save. 160 is paid from a balance of 100.
    public async Task<bool> WithdrawUnsafe(int accountId, decimal amount)
    {
        var account = await db.Accounts.AsNoTracking().SingleAsync(a => a.Id == accountId);
        if (account.Balance < amount) return false;             // time of check

        await db.Accounts.Where(a => a.Id == accountId)         // time of use
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.Balance, account.Balance - amount));
        return true;
    }

    // FIX A: one atomic statement. The database checks and changes in a single step:
    // UPDATE Accounts SET Balance = Balance - @amount WHERE Id = @id AND Balance >= @amount
    public async Task<bool> Withdraw(int accountId, decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));

        int rows = await db.Accounts
            .Where(a => a.Id == accountId && a.Balance >= amount)
            .ExecuteUpdateAsync(s => s.SetProperty(a => a.Balance, a => a.Balance - amount));

        return rows == 1;                                       // 0 rows: not enough money
    }

    // FIX B: optimistic concurrency. Saving fails if the row changed since we read it.
    public async Task<bool> WithdrawWithToken(int accountId, decimal amount)
    {
        if (amount <= 0) throw new ArgumentOutOfRangeException(nameof(amount));

        for (int attempt = 0; attempt < 3; attempt++)
        {
            var account = await db.Accounts.SingleAsync(a => a.Id == accountId);
            if (account.Balance < amount) return false;
            account.Balance -= amount;
            try
            {
                await db.SaveChangesAsync();                    // WHERE RowVersion = the one we read
                return true;
            }
            catch (DbUpdateConcurrencyException)
            {
                db.ChangeTracker.Clear();                       // someone else won; read again
            }
        }
        return false;
    }
}
// "Only once" rules (one coupon per user) are best enforced with a unique index:
// the database rejects the second insert no matter how the requests are timed.` }
  ],
  pitfalls: [
    `<strong>Relying on <code>[Authorize]</code> on each controller.</strong> One forgotten attribute opens an endpoint. A fallback policy makes forgetting safe.`,
    `<strong>Using <code>System.Random</code> for tokens or codes.</strong> It is built for simulations and games, and its output can be predicted. Use <code>RandomNumberGenerator</code>.`,
    `<strong>Check-then-act on shared data.</strong> Reading a balance, stock count or coupon state and then updating it in a second step can be raced. Do it in one atomic statement or with a concurrency token.`,
    `<strong>A <code>lock</code> statement as the fix for double spending.</strong> It only protects one process. Behind a load balancer the second request hits another server.`,
    `<strong>Regex without a timeout on user input.</strong> A crafted string can pin a CPU core for a long time. Cap length and set a timeout.`,
    `<strong>Scanning only direct packages.</strong> Most vulnerable code is in transitive dependencies. Always pass <code>--include-transitive</code>.`
  ],
  checklist: [
    `Force HTTPS and enable HSTS outside development`,
    `Add security headers: nosniff, frame protection and a content security policy`,
    `Set cookies to HttpOnly, Secure and SameSite, and validate anti-forgery tokens with cookie auth`,
    `List exact CORS origins; never allow any origin together with credentials`,
    `Set a deny-by-default fallback authorization policy`,
    `Enable rate limiting, request size limits and Kestrel timeouts; remove the Server header`,
    `Use RandomNumberGenerator for secrets and FixedTimeEquals to compare them`,
    `Make balance, stock and "only once" updates atomic or guarded by a concurrency token`,
    `Add timeouts to regexes, range checks to numbers and checked maths to money and sizes`,
    `Run dotnet list package --vulnerable --include-transitive and enable analyzers and nullable`
  ],
  quiz: [
    { q: `Why set a FallbackPolicy that requires an authenticated user?`, options: [`It makes requests faster, because the token is checked only once`, `So an endpoint with no authorization attribute is closed, not open`, `It replaces the need for HTTPS between the browser and the API`, `It switches CORS off, so other sites cannot call the endpoints`], answer: 1, why: `With a fallback policy, forgetting an attribute means the endpoint still needs a signed-in user. Safe by default beats remembering every time.` },
    { q: `Which API should create a password reset token?`, options: [`new Random(Environment.TickCount).Next()`, `DateTime.UtcNow.Ticks.ToString("x")`, `RandomNumberGenerator.GetBytes(32)`, `Guid.Empty.ToString("N")`], answer: 2, why: `Reset tokens must be impossible to guess. RandomNumberGenerator is cryptographically secure. System.Random and timestamps are predictable.` },
    { q: `Two requests withdraw 80 from a balance of 100 at the same instant and both succeed. What is this bug called?`, options: [`SQL injection (user text becomes part of the query)`, `A race condition (time of check to time of use)`, `Cross-site scripting (a script runs in the browser)`, `Integer overflow (a number wraps past its maximum)`], answer: 1, why: `Both requests checked the balance before either one saved. The check and the change were not one atomic step.` },
    { q: `Which fix stops that double withdrawal even with many servers?`, options: [`A C# lock statement around the whole withdraw method`, `A static variable that remembers the last request for each account`, `One UPDATE that subtracts only WHERE Balance >= amount`, `A shorter token lifetime, so the second request is rejected`], answer: 2, why: `The database performs the check and the change together, so only one request can succeed. An in-memory lock only covers one process.` },
    { q: `Why compare webhook signatures with CryptographicOperations.FixedTimeEquals instead of == ?`, options: [`It is shorter to write and easier for reviewers to read`, `A normal comparison's timing can leak how much was correct`, `The == operator does not compare the text of two C# strings`, `It encrypts both signatures before the two values are compared`], answer: 1, why: `Timing differences can be measured over many attempts. A fixed-time comparison takes the same time regardless of where the values differ.` },
    { q: `What does "dotnet list package --vulnerable --include-transitive" check?`, options: [`Code style problems in your own projects and in generated code`, `Known security flaws in your packages and their dependencies`, `Whether the unit tests of each referenced package still pass`, `Unused using statements and package references in every project`], answer: 1, why: `It compares your dependency tree with public advisories. Including transitive packages matters because most vulnerable code arrives indirectly.` }
  ],
  takeaways: [
    `Set safe defaults once in Program.cs so every new endpoint inherits them.`,
    `Deny by default: a forgotten attribute should mean "closed".`,
    `Use the security-grade API: RandomNumberGenerator, the Identity hasher, FixedTimeEquals, Data Protection.`,
    `Check and change shared data in one atomic step, or use a concurrency token.`,
    `Put limits on everything untrusted: request size, rate, regex time, number ranges.`,
    `Let the build work for you: nullable, analyzers, warnings as errors and package audits.`
  ],
  interview: [
    { q: `What do you configure to harden a new ASP.NET Core API?`, a: `<p>HTTPS redirection and HSTS. Security headers. Strict CORS with exact origins. Authentication plus a fallback authorization policy so endpoints are closed by default. Rate limiting and Kestrel limits for body size, header size and timeouts. Model validation on DTOs and strict JSON options. A global exception handler that returns ProblemDetails with no stack trace. Secrets from a vault. I also remove the Server header, and turn on nullable, analyzers and package vulnerability checks in the build.</p>` },
    { q: `What is a TOCTOU bug and how do you fix one in a web API?`, a: `<p>Time of check to time of use: the code checks a condition and acts on it in a separate step, and another request changes the data in between. A typical case is double spending. I fix it by making the check and the change one atomic database statement with a condition in the WHERE clause and checking rows affected, or by using a row version concurrency token with a retry, or a unique constraint for "only once" rules. An in-memory lock is not enough once there is more than one instance.</p>` },
    { q: `When must you not use System.Random?`, a: `<p>For anything an attacker should not be able to guess: tokens, reset codes, one-time passwords, keys, salts, file names that act as secrets. System.Random is designed for speed and repeatability, and its sequence can be predicted. I use <code>RandomNumberGenerator</code> for those cases.</p>` },
    { q: `How can a regular expression become a security problem?`, a: `<p>Some patterns with nested or overlapping repetition take a very long time on crafted input because the engine tries a huge number of paths. One request can then use a CPU core for seconds or more. I cap input length before matching, pass a match timeout, keep patterns simple, and use the non-backtracking option for untrusted input where it fits.</p>` }
  ]
};

