import { evaluateInterviewAnswer } from './lib/ai/gemini.js';

async function test() {
  try {
    const res = await evaluateInterviewAnswer("What is Virtual DOM?", "It is a lightweight copy of the DOM.", "Frontend", "Mid", "Tech", "Hard");
    console.log(res);
  } catch (e) {
    console.error(e);
  }
}

test();
