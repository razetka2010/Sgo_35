document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('errorMessage') || document.createElement('div');
    
    if (!loginForm) return;

    // Добавляем тестового учителя в список пользователей
    if (!localStorage.getItem('admin_users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                type: 'admin',
                lastName: 'Администратор',
                firstName: 'Системный',
                date: new Date().toISOString().split('T')[0]
            }
        ];
        localStorage.setItem('admin_users', JSON.stringify(defaultUsers));
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const users = JSON.parse(localStorage.getItem('admin_users')) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                localStorage.setItem('auth', JSON.stringify({
                    username: user.username,
                    type: user.type,
                    isAdmin: user.type === 'admin',
                    isTeacher: user.type === 'teacher',  // ✅ Добавляем проверку на учителя
                    fullName: `${user.lastName} ${user.firstName}${user.middleName ? ' ' + user.middleName : ''}`
                }));
                
                // Перенаправляем в зависимости от роли
                if (user.type === 'teacher') {
                    window.location.href = 'teacher.html';
                } else {
                    window.location.href = 'admin.html';
                }
            } else {
                showError('Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Auth error:', error);
            showError('Ошибка системы. Попробуйте позже.');
        }
    });

    function showError(message) {
        if (!errorElement.parentNode) {
            errorElement.id = 'errorMessage';
            errorElement.style.color = '#e74c3c';
            errorElement.style.marginTop = '15px';
            loginForm.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const errorElement = document.getElementById('errorMessage') || document.createElement('div');
    
    if (!loginForm) return;

    // Добавляем тестового учителя в список пользователей
    if (!localStorage.getItem('admin_users')) {
        const defaultUsers = [
            {
                id: 1,
                username: 'admin',
                password: 'admin123',
                type: 'admin',
                lastName: 'Администратор',
                firstName: 'Системный',
                date: new Date().toISOString().split('T')[0]
            },
            {
                id: 2,
                username: 'Бабич',
                password: '123',
                type: 'teacher',
                lastName: 'Бабич',
                firstName: 'Иван',
                middleName: 'Петрович',
                date: new Date().toISOString().split('T')[0]
            }
        ];
        localStorage.setItem('admin_users', JSON.stringify(defaultUsers));
    }

    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value.trim();

        try {
            const users = JSON.parse(localStorage.getItem('admin_users')) || [];
            const user = users.find(u => u.username === username && u.password === password);

            if (user) {
                localStorage.setItem('auth', JSON.stringify({
                    username: user.username,
                    type: user.type,
                    isAdmin: user.type === 'admin',
                    isTeacher: user.type === 'teacher',  // ✅ Добавляем проверку на учителя
                    fullName: `${user.lastName} ${user.firstName}${user.middleName ? ' ' + user.middleName : ''}`
                }));
                
                // Перенаправляем в зависимости от роли
                if (user.type === 'teacher') {
                    window.location.href = 'teacher.html';
                } else {
                    window.location.href = 'admin.html';
                }
            } else {
                showError('Неверный логин или пароль');
            }
        } catch (error) {
            console.error('Auth error:', error);
            showError('Ошибка системы. Попробуйте позже.');
        }
    });

    function showError(message) {
        if (!errorElement.parentNode) {
            errorElement.id = 'errorMessage';
            errorElement.style.color = '#e74c3c';
            errorElement.style.marginTop = '15px';
            loginForm.appendChild(errorElement);
        }
        errorElement.textContent = message;
        errorElement.style.display = 'block';
    }
});