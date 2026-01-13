type Task = () => Promise<any>;
const queue: Task[] = [];
let running = false;
export const queueService = {
  add: async (task: Task) => { queue.push(task); if (!running) processQueue(); },
};
async function processQueue() { running = true; while (queue.length) { const task = queue.shift(); if (task) await task(); } running = false; }
