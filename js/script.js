// Wait for DOM to load
document.addEventListener('DOMContentLoaded', function() {
    const emailModal = document.getElementById('emailModal');
    const closeModal = document.querySelector('.close-modal');
    const startQuizBtns = document.querySelectorAll('.start-quiz');
    const emailForm = document.getElementById('emailForm');
    
    let selectedQuiz = '';

    // Open modal when quiz is selected
    startQuizBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            selectedQuiz = this.dataset.quiz;
            emailModal.classList.remove('hidden');
        });
    });

    // Close modal
    closeModal.addEventListener('click', function() {
        emailModal.classList.add('hidden');
    });

    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        if (e.target === emailModal) {
            emailModal.classList.add('hidden');
        }
    });

    // Handle email submission and redirect
    emailForm.addEventListener('submit', function(e) {
        e.preventDefault();
        const email = document.getElementById('email').value;
        
        // Store email
        localStorage.setItem('quizEmail', email);
        
        // Redirect based on selected quiz
        if (selectedQuiz === 'dosha') {
            window.location.href = 'html/dosha_check.html';
        } else if (selectedQuiz === 'stress') {
            window.location.href = 'html/stress_pattern.html';
        }
    });

    // Check if email exists in localStorage (optional - for returning users)
    const savedEmail = localStorage.getItem('quizEmail');
    if (savedEmail) {
        // You could pre-fill the email field if needed
        console.log('Returning user:', savedEmail);
    }
});