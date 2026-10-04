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
}

const QUESTION_BANK: Record<string, Record<string, string[]>> = {
  "Frontend Developer": {
    Technical: [
      "Explain the difference between client-side routing and server-side routing.",
      "How does React's Virtual DOM work and why is it useful?",
      "Describe how you would optimize the performance of a heavy web application.",
      "What are CSS modules and what problem do they solve?",
      "How do you handle state management in a large Frontend application?"
    ],
    Behavioral: [
      "Tell me about a time you disagreed with a designer. How did you resolve it?",
      "Describe a project where you had to learn a new frontend framework quickly.",
      "How do you prioritize accessibility in your daily development?",
      "Tell me about a time you had to refactor a messy legacy codebase.",
      "Describe a situation where a critical bug was found in production due to your code."
    ],
    HR: [
      "What drew you to frontend development over other fields?",
      "Where do you see your frontend skills progressing in the next two years?",
      "What kind of team environment do you thrive in?",
      "How do you stay updated with the fast-moving JavaScript ecosystem?",
      "What is your preferred working style when collaborating with a team?"
    ]
  },
  "Backend Developer": {
    Technical: [
      "Explain the differences between REST and GraphQL.",
      "How would you design a scalable database schema for an e-commerce platform?",
      "What are the pros and cons of microservices vs a monolithic architecture?",
      "Describe a strategy for securing a public-facing API.",
      "How do you handle asynchronous background processing in a backend system?"
    ],
    Behavioral: [
      "Tell me about a time you had to deal with a severe database performance issue.",
      "Describe a scenario where you disagreed with another engineer over an API design.",
      "How do you handle requirements that change midway through a sprint?",
      "Tell me about a time you mentored a junior backend developer.",
      "Describe a project where you successfully mitigated a security vulnerability."
    ],
    HR: [
      "What is your ideal ratio of architectural design vs actual coding?",
      "How do you handle technical debt in a fast-paced startup environment?",
      "What motivates you to work in backend engineering?",
      "How do you prefer to receive constructive feedback?",
      "What qualities make a great engineering manager in your eyes?"
    ]
  },
  "Full Stack Developer": {
    Technical: [
      "How do you manage data synchronization between a client state and a backend database?",
      "Describe a strategy to implement robust authentication across both frontend and backend.",
      "What considerations do you make when deciding where to put business logic?",
      "Explain how Server-Side Rendering (SSR) impacts both backend load and frontend performance.",
      "How do you handle deployment and CI/CD for a full stack application?"
    ],
    Behavioral: [
      "Tell me about a time you had to wear many hats to get a feature shipped.",
      "Describe a project where the frontend and backend teams were misaligned, and how you bridged the gap.",
      "How do you prioritize when both the UI and the database urgently need optimization?",
      "Tell me about a difficult technical compromise you had to make.",
      "Describe a situation where you had to push back on a product requirement."
    ],
    HR: [
      "Do you lean more towards frontend or backend, and why?",
      "How do you balance learning new UI libraries vs backend frameworks?",
      "What are your long-term career goals as a Full Stack Developer?",
      "How do you handle context-switching between different parts of the stack?",
      "What does 'full stack' mean to you in a modern engineering team?"
    ]
  },
  "Software Engineer": {
    Technical: [
      "Explain the concept of time and space complexity with an example.",
      "Describe how you would approach designing a system like Twitter.",
      "What design patterns do you use most frequently and why?",
      "How do you ensure thread safety in a concurrent application?",
      "Explain the concept of continuous integration and its benefits."
    ],
    Behavioral: [
      "Tell me about a time you had to learn a completely new programming language for a project.",
      "Describe a scenario where you failed to meet a deadline. What happened?",
      "How do you handle negative feedback during a code review?",
      "Tell me about a time you significantly improved the performance of a system.",
      "Describe a situation where you had to debug a complex issue under pressure."
    ],
    HR: [
      "What are you looking for in your next engineering role?",
      "How do you define success in a software project?",
      "What is your preferred methodology for software development?",
      "How do you approach self-improvement as an engineer?",
      "What values are most important to you in a company's engineering culture?"
    ]
  },
  "Data Analyst": {
    Technical: [
      "Explain the difference between a left join and an inner join in SQL.",
      "Describe a time you used statistical analysis to solve a business problem.",
      "How do you handle missing or corrupted data in a dataset?",
      "What visualization tools are you most comfortable with and why?",
      "Explain the concept of A/B testing and how you ensure statistical significance."
    ],
    Behavioral: [
      "Tell me about a time your data analysis contradicted a stakeholder's assumption.",
      "Describe a project where the data was extremely messy. How did you handle it?",
      "How do you communicate complex data findings to non-technical audiences?",
      "Tell me about a time you found a critical error in your analysis after sharing it.",
      "Describe a situation where you had to gather data from multiple fragmented sources."
    ],
    HR: [
      "What aspect of data analysis do you find most rewarding?",
      "How do you stay updated with new data tools and methodologies?",
      "What kind of industry or data domain interests you the most?",
      "How do you prefer to collaborate with business stakeholders?",
      "What are your long-term goals in the data field?"
    ]
  },
  "Product Manager": {
    Technical: [
      "How do you approach writing technical requirements for an engineering team?",
      "Describe your process for prioritizing the product backlog.",
      "How do you use data analytics to inform product decisions?",
      "Explain how you would balance technical debt with shipping new features.",
      "What metrics do you track to measure the success of a new product launch?"
    ],
    Behavioral: [
      "Tell me about a time a product launch failed. What did you learn?",
      "Describe a situation where you had to say 'no' to an important stakeholder.",
      "How do you align cross-functional teams when there are conflicting priorities?",
      "Tell me about a time you had to pivot a product strategy based on user feedback.",
      "Describe a scenario where you had to launch a product with limited resources."
    ],
    HR: [
      "What is your philosophy on product management?",
      "How do you define a great product culture?",
      "What drew you to product management?",
      "How do you handle stress and tight deadlines?",
      "Where do you see yourself in five years?"
    ]
  },
  "UI/UX Designer": {
    Technical: [
      "Explain your design process from concept to final handoff.",
      "How do you approach conducting user research and usability testing?",
      "Describe your methodology for creating a design system.",
      "How do you ensure your designs are accessible to all users?",
      "Explain the difference between UX and UI to a non-designer."
    ],
    Behavioral: [
      "Tell me about a time your design was rejected by stakeholders. How did you react?",
      "Describe a project where user research completely changed your initial design.",
      "How do you handle conflicting feedback from different users?",
      "Tell me about a time you had to compromise on a design due to technical constraints.",
      "Describe a situation where you had to design for a completely unfamiliar target audience."
    ],
    HR: [
      "What inspires your design work?",
      "How do you stay updated with current design trends?",
      "What is your ideal collaboration process with developers?",
      "What kind of products are you most passionate about designing?",
      "How do you define a successful design?"
    ]
  },
  "Other": {
    Technical: [
      "What are the core technical skills required for your profession?",
      "Describe a complex problem you solved recently.",
      "How do you ensure quality in your work?",
      "What tools or software do you rely on daily?",
      "Explain a difficult concept from your field to a beginner."
    ],
    Behavioral: [
      "Tell me about a time you had to overcome a significant professional obstacle.",
      "Describe a situation where you had to collaborate with a difficult team member.",
      "How do you handle unexpected changes in a project?",
      "Tell me about a time you exceeded expectations.",
      "Describe a time you had to lead a project without formal authority."
    ],
    HR: [
      "Why are you interested in this specific field?",
      "What are your greatest professional strengths?",
      "What areas are you currently trying to improve?",
      "How do you handle critical feedback?",
      "What motivates you to do your best work?"
    ]
  }
};

// Fill missing categories by defaulting to "Other"
const safeGetBank = (role: string, type: string) => {
  const roleBank = QUESTION_BANK[role] || QUESTION_BANK["Other"];
  
  if (type === "Mixed") {
    // For Mixed, combine Technical, Behavioral, and HR
    return [
      ...(roleBank.Technical || QUESTION_BANK["Other"].Technical),
      ...(roleBank.Behavioral || QUESTION_BANK["Other"].Behavioral),
      ...(roleBank.HR || QUESTION_BANK["Other"].HR)
    ];
  }
  
  return roleBank[type] || QUESTION_BANK["Other"][type] || QUESTION_BANK["Other"].Behavioral;
};

export function getQuestions(config: InterviewConfig): Question[] {
  const pool = safeGetBank(config.role, config.type);
  
  // Deterministic selection based on config to keep it stable
  // We use a simple modulus to pick questions
  const selected: Question[] = [];
  const totalAvailable = pool.length;
  
  for (let i = 0; i < config.questions; i++) {
    // If we request more questions than available, we loop around
    const index = i % totalAvailable;
    selected.push({
      id: `q-${i + 1}`,
      text: pool[index],
      category: config.type === "Mixed" ? 
        (i % 3 === 0 ? "Technical" : i % 3 === 1 ? "Behavioral" : "HR") 
        : config.type
    });
  }
  
  return selected;
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
