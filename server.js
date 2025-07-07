const express = require('express');
const dns = require('dns').promises;
const app = express();
const port = 3000;

// Add CORS middleware
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, ngrok-skip-browser-warning');
  
  // Add ngrok bypass header
  res.header('ngrok-skip-browser-warning', 'any');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Reduced predefined email provider database (focusing on major consumer providers)
const emailProviders = {
  // Major Global Consumer Providers
  'gmail.com': 'Google Gmail',
  'googlemail.com': 'Google Gmail',
  'outlook.com': 'Microsoft Outlook',
  'hotmail.com': 'Microsoft Hotmail',
  'live.com': 'Microsoft Live',
  'yahoo.com': 'Yahoo Mail',
  'ymail.com': 'Yahoo Mail',
  'aol.com': 'AOL Mail',
  'icloud.com': 'Apple iCloud',
  'me.com': 'Apple iCloud',
  'protonmail.com': 'ProtonMail',
  'proton.me': 'ProtonMail',
  
  // Popular Regional Consumer Providers
  'mail.ru': 'Mail.ru (Russia)',
  'yandex.com': 'Yandex (Russia)',
  'qq.com': 'QQ Mail (China)',
  '163.com': '163.com (China)',
  '126.com': '126.com (China)',
  'naver.com': 'Naver (South Korea)',
  'yahoo.co.jp': 'Yahoo Japan',
  'gmx.com': 'GMX (Germany)',
  'web.de': 'Web.de (Germany)',
  'orange.fr': 'Orange (France)',
  'libero.it': 'Libero (Italy)',
  'uol.com.br': 'UOL (Brazil)',
  'rediffmail.com': 'Rediff (India)',
  
  // Privacy-focused Providers
  'tutanota.com': 'Tutanota',
  'fastmail.com': 'FastMail',
  'hey.com': 'Hey'
};

// MX record patterns for identifying business email providers worldwide
const mxPatterns = {
  // Major Global Providers
  'gmail': 'Google Gmail',
  'googlemail': 'Google Gmail',
  'google': 'Google Workspace',
  'outlook': 'Microsoft Outlook',
  'office365': 'Microsoft Office 365',
  'exchange': 'Microsoft Exchange',
  'hotmail': 'Microsoft Hotmail',
  'live': 'Microsoft Live',
  'yahoo': 'Yahoo Mail',
  'aol': 'AOL Mail',
  'zoho': 'Zoho Mail',
  'protonmail': 'ProtonMail',
  'tutanota': 'Tutanota',
  'fastmail': 'FastMail',
  
  // Cloud & Enterprise Email Services
  'amazonaws': 'Amazon SES/WorkMail',
  'amazonses': 'Amazon SES',
  'workmail': 'Amazon WorkMail',
  'mailgun': 'Mailgun',
  'sendgrid': 'SendGrid',
  'mandrill': 'Mandrill',
  'postmark': 'Postmark',
  'sparkpost': 'SparkPost',
  'mailchimp': 'Mailchimp Transactional',
  'sendinblue': 'Sendinblue',
  'constantcontact': 'Constant Contact',
  'campaignmonitor': 'Campaign Monitor',
  
  // Hosting & Domain Providers
  'godaddy': 'GoDaddy Email',
  'namecheap': 'Namecheap Email',
  'bluehost': 'Bluehost Email',
  'hostgator': 'HostGator Email',
  'siteground': 'SiteGround Email',
  'dreamhost': 'DreamHost Email',
  'ionos': 'IONOS Email',
  '1and1': '1&1 IONOS',
  'ovh': 'OVH Mail',
  'rackspace': 'Rackspace Email',
  'cloudflare': 'Cloudflare Email',
  
  // Control Panel Solutions
  'cpanel': 'cPanel Email',
  'plesk': 'Plesk Mail',
  'zimbra': 'Zimbra',
  'kerio': 'Kerio Connect',
  'smartermail': 'SmarterMail',
  'mdaemon': 'MDaemon',
  'icewarp': 'IceWarp',
  'axigen': 'Axigen',
  'mailsite': 'MailSite',
  'surgemail': 'SurgeMail',
  
  // European Business Providers
  'cleanmx': 'CleanMX (Portugal)',
  'fortinet': 'Fortinet Email Security',
  'barracuda': 'Barracuda Email Security',
  'mimecast': 'Mimecast',
  'proofpoint': 'Proofpoint',
  'symantec': 'Symantec Email Security',
  'trendmicro': 'Trend Micro Email Security',
  'sophos': 'Sophos Email',
  'kaspersky': 'Kaspersky Security for Mail Server',
  'checkpoint': 'Check Point Email Security',
  'mcafee': 'McAfee Email Security',
  'eset': 'ESET Mail Security',
  'bitdefender': 'Bitdefender Email Security',
  'fsecure': 'F-Secure Email Security',
  'avira': 'Avira Email Security',
  'avg': 'AVG Email Security',
  'avast': 'Avast Email Security',
  
  // European Hosting/Email Providers
  'strato': 'Strato (Germany)',
  'netcup': 'Netcup (Germany)',
  'hetzner': 'Hetzner (Germany)',
  'mittwald': 'Mittwald (Germany)',
  'webgo': 'Webgo (Germany)',
  'domainfactory': 'DomainFactory (Germany)',
  'hosteurope': 'Host Europe (Germany)',
  'alfahosting': 'Alfahosting (Germany)',
  'allinkl': 'All-Inkl (Germany)',
  'worldsoft': 'World4You (Austria)',
  'hosting2go': 'Hosting2go (Austria)',
  'one': 'One.com (Denmark)',
  'loopia': 'Loopia (Sweden)',
  'binero': 'Binero (Sweden)',
  'surftown': 'Surftown (Denmark)',
  'papaki': 'Papaki (Greece)',
  'aruba': 'Aruba (Italy)',
  'register.it': 'Register.it (Italy)',
  'netsons': 'Netsons (Italy)',
  'serverplan': 'Serverplan (Italy)',
  'tophost': 'TopHost (Italy)',
  'gandi': 'Gandi (France)',
  'amen': 'Amen (France)',
  'lws': 'LWS (France)',
  'planethoster': 'PlanetHoster (France/Canada)',
  'infomaniak': 'Infomaniak (Switzerland)',
  'hostpoint': 'Hostpoint (Switzerland)',
  'metanet': 'Metanet (Switzerland)',
  'transip': 'TransIP (Netherlands)',
  'versio': 'Versio (Netherlands)',
  'hostnet': 'Hostnet (Netherlands)',
  'antagonist': 'Antagonist (Netherlands)',
  'pcextreme': 'PCextreme (Netherlands)',
  'combell': 'Combell (Belgium)',
  'hostbasket': 'HostBasket (Belgium)',
  'kinsta': 'Kinsta',
  'wpengine': 'WP Engine',
  
  // Asian Business Providers
  'alibaba': 'Alibaba Cloud Mail (China)',
  'aliyun': 'Alibaba Cloud (China)',
  'tencent': 'Tencent Enterprise Email (China)',
  'huawei': 'Huawei Cloud Mail (China)',
  'baidu': 'Baidu Enterprise Email (China)',
  'netease': 'NetEase Enterprise Mail (China)',
  'coremail': 'Coremail (China)',
  'richmail': 'RichMail (China)',
  'turbomail': 'TurboMail (China)',
  'winmail': 'WinMail (China)',
  'u-mail': 'U-Mail (China)',
  'eyou': 'Eyou Mail (China)',
  'naver': 'Naver Works (South Korea)',
  'kakao': 'Kakao Work (South Korea)',
  'dooray': 'Dooray (South Korea)',
  'gabia': 'Gabia (South Korea)',
  'cafe24': 'Cafe24 (South Korea)',
  'iwinv': 'iwinv (South Korea)',
  'rakuten': 'Rakuten (Japan)',
  'sakura': 'Sakura Internet (Japan)',
  'onamae': 'Onamae.com (Japan)',
  'valueserver': 'Value Server (Japan)',
  'xserver': 'Xserver (Japan)',
  'lolipop': 'Lolipop (Japan)',
  'heteml': 'Heteml (Japan)',
  'conoha': 'ConoHa (Japan)',
  'vultr': 'Vultr',
  'linode': 'Linode',
  'digitalocean': 'DigitalOcean',
  
  // Indian Business Providers
  'rediffmail': 'Rediffmail Pro (India)',
  'zohocorp': 'Zoho Corporation (India)',
  'bigrock': 'BigRock (India)',
  'hostgator.in': 'HostGator India',
  'godaddy.in': 'GoDaddy India',
  'netmagic': 'Netmagic (India)',
  'websitewelcome': 'WebsiteWelcome (India)',
  'justhost': 'JustHost (India)',
  'hostripples': 'HostRipples (India)',
  'milesweb': 'MilesWeb (India)',
  'resellerclub': 'ResellerClub (India)',
  'net4india': 'Net4India',
  'webnic': 'Webnic (Malaysia)',
  'exabytes': 'Exabytes (Malaysia)',
  'shinjiru': 'Shinjiru (Malaysia)',
  'time4vps': 'Time4VPS (Lithuania)',
  'contabo': 'Contabo (Germany)',
  
  // American Business Providers
  'networksolutions': 'Network Solutions',
  'register': 'Register.com',
  'domain': 'Domain.com',
  'hover': 'Hover',
  'dynadot': 'Dynadot',
  'enom': 'eNom',
  'tucows': 'Tucows',
  'inwx': 'INWX',
  'epik': 'Epik',
  'porkbun': 'Porkbun',
  'squarespace': 'Squarespace',
  'wix': 'Wix',
  'weebly': 'Weebly',
  'shopify': 'Shopify',
  'bigcommerce': 'BigCommerce',
  'hostwinds': 'HostWinds',
  'inmotion': 'InMotion Hosting',
  'a2hosting': 'A2 Hosting',
  'greengeeks': 'GreenGeeks',
  'fatcow': 'FatCow',
  'justhost': 'JustHost',
  'hostmonster': 'HostMonster',
  'ipage': 'iPage',
  'webhostinghub': 'Web Hosting Hub',
  'webhostingpad': 'WebHostingPad',
  'hostpapa': 'HostPapa',
  'inmotionhosting': 'InMotion Hosting',
  'liquidweb': 'Liquid Web',
  'wpx': 'WPX Hosting',
  'cloudways': 'Cloudways',
  'pantheon': 'Pantheon',
  'acquia': 'Acquia',
  
  // Australian/Oceania Providers
  'ventraip': 'VentraIP (Australia)',
  'netregistry': 'Netregistry (Australia)',
  'crazy-domains': 'Crazy Domains (Australia)',
  'zuver': 'Zuver (Australia)',
  'netorigin': 'NetOrigin (Australia)',
  'meshdigital': 'Mesh Digital (Australia)',
  'digitalpacific': 'Digital Pacific (Australia)',
  'panthur': 'Panthur (Australia)',
  'hostopia': 'Hostopia (Australia)',
  'freeparking': 'Freeparking (New Zealand)',
  'sitehost': 'SiteHost (New Zealand)',
  'webdrive': 'Webdrive (New Zealand)',
  
  // Middle East & Africa
  'etisalat': 'Etisalat (UAE)',
  'du': 'Du (UAE)',
  'stc': 'STC (Saudi Arabia)',
  'mobily': 'Mobily (Saudi Arabia)',
  'zain': 'Zain (Kuwait/Saudi)',
  'orange': 'Orange (Middle East/Africa)',
  'mtn': 'MTN (Africa)',
  'vodacom': 'Vodacom (South Africa)',
  'telkom': 'Telkom (South Africa)',
  'rain': 'Rain (South Africa)',
  'afrihost': 'Afrihost (South Africa)',
  'hetzner': 'Hetzner (South Africa)',
  'xneelo': 'Xneelo (South Africa)',
  'webhost': 'WebHost (South Africa)',
  'hostafrica': 'HostAfrica'
};

// Function to validate email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Function to get domain from email
function getDomainFromEmail(email) {
  return email.split('@')[1].toLowerCase();
}

// Function to identify provider by MX records
async function identifyByMX(domain) {
    try {
        const mxRecords = await dns.resolveMx(domain);
        if (mxRecords && mxRecords.length > 0) {
            const mxDomain = mxRecords[0].exchange.toLowerCase();
            for (const [pattern, provider] of Object.entries(mxPatterns)) {
                if (mxDomain.includes(pattern)) {
                    return provider;
                }
            }
            return `Custom Email Server (MX: ${mxDomain})`;
        }
    } catch (error) {
        console.log(`MX lookup failed for ${domain}:`, error.message);
        return null; // Return null instead of throwing
    }
    return null;
}

// Function to check if domain uses common email services
async function detectEmailProvider(email) {
  const domain = getDomainFromEmail(email);
  
  // First check direct domain match
  if (emailProviders[domain]) {
    return emailProviders[domain];
  }
  
  // Check for subdomain matches (e.g., mail.company.com)
  for (const [providerDomain, providerName] of Object.entries(emailProviders)) {
    if (domain.endsWith('.' + providerDomain)) {
      return providerName;
    }
  }
  
  // Try MX record lookup for custom domains
  const mxProvider = await identifyByMX(domain);
  if (mxProvider) {
    return mxProvider;
  }
  
  // If all else fails, it's likely a custom domain
  return `Custom Domain (${domain})`;
}

// Main route handler using query parameter instead of path
app.get('/', async (req, res) => {
  try {
    const email = req.query.email;
    
    if (!email) {
      return res.status(400).json({
        error: 'Missing email parameter',
        message: 'Please provide an email as a query parameter',
        example: 'http://localhost:3000?email=user@gmail.com',
        alternativeExample: 'http://localhost:3000/?email=user@gmail.com'
      });
    }
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
        provided: email
      });
    }
    
    const provider = await detectEmailProvider(email);
    const domain = getDomainFromEmail(email);
    
    res.json({
      email: email,
      domain: domain,
      provider: provider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
});

// Alternative route handler for path-based format (URL encoded)
app.get('/check/:encodedEmail', async (req, res) => {
  try {
    const encodedEmail = req.params.encodedEmail;
    const email = decodeURIComponent(encodedEmail);
    
    if (!isValidEmail(email)) {
      return res.status(400).json({
        error: 'Invalid email format',
        message: 'Please provide a valid email address',
        provided: email
      });
    }
    
    const provider = await detectEmailProvider(email);
    const domain = getDomainFromEmail(email);
    
    res.json({
      email: email,
      domain: domain,
      provider: provider,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('Error processing request:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'An error occurred while processing your request'
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    message: 'Email provider detection server is running',
    timestamp: new Date().toISOString()
  });
});

// Start server
//app.listen(port, () => {
  app.listen(port,'0.0.0.0', () => {
  console.log(`Email provider detection server running on http://localhost:${port}`);
  console.log(`CORS enabled for all origins`);
  console.log(`Usage Options:`);
  console.log(`  Query parameter: http://localhost:${port}?email=user@gmail.com`);
  console.log(`  Path parameter: http://localhost:${port}/check/user%40gmail.com`);
  console.log(`Health check: http://localhost:${port}/health`);
});

module.exports = app;
