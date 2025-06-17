
// Global function to go to main page when title is clicked
window.goToMainPage = () => {
  if (legalPagesManager) {
    legalPagesManager.showMainView();
  }
};
