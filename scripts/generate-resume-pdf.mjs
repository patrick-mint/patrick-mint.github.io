import { writeFileSync } from 'node:fs';

const pageWidth = 595;
const pageHeight = 842;
const margin = 50;
const bodySize = 9.5;
const leading = 14;
let y = 790;
const contents = [[]];
let content = contents[0];

function escapePdf(value) {
  return value.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function text(value, x, font = 'F1', size = bodySize) {
  content.push(`BT /${font} ${size} Tf 1 0 0 1 ${x} ${y} Tm (${escapePdf(value)}) Tj ET`);
}

function rule() {
  content.push(`0.18 0.25 0.34 RG 0.8 w ${margin} ${y + 3} m ${pageWidth - margin} ${y + 3} l S`);
}

function wrap(value, width = 93) {
  const words = value.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    if (`${line} ${word}`.trim().length > width) {
      lines.push(line);
      line = word;
    } else {
      line = `${line} ${word}`.trim();
    }
  }
  if (line) lines.push(line);
  return lines;
}

function paragraph(value, x = margin, width = 93) {
  for (const line of wrap(value, width)) {
    text(line, x);
    y -= leading;
  }
}

function section(title) {
  y -= 12;
  text(title.toUpperCase(), margin, 'F2', 11.5);
  y -= 7;
  rule();
  y -= 16;
}

function newPage() {
  content = [];
  contents.push(content);
  y = 790;
}

function role(title, dates, company, bullets) {
  text(title, margin, 'F2', 10);
  text(dates, 432, 'F1', 8.5);
  y -= 13;
  text(company, margin, 'F1', 9);
  y -= 14;
  for (const bullet of bullets) {
    const lines = wrap(bullet, 85);
    text('-', margin + 2);
    text(lines[0], margin + 14);
    y -= leading;
    for (const line of lines.slice(1)) {
      text(line, margin + 14);
      y -= leading;
    }
  }
  y -= 5;
}

text('PAKORNPAT AMORNLERTPANIT', margin, 'F2', 18);
y -= 21;
text('Bangkok, Thailand  |  +66 87 795 9752  |  pakornpat.a@gmail.com', margin, 'F1', 9);
y -= 16;
text('GitHub: github.com/patrick-mint  |  Portfolio: patrick-mint.github.io', margin, 'F1', 9);
y -= 6;

section('Professional Summary');
paragraph('Backend-focused software engineer experienced in payment systems, POS integrations, API integrations, and event-driven architecture. Skilled in Node.js, TypeScript, Java, Kafka, MySQL, AWS, and Docker, with production experience supporting transaction services, KYC-related workflows, and legacy application migration. Brings earlier people management and customer coordination experience from hospitality operations.');

section('Technical Skills');
paragraph('Languages: JavaScript, TypeScript, Java');
paragraph('Backend: Node.js, Express, Spring Boot, REST APIs');
paragraph('Data and Events: MySQL, Redis, Kafka, XML/JSON transformation');
paragraph('Cloud and DevOps: AWS (EC2, S3, Lambda, CloudWatch), Docker');
paragraph('Tools: Git, Postman, logging and monitoring');
paragraph('Leadership: People management, customer coordination, cross-functional collaboration');

section('Experience');
role('Java Developer (Contract)', 'Mar 2026 - Present', 'Counter Service Co., Ltd. (7-Eleven Group), Bangkok', [
  'Develop and maintain backend services for payment systems and transaction processing.',
  'Integrate external client systems and APIs; support testing with Postman.',
  'Handle XML/JSON transformation and encryption/decryption workflows for KYC-related processes.',
  'Migrate legacy applications from Java 8 and Tomcat 8 to Java 17 and Tomcat 10.1, updating dependencies and application configuration for compatibility.',
  'Investigate production logs and resolve real-time service issues.',
]);
role('Software Engineer (5A / 5B)', 'Nov 2022 - Present', 'Gosoft (Thailand) Co., Ltd., Bangkok', [
  'Promoted from Software Engineer 5B to 5A in April 2025 based on performance.',
  'Develop POS backend systems using Node.js and MySQL, including REST APIs and Redis caching.',
  'Manage deployments in Docker and AWS environments, and support logging and monitoring with CloudWatch.',
  'Work on integration with internal and external services.',
]);
role("Senior Backend Engineer (Contract)", 'Sep 2025 - Feb 2026', "Lotus's (CP Group), Bangkok", [
  'Built Node.js and TypeScript backend services for POS systems.',
  'Implemented Kafka-based event-driven architecture for real-time data processing.',
  'Designed scalable APIs supporting high-volume store operations.',
]);

newPage();
text('PAKORNPAT AMORNLERTPANIT', margin, 'F2', 14);
y -= 24;
section('Previous Management Experience');
role('Front Desk Manager', 'May 2019 - Mar 2022', 'Shangri-La Hotel, Bangkok', [
  'Led front desk operations and supported team members to deliver consistent guest service.',
  'Coordinated directly with guests and cross-functional hotel teams to resolve service issues.',
]);
role('Executive Lounge Manager', 'Sep 2017 - May 2019', 'Shangri-La Hotel, Bangkok', [
  'Managed Executive Lounge operations and coordinated guest requirements with internal teams.',
  'Supported and developed service staff while maintaining a high standard of guest experience.',
]);

const streams = contents.map((pageContent) => pageContent.join('\n'));
const objects = [
  '<< /Type /Catalog /Pages 2 0 R >>',
  '<< /Type /Pages /Kids [3 0 R 4 0 R] /Count 2 >>',
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 7 0 R >>`,
  `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> /Contents 8 0 R >>`,
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
  '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  `<< /Length ${Buffer.byteLength(streams[0])} >>\nstream\n${streams[0]}\nendstream`,
  `<< /Length ${Buffer.byteLength(streams[1])} >>\nstream\n${streams[1]}\nendstream`,
];

let pdf = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((object, index) => {
  offsets.push(Buffer.byteLength(pdf));
  pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
});
const xref = Buffer.byteLength(pdf);
pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f\n`;
for (const offset of offsets.slice(1)) pdf += `${String(offset).padStart(10, '0')} 00000 n\n`;
pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`;

writeFileSync(new URL('../Resume/Resume.pdf', import.meta.url), pdf);
