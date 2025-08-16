function showToaster(message, type) {
  const colors = {
    error: 'bg-red-500',
    success: 'bg-green-500',
    info: 'bg-blue-500'
  };
  const toaster = document.createElement('div');
  toaster.className = `fixed top-4 right-4 p-4 rounded-lg shadow-lg ${colors[type] || 'bg-gray-500'} text-white`;
  toaster.textContent = message;
  document.body.appendChild(toaster);
  setTimeout(() => {
    toaster.remove();
  }, 3000);
}