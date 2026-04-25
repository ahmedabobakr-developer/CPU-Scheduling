function showError(message) {
    const errorMsg = document.getElementById('error-message');
    errorMsg.textContent = message;
    errorMsg.classList.remove('hidden');
    setTimeout(function() {
        errorMsg.classList.add('hidden');
    }, 3000);
}