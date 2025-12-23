const ctx: Worker = self as any;

ctx.onmessage = async (e: MessageEvent) => {
  const { type, payload } = e.data;
  
  switch (type) {
    case 'SHOW_NOTIFICATION':
      await showNotification(payload);
      break;
    case 'CHECK_PERMISSION':
      checkPermission();
      break;
  }
};

async function showNotification(data: { title: string; body: string; icon?: string }) {
  if (Notification.permission === 'granted') {
    new Notification(data.title, { body: data.body, icon: data.icon });
  }
}

function checkPermission() {
  ctx.postMessage({ type: 'PERMISSION_STATUS', payload: { permission: Notification.permission } });
}

export {};
