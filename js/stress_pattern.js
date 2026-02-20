const { createApp, ref, computed, watch, onMounted } = Vue;

createApp({
    setup() {
        // State
        const quizStarted = ref(false);
        const currentSection = ref(0);
        const showResults = ref(false);
        const showExitDialog = ref(false);
        const transitionDirection = ref('slide-left');
        const isSendingEmail = ref(false);

        // Pattern Categories Data - directly from your content
        const patternCategories = ref([
            {
                name: 'Emotional & Mental',
                shortName: 'Emotional',
                emoji: '💭',
                patterns: [
                    { text: 'I woke up feeling anxious or tense', checked: false },
                    { text: 'I felt guilty when I wasn\'t being "productive"', checked: false },
                    { text: 'My mind felt constantly "on" or hard to quiet', checked: false },
                    { text: 'I felt easily irritated by small things', checked: false },
                    { text: 'I found myself overthinking or overanalyzing minor decisions', checked: false },
                    { text: 'I felt emotionally numb or disconnected from things I usually care about', checked: false },
                    { text: 'I snapped at someone over something small', checked: false },
                    { text: 'I had trouble finding joy or gratitude in small daily moments', checked: false },
                    { text: 'I had trouble feeling motivated or focused, even for things I enjoy', checked: false }
                ]
            },
            {
                name: 'Digital & Informational',
                shortName: 'Digital',
                emoji: '📱',
                patterns: [
                    { text: 'I reached for my phone when I felt overwhelmed or bored', checked: false },
                    { text: 'I checked email or messages even when I didn\'t need to', checked: false },
                    { text: 'I felt overstimulated after scrolling or checking multiple apps', checked: false },
                    { text: 'I struggled to focus after spending time online', checked: false },
                    { text: 'I consumed information (podcasts, videos, articles) even when my brain felt full', checked: false },
                    { text: 'I had trouble unplugging or setting boundaries with tech', checked: false },
                    { text: 'I felt "behind" on messages, notifications, or news', checked: false },
                    { text: 'I scrolled or watched something late at night instead of sleeping', checked: false }
                ]
            },
            {
                name: 'Behavioral & Social',
                shortName: 'Social',
                emoji: '🤝',
                patterns: [
                    { text: 'I avoided tasks, conversations, or people', checked: false },
                    { text: 'I overcommitted and felt resentful later', checked: false },
                    { text: 'I said yes to things I didn\'t want to do', checked: false },
                    { text: 'I found it hard to ask for help or set boundaries', checked: false },
                    { text: 'I withdrew or ghosted people without meaning to', checked: false },
                    { text: 'I felt pressure to be available or responsive even when I needed space', checked: false },
                    { text: 'I felt guilty or ashamed for taking time for myself', checked: false },
                    { text: 'I over explained or apologized unnecessarily', checked: false }
                ]
            },
            {
                name: 'Physical & Body-Based',
                shortName: 'Physical',
                emoji: '🫁',
                patterns: [
                    { text: 'I noticed tension in my jaw, shoulders, or stomach', checked: false },
                    { text: 'I stayed up late even though I was tired', checked: false },
                    { text: 'I had headaches, fatigue, or stomach issues', checked: false },
                    { text: 'I had urges to stress-eat or snack when overwhelmed', checked: false },
                    { text: 'I felt a need to keep moving or stay busy', checked: false },
                    { text: 'I forgot to eat regular meals or drank more caffeine than usual', checked: false },
                    { text: 'My heart felt like it was racing or pounding', checked: false },
                    { text: 'I had trouble falling asleep or staying asleep', checked: false }
                ]
            },
            {
                name: 'Environmental & Spiritual',
                shortName: 'Environment',
                emoji: '🏡',
                patterns: [
                    { text: 'I felt overwhelmed by decisions (what to wear, eat, or do)', checked: false },
                    { text: 'I didn\'t spend time outside or connect with nature', checked: false },
                    { text: 'I felt disconnected from my values or sense of purpose', checked: false },
                    { text: 'I avoided opening bills, emails, or mail', checked: false },
                    { text: 'My environment (noise, clutter, lighting) felt draining', checked: false },
                    { text: 'I felt like my days were on autopilot with no time for joy or creativity', checked: false }
                ]
            }
        ]);

        // Reflection Data - directly from your reflection questions
        const reflection = ref({
            otherPatterns: '',
            topThree: ['', '', ''],
            showUpOften: ''
        });

        // All sections combined (5 pattern categories + 1 reflection)
        const sections = computed(() => {
            const patternSections = patternCategories.value.map(cat => ({
                type: 'patterns',
                name: cat.name,
                shortName: cat.shortName,
                emoji: cat.emoji,
                items: cat.patterns,
                isComplete: cat.patterns.some(p => p.checked)
            }));
            
            return [
                ...patternSections,
                {
                    type: 'reflection',
                    name: 'Reflection',
                    shortName: 'Reflect',
                    emoji: '💡',
                    items: [],
                    isComplete: getReflectionProgress.value > 0
                }
            ];
        });

        // Computed Properties
        const totalSections = computed(() => sections.value.length);
        
        const currentSectionData = computed(() => {
            return sections.value[currentSection.value];
        });

        const totalChecked = computed(() => {
            return patternCategories.value.reduce((acc, cat) => 
                acc + cat.patterns.filter(p => p.checked).length, 0
            );
        });

        const sectionsCompleted = computed(() => {
            return sections.value.filter(section => section.isComplete).length;
        });

        const progressPercentage = computed(() => {
            return Math.round((sectionsCompleted.value / totalSections.value) * 100);
        });

        const getReflectionProgress = computed(() => {
            let count = 0;
            if (reflection.value.otherPatterns && reflection.value.otherPatterns.trim() !== '') count++;
            count += reflection.value.topThree.filter(t => t && t.trim() !== '').length;
            if (reflection.value.showUpOften && reflection.value.showUpOften !== '') count++;
            return count;
        });

        const hasReflection = computed(() => {
            return getReflectionProgress.value > 0;
        });

        const hasTopThree = computed(() => {
            return reflection.value.topThree.some(t => t && t.trim() !== '');
        });

        const allSectionsComplete = computed(() => {
            return sectionsCompleted.value === totalSections.value;
        });

        // Generate results for email
        const getResultsSummary = computed(() => {
            const categoryCounts = patternCategories.value.map(cat => ({
                name: cat.name,
                emoji: cat.emoji,
                count: cat.patterns.filter(p => p.checked).length,
                total: cat.patterns.length,
                patterns: cat.patterns.filter(p => p.checked).map(p => p.text)
            }));

            const topPatterns = patternCategories.value
                .flatMap(cat => cat.patterns.filter(p => p.checked))
                .slice(0, 5);

            return {
                totalChecked: totalChecked.value,
                categoryCounts,
                topPatterns: topPatterns.map(p => p.text),
                reflection: {
                    otherPatterns: reflection.value.otherPatterns,
                    topThree: reflection.value.topThree.filter(t => t.trim() !== ''),
                    showUpOften: reflection.value.showUpOften
                },
                completedDate: new Date().toLocaleString()
            };
        });

        // Methods
        const startQuiz = () => {
            quizStarted.value = true;
            
            // Check for saved progress
            const saved = localStorage.getItem('stressPatternProgress');
            if (saved) {
                try {
                    const progress = JSON.parse(saved);
                    const savedDate = new Date(progress.timestamp).toDateString();
                    const today = new Date().toDateString();
                    
                    if (savedDate === today) {
                        const shouldRestore = confirm('You have a saved check in progress from today. Would you like to continue?');
                        if (shouldRestore) {
                            if (progress.patternCategories) {
                                patternCategories.value = progress.patternCategories;
                            }
                            if (progress.reflection) {
                                reflection.value = progress.reflection;
                            }
                            currentSection.value = progress.currentSection || 0;
                            showToastMessage('Progress restored!', 'success');
                        } else {
                            localStorage.removeItem('stressPatternProgress');
                            resetAll();
                        }
                    } else {
                        localStorage.removeItem('stressPatternProgress');
                    }
                } catch (e) {
                    console.error('Error loading saved data:', e);
                }
            }
        };

        const resetAll = () => {
            patternCategories.value.forEach(category => {
                category.patterns.forEach(pattern => {
                    pattern.checked = false;
                });
            });
            reflection.value = {
                otherPatterns: '',
                topThree: ['', '', ''],
                showUpOften: ''
            };
            currentSection.value = 0;
        };

        const togglePattern = (categoryIndex, patternIndex) => {
            const pattern = patternCategories.value[categoryIndex].patterns[patternIndex];
            pattern.checked = !pattern.checked;
            
            // Optional haptic feedback on mobile
            if (window.navigator && window.navigator.vibrate) {
                window.navigator.vibrate(10);
            }
        };

        const getSectionProgress = (sectionIndex) => {
            const section = sections.value[sectionIndex];
            if (section.type === 'patterns') {
                return section.items.filter(p => p.checked).length;
            } else {
                return getReflectionProgress.value;
            }
        };

        const isSectionComplete = (sectionIndex) => {
            return sections.value[sectionIndex].isComplete;
        };

        const nextSection = () => {
            if (currentSection.value < totalSections.value - 1) {
                transitionDirection.value = 'slide-left';
                currentSection.value++;
            }
        };

        const previousSection = () => {
            if (currentSection.value > 0) {
                transitionDirection.value = 'slide-right';
                currentSection.value--;
            }
        };

        const jumpToSection = (index) => {
            if (index === currentSection.value) return;
            
            transitionDirection.value = index > currentSection.value ? 'slide-left' : 'slide-right';
            currentSection.value = index;
        };

        const submitQuiz = async () => {
            if (!allSectionsComplete.value) {
                const firstIncomplete = sections.value.findIndex(s => !s.isComplete);
                jumpToSection(firstIncomplete);
                
                showToastMessage('Please complete each section with at least one answer', 'error');
                
                // Highlight the incomplete section
                setTimeout(() => {
                    const sectionCard = document.querySelector('.bg-gray-50, .bg-gradient-to-br');
                    if (sectionCard) {
                        sectionCard.style.borderColor = '#dc2626';
                        sectionCard.style.transition = 'border-color 0.3s ease';
                        setTimeout(() => {
                            sectionCard.style.borderColor = sections.value[currentSection.value].isComplete ? '#6C9571' : 'transparent';
                        }, 1000);
                    }
                }, 300);
                
                return;
            }

            // Show results immediately
            showResults.value = true;
            
            // Clear saved progress since quiz is complete
            localStorage.removeItem('stressPatternProgress');
            
            // Save to history
            saveToHistory();
            
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
                console.log('Sending email to:', userEmail);
                console.log('Results summary:', getResultsSummary.value);
                
                const response = await fetch('/.netlify/functions/send-stress-results', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        userEmail: userEmail,
                        results: getResultsSummary.value,
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
                    showToastMessage('Your stress patterns have been sent to your email!', 'success');
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

        const saveToHistory = () => {
            try {
                const history = JSON.parse(localStorage.getItem('stressPatternHistory') || '[]');
                history.push({
                    date: new Date().toISOString(),
                    totalChecked: totalChecked.value,
                    sectionsCompleted: sectionsCompleted.value,
                    reflection: {
                        otherPatterns: reflection.value.otherPatterns,
                        topThree: reflection.value.topThree.filter(t => t),
                        showUpOften: reflection.value.showUpOften
                    }
                });
                // Keep only last 10 entries
                if (history.length > 10) history.shift();
                localStorage.setItem('stressPatternHistory', JSON.stringify(history));
            } catch (e) {
                console.error('Error saving to history:', e);
            }
        };

        const exitQuiz = () => {
            showExitDialog.value = false;
            
            // Clear saved progress
            localStorage.removeItem('stressPatternProgress');
            
            // Reset quiz state
            quizStarted.value = false;
            resetAll();
            
            showToastMessage('Progress cleared', 'info');
        };

        const restartQuiz = () => {
            if (confirm('Are you sure you want to start over? Your current results will be lost.')) {
                showResults.value = false;
                resetAll();
                showToastMessage('Starting fresh', 'info');
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
                        nextSection();
                    } else if (e.key === 'ArrowLeft') {
                        e.preventDefault();
                        previousSection();
                    } else if (e.key === 'Escape') {
                        showExitDialog.value = true;
                    }
                }
            });
        };

        // Auto-save progress
        watch([patternCategories, reflection], () => {
            if (quizStarted.value) {
                localStorage.setItem('stressPatternProgress', JSON.stringify({
                    patternCategories: patternCategories.value,
                    reflection: reflection.value,
                    currentSection: currentSection.value,
                    timestamp: new Date().toISOString()
                }));
            }
        }, { deep: true });

        // Lifecycle hooks
        onMounted(() => {
            setupKeyboardNavigation();
            
            // Add animation styles if they don't exist
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
                `;
                document.head.appendChild(style);
            }
        });

        return {
            // State
            quizStarted,
            currentSection,
            showResults,
            showExitDialog,
            sections,
            patternCategories,
            currentSectionData,
            reflection,
            isSendingEmail,
            
            // Computed
            totalSections,
            totalChecked,
            sectionsCompleted,
            progressPercentage,
            allSectionsComplete,
            getSectionProgress,
            isSectionComplete,
            getReflectionProgress,
            hasReflection,
            hasTopThree,
            
            // Methods
            startQuiz,
            togglePattern,
            nextSection,
            previousSection,
            jumpToSection,
            submitQuiz,
            exitQuiz,
            restartQuiz,
            closeModal,
            goHome,
            printResults
        };
    }
}).mount('#app');