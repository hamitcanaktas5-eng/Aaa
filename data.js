/* ================================================
   AktaşScore — data.js  v0.2
   Merkezi veri katmanı
   ================================================ */

const AS = {
  KEYS: {
    USERS:       'as_users',
    SESSION:     'as_session',
    FAV_TEAMS:   'as_fav_teams',
    FAV_MATCHES: 'as_fav_matches',
    SUPPORT:     'as_support',
    SETTINGS:    'as_settings',
  },
  get(key)       { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
  set(key, val)  { localStorage.setItem(key, JSON.stringify(val)); },
  remove(key)    { localStorage.removeItem(key); },

  getUsers()     { return this.get(this.KEYS.USERS) || {}; },
  saveUsers(u)   { this.set(this.KEYS.USERS, u); },
  getSession()   { return this.get(this.KEYS.SESSION); },
  setSession(email) { this.set(this.KEYS.SESSION, { email, ts: Date.now() }); },
  logout()       { this.remove(this.KEYS.SESSION); },
  requireAuth()  { if (!this.getSession()) { window.location.href = 'index.html'; return false; } return true; },

  getFavTeams()  { return this.get(this.KEYS.FAV_TEAMS) || []; },
  isFavTeam(id)  { return this.getFavTeams().some(t => t.id === id); },
  toggleFavTeam(team) {
    let favs = this.getFavTeams();
    if (favs.some(t => t.id === team.id)) { favs = favs.filter(t => t.id !== team.id); this.set(this.KEYS.FAV_TEAMS, favs); return false; }
    favs.push(team); this.set(this.KEYS.FAV_TEAMS, favs); return true;
  },

  getFavMatches()  { return this.get(this.KEYS.FAV_MATCHES) || []; },
  isFavMatch(id)   { return this.getFavMatches().includes(id); },
  toggleFavMatch(id) {
    let favs = this.getFavMatches();
    if (favs.includes(id)) { favs = favs.filter(x => x !== id); this.set(this.KEYS.FAV_MATCHES, favs); return false; }
    favs.push(id); this.set(this.KEYS.FAV_MATCHES, favs); return true;
  },

  getTickets()   { return this.get(this.KEYS.SUPPORT) || []; },
  saveTickets(t) { this.set(this.KEYS.SUPPORT, t); },
  createTicket(subject, body, email) {
    const tickets = this.getTickets();
    const ticket = { id: 'TKT-' + Date.now(), subject, body, email, status: 'open', createdAt: Date.now(), messages: [{ from:'user', text:body, ts:Date.now() }] };
    tickets.unshift(ticket); this.saveTickets(tickets); return ticket;
  },
  addMessage(ticketId, text, from = 'user') {
    const tickets = this.getTickets();
    const t = tickets.find(x => x.id === ticketId); if (!t) return;
    t.messages.push({ from, text, ts: Date.now() });
    if (from === 'user') t.status = 'open';
    this.saveTickets(tickets); return t;
  },
  closeTicket(ticketId) {
    const tickets = this.getTickets();
    const t = tickets.find(x => x.id === ticketId);
    if (t) { t.status = 'closed'; this.saveTickets(tickets); }
  },

  formatTime(ts) { return new Date(ts).toLocaleDateString('tr-TR',{day:'numeric',month:'short',year:'numeric'}); },
  formatTimestamp(ts) { const d = new Date(ts); return d.toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+' · '+d.toLocaleDateString('tr-TR',{day:'numeric',month:'short'}); },

  seedDemo() {
    const users = this.getUsers();
    if (!users['demo@aktasscore.com']) {
      users['demo@aktasscore.com'] = { email:'demo@aktasscore.com', password:'123456', createdAt:Date.now() };
      this.saveUsers(users);
    }
    const tickets = this.getTickets();
    if (!tickets.length) {
      this.saveTickets([{
        id:'TKT-DEMO1', subject:'Uygulama hakkında bilgi', body:'Merhaba, uygulama ne zaman tam sürüme geçecek?',
        email:'demo@aktasscore.com', status:'closed', createdAt:Date.now()-86400000*2,
        messages:[
          {from:'user',    text:'Merhaba, uygulama ne zaman tam sürüme geçecek?', ts:Date.now()-86400000*2},
          {from:'support', text:'Merhaba! v0.2 sürümünde lig tablosu ve daha fazla özellik gelecek. Takipte kalın! 🎉', ts:Date.now()-86400000},
        ]
      }]);
    }
  },
};

/* ================================================
   TAKIM PROFİLLERİ
   API gelince bu veri API'den alınacak
   ================================================ */
const TEAM_PROFILES = {
  gs:  { id:'gs',  name:'Galatasaray',      short:'GS',  color:'#e8002d', color2:'#FFD700', league:'Süper Lig',
    coach: { name:'Okan Buruk',         nat:'Türkiye',  since:'Tem 2022', age:53, formation:'4-2-3-1' },
    injured: [
      { name:'Mauro Icardi',       num:9,  pos:'FWD', reason:'Diz Ameliyatı',    until:'Mart 2025' },
      { name:'Yunus Akgün',        num:7,  pos:'MID', reason:'Kas Problemi',     until:'Şub 2025' },
    ],
    squad: [
      {num:1, name:'F. Muslera',        pos:'GK'},
      {num:53,name:'Sacha Boey',        pos:'DEF'},
      {num:6, name:'Abdülkerim E.',     pos:'DEF'},
      {num:4, name:'Victor Nelsson',    pos:'DEF'},
      {num:3, name:'Van Aanholt',       pos:'DEF'},
      {num:8, name:'Seri',              pos:'MID'},
      {num:18,name:'Torreira',          pos:'MID'},
      {num:22,name:'Ziyech',            pos:'MID'},
      {num:17,name:'Kerem Aktürkoğlu', pos:'MID'},
      {num:10,name:'Mertens',           pos:'MID'},
      {num:30,name:'Angelino',          pos:'DEF'},
      {num:15,name:'Oliveira',          pos:'MID'},
      {num:25,name:'Pentek',            pos:'FWD'},
      {num:44,name:'Kaan Ayhan',        pos:'DEF'},
      {num:29,name:'Ömercan A.',        pos:'GK'},
    ],
    recentMatchIds: ['sl1','sl3','pl2'],
  },
  fb:  { id:'fb',  name:'Fenerbahçe',       short:'FB',  color:'#002f6c', color2:'#FFED00', league:'Süper Lig',
    coach: { name:'José Mourinho',      nat:'Portekiz',  since:'Haz 2024', age:61, formation:'4-3-3' },
    injured: [
      { name:'Mert Hakan Yandaş', num:14, pos:'MID', reason:'Ayak Bileği',      until:'Oca 2025' },
    ],
    squad: [
      {num:1, name:'Livakovic',         pos:'GK'},
      {num:87,name:'Osayi-Samuel',      pos:'DEF'},
      {num:3, name:'Djiku',             pos:'DEF'},
      {num:21,name:'Rodrigues',         pos:'DEF'},
      {num:88,name:'Ferdi Kadıoğlu',   pos:'DEF'},
      {num:8, name:'Fred',              pos:'MID'},
      {num:6, name:'İsmail Yüksek',    pos:'MID'},
      {num:10,name:'Tadic',             pos:'MID'},
      {num:23,name:'Crespo',            pos:'FWD'},
      {num:11,name:'Dzeko',             pos:'FWD'},
      {num:17,name:'İrfan Can',        pos:'FWD'},
      {num:20,name:'Szymanski',         pos:'MID'},
      {num:9, name:'Batshuayi',         pos:'FWD'},
      {num:33,name:'Günok',             pos:'GK'},
    ],
    recentMatchIds: ['sl1','sl2'],
  },
  bjk: { id:'bjk', name:'Beşiktaş',         short:'BJK', color:'#1a1a1a', color2:'CCCCCC', league:'Süper Lig',
    coach: { name:'Giovanni van Bronckhorst', nat:'Hollanda', since:'Ara 2023', age:49, formation:'4-4-2' },
    injured: [
      { name:'Rıdvan Yılmaz',     num:33, pos:'DEF', reason:'Hamstring',        until:'Şub 2025' },
      { name:'Alex Oxlade-C.',    num:15, pos:'MID', reason:'Diz Problemi',     until:'Oca 2025' },
    ],
    squad: [
      {num:1, name:'Mert Günok',  pos:'GK'},
      {num:4, name:'Tayyip Talha',pos:'DEF'},
      {num:5, name:'Vida',        pos:'DEF'},
      {num:3, name:'Batshuayi',   pos:'FWD'},
      {num:8, name:'Al-Musrati',  pos:'MID'},
      {num:9, name:'Michy B.',    pos:'FWD'},
      {num:10,name:'Gedson',      pos:'MID'},
      {num:11,name:'Ghezzal',     pos:'FWD'},
      {num:23,name:'Rebocho',     pos:'DEF'},
      {num:29,name:'Ajdin H.',    pos:'MID'},
    ],
    recentMatchIds: ['sl2'],
  },
  ts:  { id:'ts',  name:'Trabzonspor',      short:'TS',  color:'#8B1A1A', color2:'1C4F9C', league:'Süper Lig',
    coach: { name:'Abdullah Avcı',      nat:'Türkiye',  since:'Oca 2021', age:56, formation:'4-2-3-1' },
    injured: [],
    squad: [
      {num:1, name:'Uğurcan Ç.',  pos:'GK'},
      {num:3, name:'Marc Bartra', pos:'DEF'},
      {num:9, name:'Maxi Gomez',  pos:'FWD'},
      {num:10,name:'Hamsik',      pos:'MID'},
      {num:7, name:'Trezeguet',   pos:'FWD'},
      {num:22,name:'Denswil',     pos:'DEF'},
    ],
    recentMatchIds: ['sl2'],
  },
  mci: { id:'mci', name:'Manchester City',  short:'MCI', color:'#6CABDD', color2:'1c2c5b', league:'Premier League',
    coach: { name:'Pep Guardiola',      nat:'İspanya',  since:'Haz 2016', age:53, formation:'4-3-3' },
    injured: [
      { name:'Rodri',              num:16, pos:'MID', reason:'Ön Çapraz Bağ',   until:'Sezon Sonu' },
      { name:'Kevin De Bruyne',    num:17, pos:'MID', reason:'Kasık Yaralanması',until:'Mar 2025' },
    ],
    squad: [
      {num:31,name:'Ederson',     pos:'GK'},
      {num:3, name:'Rúben Dias',  pos:'DEF'},
      {num:5, name:'Akanji',      pos:'DEF'},
      {num:2, name:'Walker',      pos:'DEF'},
      {num:6, name:'Gvardiol',    pos:'DEF'},
      {num:20,name:'B. Silva',    pos:'MID'},
      {num:76,name:'Doku',        pos:'FWD'},
      {num:47,name:'Foden',       pos:'MID'},
      {num:67,name:'Kovacic',     pos:'MID'},
      {num:9, name:'Haaland',     pos:'FWD'},
      {num:11,name:'Savinho',     pos:'FWD'},
    ],
    recentMatchIds: ['pl1','ucl2'],
  },
  ars: { id:'ars', name:'Arsenal',           short:'ARS', color:'#EF0107', color2:'063672', league:'Premier League',
    coach: { name:'Mikel Arteta',       nat:'İspanya',  since:'Ara 2019', age:42, formation:'4-2-3-1' },
    injured: [
      { name:'Gabriel Jesus',      num:9,  pos:'FWD', reason:'Diz Ameliyatı',    until:'Nisan 2025' },
    ],
    squad: [
      {num:1, name:'Raya',         pos:'GK'},
      {num:4, name:'Ben White',    pos:'DEF'},
      {num:6, name:'Gabriel',      pos:'DEF'},
      {num:12,name:'Timber',       pos:'DEF'},
      {num:35,name:'Zinchenko',    pos:'DEF'},
      {num:29,name:'Havertz',      pos:'MID'},
      {num:8, name:'Ødegaard',     pos:'MID'},
      {num:41,name:'Rice',         pos:'MID'},
      {num:7, name:'Saka',         pos:'FWD'},
      {num:11,name:'Martinelli',   pos:'FWD'},
      {num:19,name:'Trossard',     pos:'MID'},
    ],
    recentMatchIds: ['pl1'],
  },
  liv: { id:'liv', name:'Liverpool',         short:'LIV', color:'#C8102E', color2:'00B2A9', league:'Premier League',
    coach: { name:'Arne Slot',           nat:'Hollanda', since:'Haz 2024', age:45, formation:'4-3-3' },
    injured: [],
    squad: [
      {num:1, name:'Alisson',      pos:'GK'},
      {num:66,name:'Alexander-Arnold',pos:'DEF'},
      {num:4, name:'Van Dijk',     pos:'DEF'},
      {num:5, name:'Konaté',       pos:'DEF'},
      {num:26,name:'Robertson',    pos:'DEF'},
      {num:8, name:'Szoboszlai',   pos:'MID'},
      {num:10,name:'Mac Allister', pos:'MID'},
      {num:38,name:'Elliott',      pos:'MID'},
      {num:11,name:'Salah',        pos:'FWD'},
      {num:7, name:'Díaz',         pos:'FWD'},
      {num:9, name:'Núñez',        pos:'FWD'},
    ],
    recentMatchIds: ['pl2'],
  },
  rma: { id:'rma', name:'Real Madrid',       short:'RMA', color:'#FEBE10', color2:'1a1a2e', league:'La Liga',
    coach: { name:'Carlo Ancelotti',    nat:'İtalya',   since:'Haz 2021', age:65, formation:'4-3-3' },
    injured: [
      { name:'Militão',            num:3,  pos:'DEF', reason:'Ön Çapraz Bağ',   until:'Nis 2025' },
      { name:'Alaba',              num:4,  pos:'DEF', reason:'Ön Çapraz Bağ',   until:'Sezon Sonu' },
    ],
    squad: [
      {num:1, name:'Lunin',        pos:'GK'},
      {num:2, name:'Carvajal',     pos:'DEF'},
      {num:22,name:'Rudiger',      pos:'DEF'},
      {num:6, name:'Nacho',        pos:'DEF'},
      {num:23,name:'Mendy',        pos:'DEF'},
      {num:10,name:'Modric',       pos:'MID'},
      {num:8, name:'Kroos',        pos:'MID'},
      {num:18,name:'Tchouaméni',  pos:'MID'},
      {num:7, name:'Vinícius Jr.', pos:'FWD'},
      {num:9, name:'Benzema',      pos:'FWD'},
      {num:11,name:'Rodrygo',      pos:'FWD'},
    ],
    recentMatchIds: ['la1','ucl1'],
  },
  bar: { id:'bar', name:'Barcelona',         short:'BAR', color:'#004D98', color2:'A50044', league:'La Liga',
    coach: { name:'Hansi Flick',         nat:'Almanya',  since:'Haz 2024', age:59, formation:'4-3-3' },
    injured: [
      { name:'Marc-André ter Stegen',num:1,pos:'GK',  reason:'Diz Ameliyatı',   until:'Sezon Sonu' },
    ],
    squad: [
      {num:25,name:'Iñaki Peña',   pos:'GK'},
      {num:23,name:'Jules Koundé', pos:'DEF'},
      {num:15,name:'Christensen',  pos:'DEF'},
      {num:3, name:'Balde',        pos:'DEF'},
      {num:24,name:'Cubarsí',      pos:'DEF'},
      {num:8, name:'Pedri',        pos:'MID'},
      {num:5, name:'İniesta',      pos:'MID'},
      {num:6, name:'Gavi',         pos:'MID'},
      {num:11,name:'Raphinha',     pos:'FWD'},
      {num:9, name:'Lewandowski',  pos:'FWD'},
      {num:19,name:'Lamine Yamal', pos:'FWD'},
    ],
    recentMatchIds: ['la1'],
  },
  psg: { id:'psg', name:'PSG',               short:'PSG', color:'#003F7F', color2:'D80027', league:'Şampiyonlar Ligi',
    coach: { name:'Luis Enrique',        nat:'İspanya',  since:'Haz 2023', age:54, formation:'4-3-3' },
    injured: [],
    squad: [
      {num:50,name:'Donnarumma',   pos:'GK'},
      {num:2, name:'Hakimi',       pos:'DEF'},
      {num:5, name:'Marquinhos',   pos:'DEF'},
      {num:3, name:'Skriniar',     pos:'DEF'},
      {num:25,name:'Nuno Mendes',  pos:'DEF'},
      {num:8, name:'Fabian Ruiz',  pos:'MID'},
      {num:6, name:'Vitinha',      pos:'MID'},
      {num:17,name:'Ruiz-Atil',    pos:'MID'},
      {num:7, name:'Dembélé',      pos:'FWD'},
      {num:11,name:'Ramos',        pos:'FWD'},
      {num:19,name:'Lee Kang-in',  pos:'MID'},
    ],
    recentMatchIds: ['ucl1'],
  },
  // Diğer takımlar (minimal)
  bsk: { id:'bsk', name:'Başakşehir', short:'İBB', color:'#0066CC', color2:'FF6600', league:'Süper Lig', coach:{name:'Tayfur Havutçu',nat:'Türkiye',since:'2024',age:52,formation:'4-3-3'}, injured:[], squad:[], recentMatchIds:['sl3'] },
  svs: { id:'svs', name:'Sivasspor',  short:'SVS', color:'8B0000',  color2:'FFA500', league:'Süper Lig', coach:{name:'Bülent Uygun',  nat:'Türkiye',since:'2023',age:51,formation:'5-3-2'}, injured:[], squad:[], recentMatchIds:['sl3'] },
  ank: { id:'ank', name:'Ankaragücü', short:'ANK', color:'#000080', color2:'FFD700', league:'Süper Lig', coach:{name:'Emre Belözoğlu',nat:'Türkiye',since:'2024',age:44,formation:'4-4-2'}, injured:[], squad:[], recentMatchIds:['sl4'] },
  ksp: { id:'ksp', name:'Kasımpaşa', short:'KSP', color:'#C0392B', color2:'FFFFFF', league:'Süper Lig', coach:{name:'Fuat Çapa',    nat:'Türkiye',since:'2023',age:57,formation:'4-3-3'}, injured:[], squad:[], recentMatchIds:['sl4'] },
  che: { id:'che', name:'Chelsea',   short:'CHE', color:'#034694', color2:'DBA111', league:'Premier League', coach:{name:'Enzo Maresca',nat:'İtalya',since:'2024',age:44,formation:'4-2-3-1'}, injured:[], squad:[], recentMatchIds:['pl2'] },
  tot: { id:'tot', name:'Tottenham', short:'TOT', color:'#132257', color2:'FFFFFF', league:'Premier League', coach:{name:'Ange Postecoglou',nat:'Avustralya',since:'2023',age:58,formation:'4-3-3'}, injured:[], squad:[], recentMatchIds:['pl3'] },
  mnu: { id:'mnu', name:'Man United', short:'MNU', color:'#DA020E', color2:'FFE500', league:'Premier League', coach:{name:'Ruben Amorim',nat:'Portekiz',since:'2024',age:39,formation:'3-4-3'}, injured:[], squad:[], recentMatchIds:['pl3'] },
  atm: { id:'atm', name:'Atletico Madrid', short:'ATM', color:'#CB3524', color2:'273B7D', league:'La Liga', coach:{name:'Diego Simeone',nat:'Arjantin',since:'2011',age:54,formation:'4-4-2'}, injured:[], squad:[], recentMatchIds:['la2'] },
  sev: { id:'sev', name:'Sevilla',   short:'SEV', color:'#F5F5F5', color2:'D22B2B', league:'La Liga', coach:{name:'Diego Alonso',nat:'Uruguay',since:'2024',age:47,formation:'4-3-3'}, injured:[], squad:[], recentMatchIds:['la2'] },
  bay: { id:'bay', name:'Bayern Münih', short:'FCB', color:'#DC052D', color2:'0066B2', league:'Bundesliga', coach:{name:'Vincent Kompany',nat:'Belçika',since:'2024',age:38,formation:'4-2-3-1'}, injured:[], squad:[], recentMatchIds:['ucl2'] },
};

/* ================================================
   MAÇ VERİSİ
   ================================================ */
const MATCHES = {
  leagues: [
    {
      id:'sl', name:'Süper Lig', country:'Türkiye', flag:'🇹🇷',
      matches: [
        {
          id:'sl1', leagueId:'sl', leagueName:'Süper Lig', leagueFlag:'🇹🇷',
          home:{ id:'gs',  name:'Galatasaray',  short:'GS',  color:'#e8002d', color2:'#FFD700' },
          away:{ id:'fb',  name:'Fenerbahçe',   short:'FB',  color:'#002f6c', color2:'#FFED00' },
          score:{home:2,away:1}, status:'live', minute:67, ht:'1-0', time:'21:00', date:'Bugün',
          events:[
            {min:12,type:'goal',  side:'home',player:'İcardi',       detail:'Kafa, Ziyech Asisti'},
            {min:31,type:'yellow',side:'away',player:'Fred',          detail:'Faul'},
            {min:38,type:'goal',  side:'away',player:'Dzeko',         detail:'Sol ayak, Tadic Asisti'},
            {min:45,type:'yellow',side:'home',player:'Seri',          detail:'Faul'},
            {min:58,type:'goal',  side:'home',player:'Ziyech',        detail:'Serbest vuruş'},
            {min:63,type:'sub',   side:'away',player:'Szymanski',     detail:'↗ Crespo ↘'},
            {min:67,type:'red',   side:'away',player:'İsmail Yüksek', detail:'2. Sarı'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:57,away:43,type:'possession'},
            {label:'Şut',           home:14,away:9},
            {label:'İsabetli Şut',  home:6, away:4},
            {label:'Korner',        home:7, away:3},
            {label:'Faul',          home:11,away:13},
            {label:'Ofsayt',        home:3, away:2},
            {label:'Sarı Kart',     home:1, away:2},
            {label:'Kırmızı Kart',  home:0, away:1},
          ],
          lineup:{
            home:{formation:'4-2-3-1',starting:[
              {num:1, name:'F. Muslera',       pos:'GK'},
              {num:53,name:'Sacha Boey',       pos:'DEF'},
              {num:6, name:'Abdülkerim E.',    pos:'DEF'},
              {num:4, name:'Victor Nelsson',   pos:'DEF'},
              {num:3, name:'Van Aanholt',      pos:'DEF'},
              {num:8, name:'Seri',             pos:'MID',event:'🟡'},
              {num:18,name:'Torreira',          pos:'MID'},
              {num:22,name:'Ziyech',            pos:'MID',event:'⚽'},
              {num:17,name:'Kerem Aktürkoğlu',pos:'MID'},
              {num:10,name:'Mertens',           pos:'MID'},
              {num:9, name:'İcardi',            pos:'FWD',event:'⚽'},
            ],subs:[
              {num:25,name:'Pentek',  pos:'FWD'},
              {num:15,name:'Oliveira',pos:'MID'},
              {num:44,name:'K. Ayhan',pos:'DEF'},
            ]},
            away:{formation:'4-3-3',starting:[
              {num:1, name:'Livakovic',       pos:'GK'},
              {num:87,name:'Osayi-Samuel',    pos:'DEF'},
              {num:3, name:'Djiku',           pos:'DEF'},
              {num:21,name:'Rodrigues',       pos:'DEF'},
              {num:88,name:'Ferdi Kadıoğlu', pos:'DEF'},
              {num:8, name:'Fred',            pos:'MID',event:'🟡'},
              {num:6, name:'İsmail Yüksek',  pos:'MID',event:'🟥'},
              {num:10,name:'Tadic',           pos:'MID'},
              {num:23,name:'Crespo',          pos:'FWD',event:'🔄'},
              {num:11,name:'Dzeko',           pos:'FWD',event:'⚽'},
              {num:17,name:'İrfan Can',       pos:'FWD'},
            ],subs:[
              {num:20,name:'Szymanski',pos:'MID',event:'🔄'},
              {num:9, name:'Batshuayi',pos:'FWD'},
            ]},
          },
          h2h:{wins:{home:12,draw:8,away:9},matches:[
            {date:'14 Oca 2024',homeScore:1,awayScore:1},
            {date:'05 Kas 2023',homeScore:3,awayScore:1},
            {date:'26 Mar 2023',homeScore:0,awayScore:1},
            {date:'06 Kas 2022',homeScore:2,awayScore:2},
          ]},
        },
        {
          id:'sl2', leagueId:'sl', leagueName:'Süper Lig', leagueFlag:'🇹🇷',
          home:{ id:'bjk', name:'Beşiktaş',    short:'BJK', color:'#1a1a1a', color2:'#CCCCCC' },
          away:{ id:'ts',  name:'Trabzonspor', short:'TS',  color:'#8B1A1A', color2:'#1C4F9C' },
          score:{home:0,away:0}, status:'live', minute:23, ht:null, time:'19:00', date:'Bugün',
          events:[{min:14,type:'yellow',side:'home',player:'Al-Musrati',detail:'Faul'}],
          stats:[
            {label:'Topa Sahip Olma',home:52,away:48,type:'possession'},
            {label:'Şut',  home:3,away:5},
            {label:'Korner',home:2,away:3},
            {label:'Faul', home:4,away:3},
          ],
          lineup:{home:{formation:'4-4-2',starting:[
            {num:1,name:'Mert Günok', pos:'GK'},
            {num:8,name:'Al-Musrati',pos:'MID',event:'🟡'},
          ],subs:[]},away:{formation:'4-2-3-1',starting:[
            {num:1,name:'Uğurcan Ç.',pos:'GK'},
            {num:9,name:'Maxi Gomez',pos:'FWD'},
          ],subs:[]}},
          h2h:{wins:{home:18,draw:10,away:12},matches:[
            {date:'10 Şub 2024',homeScore:2,awayScore:1},
            {date:'02 Eyl 2023',homeScore:1,awayScore:1},
          ]},
        },
        {
          id:'sl3', leagueId:'sl', leagueName:'Süper Lig', leagueFlag:'🇹🇷',
          home:{ id:'bsk', name:'Başakşehir', short:'İBB', color:'#0066CC', color2:'#FF6600' },
          away:{ id:'svs', name:'Sivasspor',  short:'SVS', color:'#8B0000', color2:'#FFA500' },
          score:{home:1,away:3}, status:'finished', minute:90, ht:'0-2', time:'17:00', date:'Bugün',
          events:[
            {min:22,type:'goal',side:'away',player:'Erdoğan', detail:'Sağ ayak'},
            {min:35,type:'goal',side:'away',player:'Türkmen', detail:'Kafa'},
            {min:61,type:'goal',side:'home',player:'Chadli',  detail:'Penaltı'},
            {min:78,type:'goal',side:'away',player:'Erdoğan', detail:'Kontra atak'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:62,away:38,type:'possession'},
            {label:'Şut',   home:18,away:8},
            {label:'Korner',home:9, away:2},
          ],
          lineup:{home:{formation:'4-3-3',starting:[],subs:[]},away:{formation:'5-3-2',starting:[],subs:[]}},
          h2h:{wins:{home:6,draw:4,away:5},matches:[{date:'12 Ara 2023',homeScore:2,awayScore:0}]},
        },
        {
          id:'sl4', leagueId:'sl', leagueName:'Süper Lig', leagueFlag:'🇹🇷',
          home:{ id:'ank', name:'Ankaragücü',  short:'ANK', color:'#000080', color2:'#FFD700' },
          away:{ id:'ksp', name:'Kasımpaşa',   short:'KSP', color:'#C0392B', color2:'#FFFFFF' },
          score:{home:null,away:null}, status:'upcoming', time:'21:00', date:'Bugün',
          events:[], stats:[],
          lineup:{home:{formation:'4-4-2',starting:[],subs:[]},away:{formation:'4-3-3',starting:[],subs:[]}},
          h2h:{wins:{home:5,draw:3,away:4},matches:[]},
        },
      ]
    },
    {
      id:'pl', name:'Premier League', country:'İngiltere', flag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
      matches: [
        {
          id:'pl1', leagueId:'pl', leagueName:'Premier League', leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          home:{ id:'mci', name:'Manchester City', short:'MCI', color:'#6CABDD', color2:'#1c2c5b' },
          away:{ id:'ars', name:'Arsenal',         short:'ARS', color:'#EF0107', color2:'#063672' },
          score:{home:2,away:2}, status:'live', minute:78, ht:'1-1', time:'22:00', date:'Bugün',
          events:[
            {min:18,type:'goal',side:'home',player:'Haaland',    detail:'Penaltı'},
            {min:34,type:'goal',side:'away',player:'Saka',       detail:'Sol ayak'},
            {min:56,type:'goal',side:'away',player:'Martinelli', detail:'Kafa'},
            {min:71,type:'goal',side:'home',player:'De Bruyne',  detail:'Serbest vuruş'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:48,away:52,type:'possession'},
            {label:'Şut',   home:12,away:14},
            {label:'Korner',home:5, away:7},
          ],
          lineup:{home:{formation:'4-3-3',starting:[
            {num:31,name:'Ederson',   pos:'GK'},
            {num:9, name:'Haaland',   pos:'FWD',event:'⚽'},
            {num:17,name:'De Bruyne', pos:'MID',event:'⚽'},
          ],subs:[]},away:{formation:'4-2-3-1',starting:[
            {num:1, name:'Raya',       pos:'GK'},
            {num:7, name:'Saka',       pos:'FWD',event:'⚽'},
            {num:11,name:'Martinelli', pos:'FWD',event:'⚽'},
          ],subs:[]}},
          h2h:{wins:{home:8,draw:5,away:7},matches:[
            {date:'31 Mar 2024',homeScore:0,awayScore:2},
            {date:'06 Eki 2023',homeScore:1,awayScore:0},
          ]},
        },
        {
          id:'pl2', leagueId:'pl', leagueName:'Premier League', leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          home:{ id:'liv', name:'Liverpool', short:'LIV', color:'#C8102E', color2:'#00B2A9' },
          away:{ id:'che', name:'Chelsea',   short:'CHE', color:'#034694', color2:'#DBA111' },
          score:{home:3,away:1}, status:'finished', minute:90, ht:'2-0', time:'20:00', date:'Bugün',
          events:[
            {min:11,type:'goal',side:'home',player:'Salah',  detail:'Sol ayak'},
            {min:29,type:'goal',side:'home',player:'Díaz',   detail:'Kafa'},
            {min:55,type:'goal',side:'away',player:'Palmer', detail:'Serbest vuruş'},
            {min:82,type:'goal',side:'home',player:'Núñez',  detail:'Karşı atak'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:58,away:42,type:'possession'},
            {label:'Şut',  home:16,away:10},
            {label:'Korner',home:8,away:4},
          ],
          lineup:{home:{formation:'4-3-3',starting:[
            {num:1, name:'Alisson',pos:'GK'},
            {num:11,name:'Salah',  pos:'FWD',event:'⚽'},
            {num:7, name:'Díaz',   pos:'FWD',event:'⚽'},
            {num:9, name:'Núñez',  pos:'FWD',event:'⚽'},
          ],subs:[]},away:{formation:'4-2-3-1',starting:[
            {num:1, name:'Sanchez',pos:'GK'},
            {num:20,name:'Palmer', pos:'MID',event:'⚽'},
          ],subs:[]}},
          h2h:{wins:{home:10,draw:6,away:8},matches:[{date:'31 Oca 2024',homeScore:4,awayScore:1}]},
        },
        {
          id:'pl3', leagueId:'pl', leagueName:'Premier League', leagueFlag:'🏴󠁧󠁢󠁥󠁮󠁧󠁿',
          home:{ id:'tot', name:'Tottenham', short:'TOT', color:'#132257', color2:'#FFFFFF' },
          away:{ id:'mnu', name:'Man United', short:'MNU', color:'#DA020E', color2:'#FFE500' },
          score:{home:null,away:null}, status:'upcoming', time:'22:00', date:'Bugün',
          events:[],stats:[],
          lineup:{home:{formation:'4-3-3',starting:[],subs:[]},away:{formation:'3-4-3',starting:[],subs:[]}},
          h2h:{wins:{home:9,draw:4,away:11},matches:[]},
        },
      ]
    },
    {
      id:'la', name:'La Liga', country:'İspanya', flag:'🇪🇸',
      matches: [
        {
          id:'la1', leagueId:'la', leagueName:'La Liga', leagueFlag:'🇪🇸',
          home:{ id:'rma', name:'Real Madrid', short:'RMA', color:'#FEBE10', color2:'#1a1a2e' },
          away:{ id:'bar', name:'Barcelona',   short:'BAR', color:'#004D98', color2:'#A50044' },
          score:{home:1,away:1}, status:'live', minute:55, ht:'1-0', time:'22:00', date:'Bugün',
          events:[
            {min:23,type:'goal',side:'home',player:'Vinícius Jr.',detail:'Sol ayak'},
            {min:49,type:'goal',side:'away',player:'Lewandowski', detail:'Penaltı'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:44,away:56,type:'possession'},
            {label:'Şut',   home:9, away:13},
            {label:'Korner',home:3, away:6},
          ],
          lineup:{home:{formation:'4-3-3',starting:[
            {num:1, name:'Lunin',        pos:'GK'},
            {num:7, name:'Vinícius Jr.', pos:'FWD',event:'⚽'},
            {num:10,name:'Modric',       pos:'MID'},
          ],subs:[]},away:{formation:'4-3-3',starting:[
            {num:25,name:'Iñaki Peña',   pos:'GK'},
            {num:9, name:'Lewandowski',  pos:'FWD',event:'⚽'},
            {num:8, name:'Pedri',        pos:'MID'},
          ],subs:[]}},
          h2h:{wins:{home:15,draw:9,away:13},matches:[
            {date:'21 Oca 2024',homeScore:3,awayScore:2},
            {date:'28 Eki 2023',homeScore:1,awayScore:2},
          ]},
        },
        {
          id:'la2', leagueId:'la', leagueName:'La Liga', leagueFlag:'🇪🇸',
          home:{ id:'atm', name:'Atletico Madrid', short:'ATM', color:'#CB3524', color2:'#273B7D' },
          away:{ id:'sev', name:'Sevilla',         short:'SEV', color:'#C8102E', color2:'#F5F5F5' },
          score:{home:2,away:0}, status:'finished', minute:90, ht:'1-0', time:'19:00', date:'Bugün',
          events:[
            {min:33,type:'goal',side:'home',player:'Griezmann',detail:'Kafa'},
            {min:74,type:'goal',side:'home',player:'Morata',   detail:'Sol ayak'},
          ],
          stats:[
            {label:'Topa Sahip Olma',home:53,away:47,type:'possession'},
            {label:'Şut',home:12,away:7},
          ],
          lineup:{home:{formation:'4-4-2',starting:[],subs:[]},away:{formation:'4-3-3',starting:[],subs:[]}},
          h2h:{wins:{home:12,draw:5,away:7},matches:[]},
        },
      ]
    },
    {
      id:'ucl', name:'Şampiyonlar Ligi', country:'Avrupa', flag:'🏆',
      matches: [
        {
          id:'ucl1', leagueId:'ucl', leagueName:'Şampiyonlar Ligi', leagueFlag:'🏆',
          home:{ id:'psg', name:'PSG',          short:'PSG', color:'#003F7F', color2:'#D80027' },
          away:{ id:'rma', name:'Real Madrid',  short:'RMA', color:'#FEBE10', color2:'#1a1a2e' },
          score:{home:null,away:null}, status:'upcoming', time:'22:00', date:'Bugün',
          events:[],stats:[],
          lineup:{home:{formation:'4-3-3',starting:[],subs:[]},away:{formation:'4-3-3',starting:[],subs:[]}},
          h2h:{wins:{home:3,draw:2,away:5},matches:[]},
        },
        {
          id:'ucl2', leagueId:'ucl', leagueName:'Şampiyonlar Ligi', leagueFlag:'🏆',
          home:{ id:'bay', name:'Bayern Münih',   short:'FCB', color:'#DC052D', color2:'#0066B2' },
          away:{ id:'mci', name:'Manchester City', short:'MCI', color:'#6CABDD', color2:'#1c2c5b' },
          score:{home:null,away:null}, status:'upcoming', time:'22:00', date:'Bugün',
          events:[],stats:[],
          lineup:{home:{formation:'4-2-3-1',starting:[],subs:[]},away:{formation:'4-3-3',starting:[],subs:[]}},
          h2h:{wins:{home:4,draw:1,away:5},matches:[]},
        },
      ]
    },
  ],

  getAllMatches() { return this.leagues.flatMap(l => l.matches); },
  getMatch(id)   { return this.getAllMatches().find(m => m.id === id); },
  getAllTeams()   {
    const teams = {};
    this.getAllMatches().forEach(m => {
      if (!teams[m.home.id]) teams[m.home.id] = { ...m.home, league: m.leagueName };
      if (!teams[m.away.id]) teams[m.away.id] = { ...m.away, league: m.leagueName };
    });
    return Object.values(teams);
  },
};

AS.seedDemo();
