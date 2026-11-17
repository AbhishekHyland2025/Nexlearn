// DevPath content: Module 6, Computer Networks (7 topics). Shape: see SPEC.md.
window.CONTENT = window.CONTENT || {};

/* ───────────────────────── m6-osi-tcpip ───────────────────────── */
window.CONTENT['m6-osi-tcpip'] = {
  hook: `Every time you open a web page, your request is wrapped like a parcel seven times, shipped, and unwrapped seven times on the other side. Once you can see the wrapping, every network bug stops being magic.`,
  intro: `<p>A <span class="term">network model</span> is a way of splitting the job of "send data from my computer to yours" into layers. Each layer does one job and hands the result to the next one. The two models you will meet are the <span class="term">OSI model</span> (7 layers, used for teaching and talking) and the <span class="term">TCP/IP model</span> (4 layers, what the internet really runs on).</p>
<p>Why do layers matter to you as a developer? Because when something breaks, the layer tells you where to look. "DNS is not resolving" is a different problem from "the TCP connection timed out", which is different from "the server returned 500". Each of those lives on a different layer, and each needs a different fix.</p>
<p>The key idea is <span class="term">encapsulation</span>: each layer adds its own small header (a label) to the data, like putting a letter in an envelope, then that envelope into a courier bag, then that bag into a truck. On the receiving side the layers are peeled off in reverse order.</p>`,
  realLife: {
    title: 'Sending a birthday gift across the country',
    body: `<p>You write a card (the data). You put it in a box with a note "to Priya" (application layer). You wrap the box and number it "parcel 2 of 3" so she can reassemble a split gift (transport layer). The courier sticks a label with her full street address (network layer). The truck driver only cares about the next depot, not the final address (data link layer). The road itself just carries trucks (physical layer).</p>
<p>Nobody in this chain needs to understand the whole journey. The driver does not read the card. Priya does not care which roads were used. That separation is exactly why the internet scales: Google, your ISP and your Wi-Fi router each handle one layer and trust the others.</p>
<p>Where real companies use this: when Cloudflare says "we mitigate layer 3/4 attacks and layer 7 attacks", they mean floods of raw packets (network/transport) versus floods of real-looking HTTP requests (application). Different attack, different layer, different defence.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>The 7 OSI layers, top to bottom</h4>
<table><thead><tr><th>#</th><th>Layer</th><th>Job in one line</th><th>Example</th></tr></thead><tbody>
<tr><td>7</td><td>Application</td><td>The protocol your program speaks</td><td>HTTP, DNS, SMTP</td></tr>
<tr><td>6</td><td>Presentation</td><td>Format, encrypt, compress</td><td>TLS, JSON encoding, gzip</td></tr>
<tr><td>5</td><td>Session</td><td>Open, keep and close a conversation</td><td>TLS session resume, RPC sessions</td></tr>
<tr><td>4</td><td>Transport</td><td>Deliver to the right program, reliably or not</td><td>TCP, UDP (ports)</td></tr>
<tr><td>3</td><td>Network</td><td>Find a path across many networks</td><td>IP, routers</td></tr>
<tr><td>2</td><td>Data link</td><td>Move frames to the next device on the same network</td><td>Ethernet, Wi-Fi, MAC addresses</td></tr>
<tr><td>1</td><td>Physical</td><td>Turn bits into signals</td><td>Cables, radio, fibre</td></tr>
</tbody></table>
<p>A memory trick, top to bottom: <strong>A</strong>ll <strong>P</strong>eople <strong>S</strong>eem <strong>T</strong>o <strong>N</strong>eed <strong>D</strong>ata <strong>P</strong>rocessing.</p>
<h4>The 4 TCP/IP layers</h4>
<p>The real internet collapses the model: <strong>Application</strong> (OSI 5-7), <strong>Transport</strong> (OSI 4), <strong>Internet</strong> (OSI 3), <strong>Link</strong> (OSI 1-2). When people say "layer 4 load balancer" or "layer 7 firewall", they are using OSI numbers even though the software is TCP/IP.</p>
<h4>Where do you live as a developer?</h4>
<p>Almost always at layer 7 (you write HTTP APIs) and layer 4 (you choose ports, you see "connection refused"). You rarely touch layer 3 or below, but you need to recognise their errors: "no route to host" is layer 3, "cable unplugged" is layer 1.</p>
<div class="callout tip"><p>Rule of thumb: if the error mentions a URL or status code, think layer 7. If it mentions a port or a timeout, think layer 4. If it mentions an IP or "unreachable", think layer 3.</p></div>` },
    { name: 'Intermediate', body: `<h4>Encapsulation, step by step</h4>
<p>Suppose your Angular app calls <code>GET https://api.shop.com/products</code>. Here is what gets wrapped around those bytes on the way down:</p>
<ol>
<li><strong>Application:</strong> the HTTP request text: method, path, headers.</li>
<li><strong>Presentation/Session:</strong> TLS encrypts that text so only the server can read it.</li>
<li><strong>Transport:</strong> TCP splits it into <span class="term">segments</span> and adds a header with source port (random, say 51234) and destination port (443), plus sequence numbers.</li>
<li><strong>Network:</strong> IP adds a header with your IP and the server's IP. Now it is a <span class="term">packet</span>.</li>
<li><strong>Data link:</strong> Ethernet or Wi-Fi adds the MAC address of your router (not the server!). Now it is a <span class="term">frame</span>.</li>
<li><strong>Physical:</strong> the frame becomes electrical or radio signals.</li>
</ol>
<p>Each router along the way strips the link-layer frame, reads the IP header to decide the next hop, and wraps a new frame for the next cable. The IP header survives the whole trip; the link header is replaced at every hop. That is why the MAC address is only ever "the next device", never the final server.</p>
<h4>What each layer knows and does not know</h4>
<div class="compare"><div><h5>TCP knows</h5><p>Ports, byte order, whether data arrived. It does not know what the bytes mean.</p></div><div><h5>HTTP knows</h5><p>Paths, headers, JSON. It does not know how many packets it took or which route they used.</p></div></div>
<h4>Reading a problem by layer</h4>
<table><thead><tr><th>Symptom</th><th>Likely layer</th><th>First tool</th></tr></thead><tbody>
<tr><td>Name does not resolve</td><td>7 (DNS)</td><td>nslookup / dig</td></tr>
<tr><td>Connection refused</td><td>4 (nothing listening on that port)</td><td>netstat / ss, telnet host port</td></tr>
<tr><td>Connection timed out</td><td>3/4 (firewall or route)</td><td>ping, traceroute</td></tr>
<tr><td>Certificate error</td><td>6 (TLS)</td><td>openssl s_client</td></tr>
<tr><td>HTTP 502/504</td><td>7 (proxy cannot reach backend)</td><td>curl -v, server logs</td></tr>
</tbody></table>
<div class="callout warn"><p>"The network is down" is almost never the right diagnosis. Find the layer first, then the fix is usually obvious.</p></div>` },
    { name: 'Expert', body: `<h4>Why the models differ, and why it matters</h4>
<p>OSI was designed by committee in the 1980s before the internet won. TCP/IP was designed by engineers building a working system. The OSI session and presentation layers never became separate protocols; TLS does both jobs and sits awkwardly "between 4 and 7". Modern engineers say "layer 7" for anything HTTP-aware and "layer 4" for anything that only sees IP + port. Do not get stuck arguing which layer TLS is on; interviewers want you to know what each level can and cannot inspect.</p>
<h4>What a layer boundary buys you</h4>
<ul>
<li><strong>Layer 4 load balancers</strong> (Azure Load Balancer, AWS NLB) forward TCP connections without decrypting. Fast, cheap, no HTTP routing.</li>
<li><strong>Layer 7 load balancers</strong> (Application Gateway, ALB, YARP, nginx) terminate TLS and route by path, host or header. Slower per packet, far more useful.</li>
<li><strong>Firewalls</strong> at layer 3/4 filter by IP and port; a <span class="term">WAF</span> (web application firewall) at layer 7 reads the HTTP body for SQL injection patterns.</li>
</ul>
<h4>MTU, fragmentation and the "big request" bug</h4>
<p>Each link has a maximum frame size (<span class="term">MTU</span>, usually 1500 bytes on Ethernet). IP packets bigger than that get fragmented, or dropped if the "do not fragment" flag is set. A classic production mystery: small requests work, large uploads hang. The cause is often a VPN or tunnel that lowers the MTU and a firewall that blocks the ICMP messages that would tell the sender to shrink packets. Knowing the layers tells you to look at MTU, not at your C# code.</p>
<h4>Cross-layer leaks you should know</h4>
<ul>
<li>HTTP/3 moved transport logic (QUIC) into user space on top of UDP, blurring layers 4 and 7 on purpose to iterate faster than operating systems do.</li>
<li>Kubernetes network policies are layer 3/4; service meshes (Istio, Linkerd) add layer 7 policy by injecting proxies.</li>
<li>Proxy Protocol and <code>X-Forwarded-For</code> exist because layer 4 devices hide the client IP from layer 7 apps. In ASP.NET Core you must configure <code>ForwardedHeadersOptions</code> or every user looks like they come from the load balancer.</li>
</ul>
<div class="callout idea"><p>Interview angle: "Walk me through what happens when I type a URL and press Enter." Answer layer by layer: DNS (7), TCP handshake (4), TLS handshake (6), HTTP request (7), then back up. Mention that each hop rewrites the frame but never the IP packet.</p></div>` }
  ],
  flow: {
    title: 'A web request goes down the stack and back up',
    steps: [
      { title: 'App writes HTTP', desc: 'Your code builds "GET /products" with headers. This is plain text at the application layer.' },
      { title: 'TLS encrypts', desc: 'The text is encrypted so nobody on the path can read or change it.' },
      { title: 'TCP segments', desc: 'Data is cut into segments, each stamped with ports (51234 → 443) and a sequence number.' },
      { title: 'IP addresses', desc: 'Each segment gets an IP header: from your IP, to the server IP. Routers read only this.' },
      { title: 'Link frames', desc: 'A frame with the MAC address of your router wraps the packet. This wrapper is replaced at every hop.' },
      { title: 'Signals travel', desc: 'Bits become radio or light. Routers unwrap frames, read the IP header, re-wrap and forward.' },
      { title: 'Server unwraps', desc: 'The server peels off frame, IP, TCP, TLS, and finally sees "GET /products". The response takes the same trip back.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'See the layers from C#: DNS, TCP, TLS, HTTP in one program', code: `using System.Net;
using System.Net.Security;
using System.Net.Sockets;
using System.Text;

// Layer 7 (DNS): name -> IP addresses
var host = "example.com";
var ips = await Dns.GetHostAddressesAsync(host);
Console.WriteLine("DNS: " + host + " -> " + string.Join(", ", ips.Select(i => i.ToString())));

// Layer 4 (TCP): open a connection to port 443
using var tcp = new TcpClient();
await tcp.ConnectAsync(ips[0], 443);
Console.WriteLine("TCP: connected from local port " + ((IPEndPoint)tcp.Client.LocalEndPoint!).Port);

// Layer 6 (TLS): encrypt the stream and check the certificate
using var ssl = new SslStream(tcp.GetStream());
await ssl.AuthenticateAsClientAsync(host);
Console.WriteLine("TLS: " + ssl.SslProtocol + ", cipher " + ssl.NegotiatedCipherSuite);

// Layer 7 (HTTP): write a raw request and read the first line of the reply
var request = "GET / HTTP/1.1\\r\\nHost: " + host + "\\r\\nConnection: close\\r\\n\\r\\n";
await ssl.WriteAsync(Encoding.ASCII.GetBytes(request));

var buffer = new byte[4096];
int n = await ssl.ReadAsync(buffer);
var firstLine = Encoding.ASCII.GetString(buffer, 0, n).Split("\\r\\n")[0];
Console.WriteLine("HTTP: " + firstLine);   // e.g. HTTP/1.1 200 OK

// HttpClient does all four steps for you. Use it in real code.
// This program exists so you can SEE the layers once.` },
    { lang: 'bash', title: 'One tool per layer', code: `# Layer 1-2: is the interface up, what is my MAC and IP?
ip addr            # Linux (ipconfig /all on Windows)

# Layer 3: can I reach the host, and which route do packets take?
ping -c 4 example.com
traceroute example.com      # tracert on Windows

# Layer 4: is something listening on the port?
ss -ltnp                    # list listening TCP ports (netstat -ano on Windows)
nc -vz example.com 443      # try to open a TCP connection

# Layer 6: inspect the TLS handshake and certificate chain
openssl s_client -connect example.com:443 -servername example.com </dev/null | head -20

# Layer 7: see the full HTTP exchange
curl -v https://example.com/ -o /dev/null` },
    { lang: 'text', title: 'What a single packet looks like on the wire', code: `+----------------+----------------+----------------+-------------------------+
| Ethernet frame | IP header      | TCP header     | TLS record -> HTTP data |
| dst MAC: router| src: 10.0.0.5  | src port 51234 | (encrypted)             |
| src MAC: laptop| dst: 20.1.2.3  | dst port 443   |  GET /products HTTP/1.1 |
| type: IPv4     | TTL: 64        | seq: 1001      |  Host: api.shop.com     |
|                | proto: TCP     | flags: ACK,PSH |  Accept: application/json|
+----------------+----------------+----------------+-------------------------+
  replaced at       survives the     read only by      read only by the app
  every hop         whole trip       the two ends      after TLS decrypts it` }
  ],
  pitfalls: [
    'Thinking the MAC address identifies the final server. It only identifies the next device on the local link; it changes at every router.',
    'Saying "the network is slow" without a layer. Measure DNS time, connect time, TLS time and server time separately (curl -w can print each).',
    'Forgetting that layer 4 devices hide the real client IP. Configure forwarded headers in ASP.NET Core or your logs and rate limits will see one IP for everyone.',
    'Assuming encryption at layer 6 hides everything. The IP addresses, ports and the server name (SNI, unless encrypted) are still visible to anyone on the path.',
    'Treating OSI layer numbers as exact for modern protocols. QUIC and TLS straddle layers; use the model to reason, not to argue.'
  ],
  quiz: [
    { q: 'A router between you and a server reads which header to decide where to send the packet next?', options: ['The TCP header (ports)', 'The IP header (addresses)', 'The HTTP Host header', 'The Ethernet frame header only'], answer: 1, why: 'Routers work at layer 3. They read the destination IP and forward. They do not look at ports or HTTP.' },
    { q: 'Your API returns "connection refused" when called on port 5001. Which layer is the problem most likely on?', options: ['Physical, the network cable has been unplugged', 'Network, no route exists to the destination host', 'Transport, nothing is listening on that port', 'Application, the JSON body is not valid'], answer: 2, why: '"Refused" means the packet arrived but no program was listening on that port, so the OS sent back a reset. That is a layer 4 symptom.' },
    { q: 'Which header is replaced at every hop along the path?', options: ['The IP header with the two addresses', 'The TCP header with the two ports', 'The Ethernet or Wi-Fi frame header', 'The TLS record around the HTTP data'], answer: 2, why: 'Each link rewrites the frame with the MAC address of the next device. IP, TCP and TLS stay intact end to end.' },
    { q: 'A "layer 7 load balancer" can do which of these that a "layer 4" one cannot?', options: ['Forward TCP connections faster', 'Route requests by URL path', 'Work without an IP address', 'Skip the TLS handshake entirely'], answer: 1, why: 'Routing by path or host needs the balancer to read HTTP, which means decrypting TLS and understanding layer 7.' },
    { q: 'What does encapsulation mean?', options: ['Compressing data so it takes fewer packets', 'Each layer wraps the data in its own header', 'Encrypting data so only the server can read it', 'Splitting one file across many servers'], answer: 1, why: 'Encapsulation is the wrapping: HTTP inside TLS inside TCP inside IP inside a frame. Each layer only reads its own header.' }
  ],
  takeaways: [
    'OSI has 7 layers for talking; TCP/IP has 4 for running. People use OSI numbers (layer 4, layer 7) for both.',
    'Each layer wraps the data in its own header; the receiver unwraps in reverse. This is encapsulation.',
    'Routers read IP headers only. Frames and MAC addresses are rewritten at every hop.',
    'As a developer you live at layer 7 (HTTP) and layer 4 (ports, timeouts). Recognise the errors of lower layers.',
    'Find the layer first, then the tool: nslookup, ping, traceroute, ss, openssl, curl -v.',
    'Layer 4 devices hide the client IP from layer 7 apps; configure forwarded headers.'
  ],
  interview: [
    { q: 'Explain the difference between the OSI and TCP/IP models.', a: '<p>OSI is a 7-layer reference model used for teaching and vocabulary. TCP/IP is the 4-layer model the internet actually implements: application, transport, internet, link. OSI\'s session and presentation layers do not exist as separate protocols; TLS covers both. In practice people use OSI numbers, so "layer 4" means TCP/UDP and "layer 7" means HTTP-aware.</p>' },
    { q: 'What happens when you type a URL in a browser and press Enter?', a: '<p>Browser checks its cache, then DNS resolves the name to an IP (recursive resolver, root, TLD, authoritative). A TCP three-way handshake opens a connection to port 443. A TLS handshake agrees keys and verifies the certificate. The browser sends an HTTP request; the server responds; the browser parses HTML and fetches more resources, reusing the connection. On the wire, each layer adds its header going down and removes it coming up.</p>' },
    { q: 'What is the difference between a packet, a segment and a frame?', a: '<p>They are the same data at different layers. TCP produces segments (with ports and sequence numbers). IP wraps a segment into a packet (with IP addresses). The link layer wraps a packet into a frame (with MAC addresses). Only the frame changes at each hop.</p>' },
    { q: 'Why might large uploads fail while small requests work?', a: '<p>Often an MTU problem: a tunnel or VPN lowers the maximum frame size, large packets must fragment, and a firewall drops the ICMP "fragmentation needed" messages, so the sender never learns to shrink them. Small requests fit in one frame and never hit the limit. This is a layer 3 issue, not an application bug.</p>' }
  ]
};

/* ───────────────────────── m6-ip-dns-dhcp ───────────────────────── */
window.CONTENT['m6-ip-dns-dhcp'] = {
  hook: `Your laptop has no idea where google.com is. It asks a chain of strangers, trusts the answer for a few minutes, and then forgets. That chain is DNS, and it is the most-used database on Earth.`,
  intro: `<p>Three systems give every device on the internet a working address. An <span class="term">IP address</span> is the number that identifies a device, like a street address. <span class="term">DNS</span> (Domain Name System) turns names people remember, like api.shop.com, into those numbers. <span class="term">DHCP</span> (Dynamic Host Configuration Protocol) hands out IP addresses automatically when a device joins a network, so nobody has to type one in.</p>
<p>You meet all three daily: "Could not resolve host" is a DNS failure, "192.168.1.5" is a private IP handed out by DHCP, and "connection timed out to 10.0.4.12" means the IP is right but something between you and it is not.</p>
<p>This topic gives you enough to read any of those messages and know the next step.</p>`,
  realLife: {
    title: 'Moving into a new flat',
    body: `<p>When you move in, the building manager gives you a flat number (DHCP gives your laptop an IP). The flat number only means something inside this building (a private IP like 192.168.1.5). The building itself has one public street address that the whole city knows (your router's public IP). Mail for everyone in the building arrives at that one address and the manager sorts it to the right flat (NAT).</p>
<p>When you want to send a letter to "Priya's bakery", you do not know the street address. You ask a directory (DNS). The directory service does not know every shop either; it asks the city office, which asks the district office, and the answer comes back and gets written down for next time (caching with a TTL).</p>
<p>Where real companies use this: Netflix and Azure use DNS as a traffic tool. Return different IPs to users in Mumbai than to users in Dublin, and you have steered them to the nearest data centre before a single HTTP byte is sent.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>IP addresses</h4>
<p>An <strong>IPv4</strong> address is four numbers from 0 to 255 separated by dots, like <code>142.250.183.14</code>. There are only about 4.3 billion of them, which ran out years ago. <strong>IPv6</strong> addresses are much longer, written in hex like <code>2404:6800:4007:80c::200e</code>, and there are more of them than grains of sand on Earth. Most phones already use IPv6 without you noticing.</p>
<h4>Public vs private</h4>
<p>Some ranges are reserved for use inside homes and offices and are never routed on the public internet: <code>10.x.x.x</code>, <code>172.16-31.x.x</code>, <code>192.168.x.x</code>. Your router has one public IP from your ISP, and uses <span class="term">NAT</span> (Network Address Translation) to let many private devices share it. That is why your laptop says 192.168.1.5 but websites see something else.</p>
<p><code>127.0.0.1</code> (and the name <code>localhost</code>) always means "this computer". When you run your API on <code>https://localhost:5001</code>, nothing leaves the machine.</p>
<h4>DNS in one picture</h4>
<ol>
<li>Your app asks "what is api.shop.com?"</li>
<li>Your computer checks its own cache. If it knows, done.</li>
<li>If not, it asks a <span class="term">resolver</span> (usually your ISP, or 8.8.8.8 or 1.1.1.1).</li>
<li>The resolver asks the root servers, then the .com servers, then shop.com's own servers.</li>
<li>The answer (an IP) comes back with a <span class="term">TTL</span>, "trust this for 300 seconds".</li>
</ol>
<h4>DHCP in one sentence</h4>
<p>When you join Wi-Fi, your device shouts "anyone got an address for me?", the router replies with an IP, a subnet mask, a gateway and DNS servers, and your device uses them for a fixed lease time (often 24 hours) before asking again.</p>
<div class="callout tip"><p>Three commands to remember: <code>ipconfig</code> / <code>ip addr</code> (what is my IP), <code>nslookup name</code> (what does DNS say), <code>ping ip</code> (can I reach it).</p></div>` },
    { name: 'Intermediate', body: `<h4>Subnets and CIDR</h4>
<p>A <span class="term">subnet</span> is a block of addresses that share a prefix. CIDR notation writes the block as address/prefix-length. <code>10.0.0.0/24</code> means the first 24 bits are fixed, so the last 8 bits vary: 256 addresses from 10.0.0.0 to 10.0.0.255 (254 usable, since the first is the network and the last is broadcast). <code>/16</code> gives 65,536 addresses. <code>/32</code> is exactly one address.</p>
<p>Why you care: cloud networks (Azure VNets, AWS VPCs) are built from subnets, and firewall rules say things like "allow 10.0.1.0/24 to reach port 1433". Two devices on the same subnet talk directly; different subnets go through a router (the <span class="term">gateway</span>).</p>
<h4>DNS record types you will actually use</h4>
<table><thead><tr><th>Type</th><th>Maps</th><th>Typical use</th></tr></thead><tbody>
<tr><td>A</td><td>name → IPv4</td><td>api.shop.com → 20.1.2.3</td></tr>
<tr><td>AAAA</td><td>name → IPv6</td><td>same, for IPv6</td></tr>
<tr><td>CNAME</td><td>name → another name</td><td>www.shop.com → shop.azurewebsites.net</td></tr>
<tr><td>MX</td><td>domain → mail servers</td><td>who receives email for shop.com</td></tr>
<tr><td>TXT</td><td>free text</td><td>domain ownership proof, SPF/DKIM for email</td></tr>
<tr><td>NS</td><td>domain → name servers</td><td>who is authoritative for shop.com</td></tr>
<tr><td>SRV</td><td>service → host:port</td><td>service discovery (e.g. SIP, some clusters)</td></tr>
</tbody></table>
<p>A CNAME cannot sit at the root of a domain (shop.com) alongside other records, which is why cloud providers offer "alias" or "ANAME" records. If your custom domain for an Azure app refuses to validate, this is often why.</p>
<h4>TTL and caching</h4>
<p>Every answer carries a TTL in seconds. Resolvers, operating systems and even .NET's HttpClient connection pool cache results. Before a migration, lower the TTL to 60 seconds a day ahead, switch, then raise it again. If you switch first, users keep hitting the old IP until the old TTL expires.</p>
<h4>DHCP lease lifecycle</h4>
<p>DORA: <strong>D</strong>iscover (client broadcasts), <strong>O</strong>ffer (server proposes an IP), <strong>R</strong>equest (client accepts), <strong>A</strong>cknowledge (server confirms with lease time). Halfway through the lease the client quietly renews. Servers and printers usually get a fixed <span class="term">reservation</span> so their IP never changes.</p>
<div class="callout warn"><p>DNS uses UDP port 53 for small answers and TCP port 53 for large ones. A firewall that only allows UDP 53 breaks some lookups (large DNSSEC answers, zone transfers) in confusing, intermittent ways.</p></div>` },
    { name: 'Expert', body: `<h4>The full resolution path and where it breaks</h4>
<p>A recursive resolver walks: root (13 logical servers, hundreds of anycast instances) → TLD servers for .com → authoritative servers for shop.com. Each step is cached. Authoritative DNS is where you edit records (Azure DNS, Route 53, Cloudflare). Most "DNS is slow" complaints are actually a resolver with an empty cache plus a high-latency authoritative server; most "DNS is wrong" complaints are a stale cache somewhere between you and the authority.</p>
<h4>DNS as a load balancer</h4>
<ul>
<li><strong>Round-robin:</strong> multiple A records; clients pick one. Crude, no health awareness unless the provider removes dead IPs.</li>
<li><strong>GeoDNS / Traffic Manager / Route 53 policies:</strong> answer depends on where the resolver is. Users reach the nearest region. Caveat: the resolver location, not the user, is what is seen, which is why EDNS Client Subnet exists.</li>
<li><strong>Failover:</strong> health checks flip the record to a standby region. Only as fast as the TTL, so keep it short (30-60 s) for failover records.</li>
</ul>
<h4>Security: DNSSEC, DoH and DoT</h4>
<p>Classic DNS is unauthenticated plain text. <span class="term">DNSSEC</span> signs records so a resolver can detect forged answers (cache poisoning). <span class="term">DNS over HTTPS</span> (DoH) and <span class="term">DNS over TLS</span> (DoT) encrypt the query between client and resolver so the coffee shop cannot see or alter it. Browsers increasingly use DoH by default, which can bypass your corporate DNS and surprise ops teams.</p>
<h4>NAT and why it complicates everything</h4>
<p>NAT lets one public IP serve thousands of private devices, but it breaks the "any host can reach any host" idea. Inbound connections need port forwarding; peer-to-peer apps need STUN/TURN to punch holes; and carrier-grade NAT means many customers share one public IP, so rate-limiting by IP can block a whole neighbourhood. IPv6 removes NAT in theory; in practice dual-stack (both IPv4 and IPv6) is the norm.</p>
<h4>.NET specifics</h4>
<ul>
<li><code>HttpClient</code> connections are pooled. If DNS changes, an existing connection keeps using the old IP until it is closed. Set <code>SocketsHttpHandler.PooledConnectionLifetime</code> (for example 2 minutes) so pools refresh and pick up DNS changes. This is also why <code>IHttpClientFactory</code> rotates handlers.</li>
<li><code>Dns.GetHostAddressesAsync</code> returns both IPv6 and IPv4; order follows OS policy. Browsers race IPv6 and IPv4 ("Happy Eyeballs"). HttpClient has not done this by default, so a broken IPv6 route can add a connect delay; check your .NET version, or add it with <code>SocketsHttpHandler.ConnectCallback</code>.</li>
<li>In Kubernetes, service names resolve through CoreDNS; a 5-second stall on first call is often an IPv6 lookup timing out. Check <code>ndots</code> and search domains.</li>
</ul>
<div class="callout idea"><p>Interview angle: "How would you migrate an API to a new data centre with zero downtime?" Lower TTL ahead of time, run both, switch the record, watch traffic drain, keep the old one for at least the old TTL, then decommission.</p></div>` }
  ],
  flow: {
    title: 'How api.shop.com becomes an IP address',
    steps: [
      { title: 'App asks', desc: 'HttpClient needs the IP for api.shop.com before it can open a TCP connection.' },
      { title: 'Local cache', desc: 'The OS checks its DNS cache and the hosts file. A hit ends the search right here.' },
      { title: 'Ask the resolver', desc: 'A UDP packet goes to the configured resolver (your ISP, 1.1.1.1, or the corporate DNS).' },
      { title: 'Root → TLD', desc: 'If the resolver does not know, it asks a root server, which points to the .com servers.' },
      { title: 'Authoritative server', desc: 'The .com servers point to shop.com\'s name servers, which hold the real A record.' },
      { title: 'Answer with TTL', desc: 'The IP comes back with "valid for 300 s". Every hop caches it for that long.' },
      { title: 'Connect', desc: 'The app opens TCP to the IP. The next request in the next 5 minutes skips all of this.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Look up records, inspect your own addresses, and refresh DNS in HttpClient', code: `using System.Net;
using System.Net.NetworkInformation;
using System.Net.Sockets;

// 1. Resolve a name to all its addresses (A and AAAA)
var entry = await Dns.GetHostEntryAsync("example.com");
foreach (var ip in entry.AddressList)
    Console.WriteLine(ip.AddressFamily == AddressFamily.InterNetworkV6 ? "AAAA " + ip : "A    " + ip);

// 2. Which IPs does THIS machine have, and which are private?
foreach (var nic in NetworkInterface.GetAllNetworkInterfaces())
{
    if (nic.OperationalStatus != OperationalStatus.Up) continue;
    foreach (var addr in nic.GetIPProperties().UnicastAddresses)
    {
        var ip = addr.Address;
        if (ip.AddressFamily != AddressFamily.InterNetwork) continue;
        Console.WriteLine(nic.Name + ": " + ip + (IsPrivate(ip) ? " (private)" : " (public)"));
    }
}

static bool IsPrivate(IPAddress ip)
{
    var b = ip.GetAddressBytes();
    return b[0] == 10
        || (b[0] == 172 && b[1] >= 16 && b[1] <= 31)
        || (b[0] == 192 && b[1] == 168)
        || b[0] == 127;
}

// 3. HttpClient keeps connections open, so a DNS change is not seen until the
//    connection closes. Recycle pooled connections so new DNS answers are picked up.
var handler = new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(2),   // re-resolve at most every 2 min
    ConnectTimeout = TimeSpan.FromSeconds(5)
};
using var http = new HttpClient(handler);
var body = await http.GetStringAsync("https://example.com/");
Console.WriteLine(body.Length + " bytes");` },
    { lang: 'bash', title: 'Debug DNS and addressing from the command line', code: `# What is my IP, mask and gateway? (DHCP gave you these)
ip addr && ip route          # Windows: ipconfig /all

# Ask DNS for each record type
nslookup -type=A    shop.com
nslookup -type=AAAA shop.com
nslookup -type=MX   shop.com
nslookup -type=TXT  shop.com
dig +short CNAME www.shop.com

# Ask a specific resolver, and see the TTL countdown
dig @1.1.1.1 api.shop.com A        # look at the number after the name: that is seconds left

# Trace the full delegation chain: root -> .com -> authoritative
dig +trace api.shop.com

# Flush local DNS cache after changing records
sudo resolvectl flush-caches     # Linux (systemd)
ipconfig /flushdns               # Windows

# Renew your DHCP lease
sudo dhclient -r && sudo dhclient     # Linux
ipconfig /release && ipconfig /renew  # Windows` },
    { lang: 'text', title: 'CIDR cheat sheet', code: `Prefix   Addresses   Usable   Typical use
/32      1           1        a single host (firewall rule for one server)
/30      4           2        point-to-point link between two routers
/28      16          14       tiny cloud subnet (a few VMs)
/24      256         254      a typical office LAN or app subnet
/22      1,024       1,022    a bigger subnet (Kubernetes node pool)
/16      65,536      65,534   an entire VNet / VPC
/8       16,777,216  ...      the whole 10.0.0.0 private range

Reserved private ranges (never routed on the internet):
  10.0.0.0/8      172.16.0.0/12      192.168.0.0/16
Loopback: 127.0.0.0/8 (localhost)   Link-local: 169.254.0.0/16 (DHCP failed!)` }
  ],
  pitfalls: [
    'Changing a DNS record and expecting instant results. Caches honour the old TTL. Lower the TTL a day before any migration.',
    'Seeing 169.254.x.x on a machine and thinking the network is fine. That range means DHCP failed and the device assigned itself an address.',
    'Rate limiting or blocking by client IP without remembering NAT. One IP can be a whole office or, with carrier-grade NAT, a whole town.',
    'Putting a CNAME at the domain root next to MX or TXT records. It is not allowed; use an alias record from your DNS provider.',
    'Long-lived HttpClient instances that never see DNS changes. Set PooledConnectionLifetime or use IHttpClientFactory.',
    'Opening UDP 53 but not TCP 53 on a firewall. Large DNS answers fall back to TCP and silently fail.'
  ],
  quiz: [
    { q: 'How many usable host addresses are in 10.0.5.0/24?', options: ['256', '255', '254', '24'], answer: 2, why: '/24 leaves 8 bits for hosts: 256 addresses. The first is the network address and the last is broadcast, leaving 254.' },
    { q: 'You updated the A record for api.shop.com five minutes ago but some users still hit the old server. Most likely reason?', options: ['The new server has not been given a public IP yet', 'Resolvers are still serving the old cached answer', 'DHCP has not yet renewed the lease on their devices', 'NAT is rewriting the destination to the old address'], answer: 1, why: 'DNS answers are cached everywhere for the TTL. Until it expires, resolvers keep returning the old IP.' },
    { q: 'Which record type maps a name to another name?', options: ['AAAA', 'MX', 'CNAME', 'TXT'], answer: 2, why: 'CNAME is an alias: www.shop.com → shop.azurewebsites.net. AAAA maps to an IPv6 address, MX to mail servers, TXT to free text.' },
    { q: 'Your laptop shows IP 192.168.1.7 but a website shows your IP as 103.21.44.9. Why?', options: ['DNS translated your address into a public one', 'The website reads the IP of its own nearest server', 'Your router swaps in its public IP using NAT', 'IPv6 is enabled, so the IPv4 address is shown scrambled'], answer: 2, why: '192.168.x.x is a private range. The router replaces it with its public IP on the way out (NAT) and maps replies back.' },
    { q: 'What does DHCP give a device when it joins a network?', options: ['Only an IP address, with nothing else attached', 'An IP, subnet mask, gateway and DNS servers', 'A public domain name registered for the device', 'A TLS certificate signed for the local network'], answer: 1, why: 'DHCP hands out the full set needed to talk: address, mask, default gateway and DNS, with a lease time after which the device renews.' }
  ],
  takeaways: [
    'IPv4 is four numbers, scarce, and shared through NAT. IPv6 is huge and increasingly default.',
    'Private ranges (10/8, 172.16/12, 192.168/16) never leave your network; 127.0.0.1 is always "me".',
    'CIDR /n fixes the first n bits; /24 is 254 usable hosts, /16 is a whole VNet.',
    'DNS walks root → TLD → authoritative, and every hop caches the answer for the TTL.',
    'Know A, AAAA, CNAME, MX, TXT, NS. Lower the TTL before migrations.',
    'DHCP uses Discover, Offer, Request, Acknowledge; 169.254.x.x means it failed.'
  ],
  interview: [
    { q: 'Walk me through DNS resolution.', a: '<p>Client checks local cache and hosts file. If missing, it asks its configured recursive resolver. The resolver checks its cache, then queries a root server, which refers it to the TLD servers (.com), which refer it to the domain\'s authoritative servers, which return the record. The answer travels back with a TTL and is cached at each layer. Subsequent lookups within the TTL are served from cache.</p>' },
    { q: 'What is NAT and what problems does it cause?', a: '<p>NAT rewrites private source IPs to a shared public IP and tracks the mapping so replies can be routed back. It conserves IPv4 addresses and hides internal topology. Problems: inbound connections need explicit port forwarding, peer-to-peer needs STUN/TURN, and many users share one public IP, so per-IP rate limits and bans hit innocent people.</p>' },
    { q: 'How would you do a zero-downtime move of a service to a new IP?', a: '<p>Reduce the DNS TTL well in advance (at least one old-TTL period before). Bring up the new target and verify it. Switch the record. Keep the old target running until at least the old TTL has passed and traffic has drained. Then decommission. For apps with long-lived connection pools, also ensure clients recycle connections.</p>' },
    { q: 'What is the difference between a subnet mask and CIDR?', a: '<p>They say the same thing in two notations. A /24 prefix equals the mask 255.255.255.0: the first 24 bits identify the network and the remaining 8 identify hosts. CIDR is just the shorter, modern way to write it and allows any prefix length, not only /8, /16, /24.</p>' }
  ]
};

/* ───────────────────────── m6-tcp-udp ───────────────────────── */
window.CONTENT['m6-tcp-udp'] = {
  hook: `TCP is a phone call: you say hello, wait for hello back, and repeat anything the other side missed. UDP is shouting across a room: fast, no promises. Both are the right choice, just not for the same job.`,
  intro: `<p>IP gets a packet to the right computer. But a computer runs many programs at once, and packets can get lost or arrive out of order. The <span class="term">transport layer</span> solves this. It adds <span class="term">ports</span> (which program gets the data) and, in TCP's case, reliability.</p>
<p><span class="term">TCP</span> (Transmission Control Protocol) promises that every byte arrives, once, in order. It does this by numbering bytes, waiting for confirmations, and resending what was lost. <span class="term">UDP</span> (User Datagram Protocol) promises nothing: it stamps a port on the packet and sends it. If it is lost, it is lost.</p>
<p>Your HTTP APIs, databases and SignalR all run on TCP. Video calls, online games and DNS lookups mostly run on UDP. Knowing why tells you how to design anything real-time.</p>`,
  realLife: {
    title: 'A phone call versus a live radio broadcast',
    body: `<p>On a phone call, both sides first say "hello?" and confirm they can hear each other before talking (the handshake). If a sentence gets garbled, you say "sorry, what?" and it is repeated (retransmission). If you both talk at once, you slow down (congestion control). The call ends with "bye" from both sides (the four-way close).</p>
<p>A live radio broadcast is UDP. The station sends; if your signal drops for a second, you miss that second and the show moves on. Nobody rewinds for you, because for live audio a late word is useless. That is exactly why video calls and games prefer UDP: a packet that arrives 2 seconds late is worse than a packet that never arrives.</p>
<p>Where real companies use this: Zoom and Microsoft Teams send audio and video over UDP (falling back to TCP only when a firewall blocks UDP, which is why some calls feel laggy on corporate networks). Google built QUIC on UDP so it could fix TCP's slow connection setup and its habit of stalling everything behind one lost packet, without waiting for operating systems to change.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Ports: the flat number on the address</h4>
<p>An IP address finds the computer. A port (0 to 65535) finds the program. Well-known ports: 80 (HTTP), 443 (HTTPS), 22 (SSH), 53 (DNS), 1433 (SQL Server), 5432 (PostgreSQL), 6379 (Redis). Your ASP.NET Core app listening on 5001 means "deliver packets with destination port 5001 to me". The client side uses a random high port (like 51234) so replies find the right browser tab.</p>
<h4>TCP: the careful one</h4>
<ul>
<li><strong>Connection first.</strong> Three messages (SYN, SYN-ACK, ACK) before any data. Both sides now agree they are talking.</li>
<li><strong>Every byte is numbered.</strong> The receiver sends back "I have everything up to byte 5000". If something is missing, the sender resends it.</li>
<li><strong>In order.</strong> If packet 3 arrives before packet 2, TCP holds 3 until 2 shows up. Your program only ever sees a clean stream.</li>
<li><strong>Polite.</strong> It slows down when the network is busy (congestion control) or the receiver is busy (flow control).</li>
</ul>
<h4>UDP: the fast one</h4>
<ul>
<li>No handshake. First packet already carries data.</li>
<li>No numbering, no resending, no ordering. Each packet (a <span class="term">datagram</span>) is on its own.</li>
<li>Tiny header (8 bytes vs TCP's 20+), so less overhead per packet.</li>
</ul>
<h4>Which one when?</h4>
<table><thead><tr><th>Need</th><th>Pick</th><th>Why</th></tr></thead><tbody>
<tr><td>Web pages, APIs, file transfer, email, databases</td><td>TCP</td><td>Every byte matters, order matters</td></tr>
<tr><td>Video calls, voice, live streams, multiplayer games</td><td>UDP</td><td>Late data is useless; keep going</td></tr>
<tr><td>DNS lookups</td><td>UDP (TCP for big answers)</td><td>One small question, one small answer, no handshake cost</td></tr>
</tbody></table>
<div class="callout tip"><p>"Connection refused" = TCP reached the machine but no program was on that port. "Connection timed out" = no reply at all, usually a firewall or a wrong IP.</p></div>` },
    { name: 'Intermediate', body: `<h4>The three-way handshake</h4>
<ol>
<li><strong>SYN:</strong> client sends "I want to talk, my starting sequence number is X".</li>
<li><strong>SYN-ACK:</strong> server replies "OK, I heard X, my starting number is Y".</li>
<li><strong>ACK:</strong> client says "I heard Y". Data can now flow in both directions.</li>
</ol>
<p>That is one full round trip before the first byte of HTTP. On a 100 ms link it costs 100 ms. TLS adds another round trip or two. This is why HTTP keep-alive and connection pooling matter so much, and why HTTP/3 was built to shave these round trips.</p>
<h4>Sequence numbers and acknowledgements</h4>
<p>Each side numbers its bytes. An ACK says "the next byte I expect is N", which confirms everything before N. The sender keeps unacknowledged data in a buffer and retransmits if the ACK does not arrive in time (<span class="term">RTO</span>, retransmission timeout) or if it sees three duplicate ACKs for the same number (fast retransmit).</p>
<h4>Flow control vs congestion control</h4>
<div class="compare"><div><h5>Flow control (receiver)</h5><p>The receiver advertises a <span class="term">window</span>: "I have room for 64 KB". The sender never sends more than that unacknowledged. Protects a slow receiver.</p></div><div><h5>Congestion control (network)</h5><p>The sender starts slowly (<span class="term">slow start</span>: double the window each round trip), backs off on loss, then grows carefully. Protects the network from everyone sending at full speed at once.</p></div></div>
<h4>Closing: the four-way handshake</h4>
<p>Each side sends FIN and gets an ACK: "I am done sending" and "noted". Because both directions close independently, a connection can be half-closed (one side has finished sending, the other has not). The side that closes first waits in <span class="term">TIME_WAIT</span> (often 60 s) to catch late packets. A server that opens and closes thousands of short connections per second can run out of ports because of TIME_WAIT. Pooling fixes this.</p>
<h4>UDP in practice</h4>
<p>Since UDP gives you nothing, applications add what they need: a sequence number so the receiver can drop late frames, a timestamp for jitter, and sometimes forward error correction so a lost packet can be reconstructed. RTP (voice/video) and QUIC are both "UDP plus the parts of TCP we actually wanted".</p>
<div class="callout warn"><p>UDP has no connection, so firewalls and NAT devices time out the mapping after seconds of silence. Real-time apps send keep-alive packets to hold the path open.</p></div>` },
    { name: 'Expert', body: `<h4>Nagle, delayed ACK and the 40 ms stall</h4>
<p>Nagle's algorithm batches small writes into one segment to reduce overhead. Delayed ACK makes the receiver wait (up to 40-200 ms) to piggyback an ACK on its own data. Together they can create a stall: the sender waits for an ACK before sending the next small piece, and the receiver waits to ACK. Latency-sensitive protocols set <code>NoDelay = true</code> (TCP_NODELAY). Kestrel and most RPC frameworks do this by default; raw sockets do not.</p>
<h4>Head-of-line blocking</h4>
<p>Because TCP delivers in order, one lost segment stalls everything behind it even if those bytes arrived. With HTTP/2 multiplexing many requests over one TCP connection, one loss blocks all of them. QUIC (HTTP/3) runs independent streams over UDP so loss on one stream does not stall the others. This single fact is the main reason HTTP/3 exists.</p>
<h4>Congestion control flavours</h4>
<ul>
<li><strong>CUBIC</strong> (Linux default): loss-based, grows window as a cubic function, works well on wired networks.</li>
<li><strong>BBR</strong> (Google): models bandwidth and round-trip time instead of waiting for loss. Better on lossy or high-latency paths; used widely at Google and on many CDNs.</li>
<li>Choice is per host; you rarely set it, but it explains why the same server feels different in different clouds.</li>
</ul>
<h4>Connection scaling on servers</h4>
<ul>
<li><strong>Backlog:</strong> completed handshakes queue until the app calls accept. A full backlog means dropped SYNs and clients see timeouts, not errors.</li>
<li><strong>SYN cookies:</strong> defend against SYN floods by not allocating state until the handshake completes.</li>
<li><strong>Ephemeral port exhaustion:</strong> an outbound-heavy service (calling other APIs) can hit the ~28,000 ephemeral port limit per destination because of TIME_WAIT. Reuse connections (HttpClient pooling), and in extreme cases tune <code>tcp_tw_reuse</code> or add source IPs.</li>
<li><strong>Keep-alive probes:</strong> detect dead peers on idle connections (SignalR and database drivers rely on these or their own pings).</li>
</ul>
<h4>QUIC and HTTP/3 in one paragraph</h4>
<p>QUIC puts TLS 1.3, multiplexed streams, and connection migration (your phone switches from Wi-Fi to 4G and the connection survives, because it is identified by a connection ID, not by IP+port) on top of UDP. The handshake carries the TLS exchange, so a new connection costs one round trip, and a resumed one costs zero (0-RTT). Kestrel supports HTTP/3; most CDNs serve it to browsers today.</p>
<div class="callout idea"><p>Interview angle: "Why is HTTP/3 on UDP, not TCP?" Because TCP is implemented in the operating system kernel and changes take a decade to roll out, and because TCP's in-order guarantee causes head-of-line blocking across multiplexed streams. UDP is a blank canvas.</p></div>` }
  ],
  flow: {
    title: 'A TCP connection from hello to goodbye',
    steps: [
      { title: 'SYN', desc: 'Client: "Let us talk. My sequence number starts at X." No data yet.' },
      { title: 'SYN-ACK', desc: 'Server: "Got X. Mine starts at Y." Server allocates the connection.' },
      { title: 'ACK', desc: 'Client: "Got Y." The connection is established. One round trip used.' },
      { title: 'Data + ACKs', desc: 'Bytes flow, each numbered. The receiver ACKs "next expected byte". Missing ones are resent.' },
      { title: 'Window grows', desc: 'Slow start doubles the send window each round trip until loss or the receiver window caps it.' },
      { title: 'Loss → back off', desc: 'A lost segment is detected by timeout or duplicate ACKs; the sender resends and halves its rate.' },
      { title: 'FIN / ACK twice', desc: 'Each side says "done sending" and the other confirms. The first closer waits in TIME_WAIT.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'TCP echo server and client with TcpListener / TcpClient', code: `using System.Net;
using System.Net.Sockets;
using System.Text;

// ---------- Server: accept connections and echo back whatever arrives ----------
static async Task RunServerAsync(CancellationToken ct)
{
    var listener = new TcpListener(IPAddress.Loopback, 9000);
    listener.Start();
    Console.WriteLine("Server listening on 127.0.0.1:9000");

    while (!ct.IsCancellationRequested)
    {
        TcpClient client = await listener.AcceptTcpClientAsync(ct);   // handshake already done here
        _ = HandleClientAsync(client);                                   // one task per connection
    }
}

static async Task HandleClientAsync(TcpClient client)
{
    using (client)
    {
        client.NoDelay = true;                       // disable Nagle for low latency
        var stream = client.GetStream();
        var buffer = new byte[1024];
        int read;
        // TCP is a STREAM: one Read may return half a message or two messages.
        // Real protocols add a length prefix or a delimiter (here: newline).
        while ((read = await stream.ReadAsync(buffer)) > 0)
        {
            var text = Encoding.UTF8.GetString(buffer, 0, read);
            Console.WriteLine("Server got: " + text.TrimEnd());
            await stream.WriteAsync(Encoding.UTF8.GetBytes("echo: " + text));
        }
        // read == 0 means the client sent FIN: it is done sending.
    }
}

// ---------- Client: connect, send a line, read the reply ----------
static async Task RunClientAsync()
{
    using var client = new TcpClient();
    await client.ConnectAsync(IPAddress.Loopback, 9000);    // SYN, SYN-ACK, ACK happen here
    var stream = client.GetStream();
    await stream.WriteAsync(Encoding.UTF8.GetBytes("hello over TCP\\n"));

    var buffer = new byte[1024];
    int n = await stream.ReadAsync(buffer);
    Console.WriteLine("Client got: " + Encoding.UTF8.GetString(buffer, 0, n).TrimEnd());
    // Disposing the client sends FIN and starts the four-way close.
}

var cts = new CancellationTokenSource();
var server = RunServerAsync(cts.Token);
await Task.Delay(200);
await RunClientAsync();
cts.Cancel();` },
    { lang: 'csharp', title: 'UDP: send a datagram and (maybe) get one back', code: `using System.Net;
using System.Net.Sockets;
using System.Text;

// Server: no accept, no connection. Just receive datagrams on a port.
static async Task UdpServerAsync(CancellationToken ct)
{
    using var udp = new UdpClient(9001);
    while (!ct.IsCancellationRequested)
    {
        UdpReceiveResult r = await udp.ReceiveAsync(ct);          // one whole datagram, or nothing
        var msg = Encoding.UTF8.GetString(r.Buffer);
        Console.WriteLine("UDP server got '" + msg + "' from " + r.RemoteEndPoint);
        await udp.SendAsync(Encoding.UTF8.GetBytes("pong"), r.RemoteEndPoint, ct);
    }
}

// Client: send immediately (no handshake), wait briefly for a reply, give up if none.
static async Task UdpClientAsync()
{
    using var udp = new UdpClient();
    var server = new IPEndPoint(IPAddress.Loopback, 9001);

    // Applications add their own sequence numbers because UDP has none.
    for (int seq = 1; seq <= 3; seq++)
    {
        await udp.SendAsync(Encoding.UTF8.GetBytes("ping #" + seq), server);
        using var timeout = new CancellationTokenSource(TimeSpan.FromMilliseconds(300));
        try
        {
            var reply = await udp.ReceiveAsync(timeout.Token);
            Console.WriteLine("reply to #" + seq + ": " + Encoding.UTF8.GetString(reply.Buffer));
        }
        catch (OperationCanceledException)
        {
            Console.WriteLine("#" + seq + " lost (no reply). Move on; do not block.");
        }
    }
}

var cts = new CancellationTokenSource();
_ = UdpServerAsync(cts.Token);
await Task.Delay(100);
await UdpClientAsync();
cts.Cancel();` },
    { lang: 'bash', title: 'Watch handshakes and connection states', code: `# Show TCP connections and their states (ss prints ESTAB, TIME-WAIT, SYN-SENT ...)
ss -tan | head -30                     # Windows: netstat -ano
ss -tan | awk '{print $1}' | sort | uniq -c   # count by state; many TIME-WAIT = no pooling

# Capture the three-way handshake to port 443 (needs root / admin)
sudo tcpdump -i any -n 'tcp port 443 and (tcp[tcpflags] & (tcp-syn|tcp-fin) != 0)'

# Test whether a TCP port is open (handshake succeeds = open)
nc -vz api.shop.com 443

# Send a UDP packet and listen for a reply
echo "ping" | nc -u -w1 127.0.0.1 9001

# Time each phase of an HTTPS request: DNS, TCP connect, TLS, first byte
curl -o /dev/null -s -w 'dns %{time_namelookup}  tcp %{time_connect}  tls %{time_appconnect}  ttfb %{time_starttransfer}\\n' https://example.com/` }
  ],
  pitfalls: [
    'Treating a TCP stream like messages. One Read can return half a message or two. Always frame with a length prefix or delimiter.',
    'Opening a new TCP connection per request. Each costs a round trip plus TLS, and leaves a TIME_WAIT socket. Pool connections.',
    'Using UDP and assuming packets arrive in order or at all. Add sequence numbers and decide what to do with gaps.',
    'Forgetting NoDelay on latency-sensitive raw sockets. Nagle plus delayed ACK can add tens of milliseconds per message.',
    'Blaming the app when the server backlog is full. Clients see timeouts, not errors; check accept queue drops.',
    'Expecting UDP to work through every corporate firewall. Always have a TCP fallback for real-time features.'
  ],
  quiz: [
    { q: 'How many messages make up the TCP handshake that opens a connection?', options: ['1', '2', '3', '4'], answer: 2, why: 'SYN, SYN-ACK, ACK. The client can attach data to the third message, so it costs one round trip.' },
    { q: 'A video call app is choosing a transport. Why does UDP usually win?', options: ['UDP is encrypted by default, so setup is quicker', 'Resending a late video frame only adds delay', 'UDP packets are bigger, so fewer are needed', 'TCP cannot carry binary data such as video'], answer: 1, why: 'For live media, it is better to skip a lost frame than to stall the whole stream waiting for a retransmission.' },
    { q: 'What does an ACK number N mean in TCP?', options: ['Packet number N was lost and must be sent again', 'Every byte before N arrived; N is expected next', 'The sender should slow down to N bytes per second', 'The connection will close after N more bytes arrive'], answer: 1, why: 'ACKs are cumulative: "I have all bytes up to N-1, send me N". That is how the sender knows what to resend.' },
    { q: 'A service that makes thousands of short outbound HTTP calls per second starts failing with "address already in use". Most likely cause?', options: ['The local DNS cache is full and cannot store new names', 'Ephemeral ports ran out; connections are not reused', 'A firewall is blocking UDP, so TCP ports cannot be freed', 'The remote server returned 500 and locked the address'], answer: 1, why: 'Each closed connection sits in TIME_WAIT for about a minute. Without pooling, the ~28k ephemeral ports run out.' },
    { q: 'Which problem does QUIC (HTTP/3) fix that HTTP/2 over TCP has?', options: ['HTTP/2 traffic cannot be encrypted, QUIC traffic can', 'One lost packet stalling every stream on the connection', 'HTTP/2 has no port numbers, so it cannot pass firewalls', 'HTTP/2 cannot compress headers, so requests are large'], answer: 1, why: 'TCP delivers strictly in order, so one lost segment blocks every stream sharing the connection. QUIC streams are independent.' }
  ],
  takeaways: [
    'Ports pick the program; IP picks the machine. Clients use random high ports, servers use well-known ones.',
    'TCP: handshake, numbered bytes, ACKs, retransmission, in-order delivery, flow and congestion control.',
    'UDP: no handshake, no guarantees, tiny header. Apps add sequence numbers when they need them.',
    'TCP for anything where every byte matters; UDP for live media, games and DNS.',
    'Connection setup costs a round trip (plus TLS). Pool and reuse connections.',
    'TCP is a stream, not messages. Frame your data. QUIC moves TCP\'s good ideas onto UDP to fix head-of-line blocking.'
  ],
  interview: [
    { q: 'Explain the TCP three-way handshake and why it is needed.', a: '<p>SYN from the client proposes a starting sequence number; SYN-ACK from the server acknowledges it and proposes its own; ACK from the client confirms. Both sides now know the other is reachable and agree on sequence numbers, which is what makes reliable, ordered delivery possible. It also prevents old duplicate packets from a previous connection from being accepted.</p>' },
    { q: 'What is the difference between flow control and congestion control?', a: '<p>Flow control protects the receiver: it advertises a window of how much it can buffer, and the sender never exceeds it. Congestion control protects the network: the sender probes available bandwidth (slow start, then additive increase), and backs off on loss or delay. Both limit the sender; they answer different questions.</p>' },
    { q: 'When would you choose UDP over TCP in a system you design?', a: '<p>When timeliness beats completeness: voice, video, game state, telemetry sampling, DNS. Also when you want to implement your own reliability tuned to the use case, which is what QUIC does. Always plan a TCP fallback for networks that block UDP.</p>' },
    { q: 'What is TIME_WAIT and why can it hurt a server?', a: '<p>After closing, the side that closed first keeps the socket for about twice the maximum segment lifetime to absorb late packets and make sure the final ACK got through. A process that opens and closes many short connections accumulates thousands of TIME_WAIT sockets and can exhaust ephemeral ports. Connection pooling and keep-alive are the fix.</p>' }
  ]
};

/* ───────────────────────── m6-http-https-tls ───────────────────────── */
window.CONTENT['m6-http-https-tls'] = {
  hook: `HTTP is just text. You can type a valid request by hand into a socket. HTTPS wraps that text in a locked box only the server can open, and the lock is checked by a chain of trust that reaches back to a certificate already on your laptop.`,
  intro: `<p><span class="term">HTTP</span> (HyperText Transfer Protocol) is the language browsers and APIs use: a client sends a <span class="term">request</span> (method, path, headers, optional body) and the server sends a <span class="term">response</span> (status code, headers, optional body). It is plain text, line by line, and it is stateless: each request stands alone unless you add something (a cookie, a token) to link them.</p>
<p><span class="term">HTTPS</span> is the same HTTP carried inside <span class="term">TLS</span> (Transport Layer Security). TLS gives three things: <strong>encryption</strong> (nobody on the path can read it), <strong>integrity</strong> (nobody can change it), and <strong>authentication</strong> (you are talking to the real api.shop.com, proven by a certificate).</p>
<p>As a .NET developer you write HTTP every day and you depend on TLS every day. This topic shows what is really on the wire so headers, status codes, cookies and certificate errors all make sense.</p>`,
  realLife: {
    title: 'Ordering at a counter, then ordering by sealed courier',
    body: `<p>HTTP is ordering at a counter. You say "GET me a coffee, size large" (method, path, headers). The barista replies "200, here you go" or "404, we do not have that" or "401, members only". Each order is separate; the barista does not remember you unless you show a loyalty card (a cookie).</p>
<p>HTTPS is the same order sent by courier in a sealed, tamper-evident box, addressed to a shop whose identity was verified by a notary you already trust. The courier cannot read the order, cannot change it, and cannot pretend to be the shop. The notary is the certificate authority; the shop's ID card is the certificate; the seal is the encryption.</p>
<p>Where real companies use this: Let's Encrypt issues free certificates to a large share of all websites. Each one is valid for 90 days or less and is renewed automatically before it expires. Browsers mark plain HTTP pages as "Not secure", which is why even a static blog is HTTPS today.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>What a request looks like</h4>
<p>Line one is the <strong>request line</strong>: method, path, version. Then headers, one per line. Then a blank line. Then the body, if any.</p>
<blockquote><code>GET /api/products?page=2 HTTP/1.1</code><br><code>Host: api.shop.com</code><br><code>Accept: application/json</code><br><code>Authorization: Bearer eyJ...</code></blockquote>
<h4>Methods, and what they promise</h4>
<table><thead><tr><th>Method</th><th>Meaning</th><th>Safe?</th><th>Idempotent?</th></tr></thead><tbody>
<tr><td>GET</td><td>Read</td><td>Yes</td><td>Yes</td></tr>
<tr><td>POST</td><td>Create / do something</td><td>No</td><td>No</td></tr>
<tr><td>PUT</td><td>Replace whole thing</td><td>No</td><td>Yes</td></tr>
<tr><td>PATCH</td><td>Change part of it</td><td>No</td><td>Not required</td></tr>
<tr><td>DELETE</td><td>Remove</td><td>No</td><td>Yes</td></tr>
</tbody></table>
<p><span class="term">Safe</span> means it does not change anything. <span class="term">Idempotent</span> means doing it twice has the same result as once. Browsers and proxies rely on these promises (a GET may be cached or retried; a POST may not).</p>
<h4>Status codes by family</h4>
<ul>
<li><strong>2xx success:</strong> 200 OK, 201 Created, 204 No Content.</li>
<li><strong>3xx redirect:</strong> 301 moved for good, 302 moved for now, 304 not modified (use your cache).</li>
<li><strong>4xx your fault (client):</strong> 400 bad request, 401 not logged in, 403 logged in but not allowed, 404 not found, 409 conflict, 429 too many requests.</li>
<li><strong>5xx server's fault:</strong> 500 crashed, 502 proxy could not reach backend, 503 overloaded or down, 504 backend timed out.</li>
</ul>
<h4>Headers you will use constantly</h4>
<p><code>Content-Type</code> (what the body is), <code>Accept</code> (what I want back), <code>Authorization</code> (who I am), <code>Cookie</code> / <code>Set-Cookie</code> (remember me), <code>Cache-Control</code> (may this be cached), <code>Location</code> (where the new thing is, after 201 or 3xx).</p>
<h4>HTTPS is HTTP + a lock</h4>
<p>The padlock in the browser means: the data is encrypted, and the certificate says this really is the site named in the address bar. It does not mean the site is honest, only that it is who it claims to be.</p>
<div class="callout tip"><p>401 vs 403: 401 means "I do not know who you are" (send credentials). 403 means "I know exactly who you are, and the answer is no".</p></div>` },
    { name: 'Intermediate', body: `<h4>Cookies and state</h4>
<p>HTTP forgets you after every request. A server can say <code>Set-Cookie: session=abc; HttpOnly; Secure; SameSite=Lax; Path=/</code>, and the browser sends <code>Cookie: session=abc</code> on every later request to that site. The flags matter: <strong>HttpOnly</strong> hides it from JavaScript (stops XSS theft), <strong>Secure</strong> sends it only over HTTPS, <strong>SameSite</strong> limits sending it from other sites (stops CSRF). APIs called from Angular usually use an <code>Authorization: Bearer</code> header instead, which the browser does not attach automatically.</p>
<h4>Keep-alive and connection reuse</h4>
<p>HTTP/1.1 keeps the TCP connection open after a response so the next request skips the handshake. HttpClient in .NET pools these connections; creating a new HttpClient per request throws that away (and leaks sockets). Use <code>IHttpClientFactory</code> or one long-lived instance.</p>
<h4>The TLS handshake (TLS 1.3)</h4>
<ol>
<li><strong>ClientHello:</strong> "here are the cipher suites I support, the server name I want (SNI), and my key share".</li>
<li><strong>ServerHello + Certificate:</strong> the server picks a cipher, sends its certificate chain and its key share, and signs the handshake with its private key.</li>
<li><strong>Verify:</strong> the client checks the certificate (name matches, not expired, chain leads to a trusted root, not revoked) and the signature.</li>
<li><strong>Keys:</strong> both sides compute the same symmetric key from the key shares (Diffie-Hellman). Everything after this is encrypted with fast symmetric crypto.</li>
</ol>
<p>TLS 1.3 does this in one round trip (TLS 1.2 needed two). Resumed sessions can send data immediately (0-RTT). The private key never leaves the server; it is used only to prove identity, not to encrypt traffic.</p>
<h4>Certificates and the chain of trust</h4>
<p>A certificate binds a name (api.shop.com) to a public key and is signed by a <span class="term">Certificate Authority</span> (CA). Your OS and browsers ship with a list of trusted root CAs. The server sends its leaf certificate plus intermediates; the client follows signatures up to a root it already trusts. Common failures: expired certificate, name mismatch (certificate for shop.com used on api.shop.com), missing intermediate (works in Chrome, fails in curl and in clients that cannot download it), self-signed in production.</p>
<h4>What you must do in ASP.NET Core</h4>
<ul>
<li>Terminate TLS at Kestrel (dev: <code>dotnet dev-certs https --trust</code>) or at the reverse proxy/load balancer in production.</li>
<li>Call <code>app.UseHttpsRedirection()</code> and <code>app.UseHsts()</code> outside development.</li>
<li>If a proxy terminates TLS, configure <code>UseForwardedHeaders</code> so <code>Request.IsHttps</code> and the client IP are right.</li>
<li>Never disable certificate validation in production. For a private CA, add its root to the trust store instead.</li>
</ul>
<div class="callout warn"><p><code>ServerCertificateCustomValidationCallback = (a,b,c,d) =&gt; true</code> turns HTTPS into a costume. It accepts any certificate, including an attacker's. If you see it in a code review, block the merge.</p></div>` },
    { name: 'Expert', body: `<h4>HSTS, preload and the first-request problem</h4>
<p>Redirecting HTTP to HTTPS still leaves the very first plain request open to a downgrade attack. <span class="term">HSTS</span> (<code>Strict-Transport-Security: max-age=31536000; includeSubDomains; preload</code>) tells the browser to never use HTTP for this domain again. The preload list bakes that into browsers so even the first visit is protected. Once preloaded, you cannot easily go back; set it only when every subdomain is ready.</p>
<h4>Certificate details that bite in production</h4>
<ul>
<li><strong>SAN vs CN:</strong> modern clients only read Subject Alternative Names. A certificate with the name only in CN fails.</li>
<li><strong>Wildcards:</strong> <code>*.shop.com</code> covers api.shop.com but not shop.com or a.b.shop.com.</li>
<li><strong>Chain order:</strong> leaf first, then intermediates. A wrong order or missing intermediate is a top cause of "my app fails but the browser works" (browsers fetch missing intermediates via AIA or already hold them; curl does not, and a .NET app can only fetch them when the server it runs on is allowed to make that outbound call).</li>
<li><strong>Revocation:</strong> CRL and OCSP are slow and unreliable; OCSP stapling lets the server attach a fresh proof. Short-lived certificates (90 days or less) are the practical answer.</li>
<li><strong>Automation:</strong> ACME (Let's Encrypt, and cloud-managed certificates) removes the "it expired at 2 am" incident. Monitor expiry anyway.</li>
</ul>
<h4>Mutual TLS (mTLS)</h4>
<p>In mTLS the client also presents a certificate, so the server knows which service is calling. Service meshes do this between microservices automatically. In ASP.NET Core, <code>AddCertificate()</code> authentication plus Kestrel's <code>ClientCertificateMode</code> enable it; behind a proxy you need the proxy to forward the client certificate in a header and to trust only that proxy.</p>
<h4>Caching semantics you control with headers</h4>
<p><code>Cache-Control: no-store</code> (never cache), <code>private, max-age=60</code> (browser only), <code>public, max-age=3600, s-maxage=86400</code> (CDN may keep longer than the browser), <code>ETag</code> + <code>If-None-Match</code> for 304 responses that save bandwidth but not a round trip. <code>Vary: Accept-Encoding, Authorization</code> prevents serving one user's cached response to another.</p>
<h4>What TLS does not hide</h4>
<p>IP addresses, ports, packet sizes and timing are visible. The server name (SNI) is visible unless Encrypted Client Hello is used. DNS queries are visible unless DoH/DoT is used. Threat models that need to hide "who talks to whom" need more than TLS.</p>
<div class="callout idea"><p>Interview angle: "How does the browser know the certificate is real?" The certificate is signed by an intermediate, which is signed by a root. The root's public key is already installed in the OS. The client verifies each signature up the chain, then checks the name, dates and revocation. The private key proves possession by signing the handshake.</p></div>` }
  ],
  flow: {
    title: 'An HTTPS request from first byte to padlock',
    steps: [
      { title: 'TCP connect', desc: 'Three-way handshake to port 443. No HTTP yet.' },
      { title: 'ClientHello', desc: 'Client offers cipher suites, the server name (SNI) and a key share.' },
      { title: 'ServerHello + cert', desc: 'Server picks a cipher, sends its certificate chain and key share, and signs the handshake.' },
      { title: 'Verify chain', desc: 'Client checks name, dates, and follows signatures up to a trusted root. Mismatch → the scary browser page.' },
      { title: 'Shared key', desc: 'Both sides derive the same symmetric key. From now on everything is encrypted and integrity-checked.' },
      { title: 'HTTP request', desc: 'Inside the tunnel: "GET /api/products", headers, maybe a body. Plain text, but nobody outside can read it.' },
      { title: 'Response + reuse', desc: '"200 OK" with headers and JSON. The connection stays open (keep-alive) for the next request.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'HttpClient done right: factory, headers, status handling, timing', code: `using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using Microsoft.Extensions.DependencyInjection;

var services = new ServiceCollection();

// One pooled, reused client. Never "new HttpClient()" per request.
services.AddHttpClient("shop", c =>
{
    c.BaseAddress = new Uri("https://api.shop.com/");
    c.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
    c.Timeout = TimeSpan.FromSeconds(10);
})
.ConfigurePrimaryHttpMessageHandler(() => new SocketsHttpHandler
{
    PooledConnectionLifetime = TimeSpan.FromMinutes(2),   // pick up DNS changes
    AutomaticDecompression = DecompressionMethods.All       // gzip / br responses
    // DO NOT set ServerCertificateCustomValidationCallback = (...) => true
});

var provider = services.BuildServiceProvider();
var http = provider.GetRequiredService<IHttpClientFactory>().CreateClient("shop");

// Build the request explicitly so you can see every part of it
using var request = new HttpRequestMessage(HttpMethod.Get, "api/products?page=2");
request.Headers.Authorization = new AuthenticationHeaderValue("Bearer", "eyJ...token...");
request.Headers.TryAddWithoutValidation("If-None-Match", "\\"v42\\"");   // ETag we already have

var sw = System.Diagnostics.Stopwatch.StartNew();
using var response = await http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead);
Console.WriteLine("status " + (int)response.StatusCode + " in " + sw.ElapsedMilliseconds + " ms, HTTP/" + response.Version);

switch (response.StatusCode)
{
    case HttpStatusCode.NotModified:          // 304: our cached copy is still good
        Console.WriteLine("use cache");
        break;
    case HttpStatusCode.Unauthorized:         // 401: get a new token, then retry once
        Console.WriteLine("token expired");
        break;
    case HttpStatusCode.TooManyRequests:      // 429: honour Retry-After
        var wait = response.Headers.RetryAfter?.Delta ?? TimeSpan.FromSeconds(5);
        Console.WriteLine("back off for " + wait);
        break;
    default:
        response.EnsureSuccessStatusCode();   // throws for other 4xx/5xx
        var products = await response.Content.ReadFromJsonAsync<List<Product>>();
        Console.WriteLine(products!.Count + " products, ETag " + response.Headers.ETag);
        break;
}

public record Product(int Id, string Name, decimal Price);` },
    { lang: 'csharp', title: 'ASP.NET Core: HTTPS, HSTS, forwarded headers and secure cookies', code: `using Microsoft.AspNetCore.HttpOverrides;

var builder = WebApplication.CreateBuilder(args);

// Behind a load balancer that terminates TLS, trust ITS forwarded headers only.
builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownNetworks.Clear();   // then add your proxy's network, e.g.:
    o.KnownNetworks.Add(new Microsoft.AspNetCore.HttpOverrides.IPNetwork(System.Net.IPAddress.Parse("10.0.0.0"), 8));
    // .NET 10+: KnownNetworks is marked obsolete. Use o.KnownIPNetworks.Add(System.Net.IPNetwork.Parse("10.0.0.0/8")) there.
});

builder.Services.AddHsts(o =>
{
    o.MaxAge = TimeSpan.FromDays(365);
    o.IncludeSubDomains = true;
    o.Preload = true;            // only once every subdomain is HTTPS-ready
});

var app = builder.Build();

app.UseForwardedHeaders();       // must run first so Request.IsHttps and RemoteIpAddress are correct
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();               // adds Strict-Transport-Security
}
app.UseHttpsRedirection();       // 307 to https:// for any plain request that reaches us

app.MapGet("/whoami", (HttpContext ctx) => new
{
    scheme = ctx.Request.Scheme,                       // "https" when forwarded correctly
    clientIp = ctx.Connection.RemoteIpAddress?.ToString(),
    protocol = ctx.Request.Protocol                     // HTTP/1.1, HTTP/2, HTTP/3
});

app.MapPost("/login", (HttpContext ctx) =>
{
    // A session cookie with every protective flag set
    ctx.Response.Cookies.Append("session", "opaque-random-id", new CookieOptions
    {
        HttpOnly = true,                  // JavaScript cannot read it (XSS defence)
        Secure = true,                    // HTTPS only
        SameSite = SameSiteMode.Lax,      // not sent on cross-site POSTs (CSRF defence)
        Expires = DateTimeOffset.UtcNow.AddHours(8),
        Path = "/"
    });
    return Results.NoContent();
});

app.Run();` },
    { lang: 'bash', title: 'Inspect HTTP and TLS by hand', code: `# Full request/response with headers; -I for headers only
curl -v https://api.shop.com/api/products -H "Accept: application/json"
curl -I https://api.shop.com/

# Send JSON
curl -X POST https://api.shop.com/api/products \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer TOKEN" \\
  -d '{"name":"Mouse","price":499}'

# Follow redirects and show each hop's status
curl -sIL http://shop.com/ | grep -iE "^(HTTP|location)"

# TLS: show the server certificate's subject, issuer, expiry dates and names (SAN)
openssl s_client -connect api.shop.com:443 -servername api.shop.com </dev/null 2>/dev/null \\
  | openssl x509 -noout -subject -issuer -dates -ext subjectAltName

# Which TLS versions does the server accept?
openssl s_client -connect api.shop.com:443 -tls1_2 </dev/null >/dev/null 2>&1 && echo "TLS1.2 ok"
openssl s_client -connect api.shop.com:443 -tls1_3 </dev/null >/dev/null 2>&1 && echo "TLS1.3 ok"

# Local dev certificate for Kestrel
dotnet dev-certs https --trust` }
  ],
  pitfalls: [
    'Creating a new HttpClient per request. Sockets pile up in TIME_WAIT and DNS changes are never seen. Use IHttpClientFactory.',
    'Disabling certificate validation "just for now". It ships to production and silently removes the authentication part of HTTPS.',
    'Returning 200 with an error message in the body. Clients, proxies and monitoring rely on status codes. Use 4xx/5xx and ProblemDetails.',
    'Missing intermediate certificates on the server. Browsers hide the problem; curl, mobile apps and locked-down servers fail.',
    'Session cookies without HttpOnly, Secure and SameSite. Each missing flag is a known attack class.',
    'Enabling HSTS preload before every subdomain serves HTTPS. Removal from the preload list takes months.'
  ],
  quiz: [
    { q: 'Which status code means "you are authenticated, but not allowed to do this"?', options: ['401', '403', '404', '400'], answer: 1, why: '401 is "who are you?"; 403 is "I know who you are and the answer is no".' },
    { q: 'In TLS, what is the server\'s private key used for?', options: ['Encrypting all the traffic after the handshake', 'Signing the handshake to prove its identity', 'Compressing the response before it is encrypted', 'Storing the session cookie safely on the server'], answer: 1, why: 'Traffic is encrypted with a symmetric key both sides derive. The private key only proves identity by signing the handshake.' },
    { q: 'A certificate error appears in your .NET app but the same URL works in Chrome. Most likely cause?', options: ['Chrome ignores certificate errors for well-known sites', '.NET does not support HTTPS without an extra NuGet package', 'The server is not sending an intermediate certificate', 'The URL has a typo that Chrome silently corrects'], answer: 2, why: 'Browsers can download missing intermediates (AIA fetching) or already hold them. Other clients often cannot, for example an app on a server with no outbound access, so the server must send the full chain.' },
    { q: 'Which cookie flag stops JavaScript from reading the cookie?', options: ['Secure', 'SameSite', 'HttpOnly', 'Path'], answer: 2, why: 'HttpOnly hides the cookie from document.cookie, so an XSS bug cannot steal it. Secure limits to HTTPS; SameSite limits cross-site sending.' },
    { q: 'Which HTTP methods are idempotent?', options: ['GET, PUT, DELETE', 'GET, POST and PATCH', 'POST and PATCH', 'Only GET'], answer: 0, why: 'Repeating a GET, PUT or DELETE gives the same end state. POST creates something new each time; PATCH is not required to be idempotent.' },
    { q: 'What does HSTS do?', options: ['Encrypts cookies before the browser stores them on disk', 'Tells the browser to use only HTTPS for this domain', 'Compresses responses so the TLS handshake is shorter', 'Validates JSON bodies before they reach the controller'], answer: 1, why: 'Strict-Transport-Security removes the HTTP-to-HTTPS redirect window that downgrade attacks exploit.' }
  ],
  takeaways: [
    'HTTP is text: request line, headers, blank line, body. Stateless unless you add cookies or tokens.',
    'Methods carry promises: GET is safe, GET/PUT/DELETE are idempotent, POST is neither.',
    'Status families: 2xx fine, 3xx go elsewhere, 4xx your request is wrong, 5xx the server broke.',
    'TLS gives encryption, integrity and authentication; the certificate chain proves the name.',
    'The private key signs the handshake; a shared symmetric key encrypts the traffic.',
    'In ASP.NET Core: forwarded headers first, then HSTS and HTTPS redirection; secure cookie flags; never disable validation.'
  ],
  interview: [
    { q: 'Explain the TLS handshake.', a: '<p>Client sends ClientHello with supported ciphers, SNI and a key share. Server replies with its chosen cipher, certificate chain, its own key share, and a signature over the handshake using its private key. The client validates the chain to a trusted root, checks the name and dates, and verifies the signature. Both compute the same symmetric key via Diffie-Hellman and switch to encrypted application data. TLS 1.3 completes this in one round trip.</p>' },
    { q: 'What is the difference between 401 and 403, and 502 and 504?', a: '<p>401: no or invalid credentials; the client should authenticate. 403: credentials are fine but the action is forbidden. 502: a proxy or gateway got an invalid response or no connection from the upstream. 504: the proxy reached upstream but it did not answer in time.</p>' },
    { q: 'How do cookies and bearer tokens differ for an Angular + .NET app?', a: '<p>Cookies are attached by the browser automatically, which is convenient but exposes you to CSRF, so you need SameSite and anti-forgery tokens. Bearer tokens must be added by your code to the Authorization header, so CSRF is not an issue, but the token is readable by JavaScript and must be stored carefully (in memory, or an HttpOnly cookie that the API converts). Many apps use HttpOnly cookies for the refresh token and short-lived bearer tokens in memory.</p>' },
    { q: 'What does HTTPS not protect against?', a: '<p>It does not hide who you talk to (IP, SNI, DNS), the size and timing of traffic, or anything the server itself does with your data. It does not make the server trustworthy, only authentic. It does not stop XSS, injection or logic bugs in the application.</p>' }
  ]
};

/* ───────────────────────── m6-http2-http3-websockets ───────────────────────── */
window.CONTENT['m6-http2-http3-websockets'] = {
  hook: `HTTP/1.1 is a single-lane road where one slow truck blocks everyone. HTTP/2 paints more lanes on the same road. HTTP/3 builds a new road. WebSockets ignore the road and open a phone line.`,
  intro: `<p>HTTP/1.1 served the web for twenty years, but it has a problem: on one connection, requests go one at a time. A page with 100 images needs 100 round trips, or 6 parallel connections, or tricks like sprite sheets. <span class="term">HTTP/2</span> fixed this by letting many requests share one connection at the same time (<span class="term">multiplexing</span>). <span class="term">HTTP/3</span> fixed what HTTP/2 could not, by replacing TCP with <span class="term">QUIC</span> on top of UDP.</p>
<p>All versions of HTTP are still request-response: the client asks, the server answers. When the server needs to push data whenever it wants (chat, live prices, notifications), you need something else. <span class="term">WebSockets</span> upgrade an HTTP connection into a two-way, always-open channel. <span class="term">Server-Sent Events</span> (SSE) are a simpler one-way stream from server to client. <span class="term">Long polling</span> is the old trick of holding a request open until there is news.</p>
<p>SignalR in .NET picks between these automatically. Knowing what each really does lets you choose on purpose and debug when the choice goes wrong.</p>`,
  realLife: {
    title: 'A restaurant kitchen with one waiter, many waiters, and a walkie-talkie',
    body: `<p>HTTP/1.1 is one waiter per table who takes one order, walks to the kitchen, waits, brings it back, and only then takes the next order. If the kitchen is slow on one dish, your drinks wait too. That is <span class="term">head-of-line blocking</span>. Browsers hired six waiters per table (six connections) to cope.</p>
<p>HTTP/2 is one waiter carrying a tray with many numbered tickets at once. Orders and dishes travel interleaved on the same trip. Much faster, until the waiter trips (a lost packet). Then every dish on that tray waits, because TCP insists on delivering in order.</p>
<p>HTTP/3 gives each order its own runner (QUIC streams). One runner tripping does not delay the others. WebSockets are a walkie-talkie between you and the chef: either side can talk any time, no "may I take your order" ritual per message.</p>
<p>Where real companies use this: most big sites and CDNs serve HTTP/3 to browsers today; WhatsApp Web and Slack keep a WebSocket open for messages; many stock-ticker and notification feeds use SSE because it passes through every proxy and reconnects on its own.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>HTTP/1.1: one at a time</h4>
<p>Each connection handles one request, then the next. Browsers open about 6 connections per host to get some parallelism. Headers are repeated in full on every request (hundreds of bytes of cookies, every time).</p>
<h4>HTTP/2: many at once, on one connection</h4>
<ul>
<li><strong>Multiplexing:</strong> requests become numbered <span class="term">streams</span> that share one TCP connection. 100 images can be in flight together.</li>
<li><strong>Binary framing:</strong> instead of text lines, data travels in small binary frames tagged with a stream id. You do not read it by hand any more; tools decode it.</li>
<li><strong>Header compression (HPACK):</strong> headers sent before are referenced by index, so repeated cookies cost a few bytes.</li>
<li><strong>Server push:</strong> the server could send resources before being asked. It confused caches and was removed from browsers; forget it.</li>
<li>Almost always over TLS. Kestrel and every browser support it; you usually get it for free.</li>
</ul>
<h4>HTTP/3: same ideas, new transport</h4>
<p>HTTP/3 runs over QUIC, which runs over UDP. Each stream is independent, so one lost packet only delays its own stream. The connection survives your phone switching from Wi-Fi to mobile data. Setup is faster because the TLS handshake is folded into the connection handshake.</p>
<h4>When the server needs to talk first</h4>
<table><thead><tr><th>Technique</th><th>Direction</th><th>How it works</th><th>Good for</th></tr></thead><tbody>
<tr><td>Polling</td><td>client asks repeatedly</td><td>GET every N seconds</td><td>rarely-changing data, simplest</td></tr>
<tr><td>Long polling</td><td>server → client (one at a time)</td><td>server holds the request until there is news</td><td>fallback when nothing else works</td></tr>
<tr><td>SSE</td><td>server → client stream</td><td>one long HTTP response, "data:" lines</td><td>feeds, progress, notifications</td></tr>
<tr><td>WebSocket</td><td>both ways, any time</td><td>HTTP upgrade to a raw two-way channel</td><td>chat, games, collaborative editing</td></tr>
</tbody></table>
<div class="callout tip"><p>If data only flows server → browser, SSE is simpler than WebSockets: plain HTTP, automatic reconnect, works with HTTP/2 and most proxies. Reach for WebSockets when the client also sends a lot.</p></div>` },
    { name: 'Intermediate', body: `<h4>Head-of-line blocking, twice</h4>
<p>HTTP/1.1 has application-level HOL blocking: one slow response blocks the next request on that connection. HTTP/2 removed that but kept transport-level HOL blocking: TCP delivers bytes in order, so one lost packet stalls all streams until it is retransmitted. On a clean office network this never shows; on mobile with 2% loss, HTTP/2 can be slower than HTTP/1.1 with six connections. HTTP/3 removes both, because QUIC retransmits per stream.</p>
<h4>How QUIC handshakes faster</h4>
<p>TCP + TLS 1.3: one round trip for TCP, one for TLS, then data (2 RTT). QUIC: the TLS 1.3 exchange rides inside the first QUIC packets (1 RTT), and a returning client can send data in its very first packet (0-RTT, with replay caveats, so only for idempotent requests). Connections are identified by a connection ID, not the IP/port pair, which is what allows <span class="term">connection migration</span> across networks.</p>
<h4>The WebSocket handshake</h4>
<p>The client sends a normal HTTP GET with <code>Upgrade: websocket</code>, <code>Connection: Upgrade</code> and a random <code>Sec-WebSocket-Key</code>. The server replies <code>101 Switching Protocols</code> with a hash of that key. From then on the TCP connection carries WebSocket <span class="term">frames</span> (text or binary, with ping/pong/close control frames), not HTTP. Because it starts as HTTP, it passes through port 443 and TLS (wss://) like any web traffic.</p>
<ul>
<li>Messages, not streams: each send is delivered as one message, unlike raw TCP.</li>
<li>No built-in reconnect, no acknowledgements, no resume. You build those (or let SignalR do it).</li>
<li>Proxies and load balancers must support upgrades and long idle connections; many kill idle sockets after 60-240 s, so send pings.</li>
</ul>
<h4>SSE in practice</h4>
<p>The server responds with <code>Content-Type: text/event-stream</code> and never ends the response, writing <code>data: ...</code> lines separated by blank lines. The browser's <code>EventSource</code> reconnects automatically and sends <code>Last-Event-ID</code> so the server can resume. Limitations: text only, server → client only, and over HTTP/1.1 each stream uses one of the six connections (HTTP/2 lifts this).</p>
<h4>What SignalR does for you</h4>
<p>It tries WebSockets, then SSE, then long polling; adds a message protocol (JSON or MessagePack), optional automatic reconnect with backoff (you switch it on in the client), and groups/users. The <span class="term">backplane</span> (Redis or Azure SignalR Service) lets many servers share connections. Turn transports off only if you have a specific reason.</p>
<div class="callout warn"><p>A WebSocket is a long-lived TCP connection. Thousands of idle sockets cost memory on your server and on every proxy. Plan for heartbeats, limits per user, and horizontal scale-out from day one.</p></div>` },
    { name: 'Expert', body: `<h4>HTTP/2 internals that matter in production</h4>
<ul>
<li><strong>Stream limits:</strong> SETTINGS_MAX_CONCURRENT_STREAMS (often 100-250). A client needing more queues internally; a server advertising too many can be overwhelmed. The 2023 "Rapid Reset" attack abused stream creation and cancellation; keep Kestrel and proxies patched and rate-limit stream resets.</li>
<li><strong>Flow control per stream and per connection:</strong> windows start at 64 KB; a slow consumer on one stream can stall it without affecting others, but a small connection window can throttle everything. Tune for large downloads.</li>
<li><strong>Prioritisation:</strong> the HTTP/2 priority tree was rarely implemented well and was replaced by the simpler Extensible Priorities (RFC 9218) scheme, also used by HTTP/3.</li>
<li><strong>gRPC needs HTTP/2:</strong> trailers and bidirectional streaming. Browsers cannot do this, so gRPC-Web exists; HTTP/3 support for gRPC is still catching up in many proxies.</li>
</ul>
<h4>HTTP/3 deployment realities</h4>
<p>Browsers learn a server supports HTTP/3 through the <code>Alt-Svc</code> header or an HTTPS DNS record, so the first connection is usually HTTP/2. UDP port 443 must be open end to end; some corporate networks block it, and clients fall back. QUIC runs in user space, so CPU cost per byte is higher than kernel TCP (hardware offload is improving). Kestrel supports HTTP/3 with <code>HttpProtocols.Http1AndHttp2AndHttp3</code> on Linux and recent Windows; most teams terminate HTTP/3 at the CDN and talk HTTP/2 or 1.1 to the origin.</p>
<h4>Scaling WebSockets</h4>
<ul>
<li><strong>Connection distribution:</strong> each socket is pinned to one server. Broadcasting means a pub/sub backplane (Redis, Azure SignalR, Kafka) so every server forwards to its own sockets.</li>
<li><strong>Memory per connection:</strong> buffers plus per-socket state; a few KB each means tens of thousands per server, not millions. Azure SignalR or a dedicated gateway tier offloads this.</li>
<li><strong>Deploys:</strong> restarting a server drops every socket at once; clients reconnect in a thundering herd. Use jittered backoff on the client and drain connections gracefully on the server.</li>
<li><strong>Ordering and delivery:</strong> WebSockets guarantee order on one connection only. After a reconnect, resync from a sequence number or re-fetch state; do not assume nothing was missed.</li>
<li><strong>Security:</strong> the browser sends cookies on the upgrade request but does not enforce CORS for WebSockets. Validate the <code>Origin</code> header server-side or any site can open a socket to your API with the user's cookies (cross-site WebSocket hijacking).</li>
</ul>
<h4>WebTransport: the next step</h4>
<p>WebTransport exposes QUIC streams and unreliable datagrams to browser JavaScript over HTTP/3: multiple independent streams, no head-of-line blocking, and UDP-like datagrams for games and media. Browser and server support is still uneven; treat it as the WebSocket successor to watch, not to bet production on without a fallback.</p>
<div class="callout idea"><p>Interview angle: "Design a live sports score feed for 10 million users." Push model: SSE or WebSockets at the edge, fan-out via pub/sub, aggressive coalescing (send at most one update per second per match), and a CDN-cached polling fallback. Mention that the data is public and identical for everyone, so most of the cost is in fan-out, not in computing the score.</p></div>` }
  ],
  flow: {
    title: 'Opening a WebSocket from an HTTP request',
    steps: [
      { title: 'HTTPS connection', desc: 'TCP + TLS to port 443, exactly like any web request. Firewalls see ordinary HTTPS.' },
      { title: 'GET with Upgrade', desc: 'Client sends GET /hub with Upgrade: websocket, Connection: Upgrade and a random Sec-WebSocket-Key.' },
      { title: '101 Switching Protocols', desc: 'Server agrees, returning a hash of the key. HTTP is over; the same socket now carries frames.' },
      { title: 'Frames both ways', desc: 'Either side sends text or binary frames at any time. Each frame is one message, delivered in order.' },
      { title: 'Ping / pong', desc: 'Heartbeats keep proxies from killing the idle connection and detect dead peers.' },
      { title: 'Close frame', desc: 'Either side sends a close frame with a status code; the other replies; the TCP connection ends.' },
      { title: 'Reconnect + resync', desc: 'Your code (or SignalR) reconnects with backoff and asks for anything missed since the last sequence number.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'Raw WebSocket client in .NET with heartbeat and reconnect', code: `using System.Net.WebSockets;
using System.Text;

static async Task RunAsync(Uri uri, CancellationToken ct)
{
    var delay = TimeSpan.FromSeconds(1);

    while (!ct.IsCancellationRequested)
    {
        using var ws = new ClientWebSocket();
        ws.Options.KeepAliveInterval = TimeSpan.FromSeconds(20);   // automatic keep-alive (ping/pong) frames
        ws.Options.SetRequestHeader("Authorization", "Bearer TOKEN");

        try
        {
            await ws.ConnectAsync(uri, ct);          // GET + Upgrade, expects 101
            Console.WriteLine("connected over " + uri.Scheme);
            delay = TimeSpan.FromSeconds(1);         // reset backoff on success

            await SendAsync(ws, "{\\"type\\":\\"subscribe\\",\\"topic\\":\\"prices\\"}", ct);

            var buffer = new byte[8 * 1024];
            var message = new MemoryStream();
            while (ws.State == WebSocketState.Open && !ct.IsCancellationRequested)
            {
                // A message may arrive in several frames: loop until EndOfMessage.
                message.SetLength(0);
                WebSocketReceiveResult result;
                do
                {
                    result = await ws.ReceiveAsync(buffer, ct);
                    if (result.MessageType == WebSocketMessageType.Close)
                    {
                        Console.WriteLine("server closed: " + result.CloseStatus + " " + result.CloseStatusDescription);
                        await ws.CloseOutputAsync(WebSocketCloseStatus.NormalClosure, "bye", ct);
                        break;
                    }
                    message.Write(buffer, 0, result.Count);
                } while (!result.EndOfMessage);

                if (result.MessageType == WebSocketMessageType.Text)
                    Console.WriteLine("got: " + Encoding.UTF8.GetString(message.ToArray()));
            }
        }
        catch (WebSocketException ex)
        {
            Console.WriteLine("socket error: " + ex.Message);
        }

        // Reconnect with exponential backoff + jitter (avoid a thundering herd after a deploy)
        var jitter = TimeSpan.FromMilliseconds(Random.Shared.Next(0, 500));
        await Task.Delay(delay + jitter, ct);
        delay = TimeSpan.FromSeconds(Math.Min(delay.TotalSeconds * 2, 30));
    }
}

static Task SendAsync(ClientWebSocket ws, string text, CancellationToken ct)
    => ws.SendAsync(Encoding.UTF8.GetBytes(text), WebSocketMessageType.Text, endOfMessage: true, ct);

await RunAsync(new Uri("wss://api.shop.com/ws/prices"), CancellationToken.None);` },
    { lang: 'csharp', title: 'ASP.NET Core: WebSocket endpoint with Origin check, SSE endpoint, and HTTP/2+3 on Kestrel', code: `using System.Net.WebSockets;
using System.Runtime.CompilerServices;
using System.Text;
using Microsoft.AspNetCore.Server.Kestrel.Core;

var builder = WebApplication.CreateBuilder(args);
builder.WebHost.ConfigureKestrel(k =>
{
    k.ListenAnyIP(443, o =>
    {
        o.Protocols = HttpProtocols.Http1AndHttp2AndHttp3;   // HTTP/3 needs TLS + UDP 443 open
        o.UseHttps();
    });
});
var app = builder.Build();

app.UseWebSockets(new WebSocketOptions { KeepAliveInterval = TimeSpan.FromSeconds(20) });

// ---- WebSocket: two-way ----
app.Map("/ws/echo", async (HttpContext ctx) =>
{
    if (!ctx.WebSockets.IsWebSocketRequest) { ctx.Response.StatusCode = 400; return; }

    // Browsers do NOT apply CORS to WebSockets. Check Origin yourself.
    var origin = ctx.Request.Headers.Origin.ToString();
    if (origin != "https://app.shop.com") { ctx.Response.StatusCode = 403; return; }

    using WebSocket ws = await ctx.WebSockets.AcceptWebSocketAsync();   // sends 101
    var buffer = new byte[4096];
    while (ws.State == WebSocketState.Open)
    {
        var r = await ws.ReceiveAsync(buffer, ctx.RequestAborted);
        if (r.MessageType == WebSocketMessageType.Close) break;
        var text = Encoding.UTF8.GetString(buffer, 0, r.Count);
        await ws.SendAsync(Encoding.UTF8.GetBytes("echo: " + text), WebSocketMessageType.Text, true, ctx.RequestAborted);
    }
    await ws.CloseAsync(WebSocketCloseStatus.NormalClosure, "done", CancellationToken.None);
});

// ---- Server-Sent Events: one-way stream, plain HTTP, auto-reconnect in browsers ----
app.MapGet("/sse/clock", (HttpContext ctx) =>
    TypedResults.ServerSentEvents(Ticks(ctx.RequestAborted), eventType: "tick"));   // .NET 10+ helper

static async IAsyncEnumerable<string> Ticks([EnumeratorCancellation] CancellationToken ct)
{
    while (!ct.IsCancellationRequested)
    {
        yield return DateTime.UtcNow.ToString("O");
        await Task.Delay(1000, ct);
    }
}

// Older frameworks: write the stream by hand
app.MapGet("/sse/clock-manual", async (HttpContext ctx) =>
{
    ctx.Response.Headers.ContentType = "text/event-stream";
    ctx.Response.Headers.CacheControl = "no-cache";
    int id = 0;
    while (!ctx.RequestAborted.IsCancellationRequested)
    {
        await ctx.Response.WriteAsync("id: " + (++id) + "\\n");
        await ctx.Response.WriteAsync("data: " + DateTime.UtcNow.ToString("O") + "\\n\\n");
        await ctx.Response.Body.FlushAsync();
        await Task.Delay(1000, ctx.RequestAborted);
    }
});

app.Run();` },
    { lang: 'bash', title: 'Check which protocol you are getting, and talk WebSocket by hand', code: `# Which HTTP version did curl negotiate? (needs curl built with HTTP/2 / HTTP/3)
curl -sI --http2 https://example.com/ -o /dev/null -w '%{http_version}\\n'
curl -sI --http3 https://cloudflare-quic.com/ -o /dev/null -w '%{http_version}\\n'

# Does the server advertise HTTP/3?
curl -sI https://example.com/ | grep -i alt-svc      # e.g. alt-svc: h3=":443"

# WebSocket handshake by hand: expect "101 Switching Protocols"
# (--http1.1 matters: the Upgrade header only exists in HTTP/1.1, and curl would pick HTTP/2 if offered)
curl -i -N --http1.1 https://api.shop.com/ws/echo \\
  -H "Connection: Upgrade" -H "Upgrade: websocket" \\
  -H "Sec-WebSocket-Version: 13" -H "Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ=="

# Interactive WebSocket client (npm i -g wscat)
wscat -c wss://api.shop.com/ws/echo

# Watch an SSE stream
curl -N https://api.shop.com/sse/clock` }
  ],
  pitfalls: [
    'Assuming HTTP/2 is always faster. On lossy mobile links, TCP head-of-line blocking can make one multiplexed connection slower than several HTTP/1.1 ones.',
    'Opening a WebSocket when SSE would do. Two-way channels cost more to scale and are harder to proxy; use them when the client really sends a lot.',
    'Forgetting the Origin check on WebSocket endpoints. CORS does not protect them; any site can connect with the user\'s cookies.',
    'No heartbeats. Proxies and load balancers silently drop idle sockets; clients find out minutes later.',
    'Treating a WebSocket reconnect as "nothing happened". Messages sent while disconnected are gone; resync with a sequence number.',
    'Deploying HTTP/3 without opening UDP 443 on every firewall and load balancer in the path. Clients fall back quietly and you never see the benefit.'
  ],
  quiz: [
    { q: 'What problem does HTTP/2 multiplexing solve?', options: ['Headers travelling unencrypted between client and server', 'One slow response blocking the requests behind it', 'Packets being lost on Wi-Fi and mobile networks', 'DNS lookups taking too long for each new host name'], answer: 1, why: 'HTTP/2 interleaves many streams on one connection so requests no longer wait in a single queue (application-level head-of-line blocking).' },
    { q: 'Why does HTTP/3 use UDP instead of TCP?', options: ['UDP encrypts every packet by default, and TCP does not', 'TCP is being retired from browsers and operating systems', 'QUIC needs independent streams, which TCP cannot give', 'UDP packets are larger, so pages need fewer round trips'], answer: 2, why: 'QUIC implements its own reliability per stream in user space, removing transport-level head-of-line blocking and enabling faster handshakes and connection migration.' },
    { q: 'What status code completes a WebSocket handshake?', options: ['200 OK', '101 Switching Protocols', '505 HTTP Version Not Supported', '301 Moved Permanently'], answer: 1, why: 'The server answers the Upgrade request with 101, after which the connection carries WebSocket frames instead of HTTP.' },
    { q: 'Data flows only from server to browser (a live dashboard). Which is usually the simplest reliable choice?', options: ['WebSockets', 'Server-Sent Events', 'Polling every 100 ms', 'gRPC bidirectional streaming'], answer: 1, why: 'SSE is plain HTTP, reconnects automatically with Last-Event-ID, and needs no special proxy support. WebSockets add cost without benefit for one-way data.' },
    { q: 'Which protection does the browser NOT apply to WebSocket connections?', options: ['TLS encryption on wss:// connections', 'Same-origin policy / CORS checks', 'Certificate checks on wss:// connections', 'Blocking plain ws:// from HTTPS pages'], answer: 1, why: 'Browsers send the Origin header but do not block cross-origin WebSockets. The server must validate Origin to prevent cross-site hijacking.' }
  ],
  takeaways: [
    'HTTP/1.1: one request at a time per connection; browsers use ~6 connections to cope.',
    'HTTP/2: multiplexed streams, binary frames, HPACK header compression, one connection; still stuck behind TCP ordering.',
    'HTTP/3: QUIC over UDP, independent streams, 1-RTT or 0-RTT setup, survives network changes.',
    'WebSockets start as an HTTP Upgrade and become a two-way message channel; you add reconnect, heartbeat and resync.',
    'SSE is a never-ending HTTP response: simplest for server → client streams.',
    'Validate Origin on WebSockets, send heartbeats, use a backplane to scale, and jitter reconnects.'
  ],
  interview: [
    { q: 'Compare HTTP/1.1, HTTP/2 and HTTP/3.', a: '<p>HTTP/1.1 is text-based, one request per connection at a time, with repeated headers. HTTP/2 keeps the same semantics but adds binary framing, multiplexing of many streams on one TCP connection, and HPACK header compression; it still suffers TCP head-of-line blocking under packet loss. HTTP/3 moves to QUIC over UDP with independent streams, integrated TLS 1.3 for a 1-RTT (or 0-RTT) handshake, and connection migration between networks.</p>' },
    { q: 'How do WebSockets differ from HTTP, and when would you choose SSE instead?', a: '<p>WebSockets upgrade an HTTP connection into a persistent, full-duplex, message-based channel with no request/response pairing. SSE is a long-lived HTTP response streaming text events one way, with built-in browser reconnection. Choose SSE when only the server pushes (feeds, progress, notifications); choose WebSockets when the client also sends frequently or binary data is needed (chat, games, collaboration).</p>' },
    { q: 'How would you scale a WebSocket-based chat to many servers?', a: '<p>Each socket lives on one server, so use a pub/sub backplane (Redis, Azure SignalR Service, Kafka) to fan messages out to every server, which forwards to its local sockets. Keep per-connection state small, use heartbeats, drain connections on deploy, add jittered reconnect on the client, and resync from a sequence number after reconnect. Consider a dedicated connection tier so app servers stay stateless.</p>' },
    { q: 'What is head-of-line blocking?', a: '<p>When items must be processed in order, one stuck item delays everything behind it. In HTTP/1.1 a slow response blocks later requests on that connection. In HTTP/2 over TCP, one lost packet stalls all multiplexed streams because TCP delivers bytes in order. QUIC avoids it by retransmitting per stream.</p>' }
  ]
};

/* ───────────────────────── m6-cdn-caching ───────────────────────── */
window.CONTENT['m6-cdn-caching'] = {
  hook: `The fastest request is the one that never reaches your server. A CDN answers most of your traffic from a building a few kilometres from the user, and a handful of HTTP headers decide whether it is allowed to.`,
  intro: `<p>A <span class="term">CDN</span> (Content Delivery Network) is a set of servers spread around the world that keep copies of your content close to users. When someone in Chennai requests your logo, a CDN server in Chennai serves it, instead of a trip to your origin server in Dublin. Less distance means lower latency; fewer requests reaching your server means lower cost and better resilience.</p>
<p>The CDN decides what it may store and for how long by reading standard HTTP caching headers: <code>Cache-Control</code>, <code>ETag</code>, <code>Last-Modified</code>, <code>Vary</code>. The same headers also control the browser's own cache. Get them right and a page loads instantly; get them wrong and users see stale data, or your origin gets hammered.</p>
<p>This topic covers how CDNs work, every header that matters, how to safely update cached files, and how to use a CDN for APIs, not only images.</p>`,
  realLife: {
    title: 'A bakery with one oven and many corner shops',
    body: `<p>Your origin server is the bakery with the only oven. Shipping each loaf from the bakery to every customer across the country is slow. So the bakery stocks corner shops (edge servers) in every town. A customer buys from the nearest shop. The shop only goes back to the bakery when it runs out, or when the bread's "best before" (TTL) passes.</p>
<p>The label on each loaf is the caching header. "Best before 1 hour" is <code>max-age=3600</code>. "Do not stock, made to order" is <code>no-store</code>. "Ask the bakery if this batch is still fine before selling" is <code>no-cache</code> with an ETag. A shop that serves yesterday's bread while fetching fresh in the background is <code>stale-while-revalidate</code>.</p>
<p>Where real companies use this: Netflix places its own cache appliances inside ISP buildings so most video never crosses the wider internet. News sites cache even their home page for a few seconds; at 10,000 requests per second, a 5-second TTL turns 50,000 origin hits into one.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>How a CDN request works</h4>
<ol>
<li>DNS sends the user to the nearest CDN location (a <span class="term">PoP</span>, point of presence, or edge).</li>
<li>The edge checks its cache for that URL. <strong>Hit:</strong> serve immediately. <strong>Miss:</strong> fetch from your origin, store it (if allowed), serve it.</li>
<li>The next user at that edge gets the cached copy until it expires.</li>
</ol>
<p>Responses carry a header like <code>X-Cache: HIT</code> or <code>cf-cache-status: HIT</code> so you can see what happened.</p>
<h4>What is normally cached</h4>
<p>Static files: images, CSS, JavaScript, fonts, videos, downloads. These are the same for every user and change rarely. HTML and API responses can also be cached, but only when they are the same for everyone and a little staleness is acceptable.</p>
<h4>The one header to learn first: Cache-Control</h4>
<table><thead><tr><th>Value</th><th>Meaning</th></tr></thead><tbody>
<tr><td><code>max-age=3600</code></td><td>Anyone may cache for 1 hour</td></tr>
<tr><td><code>public</code></td><td>Shared caches (CDN) may store it</td></tr>
<tr><td><code>private</code></td><td>Only the user's browser may store it (personal data)</td></tr>
<tr><td><code>no-cache</code></td><td>May store, but must check with the server before using (confusing name!)</td></tr>
<tr><td><code>no-store</code></td><td>Never store anywhere (passwords, bank balances)</td></tr>
<tr><td><code>immutable</code></td><td>This file will never change; do not even re-check</td></tr>
</tbody></table>
<h4>Updating a cached file: cache busting</h4>
<p>If <code>app.js</code> is cached for a year, how do users get your new version? Change the name: <code>app.3f9a1c.js</code>. Angular's production build does this automatically (the hash in the filename). The HTML that references it is cached briefly or not at all, so it always points to the latest file names.</p>
<div class="callout tip"><p>Golden rule: hashed file names get <code>max-age=31536000, immutable</code>; the HTML that references them gets <code>no-cache</code> so it is always re-checked.</p></div>` },
    { name: 'Intermediate', body: `<h4>Validation: ETag and Last-Modified</h4>
<p>When a cached copy expires, the cache does not have to download the whole thing again. It sends a <span class="term">conditional request</span>: <code>If-None-Match: "abc123"</code> (the ETag it has) or <code>If-Modified-Since: &lt;date&gt;</code>. If nothing changed, the origin replies <code>304 Not Modified</code> with no body, and the cache extends the life of its copy. This saves bandwidth but still costs a round trip, so it suits content that changes unpredictably, not hot static files.</p>
<p>An ETag is any string that changes when the content changes: a hash of the body, a version number, or a row's <code>RowVersion</code> from SQL Server. Weak ETags (<code>W/"..."</code>) mean "semantically the same" and are fine for most APIs.</p>
<h4>Serving stale on purpose</h4>
<ul>
<li><code>stale-while-revalidate=60</code>: after expiry, keep serving the old copy for up to 60 s while fetching a fresh one in the background. Users never wait.</li>
<li><code>stale-if-error=600</code>: if the origin is down, serve the old copy for up to 10 minutes. Your outage becomes invisible for cached pages.</li>
<li><code>s-maxage=86400</code>: a TTL only for shared caches (CDN), overriding max-age there. Lets the browser re-check hourly while the CDN keeps it a day.</li>
</ul>
<h4>Vary: one URL, several correct answers</h4>
<p><code>Vary: Accept-Encoding</code> tells caches that gzip and brotli versions are different objects. <code>Vary: Accept-Language</code> splits by language. <code>Vary: Authorization</code> or <code>Cookie</code> effectively disables shared caching (every user is different), which is usually what you want for personalised responses. A missing Vary can serve one user's private response to another; an over-broad Vary makes the cache useless.</p>
<h4>Caching APIs at the edge</h4>
<p>Public, read-heavy endpoints (product catalogue, exchange rates, leaderboards) cache well: <code>Cache-Control: public, max-age=30, stale-while-revalidate=60</code> plus an ETag. Rules: GET only; no auth-dependent data; include query parameters in the cache key deliberately (normalise order, ignore tracking params); return the same headers for errors (<code>no-store</code> for 5xx so a brief failure is not cached).</p>
<h4>Purging</h4>
<p>Every CDN offers a purge API: by URL, by tag/surrogate key (e.g. <code>Surrogate-Key: product-42</code> then purge "product-42" when that product changes), or everything. Tag-based purging is the clean way to cache dynamic content with long TTLs and still update instantly.</p>
<h4>ASP.NET Core pieces</h4>
<p><code>[ResponseCache]</code> / <code>app.UseResponseCaching()</code> set headers and keep a small in-process cache; <span class="term">output caching</span> (<code>AddOutputCache</code>, .NET 7+) caches at the server with tags and eviction and is the better choice for APIs; static files middleware sets ETag and Last-Modified automatically. The CDN sits in front of all of this.</p>
<div class="callout warn"><p>Never let a shared cache store a response that depends on who is asking without <code>private</code> or a <code>Vary</code> that separates users. This is how one customer sees another's order history.</p></div>` },
    { name: 'Expert', body: `<h4>Cache keys and normalisation</h4>
<p>The edge keys entries by host + path + query (+ Vary headers). Variation that does not change the response (query parameter order, <code>utm_*</code> parameters, trailing slashes, case) fragments the cache and multiplies origin load. Configure the CDN to sort or strip parameters and to ignore cookies on static paths. Measure <span class="term">cache hit ratio</span> per path; anything hot under 90% deserves a look.</p>
<h4>Tiered caching and origin shielding</h4>
<p>With hundreds of edges, each one missing independently would still send hundreds of requests per object to the origin. Tiered caching routes misses through a smaller set of regional caches, and an <span class="term">origin shield</span> funnels all misses through one location near the origin. Combined with <span class="term">request coalescing</span> (collapsing concurrent misses for the same key into one origin fetch), a sudden viral URL produces one origin hit, not a stampede.</p>
<h4>Cache stampede and the thundering herd</h4>
<p>When a popular key expires, thousands of requests miss at once. Defences: coalescing (above), stale-while-revalidate (serve old while one request refreshes), jittered TTLs (so keys do not expire together), and for the application cache, a lock or single-flight pattern. The same problem exists in Redis and in-memory caches; the fix is the same shape at every layer.</p>
<h4>Edge compute</h4>
<p>Modern CDNs run code at the edge (Cloudflare Workers, Azure Front Door rules engine, CloudFront Functions and Lambda@Edge). Typical uses: A/B bucketing by cookie, geo-based redirects, rewriting cache keys, injecting security headers, serving personalised fragments by assembling cached pieces (edge-side includes). Keep edge code small and stateless; a bug there affects every request globally.</p>
<h4>Security roles of a CDN</h4>
<ul>
<li><strong>DDoS absorption:</strong> the CDN's capacity is far larger than yours; volumetric attacks hit the edge and die there.</li>
<li><strong>WAF and bot rules:</strong> layer 7 filtering before traffic reaches you.</li>
<li><strong>TLS termination:</strong> managed certificates at the edge; use authenticated origin pulls (mTLS or a shared secret header) so only the CDN can reach your origin, and firewall the origin to CDN IP ranges.</li>
<li><strong>Signed URLs / tokens:</strong> time-limited access to private content (video, downloads) served from cache without hitting your auth service.</li>
</ul>
<h4>Measuring what matters</h4>
<p>Track hit ratio, origin requests per second, edge TTFB vs origin TTFB, bytes saved, and purge latency. Correlate deploys with hit-ratio drops (a missing hash in a filename, or a new Vary header, shows up here first).</p>
<div class="callout idea"><p>Interview angle: "How would you serve a product page to millions with a 30-second freshness requirement?" Cache the page at the edge with <code>s-maxage=30, stale-while-revalidate=30</code>, tag it with the product id and purge on price change, keep user-specific bits (cart count) in a separate small API call or client-side, and shield the origin with tiered caching and coalescing.</p></div>` }
  ],
  flow: {
    title: 'A request through the CDN: hit, miss, and revalidate',
    steps: [
      { title: 'DNS to nearest edge', desc: 'The CDN\'s DNS or anycast routing lands the user on a PoP close to them.' },
      { title: 'Build the cache key', desc: 'Host + path + normalised query + Vary headers. Tracking parameters are stripped.' },
      { title: 'Cache hit', desc: 'Fresh copy found: served in a few milliseconds. X-Cache: HIT. The origin is never touched.' },
      { title: 'Cache miss', desc: 'No copy (or expired without validators): edge fetches from the origin, possibly via a shield, coalescing duplicate misses.' },
      { title: 'Origin answers', desc: 'Cache-Control and ETag decide if and how long the edge stores it. no-store means pass-through only.' },
      { title: 'Expiry → revalidate', desc: 'After max-age, the edge sends If-None-Match. 304 extends the copy; 200 replaces it. stale-while-revalidate keeps serving meanwhile.' },
      { title: 'Purge on change', desc: 'A deploy or data change calls the purge API by URL or tag, and the next request is a miss that fetches the new version.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'ASP.NET Core: cache headers for static files, ETags for an API, output caching with tags', code: `using Microsoft.AspNetCore.OutputCaching;
using Microsoft.Net.Http.Headers;

var builder = WebApplication.CreateBuilder(args);
builder.Services.AddOutputCache(o =>
{
    o.AddPolicy("catalog", p => p
        .Expire(TimeSpan.FromSeconds(30))
        .SetVaryByQuery("page", "category")   // only these params form the key
        .Tag("catalog"));
});
builder.Services.AddSingleton<ProductRepo>();   // handlers below receive these from DI
builder.Services.AddSingleton<CdnPurger>();
var app = builder.Build();

// 1. Static files: hashed assets live forever, index.html is always re-checked
app.UseStaticFiles(new StaticFileOptions
{
    OnPrepareResponse = ctx =>
    {
        var headers = ctx.Context.Response.GetTypedHeaders();
        var name = ctx.File.Name;
        // Matches app.3f9a1c.js and Angular-style main-5XKXWZ7F.js. Adjust to your bundler's hash format.
        bool hashed = System.Text.RegularExpressions.Regex.IsMatch(name, "[.-]([0-9a-f]{6,}|[A-Z0-9]{8})\\\\.(js|css|woff2|png|svg)$");
        headers.CacheControl = hashed
            ? new CacheControlHeaderValue { Public = true, MaxAge = TimeSpan.FromDays(365), Extensions = { new NameValueHeaderValue("immutable") } }
            : new CacheControlHeaderValue { NoCache = true };   // index.html: revalidate every time (ETag is set automatically)
    }
});

app.UseOutputCache();

// 2. Public API cached at the server AND at the CDN
app.MapGet("/api/products", (int page, string? category, ProductRepo repo) =>
{
    var list = repo.List(page, category);
    return Results.Ok(list);
})
.CacheOutput("catalog")                                   // server-side cache keyed by page+category
.AddEndpointFilter(async (ctx, next) =>
{
    var result = await next(ctx);
    var h = ctx.HttpContext.Response.Headers;
    h.CacheControl = "public, max-age=30, s-maxage=120, stale-while-revalidate=60";  // CDN keeps longer than browsers
    h.Vary = "Accept-Encoding";
    h["Surrogate-Key"] = "catalog";                       // tag for CDN purge-by-tag
    return result;
});

// 3. Per-item endpoint with a real ETag from the row version (304 when unchanged)
app.MapGet("/api/products/{id:int}", (int id, HttpContext ctx, ProductRepo repo) =>
{
    var p = repo.Get(id);
    if (p is null) return Results.NotFound();

    var etag = "\\"" + Convert.ToHexString(p.RowVersion) + "\\"";
    ctx.Response.Headers.ETag = etag;
    ctx.Response.Headers.CacheControl = "public, max-age=0, must-revalidate";   // always ask, cheap 304

    if (ctx.Request.Headers.IfNoneMatch.ToString() == etag)
        return Results.StatusCode(StatusCodes.Status304NotModified);

    return Results.Ok(p);
});

// 4. When data changes: evict server cache and tell the CDN to purge the tag
app.MapPut("/api/products/{id:int}", async (int id, Product input, ProductRepo repo, IOutputCacheStore cache, CdnPurger cdn) =>
{
    repo.Update(id, input);
    await cache.EvictByTagAsync("catalog", default);
    await cdn.PurgeTagAsync("catalog");                   // provider-specific HTTP call
    return Results.NoContent();
});

app.Run();

public record Product(int Id, string Name, decimal Price, byte[] RowVersion);
public class ProductRepo { public List<Product> List(int page, string? c) => new(); public Product? Get(int id) => null; public void Update(int id, Product p) { } }
public class CdnPurger { public Task PurgeTagAsync(string tag) => Task.CompletedTask; }` },
    { lang: 'bash', title: 'See cache behaviour from the outside', code: `# Was it a hit? Look for X-Cache / cf-cache-status / x-azure-cache / Age headers
curl -sI https://cdn.shop.com/assets/app.3f9a1c.js | grep -iE "cache|age|etag|expires|vary"

# Run it twice: Age should grow on the second call if the edge cached it
# (-D - prints the headers of a normal GET. curl -I sends HEAD, which a MapGet endpoint answers with 405.)
for i in 1 2; do curl -s -o /dev/null -D - https://cdn.shop.com/api/products | grep -iE "x-cache|age:"; done

# Conditional request: expect 304 if the ETag still matches
ETAG=$(curl -s -o /dev/null -D - https://api.shop.com/api/products/42 | grep -i etag | cut -d' ' -f2 | tr -d '\\r')
curl -s -o /dev/null -w '%{http_code}\\n' -H "If-None-Match: $ETAG" https://api.shop.com/api/products/42

# Time edge vs origin
curl -s -o /dev/null -w 'edge   ttfb %{time_starttransfer}\\n' https://cdn.shop.com/api/products
curl -s -o /dev/null -w 'origin ttfb %{time_starttransfer}\\n' https://origin.shop.com/api/products

# Angular production build: note the content hashes in file names (cache busting for free)
ng build --configuration production && ls dist/*/browser | head` },
    { lang: 'text', title: 'Cache-Control recipes by content type', code: `Content                          Cache-Control
-------------------------------  ---------------------------------------------------------
Hashed JS/CSS/fonts/images       public, max-age=31536000, immutable
index.html / app shell           no-cache                      (always revalidate; ETag)
Public API list (ok 30 s stale)  public, max-age=30, s-maxage=120, stale-while-revalidate=60
Per-user API (orders, profile)   private, no-store             (or private, max-age=0)
Login, payments, tokens          no-store
Large downloads / video          public, max-age=86400  + signed URL for private content
Error responses (5xx)            no-store                      (never cache an outage)

Validators:  ETag: "hash-or-rowversion"   Last-Modified: <http-date>
Splitting:   Vary: Accept-Encoding        (add Accept-Language only if you localise)
Purge:       Surrogate-Key / Cache-Tag: product-42 catalog   -> purge by tag on change` }
  ],
  pitfalls: [
    'Long max-age on files whose names do not change. Users keep the old app.js for a year. Hash the file names (Angular does) and cache those forever instead.',
    'Caching personalised responses in a shared cache. Missing "private" or Vary lets user A see user B\'s data.',
    'no-cache does not mean "do not cache". It means "revalidate before use". Use no-store when nothing may be kept.',
    'Caching error responses. A 30-second blip becomes a 30-minute outage for everyone at the edge.',
    'Including every query parameter in the cache key. utm_ and session parameters fragment the cache and defeat it.',
    'Leaving the origin reachable from the internet. Lock it to CDN IPs or authenticated origin pulls, or attackers bypass your WAF.'
  ],
  quiz: [
    { q: 'Which Cache-Control value means "store nothing, anywhere"?', options: ['no-cache', 'private', 'no-store', 'max-age=0'], answer: 2, why: 'no-store forbids storing. no-cache allows storing but requires revalidation; private limits storage to the browser.' },
    { q: 'How do users get a new version of a JavaScript file cached for a year?', options: ['They wait until the one-year max-age has run out', 'The browser quietly re-checks every cached file daily', 'A content hash in the file name gives it a new URL', 'They are asked to clear the browser cache by hand'], answer: 2, why: 'Cache busting via hashed file names: the HTML references app.3f9a1c.js today and app.9b2e77.js after the next deploy.' },
    { q: 'What does a 304 Not Modified response contain?', options: ['The full updated body plus a new ETag', 'No body; the cached copy is still valid', 'An error message explaining what changed', 'A redirect to the new URL of the resource'], answer: 1, why: '304 is the answer to a conditional request (If-None-Match / If-Modified-Since). The cache keeps using what it has.' },
    { q: 'What does stale-while-revalidate do?', options: ['Deletes stale entries as soon as their max-age passes', 'Serves the expired copy while a fresh one is fetched', 'Forces a full download before any stale copy is used', 'Disables the CDN while the origin checks its content'], answer: 1, why: 'It hides the refresh latency from users and smooths traffic to the origin at expiry time.' },
    { q: 'Your API response differs by the Accept-Language header. Which header must you send so caches keep separate copies?', options: ['Vary: Accept-Language', 'Cache-Control: private', 'ETag', 'Content-Language only'], answer: 0, why: 'Vary tells caches which request headers are part of the cache key. Without it, a French response could be served to an English user.' },
    { q: 'Why does s-maxage exist?', options: ['To let caches store pages served over HTTPS', 'To give shared caches (CDNs) their own TTL', 'To shorten the TLS handshake for cached files', 'To purge one URL from every edge at the same time'], answer: 1, why: 's-maxage applies only to shared caches, so a CDN can keep content longer than individual browsers, which still revalidate more often.' }
  ],
  takeaways: [
    'A CDN serves cached copies from edges near users; misses go to your origin, ideally through a shield with coalescing.',
    'Cache-Control is the contract: max-age / s-maxage for how long, public / private for who, no-cache (revalidate) vs no-store (never).',
    'ETag + If-None-Match → 304 saves bandwidth; stale-while-revalidate and stale-if-error hide latency and outages.',
    'Hash file names and cache them forever; keep the HTML that references them on no-cache.',
    'Vary splits the cache by request header; use it precisely. Never cache per-user data in shared caches.',
    'Normalise cache keys, purge by tag on change, cache no errors, and lock the origin to the CDN.'
  ],
  interview: [
    { q: 'How does a CDN decide whether it can serve a response from cache?', a: '<p>It builds a cache key from host, path, normalised query string and any headers named in Vary, then looks for a stored response. If one exists and its age is below max-age or s-maxage, it is a hit. If it is expired but has an ETag or Last-Modified, the edge revalidates with a conditional request and uses a 304 to refresh it. Responses marked no-store, private, or without caching headers (depending on CDN defaults) are passed through.</p>' },
    { q: 'What is the difference between no-cache and no-store?', a: '<p>no-cache permits storing the response but requires revalidating with the origin before every reuse (a 304 makes that cheap). no-store forbids storing it at all, in browsers or shared caches. Use no-cache for HTML shells and frequently-changing resources with validators; use no-store for sensitive data.</p>' },
    { q: 'How would you cache a dynamic product page but update it instantly when the price changes?', a: '<p>Serve it with a long shared TTL and a surrogate key / cache tag for the product id. When the price changes, call the CDN purge-by-tag API (and evict any server-side output cache). The next request misses and fetches the fresh page. Add stale-while-revalidate so the refresh is invisible, and keep user-specific parts out of the cached page.</p>' },
    { q: 'What is a cache stampede and how do you prevent it?', a: '<p>When a hot cached item expires, many concurrent requests miss simultaneously and all hit the origin. Prevent it with request coalescing (one fetch, others wait), stale-while-revalidate (serve old while one refreshes), jittered TTLs so keys do not expire together, and a single-flight lock in application caches.</p>' }
  ]
};

/* ───────────────────────── m6-network-security ───────────────────────── */
window.CONTENT['m6-network-security'] = {
  hook: `Most breaches do not break the encryption. They walk through a door someone left open: a database port on the internet, a secret in a repo, a service that trusted anything on the "internal" network. Network security is mostly about closing doors.`,
  intro: `<p><span class="term">Network security</span> is the set of controls that decide who can reach what over the network, and that keep traffic private and unaltered on the way. It sits underneath application security: a perfect login page does not help if the database accepts connections from the whole internet.</p>
<p>The building blocks are few: <span class="term">firewalls</span> (allow or block by address and port), <span class="term">TLS</span> (encrypt and authenticate traffic), <span class="term">VPNs</span> (a private tunnel across public networks), <span class="term">segmentation</span> (small networks that cannot see each other), and the newer idea of <span class="term">zero trust</span> (never trust by location, always verify identity).</p>
<p>You also need to recognise the common attacks (DDoS, man-in-the-middle, DNS spoofing, SYN floods, port scanning) well enough to know which control stops each. This topic ends with the secure defaults for a .NET API and how to handle secrets, which is where most real incidents start.</p>`,
  realLife: {
    title: 'Securing an office building',
    body: `<p>A firewall is the reception desk and locked doors: only people on the list get through, and only to the floors they need. A VPN is a private corridor from a remote office straight into the building. TLS is a sealed envelope with a wax seal, so the post room cannot read or alter letters. Segmentation is locking the server room separately from the open-plan office, so a visitor who gets past reception still cannot touch the servers.</p>
<p>Zero trust is the realisation that being inside the building proves nothing: the cleaner, the contractor, and the laptop someone forgot in a taxi are all inside. So every door, even internal ones, asks for your badge and checks that you are allowed through right now.</p>
<p>Where real companies use this: Google's BeyondCorp replaced its corporate VPN with per-request identity checks after the 2009 Aurora intrusion. Cloud providers' "private endpoints" let a database exist with no public IP at all, reachable only from inside a specific virtual network.</p>`
  },
  levels: [
    { name: 'Beginner', body: `<h4>Firewalls: the allow list</h4>
<p>A firewall looks at each packet's source IP, destination IP, port and protocol and applies rules in order: allow this, block that, and finally <strong>deny everything else</strong>. The last rule is the important one. A good server exposes only what it must: 443 for HTTPS, maybe 22 for SSH from your office IP, nothing else. Cloud firewalls are called security groups or network security groups (NSGs).</p>
<h4>TLS everywhere</h4>
<p>Any traffic without TLS can be read and altered by anyone on the path: coffee-shop Wi-Fi, an ISP, a compromised router. "Internal" traffic between your API and database is not exempt; cloud networks are shared. Use HTTPS for the browser, TLS for database and Redis connections, and mTLS between services where you can.</p>
<h4>VPNs</h4>
<p>A VPN encrypts all traffic between your device and a gateway, making your laptop behave as if it were on the office network. Good for admin access to private resources. Not a magic security blanket: once connected, you are "inside", which is exactly the assumption zero trust warns about.</p>
<h4>Common attacks in one line each</h4>
<table><thead><tr><th>Attack</th><th>What happens</th><th>Main defence</th></tr></thead><tbody>
<tr><td>DDoS</td><td>Floods of traffic overwhelm your server or link</td><td>CDN / cloud DDoS protection, rate limits</td></tr>
<tr><td>Man-in-the-middle</td><td>Attacker sits between you and the server, reading or changing traffic</td><td>TLS with certificate validation, HSTS</td></tr>
<tr><td>DNS spoofing</td><td>You are given a fake IP for a real name</td><td>DNSSEC, DoH/DoT, TLS (the fake site has no valid certificate)</td></tr>
<tr><td>SYN flood</td><td>Half-open connections exhaust the server</td><td>SYN cookies, load balancer / CDN in front</td></tr>
<tr><td>Port scanning</td><td>Attacker maps which ports are open</td><td>Expose almost nothing; firewall default deny</td></tr>
<tr><td>Credential stuffing</td><td>Leaked passwords tried on your login</td><td>MFA, rate limiting, breached-password checks</td></tr>
</tbody></table>
<div class="callout tip"><p>If you remember one thing: your database, Redis and message broker must never have a public IP. Put them in a private subnet reachable only from your API's subnet.</p></div>` },
    { name: 'Intermediate', body: `<h4>Segmentation and private networking</h4>
<p>Split your cloud network into subnets by role: public (load balancer only), application (API servers), data (database, cache). Rules: internet → load balancer on 443; load balancer → app on 8080; app → data on 1433/6379; everything else denied. Use <span class="term">private endpoints</span> so managed databases have no public address. A compromised web server can then reach only what it needs.</p>
<h4>Zero trust in practice</h4>
<ul>
<li><strong>Identity for every call:</strong> services authenticate to each other (managed identities, mTLS, signed tokens), not "it came from 10.0.2.x so it is fine".</li>
<li><strong>Least privilege:</strong> an API that only reads products gets a database login that only reads products.</li>
<li><strong>Short-lived credentials:</strong> tokens that expire in minutes, certificates rotated automatically.</li>
<li><strong>Verify device and context:</strong> admin access requires MFA, a managed device, and sometimes a specific location.</li>
</ul>
<h4>DDoS layers</h4>
<p><strong>Volumetric (L3/L4):</strong> gigabits of junk packets; only a CDN or cloud scrubbing service with more bandwidth than the attacker can absorb it. <strong>Protocol (L4):</strong> SYN floods and similar; mitigated by SYN cookies and proxies that complete handshakes before forwarding. <strong>Application (L7):</strong> real-looking HTTP requests to expensive endpoints (search, login); mitigated by WAF rules, rate limiting per client, caching, and making expensive endpoints cheaper or asynchronous.</p>
<h4>How TLS defeats MITM, and when it does not</h4>
<p>An attacker can intercept packets, but cannot produce a valid certificate for your domain, so a validating client refuses to connect. The failures that reopen the door: clients that skip validation (the infamous "return true" callback), a malicious root certificate installed on the device (corporate proxies do this legitimately; malware does it too), plain HTTP before the HTTPS redirect (fixed by HSTS), and expired certificates that train users to click through warnings.</p>
<h4>Secure defaults for a .NET API</h4>
<ul>
<li>HTTPS only, HSTS on, TLS 1.2 minimum (1.3 preferred). Disable weak ciphers at the load balancer.</li>
<li>Security headers: <code>Content-Security-Policy</code>, <code>X-Content-Type-Options: nosniff</code>, <code>X-Frame-Options</code> / <code>frame-ancestors</code>, <code>Referrer-Policy</code>.</li>
<li>CORS: list exact origins; never <code>*</code> with credentials.</li>
<li>Rate limiting middleware on login, search and anything that touches external services.</li>
<li>Request size limits, timeouts, and <code>ForwardedHeaders</code> trusting only your proxy.</li>
<li>No stack traces or server versions in error responses (ProblemDetails with a trace id instead).</li>
</ul>
<h4>Secrets</h4>
<p>Connection strings, API keys and certificates are the most common thing leaked. Rules: never in source control (use <code>dotnet user-secrets</code> locally, a secret store in production such as Azure Key Vault or AWS Secrets Manager); prefer <span class="term">managed identity</span> so there is no password at all; rotate on a schedule; scan repos for leaked secrets in CI.</p>
<div class="callout warn"><p>A secret that was ever committed to git is compromised even after you delete it. History keeps it. Rotate it immediately; do not just remove the line.</p></div>` },
    { name: 'Expert', body: `<h4>Defence in depth, layer by layer</h4>
<table><thead><tr><th>Layer</th><th>Controls</th></tr></thead><tbody>
<tr><td>Edge</td><td>CDN with DDoS absorption, WAF, bot management, geo rules, TLS termination with modern ciphers</td></tr>
<tr><td>Network</td><td>NSGs/security groups default-deny, private subnets, private endpoints, no public IPs on data services, egress filtering</td></tr>
<tr><td>Transport</td><td>TLS 1.3, mTLS between services (service mesh), certificate automation, HSTS preload</td></tr>
<tr><td>Identity</td><td>Managed identities, short-lived tokens, MFA for humans, least-privilege roles, just-in-time admin access</td></tr>
<tr><td>Application</td><td>Input validation, rate limits, security headers, dependency scanning, secret scanning, audit logs</td></tr>
<tr><td>Detection</td><td>Flow logs, IDS/IPS, anomaly alerts on egress volume and failed auth, honeypot ports</td></tr>
</tbody></table>
<h4>Egress is the forgotten direction</h4>
<p>Most teams filter inbound and allow all outbound. Attackers depend on outbound: exfiltrating data, calling home, fetching tools. Restrict egress to known destinations (your package registry, your APIs, your cloud services) through a NAT gateway or proxy with logging. SSRF attacks (your server tricked into calling internal URLs or cloud metadata endpoints) are also an egress-control problem; block the metadata IP (169.254.169.254) from app workloads that do not need it and use IMDSv2-style token requirements where available.</p>
<h4>Service-to-service trust</h4>
<p>In Kubernetes or microservices, a service mesh (Istio, Linkerd) or Dapr issues each workload a short-lived certificate (SPIFFE identity) and enforces mTLS plus "service A may call service B on path /x" policies. Without a mesh, use managed identities and audience-scoped tokens: service B validates that the token was issued for B, not merely that it is valid. Network policies in Kubernetes are the firewall between pods; default-deny them too.</p>
<h4>Modern TLS hygiene</h4>
<ul>
<li>Prefer TLS 1.3; allow 1.2 for legacy clients; disable 1.0/1.1 and RC4/3DES/CBC-with-SHA1 suites.</li>
<li>Use ECDSA or RSA-2048+ keys, OCSP stapling, and certificate transparency monitoring to detect certificates issued for your domain without your knowledge.</li>
<li>Automate issuance (ACME) and alert at 14 days before expiry regardless.</li>
<li>Pin certificates only in mobile apps you control, with a backup pin; pinning in browsers is dead.</li>
</ul>
<h4>Incident-shaped thinking</h4>
<p>Assume one component is compromised and ask what it can reach. A web pod with read-only DB credentials, no egress except the DB and the token service, and a 10-minute token is a contained incident. The same pod with a sysadmin connection string, open egress, and a long-lived key is a breach. Network security is the discipline of making the first picture the default.</p>
<div class="callout idea"><p>Interview angle: "How would you secure communication between microservices?" mTLS (mesh or managed certificates) for transport, audience-scoped short-lived tokens for authorization, default-deny network policies for reachability, and centralised logging of every denied call. Mention that "internal network" is not an authentication mechanism.</p></div>` }
  ],
  flow: {
    title: 'A request through a defended network',
    steps: [
      { title: 'Edge absorbs', desc: 'CDN/anycast soaks up volumetric DDoS; WAF drops obvious attacks; TLS terminates with modern ciphers.' },
      { title: 'Public subnet', desc: 'Only the load balancer lives here. Firewall allows 443 in, nothing else.' },
      { title: 'App subnet', desc: 'Load balancer forwards to API pods on an internal port. Pods authenticate the LB (mTLS or header secret).' },
      { title: 'Identity check', desc: 'The API validates the user\'s token, then calls other services with its own short-lived, audience-scoped token.' },
      { title: 'Data subnet', desc: 'Database and cache have no public IP; only the app subnet can reach their ports. Credentials are least-privilege.' },
      { title: 'Egress filtered', desc: 'Outbound calls pass a NAT/proxy that allows only known destinations and logs the rest.' },
      { title: 'Everything logged', desc: 'Flow logs, auth failures and denied connections feed alerts. A compromised pod is contained and visible.' }
    ]
  },
  code: [
    { lang: 'csharp', title: 'ASP.NET Core secure defaults: headers, CORS, rate limits, limits, Key Vault + managed identity', code: `using System.Threading.RateLimiting;
using Azure.Identity;
using Microsoft.AspNetCore.HttpOverrides;
using Microsoft.AspNetCore.RateLimiting;

var builder = WebApplication.CreateBuilder(args);

// Secrets: nothing in appsettings.json. Local dev uses user-secrets; prod reads Key Vault with managed identity (no password).
if (!builder.Environment.IsDevelopment())
{
    builder.Configuration.AddAzureKeyVault(
        new Uri("https://shop-kv.vault.azure.net/"),
        new DefaultAzureCredential());
}

builder.WebHost.ConfigureKestrel(k =>
{
    k.Limits.MaxRequestBodySize = 10 * 1024 * 1024;          // 10 MB unless an endpoint opts in
    k.Limits.RequestHeadersTimeout = TimeSpan.FromSeconds(10); // slowloris defence
    k.AddServerHeader = false;                                 // do not send the "Server: Kestrel" header
});

builder.Services.Configure<ForwardedHeadersOptions>(o =>
{
    o.ForwardedHeaders = ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;
    o.KnownNetworks.Clear(); o.KnownProxies.Clear();
    o.KnownNetworks.Add(new IPNetwork(System.Net.IPAddress.Parse("10.0.0.0"), 16));   // only our LB subnet
    // .NET 10+: KnownNetworks is marked obsolete. Use o.KnownIPNetworks.Add(System.Net.IPNetwork.Parse("10.0.0.0/16")) there.
});

builder.Services.AddCors(o => o.AddDefaultPolicy(p => p
    .WithOrigins("https://app.shop.com")       // exact origins, never "*" with credentials
    .WithMethods("GET", "POST", "PUT", "DELETE")
    .WithHeaders("Authorization", "Content-Type")
    .AllowCredentials()));

builder.Services.AddRateLimiter(o =>
{
    o.RejectionStatusCode = StatusCodes.Status429TooManyRequests;
    o.AddPolicy("login", ctx => RateLimitPartition.GetFixedWindowLimiter(
        ctx.Connection.RemoteIpAddress?.ToString() ?? "unknown",
        _ => new FixedWindowRateLimiterOptions { PermitLimit = 10, Window = TimeSpan.FromMinutes(1) }));
});

builder.Services.AddHsts(o => { o.MaxAge = TimeSpan.FromDays(365); o.IncludeSubDomains = true; });
builder.Services.AddProblemDetails();        // uniform errors, no stack traces in prod
builder.Services.AddAuthentication().AddJwtBearer();   // JwtBearer package; issuer and audience come from configuration
builder.Services.AddAuthorization();         // UseAuthorization and RequireAuthorization need this

var app = builder.Build();

app.UseForwardedHeaders();
app.UseExceptionHandler();
if (!app.Environment.IsDevelopment()) app.UseHsts();
app.UseHttpsRedirection();

// Security headers on every response
app.Use(async (ctx, next) =>
{
    var h = ctx.Response.Headers;
    h["X-Content-Type-Options"] = "nosniff";
    h["Referrer-Policy"] = "strict-origin-when-cross-origin";
    h["Content-Security-Policy"] = "default-src 'none'; frame-ancestors 'none'";   // API: nothing to load
    h["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    await next();
});

app.UseCors();
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapPost("/auth/login", () => Results.Ok()).RequireRateLimiting("login");
app.MapGet("/api/products", () => Results.Ok(new[] { "mouse", "keyboard" })).RequireAuthorization();

app.Run();` },
    { lang: 'bash', title: 'Audit your own exposure', code: `# What is listening on this server, and on which interface? (0.0.0.0 = everyone, 127.0.0.1 = local only)
ss -ltnp

# Scan your public IP from outside (only scan systems you own)
nmap -sS -p- --min-rate 1000 203.0.113.10          # expect: 443 open, 22 maybe, nothing else
nmap -sV -p 443 203.0.113.10                        # service/version fingerprint

# TLS configuration check
openssl s_client -connect api.shop.com:443 -tls1_1 </dev/null >/dev/null 2>&1 || echo "TLS 1.1 handshake refused: good"
nmap --script ssl-enum-ciphers -p 443 api.shop.com  # lists accepted protocols and cipher grades

# Security headers present?
curl -sI https://api.shop.com/ | grep -iE "strict-transport|content-security|x-content-type|x-frame|referrer"

# Secrets: scan the repo history before it is too late
gitleaks detect --source . --redact        # or: trufflehog git file://.
dotnet user-secrets init && dotnet user-secrets set "ConnectionStrings:Db" "Server=...;"   # local dev only

# Cloud firewall example (Azure NSG): allow 443 from internet to LB subnet, deny all else
az network nsg rule create -g rg --nsg-name web-nsg -n allow-https --priority 100 \\
  --direction Inbound --access Allow --protocol Tcp --destination-port-ranges 443 --source-address-prefixes Internet
az network nsg rule create -g rg --nsg-name web-nsg -n deny-all --priority 4000 \\
  --direction Inbound --access Deny --protocol '*' --destination-port-ranges '*'` },
    { lang: 'text', title: 'Reference network layout for a .NET + Angular app', code: `Internet
   |
   v  (443 only; DDoS + WAF + TLS termination)
[ CDN / Front Door ]  ---- serves Angular static files from cache
   |
   v  (authenticated origin pull: mTLS or shared-secret header; origin firewalled to CDN IPs)
[ Public subnet ]  Load balancer / API gateway   (NSG: in 443 from CDN ranges; out to app subnet only)
   |
   v  (8080, from LB subnet only)
[ App subnet ]     ASP.NET Core API pods         (managed identity; short-lived tokens; egress via proxy)
   |            \\
   v             v
[ Data subnet ]  SQL Server (1433)   Redis (6380 TLS)   Service Bus (private endpoint)
                 no public IPs; NSG allows only app subnet; least-privilege logins

[ Admin access ] VPN or identity-aware proxy + MFA + managed device -> bastion -> app/data subnets (JIT, logged)
[ Egress ]       NAT gateway / proxy: allow package registry, cloud APIs, payment provider; log everything else
[ Secrets ]      Key Vault via managed identity; rotation schedule; CI secret scanning` }
  ],
  pitfalls: [
    'A database, Redis or RabbitMQ with a public IP "temporarily". Scanners find it within minutes; ransomware bots try default passwords constantly.',
    'Trusting the internal network. A compromised web server should not be able to reach everything on 10.0.0.0/8.',
    'Secrets in appsettings.json or environment files committed to git. Rotate immediately; deletion does not remove history.',
    'CORS set to allow any origin with credentials. The browser will refuse it anyway, and loosening it further opens your API to every website.',
    'Ignoring outbound traffic. Exfiltration and SSRF both depend on unrestricted egress.',
    'Disabling TLS validation or pinning badly in a mobile app. One expired certificate then forces an emergency app release, so teams remove the check, which is worse.'
  ],
  quiz: [
    { q: 'What is the most important rule in a firewall policy?', options: ['Allow ports 80 and 443 from every source', 'Allow SSH from anywhere for emergencies', 'Deny everything not explicitly allowed', 'Log all packets before allowing them'], answer: 2, why: 'Default deny means a forgotten service is unreachable rather than exposed. Every allow rule is then a conscious decision.' },
    { q: 'Why can a man-in-the-middle not simply impersonate api.shop.com over HTTPS?', options: ['The traffic moves too fast to be read and changed', 'They cannot get a trusted certificate for that name', 'IP addresses are encrypted, so they cannot find it', 'Firewalls on the path block any machine in the middle'], answer: 1, why: 'TLS authentication rests on the certificate chain. Without a trusted certificate for the exact name, the client aborts the handshake.' },
    { q: 'What does "zero trust" mean?', options: ['Verify identity on every request, wherever it comes from', 'Use no passwords, because the network is fully trusted', 'Encrypt only external traffic, since inside is safe', 'Block all network access until an administrator approves it'], answer: 0, why: 'Zero trust removes "inside the network = trusted". Location proves nothing; identity, device and policy are checked each time.' },
    { q: 'Which attack is stopped mainly by having far more bandwidth than the attacker (a CDN or scrubbing service)?', options: ['SQL injection', 'Volumetric DDoS', 'Credential stuffing', 'DNS spoofing'], answer: 1, why: 'Volumetric floods are a capacity contest. Only an edge network with enormous capacity can absorb them before they reach you.' },
    { q: 'A connection string was accidentally pushed to GitHub and removed in the next commit. What must you do?', options: ['Nothing, the next commit deleted it', 'Rotate the credential immediately', 'Make the repo private straight away', 'Add the file to .gitignore and move on'], answer: 1, why: 'Git history preserves the secret and scanners harvest public commits within minutes. Treat it as leaked and rotate.' },
    { q: 'Which is the best way for an API to authenticate to Azure SQL or Key Vault?', options: ['A password in appsettings.json', 'A long-lived API key in an environment variable', 'A managed identity with short-lived tokens', 'Trusting the subnet IP range'], answer: 2, why: 'Managed identity means there is no secret to leak or rotate; the platform issues short-lived tokens to the workload.' }
  ],
  takeaways: [
    'Firewalls: default deny, expose only 443 (and admin ports only from known sources). Data services never get a public IP.',
    'TLS everywhere, including internal traffic; validation never disabled; HSTS on; modern ciphers only.',
    'Segment networks by role (public / app / data) and filter egress as carefully as ingress.',
    'Zero trust: identity for every call, least privilege, short-lived credentials, MFA for humans.',
    'Know the attack → control pairs: DDoS → CDN; MITM → TLS; DNS spoofing → DNSSEC/TLS; SYN flood → cookies/proxy; stuffing → MFA + rate limits.',
    'Secrets live in a vault, ideally replaced by managed identity; anything ever committed is compromised.'
  ],
  interview: [
    { q: 'How would you secure a three-tier web application on a cloud provider?', a: '<p>CDN with WAF and DDoS protection in front; a public subnet holding only the load balancer with a default-deny security group allowing 443; an app subnet reachable only from the load balancer; a data subnet with private endpoints and no public IPs reachable only from the app subnet. TLS end to end, managed identities instead of passwords, secrets in a vault, egress filtering, flow logs and alerts, MFA plus just-in-time access for admins.</p>' },
    { q: 'Explain zero trust and how it differs from a traditional perimeter model.', a: '<p>The perimeter model trusts anything inside the firewall and focuses on keeping attackers out. Zero trust assumes the network is hostile: every request is authenticated and authorised based on identity, device health and context, regardless of where it originates; access is least-privilege and time-bound; and everything is logged. It contains breaches instead of only preventing them.</p>' },
    { q: 'What kinds of DDoS attacks exist and how do you defend against each?', a: '<p>Volumetric (L3/L4) floods saturate bandwidth and are absorbed by CDN or cloud scrubbing capacity. Protocol attacks like SYN floods exhaust connection state and are handled by SYN cookies and proxies that complete the handshake first. Application-layer (L7) attacks send valid-looking expensive requests and are mitigated by WAF rules, per-client rate limits, caching and making costly endpoints cheaper or asynchronous.</p>' },
    { q: 'How do you manage secrets in a .NET application?', a: '<p>Never in source control: user-secrets for local development, a managed secret store (Key Vault, Secrets Manager) in other environments loaded through configuration providers. Prefer managed identity so there is no secret at all. Rotate on a schedule and immediately on any suspected leak, scan repositories and CI logs for secrets, and give each workload only the permissions it needs.</p>' }
  ]
};

