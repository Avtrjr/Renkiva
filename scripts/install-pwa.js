// PWA Installation helper
let deferredPrompt;
let installButton;

// Listen for the beforeinstallprompt event
window.addEventListener('beforeinstallprompt', (e) => {
  console.log('PWA install prompt triggered');
  // Prevent the mini-infobar from appearing on mobile
  e.preventDefault();
  // Stash the event so it can be triggered later
  deferredPrompt = e;
  // Show install button
  showInstallButton();
});

function showInstallButton() {
  // Create install button if it doesn't exist
  if (!installButton) {
    installButton = document.createElement('button');
    installButton.textContent = 'Install MeshTV';
    installButton.className = 'fixed bottom-4 right-4 bg-primary text-primary-foreground px-4 py-2 rounded-lg shadow-lg z-50 transition-all hover:bg-primary/90';
    installButton.addEventListener('click', installPWA);
    document.body.appendChild(installButton);
  }
  installButton.style.display = 'block';
}

async function installPWA() {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return;
  }
  
  // Show the install prompt
  deferredPrompt.prompt();
  
  // Wait for the user to respond to the prompt
  const { outcome } = await deferredPrompt.userChoice;
  console.log(`PWA install outcome: ${outcome}`);
  
  // Clear the deferredPrompt
  deferredPrompt = null;
  
  // Hide the install button
  if (installButton) {
    installButton.style.display = 'none';
  }
}

// Listen for successful installation
window.addEventListener('appinstalled', () => {
  console.log('PWA was installed successfully');
  // Hide install button
  if (installButton) {
    installButton.style.display = 'none';
  }
});

// Export for use in React components
window.MeshTVPWA = {
  installPWA,
  isInstallable: () => !!deferredPrompt
};