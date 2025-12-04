// Custom cursor
const cursor = document.querySelector('.cursor');
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

// Smooth cursor animation
function animateCursor() {
    const speed = 0.15;
    
    cursorX += (mouseX - cursorX) * speed;
    cursorY += (mouseY - cursorY) * speed;
    
    cursor.style.left = cursorX + 'px';
    cursor.style.top = cursorY + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Add active class on hover
document.querySelectorAll('a, button, .work-item').forEach(element => {
    element.addEventListener('mouseenter', () => cursor.classList.add('active'));
    element.addEventListener('mouseleave', () => cursor.classList.remove('active'));
});

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Animate stats numbers
function animateStats() {
    const stats = document.querySelectorAll('.stat-number');
    
    stats.forEach(stat => {
        const target = parseInt(stat.getAttribute('data-target'));
        const increment = target / 100;
        let current = 0;
        
        const updateCounter = () => {
            if (current < target) {
                current += increment;
                stat.textContent = Math.ceil(current);
                setTimeout(updateCounter, 20);
            } else {
                stat.textContent = target;
            }
        };
        
        updateCounter();
    });
}

// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            if (entry.target.classList.contains('stats')) {
                animateStats();
                observer.unobserve(entry.target);
            }
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Observe elements
document.querySelectorAll('.work-item, .about-text, .gradient-box').forEach(el => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(30px)';
    el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
    observer.observe(el);
});

document.querySelectorAll('.stats').forEach(el => {
    observer.observe(el);
});

// Mobile menu toggle
const navToggle = document.querySelector('.nav-toggle');
const navMenu = document.querySelector('.nav-menu');

if (navToggle) {
    navToggle.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

// Parallax effect for gradient orbs
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const orbs = document.querySelectorAll('.gradient-orb');
    
    orbs.forEach((orb, index) => {
        const speed = 0.5 + (index * 0.1);
        orb.style.transform = `translateY(${scrolled * speed}px)`;
    });
});

// Add some interactive hover effects
document.querySelectorAll('.work-item').forEach(item => {
    item.addEventListener('mouseenter', function() {
        this.style.transform = 'translateY(-15px) scale(1.02)';
    });
    
    item.addEventListener('mouseleave', function() {
        this.style.transform = 'translateY(0) scale(1)';
    });
});

// Dynamic gradient background animation
let gradientAngle = 0;
function animateGradient() {
    gradientAngle += 0.5;
    const gradientBg = document.querySelector('.gradient-bg');
    if (gradientBg) {
        gradientBg.style.background = `linear-gradient(${gradientAngle}deg, 
            rgba(255,255,255,0.02) 0%, 
            rgba(255,255,255,0.01) 50%, 
            rgba(255,255,255,0.02) 100%)`;
    }
    requestAnimationFrame(animateGradient);
}

animateGradient();

// Comments functionality
const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');
const adminModal = document.getElementById('adminModal');
const closeModal = document.querySelector('.close-modal');
const confirmDeleteBtn = document.getElementById('confirmDelete');
const adminPasswordInput = document.getElementById('adminPassword');
const adminMessage = document.getElementById('adminMessage');

// Admin password
const ADMIN_PASSWORD = 'SS4411AS';

// Default avatar URL
const defaultAvatar = 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_DptPlzi84AgD23Efs2LhymtNQ5E7INXiMg&s';

// Track which comments the current user has reported
let reportedComments = JSON.parse(localStorage.getItem('reportedComments') || '{}');
let currentCommentId = null;

// Load comments from localStorage
function loadComments() {
    const savedComments = localStorage.getItem('comments');
    if (savedComments) {
        const comments = JSON.parse(savedComments);
        // Filter out comments with 5 or more reports
        const filteredComments = comments.filter(comment => (comment.reports || 0) < 5);
        
        // Save filtered comments back to storage
        if (filteredComments.length !== comments.length) {
            saveComments(filteredComments);
        }
        
        renderComments(filteredComments);
    }
}

// Save comments to localStorage
function saveComments(comments) {
    localStorage.setItem('comments', JSON.stringify(comments));
}

// Save reported comments to localStorage
function saveReportedComments() {
    localStorage.setItem('reportedComments', JSON.stringify(reportedComments));
}

// Check if current user has reported a comment
function hasUserReported(commentId) {
    const userId = getUserId();
    return reportedComments[`${userId}_${commentId}`] === true;
}

// Generate a unique ID for the current user
function getUserId() {
    let userId = localStorage.getItem('userId');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', userId);
    }
    return userId;
}

// Render comments to the page
function renderComments(comments) {
    commentsList.innerHTML = '';
    
    comments.forEach(comment => {
        const commentElement = document.createElement('div');
        commentElement.className = 'comment';
        commentElement.dataset.id = comment.id;
        
        const date = new Date(comment.timestamp);
        const formattedDate = date.toLocaleDateString('ru-RU', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
        
        const reports = comment.reports || 0;
        const isReported = hasUserReported(comment.id);
        
        commentElement.innerHTML = `
            <div class="comment-avatar">
                <img src="${comment.avatar || defaultAvatar}" alt="${comment.nickname}">
            </div>
            <div class="comment-content">
                <div class="comment-header">
                    <div class="comment-header-content">
                        <span class="comment-author">${comment.nickname}</span>
                        <span class="comment-date">${formattedDate}</span>
                    </div>
                    <div class="comment-header-actions">
                        <button class="admin-menu-button" data-comment-id="${comment.id}">
                            ⋯
                        </button>
                    </div>
                </div>
                <p class="comment-text">${comment.text}</p>
                <div class="comment-actions">
                    <button class="report-button" data-comment-id="${comment.id}" ${isReported ? 'disabled' : ''}>
                        <i>⚠️</i> Пожаловаться
                        ${reports > 0 ? `<span class="report-count">${reports}</span>` : ''}
                    </button>
                </div>
            </div>
        `;
        
        commentsList.appendChild(commentElement);
    });
    
    // Add event listeners to report buttons
    document.querySelectorAll('.report-button').forEach(button => {
        button.addEventListener('click', handleReport);
    });
    
    // Add event listeners to admin menu buttons
    document.querySelectorAll('.admin-menu-button').forEach(button => {
        button.addEventListener('click', handleAdminMenuClick);
    });
}

// Handle report button click
function handleReport(e) {
    const button = e.currentTarget;
    const commentId = parseInt(button.dataset.commentId, 10);
    const userId = getUserId();
    
    // Mark as reported by this user
    reportedComments[`${userId}_${commentId}`] = true;
    saveReportedComments();
    
    // Update comment reports count
    const comments = JSON.parse(localStorage.getItem('comments') || '[]');
    const commentIndex = comments.findIndex(c => c.id === commentId);
    
    if (commentIndex !== -1) {
        const comment = comments[commentIndex];
        comment.reports = (comment.reports || 0) + 1;
        
        // Save updated comments
        saveComments(comments);
        
        // Re-render comments to show updated report count
        loadComments();
    }
    
    // Disable the button
    button.disabled = true;
}

// Handle admin menu button click
function handleAdminMenuClick(e) {
    const commentId = parseInt(e.currentTarget.dataset.commentId, 10);
    currentCommentId = commentId;
    adminModal.classList.add('show');
    adminPasswordInput.focus();
}

// Handle form submission
if (commentForm) {
    commentForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const nickname = document.getElementById('nickname').value.trim();
        const commentText = document.getElementById('comment').value.trim();
        
        if (!nickname || !commentText) return;
        
        // Get existing comments or initialize empty array
        const comments = JSON.parse(localStorage.getItem('comments') || '[]');
        
        // Add new comment
        const newComment = {
            id: Date.now(),
            nickname: nickname,
            text: commentText,
            avatar: defaultAvatar,
            timestamp: new Date().toISOString(),
            reports: 0
        };
        
        comments.unshift(newComment); // Add to beginning of array
        saveComments(comments);
        renderComments(comments);
        
        // Reset form
        commentForm.reset();
        
        // Scroll to the new comment
        const firstComment = commentsList.firstElementChild;
        if (firstComment) {
            firstComment.scrollIntoView({ behavior: 'smooth' });
        }
    });
}

// Modal functionality
if (closeModal) {
    closeModal.addEventListener('click', () => {
        adminModal.classList.remove('show');
        adminPasswordInput.value = '';
        adminMessage.textContent = '';
    });
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
        const password = adminPasswordInput.value.trim();
        
        if (password === ADMIN_PASSWORD) {
            // Delete the comment
            const comments = JSON.parse(localStorage.getItem('comments') || '[]');
            const updatedComments = comments.filter(comment => comment.id !== currentCommentId);
            
            saveComments(updatedComments);
            renderComments(updatedComments);
            
            // Close the modal
            adminModal.classList.remove('show');
            adminPasswordInput.value = '';
            adminMessage.textContent = '';
        } else {
            adminMessage.textContent = 'Неверный пароль';
        }
    });
}

// Close modal when clicking outside
window.addEventListener('click', (e) => {
    if (e.target === adminModal) {
        adminModal.classList.remove('show');
        adminPasswordInput.value = '';
        adminMessage.textContent = '';
    }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && adminModal.classList.contains('show')) {
        adminModal.classList.remove('show');
        adminPasswordInput.value = '';
        adminMessage.textContent = '';
    }
});

// Load comments when page loads
document.addEventListener('DOMContentLoaded', loadComments);
