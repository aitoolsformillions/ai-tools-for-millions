export type Tool = {slug:string;name:string;category:string;summary:string;pricing:string;rating:number;bestFor:string};
export const tools: Tool[] = [
  {slug:'chatgpt',name:'ChatGPT',category:'AI Assistant',summary:'General-purpose assistant for writing, research, planning, and analysis.',pricing:'Freemium',rating:4.8,bestFor:'Everyday productivity'},
  {slug:'claude',name:'Claude',category:'Writing & Analysis',summary:'Long-context assistant for thoughtful writing, documents, and analysis.',pricing:'Freemium',rating:4.7,bestFor:'Long documents'},
  {slug:'perplexity',name:'Perplexity',category:'Research',summary:'AI-powered search and research with source-linked answers.',pricing:'Freemium',rating:4.6,bestFor:'Web research'},
  {slug:'runway',name:'Runway',category:'Video',summary:'Generative video creation and AI-assisted video editing tools.',pricing:'Freemium',rating:4.5,bestFor:'Visual creators'}
];
