/**
 * Converts structured resume data from the ResumeBuilder into a specifically formatted
 * text string that is compatible with the ResumePreview component and backend exporters.
 */
export const serializeResume = (data) => {
  const isVisible = (secName) => {
    if (data.visibleSections && data.visibleSections[secName] === false) {
      return false;
    }
    if (data.hiddenSections && data.hiddenSections.includes(secName)) {
      return false;
    }
    return true;
  };

  let text = `${data.personal?.name || 'Your Name'}\n`;
  
  const contactParts = [];
  if (data.personal?.email) contactParts.push(data.personal.email);
  if (data.personal?.phone) contactParts.push(data.personal.phone);
  if (data.personal?.location) contactParts.push(data.personal.location);
  if (data.personal?.website) contactParts.push(data.personal.website);
  if (data.personal?.linkedin) contactParts.push(data.personal.linkedin);
  
  if (contactParts.length > 0) {
    text += contactParts.join(' | ') + '\n';
  }
  text += '\n';

  if (data.summary && data.summary.trim() && isVisible('summary')) {
    text += `PROFESSIONAL SUMMARY\n${data.summary}\n\n`;
  }

  if (data.objective && data.objective.trim() && isVisible('objective')) {
    text += `CAREER OBJECTIVE\n${data.objective}\n\n`;
  }

  // Work Experience
  if (data.experience && data.experience.length > 0 && isVisible('experience')) {
    const validExp = data.experience.filter(e => e.role || e.company);
    if (validExp.length > 0) {
      text += `WORK EXPERIENCE\n`;
      validExp.forEach(exp => {
        text += `${exp.role}${exp.role && exp.company ? ' at ' : ''}${exp.company}${exp.dates ? ` | ${exp.dates}` : ''}\n`;
        if (exp.location) text += `${exp.location}\n`;
        if (exp.description) text += `${exp.description}\n`;
        text += `\n`;
      });
    }
  }

  // Internships
  if (data.internships && data.internships.length > 0 && isVisible('internships')) {
    const validInt = data.internships.filter(i => i.role || i.company);
    if (validInt.length > 0) {
      text += `INTERNSHIPS\n`;
      validInt.forEach(intern => {
        text += `${intern.role}${intern.role && intern.company ? ' at ' : ''}${intern.company}${intern.dates ? ` | ${intern.dates}` : ''}\n`;
        if (intern.location) text += `${intern.location}\n`;
        if (intern.description) text += `${intern.description}\n`;
        text += `\n`;
      });
    }
  }

  // Education
  if (data.education && data.education.length > 0 && isVisible('education')) {
    const validEdu = data.education.filter(e => e.degree || e.school);
    if (validEdu.length > 0) {
      text += `EDUCATION\n`;
      validEdu.forEach(edu => {
        text += `${edu.degree}${edu.degree && edu.school ? ' from ' : ''}${edu.school}${edu.dates ? ` | ${edu.dates}` : ''}\n`;
        if (edu.honors) text += `${edu.honors}\n`;
        text += `\n`;
      });
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0 && isVisible('skills')) {
    const validSkills = data.skills.filter(s => s.category || s.items);
    if (validSkills.length > 0) {
      text += `SKILLS\n`;
      validSkills.forEach(skillGroup => {
        if (skillGroup.category && skillGroup.items) {
          text += `${skillGroup.category.toUpperCase()}: ${skillGroup.items}\n`;
        } else if (skillGroup.items) {
          text += `${skillGroup.items}\n`;
        }
      });
      text += `\n`;
    }
  }

  // Technical Skills
  if (data.technicalSkills && data.technicalSkills.length > 0 && isVisible('technicalSkills')) {
    const validTech = data.technicalSkills.filter(s => s.category || s.items);
    if (validTech.length > 0) {
      text += `TECHNICAL SKILLS\n`;
      validTech.forEach(skillGroup => {
        if (skillGroup.category && skillGroup.items) {
          text += `${skillGroup.category.toUpperCase()}: ${skillGroup.items}\n`;
        } else if (skillGroup.items) {
          text += `${skillGroup.items}\n`;
        }
      });
      text += `\n`;
    }
  }

  // Soft Skills
  if (data.softSkills && data.softSkills.trim() && isVisible('softSkills')) {
    text += `SOFT SKILLS\n`;
    const skillsList = data.softSkills.split(',').map(s => s.trim()).filter(Boolean);
    skillsList.forEach(s => {
      text += `- ${s}\n`;
    });
    text += `\n`;
  }

  // Projects
  if (data.projects && data.projects.length > 0 && isVisible('projects')) {
    const validProj = data.projects.filter(p => p.name || p.description);
    if (validProj.length > 0) {
      text += `PROJECTS\n`;
      validProj.forEach(proj => {
        text += `${proj.name}${proj.link ? ` | ${proj.link}` : ''}\n`;
        if (proj.description) text += `${proj.description}\n`;
        text += `\n`;
      });
    }
  }

  // Certifications
  if (data.certifications && data.certifications.length > 0 && isVisible('certifications')) {
    const validCerts = data.certifications.filter(c => c.name);
    if (validCerts.length > 0) {
      text += `CERTIFICATIONS\n`;
      validCerts.forEach(cert => {
        text += `- ${cert.name}${cert.year ? ` (${cert.year})` : ''}\n`;
      });
      text += `\n`;
    }
  }

  // Achievements
  if (data.achievements && data.achievements.length > 0 && isVisible('achievements')) {
    const validAch = data.achievements.filter(a => a.name);
    if (validAch.length > 0) {
      text += `ACHIEVEMENTS\n`;
      validAch.forEach(ach => {
        text += `- ${ach.name}${ach.details ? `: ${ach.details}` : ''}\n`;
      });
      text += `\n`;
    }
  }

  // Awards
  if (data.awards && data.awards.length > 0 && isVisible('awards')) {
    const validAwards = data.awards.filter(a => a.title);
    if (validAwards.length > 0) {
      text += `AWARDS\n`;
      validAwards.forEach(award => {
        text += `- ${award.title}${award.issuer ? ` | ${award.issuer}` : ''}${award.year ? ` | ${award.year}` : ''}\n`;
      });
      text += `\n`;
    }
  }

  // Languages
  if (data.languages && data.languages.length > 0 && isVisible('languages')) {
    const validLang = data.languages.filter(l => l.name);
    if (validLang.length > 0) {
      text += `LANGUAGES\n`;
      validLang.forEach(lang => {
        text += `- ${lang.name}${lang.proficiency ? ` (${lang.proficiency})` : ''}\n`;
      });
      text += `\n`;
    }
  }

  // Publications
  if (data.publications && data.publications.length > 0 && isVisible('publications')) {
    const validPubs = data.publications.filter(p => p.title || p.journal);
    if (validPubs.length > 0) {
      text += `PUBLICATIONS\n`;
      validPubs.forEach(pub => {
        text += `${pub.title}${pub.journal ? ` | ${pub.journal}` : ''}${pub.year ? ` | ${pub.year}` : ''}${pub.link ? ` | ${pub.link}` : ''}\n`;
        if (pub.description) text += `${pub.description}\n`;
        text += `\n`;
      });
    }
  }

  // Volunteer Experience
  if (data.volunteerExperience && data.volunteerExperience.length > 0 && isVisible('volunteerExperience')) {
    const validVol = data.volunteerExperience.filter(v => v.role || v.organization);
    if (validVol.length > 0) {
      text += `VOLUNTEER EXPERIENCE\n`;
      validVol.forEach(vol => {
        text += `${vol.role}${vol.role && vol.organization ? ' at ' : ''}${vol.organization}${vol.dates ? ` | ${vol.dates}` : ''}\n`;
        if (vol.description) text += `${vol.description}\n`;
        text += `\n`;
      });
    }
  }

  // References
  if (data.references && data.references.length > 0 && isVisible('references')) {
    const validRef = data.references.filter(r => r.name);
    if (validRef.length > 0) {
      text += `REFERENCES\n`;
      validRef.forEach(ref => {
        text += `${ref.name}${ref.title ? ` | ${ref.title}` : ''}${ref.company ? ` | ${ref.company}` : ''}\n`;
        const contact = [];
        if (ref.email) contact.push(ref.email);
        if (ref.phone) contact.push(ref.phone);
        if (contact.length > 0) text += `${contact.join(' | ')}\n`;
        text += `\n`;
      });
    }
  }

  if (data.customSections && data.customSections.length > 0 && isVisible('customSections')) {
    data.customSections.forEach(section => {
      if (section.title && section.title.trim()) {
        text += `${section.title.toUpperCase()}\n`;
        if (section.fields && section.fields.length > 0) {
          section.fields.forEach(field => {
            const hasLabel = field.label && field.label.trim();
            const hasVal = field.value && field.value.trim();
            if (hasLabel && hasVal) {
              text += `${field.label}: ${field.value}\n`;
            } else if (hasVal) {
              text += `${field.value}\n`;
            } else if (hasLabel) {
              text += `${field.label}\n`;
            }
          });
        }
        text += `\n`;
      }
    });
  }

  return text.trim();
};

/**
 * Robust heuristic-based parser that converts a plain text resume back into structured builder data.
 */
export const parseToBuilderData = (text) => {
  const lines = text.split('\n');
  const result = {
    personal: { name: '', email: '', phone: '', location: '', website: '', linkedin: '' },
    summary: '',
    objective: '',
    experience: [],
    education: [],
    skills: [],
    technicalSkills: [],
    softSkills: '',
    projects: [],
    certifications: [],
    internships: [],
    achievements: [],
    languages: [],
    publications: [],
    volunteerExperience: [],
    references: [],
    customSections: [],
    awards: []
  };

  if (lines.length === 0 || !text.trim()) return result;

  let lineIdx = 0;
  result.personal.name = lines[0].trim();
  lineIdx++;

  const headers = [
    'PROFESSIONAL SUMMARY', 'SUMMARY', 'OBJECTIVE', 'CAREER OBJECTIVE', 'WORK EXPERIENCE', 'EXPERIENCE', 
    'EDUCATION', 'SKILLS', 'TECHNICAL SKILLS', 'SOFT SKILLS', 'PROJECTS', 'CERTIFICATIONS', 'INTERNSHIPS', 'ACHIEVEMENTS', 'LANGUAGES',
    'PUBLICATIONS', 'VOLUNTEER EXPERIENCE', 'VOLUNTEER', 'REFERENCES', 'AWARDS'
  ];

  while (lineIdx < lines.length && lineIdx < 6) {
    const line = lines[lineIdx].trim();
    if (headers.includes(line.toUpperCase())) {
      break;
    }
    if (line.includes('@') || line.includes('|') || line.includes('+')) {
      const parts = line.split(/[|•]/).map(p => p.trim());
      parts.forEach(part => {
        if (part.includes('@')) {
          result.personal.email = part;
        } else if (part.includes('linkedin.com')) {
          result.personal.linkedin = part;
        } else if (part.includes('github.com') || part.includes('portfolio') || part.match(/\.[a-z]{2,}/i)) {
          result.personal.website = part;
        } else if (part.match(/\+?\d+/) && part.length > 5) {
          result.personal.phone = part;
        } else if (part.length > 3) {
          result.personal.location = part;
        }
      });
    }
    lineIdx++;
  }

  let currentSection = null;
  let currentContent = [];

  for (let i = lineIdx; i < lines.length; i++) {
    const line = lines[i].trim();
    const upper = line.toUpperCase().replace(/:$/, '');
    if (headers.includes(upper)) {
      if (currentSection) {
        parseSection(currentSection, currentContent, result);
      }
      currentSection = upper;
      currentContent = [];
    } else {
      if (line) {
        currentContent.push(line);
      }
    }
  }
  if (currentSection) {
    parseSection(currentSection, currentContent, result);
  }

  return result;
};

const parseSection = (header, lines, result) => {
  if (header.includes('SUMMARY')) {
    result.summary = lines.join('\n');
  } else if (header.includes('OBJECTIVE')) {
    result.objective = lines.join('\n');
  } else if (header === 'WORK EXPERIENCE' || header === 'EXPERIENCE') {
    result.experience = parseExperienceOrInternship(lines);
  } else if (header === 'INTERNSHIPS') {
    result.internships = parseExperienceOrInternship(lines);
  } else if (header === 'EDUCATION') {
    let currentEdu = null;
    lines.forEach(line => {
      if (line.includes(' from ')) {
        if (currentEdu) result.education.push(currentEdu);
        const parts = line.split(' from ');
        const degree = parts[0].trim();
        const schoolParts = parts[1].split('|');
        const school = schoolParts[0].trim();
        const dates = schoolParts[1] ? schoolParts[1].trim() : '';
        currentEdu = { id: Date.now() + Math.random(), degree, school, dates, honors: '' };
      } else if (currentEdu) {
        currentEdu.honors = line;
      }
    });
    if (currentEdu) result.education.push(currentEdu);
  } else if (header === 'SKILLS') {
    lines.forEach(line => {
      if (line.includes(':')) {
        const parts = line.split(':');
        const category = parts[0].trim();
        const items = parts[1].trim();
        result.skills.push({ id: Date.now() + Math.random(), category, items });
      } else {
        result.skills.push({ id: Date.now() + Math.random(), category: 'Skills', items: line });
      }
    });
  } else if (header === 'TECHNICAL SKILLS') {
    lines.forEach(line => {
      if (line.includes(':')) {
        const parts = line.split(':');
        const category = parts[0].trim();
        const items = parts[1].trim();
        result.technicalSkills.push({ id: Date.now() + Math.random(), category, items });
      } else {
        result.technicalSkills.push({ id: Date.now() + Math.random(), category: 'Technical Skills', items: line });
      }
    });
  } else if (header === 'SOFT SKILLS') {
    result.softSkills = lines.map(line => line.replace(/^[-•*]\s*/, '')).join(', ');
  } else if (header === 'PROJECTS') {
    let currentProj = null;
    lines.forEach(line => {
      if (line.includes('|') || (!currentProj && line.length < 50)) {
        if (currentProj) result.projects.push(currentProj);
        const parts = line.split('|');
        const name = parts[0].trim();
        const link = parts[1] ? parts[1].trim() : '';
        currentProj = { id: Date.now() + Math.random(), name, link, description: '' };
      } else if (currentProj) {
        currentProj.description += (currentProj.description ? '\n' : '') + line;
      }
    });
    if (currentProj) result.projects.push(currentProj);
  } else if (header === 'CERTIFICATIONS') {
    lines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, '');
      const match = clean.match(/(.*)\s+\((\d{4})\)/);
      if (match) {
        result.certifications.push({ id: Date.now() + Math.random(), name: match[1].trim(), year: match[2] });
      } else {
        result.certifications.push({ id: Date.now() + Math.random(), name: clean.trim(), year: '' });
      }
    });
  } else if (header === 'ACHIEVEMENTS') {
    lines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, '');
      if (clean.includes(':')) {
        const parts = clean.split(':');
        result.achievements.push({ id: Date.now() + Math.random(), name: parts[0].trim(), details: parts[1].trim() });
      } else {
        result.achievements.push({ id: Date.now() + Math.random(), name: clean.trim(), details: '' });
      }
    });
  } else if (header === 'AWARDS') {
    lines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, '');
      if (clean.includes('|')) {
        const parts = clean.split('|').map(p => p.trim());
        result.awards.push({ id: Date.now() + Math.random(), title: parts[0], issuer: parts[1] || '', year: parts[2] || '' });
      } else if (clean.includes(':')) {
        const parts = clean.split(':').map(p => p.trim());
        result.awards.push({ id: Date.now() + Math.random(), title: parts[0], issuer: parts[1] || '', year: '' });
      } else {
        result.awards.push({ id: Date.now() + Math.random(), title: clean.trim(), issuer: '', year: '' });
      }
    });
  } else if (header === 'LANGUAGES') {
    lines.forEach(line => {
      const clean = line.replace(/^[-•*]\s*/, '');
      const match = clean.match(/(.*)\s+\((.*)\)/);
      if (match) {
        result.languages.push({ id: Date.now() + Math.random(), name: match[1].trim(), proficiency: match[2].trim() });
      } else {
        result.languages.push({ id: Date.now() + Math.random(), name: clean.trim(), proficiency: '' });
      }
    });
  } else if (header === 'PUBLICATIONS') {
    let currentPub = null;
    lines.forEach(line => {
      if (line.includes('|') || (!currentPub && line.length < 100)) {
        if (currentPub) result.publications.push(currentPub);
        const parts = line.split('|').map(p => p.trim());
        const title = parts[0] || '';
        const journal = parts[1] || '';
        const year = parts[2] || '';
        const link = parts[3] || '';
        currentPub = { id: Date.now() + Math.random(), title, journal, year, link, description: '' };
      } else if (currentPub) {
        currentPub.description += (currentPub.description ? '\n' : '') + line;
      }
    });
    if (currentPub) result.publications.push(currentPub);
  } else if (header === 'VOLUNTEER EXPERIENCE' || header === 'VOLUNTEER') {
    let currentVol = null;
    lines.forEach(line => {
      if (line.includes(' at ')) {
        if (currentVol) result.volunteerExperience.push(currentVol);
        const parts = line.split(' at ');
        const role = parts[0].trim();
        const orgParts = parts[1].split('|');
        const organization = orgParts[0].trim();
        const dates = orgParts[1] ? orgParts[1].trim() : '';
        currentVol = { id: Date.now() + Math.random(), role, organization, dates, description: '' };
      } else if (currentVol) {
        currentVol.description += (currentVol.description ? '\n' : '') + line;
      }
    });
    if (currentVol) result.volunteerExperience.push(currentVol);
  } else if (header === 'REFERENCES') {
    let currentRef = null;
    lines.forEach(line => {
      if (line.includes('|') && !line.includes('@')) {
        if (currentRef) result.references.push(currentRef);
        const parts = line.split('|').map(p => p.trim());
        currentRef = { id: Date.now() + Math.random(), name: parts[0], title: parts[1] || '', company: parts[2] || '', email: '', phone: '' };
      } else if (currentRef && (line.includes('@') || line.includes('|'))) {
        const parts = line.split('|').map(p => p.trim());
        parts.forEach(part => {
          if (part.includes('@')) currentRef.email = part;
          else currentRef.phone = part;
        });
      }
    });
    if (currentRef) result.references.push(currentRef);
  }
};

const parseExperienceOrInternship = (lines) => {
  const items = [];
  let currentItem = null;
  lines.forEach(line => {
    if (line.includes(' at ')) {
      if (currentItem) items.push(currentItem);
      const parts = line.split(' at ');
      const role = parts[0].trim();
      const compParts = parts[1].split('|');
      const company = compParts[0].trim();
      const dates = compParts[1] ? compParts[1].trim() : '';
      currentItem = { id: Date.now() + Math.random(), role, company, dates, location: '', description: '' };
    } else if (currentItem) {
      if (line.includes(',') && !currentItem.location && line.length < 40) {
        currentItem.location = line;
      } else {
        currentItem.description += (currentItem.description ? '\n' : '') + line;
      }
    }
  });
  if (currentItem) items.push(currentItem);
  return items;
};

export const normalizeData = (raw) => {
  const defaultVisible = {
    summary: true,
    objective: true,
    experience: true,
    internships: true,
    education: true,
    skills: true,
    technicalSkills: true,
    softSkills: true,
    projects: true,
    certifications: true,
    achievements: true,
    languages: true,
    publications: true,
    volunteerExperience: true,
    references: true,
    customSections: true,
    awards: true
  };
  return {
    personal: raw?.personal || { name: '', email: '', phone: '', location: '', website: '', linkedin: '' },
    summary: raw?.summary || '',
    objective: raw?.objective || '',
    experience: raw?.experience || [],
    internships: raw?.internships || [],
    education: raw?.education || [],
    skills: raw?.skills || [],
    technicalSkills: raw?.technicalSkills || [],
    softSkills: raw?.softSkills || '',
    projects: raw?.projects || [],
    certifications: raw?.certifications || [],
    achievements: raw?.achievements || [],
    languages: raw?.languages || [],
    publications: raw?.publications || [],
    volunteerExperience: raw?.volunteerExperience || [],
    references: raw?.references || [],
    customSections: raw?.customSections || [],
    awards: raw?.awards || [],
    visibleSections: raw?.visibleSections || defaultVisible,
    db_id: raw?.db_id || null,
    template_id: raw?.template_id || null
  };
};

