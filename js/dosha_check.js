const { createApp, ref, computed, watch, onMounted } = Vue;

createApp({
    setup() {
        // State
        const quizStarted = ref(false);
        const currentQuestionIndex = ref(0);
        const showResults = ref(false);
        const showExitDialog = ref(false);
        const answers = ref([]);
        const transitionDirection = ref('slide-left');
        const savedProgress = ref(null);
        const isSendingEmail = ref(false);

        // Questions Data
        const questions = ref([
            {
                title: 'FRAME',
                options: [
                    { text: 'I have a naturally slender frame with visible joints and lean muscle.', value: 'A' },
                    { text: 'I have a balanced, medium build with good muscle tone.', value: 'B' },
                    { text: 'I have a fuller or sturdier build.', value: 'C' }
                ]
            },
            {
                title: 'SKIN',
                options: [
                    { text: 'My skin tends to feel dry and rough.', value: 'A' },
                    { text: 'My skin is warm, often flushed, and can be sensitive or easily irritated.', value: 'B' },
                    { text: 'My skin is moist and oily.', value: 'C' }
                ]
            },
            {
                title: 'HAIR',
                options: [
                    { text: 'My hair is dry, frizzy, or prone to breakage.', value: 'A' },
                    { text: 'My hair is fine, thinning, or grays earlier than expected.', value: 'B' },
                    { text: 'My hair is thick and wavy.', value: 'C' }
                ]
            },
            {
                title: 'EYES',
                options: [
                    { text: 'My eyes are smaller and quick-moving.', value: 'A' },
                    { text: 'I have a sharp, focused, or intense gaze.', value: 'B' },
                    { text: 'I have large, soft, and gentle eyes.', value: 'C' }
                ]
            },
            {
                title: 'JOINTS',
                options: [
                    { text: 'My joints are narrow, visible, and tend to crack or pop.', value: 'A' },
                    { text: 'My joints are loose and flexible.', value: 'B' },
                    { text: 'My joints are large, well knit, and firm.', value: 'C' }
                ]
            },
            {
                title: 'BODY TEMPERATURE',
                options: [
                    { text: 'My hands and feet are usually cold and I prefer warm environments.', value: 'A' },
                    { text: 'I tend to run warm and prefer cooler environments.', value: 'B' },
                    { text: 'I do well in most temperatures but dislike cold, damp weather.', value: 'C' }
                ]
            },
            {
                title: 'STRESS',
                options: [
                    { text: 'When stressed, I become anxious or worried.', value: 'A' },
                    { text: 'When stressed, I become irritable, intense, or easily frustrated.', value: 'B' },
                    { text: 'When stressed, I withdraw, shut down, or feel heavy.', value: 'C' }
                ]
            },
            {
                title: 'SLEEP',
                options: [
                    { text: 'I am a light sleeper with a tendency to awaken easily.', value: 'A' },
                    { text: 'I am a moderately sound sleeper, usually needing less than eight hours to feel rested, but I have vivid dreams.', value: 'B' },
                    { text: 'My sleep is deep and long, and I tend to awaken slowly in the morning.', value: 'C' }
                ]
            },
            {
                title: 'WEATHER',
                options: [
                    { text: 'I least enjoy cold weather.', value: 'A' },
                    { text: 'I least enjoy hot weather.', value: 'B' },
                    { text: 'I least enjoy damp or rainy weather.', value: 'C' }
                ]
            },
            {
                title: 'WEIGHT',
                options: [
                    { text: 'I tend to lose weight easily.', value: 'A' },
                    { text: 'My weight stays fairly stable.', value: 'B' },
                    { text: 'I gain weight easily.', value: 'C' }
                ]
            },
            {
                title: 'PERSONALITY',
                options: [
                    { text: "I'm naturally enthusiastic and adaptable. I enjoy change and variety.", value: 'A' },
                    { text: "I'm focused and driven. I like structure, efficiency, and results.", value: 'B' },
                    { text: "I'm calm and nurturing. I value comfort, connection, and consistency.", value: 'C' }
                ]
            },
            {
                title: 'DIGESTION',
                options: [
                    { text: 'My bowel movements are often dry or irregular, with occasional constipation.', value: 'A' },
                    { text: 'My bowel movements tend to be loose with occasional diarrhea.', value: 'B' },
                    { text: 'My bowel movements tend to be well formed or sticky with occasional constipation.', value: 'C' }
                ]
            },
            {
                title: 'ACTIVITY STYLE',
                options: [
                    { text: 'I enjoy constant movement and find it hard to sit still.', value: 'A' },
                    { text: "I enjoy purposeful, goal-oriented activity, especially when it's challenging.", value: 'B' },
                    { text: 'I prefer slow, relaxed activities and being at home.', value: 'C' }
                ]
            },
            {
                title: 'WALK',
                options: [
                    { text: 'I walk quickly.', value: 'A' },
                    { text: 'I walk with intention and determination.', value: 'B' },
                    { text: 'I walk slowly, steadily, and at an easy pace.', value: 'C' }
                ]
            },
            {
                title: 'MOODS',
                options: [
                    { text: 'My moods shift quickly, often leaning toward worry or nervousness.', value: 'A' },
                    { text: "My moods change more slowly, but when upset, anger rises quickly.", value: 'B' },
                    { text: "My moods are mostly steady and most things don't bother me.", value: 'C' }
                ]
            },
            {
                title: 'MEMORY',
                options: [
                    { text: 'I learn quickly and forget quickly.', value: 'A' },
                    { text: 'I have a good memory.', value: 'B' },
                    { text: 'I learn slowly but have a good long-term memory.', value: 'C' }
                ]
            },
            {
                title: 'ORGANIZATION',
                options: [
                    { text: "I'm great at starting things but struggle to finish.", value: 'A' },
                    { text: 'I am organized and can focus on a project from start to finish.', value: 'B' },
                    { text: "I may need help getting started, but I'm steady and follow through.", value: 'C' }
                ]
            },
            {
                title: 'MONEY',
                options: [
                    { text: 'Money tends to flow out as quickly as it comes in.', value: 'A' },
                    { text: 'Financial security and quality purchases are important to me.', value: 'B' },
                    { text: 'I prefer saving money and spending cautiously.', value: 'C' }
                ]
            },
            {
                title: 'IN RELATIONSHIPS, I USUALLY ASK...',
                options: [
                    { text: 'What is wrong with me?', value: 'A' },
                    { text: 'What is wrong with you?', value: 'B' },
                    { text: 'Are you sure there is something wrong?', value: 'C' }
                ]
            },
            {
                title: 'OUT OF BALANCE, I FEEL LIKE...',
                options: [
                    { text: 'A leaf carried by the wind', value: 'A' },
                    { text: 'A fire burning out of control', value: 'B' },
                    { text: 'A body stuck in stillness', value: 'C' }
                ]
            },
            {
                title: 'MY MOTTO IN LIFE IS...',
                options: [
                    { text: 'Live fully and figure it out as you go.', value: 'A' },
                    { text: 'No pain, no gain.', value: 'B' },
                    { text: "Don't worry, be happy.", value: 'C' }
                ]
            }
        ]);

        // Computed Properties
        const progressPercentage = computed(() => {
            return Math.round(((currentQuestionIndex.value + 1) / questions.value.length) * 100);
        });

        const answeredCount = computed(() => {
            return answers.value.filter(a => a !== null && a !== undefined).length;
        });

        const results = computed(() => {
            const counts = { A: 0, B: 0, C: 0 };
            
            answers.value.forEach(answer => {
                if (answer && counts.hasOwnProperty(answer)) {
                    counts[answer]++;
                }
            });

            const total = counts.A + counts.B + counts.C;
            
            const percentages = {
                A: total ? Math.round((counts.A / total) * 100) : 0,
                B: total ? Math.round((counts.B / total) * 100) : 0,
                C: total ? Math.round((counts.C / total) * 100) : 0
            };

            let interpretation = '';
            let primaryDosha = '';
            
            if (counts.A > counts.B && counts.A > counts.C) {
                interpretation = '<strong>You are primarily Vata.</strong> Vata types are creative, energetic, and quick-thinking, but may struggle with anxiety and irregularity when out of balance.';
                primaryDosha = 'Vata';
            } else if (counts.B > counts.A && counts.B > counts.C) {
                interpretation = '<strong>You are primarily Pitta.</strong> Pitta types are focused, ambitious, and intelligent, but may struggle with irritability and intensity when out of balance.';
                primaryDosha = 'Pitta';
            } else if (counts.C > counts.A && counts.C > counts.B) {
                interpretation = '<strong>You are primarily Kapha.</strong> Kapha types are calm, loving, and stable, but may struggle with lethargy and attachment when out of balance.';
                primaryDosha = 'Kapha';
            } else {
                if (counts.A === counts.B && counts.A > counts.C) {
                    interpretation = '<strong>You are a Vata-Pitta blend.</strong> You have qualities of both Vata and Pitta.';
                    primaryDosha = 'Vata-Pitta';
                } else if (counts.A === counts.C && counts.A > counts.B) {
                    interpretation = '<strong>You are a Vata-Kapha blend.</strong> You have qualities of both Vata and Kapha.';
                    primaryDosha = 'Vata-Kapha';
                } else if (counts.B === counts.C && counts.B > counts.A) {
                    interpretation = '<strong>You are a Pitta-Kapha blend.</strong> You have qualities of both Pitta and Kapha.';
                    primaryDosha = 'Pitta-Kapha';
                } else {
                    interpretation = '<strong>You are Tridoshic.</strong> Your scores are nearly equal across all three Doshas—a rare but beautiful balance.';
                    primaryDosha = 'Tridoshic';
                }
            }

            return {
                counts,
                primaryDosha,
                bars: [
                    { label: 'Vata (A)', count: counts.A, percentage: percentages.A },
                    { label: 'Pitta (B)', count: counts.B, percentage: percentages.B },
                    { label: 'Kapha (C)', count: counts.C, percentage: percentages.C }
                ],
                interpretation
            };
        });

        // Watch for answers changes to save progress
        watch(answers, (newAnswers) => {
            if (quizStarted.value) {
                localStorage.setItem('doshaQuizProgress', JSON.stringify({
                    answers: newAnswers,
                    currentIndex: currentQuestionIndex.value
                }));
            }
        }, { deep: true });

        // Methods
        const startQuiz = () => {
            quizStarted.value = true;
            
            // Check for saved progress
            const saved = localStorage.getItem('doshaQuizProgress');
            if (saved) {
                try {
                    const progress = JSON.parse(saved);
                    const shouldRestore = confirm('You have a saved quiz in progress. Would you like to continue where you left off?');
                    if (shouldRestore) {
                        answers.value = progress.answers || new Array(questions.value.length).fill(null);
                        currentQuestionIndex.value = progress.currentIndex || 0;
                        showToastMessage('Progress restored!', 'success');
                    } else {
                        // Clear saved progress and start fresh
                        localStorage.removeItem('doshaQuizProgress');
                        answers.value = new Array(questions.value.length).fill(null);
                        currentQuestionIndex.value = 0;
                    }
                } catch (e) {
                    // If error parsing saved data, start fresh
                    answers.value = new Array(questions.value.length).fill(null);
                }
            } else {
                answers.value = new Array(questions.value.length).fill(null);
            }
        };

        const nextQuestion = () => {
            if (!answers.value[currentQuestionIndex.value]) {
                showToastMessage('Please select an answer before continuing', 'error');
                
                // Highlight unanswered question
                const questionCard = document.querySelector('.bg-gray-50');
                if (questionCard) {
                    questionCard.style.borderColor = '#dc2626';
                    questionCard.style.transition = 'border-color 0.3s ease';
                    setTimeout(() => {
                        questionCard.style.borderColor = answers.value[currentQuestionIndex.value] ? '#6C9571' : 'transparent';
                    }, 1000);
                }
                return;
            }
            
            if (currentQuestionIndex.value < questions.value.length - 1) {
                transitionDirection.value = 'slide-left';
                currentQuestionIndex.value++;
            }
        };

        const previousQuestion = () => {
            if (currentQuestionIndex.value > 0) {
                transitionDirection.value = 'slide-right';
                currentQuestionIndex.value--;
            }
        };

        const jumpToQuestion = (index) => {
            if (index === currentQuestionIndex.value) return;
            
            // Set transition direction based on whether we're going forward or backward
            transitionDirection.value = index > currentQuestionIndex.value ? 'slide-left' : 'slide-right';
            currentQuestionIndex.value = index;
        };

        const submitQuiz = async () => {
            // Check if all questions are answered
            const unansweredIndex = answers.value.findIndex(answer => answer === null || answer === undefined);
            
            if (unansweredIndex !== -1) {
                jumpToQuestion(unansweredIndex);
                showToastMessage('Please answer all questions before submitting', 'error');
                
                setTimeout(() => {
                    const questionCard = document.querySelector('.bg-gray-50');
                    if (questionCard) {
                        questionCard.style.borderColor = '#dc2626';
                        setTimeout(() => {
                            questionCard.style.borderColor = 'transparent';
                        }, 1000);
                    }
                }, 300);
                
                return;
            }

            // Show results
            showResults.value = true;
            
            // Clear saved progress since quiz is complete
            localStorage.removeItem('doshaQuizProgress');

            // Send email with results (don't await - let it happen in background)
            const userEmail = localStorage.getItem('quizEmail');
            if (userEmail) {
                isSendingEmail.value = true;
                showToastMessage('Sending your results via email...', 'info');
                
                // Send email in background without blocking
                sendResultsEmail(userEmail).finally(() => {
                    isSendingEmail.value = false;
                });
            } else {
                showToastMessage('No email found. Please return to the home page and enter your email for future sessions.', 'warning');
            }
        };

        // Separate function to send email
        const sendResultsEmail = async (userEmail) => {
            try {
                console.log('Sending dosha results email to:', userEmail);
                console.log('Results:', results.value);
                
                const response = await fetch('/.netlify/functions/send-dosha-results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userEmail: userEmail,
                        results: {
                            counts: results.value.counts,
                            primaryDosha: results.value.primaryDosha,
                            bars: results.value.bars,
                            interpretation: results.value.interpretation
                        },
                        userName: userEmail ? userEmail.split('@')[0] : 'there'
                    })
                });
                
                // Get response text first for debugging
                const responseText = await response.text();
                console.log('Raw response:', responseText);
                
                // Try to parse as JSON
                let data;
                try {
                    data = JSON.parse(responseText);
                } catch (e) {
                    console.error('Failed to parse response as JSON:', responseText);
                    throw new Error('Invalid response from server');
                }
                
                if (response.ok) {
                    showToastMessage('Your dosha results have been sent to your email!', 'success');
                    console.log('Email sent successfully:', data);
                } else {
                    throw new Error(data.error || `Server error: ${response.status}`);
                }
            } catch (error) {
                console.error('Error sending email:', error);
                console.error('Error details:', {
                    message: error.message,
                    stack: error.stack
                });
                showToastMessage('Could not send email. You can still view your results below.', 'error');
            }
        };

        const exitQuiz = () => {
            showExitDialog.value = false;
            
            // Clear saved progress
            localStorage.removeItem('doshaQuizProgress');
            
            // Reset quiz state
            quizStarted.value = false;
            currentQuestionIndex.value = 0;
            answers.value = [];
            
            showToastMessage('Quiz progress cleared', 'info');
        };

        const restartQuiz = () => {
            if (confirm('Are you sure you want to retake the quiz? Your current results will be lost.')) {
                showResults.value = false;
                answers.value = new Array(questions.value.length).fill(null);
                currentQuestionIndex.value = 0;
                showToastMessage('Starting quiz over', 'info');
            }
        };

        const closeModal = () => {
            showResults.value = false;
        };

        const goHome = () => {
            window.location.href = '../index.html';
        };

        const printResults = () => {
            window.print();
        };

        // Toast notification system
        const showToastMessage = (message, type = 'info') => {
            // Remove any existing toast
            const existingToast = document.querySelector('.toast');
            if (existingToast) {
                existingToast.remove();
            }

            // Create new toast
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;
            toast.textContent = message;
            toast.style.cssText = `
                position: fixed;
                bottom: 30px;
                left: 50%;
                transform: translateX(-50%);
                background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#10b981' : type === 'warning' ? '#f59e0b' : '#6C9571'};
                color: white;
                padding: 12px 24px;
                border-radius: 50px;
                font-family: 'Poppins', sans-serif;
                font-size: 0.9rem;
                box-shadow: 0 5px 20px rgba(0,0,0,0.2);
                z-index: 2000;
                animation: slideUp 0.3s ease;
            `;
            
            document.body.appendChild(toast);

            // Auto remove after 3 seconds
            setTimeout(() => {
                toast.style.animation = 'slideDown 0.3s ease';
                setTimeout(() => {
                    if (toast.parentNode) {
                        toast.remove();
                    }
                }, 300);
            }, 3000);
        };

        // Keyboard navigation
        const setupKeyboardNavigation = () => {
            document.addEventListener('keydown', (e) => {
                if (!quizStarted.value || showResults.value || showExitDialog.value) return;

                // Don't navigate if user is typing in an input
                if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
                    if (e.key === 'ArrowRight') {
                        e.preventDefault();
                        nextQuestion();
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        previousQuestion();
                    } else if (e.key === 'Escape') {
                        showExitDialog.value = true;
                    }
                }
            });
        };

        // Add animation styles if they don't exist
        const addAnimationStyles = () => {
            if (!document.querySelector('#toast-animations')) {
                const style = document.createElement('style');
                style.id = 'toast-animations';
                style.textContent = `
                    @keyframes slideUp {
                        from {
                            transform: translate(-50%, 100%);
                            opacity: 0;
                        }
                        to {
                            transform: translate(-50%, 0);
                            opacity: 1;
                        }
                    }
                    
                    @keyframes slideDown {
                        from {
                            transform: translate(-50%, 0);
                            opacity: 1;
                        }
                        to {
                            transform: translate(-50%, 100%);
                            opacity: 0;
                        }
                    }
                    
                    .slide-left-enter-active,
                    .slide-left-leave-active,
                    .slide-right-enter-active,
                    .slide-right-leave-active {
                        transition: all 0.3s ease;
                        position: absolute;
                        width: 100%;
                    }
                    
                    .slide-left-enter-from {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    
                    .slide-left-leave-to {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    
                    .slide-right-enter-from {
                        opacity: 0;
                        transform: translateX(-30px);
                    }
                    
                    .slide-right-leave-to {
                        opacity: 0;
                        transform: translateX(30px);
                    }
                    
                    .modal-enter-active,
                    .modal-leave-active {
                        transition: all 0.3s ease;
                    }
                    
                    .modal-enter-from,
                    .modal-leave-to {
                        opacity: 0;
                        transform: scale(0.9);
                    }
                `;
                document.head.appendChild(style);
            }
        };

        // Initialize
        onMounted(() => {
            setupKeyboardNavigation();
            addAnimationStyles();
        });

        return {
            // State
            quizStarted,
            currentQuestionIndex,
            showResults,
            showExitDialog,
            answers,
            questions,
            transitionDirection,
            isSendingEmail,
            
            // Computed
            progressPercentage,
            answeredCount,
            results,
            
            // Methods
            startQuiz,
            nextQuestion,
            previousQuestion,
            jumpToQuestion,
            submitQuiz,
            exitQuiz,
            restartQuiz,
            closeModal,
            goHome,
            printResults
        };
    }
}).mount('#app');