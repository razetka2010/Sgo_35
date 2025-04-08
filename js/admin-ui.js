document.addEventListener('DOMContentLoaded', function() {
    // Проверяем авторизацию
    if (!AdminCore.checkAuth()) return;

    // ========== ОПРЕДЕЛЕНИЕ ВСЕХ DOM ЭЛЕМЕНТОВ ==========
    const elements = {
        // Основные элементы интерфейса
        sidebar: document.querySelector('.sidebar'),
        menuToggle: document.querySelector('.menu-toggle'),
        logoutBtn: document.getElementById('logoutBtn'),
        menuItems: document.querySelectorAll('.menu-item'),
        pageTitle: document.getElementById('pageTitle'),
        currentUserRole: document.getElementById('currentUserRole'),
        currentUserName: document.getElementById('currentUserName'),
        userAvatar: document.getElementById('userAvatar'),
        
        // Секции административной панели
        usersSection: document.getElementById('usersSection'),
        newsSection: document.getElementById('newsSection'),
        classesSection: document.getElementById('classesSection'),
        reportsSection: document.getElementById('reportsSection'),
        
        // Элементы управления пользователями
        usersTable: document.getElementById('usersTable') ? document.getElementById('usersTable').querySelector('tbody') : null,
        addUserBtn: document.getElementById('addUserBtn'),
        exportUsersBtn: document.getElementById('exportUsersBtn'),
        userSearch: document.getElementById('userSearch'),
        userTypeFilter: document.getElementById('userTypeFilter'),
        
        // Модальные окна для работы с пользователями
        addUserModal: document.getElementById('addUserModal'),
        addUserForm: document.getElementById('addUserForm'),
        userType: document.getElementById('userType'),
        studentFields: document.getElementById('studentFields'),
        deputyFields: document.getElementById('deputyFields'),
        
        editUserModal: document.getElementById('editUserModal'),
        editUserForm: document.getElementById('editUserForm'),
        editUserType: document.getElementById('editUserType'),
        editStudentFields: document.getElementById('editStudentFields'),
        editDeputyFields: document.getElementById('editDeputyFields'),
        
        confirmDeleteModal: document.getElementById('confirmDeleteModal'),
        cancelDeleteBtn: document.getElementById('cancelDeleteBtn'),
        confirmDeleteBtn: document.getElementById('confirmDeleteBtn'),
        
        // Элементы управления новостями
        newsGrid: document.getElementById('newsGrid'),
        addNewsBtn: document.getElementById('addNewsBtn'),
        
        // Модальные окна для работы с новостями
        addNewsModal: document.getElementById('addNewsModal'),
        addNewsForm: document.getElementById('addNewsForm'),
        editNewsModal: document.getElementById('editNewsModal'),
        editNewsForm: document.getElementById('editNewsForm'),
        viewNewsModal: document.getElementById('viewNewsModal'),
        viewNewsTitle: document.getElementById('viewNewsTitle'),
        viewNewsImage: document.getElementById('viewNewsImage'),
        viewNewsContent: document.getElementById('viewNewsContent'),
        viewNewsDate: document.getElementById('viewNewsDate'),
        
        // Элементы управления классами
        classesTable: document.getElementById('classesTable') ? document.getElementById('classesTable').querySelector('tbody') : null,
        addClassBtn: document.getElementById('addClassBtn'),
        
        // Модальные окна для работы с классами
        editClassModal: document.getElementById('editClassModal'),
        editClassForm: document.getElementById('editClassForm'),
        className: document.getElementById('className'),
        classTeacher: document.getElementById('classTeacher'),
        confirmDeleteClassModal: document.getElementById('confirmDeleteClassModal'),
        cancelDeleteClassBtn: document.getElementById('cancelDeleteClassBtn'),
        confirmDeleteClassBtn: document.getElementById('confirmDeleteClassBtn'),
        
        // Модальное окно управления учениками
        manageStudentsModal: document.getElementById('manageStudentsModal'),
        studentsList: document.getElementById('studentsList'),
        studentSearch: document.getElementById('studentSearch'),
        classNameTitle: document.getElementById('classNameTitle'),
        cancelManageStudents: document.getElementById('cancelManageStudents'),
        saveStudents: document.getElementById('saveStudents'),
        
        // Элементы для работы с отчетами
        reportsList: document.getElementById('reportsList'),
        addReportBtn: document.getElementById('addReportBtn'),
        addReportModal: document.getElementById('addReportModal'),
        addReportForm: document.getElementById('addReportForm'),
        reportType: document.getElementById('reportType'),
        reportDescription: document.getElementById('reportDescription'),
        reportFile: document.getElementById('reportFile'),
        
        // Общие элементы модальных окон
        closeModals: document.querySelectorAll('.close-modal'),
        imagePreview: document.getElementById('imagePreview'),
        previewImage: document.getElementById('previewImage'),
        editImagePreview: document.getElementById('editImagePreview'),
        editPreviewImage: document.getElementById('editPreviewImage')
    };

    // ========== ИНИЦИАЛИЗАЦИЯ ПРИЛОЖЕНИЯ ==========
    function initializeApplication() {
        initializeMenu();
        initializeUsersSection();
        initializeNewsSection();
        initializeClassesSection();
        initializeReportsSection();
        initializeModals();
        initializeManageStudents();
        
        setCurrentUserData();
        showSection('users');
    }

    function setCurrentUserData() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        
        if (elements.currentUserRole && authData.type) {
            elements.currentUserRole.textContent = AdminCore.getUserTypeName(authData.type);
        }
        if (elements.currentUserName) {
            elements.currentUserName.textContent = authData.fullName || 'Администратор';
        }
        if (elements.userAvatar) {
            elements.userAvatar.textContent = AdminCore.getInitials(authData.fullName || 'Администратор Системный');
        }
    }

    // ========== ОТОБРАЖЕНИЕ РАЗДЕЛОВ ==========
    function showSection(section) {
        // Скрываем все разделы
        elements.usersSection.style.display = 'none';
        elements.newsSection.style.display = 'none';
        elements.classesSection.style.display = 'none';
        elements.reportsSection.style.display = 'none';

        // Показываем выбранный раздел
        switch(section) {
            case 'users':
                elements.usersSection.style.display = 'block';
                elements.pageTitle.textContent = 'Пользователи';
                renderUsers();
                break;
            case 'news':
                elements.newsSection.style.display = 'block';
                elements.pageTitle.textContent = 'Новости';
                renderNews();
                break;
            case 'classes':
                elements.classesSection.style.display = 'block';
                elements.pageTitle.textContent = 'Классы';
                renderClasses();
                break;
            case 'reports':
                elements.reportsSection.style.display = 'block';
                elements.pageTitle.textContent = 'Отчёты';
                renderReports();
                break;
            default:
                elements.usersSection.style.display = 'block';
                elements.pageTitle.textContent = 'Пользователи';
        }
    }

    // ========== МЕНЮ И НАВИГАЦИЯ ==========
    function initializeMenu() {
        if (elements.menuToggle) {
            elements.menuToggle.addEventListener('click', function() {
                elements.sidebar.classList.toggle('active');
            });
        }

        elements.menuItems.forEach(item => {
            item.addEventListener('click', function(event) {
                event.preventDefault();
                elements.menuItems.forEach(menuItem => menuItem.classList.remove('active'));
                this.classList.add('active');
                const section = this.getAttribute('data-section');
                showSection(section);
            });
        });

        if (elements.logoutBtn) {
            elements.logoutBtn.addEventListener('click', function() {
                if (confirm('Вы уверены, что хотите выйти из системы?')) {
                    localStorage.removeItem('auth');
                    window.location.href = 'index.html';
                }
            });
        }
    }

    // ========== УПРАВЛЕНИЕ ПОЛЬЗОВАТЕЛЯМИ ==========
    function initializeUsersSection() {
        if (!elements.usersTable || !elements.addUserBtn) return;
        
        renderUsers();
        
        elements.addUserBtn.addEventListener('click', function() {
            if (elements.addUserModal) {
                elements.addUserForm.reset();
                updateUserFieldsVisibility('student');
                elements.addUserModal.style.display = 'block';
            }
        });
        
        if (elements.exportUsersBtn) {
            elements.exportUsersBtn.addEventListener('click', exportUsers);
        }
        
        if (elements.userType) {
            elements.userType.addEventListener('change', function() {
                updateUserFieldsVisibility(this.value);
            });
            updateUserFieldsVisibility(elements.userType.value);
        }
        
        if (elements.addUserForm) {
            elements.addUserForm.addEventListener('submit', function(event) {
                event.preventDefault();
                addUser(event);
            });
        }
        
        if (elements.usersTable) {
            elements.usersTable.addEventListener('click', function(e) {
                const target = e.target.closest('button');
                if (!target) return;
                
                const userId = parseInt(target.getAttribute('data-id'));
                if (!userId) return;
                
                if (target.classList.contains('btn-edit')) {
                    editUser(userId);
                } else if (target.classList.contains('btn-danger')) {
                    showDeleteConfirm(userId);
                }
            });
        }
        
        if (elements.editUserForm) {
            elements.editUserForm.addEventListener('submit', function(event) {
                event.preventDefault();
                updateUser(event);
            });
        }
        
        if (elements.userSearch) {
            elements.userSearch.addEventListener('input', renderUsers);
        }
        
        if (elements.userTypeFilter) {
            elements.userTypeFilter.addEventListener('change', renderUsers);
        }
    }

    function updateUserFieldsVisibility(userType) {
        const isStudent = userType === 'student';
        
        if (elements.studentFields) {
            elements.studentFields.style.display = isStudent ? 'block' : 'none';
            const studentRequiredFields = elements.studentFields.querySelectorAll('[required]');
            studentRequiredFields.forEach(field => {
                if (isStudent) {
                    field.setAttribute('required', '');
                } else {
                    field.removeAttribute('required');
                }
            });
        }
        
        if (elements.deputyFields) {
            elements.deputyFields.style.display = userType === 'deputy' ? 'block' : 'none';
        }
    }

    function updateEditUserFieldsVisibility(userType) {
        const isStudent = userType === 'student';
        
        if (elements.editStudentFields) {
            elements.editStudentFields.style.display = isStudent ? 'block' : 'none';
            const studentRequiredFields = elements.editStudentFields.querySelectorAll('[required]');
            studentRequiredFields.forEach(field => {
                if (isStudent) {
                    field.setAttribute('required', '');
                } else {
                    field.removeAttribute('required');
                }
            });
        }
        
        if (elements.editDeputyFields) {
            elements.editDeputyFields.style.display = userType === 'deputy' ? 'block' : 'none';
        }
    }

    function renderUsers() {
        if (!elements.usersTable) return;
        
        const searchTerm = elements.userSearch ? elements.userSearch.value.toLowerCase() : '';
        const filterType = elements.userTypeFilter ? elements.userTypeFilter.value : 'all';
        
        const filteredUsers = AdminCore.data.users.filter(user => {
            if (filterType !== 'all' && user.type !== filterType) return false;
            
            const fullName = `${user.lastName || ''} ${user.firstName || ''}${user.middleName ? ' ' + user.middleName : ''}`.toLowerCase();
            return fullName.includes(searchTerm) || (user.username && user.username.toLowerCase().includes(searchTerm));
        });
        
        elements.usersTable.innerHTML = filteredUsers.map(user => {
            const fullName = `${user.lastName || ''} ${user.firstName || ''}${user.middleName ? ' ' + user.middleName : ''}`.trim();
            let additionalInfo = '-';
            
            if (user.type === 'student' && user.phone) {
                additionalInfo = `Тел: ${user.phone}`;
            } else if (user.type === 'deputy' && user.area) {
                additionalInfo = `Ответственность: ${user.area}`;
            }
            
            return `
                <tr>
                    <td>${user.id || ''}</td>
                    <td>${user.username || ''}</td>
                    <td>${fullName || '-'}</td>
                    <td>${AdminCore.getUserTypeName(user.type)}</td>
                    <td>${additionalInfo}</td>
                    <td>
                        <button class="btn btn-sm btn-edit" data-id="${user.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-id="${user.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="6" class="no-data">Пользователи не найдены</td></tr>';
    }

    function addUser(event) {
        event.preventDefault();
        
        const userType = elements.userType.value;
        const username = document.getElementById('newUsername').value.trim();
        const password = document.getElementById('newPassword').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const firstName = document.getElementById('firstName').value.trim();
        const middleName = document.getElementById('middleName').value.trim();
        
        if (!userType || !username || !password || !lastName || !firstName) {
            alert('Пожалуйста, заполните все обязательные поля');
            return false;
        }
        
        if (AdminCore.data.users.some(u => u.username === username)) {
            alert('Пользователь с таким логином уже существует');
            return false;
        }
        
        const userData = {
            username,
            password,
            type: userType,
            lastName,
            firstName,
            middleName: middleName || undefined
        };
        
        if (userType === 'student') {
            const mother = document.getElementById('motherName').value.trim();
            const father = document.getElementById('fatherName').value.trim();
            const phone = document.getElementById('phoneNumber').value.trim();
            
            if (!mother) {
                alert('Пожалуйста, укажите имя матери');
                return false;
            }
            
            userData.parents = `mother:${mother}${father ? `,father:${father}` : ''}`;
            userData.phone = phone;
        } 
        else if (userType === 'deputy') {
            const area = document.getElementById('deputyArea').value.trim();
            if (area) userData.area = area;
        }
        
        const success = AdminCore.addUser(userData);
        
        if (success) {
            renderUsers();
            elements.addUserForm.reset();
            elements.addUserModal.style.display = 'none';
            alert('Пользователь успешно добавлен!');
        }
        
        return false;
    }

    function editUser(userId) {
        const user = AdminCore.data.users.find(u => u.id === userId);
        if (!user) return;
        
        document.getElementById('editUserId').value = user.id;
        document.getElementById('editUserType').value = user.type;
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editLastName').value = user.lastName;
        document.getElementById('editFirstName').value = user.firstName;
        document.getElementById('editMiddleName').value = user.middleName || '';
        
        if (user.type === 'student') {
            const parents = user.parents?.split(',') || [];
            const mother = parents.find(p => p.startsWith('mother:'))?.split(':')[1] || '';
            const father = parents.find(p => p.startsWith('father:'))?.split(':')[1] || '';
            
            document.getElementById('editMotherName').value = mother;
            document.getElementById('editFatherName').value = father;
            document.getElementById('editPhoneNumber').value = user.phone || '';
        }
        
        if (user.type === 'deputy') {
            document.getElementById('editDeputyArea').value = user.area || '';
        }
        
        updateEditUserFieldsVisibility(user.type);
        
        if (elements.editUserModal) {
            elements.editUserModal.style.display = 'block';
        }
    }

    function updateUser(event) {
        event.preventDefault();
        
        const userId = parseInt(document.getElementById('editUserId').value);
        const userType = document.getElementById('editUserType').value;
        const username = document.getElementById('editUsername').value.trim();
        const password = document.getElementById('editPassword').value.trim();
        const lastName = document.getElementById('editLastName').value.trim();
        const firstName = document.getElementById('editFirstName').value.trim();
        const middleName = document.getElementById('editMiddleName').value.trim();
        
        if (!userType || !username || !lastName || !firstName) {
            alert('Пожалуйста, заполните все обязательные поля');
            return false;
        }
        
        if (AdminCore.data.users.some(u => u.username === username && u.id !== userId)) {
            alert('Пользователь с таким логином уже существует');
            return false;
        }
        
        const userData = {
            type: userType,
            username,
            lastName,
            firstName,
            middleName: middleName || undefined,
            password: password || undefined
        };
        
        if (userType === 'student') {
            const mother = document.getElementById('editMotherName').value.trim();
            const father = document.getElementById('editFatherName').value.trim();
            const phone = document.getElementById('editPhoneNumber').value.trim();
            
            if (!mother) {
                alert('Пожалуйста, укажите имя матери');
                return false;
            }
            
            userData.parents = `mother:${mother}${father ? `,father:${father}` : ''}`;
            userData.phone = phone;
        } 
        else if (userType === 'deputy') {
            const area = document.getElementById('editDeputyArea').value.trim();
            userData.area = area || undefined;
        }
        
        const success = AdminCore.updateUser(userId, userData);
        
        if (success) {
            renderUsers();
            if (elements.editUserModal) elements.editUserModal.style.display = 'none';
            alert('Данные пользователя успешно обновлены!');
        }
        
        return false;
    }

    function showDeleteConfirm(userId) {
        if (document.getElementById('deleteUserId')) {
            document.getElementById('deleteUserId').value = userId;
        }
        if (elements.confirmDeleteModal) {
            elements.confirmDeleteModal.style.display = 'block';
        }
    }

    function deleteUser() {
        const userId = parseInt(document.getElementById('deleteUserId').value);
        
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        const user = AdminCore.data.users.find(u => u.id === userId);
        
        if (user && user.username === authData.username) {
            alert('Вы не можете удалить текущего пользователя!');
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.style.display = 'none';
            return;
        }
        
        const success = AdminCore.deleteUser(userId);
        
        if (success) {
            renderUsers();
            if (elements.confirmDeleteModal) elements.confirmDeleteModal.style.display = 'none';
            alert('Пользователь успешно удален!');
        }
    }

    function exportUsers() {
        const content = AdminCore.data.users.map(user => {
            return Object.entries(user)
                .map(([key, value]) => `${key}:${value}`)
                .join(';');
        }).join('\n');
        
        const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'users_export_' + new Date().toISOString().split('T')[0] + '.txt';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }

    // ========== УПРАВЛЕНИЕ НОВОСТЯМИ ==========
    function initializeNewsSection() {
        if (!elements.newsGrid || !elements.addNewsBtn) return;
        
        renderNews();
        
        elements.addNewsBtn.addEventListener('click', function() {
            if (elements.addNewsModal) {
                elements.addNewsForm.reset();
                elements.addNewsModal.style.display = 'block';
            }
        });
        
        if (elements.addNewsForm) {
            elements.addNewsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addNews(e);
            });
        }
        
        elements.newsGrid.addEventListener('click', function(e) {
            const target = e.target.closest('button');
            if (!target) return;
            
            const newsId = parseInt(target.getAttribute('data-id'));
            if (!newsId) return;
            
            if (target.classList.contains('btn-more')) {
                viewNews(newsId);
            } else if (target.classList.contains('btn-edit')) {
                editNews(newsId);
            } else if (target.classList.contains('btn-danger')) {
                deleteNews(newsId);
            }
        });
    }

    function renderNews() {
        if (!elements.newsGrid) return;
        
        elements.newsGrid.innerHTML = AdminCore.data.news.length ? 
            AdminCore.data.news.map(news => `
                <div class="news-card">
                    ${news.image ? `<img src="${news.image}" class="news-image" alt="${news.title}">` : ''}
                    <div class="news-body">
                        <h3 class="news-title">${news.title}</h3>
                        <p class="news-content">${AdminCore.truncateText(news.content, 100)}</p>
                        <span class="news-date">${AdminCore.formatDate(news.date)}</span>
                    </div>
                    <div class="news-footer">
                        <button class="btn btn-sm btn-more" data-id="${news.id}" title="Подробнее">
                            <i class="fas fa-eye"></i>
                        </button>
                        <button class="btn btn-sm btn-edit" data-id="${news.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-id="${news.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            `).join('') : 
            '<p class="no-data">Новостей пока нет</p>';
    }

    function viewNews(newsId) {
        const newsItem = AdminCore.data.news.find(n => n.id === newsId);
        if (!newsItem) return;
        
        if (elements.viewNewsTitle) elements.viewNewsTitle.textContent = newsItem.title;
        if (elements.viewNewsContent) elements.viewNewsContent.textContent = newsItem.content;
        if (elements.viewNewsDate) elements.viewNewsDate.textContent = AdminCore.formatDate(newsItem.date);
        
        if (elements.viewNewsImage) {
            if (newsItem.image) {
                elements.viewNewsImage.src = newsItem.image;
                elements.viewNewsImage.style.display = 'block';
            } else {
                elements.viewNewsImage.style.display = 'none';
            }
        }
        
        if (elements.viewNewsModal) {
            elements.viewNewsModal.style.display = 'block';
        }
    }

    function addNews(event) {
        event.preventDefault();
        
        const title = document.getElementById('newsTitle') ? document.getElementById('newsTitle').value.trim() : '';
        const content = document.getElementById('newsContent') ? document.getElementById('newsContent').value.trim() : '';
        const imageInput = document.getElementById('newsImage');
        
        if (!title || !content) {
            alert('Пожалуйста, заполните заголовок и содержание новости');
            return false;
        }
        
        const newsData = {
            title,
            content,
            image: null
        };

        if (imageInput && imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                newsData.image = e.target.result;
                const success = AdminCore.addNews(newsData);
                
                if (success) {
                    renderNews();
                    if (elements.addNewsForm) elements.addNewsForm.reset();
                    if (elements.addNewsModal) elements.addNewsModal.style.display = 'none';
                    if (elements.imagePreview) elements.imagePreview.style.display = 'none';
                    alert('Новость успешно добавлена!');
                }
            };
            
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            const success = AdminCore.addNews(newsData);
            
            if (success) {
                renderNews();
                if (elements.addNewsForm) elements.addNewsForm.reset();
                if (elements.addNewsModal) elements.addNewsModal.style.display = 'none';
                alert('Новость успешно добавлена!');
            }
        }
        
        return false;
    }

    function editNews(newsId) {
        const newsItem = AdminCore.data.news.find(n => n.id === newsId);
        if (!newsItem) return;
        
        if (document.getElementById('editNewsId')) document.getElementById('editNewsId').value = newsItem.id;
        if (document.getElementById('editNewsTitle')) document.getElementById('editNewsTitle').value = newsItem.title;
        if (document.getElementById('editNewsContent')) document.getElementById('editNewsContent').value = newsItem.content;
        
        if (elements.editPreviewImage && elements.editImagePreview) {
            if (newsItem.image) {
                elements.editPreviewImage.src = newsItem.image;
                elements.editImagePreview.style.display = 'block';
            } else {
                elements.editImagePreview.style.display = 'none';
            }
        }
        
        if (elements.editNewsModal) {
            elements.editNewsModal.style.display = 'block';
        }
    }

    function updateNews(event) {
        event.preventDefault();
        
        const newsId = parseInt(document.getElementById('editNewsId').value);
        const title = document.getElementById('editNewsTitle') ? document.getElementById('editNewsTitle').value.trim() : '';
        const content = document.getElementById('editNewsContent') ? document.getElementById('editNewsContent').value.trim() : '';
        const imageInput = document.getElementById('editNewsImage');
        
        if (!title || !content) {
            alert('Пожалуйста, заполните заголовок и содержание новости');
            return false;
        }
        
        const newsData = {
            title,
            content
        };

        if (imageInput && imageInput.files && imageInput.files[0]) {
            const reader = new FileReader();
            
            reader.onload = function(e) {
                newsData.image = e.target.result;
                const success = AdminCore.updateNews(newsId, newsData);
                
                if (success) {
                    renderNews();
                    if (elements.editNewsModal) elements.editNewsModal.style.display = 'none';
                    if (elements.editImagePreview) elements.editImagePreview.style.display = 'none';
                    alert('Новость успешно обновлена!');
                }
            };
            
            reader.readAsDataURL(imageInput.files[0]);
        } else {
            const success = AdminCore.updateNews(newsId, newsData);
            
            if (success) {
                renderNews();
                if (elements.editNewsModal) elements.editNewsModal.style.display = 'none';
                alert('Новость успешно обновлена!');
            }
        }
        
        return false;
    }

    function deleteNews(newsId) {
        if (confirm('Вы уверены, что хотите удалить эту новость?')) {
            const success = AdminCore.deleteNews(newsId);
            
            if (success) {
                renderNews();
                alert('Новость успешно удалена!');
            }
        }
    }

    // ========== УПРАВЛЕНИЕ КЛАССАМИ ==========
    function initializeClassesSection() {
        if (!elements.classesTable || !elements.addClassBtn) return;
        
        renderClasses();
        
        elements.addClassBtn.addEventListener('click', function() {
            showEditClassModal();
        });
        
        if (elements.classesTable) {
            elements.classesTable.addEventListener('click', function(e) {
                const target = e.target.closest('button');
                if (!target) return;
                
                const classId = target.getAttribute('data-id');
                if (!classId) return;
                
                if (target.classList.contains('btn-edit')) {
                    editClass(classId);
                } else if (target.classList.contains('btn-primary')) {
                    openManageStudents(classId);
                } else if (target.classList.contains('btn-danger')) {
                    showDeleteClassConfirm(classId);
                }
            });
        }
        
        if (elements.editClassForm) {
            elements.editClassForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveClass();
            });
        }
    }

    function renderClasses() {
        if (!elements.classesTable) return;
        
        elements.classesTable.innerHTML = AdminCore.data.classes.map(cls => {
            const studentsCount = cls.students ? cls.students.length : 0;
            
            // Находим учителя по ID
            const teacher = cls.teacherId 
                ? AdminCore.data.users.find(u => u.id === cls.teacherId)
                : null;
            
            const teacherName = teacher 
                ? `${teacher.lastName} ${teacher.firstName[0]}.${teacher.middleName ? teacher.middleName[0] + '.' : ''}`
                : 'Не назначен';

            return `
                <tr>
                    <td>${cls.id}</td>
                    <td>${cls.name}</td>
                    <td>${teacherName}</td>
                    <td>${studentsCount}</td>
                    <td>
                        <button class="btn btn-sm btn-edit" data-id="${cls.id}" title="Редактировать">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-primary" data-id="${cls.id}" title="Ученики">
                            <i class="fas fa-users"></i>
                        </button>
                        <button class="btn btn-sm btn-danger" data-id="${cls.id}" title="Удалить">
                            <i class="fas fa-trash"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="5" class="no-data">Классы не найдены</td></tr>';
    }

    function showEditClassModal(classData = null) {
        const isEdit = classData !== null;
        const modalTitle = isEdit ? 'Редактировать класс' : 'Добавить класс';
        const teacherSelect = document.getElementById('classTeacher');

        // Очищаем список учителей
        teacherSelect.innerHTML = '<option value="">Не назначен</option>';

        // Загружаем всех учителей (type === "teacher")
        const teachers = AdminCore.data.users.filter(user => user.type === 'teacher');

        // Добавляем учителей в выпадающий список
        teachers.forEach(teacher => {
            const option = document.createElement('option');
            const fullName = `${teacher.lastName} ${teacher.firstName}${teacher.middleName ? ' ' + teacher.middleName : ''}`;
            option.value = teacher.id;
            option.textContent = fullName;
            
            // Если это редактирование, выбираем текущего классрука
            if (isEdit && classData.teacherId === teacher.id) {
                option.selected = true;
            }
            
            teacherSelect.appendChild(option);
        });

        // Заполняем остальные поля
        document.getElementById('editClassModalTitle').textContent = modalTitle;
        document.getElementById('editClassId').value = isEdit ? classData.id : '';
        document.getElementById('className').value = isEdit ? classData.name : '';

        // Показываем модальное окно
        elements.editClassModal.style.display = 'block';
    }

    function editClass(classId) {
        const classData = AdminCore.data.classes.find(c => c.id === classId);
        if (!classData) return;
        
        showEditClassModal(classData);
    }

    function saveClass() {
        const id = document.getElementById('editClassId').value;
        const name = document.getElementById('className').value.trim();
        const teacherId = document.getElementById('classTeacher').value;

        if (!name) {
            alert('Укажите название класса');
            return;
        }

        const classData = {
            name,
            teacherId: teacherId || null
        };

        let success;
        if (id) {
            success = AdminCore.updateClass(id, classData);
        } else {
            // Для новых классов добавляем ID
            classData.id = AdminCore.generateClassId();
            success = AdminCore.addClass(classData);
        }

        if (success) {
            renderClasses();
            elements.editClassModal.style.display = 'none';
            alert('Класс сохранён!');
        } else {
            alert('Ошибка при сохранении класса');
        }
    }

    function showDeleteClassConfirm(classId) {
        document.getElementById('deleteClassId').value = classId;
        if (elements.confirmDeleteClassModal) {
            elements.confirmDeleteClassModal.style.display = 'block';
        }
    }

    function deleteClass(classId) {
        const success = AdminCore.deleteClass(classId);
        
        if (success) {
            renderClasses();
            if (elements.confirmDeleteClassModal) elements.confirmDeleteClassModal.style.display = 'none';
            alert('Класс успешно удален!');
        } else {
            alert('Нельзя удалить стандартный класс (1А-11Г)');
        }
    }

    // ========== УПРАВЛЕНИЕ УЧЕНИКАМИ В КЛАССАХ ==========
    function initializeManageStudents() {
        if (!elements.manageStudentsModal) return;
        
        if (elements.studentSearch) {
            elements.studentSearch.addEventListener('input', function() {
                renderStudentsList(elements.studentSearch.value.toLowerCase());
            });
        }
        
        if (elements.saveStudents) {
            elements.saveStudents.addEventListener('click', saveStudentsToClass);
        }
        
        if (elements.cancelManageStudents) {
            elements.cancelManageStudents.addEventListener('click', function() {
                elements.manageStudentsModal.style.display = 'none';
            });
        }
    }

    function openManageStudents(classId) {
        const classData = AdminCore.data.classes.find(c => c.id === classId);
        if (!classData) return;
        
        AdminCore.data.currentClassId = classId;
        
        if (elements.classNameTitle) {
            elements.classNameTitle.textContent = classData.name;
        }
        
        renderStudentsList();
        
        if (elements.manageStudentsModal) {
            elements.manageStudentsModal.style.display = 'block';
        }
    }

    function renderStudentsList(searchTerm = '') {
        if (!elements.studentsList) return;
        
        const students = AdminCore.data.users.filter(u => u.type === 'student');
        const currentClass = AdminCore.data.classes.find(c => c.id === AdminCore.data.currentClassId);
        const currentStudentIds = currentClass?.students || [];
        
        const filteredStudents = students.filter(student => {
            if (!searchTerm) return true;
            
            const fullName = `${student.lastName || ''} ${student.firstName || ''}${student.middleName ? ' ' + student.middleName : ''}`.toLowerCase();
            return fullName.includes(searchTerm);
        });
        
        elements.studentsList.innerHTML = filteredStudents.map(student => {
            const fullName = `${student.lastName || ''} ${student.firstName || ''}${student.middleName ? ' ' + student.middleName : ''}`.trim();
            const studentClass = AdminCore.data.classes.find(c => c.students?.includes(student.id));
            
            return `
                <tr>
                    <td>
                        <input type="checkbox" ${currentStudentIds.includes(student.id) ? 'checked' : ''} data-id="${student.id}">
                    </td>
                    <td>${student.id}</td>
                    <td>${fullName}</td>
                    <td>${studentClass?.name || ''}</td>
                </tr>
            `;
        }).join('') || '<tr><td colspan="4" class="no-data">Ученики не найдены</td></tr>';
    }

    function saveStudentsToClass() {
        const classId = AdminCore.data.currentClassId;
        const classIndex = AdminCore.data.classes.findIndex(c => c.id === classId);
        if (classIndex === -1) {
            alert('Ошибка: класс не найден');
            return;
        }
        
        const checkboxes = elements.studentsList.querySelectorAll('input[type="checkbox"]');
        const selectedStudentIds = Array.from(checkboxes)
            .filter(checkbox => checkbox.checked)
            .map(checkbox => checkbox.getAttribute('data-id'));
        
        try {
            // Удаляем учеников из других классов
            AdminCore.data.classes.forEach(cls => {
                if (cls.id !== classId && cls.students) {
                    cls.students = cls.students.filter(id => !selectedStudentIds.includes(id));
                }
            });
            
            // Добавляем учеников в текущий класс
            AdminCore.data.classes[classIndex].students = selectedStudentIds;
            
            // Сохраняем изменения
            const success = AdminCore.saveClasses();
            
            if (success) {
                renderClasses();
                if (elements.manageStudentsModal) {
                    elements.manageStudentsModal.style.display = 'none';
                }
                alert('Изменения сохранены!');
            } else {
                alert('Ошибка при сохранении изменений');
            }
        } catch (error) {
            console.error('Ошибка при сохранении учеников:', error);
            alert('Произошла ошибка при сохранении изменений');
        }
    }

    // ========== УПРАВЛЕНИЕ ОТЧЕТАМИ ==========
    function initializeReportsSection() {
        if (!elements.reportsSection) return;
        
        // Валидация существующих отчетов
        AdminCore.validateReports();
        renderReports();
        
        // Обработчик кнопки добавления отчета
        if (elements.addReportBtn) {
            elements.addReportBtn.addEventListener('click', function() {
                if (elements.addReportModal) {
                    elements.addReportForm.reset();
                    elements.addReportModal.style.display = 'block';
                }
            });
        }
        
        // Обработчик формы добавления отчета
        if (elements.addReportForm) {
            elements.addReportForm.addEventListener('submit', function(e) {
                e.preventDefault();
                addReport();
            });
        }
        
        // Обработчик для удаления отчетов
        if (elements.reportsList) {
            elements.reportsList.addEventListener('click', function(e) {
                const deleteBtn = e.target.closest('.delete-report');
                if (!deleteBtn) return;
                
                e.preventDefault();
                e.stopPropagation();
                
                const reportId = parseInt(deleteBtn.getAttribute('data-id'));
                if (isNaN(reportId)) {
                    console.error('Неверный ID отчёта');
                    alert('Ошибка: неверный идентификатор отчёта');
                    return;
                }
                
                deleteReport(reportId);
            });
        }
    }

    function renderReports() {
        if (!elements.reportsList) return;
        
        // Сортируем отчеты по дате (новые сначала)
        const sortedReports = [...AdminCore.data.reports].sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        elements.reportsList.innerHTML = sortedReports.length ? 
            sortedReports.map(report => `
                <div class="report-item" data-id="${report.id}">
                    <div class="report-info">
                        <h4>${report.type}</h4>
                        <p>${report.description || 'Без описания'}</p>
                        <small>${AdminCore.formatDate(report.date)}</small>
                        <small>${report.fileName ? ` (${report.fileName})` : ''}</small>
                    </div>
                    <div class="report-actions">
                        <a href="${report.fileUrl}" class="btn btn-sm btn-primary" download="${report.fileName || 'report'}">
                            <i class="fas fa-download"></i> Скачать
                        </a>
                        <button class="btn btn-sm btn-danger delete-report" data-id="${report.id}" title="Удалить отчет">
                            <i class="fas fa-trash"></i> Удалить
                        </button>
                    </div>
                </div>
            `).join('') : 
            '<p class="no-data">Отчетов пока нет</p>';
    }

    function addReport() {
        const type = elements.reportType ? elements.reportType.value : '';
        const description = elements.reportDescription ? elements.reportDescription.value.trim() : '';
        const fileInput = elements.reportFile;
        
        if (!type) {
            alert('Пожалуйста, укажите тип отчета');
            return;
        }
        
        if (!fileInput || !fileInput.files || !fileInput.files[0]) {
            alert('Пожалуйста, выберите файл отчета');
            return;
        }
        
        const file = fileInput.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            const reportData = {
                type: type,
                description: description,
                fileName: file.name,
                fileType: file.type,
                fileSize: file.size,
                fileUrl: e.target.result,
                uploadedBy: JSON.parse(localStorage.getItem('auth'))?.username || 'admin',
                date: new Date().toISOString()
            };
            
            const success = AdminCore.addReport(reportData);
            
            if (success) {
                renderReports();
                if (elements.addReportForm) elements.addReportForm.reset();
                if (elements.addReportModal) elements.addReportModal.style.display = 'none';
                alert('Отчет успешно добавлен!');
            } else {
                alert('Не удалось добавить отчет');
            }
        };
        
        reader.onerror = function() {
            alert('Ошибка при чтении файла');
        };
        
        reader.readAsDataURL(file);
    }

    function deleteReport(reportId) {
        // Проверяем, что отчет существует
        const reportExists = AdminCore.data.reports.some(r => r.id === reportId);
        if (!reportExists) {
            alert('Отчёт не найден');
            return;
        }
        
        if (!confirm('Вы уверены, что хотите удалить этот отчёт? Действие нельзя отменить.')) {
            return;
        }
        
        try {
            const success = AdminCore.deleteReport(reportId);
            
            if (success) {
                // Удаляем элемент из DOM
                const reportElement = document.querySelector(`.report-item[data-id="${reportId}"]`);
                if (reportElement) {
                    reportElement.remove();
                }
                
                // Обновляем список отчетов
                renderReports();
                
                alert('Отчёт успешно удалён!');
            } else {
                alert('Не удалось удалить отчёт');
            }
        } catch (error) {
            console.error('Ошибка при удалении отчёта:', error);
            alert('Произошла ошибка при удалении отчёта');
        }
    }

    // ========== МОДАЛЬНЫЕ ОКНА ==========
    function initializeModals() {
        elements.closeModals.forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.modal').forEach(modal => {
                    modal.style.display = 'none';
                });
            });
        });
        
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        if (elements.cancelDeleteBtn) {
            elements.cancelDeleteBtn.addEventListener('click', function() {
                if (elements.confirmDeleteModal) {
                    elements.confirmDeleteModal.style.display = 'none';
                }
            });
        }
        
        if (elements.confirmDeleteBtn) {
            elements.confirmDeleteBtn.addEventListener('click', deleteUser);
        }
        
        if (elements.cancelDeleteClassBtn) {
            elements.cancelDeleteClassBtn.addEventListener('click', function() {
                if (elements.confirmDeleteClassModal) {
                    elements.confirmDeleteClassModal.style.display = 'none';
                }
            });
        }
        
        if (elements.confirmDeleteClassBtn) {
            elements.confirmDeleteClassBtn.addEventListener('click', function() {
                const classId = document.getElementById('deleteClassId').value;
                deleteClass(classId);
            });
        }
        
        if (document.getElementById('newsImage')) {
            document.getElementById('newsImage').addEventListener('change', function(e) {
                if (this.files && this.files[0] && elements.previewImage && elements.imagePreview) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        elements.previewImage.src = e.target.result;
                        elements.imagePreview.style.display = 'block';
                    }
                    
                    reader.readAsDataURL(this.files[0]);
                } else if (elements.imagePreview) {
                    elements.imagePreview.style.display = 'none';
                }
            });
        }
        
        if (document.getElementById('editNewsImage')) {
            document.getElementById('editNewsImage').addEventListener('change', function(e) {
                if (this.files && this.files[0] && elements.editPreviewImage && elements.editImagePreview) {
                    const reader = new FileReader();
                    
                    reader.onload = function(e) {
                        elements.editPreviewImage.src = e.target.result;
                        elements.editImagePreview.style.display = 'block';
                    }
                    
                    reader.readAsDataURL(this.files[0]);
                } else if (elements.editImagePreview) {
                    elements.editImagePreview.style.display = 'none';
                }
            });
        }
        
        if (elements.editNewsForm) {
            elements.editNewsForm.addEventListener('submit', function(e) {
                e.preventDefault();
                updateNews(e);
            });
        }
    }

    // Запускаем приложение
    initializeApplication();
});