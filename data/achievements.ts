/**
 * Certificates and awards. Shared by the Achievements marquee, the CV and the
 * AI assistant so a new certificate only needs to be added here.
 */

export interface Achievement {
  image: string;
  title: string;
  tag: string;
  heading: string;
  em: string;
  meta: string;
  /** Public link to the certificate. "#" when there is no hosted copy yet. */
  link: string;
  desc: string;
}

/** Top marquee row (scrolls left). */
export const achievementsTrack1: Achievement[] = [
  {
    "image": "/images/certificates/LKS.jpeg",
    "title": "Juara Harapan 2 — LKS Web Technologies",
    "tag": "🏅 Competition",
    "heading": "Juara Harapan 2",
    "em": "LKS Web Tech",
    "meta": "Award · Surabaya 2024",
    "link": "https://drive.google.com/file/d/1M5uTKNiOwqk2kOzyChxHXP3OgqLSulsM/view?usp=drive_link",
    "desc": "Competed in the 2024 Student Competency Competition (LKS) in the Web Technologies category in Surabaya. Achieved Juara Harapan 2 (2nd Runner-Up Merit Prize) at city level."
  },
  {
    "image": "/images/certificates/LSP.jpg",
    "title": "BNSP Competency Certificate",
    "tag": "🛡️ National Cert",
    "heading": "BNSP",
    "em": "Junior Programmer",
    "meta": "Certification · Indonesia",
    "link": "https://drive.google.com/file/d/16mvFW569lf6yUzMRpEQUMY-NVJ4t41kZ/view?usp=sharing",
    "desc": "Successfully passed the national professional certification exam, earning the BNSP competency certificate validating proficiency in computer programming as a Junior Programmer."
  },
  {
    "image": "/images/certificates/TOEIC.jpg",
    "title": "TOEIC Listening & Reading — Score: 610",
    "tag": "📋 Language",
    "heading": "TOEIC",
    "em": "Score 610",
    "meta": "English Proficiency · ETS",
    "link": "https://drive.google.com/file/d/1uE8kZ0JH1fUmT20JicNx78Cs693J91nm/view",
    "desc": "Official ETS TOEIC certificate with a 610 total score, validating upper-intermediate English listening and reading proficiency."
  },
  {
    "image": "/images/certificates/bee.jpeg",
    "title": "Bee Coding Competition",
    "tag": "⚡ Coding",
    "heading": "Bee",
    "em": "Coding Competition",
    "meta": "Competition · Jun 2024",
    "link": "https://drive.google.com/file/d/1E0a0cGa05PdXnljJ6wi9VIrM-aF5AnCs/view?usp=drive_link",
    "desc": "Participant in the Bee-Software Accounting coding competition, showcasing algorithmic problem-solving and programming skills (June 2024)."
  },
  {
    "image": "/images/certificates/HMTC.png",
    "title": "HMTC Goes To School 2024",
    "tag": "🔬 Workshop",
    "heading": "HMTC",
    "em": "Goes To School",
    "meta": "Workshop · Laravel 2024",
    "link": "https://drive.google.com/file/d/1Q16-lETHWuRJfZtedcB7R4dSxkv3AbTy/view?usp=drive_link",
    "desc": "Participation certificate for the HMTC Goes To School 2024 workshop, covering the development of a full Laravel-based guest attendance application."
  },
  {
    "image": "/images/certificates/dooit.jpg",
    "title": "Dooit — Certificate",
    "tag": "🏆 Certificate",
    "heading": "Dooit",
    "em": "Certificate",
    "meta": "Achievement · Dooit",
    "link": "#",
    "desc": "Certificate of completion awarded by Dooit, recognizing achievement and participation in their program."
  },
];

/** Bottom marquee row (scrolls right). */
export const achievementsTrack2: Achievement[] = [
  {
    "image": "/images/certificates/kumon.jpeg",
    "title": "Kumon Mathematics — Final Level Completion",
    "tag": "📐 Academic",
    "heading": "Kumon",
    "em": "Final Level",
    "meta": "Mathematics · Kumon Program",
    "link": "https://drive.google.com/file/d/1lEtBP3oXT7MX7vmeieTkbQmSgseaG3ij/view?usp=drive_link",
    "desc": "Successfully completed the final level of the Kumon Mathematics Program, demonstrating advanced self-directed learning and high mathematical proficiency."
  },
  {
    "image": "/images/certificates/js.jpeg",
    "title": "Timedoor — Game Developer",
    "tag": "🎮 Course",
    "heading": "Timedoor",
    "em": "Game Developer",
    "meta": "Course · JS & Phaser 3",
    "link": "https://drive.google.com/file/d/13wRRyTz3q_xMLZu59AcriIZhLza6Vqxk/view?usp=drive_link",
    "desc": "Certificate of completion for the Game Developer programming course using JavaScript and the Phaser 3 framework at Timedoor Academy."
  },
  {
    "image": "/images/certificates/web.jpeg",
    "title": "Timedoor — Web Developer",
    "tag": "🌐 Course",
    "heading": "Timedoor",
    "em": "Web Developer",
    "meta": "Course · 2023",
    "link": "https://drive.google.com/file/d/1X0ISZjV7gYgNVqcmV1uDIjBj65AcTvzD/view?usp=drive_link",
    "desc": "Certificate of completion for the Web Developer programming course at Timedoor Academy in 2023."
  },
  {
    "image": "/images/certificates/apps.jpeg",
    "title": "Timedoor — Android Apps Developer",
    "tag": "📱 Course",
    "heading": "Timedoor",
    "em": "Android Developer",
    "meta": "Course · Android Studio",
    "link": "https://drive.google.com/file/d/16SIs7qixGOatwr0SowZ_-HXU6y2-iZGp/view?usp=drive_link",
    "desc": "Certificate of completion for the Android Apps Developer programming course at Timedoor Academy, covering Android Studio and mobile app development."
  },
  {
    "image": "/images/certificates/ML1.jpg",
    "title": "Machine Learning 1 — Certificate",
    "tag": "🤖 Machine Learning",
    "heading": "ML1",
    "em": "Certificate",
    "meta": "Course · Machine Learning",
    "link": "#",
    "desc": "Certificate of completion for the Machine Learning 1 course, covering foundational ML concepts, supervised learning, and model evaluation."
  },
  {
    "image": "/images/certificates/ML2.jpg",
    "title": "Machine Learning 2 — Certificate",
    "tag": "🧠 Deep Learning",
    "heading": "ML2",
    "em": "Certificate",
    "meta": "Course · Deep Learning",
    "link": "#",
    "desc": "Certificate of completion for the Machine Learning 2 course, covering advanced ML techniques, deep learning, and neural network architectures."
  },
  {
    "image": "/images/certificates/Webdev.jpg",
    "title": "Web Development — Certificate",
    "tag": "🌐 Web Dev",
    "heading": "Web Dev",
    "em": "Certificate",
    "meta": "Course · Full Stack",
    "link": "#",
    "desc": "Certificate of completion for the Web Development course, covering modern web technologies, responsive design, and full-stack development practices."
  },
];

export const achievements: Achievement[] = [...achievementsTrack1, ...achievementsTrack2];
