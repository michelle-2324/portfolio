//import fs from 'fs';
import * as fs from 'fs/promises';

// tsc javascript/ai_assistant.ts 

let prompt = "";
let readFileStr = "";
const fileList = ['./project-group1_data.json', './project-group2_data.json', './project-group3_data.json'];

function askForAiAssistant(prompt: string) {
  // readFile();

  let msg = [
    {
      "role": "system", 
      "content": "Answer questions related to " + readFileStr + "."},
    {"role": "user", "content": prompt}
  ];
  
  fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer `,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      "model": "mistralai/mistral-7b-instruct:free",
      "messages": msg,
    })
  }).then(response => response.json())
  .then(data => {
    const responseArea = document.getElementById('responseArea')!;
    if (responseArea) {
      responseArea.textContent = data.response;
    }
  })
  .catch(error => {
    console.error('Error:', error);
  });
};

async function readFile() {
  try {
    for (const file of fileList) {
        const data = await fs.readFile(file, 'utf8');
        const jsonData = JSON.parse(data);
        console.log(jsonData);
        readFileStr += jsonData;
    }
  } catch (err) {
      console.error('Error:', err);
  }
}



