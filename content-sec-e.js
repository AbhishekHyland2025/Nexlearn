// NexLearn content — Security module, part E: DevSecOps & Security Testing
// Topics: sec-supply-chain, sec-pipeline, sec-code-review, sec-pentest, sec-cloud-containers
window.CONTENT = window.CONTENT || {};

/* ------------------------------------------------------------------ */
/* sec-supply-chain — Dependency & Supply Chain Security               */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-supply-chain'] = {
  hook: `You wrote maybe 10% of the code your app runs. The other 90% came from strangers on the internet, and an attacker only needs one of them to slip.`,
  intro: `<p>Open any .NET or Angular project and count the packages. A small API can pull in a few hundred. Each one was written by someone you have never met, and each one runs with the same power as your own code. This chain of people, packages, build tools and servers that turns source code into a running app is called the <span class="term">software supply chain</span>.</p>
<p>Attackers have learned that breaking into one popular package, or one build server, is easier than breaking into a thousand companies one by one. If the poisoned package gets installed, the attacker is inside every app that uses it.</p>
<p>This lesson shows you how to know what you depend on, how to check it for known problems, how to stop fake packages from sneaking in, and how to protect the build that puts it all together. None of it is hard. Most of it is a few config files and a habit of looking.</p>
<p>Three words you will see a lot: a <span class="term">dependency</span> is a package your code uses. A <span class="term">transitive dependency</span> is a package that your package uses (a friend of a friend). An <span class="term">artifact</span> is anything your build produces: a DLL, a NuGet package, a container image.</p>`,
  realLife: {
    title: 'The restaurant that never checks its suppliers',
    body: `<p>A restaurant cooks its own dishes, but it does not grow the rice, raise the chickens or press the oil. It buys them. If one supplier sends bad chicken, every dish with chicken makes people sick, even though the chef did everything right in the kitchen.</p>
<p>A careful restaurant keeps a list of suppliers, checks deliveries at the door, looks for the safety seal on each box, and reads recall notices. When a recall comes in for "batch 42 of brand X oil", it can answer in one minute: do we have that batch, and which dishes used it?</p>
<p>Software works the same way. The list of ingredients is an <span class="term">SBOM</span>. The recall notices are vulnerability databases. The safety seal is a digital signature. The door check is your scanner.</p>
<p><strong>How this showed up in the real world:</strong> In late 2021 a serious flaw was found in Log4j, a very widely used Java logging library. Many teams did not even know they used it, because it came in as a dependency of a dependency. Teams with a good ingredient list found and patched it in hours. Others spent weeks searching. In 2020, attackers got into the build system of a network management vendor (the SolarWinds incident) and added their code to an official, signed update that thousands of customers installed. And in 2021 a researcher showed that many large companies would download a public package instead of their own private one if both had the same name. That trick is now called dependency confusion.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Why your dependencies are your problem</h4>
<p>When you run <code>dotnet add package</code> or <code>npm install</code>, you are saying "I trust this code, and every package it brings with it". That code can read your files, your environment variables and your database, just like your own code can. So a weakness in a package is a weakness in your app.</p>
<h4>Known vulnerabilities</h4>
<p>When someone finds a security bug in a public package, it usually gets a public ID (a <span class="term">CVE</span>) and an entry in an advisory database. Tools can compare your package list against that database. This check is called <span class="term">SCA</span>, short for Software Composition Analysis. In plain words: "what am I made of, and is any of it known to be bad?"</p>
<p>You already have SCA tools installed:</p>
<ul>
<li><code>dotnet list package --vulnerable --include-transitive</code> checks NuGet packages, including the friends-of-friends.</li>
<li><code>npm audit</code> does the same for an Angular project.</li>
<li>Modern .NET SDKs also warn during <code>dotnet restore</code> when a package has a known advisory.</li>
</ul>
<h4>Keep packages fresh, automatically</h4>
<p>Old packages collect known bugs over time. Bots like Dependabot or Renovate watch your repository and open a pull request when a newer, safer version exists. You review, the tests run, you merge. Small updates every week are much easier than one giant update every two years.</p>
<h4>Lock files: the same ingredients every time</h4>
<p>A <span class="term">lock file</span> records the exact version of every package, including transitive ones. With a lock file, the build on your laptop, on your teammate's laptop and in the pipeline all use exactly the same code. Without one, the build can quietly pick up a newer version that nobody reviewed. For npm this is <code>package-lock.json</code>. NuGet has <code>packages.lock.json</code>, which you switch on in the project file.</p>
<div class="callout tip">Before adding a new package, spend two minutes looking at it. Is it widely used? Is it still maintained? Does the name match exactly what the docs say? A package you never add is a package you never have to patch.</div>
<h4>Fake packages</h4>
<p><span class="term">Typosquatting</span> means publishing a harmful package with a name that looks like a popular one, hoping someone mistypes. Always copy the package name from the official docs instead of typing it from memory.</p>` },
    { name: 'Intermediate', body: `<h4>Dependency confusion, and how to shut the door</h4>
<p>Many companies have private packages, for example <code>Contoso.Billing</code>, stored in a private feed. If your build is also allowed to look at the public feed, and an attacker publishes a public package with the same name and a higher version number, some setups will pick the public one. Now the attacker's code runs in your build. This is <span class="term">dependency confusion</span>.</p>
<p>The fix is to tell the package manager exactly which feed each package may come from:</p>
<ul>
<li><strong>NuGet:</strong> use <span class="term">package source mapping</span> in <code>nuget.config</code>. You map name patterns to feeds, so <code>Contoso.*</code> can only ever come from your private feed. Start the sources list with <code>&lt;clear /&gt;</code> so no machine-level feed sneaks in.</li>
<li><strong>npm:</strong> publish private packages under a <span class="term">scope</span>, like <code>@contoso/billing</code>, and bind that scope to your private registry in <code>.npmrc</code>.</li>
<li>Reserve your company prefix or scope on the public registries so nobody else can use it.</li>
</ul>
<h4>Make the build refuse surprises</h4>
<table><thead><tr><th>Control</th><th>What it stops</th></tr></thead><tbody>
<tr><td><code>dotnet restore --locked-mode</code>, <code>npm ci</code></td><td>The build fails if the lock file and the project disagree. No silent version drift.</td></tr>
<tr><td>Treat high and critical audit warnings as errors</td><td>A pull request cannot merge a package with a known serious flaw.</td></tr>
<tr><td>Central package versions (<code>Directory.Packages.props</code>)</td><td>One place to see and bump every version in the solution.</td></tr>
<tr><td>Review of new dependencies in pull requests</td><td>A human decides before a new supplier is added.</td></tr>
</tbody></table>
<h4>SBOM: the ingredient list</h4>
<p>An <span class="term">SBOM</span> (Software Bill of Materials) is a machine-readable list of everything inside a release: every package, its version and its licence. The two common formats are <strong>CycloneDX</strong> and <strong>SPDX</strong>. You generate it in the pipeline and store it next to the release. When the next big advisory lands, you search your SBOMs and know in minutes which products are affected. Some customers and regulators now ask for an SBOM with each delivery.</p>
<h4>Signatures</h4>
<p>A digital signature proves who produced a file and that it has not been changed since. NuGet packages can be signed by the author and by the repository. Container images can be signed too, and your cluster can be told to run only signed images. Signing does not prove the code is good. It proves it is the code the publisher meant to ship.</p>
<div class="callout warn">Base images are dependencies too. An old <code>aspnet</code> image carries old system libraries. Rebuild images regularly, use small images, and scan them just like packages.</div>` },
    { name: 'Expert', body: `<h4>Protect the factory, not only the ingredients</h4>
<p>The SolarWinds incident was not a bad package. The attackers changed the product during the build, so the output was officially signed and still malicious. Your build system is production. Treat it that way:</p>
<ul>
<li>Build on short-lived, clean runners. A long-lived build machine collects secrets and malware.</li>
<li>Give the pipeline the smallest permissions it needs. A job that only runs tests should not be able to publish.</li>
<li>Pin third-party pipeline steps to a full commit hash, not a moving tag, so an edited tag cannot change what runs.</li>
<li>Require review for changes to pipeline files, the same as for code.</li>
<li>Keep signing keys out of the repository and out of build logs. Prefer short-lived identities over stored keys.</li>
</ul>
<h4>Provenance and SLSA</h4>
<p><span class="term">Provenance</span> is a signed statement that says "this artifact was built from this commit, by this pipeline, at this time". <span class="term">SLSA</span> (say "salsa", Supply-chain Levels for Software Artifacts) is a framework that grades how trustworthy a build is. In simple terms: at the first level provenance exists; at the next the build runs on a hosted platform that signs the provenance; at the higher level the build platform is hardened so one build cannot tamper with another or forge its own provenance. You do not need the top level on day one. Knowing the levels helps you pick the next step.</p>
<h4>Prioritising findings</h4>
<p>A big solution can show hundreds of advisories. Fix in this order: is the vulnerable code reachable from your app, is the app exposed to the internet, is there a known exploit in the wild, and is a fixed version available. Some teams publish <span class="term">VEX</span> statements, which say "we ship this package, but we are not affected because we never call the weak function". That keeps the SBOM honest without drowning people in noise.</p>
<h4>Risks beyond CVEs</h4>
<ul>
<li><strong>Maintainer takeover.</strong> A trusted package gets a new owner, or a maintainer account is stolen, and a harmful update is published. The event-stream npm incident in 2018 and the xz backdoor found in 2024 both followed this shape: trust was earned first, then abused.</li>
<li><strong>Install scripts.</strong> npm packages can run scripts at install time. In pipelines, consider <code>npm ci --ignore-scripts</code> where your build allows it.</li>
<li><strong>Abandoned packages.</strong> No CVE, but nobody will fix the next one either. Plan a replacement.</li>
<li><strong>Licences.</strong> Not a security bug, but an SBOM lets legal check them too.</li>
</ul>
<div class="callout idea">Ask of every release: if this exact artifact turned out to be bad, could we prove where each part came from and rebuild it from source? If the answer is no, that is your next piece of work.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Explain dependency confusion and two controls that stop it.</li>
<li>How would you answer "are we affected by this new advisory?" within an hour?</li>
<li>Why is a signed artifact not automatically a safe artifact?</li>
</ul>` }
  ],
  flow: {
    title: 'How a poisoned package reaches production, and where each control stops it',
    steps: [
      { title: 'Attacker publishes', desc: 'A harmful package appears on the public feed. It copies the name of your private package, or looks like a popular one with a small typo.' },
      { title: 'Developer or build asks', desc: 'Someone runs a restore. Without source mapping, the tool searches every feed it knows and may prefer the public copy.' },
      { title: 'Source mapping check', desc: 'With package source mapping or a scoped registry, your company prefix can only come from the private feed. The public copy is never considered.' },
      { title: 'Lock file check', desc: 'Locked mode compares what would be installed against the reviewed lock file. A new or changed version fails the build.' },
      { title: 'SCA scan', desc: 'The pipeline compares every package, including transitive ones, against advisory databases. High severity findings stop the merge.' },
      { title: 'Build and sign', desc: 'A clean, short-lived runner builds the artifact, writes an SBOM and provenance, and signs the result.' },
      { title: 'Deploy only what is signed', desc: 'The environment checks the signature before running. An artifact that did not come from your pipeline is refused.' },
      { title: 'New advisory later', desc: 'Months later a new flaw is announced. You search stored SBOMs and know in minutes which releases need a patch.' }
    ]
  },
  code: [
    { lang: 'bash', title: 'Check what you depend on (run locally and in the pipeline)', code: `# --- .NET: list packages with known vulnerabilities, including transitive ones ---
dotnet list package --vulnerable --include-transitive

# See which packages are out of date
dotnet list package --outdated

# Restore exactly what the lock file says. Fails if something changed.
dotnet restore --locked-mode

# --- Angular / npm ---
# Install exactly what package-lock.json says (never "npm install" in CI)
npm ci

# Report known vulnerabilities; fail the step for high or critical
npm audit --audit-level=high

# --- SBOM (CycloneDX format) for a .NET solution ---
dotnet tool install --global CycloneDX
dotnet CycloneDX Shop.sln -o ./sbom

# --- Verify the signature on a downloaded NuGet package ---
dotnet nuget verify ./packages/Contoso.Billing.2.4.1.nupkg` },
    { lang: 'text', title: 'Fixed: packages can only come from the feed you chose (nuget.config, .csproj, .npmrc)', code: `<!-- nuget.config (repository root). Stops dependency confusion for NuGet. -->
<configuration>
  <packageSources>
    <clear />   <!-- ignore feeds configured on the machine -->
    <add key="nuget.org" value="https://api.nuget.org/v3/index.json" />
    <add key="contoso"   value="https://pkgs.example.com/contoso/nuget/v3/index.json" />
  </packageSources>
  <packageSourceMapping>
    <!-- Anything named Contoso.* may ONLY come from the private feed -->
    <packageSource key="contoso">
      <package pattern="Contoso.*" />
    </packageSource>
    <!-- Everything else comes from nuget.org -->
    <packageSource key="nuget.org">
      <package pattern="*" />
    </packageSource>
  </packageSourceMapping>
</configuration>

<!-- Directory.Build.props: lock files + fail on serious advisories -->
<Project>
  <PropertyGroup>
    <RestorePackagesWithLockFile>true</RestorePackagesWithLockFile>
    <NuGetAudit>true</NuGetAudit>
    <NuGetAuditMode>all</NuGetAuditMode>            <!-- direct + transitive -->
    <WarningsAsErrors>NU1903;NU1904</WarningsAsErrors> <!-- high, critical -->
  </PropertyGroup>
</Project>

# .npmrc (Angular project). Private packages live under a scope.
@contoso:registry=https://pkgs.example.com/contoso/npm/
# Every package named @contoso/... is fetched from the private registry only.` },
    { lang: 'text', title: 'Automatic update pull requests (.github/dependabot.yml)', code: `# Dependabot opens small pull requests when safer versions exist.
# Your tests and scanners run on each one before a human merges it.
version: 2
updates:
  - package-ecosystem: "nuget"
    directory: "/"
    schedule:
      interval: "weekly"
    open-pull-requests-limit: 10
    groups:
      minor-and-patch:          # one PR for the low-risk bumps
        update-types: ["minor", "patch"]

  - package-ecosystem: "npm"
    directory: "/web"
    schedule:
      interval: "weekly"

  - package-ecosystem: "docker"     # base images are dependencies too
    directory: "/"
    schedule:
      interval: "weekly"

  - package-ecosystem: "github-actions"   # keep pinned pipeline steps current
    directory: "/"
    schedule:
      interval: "weekly"` }
  ],
  pitfalls: [
    `Scanning only direct dependencies. Most vulnerable code arrives as a transitive package. Always include transitive ones in the scan.`,
    `Running "npm install" or an unlocked restore in the pipeline. The build can pick up versions nobody reviewed. Use npm ci and locked mode.`,
    `Letting one build search both private and public feeds for the same names. That is the open door for dependency confusion. Map names to feeds.`,
    `Treating a signature as proof of safety. A signature proves origin and integrity. A signed package can still contain a bug or a planted change.`,
    `Ignoring the scanner because it shows 300 findings. Set a gate on high and critical, fix those first, and work the rest down over time.`,
    `Forgetting base images and pipeline steps. They are dependencies too and need the same pinning, scanning and updating.`
  ],
  checklist: [
    `Run a vulnerability scan that includes transitive packages on every pull request`,
    `Commit lock files and restore in locked mode (npm ci, dotnet restore --locked-mode) in CI`,
    `Map private package names to the private feed with NuGet source mapping and npm scopes`,
    `Fail the build on high and critical advisories; track the rest with an owner and a date`,
    `Turn on an update bot for NuGet, npm, Docker base images and pipeline steps`,
    `Generate an SBOM for every release and store it with the artifact`,
    `Sign release artifacts and verify signatures before deploy`,
    `Pin third-party pipeline steps to a full commit hash`,
    `Review every new dependency: maintained, widely used, exact name from official docs`
  ],
  quiz: [
    { q: `What is a transitive dependency?`, options: [`A package you added directly to your project file`, `A package that one of your packages depends on`, `A package that is only used in tests`, `A package that has been removed from the feed`], answer: 1, why: `Transitive means "friend of a friend". You did not add it yourself, but it is still installed and still runs inside your app.` },
    { q: `Your company has a private package named Contoso.Billing. An attacker publishes a public package with the same name and a higher version. Which control stops your build from using it?`, options: [`Running the full unit test suite before every release`, `Source mapping that ties Contoso.* to the private feed`, `Using HTTPS with certificate checks for the public feed`, `Increasing the version of your private package once`], answer: 1, why: `Source mapping tells NuGet that this name pattern may only come from the private feed, so the public copy is never considered.` },
    { q: `What is the main job of a lock file?`, options: [`It encrypts your packages so nobody else can read them`, `It records exact versions so every build is the same`, `It blocks all package updates forever, even security fixes`, `It lists the licences of each package for the legal team`], answer: 1, why: `A lock file pins the full tree of versions. Combined with locked mode, the build fails instead of silently drifting.` },
    { q: `A new critical flaw is announced in a popular library. What lets you answer "are we affected?" fastest?`, options: [`Asking each team to remember what they use`, `Searching the stored SBOMs for every release`, `Waiting for the next yearly penetration test report`, `Reading the library source code`], answer: 1, why: `An SBOM is the ingredient list for each release. Searching it tells you in minutes which products contain the library and at which version.` },
    { q: `A NuGet package has a valid signature. What does that prove?`, options: [`The package has no known vulnerabilities in any version`, `The package was reviewed and approved by Microsoft staff`, `Who published it, and that it was not changed since`, `The package has no transitive dependencies`], answer: 2, why: `Signatures prove origin and integrity. They say nothing about whether the code inside is safe.` },
    { q: `In the SolarWinds style of attack, where did the attacker make the change?`, options: [`In a typo-named public package the vendor installed`, `In the firewall rules of each customer, one by one`, `Inside the vendor's build process, before signing`, `In a browser plug-in used by the vendor's customers`], answer: 2, why: `The product was altered during the build, so the official signed update carried the attacker's code. That is why the build system needs the same protection as production.` }
  ],
  takeaways: [
    `Most of your app is other people's code. Know what it is: scan it, lock it, list it.`,
    `Include transitive dependencies in every scan. That is where the surprises live.`,
    `Tie private package names to private feeds to shut out dependency confusion.`,
    `An SBOM turns "are we affected?" from a week of searching into a query.`,
    `Signatures prove where an artifact came from, not that it is safe.`,
    `The build system is part of production. Clean runners, small permissions, pinned steps.`
  ],
  interview: [
    { q: `What is a software supply chain attack? Give two different examples.`, a: `<p>It is an attack that reaches you through something you trust and install, instead of attacking your app directly. Example one: a harmful package, either a typo of a popular name or a public copy of a private name (dependency confusion). Example two: the vendor's build system is compromised, so an official signed update carries attacker code, as in the SolarWinds incident. The defences differ: feed mapping, lock files and scanning for the first; hardened, isolated builds with provenance for the second.</p>` },
    { q: `How do you manage vulnerable dependencies in a .NET and Angular codebase?`, a: `<p>Scan on every pull request with the built-in tools (NuGet audit, dotnet list package --vulnerable --include-transitive, npm audit) or a dedicated SCA product. Gate merges on high and critical. Run an update bot so fixes arrive as small pull requests. Use lock files with locked restore so builds are repeatable. Prioritise by reachability, exposure and whether an exploit is known, and record accepted risks with an owner and an expiry date.</p>` },
    { q: `What is an SBOM and why do customers ask for one?`, a: `<p>A Software Bill of Materials is a machine-readable list of every component in a release with versions and licences, usually in CycloneDX or SPDX format. Customers want it so they can check their own exposure when a new advisory appears, without waiting for the vendor. Internally it gives the same benefit: fast, exact impact analysis.</p>` },
    { q: `Explain SLSA in simple words.`, a: `<p>SLSA is a framework that describes how much you can trust the way an artifact was built. Lower levels ask for provenance: a record of what source and which pipeline produced the artifact. Higher levels ask that the provenance is signed by a hosted build platform and that builds are isolated so they cannot tamper with each other. It gives teams a ladder of concrete next steps for build integrity.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-pipeline — Security in CI/CD                                    */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-pipeline'] = {
  hook: `A tired reviewer misses things at 6 pm on a Friday. A pipeline checks the same hundred things on every single commit and never gets tired.`,
  intro: `<p>Your <span class="term">CI/CD pipeline</span> is the automated assembly line that builds, tests and ships your code. CI means Continuous Integration: every change is built and tested. CD means Continuous Delivery: every good build can be released. Since every change must pass through this line, it is the perfect place to put security checks.</p>
<p>This lesson covers the six kinds of automatic security scanning, what each one is good at, what each one cannot see, and where to place it so developers get fast feedback. You will also learn how to stop scanners from becoming noise that everyone ignores, and how to protect the pipeline itself, because a pipeline that can deploy to production is a very attractive target.</p>
<p>The six letters-and-words you will meet: <span class="term">SAST</span> reads your source code. <span class="term">SCA</span> checks your packages. <span class="term">Secret scanning</span> looks for passwords and keys. <span class="term">IaC scanning</span> checks infrastructure files. <span class="term">Image scanning</span> checks containers. <span class="term">DAST</span> attacks the running app from the outside, the way a stranger would.</p>`,
  realLife: {
    title: 'Airport security: several different checks, each for a different thing',
    body: `<p>At an airport you pass through several checks. Someone looks at your passport. Your bag goes through an X-ray. You walk through a metal detector. Sometimes a dog sniffs the luggage. No single check catches everything. The passport desk does not find a knife, and the X-ray does not notice a fake passport. Together they catch most problems, and they do it for every passenger, every day.</p>
<p>The checks are also placed with care. The quick ones are at the front so the line keeps moving. The slow, deep check happens only when something looks wrong. And the staff only stop you for real problems. If the alarm rang for every belt buckle, people would stop listening to it.</p>
<p>A good pipeline is built the same way: several different scanners, quick ones early, slow ones later, and alarms only for things that matter.</p>
<p><strong>How this showed up in the real world:</strong> Public code hosting sites find huge numbers of leaked keys and passwords in pushed commits every year, which is why they now offer push protection that blocks a commit containing a known key format. There have also been incidents where a popular third-party pipeline step was changed by an attacker so that it printed secrets into build logs. Teams that had pinned the step to an exact commit hash kept running the old, safe code.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The six scanners in plain words</h4>
<table><thead><tr><th>Scanner</th><th>What it looks at</th><th>Good at finding</th><th>Cannot see</th></tr></thead><tbody>
<tr><td><strong>SAST</strong> (static analysis)</td><td>Your source code, without running it</td><td>SQL built from strings, weak crypto calls, dangerous APIs</td><td>Missing permission checks, business rules, runtime settings</td></tr>
<tr><td><strong>SCA</strong></td><td>Your package list</td><td>Packages with known vulnerabilities</td><td>Bugs nobody has reported yet, bugs in your own code</td></tr>
<tr><td><strong>Secret scanning</strong></td><td>Files and git history</td><td>API keys, passwords, connection strings</td><td>Secrets in odd formats, secrets pasted into chat or wikis</td></tr>
<tr><td><strong>IaC scanning</strong></td><td>Terraform, Bicep, Kubernetes YAML</td><td>Public storage, open ports, missing encryption</td><td>Changes made by hand in the cloud console</td></tr>
<tr><td><strong>Image scanning</strong></td><td>Container images</td><td>Old system libraries, running as root</td><td>Logic bugs in the app inside</td></tr>
<tr><td><strong>DAST</strong> (dynamic analysis)</td><td>The running app, from outside</td><td>Missing security headers, some injection and XSS, exposed pages</td><td>Code paths it never reaches; it needs a running environment</td></tr>
</tbody></table>
<p><span class="term">IaC</span> means Infrastructure as Code: files that describe servers, networks and databases, so they can be created automatically.</p>
<h4>Shift left</h4>
<p>Picture the path of a change from left to right: write, commit, review, build, test, release. "Shifting left" means catching problems as early on that path as you can. A warning in your editor costs ten seconds. The same problem found in production costs days and maybe an incident.</p>
<h4>Names you will hear</h4>
<p>You do not need to learn every tool. Know the category each one belongs to: CodeQL, Semgrep and SonarQube do SAST. Trivy scans images, packages and IaC. Gitleaks finds secrets. Checkov scans IaC. ZAP (formerly OWASP ZAP) does DAST. The .NET SDK also ships with built-in security analyzers that run during every build.</p>
<div class="callout tip">Start with the two cheapest wins: secret scanning with push protection, and SCA on every pull request. Both take minutes to switch on and catch real problems in the first week.</div>
<h4>What scanners will never replace</h4>
<p>No tool knows that "only the owner may cancel an order". Rules about who may do what are yours to design, test and review. Scanners handle the repeatable patterns so people have time for the thinking.</p>` },
    { name: 'Intermediate', body: `<h4>Where each check runs</h4>
<table><thead><tr><th>Stage</th><th>Checks</th><th>Time budget</th></tr></thead><tbody>
<tr><td>Editor and pre-commit</td><td>Built-in analyzers, a secret-scanning hook</td><td>Seconds</td></tr>
<tr><td>Pull request</td><td>SAST on changed code, SCA, secret scan, IaC scan</td><td>A few minutes</td></tr>
<tr><td>Main branch or nightly</td><td>Full SAST, image scan, DAST baseline against a test environment</td><td>Up to an hour</td></tr>
<tr><td>Before release</td><td>Full DAST on staging, manual review, penetration test for big changes</td><td>Hours to days</td></tr>
</tbody></table>
<p>The rule: pull request checks must be fast, or developers will find ways around them. Slow, deep scans run on a schedule and report back.</p>
<h4>Quality gates that people respect</h4>
<p>A <span class="term">quality gate</span> is a rule that fails the build. A good gate is narrow and clear:</p>
<ul>
<li>Fail on <strong>new</strong> high or critical findings. Do not fail on every low-severity note.</li>
<li>Fail on <strong>any</strong> detected secret. There is no "low severity" leaked key.</li>
<li>Warn, but do not block, on medium findings. Review them weekly.</li>
</ul>
<h4>The baseline</h4>
<p>The first scan of an old codebase may show thousands of findings. If you block on all of them, the pipeline is red forever and people stop caring. Instead, record today's findings as the <span class="term">baseline</span>. The gate then blocks only what is new. The old list becomes a backlog you work down each sprint.</p>
<h4>Triage and false positives</h4>
<p><span class="term">Triage</span> means sorting findings into: real and urgent, real but later, and not a real problem. A <span class="term">false positive</span> is a finding that looks like a bug but is not. When you dismiss one, do it in the open: suppress it in code or in the tool with a written reason and your name. Never switch a whole rule off because one result was wrong.</p>
<div class="callout warn">If a secret is found, deleting it from the file is not enough. It is still in the git history and may already be copied. Revoke and rotate the secret first, then clean up.</div>
<h4>One format for all results</h4>
<p>Most scanners can write <span class="term">SARIF</span>, a common file format for findings. Upload SARIF to your code hosting platform and all tools show their results in one place, next to the code, on the pull request.</p>` },
    { name: 'Expert', body: `<h4>The pipeline is a target</h4>
<p>A pipeline holds deploy rights, signing keys and cloud access. Compromising it is often easier than compromising production directly. Harden it like a production system:</p>
<ul>
<li><strong>Least-privilege tokens.</strong> Set the default token to read-only and grant each job only what it needs. A test job must not be able to push tags or write packages.</li>
<li><strong>Protected branches.</strong> Require reviews and passing checks on the main branch. Require review from code owners for changes under the pipeline folder.</li>
<li><strong>Pinned actions.</strong> Reference third-party steps by full commit hash. Tags can be moved; hashes cannot.</li>
<li><strong>No stored cloud keys.</strong> Use <span class="term">OIDC federation</span>: the pipeline proves its identity to the cloud and receives a short-lived token for that one run. Nothing long-lived sits in the secret store to be stolen.</li>
<li><strong>Untrusted code stays untrusted.</strong> Pull requests from forks must not get secrets or write tokens. Be careful with triggers that run fork code with repository privileges.</li>
<li><strong>Clean logs.</strong> Never echo secrets. Mask values. Remember that build logs are often readable by many people.</li>
<li><strong>Isolated runners.</strong> Prefer fresh, short-lived runners. A shared, long-lived runner lets one job leave something behind for the next.</li>
</ul>
<h4>Script injection in workflows</h4>
<p>Pipeline files can have injection bugs too. If a workflow copies untrusted text, such as a pull request title, straight into a shell command, the author of that title controls the command. Pass untrusted values through environment variables and quote them, the same way you use parameters in SQL.</p>
<h4>Separation of duties</h4>
<p>Split build from deploy. The build job produces a signed artifact with no access to production. The deploy job has production access but can only deploy signed artifacts, and for production it waits for an approval in a protected environment. One stolen credential then cannot do both.</p>
<h4>Measuring whether it works</h4>
<ul>
<li>Time from finding to fix, by severity.</li>
<li>Share of findings dismissed as false positives per tool. A high number means the rules need tuning.</li>
<li>How many pull requests were blocked, and how long the security stage adds to a build.</li>
<li>Escapes: problems found in production that a scanner should have caught.</li>
</ul>
<div class="callout idea">A scanner that blocks too often gets disabled. A scanner that never blocks gets ignored. The craft is in the middle: few, trusted, high-signal gates.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Compare SAST and DAST. What does each miss?</li>
<li>How do you introduce scanning into a ten-year-old codebase without stopping delivery?</li>
<li>How does OIDC remove long-lived cloud credentials from a pipeline?</li>
</ul>` }
  ],
  flow: {
    title: 'One commit travelling through a secure pipeline',
    steps: [
      { title: 'Pre-commit', desc: 'A local hook scans the staged files for key patterns. A pasted connection string is caught before it ever leaves the laptop.' },
      { title: 'Pull request opens', desc: 'The pipeline starts with a read-only token. Fork code gets no secrets.' },
      { title: 'Fast scans', desc: 'SAST on the changed code, SCA on the packages, secret scan and IaC scan run in parallel in a few minutes.' },
      { title: 'Gate', desc: 'New high or critical findings, or any secret, fail the check. Results appear as comments on the exact lines.' },
      { title: 'Build and image scan', desc: 'After merge, a clean runner builds the image, scans it for known flaws, and signs it.' },
      { title: 'Deploy to test with OIDC', desc: 'The deploy job swaps its identity for a short-lived cloud token. No stored key is involved.' },
      { title: 'DAST baseline', desc: 'A dynamic scanner crawls the running test site and checks headers, cookies and common weaknesses.' },
      { title: 'Approval and release', desc: 'A protected environment asks a human to approve. Only the signed artifact that passed every stage can go to production.' }
    ]
  },
  code: [
    { lang: 'text', title: 'GitHub Actions: security stages for a .NET API (.github/workflows/security.yml)', code: `# NOTE: GitHub expressions normally start with a dollar sign and two braces.
# In this lesson they are written as DOLLAR{{ ... }}. Replace DOLLAR with the
# real dollar character when you copy this into a workflow file.
name: security
on:
  pull_request:
  push:
    branches: [main]

permissions:
  contents: read            # default: read-only for every job

jobs:
  scan:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write   # only to upload SARIF results
    steps:
      # Pin third-party steps to a full commit hash, with the tag as a comment
      - uses: actions/checkout@<full-commit-sha>        # v4
        with:
          fetch-depth: 0       # full history so secret scanning sees old commits

      - name: Secret scan
        uses: gitleaks/gitleaks-action@<full-commit-sha>
        env:
          GITHUB_TOKEN: DOLLAR{{ secrets.GITHUB_TOKEN }}   # the action needs it to scan pull requests

      - name: SAST - init CodeQL
        uses: github/codeql-action/init@<full-commit-sha>
        with:
          languages: csharp

      - uses: actions/setup-dotnet@<full-commit-sha>
        with:
          dotnet-version: 10.0.x
      - run: dotnet restore --locked-mode
      - run: dotnet build --no-restore -warnaserror

      - name: SAST - analyze
        uses: github/codeql-action/analyze@<full-commit-sha>

      # SCA gate: the restore above already fails on high and critical advisories
      # (NuGetAudit + WarningsAsErrors in Directory.Build.props). This step prints the list.
      - name: SCA - report vulnerable packages
        run: dotnet list package --vulnerable --include-transitive

      - name: IaC and repository file scan (Trivy)
        uses: aquasecurity/trivy-action@<full-commit-sha>
        with:
          scan-type: fs        # files in the repo; scan the built image with scan-type image
          scanners: vuln,misconfig,secret
          severity: HIGH,CRITICAL
          exit-code: "1"       # gate: only high and critical fail the build

  deploy-test:
    needs: scan
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    environment: test          # protected environment, can require approval
    permissions:
      contents: read
      id-token: write          # allows OIDC login, no stored cloud key
    steps:
      - uses: azure/login@<full-commit-sha>
        with:
          client-id: DOLLAR{{ vars.AZURE_CLIENT_ID }}
          tenant-id: DOLLAR{{ vars.AZURE_TENANT_ID }}
          subscription-id: DOLLAR{{ vars.AZURE_SUBSCRIPTION_ID }}
      - run: echo "deploy the signed image here"

      - name: DAST baseline against the test site
        uses: zaproxy/action-baseline@<full-commit-sha>
        with:
          target: https://shop-test.example.com` },
    { lang: 'csharp', title: 'A SAST finding: the fix, and the right way to suppress a false positive', code: `using System.Diagnostics.CodeAnalysis;
using System.Security.Cryptography;
using System.Text;

public static class Fingerprints
{
    // FINDING (CA5351): MD5 is a broken algorithm. The analyzer is right.
    // Vulnerable:
    //   using var md5 = MD5.Create();
    //   return Convert.ToHexString(md5.ComputeHash(data));

    // Fixed: use SHA-256 for integrity checks.
    public static string OfFile(byte[] data)
        => Convert.ToHexString(SHA256.HashData(data));

    // FALSE POSITIVE: a partner's legacy API demands an MD5 checksum header.
    // It is not used for security here, and we cannot change their protocol.
    // Suppress ONE place, with a reason and a ticket. Never disable the rule.
    [SuppressMessage("Security", "CA5351:Do Not Use Broken Cryptographic Algorithms",
        Justification = "Non-security checksum required by partner API. See SEC-412. Review 2026-06.")]
    public static string LegacyPartnerChecksum(string payload)
        => Convert.ToHexString(MD5.HashData(Encoding.UTF8.GetBytes(payload)));
}

// .editorconfig (make the important security rules fail the build):
//   dotnet_diagnostic.CA5351.severity = error   # broken crypto
//   dotnet_diagnostic.CA5350.severity = error   # weak crypto
//   dotnet_diagnostic.CA2100.severity = error   # review SQL built from strings
//   dotnet_diagnostic.CA3001.severity = error   # SQL injection
//
// .csproj:
//   <EnableNETAnalyzers>true</EnableNETAnalyzers>
//   <AnalysisMode>All</AnalysisMode>` },
    { lang: 'text', title: 'A triage policy the whole team can follow', code: `SECURITY FINDINGS - HOW WE HANDLE THEM

1. GATES (block the merge)
   - Any detected secret                       -> block, rotate the secret first
   - New CRITICAL or HIGH from SAST/SCA/IaC    -> block
   - Image with CRITICAL and a fix available   -> block

2. WARN (do not block, review weekly)
   - New MEDIUM findings
   - HIGH findings that are part of the recorded baseline

3. BASELINE
   - Recorded on: <date>, stored with the repository
   - Baseline items have an owner and a target sprint
   - The baseline may only shrink. Adding to it needs security sign-off.

4. DISMISSING A FINDING
   Allowed reasons:  false positive | not reachable | accepted risk
   Every dismissal needs:
     - who, when, and a one-line reason
     - for accepted risk: an expiry date (max 90 days) and an approver
   Not allowed: disabling a whole rule for the repository

5. FIX TIMES (from the day the finding is confirmed)
   CRITICAL  2 days      HIGH  7 days
   MEDIUM    30 days     LOW   next planned cleanup

6. EVERY MONTH
   - False positive rate per tool (tune rules above 30 percent)
   - Oldest open HIGH
   - Anything found in production that a scanner should have caught` }
  ],
  pitfalls: [
    `Turning on every rule on day one. The team sees a thousand findings, the pipeline is always red, and the scanner gets disabled. Start with a baseline and a narrow gate.`,
    `Deleting a leaked secret from the file and moving on. It is still in history and may be copied already. Revoke and rotate it first.`,
    `Believing a green pipeline means the app is secure. Scanners cannot check who is allowed to do what. Authorization and business rules need tests and review.`,
    `Storing a long-lived cloud key as a pipeline secret. Use OIDC federation so each run gets a short-lived token.`,
    `Referencing third-party pipeline steps by a moving tag. If the tag is changed, new code runs with your secrets. Pin to a commit hash.`,
    `Giving pull requests from forks access to secrets or write tokens. Untrusted code can then read or misuse them.`
  ],
  checklist: [
    `Turn on secret scanning with push protection for every repository`,
    `Run SAST, SCA, secret and IaC scans on every pull request in under ten minutes`,
    `Gate only on new high and critical findings and on any detected secret`,
    `Record a baseline for old findings and give each item an owner`,
    `Set the default pipeline token to read-only and grant extra permissions per job`,
    `Pin third-party pipeline steps to a full commit hash`,
    `Log in to the cloud with OIDC instead of stored keys`,
    `Protect the main branch and require code owner review for pipeline files`,
    `Scan container images and block critical flaws that have a fix`,
    `Run a DAST baseline against a test environment on a schedule`
  ],
  quiz: [
    { q: `Which scanner reads your source code without running it?`, options: [`DAST`, `SAST`, `Image scanning`, `SCA`], answer: 1, why: `SAST means static analysis. It inspects the code as text and structure. DAST tests the running app from outside.` },
    { q: `An old codebase shows 2,000 findings on the first scan. What is the best first step?`, options: [`Block every merge until all 2,000 findings are fixed`, `Turn the scanner off until the team has time to tune it`, `Record a baseline and gate only on new serious findings`, `Mark all of them as false positives so the build is green`], answer: 2, why: `A baseline keeps delivery moving while making sure things do not get worse. The old findings become a backlog with owners.` },
    { q: `A scanner finds an API key in a commit from last month. What must happen first?`, options: [`Delete the line and commit again`, `Revoke and rotate the key`, `Make the repository private`, `Add the file to .gitignore`], answer: 1, why: `The key is already in history and may have been copied. Only revoking it makes it useless. Cleanup comes after.` },
    { q: `Why pin a third-party pipeline step to a full commit hash?`, options: [`It makes the build faster because hashes are cached`, `Hashes are easier for reviewers to read than tags`, `A tag can be moved to different code, a hash cannot`, `It is required by the YAML format of workflow files`], answer: 2, why: `If someone changes what a tag points to, your pipeline would run the new code with your secrets. A commit hash always means the same code.` },
    { q: `What does OIDC federation give a deploy job?`, options: [`A permanent admin password kept in the pipeline secrets`, `A short-lived cloud token for that run, no stored key`, `Faster container builds through a shared layer cache`, `Automatic code review of every infrastructure change`], answer: 1, why: `The pipeline proves its identity and receives a token that expires quickly. There is no long-lived secret to leak.` },
    { q: `Which problem will none of the six scanners reliably find?`, options: [`A package with a known CVE that came in as a transitive dependency`, `A storage account set to public in a Terraform file`, `An endpoint that lets any user cancel another user's order`, `An AWS access key committed to the repository last month`], answer: 2, why: `That is a missing authorization rule. Tools do not know your business rules, so this needs tests and human review.` }
  ],
  takeaways: [
    `Six scanners, six different views: code, packages, secrets, infrastructure files, images and the running app.`,
    `Fast checks on the pull request, deep checks on a schedule.`,
    `Gate on new high and critical findings and on any secret. Baseline the rest.`,
    `Dismiss findings in the open, one at a time, with a reason and an expiry.`,
    `The pipeline is a production system: read-only tokens, pinned steps, OIDC, protected branches.`,
    `A green pipeline is necessary, not sufficient. Authorization and business logic still need people.`
  ],
  interview: [
    { q: `Compare SAST, DAST and SCA.`, a: `<p>SAST analyses source code without running it. It finds risky patterns early and points at the exact line, but it produces false positives and cannot see runtime settings or missing permission checks. DAST tests the running app from outside. It finds real, reachable problems such as missing headers or some injection, but it needs a deployed environment, is slower and only covers what it can reach. SCA checks third-party packages against advisory databases. It finds known flaws in dependencies and says nothing about your own code. A mature pipeline uses all three because they overlap very little.</p>` },
    { q: `How would you add security scanning to a legacy project without blocking delivery?`, a: `<p>Start with secret scanning and SCA because they are quick and high-signal. Run SAST in report-only mode, record the result as a baseline, then gate only on new high and critical findings. Give baseline items owners and work them down. Tune or remove noisy rules, and track the false positive rate. Add image, IaC and DAST scans step by step. Communicate the gates in advance so nobody is surprised by a red build.</p>` },
    { q: `How do you secure the CI/CD pipeline itself?`, a: `<p>Least-privilege tokens per job, protected branches with required reviews, code owner review for pipeline files, third-party steps pinned to commit hashes, OIDC federation instead of stored cloud keys, no secrets for fork pull requests, masked logs, short-lived isolated runners, and a split between build and deploy with an approval on the production environment. Also avoid copying untrusted text such as pull request titles straight into shell commands.</p>` },
    { q: `A developer says a SAST finding is a false positive. What is your process?`, a: `<p>Look at the data flow together and confirm it truly cannot be reached with untrusted input. If it is a false positive, suppress that one location with a written justification, a ticket and a review date, so the decision is visible in code review. If the same rule is wrong often, tune the rule. Never disable the rule for the whole repository because of one case.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-code-review — Security Code Review                              */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-code-review'] = {
  hook: `A normal reviewer asks "does this code work?". A security reviewer asks "what happens when someone uses it in a way we never planned?".`,
  intro: `<p>A <span class="term">security code review</span> is reading code with one goal: to find ways it could be misused. You are not checking style or naming. You are playing the part of a curious, slightly rude user who types the wrong thing into every box on purpose.</p>
<p>The good news is that this is a skill with a method, not a talent. Most security bugs follow the same story. Some data comes in from outside. It travels through the code. It reaches a place where it can do damage. Nobody checked it on the way. If you learn to follow that journey, you will find most problems.</p>
<p>Two words make the method easy to remember. A <span class="term">source</span> is any place where data enters your code from outside: a URL, a form, a header, a file, a message. A <span class="term">sink</span> is any place where data can cause harm: a SQL query, a file path, a shell command, a web page, a log. A security review follows data from each source to each sink and asks what stands in between.</p>
<p>In this lesson you will learn the mindset, a list of high-risk areas to look at first, how to write a finding that actually gets fixed, and you will review a small, badly written controller together with the fixed version.</p>`,
  realLife: {
    title: 'The plumber who follows the water',
    body: `<p>When a plumber inspects a house, they do not admire the taps. They follow the water. Where does it come in from the street? Which pipes does it pass through? Is there a filter? Where does it come out: a glass you drink from, or a drain? Dirty water is only a problem if it can reach the glass.</p>
<p>A security reviewer does the same with data. Untrusted input is the water from the street. Validation and encoding are the filters. A SQL query or a file path is the glass. The reviewer follows each pipe and looks for a path where street water reaches a glass with no filter in between.</p>
<p>A second picture: a bank teller is trained to check ID before handing over money, every time, even if the customer looks honest. A reviewer checks that the code "asks for ID" at every door, not only at the front entrance.</p>
<p><strong>How this showed up in the real world:</strong> Two famous bugs from 2014 were each a tiny mistake that passed human review. In Heartbleed, a widely used encryption library trusted a length value sent by the other side and did not check it against the real size of the data, so it returned extra memory. In the "goto fail" bug, a single duplicated line caused a certificate check to be skipped. Both were small, both looked harmless in a diff, and both sat in critical security code. The lesson: the riskiest code deserves the slowest, most careful reading.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Change the question you ask</h4>
<p>In a normal review you check the "happy path": the user does the expected thing and the code works. In a security review you check the unhappy paths:</p>
<ul>
<li>What if the number is negative, huge, or not a number?</li>
<li>What if the id belongs to another user?</li>
<li>What if the text contains quotes, angle brackets or slashes?</li>
<li>What if the user is not logged in at all?</li>
<li>What if the same request is sent twice, very fast?</li>
</ul>
<h4>Sources: where untrusted data comes in</h4>
<p>Treat all of these as untrusted: route values, query strings, request bodies, headers, cookies, uploaded files and their names, messages from queues, answers from other companies' APIs, and even values from your own database if a user wrote them there earlier.</p>
<h4>Sinks: where data can do damage</h4>
<table><thead><tr><th>Sink</th><th>What can go wrong</th></tr></thead><tbody>
<tr><td>SQL query</td><td>Injection: the user changes the query</td></tr>
<tr><td>File path</td><td>Reading or writing files outside the allowed folder</td></tr>
<tr><td>Shell command</td><td>Running the user's commands on your server</td></tr>
<tr><td>HTML page</td><td>The user's script runs in another person's browser (XSS)</td></tr>
<tr><td>Outgoing HTTP call</td><td>Your server fetches a URL the attacker chose (SSRF)</td></tr>
<tr><td>Log file</td><td>Secrets or personal data end up where many people can read them</td></tr>
<tr><td>Redirect</td><td>Sending a user to a fake site that looks like yours</td></tr>
</tbody></table>
<h4>The one-line method</h4>
<p>For every source, follow the data until it reaches a sink. If nothing checks, converts or encodes it on the way, you have a finding.</p>
<div class="callout tip">Start every review by asking three questions about each new endpoint: Who is allowed to call this? Whose data does it touch? What does it do with the input?</div>
<h4>Keep reviews small</h4>
<p>People review well for about an hour and for a few hundred changed lines. After that, attention drops and bugs slip through. Ask for small pull requests. If a change is large, review the risky files first while you are fresh.</p>` },
    { name: 'Intermediate', body: `<h4>The high-risk areas: look here first</h4>
<p>You cannot read every line with the same care. These areas hold most serious bugs, so spend your time here:</p>
<table><thead><tr><th>Area</th><th>Questions to ask</th></tr></thead><tbody>
<tr><td>Authentication</td><td>Is <code>[Authorize]</code> present? Is any endpoint open by accident? How are passwords and tokens checked?</td></tr>
<tr><td>Authorization</td><td>Does the query filter by the current user or tenant? Is the role check on the server?</td></tr>
<tr><td>Input handling</td><td>Types, lengths, ranges and allowed values checked on the server? Are DTOs used instead of entities?</td></tr>
<tr><td>SQL and data access</td><td>Any string-built SQL? Any raw SQL method with concatenation?</td></tr>
<tr><td>Files and paths</td><td>Does a user-supplied name reach the file system? Are size and type limited?</td></tr>
<tr><td>Crypto</td><td>Home-made crypto? Old algorithms? Fixed keys or IVs? <code>Random</code> used for tokens?</td></tr>
<tr><td>Secrets</td><td>Keys or passwords in code, config, tests or comments?</td></tr>
<tr><td>Deserialization</td><td>Untrusted data turned into objects with type information?</td></tr>
<tr><td>Error handling</td><td>Stack traces returned to the client? Failures that leave the door open?</td></tr>
<tr><td>Logging</td><td>Passwords, tokens or personal data in logs? Are security events logged at all?</td></tr>
<tr><td>Concurrency</td><td>Check-then-act on balances, stock or coupons without a lock or a database condition?</td></tr>
<tr><td>Dependencies</td><td>New package added? Is it needed, maintained, the right name?</td></tr>
</tbody></table>
<h4>What tools miss</h4>
<p>Scanners are good at patterns like string-built SQL. They are poor at meaning. No tool knows that only the invoice owner may download it, that a discount must not exceed 30 percent, or that step 3 of checkout must not be reachable without step 2. Authorization and business logic are the reviewer's special job.</p>
<h4>Writing a finding that gets fixed</h4>
<p>A finding has four parts: <strong>what</strong> is wrong, <strong>where</strong> it is, the <strong>impact</strong> if someone abuses it, and a suggested <strong>fix</strong>. Compare:</p>
<div class="compare"><div><h5>Weak comment</h5><p>"This looks insecure."</p></div><div><h5>Strong finding</h5><p>"<code>Get(id)</code> loads the invoice by id only (line 42). Any logged-in user can read another customer's invoice by changing the number. Add <code>CustomerId == currentUser</code> to the query and return 404 otherwise."</p></div></div>
<div class="callout warn">Review the tests too. If there is no test that proves user A cannot read user B's data, the rule is not protected against the next refactor.</div>
<h4>Be kind and specific</h4>
<p>Comment on the code, not the person. Offer the fix. Mark severity so the author knows what must change before merge and what is a suggestion.</p>` },
    { name: 'Expert', body: `<h4>Review the design before the lines</h4>
<p>Before reading the diff, read the description and ask what trust boundary the change touches. A new endpoint, a new role, a new file type, a new outbound call or a new background job each changes the attack surface. If a threat model exists, check the change against it. A line-perfect implementation of a flawed design is still flawed.</p>
<h4>Taint thinking, more precisely</h4>
<p>Call data <span class="term">tainted</span> when it comes from a source. It stays tainted through assignments, string joins and method calls until a <span class="term">sanitizer</span> makes it safe for one specific sink. Parameterizing makes it safe for SQL, not for HTML. HTML encoding makes it safe for a page, not for a shell. Check that the sanitizer matches the sink. Also watch for <span class="term">second-order</span> flows: data stored safely today and used unsafely by another feature next month.</p>
<h4>Bugs that hide in plain sight</h4>
<ul>
<li><strong>Missing code.</strong> The hardest bug to see is the check that is not there. Compare the new endpoint with its neighbours: do they have a policy, an ownership filter, a rate limit that this one lacks?</li>
<li><strong>Fail-open paths.</strong> A <code>catch</code> that logs and continues after a failed permission or signature check lets the request through.</li>
<li><strong>TOCTOU.</strong> Time of check to time of use: the code checks a condition, then acts later, and the state changes in between. Look for it in balance, stock and file operations. Prefer one atomic database statement with the condition in the WHERE clause.</li>
<li><strong>Mass assignment.</strong> Binding the request straight to an entity lets a caller set fields like <code>IsAdmin</code> or <code>Price</code>.</li>
<li><strong>Default and debug settings.</strong> Permissive CORS, developer exception pages, test accounts, feature flags that skip checks.</li>
<li><strong>Comparisons.</strong> Secrets compared with normal equality instead of a fixed-time comparison; case and Unicode tricks in usernames and paths.</li>
</ul>
<h4>Making review scale</h4>
<ul>
<li>Use <strong>CODEOWNERS</strong> so changes to auth, crypto, payment and pipeline folders always get a trained reviewer.</li>
<li>Add a short security section to the pull request template: new inputs, new permissions, new dependencies, data touched.</li>
<li>Turn each real finding into a rule or a test, so the same bug is caught automatically next time.</li>
<li>Train <span class="term">security champions</span>: one developer per team with extra training who reviews risky changes and knows when to call the security team.</li>
</ul>
<div class="callout idea">When you find one bug, search for its siblings. The developer who built one query by concatenation probably built another the same way on the same afternoon.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Here is a controller. What is wrong with it? (They want method, not just a list.)</li>
<li>Which bugs do static analysis tools miss, and why?</li>
<li>How do you review a 2,000-line pull request?</li>
</ul>` }
  ],
  flow: {
    title: 'Reviewing a pull request for security, step by step',
    steps: [
      { title: 'Read the intent', desc: 'Read the description first. What feature is this, which users call it, and what data does it touch?' },
      { title: 'List new entry points', desc: 'Find every new or changed endpoint, message handler, file input and outbound call. These are the sources.' },
      { title: 'Check the door', desc: 'For each entry point: is authentication required, and is the right role or policy applied on the server?' },
      { title: 'Check ownership', desc: 'Does the data access filter by the current user or tenant? Try in your head: what if I pass another person\'s id?' },
      { title: 'Follow data to sinks', desc: 'Trace each input to SQL, files, HTML, shell, logs and outgoing requests. Look for the filter that matches each sink.' },
      { title: 'Look at failures', desc: 'Read catch blocks and error responses. Does a failure close the door? Is anything secret returned or logged?' },
      { title: 'Check the extras', desc: 'New packages, changed config, secrets in code, missing tests for the forbidden cases.' },
      { title: 'Write findings', desc: 'For each issue: what, where, impact, fix, and severity. Then search the codebase for the same pattern elsewhere.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Vulnerable: a small controller with nine findings (read it as a reviewer)', code: `[ApiController]
[Route("api/invoices")]
public class InvoicesController : ControllerBase          // (1) no [Authorize] anywhere
{
    private const string ExportApiKey = "EXAMPLE-KEY-123"; // (2) secret in source code
    private readonly SqlConnection _db;
    private readonly ILogger<InvoicesController> _log;

    public InvoicesController(SqlConnection db, ILogger<InvoicesController> log)
    { _db = db; _log = log; }

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(string id)
    {
        try
        {
            // (3) SQL built by joining strings: the caller controls the query
            var sql = "SELECT * FROM Invoices WHERE Id = " + id;
            var invoice = await _db.QuerySingleAsync<Invoice>(sql);

            // (4) no check that this invoice belongs to the caller
            // (5) returns the whole entity, including internal fields
            return Ok(invoice);
        }
        catch (Exception ex)
        {
            // (6) token written to the log
            _log.LogError("Invoice " + id + " failed. Auth: " + Request.Headers.Authorization);
            // (7) stack trace and SQL text sent to the client
            return StatusCode(500, ex.ToString());
        }
    }

    [HttpGet("download")]
    public IActionResult Download(string file)
    {
        // (8) user text becomes a file path: "../" can leave the folder
        var path = Path.Combine("/data/invoices", file);
        return PhysicalFile(path, "application/pdf");
    }

    [HttpPost("{id}/discount")]
    public async Task<IActionResult> Discount(int id, decimal percent)
    {
        // (9) anyone can set any discount: no role, no range, no state check
        await _db.ExecuteAsync(
            "UPDATE Invoices SET DiscountPercent = @p WHERE Id = @id", new { p = percent, id });
        return Ok();
    }
}` },
    { lang: 'csharp', title: 'Fixed: the same controller after review', code: `[ApiController]
[Route("api/invoices")]
[Authorize]                                               // (1) login required for every action
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _db;                    // (2) no secrets here; config comes from a vault
    private readonly IInvoiceFiles _files;
    private readonly ILogger<InvoicesController> _log;

    public InvoicesController(AppDbContext db, IInvoiceFiles files, ILogger<InvoicesController> log)
    { _db = db; _files = files; _log = log; }

    private int UserId => int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

    [HttpGet("{id:int}")]                                 // typed route value, not free text
    public async Task<ActionResult<InvoiceDto>> Get(int id, CancellationToken ct)
    {
        var dto = await _db.Invoices
            .Where(i => i.Id == id && i.CustomerId == UserId)   // (3) parameterized (4) ownership in the query
            .Select(i => new InvoiceDto(i.Id, i.Number, i.Total, i.IssuedOn))  // (5) only public fields
            .SingleOrDefaultAsync(ct);

        return dto is null ? NotFound() : Ok(dto);        // same answer for "missing" and "not yours"
    }
    // (6)(7) No try/catch here. A global exception handler logs the error with a
    // trace id (no tokens) and returns a plain ProblemDetails without internals.

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> Download(int id, CancellationToken ct)
    {
        var owns = await _db.Invoices.AnyAsync(i => i.Id == id && i.CustomerId == UserId, ct);
        if (!owns) return NotFound();

        // (8) the storage key is built from the numeric id on the server, never from user text
        var stream = await _files.OpenAsync(id, ct);
        return File(stream, "application/pdf", "invoice-" + id + ".pdf");
    }

    [HttpPost("{id:int}/discount")]
    [Authorize(Policy = "BillingAdmin")]                  // (9) role checked on the server
    public async Task<IActionResult> Discount(int id, DiscountRequest req, CancellationToken ct)
    {
        var rows = await _db.Invoices
            .Where(i => i.Id == id && i.Status == InvoiceStatus.Draft)   // state rule in the same statement
            .ExecuteUpdateAsync(s => s.SetProperty(i => i.DiscountPercent, req.Percent), ct);

        _log.LogInformation("Discount {Percent} set on invoice {InvoiceId} by user {UserId}",
            req.Percent, id, UserId);                     // security event, no secrets
        return rows == 0 ? NotFound() : NoContent();
    }
}

public record InvoiceDto(int Id, string Number, decimal Total, DateOnly IssuedOn);
// Range(0.0, 30.0), not Range(0, 30): the int form rounds the value first, so 30.4 would pass.
public record DiscountRequest([Range(0.0, 30.0)] decimal Percent);   // (9) business limit enforced` },
    { lang: 'text', title: 'Security review checklist for a pull request', code: `SECURITY REVIEW CHECKLIST            (tick or write n/a)

ACCESS
[ ] Every new endpoint requires authentication, or is open on purpose
[ ] Role / policy checks are on the server, not only in the UI
[ ] Queries filter by current user or tenant (try: another user's id)
[ ] "Not found" and "not yours" give the same response

INPUT
[ ] Request bound to a DTO, not to a database entity
[ ] Type, length, range and allowed values validated on the server
[ ] No user text reaches SQL, file paths, shell, redirects or URLs unfiltered

DATA ACCESS AND FILES
[ ] No SQL built by joining strings; raw SQL uses parameters
[ ] File names generated by the server; size and type limited
[ ] Outbound calls go only to allowed hosts

SECRETS AND CRYPTO
[ ] No keys, passwords or tokens in code, tests, config or comments
[ ] Standard library crypto only; no old algorithms; no fixed keys
[ ] Random tokens come from a cryptographic generator

ERRORS AND LOGS
[ ] Errors returned to clients carry no stack trace or SQL
[ ] A failed check stops the request (no catch-and-continue)
[ ] Logs hold no passwords, tokens or personal data
[ ] Important actions are logged: who, what, when

STATE AND TIMING
[ ] Check-then-act on money, stock or coupons is one atomic statement
[ ] The action is safe if the same request arrives twice

EXTRAS
[ ] New dependencies are needed, maintained and correctly named
[ ] Config changes do not widen CORS, cookies or debug settings
[ ] Tests exist for the forbidden cases (401, 403/404, bad input)

FINDING FORMAT:  WHAT is wrong | WHERE (file:line) | IMPACT | suggested FIX | severity` }
  ],
  pitfalls: [
    `Reviewing only what changed and never asking what is missing. The absent permission check is invisible in a diff. Compare with neighbouring endpoints.`,
    `Trusting the scanner to cover security. Tools miss authorization and business rules, which are the most common serious bugs.`,
    `Accepting huge pull requests. Attention fades after a few hundred lines. Ask for smaller changes or review the risky files first.`,
    `Writing vague comments like "is this safe?". Give what, where, impact and fix, or the finding will be argued away.`,
    `Checking that validation exists but not that it matches the sink. HTML encoding does not protect a SQL query.`,
    `Fixing the one instance you found and stopping. Search the codebase for the same pattern before you close the finding.`
  ],
  checklist: [
    `List every new entry point in the change before reading the details`,
    `Confirm authentication and a server-side role or policy on each endpoint`,
    `Check that data access filters by the current user or tenant`,
    `Trace each input to SQL, file, HTML, shell, log and outbound-call sinks`,
    `Read every catch block and error response for leaks and fail-open paths`,
    `Search the diff for secrets, new packages and loosened config`,
    `Ask for tests that prove the forbidden cases are refused`,
    `Write each finding as what, where, impact, fix and severity`,
    `Search the rest of the codebase for the same mistake`
  ],
  quiz: [
    { q: `In review language, what is a "sink"?`, options: [`A place where untrusted data enters the app, such as a form`, `A place where data can cause harm, such as a SQL query`, `A logging framework that collects security events`, `A slow database query that drains the connection pool`], answer: 1, why: `Sources are where data comes in. Sinks are where it can do damage. A review follows data from one to the other.` },
    { q: `Which bug is a static analysis tool least likely to find?`, options: [`SQL built by string concatenation from a route value`, `Use of MD5 to hash a password before it is stored`, `A hard-coded database password in a connection string constant`, `An endpoint that shows any invoice to any logged-in user`], answer: 3, why: `The tool does not know your ownership rules. Missing authorization looks like perfectly normal code.` },
    { q: `A catch block logs a failed signature check and then lets the request continue. What is this called?`, options: [`Fail-safe`, `Fail-open`, `Defence in depth`, `Rate limiting`], answer: 1, why: `Fail-open means a failure leaves the door open. A failed security check must stop the request.` },
    { q: `Which finding is written best?`, options: [`"This code is insecure and it worries me a lot. I have seen bugs like this before. Please fix it before we merge."`, `"Use parameters. Everyone knows that. We talked about this in the last three reviews and it keeps happening."`, `"Get(id) on line 42 loads by id only, so any user can read others' invoices. Add a CustomerId filter."`, `"I do not like this approach. It feels wrong to me, and I think the whole controller should be written again."`], answer: 2, why: `It says what is wrong, where, what the impact is and how to fix it. The author can act on it at once.` },
    { q: `The fixed controller returns NotFound both when an invoice does not exist and when it belongs to someone else. Why?`, options: [`Because a 404 response is faster to send than a 403`, `So a caller cannot learn which invoice ids exist`, `Because the 403 status code is deprecated in HTTP`, `To reduce how much the server writes to its logs`], answer: 1, why: `Different answers would let someone map out valid ids. The same answer for both cases gives nothing away.` },
    { q: `You find one query built with string concatenation. What should you do next?`, options: [`Fix that one query and close the review`, `Search the codebase for the same pattern`, `Disable the endpoint until the next release`, `Rewrite the whole data layer before merging`], answer: 1, why: `Mistakes come in families. The same habit has probably produced the same bug elsewhere.` }
  ],
  takeaways: [
    `Follow untrusted data from source to sink and ask what stands in between.`,
    `Spend your time on the high-risk areas: access control, input, SQL, files, crypto, secrets, errors, logs.`,
    `The most dangerous bug is the check that is missing. Compare with neighbouring code.`,
    `Tools find patterns. People find broken authorization and business logic.`,
    `A good finding states what, where, impact and fix.`,
    `Turn every real finding into a test or a rule so it cannot come back.`
  ],
  interview: [
    { q: `How do you approach a security review of a pull request?`, a: `<p>I read the description to understand the feature and what boundary it touches. I list the new entry points, then for each one I check authentication, server-side authorization and ownership filtering. I trace inputs to sinks such as SQL, file paths, HTML, logs and outbound calls and check that the right protection is in place for each sink. I read error handling for leaks and fail-open paths, then check secrets, new dependencies and config changes, and finally whether tests cover the forbidden cases. I write findings with what, where, impact and fix.</p>` },
    { q: `What do automated tools miss that a human reviewer catches?`, a: `<p>Anything that depends on meaning: missing or wrong authorization, IDOR, business rules such as limits and state transitions, multi-step logic flaws, race conditions in check-then-act code, and design problems such as trusting a value from the client. Tools are strong at syntactic patterns such as string-built SQL, weak algorithms and known vulnerable packages.</p>` },
    { q: `What is TOCTOU and how do you spot it in review?`, a: `<p>Time of check to time of use. The code checks a condition and acts on it later, and the state can change in between. Typical signs: read a balance or stock level, decide in application code, then write. The fix is to make check and action one atomic operation, for example an UPDATE with the condition in the WHERE clause, a transaction with the right isolation, or optimistic concurrency with a row version.</p>` },
    { q: `How do you review a very large pull request?`, a: `<p>First I ask whether it can be split. If not, I review in order of risk: authentication, authorization, data access, file and crypto code first, generated code and renames last. I take breaks, because accuracy falls after about an hour. I rely on scanners for pattern checks and spend my own attention on access control and logic, and I ask the author to walk me through the data flow.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-pentest — Security Testing & Ethical Hacking Basics             */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-pentest'] = {
  hook: `The difference between a security tester and a criminal is not skill. It is a signed piece of paper that says "yes, you may test this".`,
  intro: `<p><span class="term">Security testing</span> means checking, on purpose, whether a system can be misused. A <span class="term">penetration test</span> (pentest for short) is a security test done by skilled people who think like attackers but work for you. They try to get in, they write down exactly how, and they hand you a report so you can fix the holes before a real attacker finds them. People who do this work with permission are often called <span class="term">ethical hackers</span>.</p>
<p>As a developer you will rarely run a full pentest yourself. But you will meet this world in three ways. You will write security tests for your own features. You will help testers by explaining how the app works. And you will receive their report and have to fix what they found. This lesson prepares you for all three.</p>
<p>One rule comes before everything else, and it is not a technical rule. <strong>Only test systems you own, or systems where the owner has given you written permission.</strong> Testing someone else's system without permission is a crime in most countries, even if you meant well and even if you changed nothing. Everything in this lesson assumes you are inside that line.</p>
<p>We will cover the kinds of security testing, the phases a professional test goes through, what the well-known tools are for, how to write abuse-case tests in C#, and how to read a pentest report.</p>`,
  realLife: {
    title: 'The fire drill and the hired locksmith',
    body: `<p>A shop owner wants to know if the shop is safe from burglars. So the owner hires a locksmith and says: "Next Tuesday night, try to get in. You may try the doors and windows. Do not break the glass. Do not touch the cash. Tell me how far you got." The locksmith tries, gets in through a back window in four minutes, takes a photo as proof, and writes a short report: which window, why it opened, and which lock to buy.</p>
<p>Everything important about a pentest is in that small story. There is permission. There is a scope (doors and windows, not the neighbours' shop). There are rules (no broken glass). There is proof. And the result is a list of fixes, not damage.</p>
<p>It is also like a fire drill. Nobody expects a fire on Tuesday. You practise so that you find the blocked exit during a drill and not during a real fire.</p>
<p><strong>How this showed up in the real world:</strong> Many large technology companies now run public <span class="term">bug bounty</span> programs: they publish rules and pay independent researchers for valid security reports. It is a way of inviting testing under clear conditions. On the other side, in 2019 two professional testers who had been hired to test the security of courthouse buildings in the United States were arrested during the job, because the organisation that hired them and the organisation that owned the buildings had not agreed on what was allowed. The charges were later dropped, but the story is told in every pentest course for one reason: get the scope in writing, signed by someone who really has the authority.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The legal and ethical line</h4>
<p>Before any testing, three things must exist in writing: <strong>who</strong> gave permission (and that they have the right to give it), <strong>what</strong> may be tested (the scope), and <strong>when and how</strong> (the rules). If you find a weakness in a system you were not asked to test, stop, do not explore further, and report it through the owner's official contact.</p>
<div class="callout warn">"I was only looking" is not a defence. Without permission, scanning or probing someone else's system can break computer misuse laws. Practise on your own machines and on apps built for practice.</div>
<h4>Four kinds of security testing</h4>
<table><thead><tr><th>Type</th><th>Who does it</th><th>What it answers</th></tr></thead><tbody>
<tr><td><strong>Vulnerability scan</strong></td><td>An automated tool, often weekly</td><td>"Do we have known weaknesses?" Broad, fast, shallow.</td></tr>
<tr><td><strong>Penetration test</strong></td><td>Skilled people, for a fixed time and scope</td><td>"Can a weakness really be used, and how far does it lead?" Deep, with proof.</td></tr>
<tr><td><strong>Red team exercise</strong></td><td>A team acting like a real attacker with a goal</td><td>"Would we notice and stop a real attack?" Tests people and monitoring, not just software.</td></tr>
<tr><td><strong>Bug bounty</strong></td><td>Independent researchers, under published rules</td><td>"What did everyone else miss?" Ongoing, paid per valid finding.</td></tr>
</tbody></table>
<h4>How much the tester knows</h4>
<ul>
<li><strong>Black box:</strong> the tester starts with nothing but the address, like an outsider.</li>
<li><strong>Grey box:</strong> the tester gets normal user accounts and some documentation. This is the most common choice for web apps.</li>
<li><strong>White box:</strong> the tester also gets source code and architecture diagrams. It finds the most in the least time.</li>
</ul>
<h4>Where to practise safely</h4>
<p>There are apps made to be broken, such as OWASP Juice Shop and OWASP WebGoat. You run them on your own laptop and work through the lessons. This is the right way to learn how attacks look, because nothing real is at risk and nothing illegal happens.</p>
<div class="callout tip">The best first security test for a developer needs no special tool: log in as user A, copy a link to something A owns, log in as user B and open that link. If B can see it, you have found the most common serious web bug.</div>` },
    { name: 'Intermediate', body: `<h4>The phases of a professional test</h4>
<p>Most testing methods describe the same journey. Here it is at the level a developer needs.</p>
<ol>
<li><strong>Scoping and rules of engagement.</strong> Agree targets, dates, test accounts, what is forbidden (for example denial of service or touching real customer data), and who to call in an emergency.</li>
<li><strong>Reconnaissance.</strong> Learning about the target from the outside: which sites, which technologies, which public information exists.</li>
<li><strong>Scanning and mapping.</strong> Finding every page, endpoint, parameter and open service. You cannot test what you have not found.</li>
<li><strong>Finding and confirming weaknesses.</strong> Trying the classic problems against each input: access control, injection, session handling, file handling. The tester confirms a weakness with the smallest safe proof.</li>
<li><strong>Post-exploitation.</strong> Asking "what does this lead to?". Could this small hole reach other users' data or other systems? This shows real business impact. Testers stay inside the agreed limits.</li>
<li><strong>Reporting and retest.</strong> Each finding is written up with evidence and a fix. After you fix, the tester checks again.</li>
</ol>
<h4>What the well-known tools are for</h4>
<table><thead><tr><th>Tool</th><th>Category</th><th>In one line</th></tr></thead><tbody>
<tr><td>Burp Suite, ZAP (formerly OWASP ZAP)</td><td>Intercepting proxy and web scanner</td><td>Sits between browser and app so the tester can see, change and replay every request.</td></tr>
<tr><td>nmap</td><td>Network mapper</td><td>Shows which machines and ports answer on a network.</td></tr>
<tr><td>sqlmap</td><td>Injection tester</td><td>Automates checking whether a parameter is open to SQL injection.</td></tr>
<tr><td>Trivy, dependency scanners</td><td>Known-vulnerability scanners</td><td>Compare what you run against public advisories.</td></tr>
</tbody></table>
<p>Developers can use a proxy tool against their <em>own local app</em> to watch what the frontend really sends. It is a great way to understand your own API.</p>
<h4>Abuse-case tests: security tests you write yourself</h4>
<p>A <span class="term">use case</span> says what a user should be able to do. An <span class="term">abuse case</span> says what a user must <em>not</em> be able to do. Each abuse case becomes an automated test that runs on every build:</p>
<ul>
<li>A stranger with no login gets 401.</li>
<li>User B asking for user A's order gets 404 (or 403).</li>
<li>A normal user calling an admin endpoint gets 403.</li>
<li>Twenty wrong passwords in a row trigger 429.</li>
<li>Strange input gets 400, never 500.</li>
<li>Responses carry the security headers you expect.</li>
</ul>
<p>The code tab shows these as real C# integration tests. They are cheap to write and they protect the rule forever.</p>
<div class="callout idea">A pentest checks your app on one week of the year. Your abuse-case tests check it on every commit. You need both.</div>` },
    { name: 'Expert', body: `<h4>Getting value from a pentest</h4>
<p>A pentest is expensive, so prepare it like a project.</p>
<ul>
<li><strong>Pick the scope by risk.</strong> New features, authentication, payment and multi-tenant boundaries first. Give testers a threat model if you have one.</li>
<li><strong>Prefer grey or white box.</strong> Do not make paid experts spend three days guessing URLs. Give accounts for every role, API documentation and, where possible, source code.</li>
<li><strong>Use a production-like environment</strong> with realistic but fake data, the same configuration, and security controls switched on.</li>
<li><strong>Fix the easy things first.</strong> Run your scanners and fix known findings before the test, so testers spend their time on what only people can find.</li>
<li><strong>Tell operations.</strong> The monitoring team should know the dates and source addresses, unless testing their detection is part of the goal.</li>
</ul>
<h4>Reading the report</h4>
<p>A good finding has: a title, a <span class="term">severity</span> (often with a CVSS score), the affected component, a description, <strong>evidence</strong> (requests, responses, screenshots), <strong>steps to reproduce</strong>, the <strong>impact</strong> in business terms, and a <strong>remediation</strong>. When you receive it:</p>
<ol>
<li>Reproduce each finding yourself so you understand it.</li>
<li>Fix the root cause, not the example. If one endpoint lacks an ownership check, audit all of them.</li>
<li>Add a regression test that would have caught it.</li>
<li>Ask for a <span class="term">retest</span> and keep the evidence for auditors and customers.</li>
<li>Question severities with context, in both directions. A "medium" on your payment flow may be your top priority.</li>
</ol>
<h4>Standards worth knowing by name</h4>
<ul>
<li><strong>OWASP Web Security Testing Guide (WSTG):</strong> a catalogue of what to test in a web app and how.</li>
<li><strong>OWASP ASVS:</strong> a list of security requirements you can use as a test checklist at three depth levels.</li>
<li><strong>PTES and NIST SP 800-115:</strong> descriptions of the overall testing process.</li>
</ul>
<h4>Limits and honest expectations</h4>
<p>A pentest is a sample taken in a short time. A clean report means "these testers found nothing in this scope in these days". It does not mean the system is secure. Combine it with scanning in the pipeline, code review, abuse-case tests, and for mature teams a bug bounty or red team exercise.</p>
<h4>Responsible disclosure</h4>
<p>Publish a contact for security reports (a <code>security.txt</code> file is the common way), promise not to pursue good-faith reporters who follow your rules, acknowledge quickly, and tell them when it is fixed. People will find things. Make it easy for them to tell you instead of telling the world.</p>
<h4>What interviewers probe</h4>
<ul>
<li>Vulnerability scan versus pentest versus red team: when do you use each?</li>
<li>You get a report with 30 findings. How do you plan the work?</li>
<li>How do you turn a pentest finding into something that cannot come back?</li>
</ul>` }
  ],
  flow: {
    title: 'A penetration test from first call to closed findings',
    steps: [
      { title: 'Permission and scope', desc: 'The owner signs what may be tested, when, with which accounts, and what is off limits. Without this step nothing else may start.' },
      { title: 'Learn the target', desc: 'Testers read the docs, browse the app as each role, and note the technologies in use.' },
      { title: 'Map the surface', desc: 'Every page, API endpoint, parameter and file upload is listed. This map decides what gets tested.' },
      { title: 'Test the classics', desc: 'Access control, session handling, input handling and configuration are checked on each entry point.' },
      { title: 'Confirm with minimal proof', desc: 'A suspected weakness is confirmed in the smallest safe way, for example by reading the tester\'s own second test account, not real customer data.' },
      { title: 'Measure the impact', desc: 'Testers ask how far the weakness leads while staying inside the agreed limits. This sets the severity.' },
      { title: 'Report', desc: 'Each finding is written with evidence, steps to reproduce, business impact and a recommended fix.' },
      { title: 'Fix, test, retest', desc: 'Developers fix the root cause, add a regression test, and the testers verify the fix. The finding is closed with evidence.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Abuse-case tests: prove the forbidden things stay forbidden (xUnit + WebApplicationFactory)', code: `using System.Net;
using System.Net.Http.Json;
using Microsoft.AspNetCore.Mvc.Testing;
using Xunit;

public class AbuseCaseTests : IClassFixture<TestApp>   // TestApp: see the next tab
{
    private readonly TestApp _app;
    public AbuseCaseTests(TestApp app) => _app = app;

    [Fact]
    public async Task Anonymous_user_gets_401()
    {
        var res = await _app.CreateClient().GetAsync("/api/orders/1001");
        Assert.Equal(HttpStatusCode.Unauthorized, res.StatusCode);
    }

    [Fact]
    public async Task User_cannot_read_another_users_order()
    {
        // Order 1001 belongs to alice (seeded test data). Bob asks for it.
        var bob = _app.ClientFor("bob");
        var res = await bob.GetAsync("/api/orders/1001");

        // 404 hides whether the order exists. 403 is also acceptable. 200 is a bug.
        Assert.Contains(res.StatusCode, new[] { HttpStatusCode.NotFound, HttpStatusCode.Forbidden });
    }

    [Fact]
    public async Task Customer_cannot_call_admin_endpoint()
    {
        var bob = _app.ClientFor("bob", role: "Customer");
        var res = await bob.DeleteAsync("/api/admin/users/42");
        Assert.Equal(HttpStatusCode.Forbidden, res.StatusCode);
    }

    [Fact]
    public async Task Repeated_bad_logins_are_rate_limited()
    {
        var client = _app.CreateClient();
        var statuses = new List<HttpStatusCode>();
        for (var i = 0; i < 20; i++)
        {
            var res = await client.PostAsJsonAsync("/api/auth/login",
                new { email = "alice@example.com", password = "wrong-" + i });
            statuses.Add(res.StatusCode);
        }
        Assert.Contains(HttpStatusCode.TooManyRequests, statuses);   // 429 must appear
    }

    [Theory]
    [InlineData("/api/orders/abc")]
    [InlineData("/api/orders/-1")]
    [InlineData("/api/orders/99999999999999999999")]
    public async Task Strange_ids_give_4xx_never_500(string url)
    {
        var res = await _app.ClientFor("alice").GetAsync(url);
        Assert.InRange((int)res.StatusCode, 400, 499);
    }

    [Fact]
    public async Task Responses_carry_security_headers_and_hide_server_details()
    {
        var res = await _app.ClientFor("alice").GetAsync("/api/orders");
        Assert.Equal("nosniff", res.Headers.GetValues("X-Content-Type-Options").Single());
        Assert.True(res.Headers.Contains("Content-Security-Policy"));
        Assert.False(res.Headers.Contains("X-Powered-By"));
        Assert.False(res.Headers.Contains("Server"));
    }
}` },
    { lang: 'csharp', title: 'Test helper: sign in as any test user without real passwords (test project only)', code: `using System.Security.Claims;
using System.Text.Encodings.Web;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;
using Microsoft.AspNetCore.TestHost;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

// Starts the real app in memory and swaps authentication for a test scheme.
// This class lives ONLY in the test project. It must never ship.
public class TestApp : WebApplicationFactory<Program>
{
    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.ConfigureTestServices(services =>
        {
            services.AddAuthentication("Test")
                .AddScheme<AuthenticationSchemeOptions, TestAuthHandler>("Test", _ => { });
        });
    }

    public HttpClient ClientFor(string user, string role = "Customer")
    {
        var client = CreateClient(new WebApplicationFactoryClientOptions { AllowAutoRedirect = false });
        client.DefaultRequestHeaders.Add("X-Test-User", user);
        client.DefaultRequestHeaders.Add("X-Test-Role", role);
        return client;
    }
}

public class TestAuthHandler : AuthenticationHandler<AuthenticationSchemeOptions>
{
    public TestAuthHandler(IOptionsMonitor<AuthenticationSchemeOptions> options,
        ILoggerFactory logger, UrlEncoder encoder) : base(options, logger, encoder) { }

    protected override Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        // No header = anonymous. The real [Authorize] rules still run after this.
        if (!Request.Headers.TryGetValue("X-Test-User", out var user))
            return Task.FromResult(AuthenticateResult.NoResult());

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.ToString()),
            new Claim(ClaimTypes.Role, Request.Headers["X-Test-Role"].ToString())
        };
        var identity = new ClaimsIdentity(claims, "Test");
        var ticket = new AuthenticationTicket(new ClaimsPrincipal(identity), "Test");
        return Task.FromResult(AuthenticateResult.Success(ticket));
    }
}` },
    { lang: 'text', title: 'Templates: rules of engagement, and how one report finding looks', code: `=========== RULES OF ENGAGEMENT (agree and sign BEFORE testing) ===========
Client / system owner : <name, role, signature>     Date: <date>
Testing team          : <company, names>
In scope              : https://shop-staging.example.com  (web + /api)
                        Test accounts: customer1, customer2, admin1
Out of scope          : production, payment provider, corporate email,
                        any system not listed above
Allowed               : manual testing, authenticated scanning,
                        up to 10 requests per second
Not allowed           : denial of service, social engineering of staff,
                        reading or changing real customer data
Test window           : <start> to <end>, 09:00-18:00 local time
Source addresses      : <tester IPs, so monitoring can recognise them>
Emergency contacts    : client <phone>, testers <phone>
If real data is seen  : stop, do not copy, report within 1 hour
Data handling         : evidence stored encrypted, deleted after 90 days
Deliverables          : report + walkthrough call + one retest

=================== ONE FINDING, AS IT APPEARS IN A REPORT ===================
ID / Title   : F-03  Orders can be read by any logged-in customer
Severity     : High   (CVSS 7.x - network, low complexity, low privileges)
Affected     : GET /api/orders/{id}
Description  : The endpoint returns an order by its number without checking
               that it belongs to the caller.
Evidence     : Logged in as customer2, requested an order created by
               customer1. Response 200 with full order and address.
               (request/response pair and screenshot attached)
Reproduce    : 1. Log in as customer1, create an order, note its id.
               2. Log in as customer2.
               3. Request that id. Expected 404, actual 200.
Impact       : Any customer can read every customer's orders, names and
               addresses by counting through ids. Personal data breach.
Remediation  : Filter by the caller's customer id in the query. Return 404
               when not found or not owned. Review all /api/* endpoints
               for the same pattern. Add an automated test.
Status       : Open  ->  Fixed in build 2.14  ->  Retested, closed

HOW TO READ IT
 - Severity + Impact tell you the priority.
 - Evidence + Reproduce let you see it yourself. Do that first.
 - Remediation names the root cause. Fix the pattern, not the one URL.
 - Status is closed only after the tester's retest, not after your merge.` }
  ],
  pitfalls: [
    `Testing a system without written permission, or going beyond the agreed scope. Good intentions do not make it legal. Stop and ask.`,
    `Treating a clean pentest report as proof the app is secure. It is a time-boxed sample. Keep scanning, reviewing and testing all year.`,
    `Giving testers a black box and a few days. They spend the budget on discovery instead of depth. Provide accounts, docs and source where you can.`,
    `Fixing only the exact URL in the report. The same missing check usually exists on other endpoints. Fix the pattern and add a test.`,
    `Closing a finding when the fix is merged. It is closed when a retest confirms it.`,
    `Running aggressive scans against production or shared environments without telling anyone. You can cause an outage or a false incident.`
  ],
  checklist: [
    `Get written permission and a signed scope before any security testing`,
    `Write an abuse-case test for every "must not be able to" rule in a feature`,
    `Test with two user accounts: can user B reach user A's data?`,
    `Assert 401, 403/404, 429 and 400 responses in automated integration tests`,
    `Give pentesters accounts for every role, API docs and a production-like test environment`,
    `Fix scanner findings before the pentest so testers spend time on deeper issues`,
    `Reproduce each report finding yourself before fixing it`,
    `Fix the root cause across the codebase and add a regression test`,
    `Request a retest and keep the evidence`,
    `Publish a security contact so outsiders can report problems safely`
  ],
  quiz: [
    { q: `What must exist before any penetration test starts?`, options: [`A fast internet connection and a dedicated test laptop`, `Written permission and an agreed scope from the owner`, `The full source code and architecture diagrams`, `A public bug bounty program that has run for a year`], answer: 1, why: `Permission and scope are what separate legal testing from a crime. Everything else is optional.` },
    { q: `How does a penetration test differ from a vulnerability scan?`, options: [`A scan is done by hand by skilled people; a pentest is a fully automatic tool run`, `A pentest uses people to confirm weaknesses and show impact; a scan is automated`, `They are the same thing; the two names are just used by different tool vendors`, `A scan may only be run once a year; a pentest runs on every commit in the pipeline`], answer: 1, why: `Scans are broad and automatic. Pentests are deep, human-driven and prove what a weakness really leads to.` },
    { q: `In a grey-box test, what does the tester usually receive?`, options: [`Nothing except the company name`, `User accounts and some documentation`, `Full administrator access to production`, `Only the mobile app`], answer: 1, why: `Grey box means partial knowledge: normal accounts and docs. It balances realism with good use of time.` },
    { q: `Your test logs in as Bob and requests Alice's order. Which result shows a security bug?`, options: [`404 Not Found, no order data`, `403 Forbidden, no order data`, `200 OK with the order data`, `401 Unauthorized, no order data`], answer: 2, why: `Bob is logged in but must not see Alice's order. A 200 with data means the ownership check is missing.` },
    { q: `A pentest report lists a missing ownership check on one endpoint. What is the best fix?`, options: [`Block the tester's IP address at the firewall so the request fails`, `Fix that one endpoint, close the ticket and skip the retest`, `Fix the pattern on all endpoints, add a test and ask for a retest`, `Lower the severity, because only one endpoint was named in the report`], answer: 2, why: `The report shows an example of a pattern. Fix the root cause everywhere, protect it with a test and have it verified.` },
    { q: `While using a public website you notice it may have a weakness. What should you do?`, options: [`Explore further to be sure how bad it is before telling anyone`, `Post it on social media so that other users are warned quickly`, `Stop, and report it through the owner's security contact`, `Run a scanner against the site to collect proof for the report`], answer: 2, why: `You have no permission to test that site. Stop and report what you saw through the proper channel.` }
  ],
  takeaways: [
    `Permission and scope in writing come first. No permission, no testing.`,
    `Scans find known issues broadly. Pentests prove real impact in depth. Red teams test your detection. Bug bounties keep many eyes on you.`,
    `The phases: scope, learn, map, test, confirm, measure impact, report, retest.`,
    `Developers contribute most through abuse-case tests that run on every build.`,
    `Read a finding for evidence, reproduction, impact and remediation. Fix the pattern, not the example.`,
    `A clean report is a sample, not a guarantee.`
  ],
  interview: [
    { q: `Explain the difference between a vulnerability assessment, a penetration test and a red team exercise.`, a: `<p>A vulnerability assessment is mostly automated and broad: it lists known weaknesses. A penetration test is a time-boxed, scoped test by skilled people who confirm weaknesses and show what they lead to. A red team exercise is goal-based and stealthy; it checks whether the organisation would detect and respond to a realistic attacker, so it tests people and process as well as technology. You use scans continuously, pentests for important releases or yearly, and red teams once the basics are strong.</p>` },
    { q: `What are rules of engagement and why do they matter?`, a: `<p>They are the written agreement for a test: who authorises it, which systems are in and out of scope, dates and hours, allowed and forbidden techniques, test accounts, source addresses, emergency contacts and how data is handled. They protect the client from damage and the testers from legal risk, and they stop misunderstandings about what was allowed.</p>` },
    { q: `How do developers contribute to security testing?`, a: `<p>By writing abuse cases next to use cases and turning them into automated tests: unauthenticated access returns 401, cross-user access returns 404 or 403, role limits return 403, rate limits return 429, bad input returns 400. They also keep scanners green, prepare a realistic test environment and documentation for testers, and fix findings at the root cause with a regression test.</p>` },
    { q: `You receive a pentest report with many findings. How do you handle it?`, a: `<p>Triage by severity and business impact. Reproduce each finding. Group findings that share a root cause, because one fix may close several. Fix criticals and highs first, searching the codebase for the same pattern. Add regression tests. Track each item with an owner and date, request a retest, and feed the lessons into coding standards and the pipeline so the same class of bug is caught earlier next time.</p>` }
  ]
};

/* ------------------------------------------------------------------ */
/* sec-cloud-containers — Cloud & Container Security                   */
/* ------------------------------------------------------------------ */
window.CONTENT['sec-cloud-containers'] = {
  hook: `Most cloud breaches are not clever hacks. Someone left a door open with a single checkbox, and someone else walked through it.`,
  intro: `<p>Moving to the cloud does not move the responsibility for security to the cloud company. The provider (Azure, AWS, Google Cloud) keeps the buildings, the hardware and the core services safe. <strong>You</strong> decide who can log in, which storage is public, which ports are open and where the keys live. Those decisions are called <span class="term">configuration</span>, and wrong configuration is the number one cause of cloud data leaks.</p>
<p>This lesson has two halves. The first half is cloud security: the split of duties between you and the provider, identity, networks, encryption and logging. The second half is containers: how to build a small, locked-down Docker image and how to run it safely in Kubernetes.</p>
<p>A few words first. <span class="term">IAM</span> means Identity and Access Management: the system that decides who (or which service) may do what. A <span class="term">container</span> is a package that holds your app and everything it needs to run. An <span class="term">image</span> is the file a container is started from. <span class="term">Kubernetes</span> is a system that runs and manages many containers across many machines.</p>
<p>Examples use Azure names, with the AWS name beside them, because the ideas are the same on every cloud.</p>`,
  realLife: {
    title: 'Renting a flat in a secure building',
    body: `<p>You rent a flat in a building with a guard, cameras and strong walls. The landlord is responsible for the building: the main gate, the lift, the fire alarms. But if you leave your own front door open, hand copies of your key to ten friends, or tape the alarm code to the door, the guard downstairs cannot save you. Your flat, your responsibility.</p>
<p>The cloud is the building. The provider secures the data centre and the platform. You secure what you put in it and how you set it up. This split is called the <span class="term">shared responsibility model</span>.</p>
<p>Containers add one more picture. A container is like a shipping container on a cargo ship. Each one is sealed and holds one customer's goods, and many sit side by side on the same ship. A good container is packed with only what is needed, locked, and labelled. Nobody ships a container with the doors open and the owner's house keys inside.</p>
<p><strong>How this showed up in the real world:</strong> Again and again, companies have exposed millions of records because a cloud storage bucket holding backups or customer files was set to public. No hacking was needed, only the address. In a well-known 2019 case at a large US bank, an attacker used a misconfigured firewall component to make a server hand over its own cloud credentials. Those credentials belonged to a role with far more access than it needed, so the attacker could read storage holding data on around a hundred million customers. Two lessons in one story: one misconfiguration opened the door, and too-broad permissions turned a small hole into a huge breach.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The shared responsibility model</h4>
<table><thead><tr><th>The cloud provider secures</th><th>You secure</th></tr></thead><tbody>
<tr><td>Data centres, power, physical access</td><td>Who can sign in and what they may do</td></tr>
<tr><td>Hardware and the host operating system</td><td>Your data and whether it is public or private</td></tr>
<tr><td>The managed service itself (the database engine, the storage system)</td><td>Network rules, firewall settings, open ports</td></tr>
<tr><td>Global network</td><td>Your code, your container images, your secrets</td></tr>
</tbody></table>
<p>The more managed the service, the more the provider handles. With a virtual machine you also patch the operating system. With a managed database you do not. But identity, data and configuration are <em>always</em> yours.</p>
<h4>Identity is the new front door</h4>
<p>In an office, the wall and the locked door kept strangers out. In the cloud there is no wall. Every service is reached over the network with an identity. If an attacker gets a powerful identity, they are inside. So:</p>
<ul>
<li>Turn on multi-factor authentication for every human account.</li>
<li>Give each person and each service only the permissions it needs. This is <span class="term">least privilege</span>.</li>
<li>Do not use the all-powerful root or owner account for daily work.</li>
<li>Do not put long-lived access keys in code or config. Use <span class="term">managed identities</span> (Azure) or <span class="term">IAM roles</span> (AWS), where the platform gives your app a short-lived token automatically.</li>
</ul>
<h4>Keep data stores off the public internet</h4>
<p>Storage accounts, databases and caches should not be reachable from the whole internet. Block public access on storage by default. Put databases behind private network addresses. If something truly must be public, like images on a website, make that one container public on purpose and keep everything else closed.</p>
<h4>Containers in one minute</h4>
<p>A container image is built in layers: a <span class="term">base image</span> (a small operating system plus the .NET runtime) and then your app. Three simple rules already put you ahead of most teams:</p>
<ul>
<li>Use a small, official base image. Less inside means less to attack.</li>
<li>Do not run the app as <code>root</code>, the all-powerful user.</li>
<li>Never copy secrets into the image. Anyone who can pull the image can read every layer.</li>
</ul>
<div class="callout tip">Ask one question about every cloud resource you create: "Who can reach this, and who can change it?" If you cannot answer, find out before you move on.</div>` },
    { name: 'Intermediate', body: `<h4>The same ideas on Azure and AWS</h4>
<table><thead><tr><th>Need</th><th>Azure</th><th>AWS</th></tr></thead><tbody>
<tr><td>Identity for people</td><td>Microsoft Entra ID</td><td>IAM Identity Center</td></tr>
<tr><td>Identity for apps, no stored keys</td><td>Managed identity</td><td>IAM role</td></tr>
<tr><td>Secrets and keys</td><td>Key Vault</td><td>Secrets Manager, KMS</td></tr>
<tr><td>Network firewall rules</td><td>Network security group</td><td>Security group</td></tr>
<tr><td>Private access to managed services</td><td>Private endpoint</td><td>PrivateLink / VPC endpoint</td></tr>
<tr><td>Audit trail of every change</td><td>Activity log</td><td>CloudTrail</td></tr>
<tr><td>Rules that block bad setups</td><td>Azure Policy</td><td>Service control policies, Config rules</td></tr>
<tr><td>Security findings in one place</td><td>Defender for Cloud</td><td>Security Hub, GuardDuty</td></tr>
</tbody></table>
<h4>Network layout</h4>
<p>Put only the entry point (a load balancer or gateway with a web application firewall) in a public subnet. The app runs in a private subnet. The database sits in another private subnet that accepts connections only from the app. Outbound traffic from the app is limited to the places it needs. Each wall limits how far an attacker can move.</p>
<h4>Encryption and keys</h4>
<p>Use TLS for everything in transit, including between your own services. Encryption at rest is usually on by default for managed storage and databases. Keep it on. Store secrets and keys in the vault, give the app's identity read access to only the secrets it needs, and turn on logging of who read which secret.</p>
<h4>Logging and audit trails</h4>
<p>Turn on the cloud audit log for every subscription or account, and send it to a storage place that normal admins cannot delete from. When something goes wrong, the first question is "who changed what, and when?". Without the audit trail there is no answer.</p>
<h4>Hardening the container</h4>
<ul>
<li><strong>Multi-stage build:</strong> compile in a big SDK image, copy only the published output into a small runtime image.</li>
<li><strong>Non-root user</strong> and, where possible, a <strong>read-only file system</strong>, so an attacker who gets in cannot install tools.</li>
<li><strong>Pin the base image</strong> by digest (a fingerprint of the exact image) so it cannot change under you. Let an update bot raise the digest.</li>
<li><strong>Scan images</strong> in the pipeline and in the registry, and rebuild often so system patches arrive.</li>
<li><strong>Secrets at runtime only:</strong> from the vault or environment, never baked into a layer or passed as a build argument.</li>
</ul>
<div class="callout warn">Deleting a secret in a later Dockerfile line does not remove it. It still exists in the earlier layer. If a secret ever got into an image, rotate the secret.</div>` },
    { name: 'Expert', body: `<h4>Kubernetes: secure the cluster, the workloads and the paths between them</h4>
<ul>
<li><strong>Namespaces</strong> group workloads by team or environment. They are a way to organise and to attach rules. They are not a hard wall on their own.</li>
<li><strong>RBAC</strong> (role-based access control) decides who may do what in the cluster. Avoid <code>cluster-admin</code> for people and pipelines. Give each workload its own service account, and switch off the automatic API token mount for pods that never call the Kubernetes API.</li>
<li><strong>Network policies.</strong> By default every pod can talk to every other pod. Start with a default-deny policy per namespace, then allow only the flows you need: ingress controller to API, API to database.</li>
<li><strong>Pod security settings.</strong> Run as non-root, forbid privilege escalation, drop all Linux capabilities, use a read-only root file system and the default seccomp profile. Enforce the "restricted" Pod Security Standard on namespaces so a careless manifest is rejected.</li>
<li><strong>Secrets.</strong> A Kubernetes Secret is only base64-encoded, which is not encryption. Turn on encryption at rest for the cluster store, limit who can read secrets with RBAC, and prefer loading secrets from the cloud vault with workload identity.</li>
<li><strong>Resource limits.</strong> Set CPU and memory requests and limits so one misbehaving or attacked pod cannot starve the rest.</li>
<li><strong>Admission control.</strong> Policy engines can refuse images that are unsigned, come from unknown registries or run as root.</li>
</ul>
<h4>Infrastructure as Code and policy as code</h4>
<p>Create cloud resources from Terraform or Bicep files that go through pull requests, never by hand in the portal. The files can be scanned before anything is created, changes are reviewed, and the history is in git. <span class="term">Policy as code</span> goes one step further: rules like "no public storage", "no database without private endpoint" and "all resources in approved regions" are enforced by the platform, so a mistake is rejected instead of deployed. Run a <span class="term">drift</span> check to catch manual changes that no longer match the files.</p>
<h4>Blast radius</h4>
<p>Assume one thing will be compromised and ask how far the damage spreads. Separate production from non-production in different subscriptions or accounts. Give each service its own identity with its own narrow permissions. In the 2019 bank case, the first weakness was small. The breadth of the role's permissions made it a disaster.</p>
<h4>Metadata services and SSRF</h4>
<p>Cloud machines can ask a local <span class="term">metadata service</span> for their own credentials. If your app has a server-side request forgery bug, an attacker may trick it into fetching those credentials. Defences: fix SSRF in the app, use the hardened metadata options your cloud offers, restrict pod access to the node metadata address, and keep the identity's permissions small.</p>
<h4>Continuous posture checks</h4>
<p>Cloud environments change daily. Use the provider's posture tool to score your setup against a benchmark such as the CIS benchmarks, alert on new public exposure and on new owner-level role assignments, and review unused permissions and stale keys every quarter.</p>
<div class="callout idea">A useful drill: pick one service and write down everything its identity is allowed to do. Then ask what an attacker could do with exactly that list. Remove what the service never uses.</div>
<h4>What interviewers probe</h4>
<ul>
<li>Explain shared responsibility with an example for a managed database.</li>
<li>How do you give a pod access to a database without storing a password?</li>
<li>What does a secure pod spec look like, and why each line?</li>
</ul>` }
  ],
  flow: {
    title: 'How one misconfiguration becomes a breach, and where good setup stops it',
    steps: [
      { title: 'A small hole', desc: 'An internet-facing component is misconfigured, or the app has a bug that lets an outsider make the server fetch a URL of their choice.' },
      { title: 'Ask for credentials', desc: 'The attacker points that request at the machine\'s local metadata service to obtain the identity the server runs as.' },
      { title: 'Stop 1: hardened metadata', desc: 'With the hardened metadata settings and restricted pod access, the simple forwarded request is refused.' },
      { title: 'Use the identity', desc: 'If credentials leak, the attacker can do exactly what that identity is allowed to do. Nothing more, nothing less.' },
      { title: 'Stop 2: least privilege', desc: 'A narrow role can read one container of app files. It cannot list every storage account or read backups.' },
      { title: 'Stop 3: private network', desc: 'Storage and databases accept connections only from the private network, so stolen credentials do not work from the attacker\'s laptop.' },
      { title: 'Stop 4: audit and alerts', desc: 'The audit log shows unusual access. An alert fires on a role being used from a new place or listing many resources.' },
      { title: 'Contain', desc: 'The team revokes the identity\'s sessions, rotates secrets and closes the first hole. The damage stays small because each layer limited the next step.' }
    ]
  },
  code: [
    { lang: 'text', title: 'Fixed: a hardened Dockerfile for ASP.NET Core', code: `# ---------- build stage: big image with the SDK, never shipped ----------
FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

# Restore first so this layer is cached; locked mode = no surprise versions
COPY Shop.Api/Shop.Api.csproj Shop.Api/packages.lock.json Shop.Api/
RUN dotnet restore Shop.Api/Shop.Api.csproj --locked-mode

COPY . .
RUN dotnet publish Shop.Api/Shop.Api.csproj -c Release -o /app --no-restore

# ---------- runtime stage: small image, no shell, no package manager ----------
# "chiseled" images contain only what .NET needs and run as a non-root user.
# Use a .NET version that still gets security patches (check the current support list).
# In real projects pin the exact image:  ...aspnet:10.0-noble-chiseled@sha256:<digest>
FROM mcr.microsoft.com/dotnet/aspnet:10.0-noble-chiseled AS final
WORKDIR /app
COPY --from=build /app .

# Run as the built-in non-root user (already the default here; stated on purpose)
USER $APP_UID

# Listen on an unprivileged port. Ports below 1024 need root.
ENV ASPNETCORE_HTTP_PORTS=8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "Shop.Api.dll"]

# ---- What is deliberately NOT here ----
# No secrets: no ENV with passwords, no COPY of .env files, no ARG tokens.
#   Secrets arrive at runtime from the vault or the orchestrator.
# No curl, no shell, no compilers in the final image.
# A .dockerignore keeps .git, bin/, obj/, tests and local settings out of the build context.` },
    { lang: 'text', title: 'Fixed: Kubernetes deployment with a locked-down pod and default-deny network', code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: shop-api
  namespace: shop
spec:
  replicas: 3
  selector:
    matchLabels: { app: shop-api }
  template:
    metadata:
      labels: { app: shop-api }
    spec:
      serviceAccountName: shop-api            # its own identity, not "default"
      automountServiceAccountToken: false     # the app never calls the cluster API
      securityContext:
        runAsNonRoot: true
        runAsUser: 1654                       # non-root user in the .NET image
        seccompProfile: { type: RuntimeDefault }
      containers:
        - name: api
          image: registry.example.com/shop-api@sha256:<digest>   # pinned, signed image
          ports: [{ containerPort: 8080 }]
          securityContext:
            allowPrivilegeEscalation: false
            readOnlyRootFilesystem: true
            capabilities: { drop: ["ALL"] }
          resources:
            requests: { cpu: 100m, memory: 128Mi }
            limits:   { cpu: 500m, memory: 512Mi }
          volumeMounts:
            - { name: tmp, mountPath: /tmp }  # the only writable place
          readinessProbe:
            httpGet: { path: /health/ready, port: 8080 }
      volumes:
        - name: tmp
          emptyDir: {}
---
# 1) Nothing may talk to anything in this namespace unless a rule allows it
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny, namespace: shop }
spec:
  podSelector: {}
  policyTypes: ["Ingress", "Egress"]
---
# 2) Allow only: ingress controller -> shop-api on 8080
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-ingress-to-api, namespace: shop }
spec:
  podSelector: { matchLabels: { app: shop-api } }
  policyTypes: ["Ingress"]
  ingress:
    - from:
        - namespaceSelector: { matchLabels: { kubernetes.io/metadata.name: ingress-nginx } }
      ports: [{ protocol: TCP, port: 8080 }]
# (Add matching Egress rules for DNS and the database before going live.)
---
# 3) Reject careless manifests in this namespace (create the namespace first)
apiVersion: v1
kind: Namespace
metadata:
  name: shop
  labels:
    pod-security.kubernetes.io/enforce: restricted` },
    { lang: 'csharp', title: 'Vulnerable vs fixed: reaching cloud services without stored keys', code: `// dotnet add package Azure.Identity
// dotnet add package Azure.Storage.Blobs
// dotnet add package Azure.Extensions.AspNetCore.Configuration.Secrets
using Azure.Identity;
using Azure.Storage.Blobs;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// ---------------- Vulnerable ----------------
// A long-lived account key in config. Anyone who reads the repo, the image,
// the pipeline logs or a memory dump can use it from anywhere, forever.
//
//   var blobs = new BlobServiceClient(
//       "DefaultEndpointsProtocol=https;AccountName=shopfiles;AccountKey=<key>");
//   var conn  = "Server=shop-sql;Database=Shop;User Id=sa;Password=<password>";

// ---------------- Fixed ----------------
// DefaultAzureCredential uses the app's managed identity in Azure and your
// developer login on a laptop. There is no secret to store, leak or rotate.
var credential = new DefaultAzureCredential();

// Secrets that must exist (third-party API keys) come from Key Vault.
builder.Configuration.AddAzureKeyVault(
    new Uri("https://shop-kv.vault.azure.net/"), credential);

// Storage: identity-based access. Grant the identity only
// "Storage Blob Data Reader" on the one container it needs.
builder.Services.AddSingleton(new BlobServiceClient(
    new Uri("https://shopfiles.blob.core.windows.net"), credential));

// SQL: no password in the connection string. The identity is a database user
// with only the rights the app needs (not db_owner).
var sql = "Server=tcp:shop-sql.database.windows.net,1433;Database=Shop;" +
          "Authentication=Active Directory Default;Encrypt=True;";
builder.Services.AddDbContext<ShopDb>(o => o.UseSqlServer(sql));

var app = builder.Build();
app.MapGet("/health/ready", () => Results.Ok());
app.Run();

// AWS equivalent: run the task or pod with an IAM role and let the AWS SDK
// pick up its short-lived credentials automatically. No access keys in config.` }
  ],
  pitfalls: [
    `Assuming the cloud provider secures your configuration. They secure the platform. Public storage, open ports and broad roles are your settings.`,
    `Giving a service an owner or contributor role "to make it work". When that service is compromised, so is everything the role can touch.`,
    `Leaving storage or databases reachable from the whole internet and trusting the password. Use private endpoints and block public access.`,
    `Baking secrets into container images or passing them as build arguments. Every layer is readable by anyone who can pull the image.`,
    `Running containers as root with a writable file system. A small bug then gives an attacker a full toolbox inside the container.`,
    `Believing a Kubernetes Secret is encrypted. It is only encoded. Turn on encryption at rest and restrict who can read secrets.`
  ],
  checklist: [
    `Require MFA for every human cloud account and stop daily use of root or owner accounts`,
    `Give each service its own identity with only the permissions it uses`,
    `Replace stored access keys and passwords with managed identities or IAM roles`,
    `Block public access on storage accounts and put databases on private endpoints`,
    `Turn on the cloud audit log and send it somewhere admins cannot delete from`,
    `Build images with a multi-stage Dockerfile on a small, pinned base image`,
    `Run containers as non-root with a read-only root file system and no extra capabilities`,
    `Apply a default-deny network policy in every Kubernetes namespace`,
    `Set CPU and memory limits and disable the automatic service account token where unused`,
    `Create infrastructure from reviewed code and enforce "no public data stores" with policy`
  ],
  quiz: [
    { q: `Under the shared responsibility model, who is responsible if a storage container holding customer files is set to public?`, options: [`The cloud provider`, `You, the customer`, `The internet service provider`, `Nobody, it is a default`], answer: 1, why: `The provider secures the storage service. Whether your data in it is public or private is your configuration and your responsibility.` },
    { q: `Why are managed identities or IAM roles safer than access keys in config?`, options: [`They make every call to the cloud service faster`, `They never expire, so there is nothing to rotate or renew`, `Tokens are short-lived, so no long-lived secret can leak`, `They give the app more permissions than a key would`], answer: 2, why: `There is nothing to store in code, images or pipelines. Tokens are short-lived and tied to the workload.` },
    { q: `Which Dockerfile practice reduces what an attacker can do after getting into a container?`, options: [`Using the largest base image so every tool is on hand`, `Running as root so the app can fix its own problems`, `Using a small runtime image and a non-root user`, `Copying the .env file into the image`], answer: 2, why: `A small image has fewer tools and fewer flaws, and a non-root user has limited power inside the container.` },
    { q: `What is the default network behaviour between pods in Kubernetes when no network policy exists?`, options: [`All traffic is blocked`, `Every pod can talk to every other pod`, `Only pods in the same deployment can talk`, `Only HTTPS is allowed`], answer: 1, why: `Kubernetes allows all pod-to-pod traffic by default. A default-deny policy plus specific allow rules changes that.` },
    { q: `A Kubernetes Secret is base64-encoded. What does that mean for its safety?`, options: [`It is strongly encrypted, so it is safe to commit to git`, `It is only encoded, so anyone with access can read it`, `It can never be read by pods, only by cluster admins`, `It is deleted after one use and must be created again`], answer: 1, why: `Base64 is a way of writing bytes as text, not encryption. Protect secrets with cluster encryption, RBAC or an external vault.` },
    { q: `In the bank breach story, what turned a small weakness into a very large breach?`, options: [`The servers were too slow to block the attacker in time`, `The stolen identity had far more access than it needed`, `The data was encrypted with a key that was too short`, `The audit log was switched on and filled up the storage`], answer: 1, why: `Least privilege limits the blast radius. A narrow role would have exposed far less data.` }
  ],
  takeaways: [
    `The provider secures the cloud. You secure what you configure and put in it.`,
    `Identity is the front door: MFA, least privilege, no long-lived keys.`,
    `Data stores stay private by default. Public access is a deliberate exception.`,
    `Small, pinned, non-root, read-only containers with no secrets inside.`,
    `In Kubernetes: own service account, default-deny network, restricted pod settings, resource limits.`,
    `Infrastructure as code plus policy as code turns "please remember" into "cannot deploy".`
  ],
  interview: [
    { q: `Explain the shared responsibility model with an example.`, a: `<p>The provider is responsible for security <em>of</em> the cloud: data centres, hardware, the virtualisation layer and the managed service software. The customer is responsible for security <em>in</em> the cloud: identities, data, network rules and configuration. For a managed SQL database the provider patches the engine and the host. The customer decides who can connect, whether it has a public endpoint, which logins exist, what data is stored and whether auditing is on.</p>` },
    { q: `How would you let an app in Kubernetes read from a database or storage without a stored password?`, a: `<p>Use workload identity. The pod runs under a Kubernetes service account that is federated with a cloud identity (a managed identity in Azure, an IAM role in AWS). The SDK inside the app exchanges the pod's token for a short-lived cloud token. The cloud identity is granted only the specific data-plane role it needs. No password or key is stored in the image, a Secret or the pipeline.</p>` },
    { q: `Describe a secure pod specification.`, a: `<p>Its own service account with the token mount disabled if unused; runAsNonRoot with a fixed user id; allowPrivilegeEscalation false; all capabilities dropped; readOnlyRootFilesystem true with an emptyDir for temp files; the RuntimeDefault seccomp profile; CPU and memory requests and limits; an image pinned by digest from a trusted registry; secrets from a vault; and the namespace covered by a default-deny network policy and the restricted Pod Security Standard.</p>` },
    { q: `What are the most common cloud security mistakes and how do you prevent them?`, a: `<p>Public data stores, over-broad roles, long-lived keys in code or pipelines, missing MFA, open management ports, and no audit logging. Prevent them with identity-first design and least privilege, managed identities, private endpoints, infrastructure as code with scanning, policy as code that blocks the bad patterns, continuous posture monitoring against a benchmark, and alerts on new public exposure or privileged role assignments.</p>` }
  ]
};
