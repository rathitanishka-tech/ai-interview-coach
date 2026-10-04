export interface InterviewConfig {
  role: string;
  experience: string;
  type: string;
  difficulty: string;
  questions: number;
}

export interface Question {
  id: string;
  text: string;
  category: string;
  isFollowUp?: boolean;
  originalId?: string;
  difficulty?: string;
}

const QUESTION_BANK: Record<string, Record<string, Record<string, string[]>>> = {
  "Frontend Developer": {
    Technical: {
      Easy: [
        "Explain the difference between client-side routing and server-side routing.",
        "What are CSS modules and what problem do they solve?",
        "Describe the purpose of semantic HTML tags."
      ],
      Medium: [
        "How does React's Virtual DOM work and why is it useful?",
        "How do you handle state management in a large Frontend application?",
        "Explain the concept of closures in JavaScript and provide a practical use case."
      ],
      Hard: [
        "Describe how you would optimize the performance of a heavy web application.",
        "How do you architect a frontend application for micro-frontends?",
        "Explain the rendering cycle of a modern browser and how you'd optimize the critical rendering path."
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you had to learn a new frontend framework quickly.",
        "How do you prioritize accessibility in your daily development?",
        "Describe your typical workflow when picking up a new feature ticket."
      ],
      Medium: [
        "Tell me about a time you disagreed with a designer. How did you resolve it?",
        "Describe a situation where a critical bug was found in production due to your code.",
        "How do you balance writing perfect code versus meeting tight deadlines?"
      ],
      Hard: [
        "Tell me about a time you had to refactor a messy legacy codebase.",
        "Describe a scenario where you led a major technical initiative across multiple teams.",
        "How do you handle a situation where business requirements fundamentally contradict frontend best practices?"
      ]
    },
    HR: {
      Easy: [
        "What drew you to frontend development over other fields?",
        "What kind of team environment do you thrive in?",
        "Which frontend tools or libraries are you most excited to learn next?"
      ],
      Medium: [
        "How do you stay updated with the fast-moving JavaScript ecosystem?",
        "What is your preferred working style when collaborating with a cross-functional team?",
        "Describe your ideal relationship between frontend and backend engineering."
      ],
      Hard: [
        "Where do you see your frontend architecture skills progressing in the next two years?",
        "How do you evaluate and advocate for adopting new technologies in a company?",
        "What cultural values do you believe are essential for a high-performing engineering team?"
      ]
    }
  },
  "Backend Developer": {
    Technical: {
      Easy: [
        "Explain the differences between REST and GraphQL.",
        "What is dependency injection and why is it useful?",
        "Describe the purpose of an ORM."
      ],
      Medium: [
        "Describe a strategy for securing a public-facing API.",
        "How do you handle asynchronous background processing in a backend system?",
        "Explain how database indexing works and when you should avoid it."
      ],
      Hard: [
        "How would you design a scalable database schema for an e-commerce platform?",
        "What are the pros and cons of microservices vs a monolithic architecture?",
        "Describe how you would implement distributed tracing in a complex backend architecture."
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you mentored a junior backend developer.",
        "How do you ensure your API documentation remains up to date?",
        "Describe a time you had to quickly fix a broken build."
      ],
      Medium: [
        "Tell me about a time you had to deal with a severe database performance issue.",
        "How do you handle requirements that change midway through a sprint?",
        "Describe a time you had to collaborate closely with DevOps to resolve an issue."
      ],
      Hard: [
        "Describe a scenario where you disagreed with another engineer over an API design.",
        "Describe a project where you successfully mitigated a security vulnerability.",
        "Tell me about a time you had to orchestrate a zero-downtime database migration."
      ]
    },
    HR: {
      Easy: [
        "What motivates you to work in backend engineering?",
        "How do you prefer to receive constructive feedback?",
        "What backend language do you enjoy working with most?"
      ],
      Medium: [
        "What is your ideal ratio of architectural design vs actual coding?",
        "How do you approach sharing knowledge within your engineering team?",
        "What does continuous learning look like for you?"
      ],
      Hard: [
        "How do you handle technical debt in a fast-paced startup environment?",
        "What qualities make a great engineering manager in your eyes?",
        "How do you align backend infrastructure decisions with long-term business goals?"
      ]
    }
  },
  "Full Stack Developer": {
    Technical: {
      Easy: [
        "Explain how Server-Side Rendering (SSR) impacts both backend load and frontend performance.",
        "What is CORS and how do you resolve CORS issues?",
        "Describe the basic structure of a JWT."
      ],
      Medium: [
        "How do you manage data synchronization between a client state and a backend database?",
        "What considerations do you make when deciding where to put business logic?",
        "How do you handle deployment and CI/CD for a full stack application?"
      ],
      Hard: [
        "Describe a strategy to implement robust authentication across both frontend and backend.",
        "How do you design a system that needs to support both web clients and mobile app APIs efficiently?",
        "Explain how you would handle real-time bidirectional data flow in a full stack application."
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you had to wear many hats to get a feature shipped.",
        "How do you organize your day when jumping between backend and frontend tasks?",
        "Describe a time you learned a new technology specifically for a project."
      ],
      Medium: [
        "Describe a project where the frontend and backend teams were misaligned, and how you bridged the gap.",
        "Tell me about a difficult technical compromise you had to make.",
        "How do you communicate full-stack trade-offs to non-technical product managers?"
      ],
      Hard: [
        "How do you prioritize when both the UI and the database urgently need optimization?",
        "Describe a situation where you had to push back on a product requirement.",
        "Tell me about a time you had to salvage a failing full-stack project."
      ]
    },
    HR: {
      Easy: [
        "Do you lean more towards frontend or backend, and why?",
        "What kind of projects do you find most fulfilling?",
        "How do you stay motivated when working on the less glamorous parts of the stack?"
      ],
      Medium: [
        "How do you balance learning new UI libraries vs backend frameworks?",
        "How do you handle context-switching between different parts of the stack?",
        "What role do you typically naturally assume in a team?"
      ],
      Hard: [
        "What are your long-term career goals as a Full Stack Developer?",
        "What does 'full stack' mean to you in a modern engineering team?",
        "How do you see the evolution of full-stack development over the next five years?"
      ]
    }
  },
  "Software Engineer": {
    Technical: {
      Easy: [
        "Explain the concept of time and space complexity with an example.",
        "What design patterns do you use most frequently and why?",
        "Explain the concept of continuous integration and its benefits."
      ],
      Medium: [
        "How do you ensure thread safety in a concurrent application?",
        "Describe the differences between TCP and UDP.",
        "Explain how garbage collection works in your language of choice."
      ],
      Hard: [
        "Describe how you would approach designing a system like Twitter.",
        "How do you design a distributed cache system?",
        "Explain the CAP theorem and how it applies to a system you've built."
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you had to learn a completely new programming language for a project.",
        "How do you handle negative feedback during a code review?",
        "Describe a time you documented a complex system for others."
      ],
      Medium: [
        "Describe a scenario where you failed to meet a deadline. What happened?",
        "Describe a situation where you had to debug a complex issue under pressure.",
        "Tell me about a time you had to collaborate with an uncommunicative teammate."
      ],
      Hard: [
        "Tell me about a time you significantly improved the performance of a system.",
        "Describe a situation where you had to make a critical architectural decision with limited information.",
        "Tell me about a time you advocated against a management decision and proved you were right."
      ]
    },
    HR: {
      Easy: [
        "What are you looking for in your next engineering role?",
        "How do you approach self-improvement as an engineer?",
        "What is your favorite development tool?"
      ],
      Medium: [
        "How do you define success in a software project?",
        "What is your preferred methodology for software development?",
        "How do you evaluate if a company is a good fit for you?"
      ],
      Hard: [
        "What values are most important to you in a company's engineering culture?",
        "How do you balance engineering excellence with business pragmatism?",
        "Where do you see the software engineering industry heading?"
      ]
    }
  },
  "Data Analyst": {
    Technical: {
      Easy: [
        "Explain the difference between a left join and an inner join in SQL.",
        "What visualization tools are you most comfortable with and why?",
        "Describe the difference between mean, median, and mode."
      ],
      Medium: [
        "Describe a time you used statistical analysis to solve a business problem.",
        "How do you handle missing or corrupted data in a dataset?",
        "Explain the concept of A/B testing and how you ensure statistical significance."
      ],
      Hard: [
        "How would you design a dashboard to track company-wide KPIs in real-time?",
        "Describe your process for identifying outliers and deciding how to handle them.",
        "Explain how you would approach predictive modeling with limited historical data."
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time your data analysis contradicted a stakeholder's assumption.",
        "How do you communicate complex data findings to non-technical audiences?",
        "Describe a time you had to quickly pivot your analysis due to changing requirements."
      ],
      Medium: [
        "Describe a project where the data was extremely messy. How did you handle it?",
        "Tell me about a time you found a critical error in your analysis after sharing it.",
        "How do you handle pushback from executives who dislike your data findings?"
      ],
      Hard: [
        "Describe a situation where you had to gather data from multiple fragmented sources.",
        "Tell me about a time you uncovered a data insight that dramatically changed business strategy.",
        "How do you ensure data governance and privacy in your day-to-day work?"
      ]
    },
    HR: {
      Easy: [
        "What aspect of data analysis do you find most rewarding?",
        "How do you stay updated with new data tools and methodologies?",
        "What domain of data interests you most?"
      ],
      Medium: [
        "What kind of industry or data domain interests you the most?",
        "How do you prefer to collaborate with business stakeholders?",
        "How do you handle repetitive data extraction tasks?"
      ],
      Hard: [
        "What are your long-term goals in the data field?",
        "How do you envision the role of a data analyst evolving with the rise of AI?",
        "What defines a truly data-driven organization in your opinion?"
      ]
    }
  },
  "Product Manager": {
    Technical: {
      Easy: [
        "How do you approach writing technical requirements for an engineering team?",
        "Describe your process for prioritizing the product backlog.",
        "What is your approach to writing user stories?"
      ],
      Medium: [
        "How do you use data analytics to inform product decisions?",
        "What metrics do you track to measure the success of a new product launch?",
        "Explain how you would balance technical debt with shipping new features."
      ],
      Hard: [
        "How do you design a go-to-market strategy for a highly technical B2B product?",
        "Describe how you evaluate build vs. buy decisions.",
        "How do you handle managing a product whose architecture is fundamentally flawed?"
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you had to pivot a product strategy based on user feedback.",
        "How do you gather qualitative feedback from users?",
        "Describe a time you successfully managed a cross-functional meeting."
      ],
      Medium: [
        "Describe a situation where you had to say 'no' to an important stakeholder.",
        "How do you align cross-functional teams when there are conflicting priorities?",
        "Tell me about a time a product launch failed. What did you learn?"
      ],
      Hard: [
        "Describe a scenario where you had to launch a product with limited resources.",
        "Tell me about a time you had to kill a beloved feature or product.",
        "How do you handle a scenario where engineering fundamentally disagrees with your roadmap?"
      ]
    },
    HR: {
      Easy: [
        "What drew you to product management?",
        "How do you handle stress and tight deadlines?",
        "What is your favorite product and why?"
      ],
      Medium: [
        "What is your philosophy on product management?",
        "How do you define a great product culture?",
        "How do you measure your own success as a PM?"
      ],
      Hard: [
        "Where do you see yourself in five years?",
        "How do you foster innovation in a slow-moving corporate environment?",
        "What is the biggest challenge facing product managers today?"
      ]
    }
  },
  "UI/UX Designer": {
    Technical: {
      Easy: [
        "Explain your design process from concept to final handoff.",
        "Explain the difference between UX and UI to a non-designer.",
        "What design tools are essential to your workflow?"
      ],
      Medium: [
        "How do you approach conducting user research and usability testing?",
        "How do you ensure your designs are accessible to all users?",
        "Describe your methodology for creating a design system."
      ],
      Hard: [
        "How do you measure the ROI of good UX design?",
        "Describe how you would design an interface for a highly complex data-heavy application.",
        "How do you integrate accessibility standards (WCAG) into enterprise software design?"
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time your design was rejected by stakeholders. How did you react?",
        "How do you handle conflicting feedback from different users?",
        "Describe a time you iterated on a design based on direct user observation."
      ],
      Medium: [
        "Describe a project where user research completely changed your initial design.",
        "Tell me about a time you had to compromise on a design due to technical constraints.",
        "How do you advocate for the user when business goals push in the opposite direction?"
      ],
      Hard: [
        "Describe a situation where you had to design for a completely unfamiliar target audience.",
        "Tell me about a time you had to overhaul a legacy design system while it was still in use.",
        "How do you handle a toxic stakeholder who consistently bypasses your design rationale?"
      ]
    },
    HR: {
      Easy: [
        "What inspires your design work?",
        "What kind of products are you most passionate about designing?",
        "Who is your favorite designer or design agency?"
      ],
      Medium: [
        "How do you stay updated with current design trends?",
        "What is your ideal collaboration process with developers?",
        "How do you handle creative burnout?"
      ],
      Hard: [
        "How do you define a successful design?",
        "Where do you see the future of UI/UX design heading with AI tools?",
        "What does inclusive design mean to you professionally?"
      ]
    }
  },
  "Other": {
    Technical: {
      Easy: [
        "What are the core technical skills required for your profession?",
        "What tools or software do you rely on daily?",
        "Explain a basic concept from your field to a beginner."
      ],
      Medium: [
        "Describe a complex problem you solved recently.",
        "How do you ensure quality in your work?",
        "Explain how you apply best practices in your daily workflow."
      ],
      Hard: [
        "Explain a difficult concept from your field to a beginner.",
        "Describe a time you had to innovate a new process to solve an unprecedented problem.",
        "How do you measure long-term success and scalability in your solutions?"
      ]
    },
    Behavioral: {
      Easy: [
        "Tell me about a time you had to overcome a significant professional obstacle.",
        "How do you handle unexpected changes in a project?",
        "Describe your approach to time management."
      ],
      Medium: [
        "Describe a situation where you had to collaborate with a difficult team member.",
        "Tell me about a time you exceeded expectations.",
        "How do you balance multiple high-priority tasks?"
      ],
      Hard: [
        "Describe a time you had to lead a project without formal authority.",
        "Tell me about a time you failed publicly and how you recovered.",
        "How do you navigate severe organizational changes or layoffs?"
      ]
    },
    HR: {
      Easy: [
        "Why are you interested in this specific field?",
        "What are your greatest professional strengths?",
        "What motivates you to do your best work?"
      ],
      Medium: [
        "What areas are you currently trying to improve?",
        "How do you handle critical feedback?",
        "What is your preferred management style?"
      ],
      Hard: [
        "What is your ultimate career ambition?",
        "How do you assess if a company culture aligns with your values?",
        "What legacy do you want to leave in your professional career?"
      ]
    }
  }
};

const safeGetBank = (role: string, type: string) => {
  const roleBank = QUESTION_BANK[role] || QUESTION_BANK["Other"];
  
  if (type === "Mixed") {
    // Return an object that groups Technical, Behavioral, and HR by difficulty
    const mixedBank: Record<string, string[]> = {
      Easy: [
        ...(roleBank.Technical?.Easy || []),
        ...(roleBank.Behavioral?.Easy || []),
        ...(roleBank.HR?.Easy || [])
      ],
      Medium: [
        ...(roleBank.Technical?.Medium || []),
        ...(roleBank.Behavioral?.Medium || []),
        ...(roleBank.HR?.Medium || [])
      ],
      Hard: [
        ...(roleBank.Technical?.Hard || []),
        ...(roleBank.Behavioral?.Hard || []),
        ...(roleBank.HR?.Hard || [])
      ]
    };
    return mixedBank;
  }
  
  return roleBank[type] || QUESTION_BANK["Other"][type] || QUESTION_BANK["Other"].Behavioral;
};

// Returns a safe selection of questions of a requested difficulty, excluding specific IDs if needed.
export function getQuestionsByDifficulty(config: { role: string, type: string }, count: number, difficulty: string, excludeTexts: string[] = []): Question[] {
  const poolByDifficulty = safeGetBank(config.role, config.type);
  
  // Safe fallback to Medium if requested difficulty doesn't exist
  const pool = poolByDifficulty[difficulty] || poolByDifficulty["Medium"] || poolByDifficulty["Easy"];
  
  let availablePool = pool.filter((qText: string) => !excludeTexts.includes(qText));
  
  // Safe selection: If we run out of unique questions in this difficulty, borrow from adjacent difficulties
  if (availablePool.length < count) {
    const backupTiers = difficulty === "Hard" ? ["Medium", "Easy"] : difficulty === "Medium" ? ["Hard", "Easy"] : ["Medium", "Hard"];
    for (const backup of backupTiers) {
      const backupPool = poolByDifficulty[backup] || [];
      const unusedBackup = backupPool.filter((qText: string) => !excludeTexts.includes(qText) && !availablePool.includes(qText));
      availablePool = [...availablePool, ...unusedBackup];
      if (availablePool.length >= count) break;
    }
  }
  
  const selected: Question[] = [];
  const limit = Math.min(count, availablePool.length);
  
  for (let i = 0; i < limit; i++) {
    let category = config.type;
    if (config.type === "Mixed") {
       category = i % 3 === 0 ? "Technical" : i % 3 === 1 ? "Behavioral" : "HR";
    }
    
    selected.push({
      id: typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(),
      text: availablePool[i],
      category,
      difficulty
    });
  }
  
  return selected;
}

export function getQuestions(config: InterviewConfig): Question[] {
  const questions = getQuestionsByDifficulty(config, config.questions, config.difficulty, []);
  
  return questions.map((q, i) => ({
    ...q,
    id: `q-${i + 1}`
  }));
}

export function evaluateAnswer(answer: string): string {
  const words = answer.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  if (words === 0) return "No answer provided.";
  
  if (words < 15) {
    return "Answer submitted. Consider adding more detail to fully explain your thought process.";
  }
  
  const hasExample = /example|instance|such as|for instance|specifically|built|created|led|managed|because/i.test(answer);
  
  if (!hasExample && words < 40) {
    return "Answer submitted. Consider adding a concrete example from your past experience to support your answer.";
  }
  
  return "Answer submitted. Good level of detail and clear explanation.";
}
