// NexLearn content — Security module: Secure Coding Practices (part 1)
// Topics: sec-input-validation, sec-injection, sec-xss-csrf, sec-secrets, sec-tokens, sec-files-ssrf
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* sec-input-validation — Input Validation & Output Encoding           */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-input-validation'] = {
  hook: `Almost every famous hack starts the same way: the program believed something a stranger typed.`,
  intro: `<p>Your program talks to the outside world all day. People type into forms. Browsers send headers and cookies. Other systems send files and JSON. All of that is <span class="term">input</span>: data that comes from somewhere you do not control.</p>
<p><span class="term">Input validation</span> means checking that data before you use it. Is it the right type? The right length? Does it look like what you expected? If not, you reject it. <span class="term">Output encoding</span> is the other half. When you send data out to a web page, a database or a command line, you convert it so it is treated as plain data and never as code.</p>
<p>These two habits are the base of secure coding. Injection, cross-site scripting and path traversal are all the same mistake in different clothes: untrusted data was used without checking it on the way in, or without encoding it on the way out.</p>
<p>The rule to remember is short. <strong>Validate on the way in. Encode on the way out. Do both on the server.</strong></p>`,
  realLife: {
    title: 'The airport security line',
    body: `<p>Think about an airport. Every passenger goes through the same check, even the pilot, even the person who flew yesterday. The guard does not ask "do you look honest?". The guard checks against a clear list: valid ticket, valid ID, bag within the size limit, nothing forbidden inside. If something does not match, you do not board. Nobody is offended, because the check is the same for everyone.</p>
<p>Your server is the airport. The Angular form in the browser is only a helpful sign at the entrance that says "liquids under 100 ml please". It makes life easier for honest people. It stops nobody who walks around it. An attacker never uses your form. They send requests straight to your API with their own tools.</p>
<p><strong>How this showed up in the real world:</strong> in 2017 the credit agency Equifax was breached and data about roughly 147 million people was exposed. The way in was a flaw in a web framework called Apache Struts, where a specially written HTTP header was treated as an instruction instead of plain text. A fix had been available for months but was not installed. Two lessons: headers are input too, and input that is treated as code is the root of the worst bugs.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What counts as input?</h4>
<p>More than you think. Anything that crosses into your code from outside is untrusted:</p>
<ul>
<li>Form fields, query strings and route values (<code>/orders/42</code>).</li>
<li>The JSON body of an API call.</li>
<li>HTTP headers and cookies. The user controls all of them.</li>
<li>Uploaded files: the content, and also the file name.</li>
<li>Data from other systems: a partner API, a message queue, a CSV import.</li>
<li>Data you stored earlier that a user typed. Coming back from your own database does not make it clean.</li>
</ul>
<div class="callout warn">Client-side validation is for user experience. Server-side validation is for security. You always need the second one, even if you have the first.</div>
<h4>Allow-list beats deny-list</h4>
<p>There are two ways to check input. A <span class="term">deny-list</span> says "block these bad things". An <span class="term">allow-list</span> says "accept only these good things". Deny-lists fail, because attackers are creative and you cannot think of every bad input. Allow-lists work, because you only have to describe what is valid.</p>
<table><thead><tr><th>Field</th><th>Weak check (deny-list)</th><th>Strong check (allow-list)</th></tr></thead><tbody>
<tr><td>Username</td><td>Reject if it contains &lt; or '</td><td>Only letters, digits, underscore. 3 to 20 characters.</td></tr>
<tr><td>Country</td><td>Reject "weird" text</td><td>Must be one of the codes in our country table.</td></tr>
<tr><td>Quantity</td><td>Reject if it has letters</td><td>Whole number between 1 and 100.</td></tr>
<tr><td>Sort column</td><td>Strip semicolons</td><td>Must be one of: name, price, date.</td></tr>
</tbody></table>
<h4>The four basic checks</h4>
<ol>
<li><strong>Type.</strong> Is it really a number, a date, a GUID? Parse it into that type and stop using the string.</li>
<li><strong>Length.</strong> Every text field needs a maximum. A name does not need 5 MB.</li>
<li><strong>Range.</strong> Numbers and dates have sensible limits. Quantity is not minus 5.</li>
<li><strong>Format.</strong> Does it match the expected pattern, or is it in the list of allowed values?</li>
</ol>
<div class="callout tip">When input is wrong, reject it with a clear message. Do not try to "clean" it into something valid. Silent fixing hides attacks and creates surprises.</div>
<h4>And on the way out</h4>
<p>Validation alone is not enough. A name like <em>O'Brien</em> is perfectly valid, and the quote in it can still break a badly built SQL string. So when data leaves your code, you encode it for the place it is going. The next level shows how.</p>` },
    { name: 'Intermediate', body: `<h4>Validation in ASP.NET Core</h4>
<p>You have two common tools. <span class="term">DataAnnotations</span> are attributes on your model, such as <code>[Required]</code>, <code>[StringLength]</code>, <code>[Range]</code> and <code>[EmailAddress]</code>. With <code>[ApiController]</code>, a model that fails these checks gets an automatic 400 response before your action runs. <span class="term">FluentValidation</span> is a popular library where rules live in a separate class. It is better for rules that depend on several fields or on the database.</p>
<p>Always bind to a small <span class="term">DTO</span> (data transfer object) that has only the fields the caller may set. Never bind a request straight onto your database entity. That stops callers from setting fields like <code>IsAdmin</code> that you never meant to expose.</p>
<h4>Canonicalise first, then validate</h4>
<p><span class="term">Canonicalisation</span> means turning data into one standard form. The same text can be written many ways: with extra spaces, in different Unicode forms, or URL-encoded twice. If you validate one form and later use another, the check is useless. So: decode once, trim, normalise Unicode, and only then validate. For file paths, resolve the full path first and check the result.</p>
<h4>Output encoding depends on where the data lands</h4>
<table><thead><tr><th>Destination</th><th>Danger</th><th>What to do</th></tr></thead><tbody>
<tr><td>HTML body</td><td>&lt;script&gt; runs</td><td>HTML-encode. Razor and Angular do this by default.</td></tr>
<tr><td>HTML attribute</td><td>Quote closes the attribute</td><td>Attribute-encode and always quote attributes.</td></tr>
<tr><td>Inside JavaScript</td><td>String ends, code runs</td><td>JavaScript-encode, or better, pass data as JSON.</td></tr>
<tr><td>URL parameter</td><td>&amp; or # changes the URL</td><td>URL-encode each value.</td></tr>
<tr><td>SQL</td><td>Quote changes the query</td><td>Parameters. Never build SQL by joining strings.</td></tr>
<tr><td>Shell command</td><td>; or | runs a second command</td><td>Pass arguments as a list, never one command string.</td></tr>
</tbody></table>
<p>One encoder does not fit all places. HTML-encoding a value and then putting it inside a script block or a URL is still unsafe. Pick the encoder for the context.</p>
<h4>Path traversal</h4>
<p>If a user gives you a file name and you join it to a folder, a name such as <code>../../appsettings.json</code> walks out of the folder. This is <span class="term">path traversal</span>. The fix: build the full path with <code>Path.GetFullPath</code>, then check that the result still starts with your base folder. Better still, never use user-supplied names on disk. Store files under an ID you generate.</p>
<div class="callout warn">Do not try to fix traversal by removing "../" from the text. Attackers write it in encoded or doubled forms. Resolve the path and check where it really points.</div>` },
    { name: 'Expert', body: `<h4>Syntactic and semantic validation</h4>
<p>Syntactic validation checks shape: is this a valid date? Semantic validation checks meaning: is the end date after the start date, and does this order belong to this user? Most serious bugs live in the second kind. A request can be perfectly formed and still ask for something the caller must not have. Put syntactic rules at the edge (model binding, validators) and semantic rules in the domain layer, where the business facts are known.</p>
<h4>Regular expression denial of service (ReDoS)</h4>
<p>Some regex patterns take a very long time on certain inputs, because the engine tries a huge number of ways to match. Patterns with nested repeats, such as a group that repeats inside another repeat, are the usual cause. One slow request can pin a CPU core. In .NET you have three defences:</p>
<ul>
<li>Always pass a <strong>match timeout</strong> when the input is untrusted.</li>
<li>Use <code>RegexOptions.NonBacktracking</code> (available in modern .NET), which guarantees time that grows in step with input length.</li>
<li>Check the length before the regex runs. A 20-character limit makes most ReDoS attacks pointless.</li>
</ul>
<h4>Parsers disagree</h4>
<p>A subtle class of bug happens when two components read the same input differently. A proxy sees one URL path and your app sees another. One JSON parser takes the first duplicate key and another takes the last. Your validator approves what it parsed, and a different layer acts on something else. Reduce this by parsing once into a typed object and passing that object on, never the raw text.</p>
<h4>Mass assignment and over-posting</h4>
<p>Model binders are generous. If your action takes an entity class, any property with a matching name in the JSON gets set. Dedicated request DTOs, plus explicit mapping to the entity, close this door. In review, treat "action parameter is an EF entity" as a finding.</p>
<h4>Unicode traps</h4>
<p>Different characters can look the same (a Latin "a" and a Cyrillic "а"), and some characters change when you upper-case or lower-case them. For usernames and other identifiers, normalise (for example to form KC), then apply your allow-list, then compare with an ordinal comparison. Never compare security-relevant strings using culture rules.</p>
<h4>Defence in depth and what interviewers ask</h4>
<p>Validation is one layer. Parameterised queries, encoding, least privilege and a Content Security Policy stand behind it, so a missed check does not become a breach. Expect interview questions such as: "Why is client validation not enough?", "Why prefer an allow-list?", "Where would you validate in a layered app?" and "How would you stop path traversal in a download endpoint?". Good answers name the layer, the exact check, and what happens on failure: reject, log a security event without the raw secret data, and return a generic 400.</p>
<div class="callout idea">Ask of every value: where did it come from, what do I believe about it, and what proves that belief? If the answer to the last question is "the frontend checked it", nothing proves it.</div>` }
  ],
  flow: {
    title: 'The life of one untrusted value',
    steps: [
      { title: 'Arrives', desc: `A request comes in with a body, a query string, headers and cookies. Treat every one of them as written by a stranger.` },
      { title: 'Canonicalise', desc: `Decode once, trim, normalise Unicode, resolve paths. Now there is only one form of the value to reason about.` },
      { title: 'Check shape', desc: `Type, length, range and format against an allow-list. Parse into a typed DTO. Fail here and the request gets a 400.` },
      { title: 'Check meaning', desc: `Business rules: does this record belong to this user? Is the date range sensible? Is the state change allowed?` },
      { title: 'Use safely', desc: `Send it to SQL as a parameter, to the shell as an argument list, to the file system only under a folder you verified.` },
      { title: 'Encode on output', desc: `When the value goes into HTML, a URL or JavaScript, encode it for that exact place so it stays data.` },
      { title: 'Log the rejects', desc: `Rejected input is a signal. Log the event and the field name, without dumping secrets, so attacks become visible.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Server-side validation: DataAnnotations and FluentValidation', code: `using System.ComponentModel.DataAnnotations;
using FluentValidation;

// A small DTO: only the fields a caller is allowed to send.
public class SignUpRequest
{
    [Required, StringLength(20, MinimumLength = 3)]
    [RegularExpression("^[a-zA-Z0-9_]+$", ErrorMessage = "Letters, digits and underscore only.")]
    public string Username { get; set; } = "";

    [Required, EmailAddress, StringLength(254)]
    public string Email { get; set; } = "";

    [Range(13, 120)]
    public int Age { get; set; }

    [Required, StringLength(2, MinimumLength = 2)]
    public string CountryCode { get; set; } = "";
}

// FluentValidation: good for rules that span fields or need a lookup.
public class SignUpValidator : AbstractValidator<SignUpRequest>
{
    private static readonly HashSet<string> Countries = new() { "IN", "US", "GB", "DE" };

    public SignUpValidator()
    {
        RuleFor(x => x.Username).NotEmpty().Length(3, 20).Matches("^[a-zA-Z0-9_]+$");
        RuleFor(x => x.Email).NotEmpty().EmailAddress().MaximumLength(254);
        RuleFor(x => x.Age).InclusiveBetween(13, 120);
        RuleFor(x => x.CountryCode)
            .Must(c => Countries.Contains(c))          // allow-list, not a deny-list
            .WithMessage("Unknown country code.");
    }
}

// Minimal API endpoint: validate first, then work with typed data only.
// (Register with: builder.Services.AddScoped<IValidator<SignUpRequest>, SignUpValidator>();)
app.MapPost("/signup", async (SignUpRequest req, IValidator<SignUpRequest> validator) =>
{
    var result = await validator.ValidateAsync(req);
    if (!result.IsValid)
        return Results.ValidationProblem(result.ToDictionary());   // 400 with field errors

    // From here on, req is known to match our rules.
    return Results.Ok();
});` },
    { lang: 'csharp', title: 'Vulnerable vs fixed: path traversal and a ReDoS-safe regex', code: `using System.Text.RegularExpressions;

// VULNERABLE: the user picks the file name, and "../" walks out of the folder.
app.MapGet("/bad/download", (string name) =>
    Results.File(Path.Combine("/var/app/reports", name)));

// FIXED: resolve the real path, then prove it is still inside the base folder.
static string ResolveInside(string baseDir, string userFileName)
{
    string root = Path.GetFullPath(baseDir + Path.DirectorySeparatorChar);
    string full = Path.GetFullPath(Path.Combine(root, userFileName));

    // On Linux use Ordinal. On Windows file names ignore case, so use OrdinalIgnoreCase.
    if (!full.StartsWith(root, StringComparison.Ordinal))
        throw new UnauthorizedAccessException("Path leaves the allowed folder.");
    return full;
}

// Regex on untrusted input: no backtracking, plus a timeout as a seat belt.
var safeName = new Regex(
    "^[a-zA-Z0-9_-]{1,60}[.](pdf|csv)$",
    RegexOptions.NonBacktracking,
    TimeSpan.FromMilliseconds(200));

app.MapGet("/good/download", (string name) =>
{
    // Allow-list the shape of the name first: short, simple, known extension.
    if (name.Length > 80 || !safeName.IsMatch(name))
        return Results.BadRequest("Invalid file name.");

    string path = ResolveInside("/var/app/reports", name);
    return File.Exists(path) ? Results.File(path) : Results.NotFound();
});

// Even better for downloads: do not accept names at all.
// Accept a report ID, look up the stored path in your database,
// and check that the report belongs to the current user.` },
    { lang: 'csharp', title: 'Output encoding: pick the encoder for the destination', code: `using System.Text.Encodings.Web;
using System.Text.Json;

string userText = "<b>Tom & Jerry's</b> \\"best\\" show";

// 1. Going into an HTML page? HTML-encode.
//    (Razor does this for you when you write @Model.Name.)
string forHtml = HtmlEncoder.Default.Encode(userText);

// 2. Going into a URL as one parameter value? URL-encode that value.
string forUrl = "https://example.com/search?q=" + UrlEncoder.Default.Encode(userText);

// 3. Going into a script block? Do not build JavaScript by hand.
//    Serialize to JSON and let the page read it as data.
string forScript = JsonSerializer.Serialize(new { title = userText });

// 4. Going into SQL? Not an encoding problem at all: use a parameter.
//    cmd.Parameters.AddWithValue("@title", userText);

// 5. Going to another program? Pass it as a separate argument, never inside a command string.
//    psi.ArgumentList.Add(userText);

Console.WriteLine(forHtml);
Console.WriteLine(forUrl);
Console.WriteLine(forScript);

// The same value, three different safe forms.
// Using the HTML form inside a URL or a script would NOT be safe.` }
  ],
  pitfalls: [
    `Trusting the frontend. Angular validators and disabled buttons do not exist for someone calling your API directly. Repeat every rule on the server.`,
    `Using a deny-list ("remove &lt;script&gt;", "block quotes"). There is always a form you did not think of. Describe what is allowed instead.`,
    `Validating one form and using another. Checking the raw string, then decoding it later, lets encoded attacks through. Canonicalise first.`,
    `Forgetting length limits. Every string needs a maximum, and every list in a request needs a maximum count.`,
    `Thinking validation replaces encoding. Valid data such as O'Brien still needs parameters in SQL and encoding in HTML.`,
    `Binding requests straight onto EF entities. Callers can then set fields you never showed in the form. Use request DTOs.`
  ],
  checklist: [
    `Validate every request on the server, even when the client already validates.`,
    `Bind to small request DTOs, never directly to database entities.`,
    `Set a maximum length on every string and a maximum size on every list and file.`,
    `Use allow-lists for formats, enums, sort columns and file extensions.`,
    `Canonicalise (decode, trim, normalise, resolve paths) before you validate.`,
    `Resolve file paths with Path.GetFullPath and confirm they stay inside the base folder.`,
    `Give every regex on untrusted input a timeout or use NonBacktracking.`,
    `Encode output for its exact destination: HTML, attribute, URL or JavaScript.`,
    `Return a generic 400 on bad input and log the rejection as a security event.`
  ],
  quiz: [
    { q: `Your Angular form already checks that quantity is between 1 and 100. Why must the API check again?`, options: [`The API check runs faster than the Angular check`, `Attackers can call the API directly and skip the form`, `Angular validators are often buggy and miss values`, `It is only needed when mobile apps call the API`], answer: 1, why: `The browser is under the user's control. Anyone can send a request to your API with any values, so only server-side checks count for security.` },
    { q: `Which is the best rule for a username field?`, options: [`Reject it if it contains a script tag or a SQL keyword`, `Remove all quote characters and angle brackets, then save it`, `Allow only letters, digits and underscore, 3 to 20 characters`, `Accept anything and HTML-encode it before saving it to the database`], answer: 2, why: `An allow-list describes exactly what is valid. Deny-lists and silent cleaning always miss some form of bad input.` },
    { q: `A download endpoint joins a user-supplied file name to a reports folder. What is the correct defence?`, options: [`Remove every "../" from the name before joining it to the reports folder`, `Resolve the full path and check it still starts with the reports folder`, `Only allow GET requests, because GET cannot reach files outside the folder`, `HTML-encode the file name so the dots and slashes lose their meaning`], answer: 1, why: `Text filtering can be bypassed with other spellings. Resolving the real path and checking where it points cannot.` },
    { q: `You HTML-encoded a value. Is it now safe to place inside a URL or a script block too?`, options: [`Yes, an encoded value is safe everywhere`, `Only inside script blocks, not in URLs`, `No, each destination needs its own encoding`, `Only if the value is shorter than 100 characters`], answer: 2, why: `Encoding is context-specific. HTML encoding does not neutralise characters that are special in URLs or JavaScript.` },
    { q: `What makes a regular expression a denial-of-service risk?`, options: [`It is longer than 50 characters, so compiling it is slow`, `It can backtrack for an extreme time on crafted input`, `It uses character classes, which match one character at a time`, `It is compiled, so the pattern stays in memory`], answer: 1, why: `Certain patterns make the engine try a huge number of paths. A timeout, NonBacktracking mode and length limits remove the risk.` },
    { q: `A value was validated when the user saved it last year. You now read it from your database to build a page. How should you treat it?`, options: [`As trusted, because it is from our own database`, `As untrusted, and encode it for the output context`, `As trusted if the table has constraints`, `Re-validate it and then skip encoding`], answer: 1, why: `Stored data is still user-controlled data. Rules may have changed, and valid data can still contain characters that are dangerous in HTML or SQL.` }
  ],
  takeaways: [
    `All input is untrusted: body, query, headers, cookies, files, partner data and your own stored data.`,
    `Validate on the way in with allow-lists: type, length, range, format.`,
    `Encode on the way out for the exact destination. One encoder does not fit all.`,
    `Client-side validation is for comfort. Server-side validation is for safety.`,
    `Canonicalise before validating, and resolve paths before trusting them.`,
    `Reject bad input clearly. Do not quietly repair it.`
  ],
  interview: [
    { q: `What is the difference between input validation and output encoding, and do you need both?`, a: `<p>Validation checks that incoming data matches what the application expects (type, length, range, format, business meaning) and rejects it otherwise. Output encoding converts data so the receiving interpreter (browser, URL parser, shell) treats it as data and not as code. You need both. Validation cannot remove every dangerous character, because legitimate data contains them (O'Brien, a &lt; b). Encoding alone does not enforce business rules. Together they give two independent layers.</p>` },
    { q: `Why is an allow-list preferred over a deny-list?`, a: `<p>A deny-list tries to list everything bad, which is an open-ended set: new encodings, new tricks, new parser quirks. An allow-list describes the small, known set of valid values, so anything unexpected is rejected by default. Deny-lists are acceptable only as an extra layer, for example a web application firewall, never as the main control.</p>` },
    { q: `How do you prevent path traversal in a file download feature?`, a: `<p>Best: do not accept a file name. Accept an opaque ID, look up the stored location server-side, and check the caller is allowed to read that file. If a name must be accepted: allow-list its shape, combine it with the base folder, call <code>Path.GetFullPath</code>, and verify the result starts with the canonical base folder path. Also run the app with a low-privilege account so a mistake cannot reach system files.</p>` },
    { q: `Where should validation live in a layered application?`, a: `<p>Shape checks belong at the edge: model binding, DataAnnotations or FluentValidation on request DTOs, so bad requests fail fast with a 400. Business rules belong in the domain or application layer, where ownership and state are known, so they hold no matter which entry point is used (API, queue consumer, background job). The database adds a last layer with types, constraints and foreign keys.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-injection — Injection Attacks: SQL, Command, NoSQL & LDAP       */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-injection'] = {
  hook: `If you build a command by gluing in what the user typed, the user is now helping to write your command.`,
  intro: `<p>Your code often talks to other programs in their own language. It sends <span class="term">SQL</span> to a database. It sends a command line to the operating system. It sends a filter to a directory server. Each of these receivers is an <span class="term">interpreter</span>: a program that reads text and acts on it.</p>
<p><span class="term">Injection</span> happens when text from a user gets mixed into that command text, and the interpreter cannot tell which part was written by you and which part by the user. The user's text stops being data and becomes part of the instruction.</p>
<p>The most famous kind is <span class="term">SQL injection</span>. It is decades old, it is easy to prevent, and it still shows up in breach reports every year. The same idea applies to shell commands, NoSQL queries, LDAP filters, templates and even log files.</p>
<p>The fix is always the same shape: <strong>keep the command and the data separate</strong>. Send the command with empty slots, and send the data separately to fill the slots. For SQL this is called a <span class="term">parameterized query</span>.</p>`,
  realLife: {
    title: 'The bank cheque with extra words',
    body: `<p>Imagine a bank clerk who follows written instructions exactly. A customer fills in a form: "Pay 100 rupees to <em>Ravi</em>." The form has a blank for the name. Now a dishonest customer writes in the blank: "Ravi, and also pay 100,000 rupees to me". If the clerk reads the whole line as one instruction, the bank loses money. The clerk did nothing wrong by their own rules. The form was the problem, because it let the customer's words become part of the instruction.</p>
<p>A good form has a box for the name, and the clerk treats whatever is in the box as a name and nothing else. Even if someone writes a full sentence in it, the clerk just says "no account holder has that name". That box is a parameter.</p>
<p><strong>How this showed up in the real world:</strong> in 2015 the UK telecom company TalkTalk was breached through SQL injection in old web pages it had inherited. Personal data of roughly 157,000 customers was accessed, and the UK regulator issued what was then a record fine. The technique used was already well known and fully preventable. In 2021 the "Log4Shell" flaw in the Java logging library Log4j showed the same idea in a new place: text that was only meant to be written to a log was interpreted as an instruction.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>How SQL injection works</h4>
<p>Say a login page builds its query by joining strings:</p>
<pre><code>"SELECT * FROM Users WHERE Email = '" + email + "'"</code></pre>
<p>If the user types <code>ana@example.com</code>, the database receives a normal query. Now suppose someone types this in the email box instead:</p>
<pre><code>' OR '1'='1</code></pre>
<p>The final text becomes <code>WHERE Email = '' OR '1'='1'</code>. The quote the user typed closed your string early. The rest of what they typed became SQL. Since 1 always equals 1, the condition is true for every row. The user changed the meaning of your query without knowing any password.</p>
<p>From that same hole an attacker can read other tables, change data, or delete it. How far they get depends on what the database account is allowed to do.</p>
<h4>The fix: parameters</h4>
<p>With a <span class="term">parameterized query</span> you write the SQL with a placeholder, like <code>@email</code>, and pass the value separately:</p>
<pre><code>SELECT * FROM Users WHERE Email = @email</code></pre>
<p>The database receives two things: the query shape, and the value. It plans the query first, then drops the value into the slot as pure data. A quote inside the value is just a quote character in an email that matches nobody.</p>
<div class="callout tip">You do not need to "clean" or "escape" input for SQL. You need parameters. Every database library in .NET supports them.</div>
<h4>Good news for .NET developers</h4>
<ul>
<li><strong>EF Core LINQ</strong> queries are parameterized automatically. <code>db.Users.Where(u =&gt; u.Email == email)</code> is safe.</li>
<li><strong>Dapper</strong> is safe when you pass values as an object: <code>new { email }</code>.</li>
<li><strong>ADO.NET</strong> is safe when you use <code>cmd.Parameters</code>.</li>
</ul>
<p>The danger appears only when someone builds SQL text with <code>+</code>, <code>string.Format</code> or string interpolation.</p>
<div class="callout warn">Rule for code review: if a SQL string contains a variable joined in with + or inside braces, stop and look closely.</div>` },
    { name: 'Intermediate', body: `<h4>The EF Core raw SQL trap</h4>
<p>EF Core has methods for running raw SQL, and their names look alike:</p>
<table><thead><tr><th>Method</th><th>Safe?</th><th>Why</th></tr></thead><tbody>
<tr><td><code>FromSqlInterpolated($"... {email}")</code> / <code>FromSql($"...")</code></td><td>Yes</td><td>EF turns each <code>{value}</code> into a parameter.</td></tr>
<tr><td><code>FromSqlRaw("... {0}", email)</code></td><td>Yes</td><td>Placeholders become parameters.</td></tr>
<tr><td><code>FromSqlRaw("... '" + email + "'")</code></td><td>No</td><td>You built the string yourself. EF only sees finished text.</td></tr>
<tr><td><code>FromSqlRaw($"... {email}")</code></td><td>No</td><td>C# fills in the value before EF sees it.</td></tr>
</tbody></table>
<p>The last row is the trap. It looks almost the same as the first row, and it is fully vulnerable. Prefer <code>FromSql</code> or <code>FromSqlInterpolated</code> for raw queries.</p>
<h4>What parameters cannot do</h4>
<p>A parameter can stand in for a <em>value</em>. It cannot stand in for a table name, a column name or <code>ASC</code>/<code>DESC</code>. So "sort by the column the user clicked" cannot be a parameter. The safe way is an <span class="term">allow-list</span>: map the user's choice to one of a few fixed strings that you wrote yourself. If the choice is not in the map, use the default.</p>
<h4>Stored procedures are not magic</h4>
<p>A stored procedure with normal parameters is safe. But a procedure that builds a SQL string inside and runs it with <code>EXEC(@sql)</code> is injectable again, just one layer deeper. If you must build dynamic SQL in T-SQL, use <code>sp_executesql</code> with parameters, and wrap identifiers with <code>QUOTENAME</code>.</p>
<h4>Least privilege limits the damage</h4>
<p>Assume a bug will slip through one day. The app's database account should only be able to do what the app needs:</p>
<pre><code>CREATE USER app_orders WITHOUT LOGIN;
GRANT SELECT, INSERT, UPDATE ON dbo.Orders TO app_orders;
-- no DROP, no ALTER, no access to other schemas, never db_owner or sa</code></pre>
<h4>Command injection</h4>
<p>The same bug exists when you start another program. If you pass one long string to a shell (<code>cmd /c</code> or <code>bash -c</code>), characters like <code>;</code>, <code>|</code> and <code>&amp;</code> can start a second command. In .NET, set <code>UseShellExecute = false</code>, call the program directly, and add each argument with <code>ArgumentList.Add</code>. Each item is then passed as one argument, whatever it contains. Even better, use a library instead of a command-line tool when one exists.</p>` },
    { name: 'Expert', body: `<h4>Second-order injection</h4>
<p>Input is stored safely today with a parameter, and used unsafely tomorrow. Example: a user registers a display name containing a quote. The insert uses a parameter, so nothing breaks. Later, a nightly report builds SQL by joining that stored name into a string. The attack fires then, far from the entry point, often in a job running with higher rights. Lesson: data from your own database is still untrusted when you build commands. Parameterize every query, including internal ones.</p>
<h4>Blind injection and why error messages matter</h4>
<p>Attackers do not need to see query results. If the page behaves differently for true and false conditions, or takes longer for one, they can ask yes/no questions and slowly read data. Detailed database errors shown to users speed this up. Return generic errors, log details server-side, and alert on bursts of SQL errors from one client.</p>
<h4>The same bug in other interpreters</h4>
<ul>
<li><strong>NoSQL.</strong> If a JSON body is bound loosely and passed into a MongoDB filter, a caller can send an object such as an operator expression where you expected a string, and change the query logic. Bind to typed DTOs and build filters with the typed driver API.</li>
<li><strong>LDAP.</strong> Filters have special characters such as <code>*</code>, <code>(</code> and <code>)</code>. Escape values with the encoder your library provides and validate usernames with an allow-list.</li>
<li><strong>Template injection.</strong> Never compile or render user text as a template (Razor, Liquid, Scriban). User text is a value passed to a template you wrote.</li>
<li><strong>Log injection.</strong> Line breaks in input can forge fake log lines. Use structured logging, where values are fields and not part of the message text.</li>
<li><strong>Expression and dynamic LINQ.</strong> Libraries that parse strings into queries bring the problem back. Feed them only allow-listed fragments.</li>
<li><strong>Prompt injection.</strong> The newest member of the family. Text given to a language model can act as an instruction. It has its own lesson in this module.</li>
</ul>
<h4>Defence in depth</h4>
<ol>
<li>Parameterized queries everywhere (the real fix).</li>
<li>Input validation with allow-lists (reduces what reaches the query).</li>
<li>Least-privilege database accounts, separate accounts for read and write paths where it makes sense.</li>
<li>Static analysis (SAST) rules that flag string-built SQL, wired into the pipeline.</li>
<li>A web application firewall as a noisy extra layer, never as the only one.</li>
</ol>
<div class="callout idea">In interviews, do not stop at "use parameters". Mention identifiers that cannot be parameterized, dynamic SQL inside procedures, second-order injection and least privilege. That shows you have met the hard cases.</div>
<h4>Performance bonus</h4>
<p>Parameterized queries let the database reuse one execution plan for all values. String-built SQL creates a new plan per distinct text and bloats the plan cache. So the secure way is also the fast way.</p>` }
  ],
  flow: {
    title: 'One login request, with and without parameters',
    steps: [
      { title: 'User types input', desc: `Someone enters text into the email box. It might be an email. It might contain a quote and extra SQL words.` },
      { title: 'App builds the call', desc: `Vulnerable code glues the text into the SQL string. Safe code writes SQL with a slot (@email) and passes the text separately.` },
      { title: 'Database parses', desc: `With glued text, the database parses the user's words as part of the command. With a parameter, the command shape is fixed before any value is looked at.` },
      { title: 'Meaning changes or not', desc: `Glued: the WHERE clause is now always true, or a second statement appears. Parameterized: the value is compared as plain text and matches no row.` },
      { title: 'Privileges decide the damage', desc: `If the app account is an admin, an injected command can read or drop anything. A least-privilege account can only touch a few tables.` },
      { title: 'Response goes back', desc: `Vulnerable app: logs the attacker in or leaks data, maybe with a detailed error. Safe app: "Invalid email or password".` },
      { title: 'Detection', desc: `Monitoring notices unusual SQL errors or odd input patterns from one client and raises an alert.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: string-built SQL (do not copy)', code: `using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

// VULNERABLE 1: ADO.NET with string concatenation.
// A quote in "email" ends the string early and the rest becomes SQL.
static async Task<bool> LoginBadAsync(SqlConnection conn, string email, string passwordHash)
{
    string sql = "SELECT COUNT(*) FROM Users WHERE Email = '" + email +
                 "' AND PasswordHash = '" + passwordHash + "'";
    using var cmd = new SqlCommand(sql, conn);
    return (int)(await cmd.ExecuteScalarAsync())! > 0;
}

// VULNERABLE 2: looks modern, same bug.
// C# builds the final string BEFORE EF Core sees it, so nothing is parameterized.
static Task<List<User>> SearchBadAsync(AppDb db, string name) =>
    db.Users.FromSqlRaw($"SELECT * FROM Users WHERE Name LIKE '%{name}%'").ToListAsync();

// VULNERABLE 3: the user chooses the ORDER BY text directly.
static Task<List<User>> SortedBadAsync(AppDb db, string sortBy) =>
    db.Users.FromSqlRaw("SELECT * FROM Users ORDER BY " + sortBy).ToListAsync();

// What they have in common: a variable is joined into SQL text.
// That is the pattern to search for in code review.` },
    { lang: 'csharp', title: 'Fixed: parameters everywhere (ADO.NET, Dapper, EF Core) and an allow-list for ORDER BY', code: `using Dapper;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;

// FIXED 1: ADO.NET with parameters. The value never becomes part of the SQL text.
static async Task<User?> FindAdoAsync(SqlConnection conn, string email)
{
    using var cmd = new SqlCommand("SELECT Id, Email, Name FROM Users WHERE Email = @email", conn);
    cmd.Parameters.Add("@email", System.Data.SqlDbType.NVarChar, 254).Value = email;
    using var r = await cmd.ExecuteReaderAsync();
    return await r.ReadAsync() ? new User(r.GetInt32(0), r.GetString(1), r.GetString(2)) : null;
}

// FIXED 2: Dapper. Values go in the anonymous object.
static Task<User?> FindDapperAsync(SqlConnection conn, string email) =>
    conn.QuerySingleOrDefaultAsync<User>(
        "SELECT Id, Email, Name FROM Users WHERE Email = @email", new { email });

// FIXED 3: EF Core LINQ is parameterized for you.
static Task<List<User>> SearchLinqAsync(AppDb db, string name) =>
    db.Users.Where(u => u.Name.Contains(name)).ToListAsync();

// FIXED 4: raw SQL in EF Core, the safe way. Each {value} becomes a parameter.
static Task<List<User>> SearchRawAsync(AppDb db, string name)
{
    string pattern = "%" + name + "%";
    return db.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Name LIKE {pattern}").ToListAsync();
}

// FIXED 5: column names cannot be parameters, so map the user's choice to text YOU wrote.
static readonly Dictionary<string, string> SortColumns = new(StringComparer.OrdinalIgnoreCase)
{
    ["name"] = "Name", ["email"] = "Email", ["joined"] = "CreatedAt"
};

static Task<List<User>> SortedAsync(AppDb db, string? sortBy, bool desc)
{
    string column = sortBy != null && SortColumns.TryGetValue(sortBy, out var c) ? c : "Name";
    string direction = desc ? "DESC" : "ASC";
    // Safe: both pieces come from our own fixed strings, never from the request.
    return db.Users.FromSqlRaw("SELECT * FROM Users ORDER BY " + column + " " + direction).ToListAsync();
}

public record User(int Id, string Email, string Name);` },
    { lang: 'csharp', title: 'Command injection: shell string (vulnerable) vs ArgumentList (fixed)', code: `using System.Diagnostics;

// VULNERABLE: one command string handed to a shell.
// If fileName contains ; or | or &, the shell runs a second command.
static void ConvertBad(string fileName)
{
    Process.Start("/bin/sh", "-c \\"convert uploads/" + fileName + " out.png\\"");
}

// FIXED: no shell, program called directly, each argument passed as its own item.
static async Task ConvertGoodAsync(string storedFileId)
{
    // 1. Never use the user's file name. Use an ID we generated at upload time.
    if (!Guid.TryParse(storedFileId, out var id))
        throw new ArgumentException("Invalid file id.");

    var psi = new ProcessStartInfo
    {
        FileName = "/usr/bin/convert",      // full path to the one program we allow
        UseShellExecute = false,            // no shell, so ; | & have no special meaning
        RedirectStandardError = true
    };
    psi.ArgumentList.Add("/var/app/uploads/" + id.ToString("N"));
    psi.ArgumentList.Add("/var/app/out/" + id.ToString("N") + ".png");

    using var p = Process.Start(psi)!;
    using var cts = new CancellationTokenSource(TimeSpan.FromSeconds(20));   // never wait forever
    await p.WaitForExitAsync(cts.Token);
    if (p.ExitCode != 0)
        throw new InvalidOperationException("Conversion failed.");
}

// Best of all: use a library inside your process instead of starting a program.
// No process, no command line, no command injection.` }
  ],
  pitfalls: [
    `Using FromSqlRaw with an interpolated string. It looks like the safe FromSqlInterpolated but C# fills the value in before EF Core can make it a parameter.`,
    `Escaping quotes by hand instead of using parameters. Hand-made escaping misses edge cases and other characters.`,
    `Believing stored procedures are always safe. A procedure that builds SQL text and runs it with EXEC is injectable.`,
    `Letting the request choose a column or table name directly. Map the choice to your own fixed strings.`,
    `Connecting as db_owner or sa. One missed query then exposes the whole database instead of one table.`,
    `Trusting data because it came from your own tables. Stored input used later in a string-built query is second-order injection.`
  ],
  checklist: [
    `Search the codebase for SQL built with +, string.Format or interpolation and replace with parameters.`,
    `Use FromSql or FromSqlInterpolated for raw EF Core SQL, never FromSqlRaw with joined values.`,
    `Map sort columns, table names and directions through an allow-list.`,
    `Replace EXEC(@sql) in stored procedures with sp_executesql and parameters.`,
    `Give the app database account only the rights it needs. Never db_owner or sa.`,
    `Start external programs with UseShellExecute = false and ArgumentList.`,
    `Use structured logging so user text cannot forge log lines.`,
    `Return generic error messages. Keep database error details in server logs.`,
    `Add a SAST rule that fails the build on string-built SQL.`
  ],
  quiz: [
    { q: `Why does a parameterized query stop SQL injection?`, options: [`It removes quote characters from the input before the query runs`, `It encrypts the query so the database cannot be tricked`, `The value is sent separately and is never parsed as SQL`, `It checks the input against a list of dangerous SQL keywords`], answer: 2, why: `The database never parses the value as SQL. It only compares or stores it, so special characters have no power.` },
    { q: `Which EF Core call is vulnerable?`, options: [`db.Users.Where(u => u.Email == email)`, `db.Users.FromSqlInterpolated($"SELECT * FROM Users WHERE Email = {email}")`, `db.Users.FromSqlRaw("SELECT * FROM Users WHERE Email = {0}", email)`, `db.Users.FromSqlRaw($"SELECT * FROM Users WHERE Email = '{email}'")`], answer: 3, why: `With FromSqlRaw and a C# interpolated string, the value is merged into the text before EF Core sees it. The other three are parameterized.` },
    { q: `Users can click a column header to sort a grid. How do you build the ORDER BY safely?`, options: [`Pass the column name as a SQL parameter, like any other value`, `Map the choice to a column name from your own fixed list`, `Remove spaces and semicolons from the column name before using it`, `HTML-encode the column name before adding it to the query`], answer: 1, why: `Identifiers cannot be parameters. An allow-list makes sure only text you wrote reaches the SQL.` },
    { q: `What does least privilege on the database account give you?`, options: [`It prevents injection completely on the tables it covers`, `It limits what an attacker can do if an injection bug exists`, `It makes queries faster, because fewer rights are checked`, `It removes the need for parameters in internal queries`], answer: 1, why: `It is a second layer. If one query is vulnerable, the attacker is limited to the few tables and actions that account has.` },
    { q: `A display name is saved with a parameterized INSERT. A nightly job later joins that name into a SQL string. What is this called?`, options: [`Blind injection`, `Second-order injection`, `Cross-site scripting`, `It is safe because the data came from the database`], answer: 1, why: `The dangerous use happens later and elsewhere. Stored data is still untrusted when building commands.` },
    { q: `What is the safest way to run an external tool from .NET with a user-related argument?`, options: [`Process.Start("cmd", "/c tool " + arg)`, `Wrap the argument in quotes inside one command string`, `UseShellExecute = false and ArgumentList.Add(arg)`, `Remove semicolons and pipes from the argument, then use a shell`], answer: 2, why: `Without a shell, and with arguments passed as separate items, special shell characters are just characters.` }
  ],
  takeaways: [
    `Injection means user data became part of a command. Keep command and data separate.`,
    `For SQL the answer is parameters, every time, including internal jobs.`,
    `EF Core LINQ, Dapper objects and ADO.NET parameters are safe. Joined strings are not.`,
    `Identifiers need an allow-list, because they cannot be parameters.`,
    `Least-privilege accounts turn a disaster into an incident.`,
    `The same rule covers shells, NoSQL, LDAP, templates and logs.`
  ],
  interview: [
    { q: `Explain SQL injection and how you prevent it in a .NET application.`, a: `<p>SQL injection occurs when untrusted input is concatenated into SQL text, so the database parses it as part of the command. Prevention: parameterized queries everywhere (EF Core LINQ, <code>FromSql</code>/<code>FromSqlInterpolated</code>, Dapper parameters, <code>SqlParameter</code>), allow-lists for anything that cannot be a parameter (column names, sort direction), input validation as an extra layer, least-privilege database accounts, generic error messages, and static analysis in CI to catch string-built SQL.</p>` },
    { q: `Is using an ORM enough to be safe from SQL injection?`, a: `<p>No. ORMs parameterize the queries they generate, but they all offer raw SQL escape hatches. <code>FromSqlRaw</code> or <code>ExecuteSqlRaw</code> with a concatenated or interpolated string is fully vulnerable. Dynamic LINQ libraries that parse strings, and stored procedures that build dynamic SQL, bring the risk back too. The ORM makes the safe path easy. It does not remove the unsafe path.</p>` },
    { q: `What is second-order SQL injection?`, a: `<p>The malicious input is stored safely at first, then later read back and used in an unsafe, string-built query, often in a different module such as a report or batch job. It is hard to find with simple testing because the entry point and the vulnerable query are far apart. The defence is to parameterize every query no matter where the data comes from.</p>` },
    { q: `How would you handle a requirement for user-defined filters and sorting on a grid?`, a: `<p>Define the allowed fields, operators and directions on the server. Accept the user's choice as keys, look them up in an allow-list, and build the query with LINQ expressions or with fixed column strings plus parameters for values. Enforce limits on page size and number of filters. Never accept raw SQL fragments or column names straight from the request.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-xss-csrf — XSS, CSRF & Clickjacking                             */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-xss-csrf'] = {
  hook: `The browser trusts your site completely. These three attacks borrow that trust without asking you.`,
  intro: `<p>A browser runs whatever script your page gives it, and it attaches the user's cookies to every request sent to your site. That is how the web works. Three classic attacks abuse exactly these two behaviours.</p>
<p><span class="term">Cross-site scripting (XSS)</span>: an attacker gets their own JavaScript to run inside your page. The browser thinks the script is yours, so it can read what the user sees and act as the user.</p>
<p><span class="term">Cross-site request forgery (CSRF)</span>: another website makes the user's browser send a request to your site. The browser helpfully attaches the user's login cookie, so your server thinks the user asked for it.</p>
<p><span class="term">Clickjacking</span>: your real page is loaded invisibly inside another page, and the user is tricked into clicking a button they cannot see.</p>
<p>Modern frameworks such as Razor and Angular protect you from most of this by default. The bugs appear when developers switch the protection off, usually to "just show some HTML". This lesson shows what the defaults do, how they get broken, and how to add a second layer.</p>`,
  realLife: {
    title: 'The notice board, the signed cheque and the glass door',
    body: `<p><strong>XSS is a poisoned notice board.</strong> An office has a board where anyone can pin a note, and every employee follows the notes because the board belongs to the company. Someone pins "Everyone: send your badge number to desk 14". Staff obey, because the note is on the official board. A site that shows user content without encoding is that board.</p>
<p><strong>CSRF is a signed blank cheque.</strong> You are logged in to your bank in one tab. In another tab you open a page that looks like a cat video. Hidden in it is a form that asks your bank to transfer money. Your browser sends it, with your bank cookie attached, like a cheque you already signed. The bank sees a valid signature and pays.</p>
<p><strong>Clickjacking is a glass door with a painted button.</strong> You think you are pressing "Play". Behind the picture, exactly under your finger, is the real "Delete account" button of another site.</p>
<p><strong>How this showed up in the real world:</strong> in 2005 a user of the social network MySpace placed a script in his profile. Everyone who viewed the profile ran it, which added him as a friend and copied the script to their own profile. It spread to more than a million profiles in under a day. This "Samy worm" was stored XSS. In 2018, attackers changed a script used on the British Airways payment page, and it quietly copied card details of hundreds of thousands of customers as they typed.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>XSS in three flavours</h4>
<table><thead><tr><th>Type</th><th>Where the bad script lives</th><th>Example</th></tr></thead><tbody>
<tr><td><strong>Stored</strong></td><td>Saved in your database and shown to others</td><td>A comment or profile field containing a script tag</td></tr>
<tr><td><strong>Reflected</strong></td><td>In the request, echoed straight back in the response</td><td>A search page that prints "You searched for ..." using the raw query</td></tr>
<tr><td><strong>DOM-based</strong></td><td>Never reaches the server. Page JavaScript puts it in the page.</td><td>Code that reads the URL and writes it with innerHTML</td></tr>
</tbody></table>
<p>In all three the root cause is the same: text from a user was placed into the page as HTML, so the browser parsed it as markup and code.</p>
<h4>What can an injected script do?</h4>
<p>Anything the user can do on your site. Read the page, send requests as the user, change what is displayed, capture what is typed. That is why XSS on a login or payment page is so serious.</p>
<h4>The fix: encode output</h4>
<p><span class="term">HTML encoding</span> turns special characters into harmless text. <code>&lt;</code> becomes <code>&amp;lt;</code>. The browser then shows the characters on screen and never treats them as a tag.</p>
<ul>
<li><strong>Razor</strong> encodes everything you write with <code>@</code>. <code>@Model.Comment</code> is safe.</li>
<li><strong>Angular</strong> encodes everything in <code>{{ }}</code> and treats bound values as untrusted.</li>
</ul>
<div class="callout tip">The frameworks are safe by default. Your job is mostly to not turn the safety off.</div>
<h4>CSRF in one picture</h4>
<p>Your site uses a login cookie. The user is logged in. They visit another site. That site contains a hidden form pointing at <code>yoursite.com/transfer</code>. The browser submits it and adds your cookie automatically. Your server cannot tell this request from a real one, unless you add something the other site cannot know or send.</p>
<p>Two defences work together:</p>
<ul>
<li><strong>SameSite cookies.</strong> A cookie flag that tells the browser not to send the cookie on requests that start from another site.</li>
<li><strong>Anti-forgery tokens.</strong> A secret random value your page includes with each form or request. The other site cannot read it, so its forged request is rejected.</li>
</ul>
<h4>Clickjacking</h4>
<p>The fix is one response header that says "do not show my pages inside a frame on other sites".</p>` },
    { name: 'Intermediate', body: `<h4>How developers break the defaults</h4>
<table><thead><tr><th>Stack</th><th>Dangerous call</th><th>Safer choice</th></tr></thead><tbody>
<tr><td>Razor</td><td><code>@Html.Raw(userText)</code></td><td><code>@userText</code>, or sanitise first if HTML is truly needed</td></tr>
<tr><td>Angular</td><td><code>bypassSecurityTrustHtml(userText)</code></td><td><code>{{ userText }}</code>, or <code>[innerHTML]</code> which Angular sanitises</td></tr>
<tr><td>Angular / JS</td><td><code>element.nativeElement.innerHTML = userText</code></td><td>Template binding, or <code>textContent</code></td></tr>
<tr><td>Any</td><td>Building a script block with string joins</td><td>Pass data as JSON and read it</td></tr>
<tr><td>Any</td><td><code>href</code> set to a user URL</td><td>Allow only http and https schemes</td></tr>
</tbody></table>
<p>The word "bypass" in Angular's API is a warning label. It is only for content you fully control.</p>
<h4>When users really need rich text</h4>
<p>Comments with bold text or links cannot simply be encoded. Use a <span class="term">sanitiser</span>: a library that parses HTML and keeps only an allow-list of harmless tags and attributes. Sanitise on the server before saving or before sending, with a maintained library. Do not write your own with regex. Another route is to store Markdown and render it with a renderer that has raw HTML switched off.</p>
<h4>Content Security Policy: the second layer</h4>
<p>A <span class="term">Content Security Policy (CSP)</span> is a response header that tells the browser which scripts are allowed to run. A strict policy such as "only scripts from my own origin, no inline scripts" means that even if an attacker manages to inject a script tag, the browser refuses to run it. CSP does not replace encoding. It limits the damage when encoding is missed somewhere.</p>
<h4>CSRF defences in ASP.NET Core and Angular</h4>
<ul>
<li>Set the auth cookie to <code>SameSite=Lax</code> or <code>Strict</code>, plus <code>Secure</code> and <code>HttpOnly</code>.</li>
<li>Razor forms include an anti-forgery token automatically. Validate it globally with <code>AutoValidateAntiforgeryToken</code>.</li>
<li>For Angular with cookie auth: the server sets a cookie named <code>XSRF-TOKEN</code>. Angular's HttpClient reads it and sends it back in the <code>X-XSRF-TOKEN</code> header on changing requests. Another site cannot read your cookie, so it cannot set that header.</li>
<li>Never change state on a GET request. GET must only read.</li>
</ul>
<h4>Why bearer-token APIs are different</h4>
<p>CSRF works because cookies are attached automatically. If your API only accepts a token in the <code>Authorization</code> header, the browser does not attach it by itself, so a forged cross-site request arrives without credentials. That removes classic CSRF. It moves the risk to XSS, because script on your page could read a token kept in JavaScript-readable storage.</p>
<h4>Clickjacking defence</h4>
<p>Send <code>Content-Security-Policy: frame-ancestors 'none'</code> (or <code>'self'</code>), and the older <code>X-Frame-Options: DENY</code> for old browsers.</p>` },
    { name: 'Expert', body: `<h4>Context decides the encoding</h4>
<p>HTML body, attribute value, JavaScript string, CSS and URL each have different special characters. Encoding for one and placing the result in another is a common source of XSS in server-rendered pages. Typical mistakes: an unquoted attribute, a user value inside an inline event handler, a user URL placed in <code>href</code> with a <code>javascript:</code> scheme. The simplest rule is to keep untrusted data out of script blocks, event handlers and style attributes entirely, and deliver it as JSON or through data attributes.</p>
<h4>A CSP that really helps</h4>
<ul>
<li>Avoid <code>'unsafe-inline'</code> and <code>'unsafe-eval'</code> for scripts. With them, the policy stops very little.</li>
<li>Prefer a <strong>nonce-based</strong> policy: the server creates a random value per response and adds it to each script tag it trusts. Only scripts with the right nonce run. Add <code>'strict-dynamic'</code> so trusted scripts can load their dependencies.</li>
<li>Add <code>object-src 'none'</code> and <code>base-uri 'self'</code>.</li>
<li>Roll out with <code>Content-Security-Policy-Report-Only</code> first and watch the reports, then enforce.</li>
<li><span class="term">Trusted Types</span> go further in supporting browsers: assignments to dangerous sinks like innerHTML must pass through a policy you define. Angular has built-in support.</li>
</ul>
<h4>Third-party scripts and Subresource Integrity</h4>
<p>A script you load from another host runs with full power in your page. If that host is compromised, so are you. Self-host what you can. For the rest, use <span class="term">Subresource Integrity</span>: an <code>integrity</code> attribute with a hash, so the browser refuses a changed file. Keep payment and login pages as free of third-party script as possible.</p>
<h4>CSRF details that matter</h4>
<ul>
<li><strong>SameSite=Lax</strong> still sends cookies on top-level GET navigations. That is fine only if GETs never change state.</li>
<li>"Site" is wider than "origin". A vulnerable sibling subdomain counts as same-site, so SameSite alone is not a full defence. Keep tokens too.</li>
<li>Login and logout forms need protection as well (login CSRF can bind a victim to the attacker's account).</li>
<li>The double-submit cookie pattern is weaker if an attacker can set cookies from a subdomain. Prefer tokens tied to the session, which is what ASP.NET Core antiforgery does.</li>
<li>CORS is not a CSRF defence. Simple cross-site requests are sent before any CORS check. CORS only controls who may read the response.</li>
<li>Checking the <code>Origin</code> header, or the newer Fetch Metadata headers such as <code>Sec-Fetch-Site</code>, is a useful extra server-side check.</li>
</ul>
<h4>XSS makes CSRF defences useless</h4>
<p>Script running in your own origin can read anti-forgery tokens and send same-site requests. So XSS prevention comes first. HttpOnly cookies stop script from reading the session cookie, but the script can still act as the user while the page is open.</p>
<div class="callout idea">Interview framing: XSS is the site trusting user content too much. CSRF is the site trusting the browser too much. Clickjacking is the user trusting what they see too much.</div>` }
  ],
  flow: {
    title: 'A stored XSS attempt meeting each layer of defence',
    steps: [
      { title: 'Attacker submits', desc: `A comment is posted that contains HTML markup with a script instead of plain words.` },
      { title: 'Server validates', desc: `Length and format rules run. Plain comments have no reason to contain markup, so many attempts are rejected right here.` },
      { title: 'Stored as data', desc: `Whatever passes is saved with a parameterized query. It sits in the database as plain text.` },
      { title: 'Victim opens page', desc: `Another user loads the page. The server or Angular must now put that comment into HTML.` },
      { title: 'Output is encoded', desc: `Razor or Angular encodes the text. Angle brackets become harmless entities. The victim sees odd text on screen and nothing runs.` },
      { title: 'If encoding was bypassed', desc: `Suppose a developer used Html.Raw here. The markup reaches the browser as real HTML. The first layer has failed.` },
      { title: 'CSP blocks it', desc: `The Content Security Policy only allows scripts with the right nonce from your origin. The injected script is refused and a report is sent.` },
      { title: 'Team is alerted', desc: `The CSP report shows a blocked inline script on the comments page. The team finds and fixes the Html.Raw.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Razor: vulnerable Html.Raw vs encoded output and sanitised rich text', code: `// ---------- Comments.cshtml (shown here as comments) ----------
//
// VULNERABLE: prints user text as real HTML. A script in the comment will run.
//   <div class="comment">@Html.Raw(comment.Text)</div>
//
// FIXED: Razor encodes by default. Special characters are shown, not executed.
//   <div class="comment">@comment.Text</div>
//
// FIXED for links: allow only http/https, otherwise show no link.
//   <a href="@(Safe.Url(comment.Website) ?? "#")" rel="noopener nofollow">site</a>

using Ganss.Xss;   // NuGet: HtmlSanitizer (a maintained allow-list sanitiser)

public static class Safe
{
    // Rich text (bold, lists, links) is needed? Sanitise with an allow-list.
    private static readonly HtmlSanitizer Sanitizer = BuildSanitizer();

    private static HtmlSanitizer BuildSanitizer()
    {
        var s = new HtmlSanitizer();
        s.AllowedTags.Clear();
        foreach (var tag in new[] { "b", "i", "em", "strong", "p", "ul", "ol", "li", "a", "br" })
            s.AllowedTags.Add(tag);
        s.AllowedAttributes.Clear();
        s.AllowedAttributes.Add("href");
        s.AllowedSchemes.Clear();
        s.AllowedSchemes.Add("https");
        s.AllowedSchemes.Add("http");
        return s;
    }

    // Call this BEFORE saving or before rendering. Only then is Html.Raw acceptable.
    public static string RichText(string untrustedHtml) => Sanitizer.Sanitize(untrustedHtml);

    // User-supplied URLs: only absolute http/https. Blocks javascript: and data: links.
    public static string? Url(string? input) =>
        Uri.TryCreate(input, UriKind.Absolute, out var uri) &&
        (uri.Scheme == Uri.UriSchemeHttps || uri.Scheme == Uri.UriSchemeHttp)
            ? uri.ToString()
            : null;
}` },
    { lang: 'typescript', title: 'Angular: how the default protection gets broken, and the safe forms', code: `import { Component, ElementRef, inject, input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

// VULNERABLE: two ways to switch off Angular's protection.
@Component({
  selector: 'app-comment-bad',
  standalone: true,
  template: '<div [innerHTML]="trusted"></div>'
})
export class CommentBadComponent {
  private sanitizer = inject(DomSanitizer);
  private host = inject(ElementRef);
  text = input.required<string>();
  trusted: SafeHtml = '';

  ngOnInit() {
    // 1. "bypass" tells Angular: do not sanitise this. User text now runs as HTML.
    this.trusted = this.sanitizer.bypassSecurityTrustHtml(this.text());

    // 2. Writing to the DOM directly skips Angular completely.
    this.host.nativeElement.innerHTML = this.text();
  }
}

// FIXED: let Angular do its job.
@Component({
  selector: 'app-comment',
  standalone: true,
  template:
    // Interpolation: always encoded. Use this for plain text.
    '<p class="plain">{{ text() }}</p>' +
    // [innerHTML] WITHOUT bypass: Angular sanitises it and strips scripts and handlers.
    // Use only for rich text that the server has already sanitised.
    '<div class="rich" [innerHTML]="richHtml()"></div>' +
    // Links: bind the value. Angular blocks javascript: URLs in [href].
    '<a [href]="website()" rel="noopener nofollow">Website</a>'
})
export class CommentComponent {
  text = input.required<string>();
  richHtml = input<string>('');
  website = input<string>('');
}

// Rules of thumb:
//  - {{ }} for text, always.
//  - Never call bypassSecurityTrust... on anything a user could influence.
//  - Never touch nativeElement.innerHTML, document.write or eval with dynamic data.` },
    { lang: 'csharp', title: 'ASP.NET Core: anti-forgery, cookie flags, CSP and anti-framing headers', code: `using Microsoft.AspNetCore.Antiforgery;
using Microsoft.AspNetCore.Mvc;

var builder = WebApplication.CreateBuilder(args);

// 1. Validate anti-forgery tokens on every unsafe request (POST, PUT, DELETE).
builder.Services.AddControllersWithViews(o =>
    o.Filters.Add(new AutoValidateAntiforgeryTokenAttribute()));

// Angular's HttpClient sends the token in this header by default.
builder.Services.AddAntiforgery(o => o.HeaderName = "X-XSRF-TOKEN");

// 2. Auth cookie flags: script cannot read it, HTTPS only, not sent on cross-site POSTs.
builder.Services.ConfigureApplicationCookie(o =>
{
    o.Cookie.HttpOnly = true;
    o.Cookie.SecurePolicy = CookieSecurePolicy.Always;
    o.Cookie.SameSite = SameSiteMode.Lax;
});

var app = builder.Build();

// 3. Security headers on every response.
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h["Content-Security-Policy"] =
        "default-src 'self'; script-src 'self'; object-src 'none'; " +
        "base-uri 'self'; frame-ancestors 'none'";      // also blocks clickjacking
    h["X-Frame-Options"] = "DENY";                      // for older browsers
    h["X-Content-Type-Options"] = "nosniff";
    await next();
});

app.UseAuthentication();
app.UseAuthorization();

// 4. Give the Angular app a token it can read and echo back in the header.
//    Another site cannot read this cookie, so it cannot forge the header.
app.MapGet("/api/antiforgery", (IAntiforgery af, HttpContext ctx) =>
{
    var tokens = af.GetAndStoreTokens(ctx);
    ctx.Response.Cookies.Append("XSRF-TOKEN", tokens.RequestToken!, new CookieOptions
    {
        HttpOnly = false,               // Angular must read this one
        Secure = true,
        SameSite = SameSiteMode.Strict
    });
    return Results.NoContent();
});

app.MapControllers();
app.Run();

// Angular side: provideHttpClient(withXsrfConfiguration({
//   cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }))  // these are the defaults` }
  ],
  pitfalls: [
    `Using Html.Raw or bypassSecurityTrustHtml to "make the HTML show". That one call removes the framework's XSS protection for that value.`,
    `Writing a home-made HTML filter with regex or string replace. Use a maintained allow-list sanitiser.`,
    `A CSP that includes 'unsafe-inline' for scripts. It looks like protection and blocks almost nothing.`,
    `Changing data on GET requests. SameSite=Lax still sends cookies on top-level GET navigation, and links get prefetched.`,
    `Believing CORS stops CSRF. Simple cross-site requests are sent anyway. CORS only limits reading the response.`,
    `Forgetting that XSS defeats CSRF tokens. Script in your origin can read the token, so fix XSS first.`
  ],
  checklist: [
    `Search for Html.Raw, bypassSecurityTrust, innerHTML, document.write and eval. Remove or justify each one.`,
    `Render user text with @value in Razor and {{ value }} in Angular.`,
    `Sanitise any user-supplied rich text on the server with an allow-list library.`,
    `Allow only http and https schemes in user-supplied links.`,
    `Send a Content-Security-Policy without 'unsafe-inline' for scripts. Start in report-only mode.`,
    `Set auth cookies to HttpOnly, Secure and SameSite=Lax or Strict.`,
    `Validate anti-forgery tokens on every state-changing request when using cookie auth.`,
    `Make sure no GET endpoint changes data.`,
    `Send frame-ancestors 'none' (or 'self') and X-Frame-Options to stop framing.`,
    `Add Subresource Integrity to third-party scripts, or self-host them.`
  ],
  quiz: [
    { q: `A comment containing a script is saved and later runs in every reader's browser. Which type of XSS is this?`, options: [`Reflected`, `Stored`, `DOM-based`, `CSRF`], answer: 1, why: `The payload is saved on the server and served to other users, which is the definition of stored XSS.` },
    { q: `Why is {{ comment }} in an Angular template safe?`, options: [`Angular removes all special characters from the value`, `Angular encodes the value so the browser shows it as text`, `Angular only allows short strings without spaces in templates`, `Angular sends it to the server for checking before display`], answer: 1, why: `Interpolation inserts the value as text, never as markup, so tags are displayed instead of executed.` },
    { q: `Why does CSRF work against cookie-based login?`, options: [`The attacker steals the cookie from the browser and replays it`, `The browser adds the cookie even when another site triggers the request`, `The attacker guesses the password and logs in from another site`, `Cookies are not encrypted, so any site can read and copy them`], answer: 1, why: `The attacker never sees the cookie. They only need the browser to send a request, and the browser adds the cookie by itself.` },
    { q: `What does an anti-forgery token add?`, options: [`Encryption of the form data, so other sites cannot read what is sent`, `A secret value that another site cannot read or send`, `A second password that the user must type on every form`, `A limit on request size, so forged requests are cut off`], answer: 1, why: `A forged request from another site lacks the token, so the server rejects it even though the cookie is present.` },
    { q: `Which header stops your pages from being shown inside a frame on another site?`, options: [`Access-Control-Allow-Origin set to your own origin`, `Strict-Transport-Security with includeSubDomains`, `Content-Security-Policy with frame-ancestors`, `Cache-Control with no-store`], answer: 2, why: `frame-ancestors lists who may embed the page. 'none' blocks all framing, which defeats clickjacking.` },
    { q: `Your API only accepts a token in the Authorization header and uses no cookies. Which statement is true?`, options: [`Classic CSRF is not possible, but XSS could still steal or use the token`, `CSRF is still the main risk, because browsers attach the header automatically`, `XSS is no longer possible, because there is no cookie to steal`, `You now need anti-forgery tokens on every call`], answer: 0, why: `The browser does not attach Authorization headers by itself, so forged cross-site requests carry no credentials. Script injected into your own page is still dangerous.` }
  ],
  takeaways: [
    `XSS: user content ran as code in your page. Fix with output encoding and safe framework defaults.`,
    `Do not switch off protection: avoid Html.Raw, bypassSecurityTrust and innerHTML with user data.`,
    `CSP is a strong second layer, as long as it does not allow inline scripts.`,
    `CSRF: the browser sent the user's cookie on a request the user did not intend. Fix with SameSite cookies plus anti-forgery tokens.`,
    `GET requests must never change state.`,
    `Clickjacking is fixed with one header: frame-ancestors.`
  ],
  interview: [
    { q: `What is the difference between XSS and CSRF?`, a: `<p>In XSS the attacker's script runs inside the victim site's origin, so it can read data and perform any action as the user. The cause is unencoded output. In CSRF the attacker's page cannot read anything from the victim site. It only causes the browser to send a request that carries the user's cookies. The cause is the server accepting cookie-authenticated, state-changing requests without proof they came from its own pages. XSS is the stronger attack and it defeats CSRF defences.</p>` },
    { q: `How does Angular protect against XSS, and how can a developer undo that?`, a: `<p>Angular treats all bound values as untrusted. Interpolation is inserted as text. Bindings like <code>[innerHTML]</code>, <code>[href]</code> and <code>[src]</code> pass through a built-in sanitiser for that context. Protection is lost when a developer calls <code>bypassSecurityTrustHtml/Url/Script</code> on user-influenced data, writes to <code>nativeElement.innerHTML</code> directly, or builds templates dynamically from user input. Server-side: still encode and sanitise, because the same data may be used by other clients.</p>` },
    { q: `Is SameSite=Lax enough to prevent CSRF?`, a: `<p>It blocks most cross-site POSTs, which is a big improvement, but it is not complete. Lax still sends cookies on top-level GET navigation, so any state-changing GET is exposed. Requests from sibling subdomains count as same-site. Older clients may ignore the attribute. The recommended approach is defence in depth: SameSite cookies, anti-forgery tokens on unsafe methods, no state change on GET, and optionally an Origin or Fetch Metadata check.</p>` },
    { q: `What makes a Content Security Policy effective?`, a: `<p>No <code>'unsafe-inline'</code> or <code>'unsafe-eval'</code> for scripts, a nonce or hash based <code>script-src</code> (with <code>'strict-dynamic'</code> where needed), <code>object-src 'none'</code>, <code>base-uri 'self'</code> and <code>frame-ancestors</code> set. Deploy in report-only mode first, review violation reports, then enforce. CSP is a mitigation layer. Encoding and sanitising remain the primary fix.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-secrets — Secrets Management & Key Handling                     */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-secrets'] = {
  hook: `Attackers rarely break the lock. Far more often they find the key that somebody left in the code.`,
  intro: `<p>A <span class="term">secret</span> is any piece of data that gives access to something: a database password, an API key, a signing key, a certificate's private key, a token. Whoever holds the secret can act as your application.</p>
<p>The hard part is that your app needs these secrets to run, so they must live somewhere. The easy places, such as the source code or a config file in the repository, are also the places where secrets leak. Source code gets copied to laptops, build servers, backups and sometimes public repositories. A secret that travels with the code travels everywhere.</p>
<p><span class="term">Secrets management</span> is the set of habits that keeps secrets out of code, stores them in a protected place called a <span class="term">vault</span>, gives each app only the secrets it needs, changes them regularly, and lets you react fast when one leaks.</p>
<p>The best secret is the one that does not exist. Modern clouds let your app prove who it is without any password at all, using a <span class="term">managed identity</span>. This lesson takes you from "password in appsettings.json" to "no password anywhere".</p>`,
  realLife: {
    title: 'The house key under the doormat',
    body: `<p>Leaving a password in source code is like hiding your house key under the doormat. It is convenient. Everyone in the family knows where it is. So does every burglar, because it is the first place anyone looks.</p>
<p>A better setup looks like a hotel. Keys are kept at the front desk (the vault). You show who you are, and the desk hands you a key card that opens only your room and stops working after your stay (least privilege and expiry). The desk keeps a record of who took which key and when (audit log). If a card is lost, the desk cancels that one card in seconds, and no locks need to be changed (revocation).</p>
<p><strong>How this showed up in the real world:</strong> in 2016, attackers got into a private code repository used by Uber engineers and found cloud access keys stored in the code. With those keys they reached a storage system holding personal data of about 57 million riders and drivers. No clever exploit was needed. The keys were simply there. Security teams also report that when an access key is pushed to a public repository by mistake, automated bots find and try it within minutes.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What counts as a secret?</h4>
<ul>
<li>Database connection strings that contain a password.</li>
<li>API keys for payment, email, maps, AI services.</li>
<li>Keys used to sign tokens (JWT signing keys) or encrypt data.</li>
<li>Private keys of TLS certificates and SSH keys.</li>
<li>OAuth client secrets, webhook signing secrets.</li>
<li>Personal access tokens for Git, package feeds and cloud accounts.</li>
</ul>
<p>Things that are <em>not</em> secrets: URLs, feature flags, public keys, client IDs. They can live in normal config.</p>
<h4>Where secrets must never be</h4>
<table><thead><tr><th>Place</th><th>Why it leaks</th></tr></thead><tbody>
<tr><td>Source code</td><td>Copied to every clone, fork, backup and build log. Stays in Git history forever.</td></tr>
<tr><td>appsettings.json in the repo</td><td>Same as source code.</td></tr>
<tr><td>Angular or other frontend code</td><td>Everything shipped to a browser is public. A frontend cannot keep a secret.</td></tr>
<tr><td>Docker images</td><td>Anyone who can pull the image can read every layer.</td></tr>
<tr><td>Logs and error messages</td><td>Logs are read by many people and shipped to other systems.</td></tr>
<tr><td>Chat, email, tickets, wikis</td><td>Searchable, long-lived, widely readable.</td></tr>
</tbody></table>
<div class="callout warn">Deleting a secret from a file and committing again does not remove it. It is still in the Git history. A leaked secret must be changed, not just deleted.</div>
<h4>Where they should be</h4>
<ul>
<li><strong>On your laptop:</strong> the .NET <span class="term">user-secrets</span> tool. It stores values in your user profile, outside the project folder, so they cannot be committed.</li>
<li><strong>In test and production:</strong> a <span class="term">vault</span> service such as Azure Key Vault, AWS Secrets Manager or HashiCorp Vault. The app fetches secrets at start-up.</li>
</ul>
<p>.NET makes this easy, because configuration is layered. Your code always reads <code>configuration["Payments:ApiKey"]</code>. Where the value comes from (user-secrets, environment variable, vault) changes per environment without changing code.</p>
<div class="callout tip">Add a <code>.gitignore</code> on day one that ignores <code>.env</code> files, <code>appsettings.*.local.json</code>, key files (<code>*.pfx</code>, <code>*.pem</code>) and publish profiles.</div>` },
    { name: 'Intermediate', body: `<h4>Environment variables, user-secrets, vaults</h4>
<table><thead><tr><th>Option</th><th>Good for</th><th>Limits</th></tr></thead><tbody>
<tr><td>user-secrets</td><td>Local development</td><td>Not encrypted. Dev machines only.</td></tr>
<tr><td>Environment variables</td><td>Containers and simple hosting</td><td>Visible to anyone who can inspect the process or the deployment config. No rotation, no audit.</td></tr>
<tr><td>Vault</td><td>Test and production</td><td>Needs setup. The app must prove its identity to the vault.</td></tr>
</tbody></table>
<p>A vault gives you what the other two cannot: access control per secret, an audit log of every read, versioning, and rotation.</p>
<h4>The "secret zero" problem and managed identities</h4>
<p>To read from the vault, the app must log in to the vault. If that login is itself a password in config, you have only moved the problem. This first credential is called <span class="term">secret zero</span>.</p>
<p>Clouds solve it with <span class="term">managed identities</span> (Azure) or instance and workload roles (AWS, GCP, Kubernetes). The platform gives your running app an identity automatically. The app asks the platform for a short-lived token, and the vault trusts that token. There is no password for you to store, leak or rotate.</p>
<p>Often you can skip the secret completely. Azure SQL, Storage, Service Bus and Key Vault all accept the app's managed identity directly. The connection string then contains a server name and no password.</p>
<h4>Rotation and short-lived credentials</h4>
<p><span class="term">Rotation</span> means replacing a secret with a new one on a schedule or after an incident. A secret that changes every 30 days is useful to a thief for at most 30 days. To rotate without downtime:</p>
<ol>
<li>Create the new key while the old one still works (most services allow two active keys).</li>
<li>Update the vault. Apps pick up the new value on refresh or restart.</li>
<li>Check that traffic uses the new key.</li>
<li>Disable the old key.</li>
</ol>
<p>Short-lived tokens are rotation taken to the limit: a credential that lives for an hour is not worth much if stolen.</p>
<h4>Catch leaks before they leave your laptop</h4>
<p><span class="term">Secret scanning</span> tools look for patterns that resemble keys. Run one as a pre-commit hook so the commit is refused locally, and again in the pipeline as a backstop. Turn on your Git host's push protection where available.</p>` },
    { name: 'Expert', body: `<h4>The first hour after a leak</h4>
<p>Treat any secret that reached a place it should not be as compromised, even if "probably nobody saw it".</p>
<ol>
<li><strong>Revoke or rotate now.</strong> This is the only step that removes the risk. Do it before anything else.</li>
<li><strong>Audit.</strong> Check the service's access logs for use of the old credential from unknown addresses, and for actions you did not perform.</li>
<li><strong>Find the blast radius.</strong> What could this credential reach? Look for new users, keys or resources created with it.</li>
<li><strong>Clean up.</strong> Remove the secret from the code. Rewriting Git history is optional tidying and never a substitute for rotation, because clones and caches already have it.</li>
<li><strong>Prevent a repeat.</strong> Add a scanner rule, move the secret to the vault, write up what happened without blame.</li>
</ol>
<h4>Designing for small blast radius</h4>
<ul>
<li><strong>One identity per service per environment.</strong> Never share a production credential with test or with another service.</li>
<li><strong>Scope tightly.</strong> A reporting service gets read access to one database, not owner rights on the server.</li>
<li><strong>Separate vaults</strong> for production and non-production, with different people allowed in.</li>
<li><strong>Break-glass accounts</strong> for emergencies, stored offline, with alerts on any use.</li>
</ul>
<h4>Key management, not just storage</h4>
<p>For encryption and signing keys, the strongest setup is that the key never leaves the vault at all. The app sends data to the vault or a hardware security module (HSM) and asks it to sign or decrypt. A stolen app server then yields no key. <span class="term">Envelope encryption</span> uses this idea at scale: data is encrypted with a data key, and that data key is itself encrypted by a master key held in the vault.</p>
<p>In ASP.NET Core, the Data Protection system has its own key ring (used for cookies and anti-forgery tokens). In a multi-instance deployment, persist that key ring to shared storage and protect it with a vault key, or users get logged out at every deploy.</p>
<h4>Pipelines are secret-rich targets</h4>
<p>CI/CD systems hold deployment credentials. Prefer <span class="term">workload identity federation</span> (OIDC between your pipeline and cloud) so the pipeline receives a short-lived token and stores no long-lived cloud key. Limit which branches and environments may request it. Mask secrets in logs, and never echo them. Pull requests from forks must not receive secrets.</p>
<h4>Things interviewers like to hear</h4>
<ul>
<li>A frontend cannot hold secrets. Calls that need a key go through your backend.</li>
<li>Caching vault values is fine. Plan how the app reloads after rotation (refresh interval or restart).</li>
<li>Connection strings are secrets when they carry passwords. Passwordless is the goal.</li>
<li>Detection matters: alert on vault access from new identities and on spikes in secret reads.</li>
</ul>
<div class="callout idea">A useful test for your design: if this laptop, this repo or this build log were posted publicly tomorrow, what would you have to rotate? The ideal answer is "nothing".</div>` }
  ],
  flow: {
    title: 'How an app gets a database connection with no stored password',
    steps: [
      { title: 'App starts', desc: `The app runs in the cloud with a managed identity assigned to it. No password is in its code, image or config.` },
      { title: 'Asks the platform', desc: `The Azure identity library asks the local platform endpoint: "give me a token that proves who I am".` },
      { title: 'Short-lived token', desc: `The platform returns a signed token for that identity. It expires soon and is renewed automatically.` },
      { title: 'Presents the token', desc: `The app sends the token to Key Vault (to read a secret) or straight to the database (to log in).` },
      { title: 'Access check', desc: `The service checks: is this identity allowed to read this one secret, or connect to this one database? Least privilege is enforced here.` },
      { title: 'Audit record', desc: `The read is written to an audit log: which identity, which secret, when, from where.` },
      { title: 'Rotation happens', desc: `Later the secret is rotated in the vault. Apps pick up the new version. Nobody edits code or redeploys with a new password.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: secrets in code and in committed config', code: `// VULNERABLE 1: hard-coded in source. Lives in Git history forever.
public class PaymentClient
{
    private const string ApiKey = "EXAMPLE-not-a-real-key";
    private const string Conn =
        "Server=prod-sql;Database=Shop;User Id=sa;Password=EXAMPLE_Passw0rd;";
}

// VULNERABLE 2: appsettings.json committed to the repository.
// {
//   "ConnectionStrings": {
//     "Default": "Server=prod-sql;Database=Shop;User Id=app;Password=EXAMPLE;"
//   },
//   "Jwt": { "SigningKey": "EXAMPLE-key" }
// }

// VULNERABLE 3: secrets written to logs.
public class Startup
{
    public void LogConfig(ILogger log, IConfiguration config)
    {
        // Dumps the password into a log system that many people can read.
        log.LogInformation("Using connection {Conn}", config.GetConnectionString("Default"));
    }
}

// VULNERABLE 4: baked into a Docker image.
//   ENV Payments__ApiKey=EXAMPLE-not-a-real-key
// Anyone who can pull the image can read this layer.

// VULNERABLE 5: put in Angular environment.ts.
// Everything in a frontend bundle is public. Call your own backend
// and let the backend hold the key.` },
    { lang: 'csharp', title: 'Fixed: layered config, Key Vault, and passwordless access with a managed identity', code: `// NuGet: Azure.Identity, Azure.Extensions.AspNetCore.Configuration.Secrets,
//        Azure.Storage.Blobs, Microsoft.Data.SqlClient
using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.Data.SqlClient;

var builder = WebApplication.CreateBuilder(args);

// Local development: values come from "dotnet user-secrets" (outside the repo).
// CreateBuilder already loads user-secrets when the environment is Development.

// Test and production: load secrets from Key Vault at start-up.
// DefaultAzureCredential uses the managed identity in the cloud
// and your developer login on your laptop. No vault password anywhere.
if (!builder.Environment.IsDevelopment())
{
    var vaultUri = new Uri(builder.Configuration["KeyVault:Uri"]!);   // not a secret
    builder.Configuration.AddAzureKeyVault(vaultUri, new DefaultAzureCredential());
}

// Code reads config the same way in every environment.
// A vault secret named "Payments--ApiKey" appears as "Payments:ApiKey".
builder.Services.AddOptions<PaymentOptions>()
    .Bind(builder.Configuration.GetSection("Payments"))
    .Validate(o => !string.IsNullOrWhiteSpace(o.ApiKey), "Payments:ApiKey is missing")
    .ValidateOnStart();                       // fail fast, without printing the value

// Even better: no secret at all.
// SQL: the connection string has no password. The managed identity logs in.
builder.Services.AddScoped(_ => new SqlConnection(
    "Server=tcp:shop-sql.database.windows.net;Database=Shop;" +
    "Authentication=Active Directory Default;Encrypt=True;"));

// Blob storage: identity instead of an account key.
builder.Services.AddSingleton(new BlobServiceClient(
    new Uri("https://shopfiles.blob.core.windows.net"), new DefaultAzureCredential()));

var app = builder.Build();
app.Run();

public class PaymentOptions
{
    public string ApiKey { get; set; } = "";
    // Never override ToString() to include ApiKey, and never log this object.
}` },
    { lang: 'bash', title: 'Daily habits: user-secrets, .gitignore, scanning, and the leak drill', code: `# --- Local development: keep secrets out of the project folder ---
dotnet user-secrets init
dotnet user-secrets set "Payments:ApiKey" "test-key-from-sandbox"
dotnet user-secrets list

# --- .gitignore entries every repo should have ---
cat >> .gitignore <<'EOF'
.env
.env.*
appsettings.*.local.json
*.pfx
*.pem
*.key
*.publishsettings
secrets.json
EOF

# --- Scan for secrets before they are committed ---
# gitleaks is one popular open-source scanner (check its current docs for flags).
gitleaks detect --source . --redact        # scan the repo and its history
# Wire it into a pre-commit hook so a bad commit is refused on your machine,
# and run it again in CI as a backstop. Also enable push protection on your Git host.

# --- A secret was committed. What now? ---
# 1. ROTATE or REVOKE it at the provider first. This is the step that matters.
# 2. Check the provider's access logs for use you do not recognise.
# 3. Replace the value in code with a config lookup, store the new secret in the vault.
# 4. Optional tidy-up: rewrite history with a tool such as git filter-repo.
#    Clones, forks and caches may still hold the old value, which is why step 1 comes first.
# 5. Add a scanner rule so the same pattern is caught next time.` }
  ],
  pitfalls: [
    `Deleting a leaked secret from the file and moving on. It is still in Git history and in every clone. Rotate it.`,
    `Putting API keys in Angular environment files. Anything in a browser bundle is public.`,
    `Sharing one credential across services and environments. One leak then opens everything.`,
    `Logging configuration objects or full connection strings at start-up.`,
    `Storing the vault's own password in config. Use a managed identity so there is no secret zero.`,
    `Never practising rotation. The first time you rotate should not be during an incident.`
  ],
  checklist: [
    `Search the repo and its history for passwords, keys and tokens with a secret scanner.`,
    `Move every secret out of code and committed config into user-secrets (dev) or a vault (test and prod).`,
    `Use managed identities so apps reach the vault, database and storage without a stored password.`,
    `Give each service its own identity with access to only its own secrets.`,
    `Use separate vaults and credentials for production and non-production.`,
    `Add secret scanning as a pre-commit hook and as a pipeline step.`,
    `Set a rotation schedule and rehearse a rotation with no downtime.`,
    `Make sure no secret appears in logs, error pages, images or frontend bundles.`,
    `Write a short leak runbook: revoke, rotate, audit, clean up, prevent.`,
    `Alert on unusual vault access and on use of break-glass accounts.`
  ],
  quiz: [
    { q: `A developer committed an API key, noticed, deleted it and committed again. What must happen next?`, options: [`Nothing, because the latest commit no longer contains it`, `Rotate or revoke the key, because it is still in Git history`, `Make the repository private, so nobody else can read it`, `Rename the variable, so scanners no longer match the key`], answer: 1, why: `History keeps every version, and clones may already exist. Only changing the key removes the risk.` },
    { q: `Where should a secret API key for a payment provider live in an Angular + .NET app?`, options: [`In Angular's environment.ts, used only for production builds`, `In the Angular bundle, minified so it is hard to find`, `Only on the backend, loaded from a vault`, `In localStorage, set once after login`], answer: 2, why: `Everything sent to the browser is readable by users. The backend holds the key and makes the call.` },
    { q: `What problem does a managed identity solve?`, options: [`It makes the database faster by caching the login for each request`, `It lets the app reach the vault without a stored password`, `It encrypts source code so committed secrets cannot be read`, `It replaces HTTPS between the app and the vault with a private link`], answer: 1, why: `The platform gives the app an identity and short-lived tokens, so there is no first secret to protect.` },
    { q: `Why is rotating secrets useful even when no leak is known?`, options: [`It limits how long a stolen secret stays useful`, `It makes secrets longer and so harder to guess each time`, `It is only for compliance paperwork and has no security effect`, `It prevents SQL injection, because old passwords stop working`], answer: 0, why: `Leaks are often not noticed. Regular rotation shortens the window and proves you can rotate quickly in an emergency.` },
    { q: `Which is the weakest place for a production secret?`, options: [`A vault read by a managed identity`, `An environment variable set by the deployment platform`, `A constant in source code`, `A short-lived token issued at runtime`], answer: 2, why: `Source code spreads to many machines and keeps history forever. The other options are progressively better controlled.` },
    { q: `In the first hour after a leak, which action comes first?`, options: [`Rewrite Git history`, `Find out who made the mistake`, `Revoke or rotate the secret`, `Write the incident report`], answer: 2, why: `Only revocation stops the credential from working. Everything else can follow once the door is closed.` }
  ],
  takeaways: [
    `A secret in code is a secret shared with everyone who can ever see the code.`,
    `Use user-secrets locally and a vault in test and production. Code reads config the same way everywhere.`,
    `Managed identities remove the password completely. Prefer them wherever the service supports it.`,
    `One identity per service and environment keeps the blast radius small.`,
    `Rotate on a schedule so rotation is routine, not an emergency skill.`,
    `After a leak: revoke first, then audit, then clean up.`
  ],
  interview: [
    { q: `How do you manage secrets in a .NET application across environments?`, a: `<p>Configuration is layered, so code reads keys the same way everywhere. Locally I use <code>dotnet user-secrets</code>, which keeps values outside the repository. In test and production I load from a vault (for example Azure Key Vault) using a managed identity through <code>DefaultAzureCredential</code>, so no vault password exists. Where a service supports it (SQL, Storage, Service Bus) I use the identity directly and have no secret at all. Options are validated at start-up, and nothing secret is ever logged.</p>` },
    { q: `What is the "secret zero" problem?`, a: `<p>To fetch secrets from a vault, the application must authenticate to the vault. If that credential is a stored password, it becomes the one secret protecting all others, and you are back to the original problem. Platform identities solve this: the cloud or orchestrator vouches for the workload and issues short-lived tokens (managed identity, workload identity, instance roles), so there is no long-lived first secret to store.</p>` },
    { q: `A cloud access key was pushed to a public repository. Walk through your response.`, a: `<p>Immediately revoke the key and issue a new one. Then review the provider's audit logs for activity with the old key: new resources, users, keys, data access. Assess what the key could reach and check those systems. Remove the key from code, store the replacement in the vault, redeploy. Optionally rewrite history, knowing it does not undo exposure. Finally add prevention: secret scanning with push protection, and move that workload to an identity-based login so no key is needed.</p>` },
    { q: `Are environment variables a safe place for secrets?`, a: `<p>They are better than source code, because they are not committed. But they have limits: any process running as the same user can read them, they appear in deployment definitions and crash dumps, they are not audited, and rotation means redeploying. They are acceptable when injected at runtime by the platform from a vault. For production, a vault with identity-based access gives access control, audit and rotation that plain environment variables cannot.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-tokens — Secure Sessions, JWT & OAuth Pitfalls                  */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-tokens'] = {
  hook: `A token is a key that works for anyone who holds it. Most token bugs come from forgetting that one sentence.`,
  intro: `<p>After a user logs in, your app needs a way to remember them on the next request. There are two common ways. A <span class="term">session cookie</span> holds a random ID, and the server keeps the real data. A <span class="term">token</span>, most often a <span class="term">JWT</span> (JSON Web Token), carries the data inside itself, protected by a signature.</p>
<p>Tokens are popular because any server can check them without a database lookup. But they are easy to get wrong. If the server does not check the signature properly, anyone can write their own token. If a token lives for months, a stolen one works for months. If it is stored where scripts can read it, one XSS bug gives it away.</p>
<p><span class="term">OAuth 2.0</span> and <span class="term">OpenID Connect (OIDC)</span> are the standard ways for an app to get tokens from a login provider such as Microsoft Entra ID, Google or Auth0. They are well designed, and they have a few steps that people skip with bad results.</p>
<p>This lesson is a tour of the usual mistakes and the correct setup for an Angular app talking to an ASP.NET Core API.</p>`,
  realLife: {
    title: 'The concert wristband',
    body: `<p>At a concert, the gate staff check your ticket and ID once, then put a wristband on you. After that, nobody asks for your ID again. The wristband is the proof. That is a token.</p>
<p>Now think about what makes a wristband safe. It has a pattern that is hard to copy (the signature). It names the event and the date, so a wristband from last week or from another venue is refused (issuer, audience and expiry). It works for one day only (short lifetime). And if someone cuts it off and hands it to a friend, the friend gets in, because the staff check the band and not the person (bearer token). That last point is why you guard it.</p>
<p>A VIP band that lets you backstage is a different colour (scopes). Staff at the backstage door must check the colour, not just that a band exists.</p>
<p><strong>How this showed up in the real world:</strong> in 2015, security researchers showed that several widely used JWT libraries accepted tokens whose header said the algorithm was "none", meaning no signature at all, and that some could be tricked into checking an RSA-signed token as if it were HMAC-signed with the public key. Apps using those libraries would accept tokens anyone could write. The libraries were fixed, and the lesson stuck: the server must decide which algorithm is allowed, never the token.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Session cookie or token?</h4>
<div class="compare"><div><h5>Session cookie</h5><p>The browser holds a random ID. The server looks it up in a session store.</p><ul><li>Easy to cancel: delete the session on the server.</li><li>The browser sends it automatically, so you need CSRF protection.</li><li>Needs a shared store when you have many servers.</li></ul></div><div><h5>JWT access token</h5><p>The token carries the user's ID and claims, signed by the issuer.</p><ul><li>Any API can verify it without a lookup.</li><li>Hard to cancel before it expires.</li><li>Must be stored carefully in the browser.</li></ul></div></div>
<p>Neither is "more secure". They have different trade-offs. Many good systems use both: a cookie between browser and backend, and tokens between backend services.</p>
<h4>What is inside a JWT?</h4>
<p>A JWT has three parts separated by dots:</p>
<ol>
<li><strong>Header:</strong> which algorithm signed it, for example RS256.</li>
<li><strong>Payload:</strong> the <span class="term">claims</span>. Who the user is (<code>sub</code>), who issued it (<code>iss</code>), who it is for (<code>aud</code>), when it expires (<code>exp</code>).</li>
<li><strong>Signature:</strong> a value made from the first two parts and a key. Change one letter of the payload and the signature no longer matches.</li>
</ol>
<div class="callout warn">The payload is only encoded with Base64, not encrypted. Anyone holding the token can read it. Never put passwords, card numbers or other private data in a JWT.</div>
<h4>The five checks</h4>
<p>When your API receives a token, it must check all of these. Missing any one is a real vulnerability.</p>
<table><thead><tr><th>Check</th><th>Question it answers</th></tr></thead><tbody>
<tr><td>Signature</td><td>Was this really made by the issuer, and not edited?</td></tr>
<tr><td>Algorithm</td><td>Was it signed with the algorithm I expect?</td></tr>
<tr><td>Issuer (iss)</td><td>Did it come from my login provider?</td></tr>
<tr><td>Audience (aud)</td><td>Was it made for my API, and not for some other app?</td></tr>
<tr><td>Expiry (exp)</td><td>Is it still valid right now?</td></tr>
</tbody></table>
<p>In ASP.NET Core the JwtBearer middleware does all five when you configure it properly. The bugs come from switching checks off "to make it work in dev" and never switching them back on.</p>
<div class="callout tip">Keep access tokens short-lived: minutes, not days. A stolen wristband that expires tonight is a small problem.</div>` },
    { name: 'Intermediate', body: `<h4>Common JWT mistakes</h4>
<ul>
<li><strong>Decoding without validating.</strong> Reading claims from a token with a decode function and trusting them. Decoding is not verifying.</li>
<li><strong>Letting the token choose the algorithm.</strong> Pin the allowed algorithms on the server. Reject "none".</li>
<li><strong>Weak HMAC secret.</strong> With HS256, a short or guessable secret can be found by trying candidates offline. Use a long random key, or use asymmetric signing (RS256/ES256) where APIs only hold the public key.</li>
<li><strong>Skipping audience.</strong> A token issued for another API in your company should not work on yours.</li>
<li><strong>Long lifetimes with no way to revoke.</strong></li>
<li><strong>Trusting claims for decisions the server should check.</strong> A role claim says what the user was at issue time. For sensitive actions, check current state.</li>
</ul>
<h4>Where to keep tokens in a browser app</h4>
<table><thead><tr><th>Place</th><th>Risk</th></tr></thead><tbody>
<tr><td>localStorage / sessionStorage</td><td>Any script on the page can read it. One XSS bug or one bad third-party script steals the token.</td></tr>
<tr><td>JavaScript memory only</td><td>Harder to steal, but lost on page refresh.</td></tr>
<tr><td>HttpOnly, Secure, SameSite cookie</td><td>Script cannot read it. Needs CSRF protection because the browser sends it automatically.</td></tr>
</tbody></table>
<p>A solid pattern for an Angular app: keep the short-lived access token in memory, and keep the <span class="term">refresh token</span> in an HttpOnly cookie that is only sent to the refresh endpoint.</p>
<h4>Refresh token rotation</h4>
<p>A refresh token is a long-lived credential used to get new access tokens. Protect it more than anything else:</p>
<ol>
<li>Store only a hash of it on the server.</li>
<li>Each time it is used, issue a new one and mark the old one as used. This is <span class="term">rotation</span>.</li>
<li>If a used token shows up again, someone copied it. Revoke the whole token family and force a new login. This is <span class="term">reuse detection</span>.</li>
<li>On logout or password change, revoke the family.</li>
</ol>
<h4>OAuth and OIDC in plain words</h4>
<p>Your app sends the user to the login provider. The user logs in there, so your app never sees the password. The provider sends the browser back to your app with a one-time <span class="term">authorization code</span>. Your app swaps the code for tokens. This is the <span class="term">authorization code flow</span>.</p>
<p><span class="term">PKCE</span> (said "pixie") protects that swap. Before the redirect, the app makes a random secret and sends only its hash. When swapping the code, it must present the original secret. A stolen code is useless without it. Use PKCE for every client type today.</p>` },
    { name: 'Expert', body: `<h4>OAuth mistakes that cause real breaches</h4>
<ul>
<li><strong>Loose redirect URI matching.</strong> The provider must send codes only to exact, pre-registered redirect URIs. Wildcards or prefix matches let an attacker receive the code on a page they control.</li>
<li><strong>No <code>state</code> check.</strong> The app sends a random <code>state</code> value and must verify it on return. Without it, an attacker can inject their own login response (login CSRF).</li>
<li><strong>No <code>nonce</code> check</strong> on ID tokens, which allows replay of an old token.</li>
<li><strong>Implicit flow.</strong> It returned tokens in the URL. It is considered legacy. Use authorization code with PKCE.</li>
<li><strong>Confusing ID tokens and access tokens.</strong> The ID token tells the client who logged in. The access token is for calling an API. An API must not accept ID tokens.</li>
<li><strong>Broad scopes.</strong> Ask for the minimum. An API must check that the token carries the scope needed for each endpoint.</li>
<li><strong>Trusting an email claim as identity.</strong> Use the stable subject identifier together with the issuer. Emails change and may be unverified.</li>
</ul>
<h4>The BFF pattern</h4>
<p>In the <span class="term">Backend for Frontend</span> pattern, the browser never holds tokens. A small server-side component runs the OAuth flow as a confidential client, stores tokens server-side, and gives the browser an HttpOnly, SameSite session cookie. The Angular app calls the BFF, which attaches the access token and forwards the call to the API. XSS can no longer steal tokens, and CSRF is handled with SameSite plus an anti-forgery header. Current guidance for browser-based apps recommends this pattern for sensitive applications.</p>
<h4>Revocation strategies</h4>
<p>JWTs are valid until they expire. Options, from simple to strict:</p>
<ol>
<li>Very short access token lifetime (5 to 15 minutes) plus refresh rotation. Revoking the refresh token ends the session within minutes.</li>
<li>A token version or security stamp on the user record, checked on sensitive operations.</li>
<li>A small deny-list of revoked token IDs (<code>jti</code>) kept in a cache until those tokens expire.</li>
<li>Opaque reference tokens that the API checks with the issuer on each call (introspection). Fully revocable, at the cost of a lookup.</li>
</ol>
<h4>Key management for signing</h4>
<p>Prefer asymmetric keys. The identity provider holds the private key, and APIs fetch public keys from the provider's JWKS endpoint, found through OIDC discovery. Keys are identified by <code>kid</code> and rotated on a schedule. Setting <code>Authority</code> in JwtBearer does all of this for you, including picking up new keys. Never share an HMAC secret across many services: any holder can mint tokens.</p>
<h4>Sender-constrained tokens</h4>
<p>A bearer token works for whoever holds it. Newer mechanisms such as DPoP and mutual TLS bind a token to a key held by the client, so a stolen token alone is not enough. Worth knowing for high-value APIs.</p>
<h4>Cookie session hygiene</h4>
<p>If you use cookie sessions: regenerate the session ID at login (prevents session fixation), set absolute and idle timeouts, use the <code>__Host-</code> cookie name prefix to lock the cookie to your exact host, and invalidate the session server-side at logout.</p>
<div class="callout idea">Interview one-liner: "Authenticate at a trusted provider, validate every token fully, keep access tokens short, rotate refresh tokens, and keep tokens away from JavaScript where you can."</div>` }
  ],
  flow: {
    title: 'Login with authorization code + PKCE, then calling the API',
    steps: [
      { title: 'App prepares', desc: `The app creates a random code verifier, a state value and a nonce. It keeps them and computes a hash of the verifier.` },
      { title: 'Redirect to provider', desc: `The browser goes to the login provider with the client ID, exact redirect URI, requested scopes, state, nonce and the verifier hash.` },
      { title: 'User logs in there', desc: `Password and MFA happen at the provider. Your app never sees the password.` },
      { title: 'Code comes back', desc: `The provider redirects to your registered URI with a one-time code and the state. The app checks the state matches.` },
      { title: 'Code is swapped', desc: `The app (or BFF) sends the code plus the original verifier. The provider checks the hash and returns an access token, ID token and refresh token.` },
      { title: 'API call', desc: `The access token is sent in the Authorization header. It lives only a few minutes.` },
      { title: 'API validates', desc: `Signature with the provider's public key, pinned algorithm, issuer, audience, expiry, then the scope needed for this endpoint.` },
      { title: 'Silent refresh', desc: `When the access token expires, the refresh token is rotated for a new pair. A reused refresh token revokes the whole family.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: validation switched off, weak key, decode-and-trust', code: `using System.IdentityModel.Tokens.Jwt;
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

// VULNERABLE 1: every check that matters is disabled.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        o.RequireHttpsMetadata = false;
        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = false,            // tokens from anyone
            ValidateAudience = false,          // tokens meant for other apps
            ValidateLifetime = false,          // expired tokens work forever
            // Guessable HMAC secret (plain words), also committed in source code:
            IssuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes("this-is-my-jwt-secret-key-change-me-later"))
        };
    });

// VULNERABLE 2: decoding is not validating.
// ReadJwtToken only parses the text. It does NOT check the signature.
app.MapGet("/bad/me", (HttpRequest req) =>
{
    string raw = req.Headers.Authorization.ToString().Replace("Bearer ", "");
    var jwt = new JwtSecurityTokenHandler().ReadJwtToken(raw);
    string role = jwt.Claims.First(c => c.Type == "role").Value;   // attacker-written
    return role == "admin" ? Results.Ok("secret admin data") : Results.Forbid();
});

// VULNERABLE 3: token that lives a year and carries private data.
var descriptor = new SecurityTokenDescriptor
{
    Expires = DateTime.UtcNow.AddYears(1),
    Claims = new Dictionary<string, object>
    {
        ["sub"] = user.Id,
        ["passwordHash"] = user.PasswordHash,      // readable by anyone with the token
        ["cardNumber"] = user.CardNumber
    }
};` },
    { lang: 'csharp', title: 'Fixed: full JWT validation with a pinned algorithm, plus scope policies', code: `using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(o =>
    {
        // Authority: the login provider. Signing keys are fetched from its
        // discovery document and refreshed automatically when they rotate.
        o.Authority = "https://login.example.com/";
        o.Audience = "orders-api";                   // this API's own identifier
        o.MapInboundClaims = false;                  // keep claim names as issued

        o.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidateAudience = true,
            ValidateLifetime = true,
            ValidateIssuerSigningKey = true,
            RequireSignedTokens = true,
            RequireExpirationTime = true,
            ValidAlgorithms = new[] { SecurityAlgorithms.RsaSha256 },  // server decides, not the token
            ClockSkew = TimeSpan.FromSeconds(30)     // default is 5 minutes, tighten it
        };
    });

builder.Services.AddAuthorization(o =>
{
    // Every endpoint needs a logged-in user unless it says otherwise.
    o.FallbackPolicy = new Microsoft.AspNetCore.Authorization.AuthorizationPolicyBuilder()
        .RequireAuthenticatedUser().Build();

    // Scopes: a valid token is not enough. It must carry the right permission.
    o.AddPolicy("orders.read", p => p.RequireAssertion(ctx =>
        (ctx.User.FindFirst("scope")?.Value ?? "").Split(' ').Contains("orders.read")));
});

var app = builder.Build();
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

// Claims come from the VALIDATED principal, never from hand-decoding the header.
app.MapGet("/orders", (System.Security.Claims.ClaimsPrincipal user, OrderService svc) =>
{
    string userId = user.FindFirst("sub")!.Value;
    return svc.GetForUserAsync(userId);              // also filter by owner in the query
}).RequireAuthorization("orders.read");

app.Run();` },
    { lang: 'csharp', title: 'Refresh token rotation with reuse detection, delivered in an HttpOnly cookie', code: `using System.Security.Cryptography;
using System.Text;
using Microsoft.EntityFrameworkCore;

public class RefreshToken
{
    public Guid Id { get; set; }
    public string TokenHash { get; set; } = "";   // never store the raw token
    public Guid FamilyId { get; set; }            // all tokens from one login share this
    public string UserId { get; set; } = "";
    public DateTime ExpiresAt { get; set; }
    public DateTime? UsedAt { get; set; }
    public DateTime? RevokedAt { get; set; }
}

public class RefreshService(AppDb db, TimeProvider clock)
{
    public async Task<(string UserId, string NewToken)?> RotateAsync(string presented)
    {
        DateTime now = clock.GetUtcNow().UtcDateTime;
        string hash = Hash(presented);
        var stored = await db.RefreshTokens.SingleOrDefaultAsync(t => t.TokenHash == hash);

        if (stored is null || stored.RevokedAt != null || stored.ExpiresAt <= now)
            return null;

        if (stored.UsedAt != null)
        {
            // This token was already exchanged once. Someone has a copy.
            // Revoke the whole family: both the thief and the user must log in again.
            await db.RefreshTokens
                .Where(t => t.FamilyId == stored.FamilyId && t.RevokedAt == null)
                .ExecuteUpdateAsync(s => s.SetProperty(t => t.RevokedAt, now));
            return null;
        }

        stored.UsedAt = now;
        string next = Convert.ToBase64String(RandomNumberGenerator.GetBytes(32));
        db.RefreshTokens.Add(new RefreshToken
        {
            Id = Guid.NewGuid(), TokenHash = Hash(next), FamilyId = stored.FamilyId,
            UserId = stored.UserId, ExpiresAt = now.AddDays(14)
        });
        await db.SaveChangesAsync();
        return (stored.UserId, next);
    }

    private static string Hash(string token) =>
        Convert.ToHexString(SHA256.HashData(Encoding.UTF8.GetBytes(token)));

    // Script cannot read it, HTTPS only, never sent cross-site, only sent to the refresh path.
    public static CookieOptions CookieOptions(DateTimeOffset expires) => new()
    {
        HttpOnly = true, Secure = true, SameSite = SameSiteMode.Strict,
        Path = "/api/auth", Expires = expires
    };
}` }
  ],
  pitfalls: [
    `Turning off ValidateIssuer, ValidateAudience or ValidateLifetime "for development" and shipping that config.`,
    `Reading claims by decoding the token yourself. Use the validated ClaimsPrincipal from the middleware.`,
    `Putting personal or secret data in the JWT payload. It is readable by anyone who holds the token.`,
    `Storing long-lived tokens in localStorage, where any XSS bug can read them.`,
    `Access tokens that last days or weeks with no revocation plan.`,
    `Registering wildcard redirect URIs, or skipping the state check, in an OAuth client.`
  ],
  checklist: [
    `Validate signature, issuer, audience and lifetime on every token. Never disable a check.`,
    `Pin the allowed signing algorithms on the server with ValidAlgorithms.`,
    `Prefer asymmetric signing and load keys from the provider's discovery endpoint via Authority.`,
    `Keep access tokens to minutes. Reduce ClockSkew from the 5 minute default.`,
    `Keep private data out of token payloads.`,
    `Rotate refresh tokens on every use, store only hashes, and revoke the family on reuse.`,
    `Keep tokens out of localStorage. Use memory plus an HttpOnly refresh cookie, or a BFF.`,
    `Use authorization code flow with PKCE. Register exact redirect URIs and verify state and nonce.`,
    `Check the required scope or role on each endpoint, not just that a token exists.`,
    `Revoke sessions on logout, password change and suspected theft.`
  ],
  quiz: [
    { q: `Can someone who holds a JWT read its payload?`, options: [`No, the payload is encrypted with the signing key`, `Yes, it is only Base64-encoded, not encrypted`, `Only with the signing key that the issuer holds`, `Only after it expires, when the signature is dropped`], answer: 1, why: `A standard signed JWT protects integrity, not secrecy. That is why private data must stay out of it.` },
    { q: `Why must the server pin the allowed signing algorithm?`, options: [`To make validation faster, because fewer algorithms are tried`, `Otherwise the token header could pick no signature or a weaker check`, `Because RS256 is deprecated and servers must block it explicitly`, `To support more browsers, since each browser signs tokens in a different way`], answer: 1, why: `The header is written by whoever made the token. Letting it choose the algorithm lets an attacker choose how they are checked.` },
    { q: `An API accepts any validly signed token from the company login provider and does not check the audience. What is the risk?`, options: [`None, because a valid signature already proves the token is for this API`, `A token issued for a different application can be used on this API`, `Tokens will expire too early, because the audience sets the lifetime`, `The API will be slower, because it must look up the audience each time`], answer: 1, why: `Audience says who the token is for. Without the check, a token obtained for a low-value app works against a high-value one.` },
    { q: `What does refresh token reuse detection do?`, options: [`Lets one refresh token be shared by all of a user's devices for convenience`, `Spots a used refresh token being presented again and revokes its family`, `Makes access tokens longer-lived, so refresh calls are needed less often`, `Stores tokens in localStorage, so a repeated login can be noticed`], answer: 1, why: `With rotation, each refresh token is valid once. A second use means a copy exists, so the safe response is to end that session everywhere.` },
    { q: `What does PKCE protect against?`, options: [`Weak passwords being guessed on the provider's login page`, `A stolen authorization code being swapped for tokens`, `SQL injection in the login form of the provider`, `Expired certificates being accepted on the token endpoint`], answer: 1, why: `The exchange needs the original code verifier that only the real client has, so an intercepted code is useless.` },
    { q: `Which storage choice exposes a token most directly to an XSS bug?`, options: [`HttpOnly cookie`, `Server-side session in a BFF`, `localStorage`, `Memory in a closure`], answer: 2, why: `Any script running on the page can read localStorage. HttpOnly cookies and server-side storage cannot be read by script.` }
  ],
  takeaways: [
    `A bearer token works for whoever holds it. Keep it short-lived and hard to steal.`,
    `Validate everything: signature, pinned algorithm, issuer, audience, expiry.`,
    `Decoding is not validating. Only trust claims from the validated principal.`,
    `JWT payloads are readable. No secrets inside.`,
    `Rotate refresh tokens and revoke the family on reuse.`,
    `Use authorization code + PKCE with exact redirect URIs, state and nonce. Consider a BFF for browser apps.`
  ],
  interview: [
    { q: `How do you validate a JWT in an ASP.NET Core API?`, a: `<p>Use the JwtBearer middleware with <code>Authority</code> set to the identity provider and <code>Audience</code> set to the API's identifier. The middleware downloads signing keys from the discovery document, then checks signature, issuer, audience and lifetime. I pin <code>ValidAlgorithms</code>, require signed tokens and an expiry, and reduce <code>ClockSkew</code>. Authorization policies then check scopes or roles per endpoint, and data queries are still filtered by the user's ID.</p>` },
    { q: `Where should a single-page app store tokens?`, a: `<p>Not in localStorage, because any XSS can read it. Reasonable options: access token in memory with the refresh token in an HttpOnly, Secure, SameSite cookie scoped to the refresh endpoint, or, stronger, the BFF pattern where tokens stay on the server and the browser only holds an HttpOnly session cookie. With cookies you add CSRF protection. With any option you still fix XSS, because script can act as the user while the page is open.</p>` },
    { q: `How do you revoke a JWT before it expires?`, a: `<p>You cannot change a token that is already issued, so you design around it. Keep access tokens very short and control sessions through refresh tokens, which are stored server-side and can be revoked. For immediate effect on sensitive actions, check a security stamp or token version on the user, or keep a small deny-list of token IDs in a cache until they expire. If instant revocation everywhere is required, use opaque reference tokens with introspection.</p>` },
    { q: `Explain the authorization code flow with PKCE and why the implicit flow is discouraged.`, a: `<p>The client redirects the user to the provider with a code challenge (hash of a random verifier), state and nonce. After login, the provider returns a one-time code to the registered redirect URI. The client exchanges the code together with the verifier for tokens over a back-channel request. PKCE ensures only the party that started the flow can redeem the code. The implicit flow returned tokens in the browser URL, where they leak through history, logs and referrers, and it offered no protection for the exchange, so current guidance replaces it with code + PKCE.</p>` },
    { q: `What is the difference between an ID token and an access token?`, a: `<p>The ID token is for the client application. It says who logged in and how, and its audience is the client. The access token is for a resource API. Its audience is the API and it carries scopes. APIs must accept only access tokens meant for them. Using an ID token to call an API, or reading user identity from an access token on the client, mixes up the two roles and leads to audience and trust bugs.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-files-ssrf — File Uploads, Deserialization, SSRF & XXE          */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-files-ssrf'] = {
  hook: `Your app happily opens files, rebuilds objects and fetches links for its users. Each favour is a door if you do not check who is asking and for what.`,
  intro: `<p>Some features ask your server to <em>process</em> something the user provides: save a file, turn bytes back into an object, download a URL, or parse an XML document. These are powerful actions, and each has a well-known way to go wrong.</p>
<p><strong>File upload:</strong> the user sends a file that is not what it claims to be, is far too big, or has a name designed to land somewhere dangerous.</p>
<p><strong>Insecure deserialization:</strong> <span class="term">deserialization</span> means rebuilding an object from stored or transmitted bytes. Some formats let the data say <em>which class</em> to create. An attacker then picks a class that does harmful things while being built.</p>
<p><strong>SSRF</strong> (server-side request forgery): your server fetches a URL chosen by the user. The attacker points it at addresses only your server can reach, such as internal admin pages or the cloud metadata service.</p>
<p><strong>XXE</strong> (XML external entity): an XML document tells the parser to load another file or URL and include it. A carelessly configured parser obeys.</p>
<p>The common thread: data is telling your server what to do. In each case the fix is to take that power away and decide for yourself.</p>`,
  realLife: {
    title: 'The helpful office assistant',
    body: `<p>Picture a very helpful assistant at a company's front desk. Visitors can hand over parcels, and the assistant stores them. Visitors can also ask, "Could you fetch a document for me?", and the assistant walks into the back office and brings it.</p>
<p>A parcel labelled "books" might hold something else, so a careful assistant opens and checks it, puts on their own label, and stores it in the visitor locker, never on the director's desk (safe upload). A flat-pack box with instructions saying "assemble me and plug me into the server room" should not be followed just because the note is inside the box (deserialization). And when a visitor says "please fetch the folder from the HR cabinet", the assistant must refuse, because the visitor is using the assistant's staff badge to reach a room visitors cannot enter (SSRF).</p>
<p><strong>How this showed up in the real world:</strong> in 2019 the bank Capital One disclosed a breach affecting around 100 million people. According to public reports and court documents, the attacker used an SSRF weakness in a misconfigured web application firewall to make it call the cloud's internal metadata service, obtained temporary credentials for the role attached to that server, and used them to read storage buckets. One server fetching one internal URL was enough, because that role could read far more than it needed.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Safe file uploads: seven rules</h4>
<ol>
<li><strong>Limit the size.</strong> Set a maximum at the web server and in your code. Without it, one request can fill the disk.</li>
<li><strong>Allow-list the type.</strong> Decide which extensions you accept (for example jpg, png, pdf) and reject the rest.</li>
<li><strong>Check the content, not only the name.</strong> A file called <code>photo.jpg</code> can contain anything. Real file types start with known bytes called a <span class="term">signature</span> or magic number. Check them.</li>
<li><strong>Never use the user's file name on disk.</strong> Generate your own random name. Keep the original name only as text in the database, for display.</li>
<li><strong>Store outside the web root.</strong> Put files in blob storage or a folder the web server does not serve directly. Then an uploaded file can never be requested and executed as a page or script.</li>
<li><strong>Scan for malware</strong> before making the file available to others.</li>
<li><strong>Serve safely.</strong> Send downloads with a correct content type, <code>X-Content-Type-Options: nosniff</code>, and as an attachment where possible.</li>
</ol>
<div class="callout warn">The Content-Type header and the file extension are both written by the sender. Neither proves what the file is.</div>
<h4>SSRF in simple words</h4>
<p>Features such as "import picture from URL", "preview this link" or "call my webhook" make your server send a request to an address the user typed. Your server sits inside your network. It can reach things the public cannot: internal dashboards, databases, and the cloud <span class="term">metadata service</span>, a special local address that hands out the server's own credentials.</p>
<p>The defence is to restrict <em>where</em> your server will go: only <code>https</code>, only hosts on an allow-list when possible, and never private or local addresses.</p>
<h4>Deserialization in simple words</h4>
<p>JSON that maps to a class you chose is fine: <code>{"name":"Ana","age":30}</code> becomes your <code>Person</code> object. The danger is in formats or settings where the <em>data</em> names the type to create. Then the sender chooses which of the thousands of classes in your app gets built.</p>
<ul>
<li>Use <code>System.Text.Json</code> with your own DTO classes.</li>
<li>Never use <code>BinaryFormatter</code>. Microsoft marked it unsafe and removed it from modern .NET.</li>
</ul>
<h4>XXE in simple words</h4>
<p>XML has an old feature called a DTD that can define "entities" which pull in content from files or URLs. If your parser allows it, an uploaded XML file can make your server read its own files. Turn DTD processing off.</p>` },
    { name: 'Intermediate', body: `<h4>Upload details that matter</h4>
<ul>
<li><strong>Images:</strong> re-encode them with an image library (load, then save as a fresh PNG or JPEG). This strips hidden content and metadata and proves the file really is an image. Limit pixel dimensions too, because a tiny file can declare a gigantic image.</li>
<li><strong>SVG and HTML are code.</strong> An SVG can contain script. Do not accept them as "images" unless you sanitise them, and never serve user files from your main site's origin. Use a separate domain for user content.</li>
<li><strong>Office documents and PDFs</strong> can carry active content. Scan them and serve as downloads.</li>
<li><strong>Quota:</strong> limit files per user and total storage, or uploads become a denial-of-service tool.</li>
</ul>
<h4>Archives: zip bombs and zip slip</h4>
<p>A <span class="term">zip bomb</span> is a small archive that expands to an enormous size. A <span class="term">zip slip</span> is an archive whose entry names contain <code>../</code> so files are written outside the target folder. When you extract user archives: cap the number of entries, cap the total uncompressed size while you copy, and check every destination path with <code>Path.GetFullPath</code> before writing.</p>
<h4>Dangerous deserialization settings in .NET</h4>
<table><thead><tr><th>API / setting</th><th>Status</th></tr></thead><tbody>
<tr><td><code>BinaryFormatter</code>, <code>NetDataContractSerializer</code>, <code>SoapFormatter</code>, <code>LosFormatter</code></td><td>Unsafe with untrusted data. Do not use.</td></tr>
<tr><td>Newtonsoft.Json with <code>TypeNameHandling</code> set to anything but <code>None</code></td><td>Lets the JSON pick the type via <code>$type</code>. Unsafe on untrusted input.</td></tr>
<tr><td><code>System.Text.Json</code> to concrete DTOs</td><td>Safe by design. It does not create arbitrary types.</td></tr>
<tr><td><code>System.Text.Json</code> polymorphism</td><td>Safe when you list the allowed derived types with attributes.</td></tr>
</tbody></table>
<p>Also treat these as untrusted input: cookies, hidden form fields, cache entries and queue messages that other parties can write to. If you must accept serialized state from a client, sign it (for example with ASP.NET Core Data Protection) and verify before reading.</p>
<h4>Building an SSRF guard</h4>
<ol>
<li>Parse the URL. Allow only <code>https</code> (and the default port unless you need others).</li>
<li>If the feature allows, check the host against an allow-list. This is the strongest control.</li>
<li>Resolve the host name to IP addresses yourself.</li>
<li>Reject loopback, private, link-local and other internal ranges. The cloud metadata address <code>169.254.169.254</code> is in the link-local range.</li>
<li>Connect to the address you checked, so the name cannot resolve to something else a moment later.</li>
<li>Do not follow redirects automatically. Each redirect target must pass the same checks.</li>
<li>Set short timeouts and a response size limit. Do not return raw response bodies or detailed errors to the user.</li>
</ol>
<h4>Safe XML</h4>
<p>Create readers with <code>XmlReaderSettings</code> where <code>DtdProcessing = DtdProcessing.Prohibit</code> and <code>XmlResolver = null</code>. Modern .NET defaults are safe for the main APIs, but set these explicitly so intent is clear and old code paths are covered.</p>` },
    { name: 'Expert', body: `<h4>Why "check then fetch" can still fail: DNS rebinding</h4>
<p>If you resolve a host name, approve the IP, and then hand the name to an HTTP client, the client resolves it <em>again</em>. An attacker who controls the DNS server can answer with a public address the first time and an internal address the second time. This is <span class="term">DNS rebinding</span>, a time-of-check to time-of-use gap. Close it by connecting to the exact IP you validated. In .NET, <code>SocketsHttpHandler.ConnectCallback</code> lets you resolve, validate and open the socket in one place, while TLS still verifies the certificate against the original host name.</p>
<h4>Tricks a URL validator must survive</h4>
<p>Do not validate URLs with string functions or regex. IP addresses can be written in decimal, octal, hex or IPv6-mapped forms. URLs can contain credentials before an @ sign. Different parsers disagree on odd inputs. Parse with <code>Uri</code>, then make the decision on the resolved <code>IPAddress</code> objects, including IPv6 and IPv4-mapped IPv6.</p>
<h4>Network-level defences</h4>
<p>Code checks are one layer. The stronger layer is architecture:</p>
<ul>
<li>Run URL-fetching features in a separate, isolated service with no route to internal networks.</li>
<li>Use egress rules or an outbound proxy with an allow-list, so the fetcher cannot reach internal addresses even if a check is bypassed.</li>
<li>Harden the metadata service: on AWS require IMDSv2 (session tokens, hop limit). On every cloud, give instance roles the smallest possible permissions. In the Capital One case, an over-privileged role turned an SSRF into a mass data breach.</li>
<li>Require authentication on internal services. "It is internal" is not access control.</li>
</ul>
<h4>How deserialization attacks work in principle</h4>
<p>Attackers do not need to upload code. They reuse classes already in your app or its libraries. Some classes do things in constructors, property setters or finalizers: open files, start processes, load assemblies. A chain of such classes, selected through type information in the payload, is called a <span class="term">gadget chain</span>. Because the set of loaded types is huge, deny-lists of "bad types" keep failing. The only reliable design is that data never chooses types: closed, explicit sets of DTOs, or a strict allow-list binder if polymorphism is unavoidable.</p>
<h4>XML beyond XXE</h4>
<ul>
<li><strong>Entity expansion ("billion laughs"):</strong> nested entities that expand to gigabytes. Prohibiting DTDs stops it. Also set <code>MaxCharactersInDocument</code>.</li>
<li><strong>XSLT</strong> can run script and load documents. Disable script and document functions in <code>XsltSettings</code> for untrusted stylesheets.</li>
<li><strong>XInclude and schema locations</strong> can trigger outbound fetches. Keep the resolver null.</li>
<li>Formats built on XML inherit these risks: SVG, DOCX/XLSX internals, SAML messages, SOAP.</li>
</ul>
<h4>Upload pipeline at scale</h4>
<p>A hardened design: the browser uploads directly to a quarantine container in blob storage using a short-lived, write-only URL. An event triggers a worker that checks size, signature and malware, re-encodes images, then moves the file to a clean container. Only then is it marked available. Downloads use short-lived read URLs on a separate user-content domain. The web app never touches raw untrusted bytes.</p>
<div class="callout idea">Interview pattern for all four bugs: name what the attacker controls, name the power the server lends them, then show how you remove that power (allow-list, isolation, least privilege).</div>` }
  ],
  flow: {
    title: 'An "import image from URL" request passing through an SSRF guard',
    steps: [
      { title: 'User submits a URL', desc: `The feature is "import profile picture from a link". The user sends any text they like as the link.` },
      { title: 'Parse and check scheme', desc: `The server parses it with Uri. Only https is accepted. file:, ftp:, gopher: and plain http are rejected.` },
      { title: 'Resolve the host', desc: `The server looks up the host name itself and gets a list of IP addresses.` },
      { title: 'Block internal ranges', desc: `Loopback, private, link-local (which includes the cloud metadata address) and unique-local IPv6 are refused. An internal target stops here.` },
      { title: 'Connect to the checked IP', desc: `The socket is opened to the exact address that passed the check, so a second DNS answer cannot redirect it.` },
      { title: 'No blind redirects', desc: `Automatic redirects are off. A redirect would have to go through all the checks again.` },
      { title: 'Limit and inspect', desc: `Short timeout, size cap, and the bytes must have an image signature. Then the image is re-encoded and stored under a random name.` },
      { title: 'Network backstop', desc: `Even if a check were bypassed, egress rules stop this service from reaching internal systems, and its role has minimal rights.` }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Fixed: a safe file upload endpoint (size, type, content, name, location)', code: `using Microsoft.AspNetCore.Mvc;

[ApiController, Route("api/files")]
public class FilesController(IFileScanner scanner, IConfiguration config, AppDb db) : ControllerBase
{
    private const long MaxBytes = 5 * 1024 * 1024;

    // Allowed extension -> the bytes a real file of that type starts with.
    private static readonly Dictionary<string, byte[]> Signatures = new()
    {
        [".png"] = new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A },
        [".jpg"] = new byte[] { 0xFF, 0xD8, 0xFF },
        [".pdf"] = new byte[] { 0x25, 0x50, 0x44, 0x46 }          // "%PDF"
    };

    [HttpPost, RequestSizeLimit(MaxBytes + 64 * 1024)]             // 1. size limit at the edge
    public async Task<IActionResult> Upload(IFormFile file, CancellationToken ct)
    {
        if (file is null || file.Length == 0 || file.Length > MaxBytes)
            return BadRequest("File is empty or too large.");

        // 2. Allow-list the extension (taken from the name, used only for this lookup).
        string ext = Path.GetExtension(file.FileName).ToLowerInvariant();
        if (!Signatures.TryGetValue(ext, out var magic))
            return BadRequest("File type not allowed.");

        // 3. Check the content really starts with that type's signature.
        await using var stream = file.OpenReadStream();
        var head = new byte[magic.Length];
        int read = await stream.ReadAsync(head, ct);
        if (read < magic.Length || !head.AsSpan().SequenceEqual(magic))
            return BadRequest("File content does not match its type.");
        stream.Position = 0;

        // 4. Our own random name. The user's name never touches the file system.
        string storedName = Guid.NewGuid().ToString("N") + ext;

        // 5. Outside the web root (better still: a private blob container).
        string folder = config["Uploads:Folder"]!;                 // e.g. /var/app-data/uploads
        string fullPath = Path.Combine(folder, storedName);
        await using (var target = new FileStream(fullPath, FileMode.CreateNew))
            await stream.CopyToAsync(target, ct);

        // 6. Malware scan before anyone else can download it.
        if (!await scanner.IsCleanAsync(fullPath, ct))
        {
            System.IO.File.Delete(fullPath);
            return BadRequest("File rejected.");
        }

        // 7. Keep the original name only as display text in the database.
        var record = new StoredFile(Guid.NewGuid(), storedName, Path.GetFileName(file.FileName), User.Identity!.Name!);
        db.Files.Add(record);
        await db.SaveChangesAsync(ct);
        return Ok(new { id = record.Id });
    }
}

public interface IFileScanner { Task<bool> IsCleanAsync(string path, CancellationToken ct); }
public record StoredFile(Guid Id, string StoredName, string DisplayName, string Owner);` },
    { lang: 'csharp', title: 'Vulnerable vs fixed: fetching a user-supplied URL (SSRF guard)', code: `using System.Net;
using System.Net.Sockets;

// VULNERABLE: the server fetches whatever address the user gives,
// including internal hosts and the cloud metadata service.
app.MapGet("/bad/preview", async (string url, HttpClient http) =>
    Results.Text(await http.GetStringAsync(url)));

// FIXED: validate the destination IP and connect to exactly that IP.
static bool IsInternal(IPAddress ip)
{
    if (ip.IsIPv4MappedToIPv6) ip = ip.MapToIPv4();
    if (IPAddress.IsLoopback(ip)) return true;
    if (ip.AddressFamily == AddressFamily.InterNetworkV6)
        return ip.Equals(IPAddress.IPv6Any)        // "::" can reach the local machine
            || ip.IsIPv6LinkLocal || ip.IsIPv6SiteLocal || ip.IsIPv6UniqueLocal || ip.IsIPv6Multicast;

    byte[] b = ip.GetAddressBytes();
    return b[0] == 0 || b[0] == 10 || b[0] == 127
        || (b[0] == 172 && b[1] >= 16 && b[1] <= 31)
        || (b[0] == 192 && b[1] == 168)
        || (b[0] == 169 && b[1] == 254)            // link-local, includes cloud metadata
        || (b[0] == 100 && b[1] >= 64 && b[1] <= 127)
        || b[0] >= 224;                            // multicast and reserved
}

var guardedHandler = new SocketsHttpHandler
{
    AllowAutoRedirect = false,                     // a redirect must be re-validated by us
    ConnectTimeout = TimeSpan.FromSeconds(5),
    ConnectCallback = async (ctx, ct) =>
    {
        // Resolve here, check here, connect here: no gap for DNS rebinding.
        IPAddress[] addresses = await Dns.GetHostAddressesAsync(ctx.DnsEndPoint.Host, ct);
        if (addresses.Length == 0 || addresses.Any(IsInternal))
            throw new HttpRequestException("Destination not allowed.");

        var socket = new Socket(SocketType.Stream, ProtocolType.Tcp) { NoDelay = true };
        try
        {
            await socket.ConnectAsync(new IPEndPoint(addresses[0], ctx.DnsEndPoint.Port), ct);
            return new NetworkStream(socket, ownsSocket: true);
        }
        catch { socket.Dispose(); throw; }
    }
};
var guarded = new HttpClient(guardedHandler)
{
    Timeout = TimeSpan.FromSeconds(10),
    MaxResponseContentBufferSize = 2 * 1024 * 1024   // cap the response size
};

app.MapGet("/good/preview", async (string url) =>
{
    if (!Uri.TryCreate(url, UriKind.Absolute, out var uri) || uri.Scheme != Uri.UriSchemeHttps || !uri.IsDefaultPort)
        return Results.BadRequest("Only https links on the default port are allowed.");

    // Strongest option when the feature permits: if (!AllowedHosts.Contains(uri.Host)) reject.
    try
    {
        using var resp = await guarded.GetAsync(uri);
        return resp.IsSuccessStatusCode
            ? Results.Ok(new { length = resp.Content.Headers.ContentLength })   // return facts, not the raw body
            : Results.BadRequest("Could not fetch that link.");
    }
    catch (HttpRequestException) { return Results.BadRequest("Could not fetch that link."); }   // no internal details
});` },
    { lang: 'csharp', title: 'Deserialization, XML and archives: unsafe settings vs safe settings', code: `using System.IO.Compression;
using System.Text.Json;
using System.Xml;

// ---------- JSON ----------
// VULNERABLE (Newtonsoft.Json): the payload can name any type through "$type".
//   var settings = new JsonSerializerSettings { TypeNameHandling = TypeNameHandling.All };
//   object o = JsonConvert.DeserializeObject(body, settings);
// VULNERABLE: BinaryFormatter on untrusted bytes. Unsafe by design, removed from modern .NET.

// FIXED: System.Text.Json into a concrete DTO that YOU chose. Data cannot pick the type.
public record ImportRequest(string Name, int Quantity);

static ImportRequest? ParseImport(string body) =>
    JsonSerializer.Deserialize<ImportRequest>(body, new JsonSerializerOptions
    {
        PropertyNameCaseInsensitive = true,
        MaxDepth = 16                                  // stop deeply nested payloads
    });

// ---------- XML ----------
// FIXED: no DTDs, no external resolver, size limit. Blocks XXE and entity expansion.
static XmlReader SafeXml(Stream input) => XmlReader.Create(input, new XmlReaderSettings
{
    DtdProcessing = DtdProcessing.Prohibit,
    XmlResolver = null,
    MaxCharactersInDocument = 5_000_000
});

// ---------- ZIP ----------
// FIXED: guard against zip slip (../ in names) and zip bombs (huge expansion).
static void SafeExtract(Stream zip, string targetDir, long maxTotalBytes = 100_000_000, int maxEntries = 500)
{
    string root = Path.GetFullPath(targetDir + Path.DirectorySeparatorChar);
    using var archive = new ZipArchive(zip, ZipArchiveMode.Read);
    if (archive.Entries.Count > maxEntries) throw new InvalidDataException("Too many entries.");

    long total = 0;
    var buffer = new byte[81920];
    foreach (var entry in archive.Entries)
    {
        if (string.IsNullOrEmpty(entry.Name)) continue;                    // directory entry
        string dest = Path.GetFullPath(Path.Combine(root, entry.FullName));
        if (!dest.StartsWith(root, StringComparison.Ordinal))
            throw new InvalidDataException("Entry escapes the target folder.");

        Directory.CreateDirectory(Path.GetDirectoryName(dest)!);
        using var src = entry.Open();
        using var dst = new FileStream(dest, FileMode.CreateNew);
        int n;
        while ((n = src.Read(buffer, 0, buffer.Length)) > 0)
        {
            total += n;                                // count REAL bytes, not the declared size
            if (total > maxTotalBytes) throw new InvalidDataException("Archive too large when expanded.");
            dst.Write(buffer, 0, n);
        }
    }
}` }
  ],
  pitfalls: [
    `Trusting the file extension or the Content-Type header. Both are chosen by the sender. Check the actual bytes.`,
    `Saving uploads under the web root with the user's file name. That can make them directly reachable and lets names overwrite or escape.`,
    `Accepting SVG or HTML as harmless images and serving them from your main domain.`,
    `Validating a URL as text, then letting the HTTP client resolve the host again. DNS can answer differently the second time.`,
    `Leaving automatic redirects on in a URL fetcher. A public URL can redirect to an internal one.`,
    `Enabling TypeNameHandling in Newtonsoft.Json, or keeping BinaryFormatter alive, for convenience.`
  ],
  checklist: [
    `Set upload size limits at the server and in code, plus per-user quotas.`,
    `Allow-list extensions and verify file signatures. Re-encode images.`,
    `Store files under generated names, outside the web root or in private blob storage.`,
    `Scan uploads for malware before they become available. Serve user content from a separate domain.`,
    `Cap entry count and expanded size when extracting archives, and verify every destination path.`,
    `Deserialize only into concrete DTOs with System.Text.Json. Remove BinaryFormatter and TypeNameHandling.`,
    `For URL fetching: https only, resolve and block internal IP ranges, connect to the validated IP.`,
    `Disable automatic redirects, set timeouts and size caps, and return no raw fetch errors.`,
    `Restrict outbound network access for fetcher services and give their cloud role minimal rights.`,
    `Create XML readers with DtdProcessing.Prohibit and XmlResolver = null.`
  ],
  quiz: [
    { q: `A user uploads "invoice.pdf". Which check tells you most reliably that it is a PDF?`, options: [`The file extension in the uploaded name`, `The Content-Type header that the browser sent`, `The first bytes of the content match the PDF signature`, `The file size is in the normal range for a PDF`], answer: 2, why: `Name and header are supplied by the sender. The content signature is taken from the actual bytes.` },
    { q: `Why should uploaded files get a server-generated name and live outside the web root?`, options: [`It saves disk space, because random names are shorter`, `So a user-chosen name cannot overwrite files or be run as a page`, `It makes uploads faster, because the web server skips its own checks`, `Browsers require it before they will send a multipart upload`], answer: 1, why: `A random name removes path tricks and collisions. Storing outside the web root means the web server never executes or directly serves the raw file.` },
    { q: `What is the core problem in SSRF?`, options: [`The user's browser is tricked into sending a request to the server`, `The server sends a request to a destination the user chose`, `The database runs SQL text that the user typed into a URL field`, `A cookie is stolen when the server follows a link`], answer: 1, why: `The server can reach internal systems and metadata endpoints that outsiders cannot. Letting users pick the destination lends them that reach.` },
    { q: `Your SSRF check resolves the host, sees a public IP, then calls HttpClient with the original URL. What can go wrong?`, options: [`Nothing, because the name was already checked once`, `The client resolves the name again and may get an internal IP`, `HTTPS stops working, because the certificate was issued for the IP`, `The request is sent twice, once to each address that DNS returned`], answer: 1, why: `This is DNS rebinding. Connect to the IP you validated so check and use refer to the same address.` },
    { q: `Why is TypeNameHandling.All in Newtonsoft.Json dangerous on untrusted input?`, options: [`It makes every JSON payload too large for the parser to check`, `It lets the incoming data choose which .NET type is created`, `It disables HTTPS certificate checks during deserialization`, `It is slower than System.Text.Json, so requests can time out`], answer: 1, why: `When data selects the type, an attacker can pick classes that perform harmful actions while being constructed.` },
    { q: `Which XmlReaderSettings value blocks XXE?`, options: [`IgnoreWhitespace = true with IgnoreComments = true`, `DtdProcessing = DtdProcessing.Prohibit with XmlResolver = null`, `CloseInput = true with CheckCharacters = true`, `ConformanceLevel = ConformanceLevel.Fragment with Async = false`], answer: 1, why: `External entities are declared in a DTD and loaded by the resolver. Prohibiting DTDs and removing the resolver disables the feature.` }
  ],
  takeaways: [
    `Uploads: limit size, allow-list type, verify content, rename, store outside the web root, scan.`,
    `Never let data choose the type to create. Deserialize into DTOs you picked.`,
    `SSRF: your server's network position is the prize. Restrict where it may connect, in code and in the network.`,
    `Validate the resolved IP and connect to that IP. Do not follow redirects blindly.`,
    `Turn off DTDs and external resolvers in XML parsers.`,
    `Least privilege on the server's cloud role decides how bad a mistake becomes.`
  ],
  interview: [
    { q: `How would you design a secure file upload feature?`, a: `<p>Limit request size at the edge and in code. Accept an allow-list of extensions and verify the content signature. For images, re-encode. Generate a random stored name and keep the original only as display text. Store in private blob storage or outside the web root, scan for malware before publishing, and serve through an authorized endpoint or short-lived link, with correct content type, <code>nosniff</code>, attachment disposition and ideally a separate domain. Add per-user quotas and log uploads.</p>` },
    { q: `What is SSRF and how do you prevent it?`, a: `<p>SSRF is when an attacker makes the server send requests to a destination they choose, typically internal services or the cloud metadata endpoint. Prevention is layered: prefer an allow-list of destinations. Otherwise parse the URL, allow only https, resolve DNS, reject private, loopback and link-local ranges, and connect to the validated IP to avoid DNS rebinding. Disable automatic redirects, use timeouts and size caps, and do not echo responses. At the network level, isolate the fetcher, restrict egress, harden the metadata service, and give the server role minimal permissions.</p>` },
    { q: `Why is BinaryFormatter considered unsafe, and what do you use instead?`, a: `<p>Its payload format carries type information, and during deserialization it creates whatever types the data names and runs their deserialization logic. Attackers chain existing classes (gadgets) to reach code execution, and no configuration makes it safe for untrusted input. Microsoft deprecated and then removed it from modern .NET. Use <code>System.Text.Json</code> (or another data-only format such as protobuf) with explicit contract types, and sign any serialized state that travels through the client.</p>` },
    { q: `Explain XXE and the fix in .NET.`, a: `<p>XML DTDs can define external entities that the parser replaces with the content of a file or URL. If an application parses attacker-supplied XML with DTD processing and a resolver enabled, the attacker can read local files, make the server issue requests, or exhaust memory with nested entities. In .NET, create readers with <code>DtdProcessing.Prohibit</code> and <code>XmlResolver = null</code>, apply document size limits, and apply the same care to XSLT and to XML-based formats such as SVG and SAML.</p>` }
  ]
};
