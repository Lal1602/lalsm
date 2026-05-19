import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const apiKey = process.env.GEMINI_API_KEY;

export async function POST(request: Request) {
  let message = '';
  let history: any[] = [];
  try {
    const body = await request.json();
    message = body.message;
    history = body.history || [];
    
    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    if (!apiKey) {
      // Graceful local mock response if API Key is not set in env
      console.warn('GEMINI_API_KEY is not set in the environment. Falling back to simulated response.');
      const simulatedReply = getSimulatedReply(message, history);
      
      // Simulate real AI network delay
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ reply: simulatedReply });
    }

    const ai = new GoogleGenAI({ apiKey });

    // Format context history for Gemini models
    // In @google/genai generateContent, we pass contents as an array of objects:
    // { role: 'user' | 'model', parts: [{ text: '...' }] }
    // Note that 'ai' role from frontend state is mapped to 'model' for Gemini
    const contents: any[] = [];

    const systemInstruction = `
Kamu adalah asisten virtual cerdas, ramah, dan sangat sopan dari Muhammad Bilal (sering dipanggil Bilal). 
Tugasmu adalah membantu pengunjung menjelajahi portofolio 3D interaktif Bilal, keahliannya, pendidikannya, dan proyek-proyeknya.

Profil Ringkas Bilal:
- Nama: Bilal Sanayu Majid (Bilal)
- Pekerjaan/Role: Creative Developer, Fullstack Web Developer, UI/UX Designer, Game Developer, & Creative Programmer.
- Pendidikan: Mahasiswa Teknik Informatika (Informatics Engineering) di PENS (Politeknik Elektronika Negeri Surabaya).
- Keahlian Utama:
  - Frontend: HTML5, CSS3, JavaScript, TypeScript, React, Next.js, Phaser.js, GSAP, ScrollTrigger, Lenis (smooth scroll).
  - Backend: Node.js, Express, PHP (Native/XAMPP).
  - 3D/WebGL: Three.js, React Three Fiber, React Three Drei.
  - IoT & Sistem: Sistem kontrol, Smart Locker (proyek enterprise-grade).
  - Tooling: Git, Netlify, Vercel, XAMPP.
- Sertifikasi/Prestasi: Kumon (Matematika & Bahasa Inggris), LKS (Lomba Kompetensi Siswa) bidang Web Technologies, Sertifikasi BNSP dari LSP untuk Pemrograman Web / Web Developer.

Proyek-proyek Kreatif Bilal:
- Memory Game: Puzzle Memory Game Phaser.js dengan navigasi keyboard.
- MindPoint: Game teka-teki perspektif 3D menyelaraskan fragmen menjadi simbol utuh.
- Snake Game & Bunny Jump Lite: Game arcade klasik yang interaktif.
- Ghost Buster: Game bertahan hidup menghindari serangan hantu.
- Guru Bahasa: Platform bimbingan bahasa terintegrasi formulir konsultasi WhatsApp.
- Aether Dreamscape: Puzzle perspektif 3D WebGL/Three.js.
- Infinite Loop: Narasi visual interaktif partikel fisika canvas.
- Lorem V. Portfolio: Portofolio kreatif dengan custom cursor dan transisi noise.
- NOIR Photography: Portofolio fotografi horizontal premium dengan GSAP dan Lenis.
- Creative Programmer & Digital Craftsman: Portofolio sinematik berbasis Three.js WebGL particle background.
- Experimental Directory: Percobaan partikel teks dengan efek scanline CRT.
- LUMIERA Visual Poetry: Portofolio fotografi ultra-cinematic dengan SVG parallax.

Aturan Respon:
1. Bersikaplah ramah, sopan, antusias, profesional, dan gunakan Bahasa Indonesia yang santun (atau Bahasa Inggris jika ditanya dalam Bahasa Inggris).
2. Jika ditanya hal di luar pemrograman, teknologi, portofolio, atau profil Bilal, tolak dengan sopan dan arahkan pengguna untuk menjelajahi efek visual 3D atau proyek interaktif di situs ini.
3. Jawab secara ringkas, padat, dan menarik (maksimal 3-4 kalimat per respon). Jangan memberikan jawaban yang terlalu panjang lebar agar tetap nyaman dibaca dalam box chat.
4. KONTROL NAVIGASI (SANGAT PENTING): Kamu memiliki kendali penuh atas navigasi website. Di akhir jawabanmu, kamu wajib menyematkan tag aksi khusus '[ACTION:SCROLL_AND_HIGHLIGHT:<section_id>]' di baris baru jika pengguna meminta untuk melihat, menunjuk, atau bertanya tentang bagian tertentu dari website.
   Daftar section_id yang didukung:
   - 'home': Gunakan jika pengguna bertanya tentang halaman utama, sambutan, intro awal, atau ingin kembali ke paling atas.
   - 'about': Gunakan jika pengguna bertanya tentang profil diri Bilal, latar belakang disiplin ilmu, biodata, keahlian utama, atau kartu-kartu disiplin coding Bilal (01 Frontend, 02 Backend, 03 Game Dev).
   - 'projects': Gunakan jika pengguna bertanya tentang proyek, hasil karya, game yang dibuat (Herbal Mart, MindPoint, Ghost Buster, Aether Dreamscape, NOIR, dll), atau ingin melihat karyamu.
   - 'achievements': Gunakan jika pengguna bertanya tentang prestasi, sertifikat kompetisi, LKS, BNSP, TOEIC, Kumon, atau penghargaan yang pernah diraih Bilal.
   - 'contact': Gunakan jika pengguna ingin menghubungi Bilal, berkolaborasi, menyewa jasa freelance (Upwork/Fiverr), atau mengirim pesan lewat form uplink.
   
   CONTOH PENGGUNAAN:
   - Pertanyaan: "Tunjukkan proyekmu" -> Jawaban: "Tentu! Ini adalah daftar proyek kreatif yang pernah saya buat... [ACTION:SCROLL_AND_HIGHLIGHT:projects]"
   - Pertanyaan: "Saya ingin menghubungi Bilal" -> Jawaban: "Bagus sekali! Anda bisa mengirim pesan langsung melalui formulir uplink di bawah ini... [ACTION:SCROLL_AND_HIGHLIGHT:contact]"
`;

    // Map history to Gemini format
    if (history && Array.isArray(history)) {
      history.forEach((msg: any) => {
        if (msg.role === 'user') {
          contents.push({ role: 'user', parts: [{ text: msg.text }] });
        } else if (msg.role === 'ai') {
          contents.push({ role: 'model', parts: [{ text: msg.text }] });
        }
      });
    }

    // Add current user message
    contents.push({ role: 'user', parts: [{ text: message }] });

    // List of models to try in sequence if one hits quota/rate limits (failover fallback queue)
    const modelsToTry = [
      'gemini-flash-latest',       // Dynamic latest stable flash (often 20 RPD on free tiers)
      'gemini-3.1-flash-lite',     // Gemini 3 Flash (Instruction-tuned, medium 500 RPD limit!)
      'gemini-3-flash',            // Gemini 3 Flash (20 RPD)
      'gemini-2.5-flash-lite',     // Gemini 2.5 Flash Lite (20 RPD)
      'gemma-4-31b-it'             // Gemma 4 31B (Instruction-tuned, huge 1.5K RPD limit!)
    ];

    let reply = '';
    let success = false;
    let lastError = null;

    for (const modelName of modelsToTry) {
      try {
        console.log(`Attempting Gemini chat generation with model: ${modelName}`);
        const response = await ai.models.generateContent({
          model: modelName,
          contents: contents,
          config: {
            systemInstruction: systemInstruction,
            temperature: 0.7,
            maxOutputTokens: 2000,
          }
        });
        
        if (response && response.text) {
          reply = response.text;
          success = true;
          console.log(`Successfully generated response using model: ${modelName}`);
          break;
        }
      } catch (err: any) {
        console.warn(`Model ${modelName} failed or limit reached:`, err.message || err);
        lastError = err;
        // Continue to the next model in the queue
      }
    }

    if (success) {
      return NextResponse.json({ reply });
    } else {
      // Throw error to trigger the local static simulation fallback
      throw lastError || new Error('All models in failover list failed to generate response.');
    }

  } catch (error: any) {
    console.error('Error in chatbot route handler, falling back to local simulation:', error);
    
    // Seamless fallback to our rich local match-based engine when API limits or quotas are hit
    const simulatedReply = getSimulatedReply(message, history);
    return NextResponse.json({ reply: simulatedReply });
  }
}

// Local match-based fallback engine to provide context-aware answers offline
function getSimulatedReply(message: string, history?: any[]): string {
  const msg = message.toLowerCase();
  
  // A. Context Detection based on previous messages (History)
  let isFollowUpForContact = false;
  let isFollowUpForProjects = false;
  
  if (msg.includes('yang mana') || msg.includes('mana') || msg.includes('buka') || msg.includes('tunjukkan') || msg.includes('tampilkan')) {
    if (history && history.length > 0) {
      const lastAIResponse = history[history.length - 1]?.text?.toLowerCase() || '';
      
      if (lastAIResponse.includes('form') || lastAIResponse.includes('footer') || lastAIResponse.includes('hubung') || lastAIResponse.includes('kontak') || lastAIResponse.includes('email') || lastAIResponse.includes('uplink')) {
        isFollowUpForContact = true;
      } else if (lastAIResponse.includes('proyek') || lastAIResponse.includes('project') || lastAIResponse.includes('karya') || lastAIResponse.includes('game') || lastAIResponse.includes('phaser')) {
        isFollowUpForProjects = true;
      }
    }
  }

  // B. Specific project and achievement title lists for high-fidelity action matching
  const projectTitles = [
    "Herbal Mart", "Bunny Jump Lite", "Hunting Alien", "Math Fighter", 
    "Snake Game", "Mini Portfolio", "Memory Game", "Ghost Buster", 
    "MindPoint", "Guru Bahasa", "Aether Dreamscape", "Infinite Loop", 
    "Lorem V. Portfolio", "Noir Photography", "Creative Programmer", 
    "Digital Craftsman", "Experimental Directory", "Lumiera Visual Poetry"
  ];
  
  const achievementTitles = [
    { key: "lks", title: "Juara Harapan 2 — LKS Web Technologies" },
    { key: "kumon", title: "Kumon Mathematics — Final Level Completion" },
    { key: "bnsp", title: "BNSP Competency Certificate" },
    { key: "toeic", title: "TOEIC Listening & Reading" },
    { key: "timedoor", title: "Timedoor" },
    { key: "bee", title: "Bee Coding Competition" },
    { key: "hmtc", title: "HMTC Goes To School" }
  ];

  // 1. Contextual Action: Scroll to contact form
  if (isFollowUpForContact) {
    return 'Tentu! Ini dia form kontak hubungi (UPLINK_FORM.exe) dan footer holografik yang terletak di bagian paling bawah website. Saya bantu arahkan layar Anda langsung ke sana ya! [ACTION:SCROLL_AND_HIGHLIGHT:contact]';
  }

  // 2. Contextual Action: Scroll to projects
  if (isFollowUpForProjects) {
    return 'Bilal merekomendasikan Game Petualangan 2D (Phaser.js) atau website premium NOIR Photography. Saya bantu scroll ke galeri proyek agar Anda bisa melihatnya! [ACTION:SCROLL_AND_HIGHLIGHT:projects]';
  }

  // 3. Match specific project title to open it
  for (const title of projectTitles) {
    if (msg.includes(title.toLowerCase())) {
      return `Tentu! Saya bantu Anda menavigasi ke proyek "${title}" dan membuka detailnya sekarang juga! [ACTION:OPEN_PROJECT:${title}]`;
    }
  }

  // 4. Match specific achievement title to open it
  for (const ach of achievementTitles) {
    if (msg.includes(ach.key)) {
      return `Tentu! Ini dia sertifikat prestasi "${ach.title}" milik Bilal. Saya bantu scroll dan membukanya untuk Anda! [ACTION:OPEN_ACHIEVEMENT:${ach.title}]`;
    }
  }

  // 5. General project request (Scroll to projects)
  if (msg.includes('tampilkan proyek') || msg.includes('tunjukkan proyek') || msg.includes('buka proyek') || msg.includes('lihat proyek') || msg.includes('tampilkan portfolio') || msg.includes('tunjukkan portfolio')) {
    return 'Tentu! Ini adalah bagian galeri proyek interaktif Bilal. Di sini Anda bisa menjelajahi berbagai eksperimen game Phaser, partikel Canvas, dan website Awwwards-style miliknya! [ACTION:SCROLL_AND_HIGHLIGHT:projects]';
  }

  // 6. General achievement request (Scroll to achievements)
  if (msg.includes('tampilkan prestasi') || msg.includes('tunjukkan prestasi') || msg.includes('tampilkan sertifikat') || msg.includes('tunjukkan sertifikat') || msg.includes('sertifikat') || msg.includes('prestasi') || msg.includes('penghargaan')) {
    return 'Dengan senang hati! Ini adalah bagian Achievements / prestasi dan sertifikasi milik Bilal, mulai dari juara kompetisi LKS, sertifikasi nasional BNSP, Kumon matematika, hingga kursus Timedoor! [ACTION:SCROLL_AND_HIGHLIGHT:achievements]';
  }

  // 7. General contact request (Scroll to contact)
  if (msg.includes('hubungi') || msg.includes('kontak') || msg.includes('email') || msg.includes('form') || msg.includes('uplink')) {
    return 'Ingin menghubungi Bilal secara langsung? Anda bisa scroll ke bagian bawah web untuk mengisi UPLINK_FORM.exe atau menemukan media sosialnya. Saya bantu gulirkan layar Anda ke sana sekarang! [ACTION:SCROLL_AND_HIGHLIGHT:contact]';
  }
  
  // 8. Sapaan & Interaksi Dasar (Termasuk Apa Kabar)
  if (msg.includes('halo') || msg.includes('hai') || msg.includes('hi') || msg.includes('hello') || msg.includes('pagi') || msg.includes('siang') || msg.includes('sore') || msg.includes('malam') || msg.includes('bro') || msg.includes('kabar') || msg.includes('sehat')) {
    return 'Halo! Kabar saya sangat baik, terima kasih! Sebagai asisten virtual Bilal, saya selalu bersemangat untuk membantu Anda menjelajahi portofolio 3D, proyek game Phaser, sertifikasi LKS, kuliahnya di PENS Surabaya, hingga layanan freelance-nya. Ada yang ingin Anda tanyakan?';
  }
  
  // 9. Tanggapan Konversasional & Tindak Lanjut (Follow-up)
  if (msg.includes('yang mana') || msg.includes('apa saja') || msg.includes('proyek mana') || msg.includes('proyek apa') || msg.includes('mana aja') || msg.includes('mana saja') || msg.includes('rekomendasi')) {
    return 'Bilal sangat merekomendasikan Anda untuk mencoba proyek Game Petualangan 2D miliknya (dibuat menggunakan Phaser.js) atau mengeksplorasi asisten 3D interaktif yang sedang Anda gunakan saat ini! Bilal juga memiliki proyek web modern bergaya Awwwards seperti NOIR Photography dan e-commerce Herbal Mart. Proyek mana yang paling membuat Anda penasaran?';
  }

  if (msg.includes('oh ya') || msg.includes('oh gitu') || msg.includes('oke') || msg.includes('ok ') || msg.includes('sip') || msg.includes('mantap') || msg.includes('keren') || msg.includes('hebat') || msg.includes('bagus') || msg.includes('wow') || msg.includes('gokil') || msg.includes('seru')) {
    return 'Terima kasih banyak! Bilal memang selalu berkomitmen tinggi untuk menyajikan performa website terbaik dengan visual 3D WebGL dan animasi GSAP yang premium. Apakah ada hal spesifik tentang riwayat kuliah IT-nya di PENS, prestasi kompetisinya, organisasi UKM Softdev, atau hobi petualangannya yang ingin Anda ketahui?';
  }
  
  // 10. Proyek Web & Frontend Interaktif
  if (msg.includes('proyek') || msg.includes('karya') || msg.includes('project') || msg.includes('bikin apa') || msg.includes('portofolio') || msg.includes('portfolio') || msg.includes('website')) {
    return 'Bilal memiliki puluhan proyek! Mulai dari web premium sekelas Awwwards (seperti NOIR Photography, LUMIERA, Digital Craftsman) yang sarat animasi GSAP dan Three.js, hingga proyek e-commerce seperti Herbal Mart dan eksperimen partikel Canvas.';
  }

  // 11. Proyek Game Development
  if (msg.includes('game dev') || msg.includes('bikin game') || msg.includes('phaser') || msg.includes('permainan')) {
    return 'Di bidang Game Dev, Bilal banyak bereksperimen dengan Phaser.js dan Canvas. Beberapa karyanya adalah Aether Dreamscape, MindPoint, Ghost Buster, Memory Game, Math Fighter, hingga Bunny Jump Lite!';
  }

  // 12. Proyek Python & AI / Computer Vision
  if (msg.includes('python') || msg.includes('ai ') || msg.includes('computer vision') || msg.includes('opencv') || msg.includes('mediapipe') || msg.includes('isyarat') || msg.includes('bisindo')) {
    return 'Selain Web Dev, Bilal sedang mengembangkan program Hand Gesture Recognition menggunakan Python, OpenCV, dan MediaPipe. Tujuannya adalah menerjemahkan bahasa isyarat menjadi subtitle secara real-time. Bilal juga berencana mendalami BISINDO level 1!';
  }

  // 13. Organisasi & Proyek Kolaborasi
  if (msg.includes('organisasi') || msg.includes('ukm') || msg.includes('softdev') || msg.includes('helpdesk')) {
    return 'Bilal aktif di UKM Softdev dan saat ini sedang mengerjakan proyek HelpDesk kolaboratif menggunakan React, Vite, dan Node.js bersama timnya.';
  }
  
  // 14. Keahlian & Tech Stack
  if (msg.includes('keahlian') || msg.includes('skill') || msg.includes('bisa apa') || msg.includes('bahasa') || msg.includes('framework') || msg.includes('tech') || msg.includes('teknologi')) {
    return 'Tech stack andalan Bilal meliputi ekosistem React/Next.js dengan TypeScript. Untuk urusan animasi dan 3D, dia adalah ahlinya GSAP, Lenis (Smooth Scroll), dan Three.js/WebGL. Di sisi Backend, dia terbiasa dengan Node.js dan PHP.';
  }
  
  // 15. Pendidikan & Kampus
  if (msg.includes('sekolah') || msg.includes('kuliah') || msg.includes('pendidikan') || msg.includes('pens') || msg.includes('mahasiswa') || msg.includes('kampus') || msg.includes('d3 it')) {
    return 'Bilal (NRP 3125500052) adalah mahasiswa D3 Teknik Informatika kelas 1 IT B di PENS (Politeknik Elektronika Negeri Surabaya) angkatan 2025-2028. Sebelumnya, dia merupakan lulusan jurusan RPL dari SMKN 10 Surabaya (2022-2025). Oh ya, dia juga PJ Mata Kuliah Agama di kelasnya lho!';
  }
  
  // 16. Prestasi & Sertifikasi
  if (msg.includes('prestasi') || msg.includes('sertifikat') || msg.includes('lks') || msg.includes('lsp') || msg.includes('bnsp') || msg.includes('sertifikasi') || msg.includes('juara')) {
    return 'Sederet prestasinya meliputi: Juara Harapan 2 LKS Web Technologies Kota Surabaya (2024), sertifikasi BNSP Junior Programmer, skor TOEIC 610, lulus level akhir Kumon Matematika, serta berbagai sertifikat dari Timedoor Academy (Game & Android Dev).';
  }
  
  // 17. Freelance & Layanan Profesional
  if (msg.includes('freelance') || msg.includes('upwork') || msg.includes('fiverr') || msg.includes('kerja') || msg.includes('hire') || msg.includes('jasa')) {
    return 'Bilal membuka layanan freelance secara profesional! Kamu bisa menemukan profil kerjanya di platform seperti Upwork dan Fiverr. Silakan gunakan form "Uplink" di bagian Contact untuk mendiskusikan proyekmu.';
  }

  // 18. Alat Tempur / Hardware (Easter Egg)
  if (msg.includes('laptop') || msg.includes('komputer') || msg.includes('gear') || msg.includes('spesifikasi') || msg.includes('rig')) {
    return 'Dalam meracik kode dan merender 3D, Bilal mengandalkan laptop Lenovo LOQ 15IRX9 yang ditenagai Intel Core i7-13650HX dan GPU NVIDIA RTX 4050, dikontrol secara efisien menggunakan G-Helper.';
  }

  // 19. Hobi & Kehidupan Pribadi (Easter Egg)
  if (msg.includes('hobi') || msg.includes('waktu luang') || msg.includes('suka apa') || msg.includes('game') || msg.includes('main') || msg.includes('gunung') || msg.includes('hiking')) {
    return 'Di luar coding, Bilal suka mendaki gunung dan camping (seperti ke Puthuk Gragal & Ijen), merawat motor Astrea Prima hitam kesayangannya, serta bermain game seperti Minecraft (dengan modpack The Casket of Reveries & shader), Wuthering Waves, Terraria, hingga Mobile Legends.';
  }

  // 20. Parfum & Lifestyle (Easter Egg)
  if (msg.includes('parfum') || msg.includes('wangi') || msg.includes('fragrance') || msg.includes('braven')) {
    return 'Fakta unik: Bilal lumayan menyukai wewangian! Beberapa koleksinya termasuk Mykonos California dan seri Braven (Tobacco, Dream Water, hingga Cool Wootah yang botolnya biru pekat itu).';
  }

  // 21. Teman & Kolaborator (Easter Egg)
  if (msg.includes('dimas') || msg.includes('adrian') || msg.includes('dzaki') || msg.includes('wulan') || msg.includes('tazakka')) {
    return 'Bilal sering berkolaborasi, belajar, dan nongkrong bareng teman-teman seperjuangannya seperti Dimas Rahmanda, Adrian, Dzaki, dan Wulan, serta saudaranya, Tazakka. Mereka sering menghabiskan waktu di kafe sambil makan nasi campur atau ayam goreng.';
  }

  // 22. Kontak & Hubungi
  if (msg.includes('kontak') || msg.includes('hubungi') || msg.includes('email') || msg.includes('whatsapp') || msg.includes('sosmed') || msg.includes('ig') || msg.includes('instagram')) {
    return 'Ingin terkoneksi? Kamu bisa scroll ke bagian bawah (holographic footer) web ini untuk menemukan tautan GitHub, Discord, dan Instagram Bilal, atau mengisi form UPLINK_FORM.exe untuk mengirim pesan langsung ke emailnya.';
  }

  // 23. Biografi / Siapa Bilal
  if (msg.includes('siapa') || msg.includes('bilal') || msg.includes('biografi') || msg.includes('profil') || msg.includes('profile') || msg.includes('tentang')) {
    return 'Bilal Sanayu Majid adalah seorang Creative Developer & Fullstack Web Developer yang berbasis di Surabaya. Dia mendedikasikan dirinya untuk memadukan performa kode web yang kokoh dengan estetika visual 3D interaktif yang menakjubkan.';
  }
  
  // 24. Fallback Default Conversational (Jika tidak ada keyword yang cocok)
  return 'Saya mengerti! Sebagai asisten virtual Bilal, saya dapat menceritakan banyak hal seru tentang Bilal, seperti: keahliannya di Next.js & Three.js/GSAP, riwayat kuliah IT-nya di PENS, prestasi Juara LKS Web Technologies, hobi mendaki gunung & motor Astrea Prima, spesifikasi laptop Lenovo LOQ, hingga koleksi parfum Braven kesukaannya! Silakan tanyakan salah satu topik menarik tersebut, ya!';
}
