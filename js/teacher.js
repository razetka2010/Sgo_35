document.addEventListener('DOMContentLoaded', function() {
    // Основные переменные
    let currentClass = null;
    let currentSubject = null;
    let currentPeriod = 'current';
    let gradesData = {};
    let scheduleData = {};
    let materialsData = [];
    
    // DOM элементы
    const userAvatar = document.getElementById('userAvatar');
    const userName = document.getElementById('userName');
    const userRole = document.getElementById('userRole');
    const classSelect = document.getElementById('classSelect');
    const subjectSelect = document.getElementById('subjectSelect');
    const periodSelect = document.getElementById('periodSelect');
    const gradesTableBody = document.getElementById('gradesTableBody');
    const datesRow = document.querySelector('.dates-row');
    const classAverageEl = document.getElementById('classAverage');
    const performanceEl = document.getElementById('performance');
    const knowledgeQualityEl = document.getElementById('knowledgeQuality');
    const scheduleSection = document.getElementById('scheduleSection');
    const classesSection = document.getElementById('classesSection');
    const materialsSection = document.getElementById('materialsSection');
    const materialsGrid = document.getElementById('materialsGrid');
    const addGradeModal = document.getElementById('addGradeModal');
    const addGradeForm = document.getElementById('addGradeForm');
    const deleteGradeBtn = document.getElementById('deleteGradeBtn');
    
    // Инициализация приложения
    initApp();
    
    function initApp() {
        checkAuth();
        initUserData();
        initSelects();
        initEventListeners();
        loadInitialData();
    }
    
    // Проверка авторизации
    function checkAuth() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        if (!authData.isTeacher && !authData.isAdmin) {
            alert('Доступ запрещен. Требуются права учителя.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }
    
    // Загрузка данных пользователя
    function initUserData() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        
        if (authData.fullName) {
            // Установка аватара (инициалы)
            const initials = authData.fullName.split(' ')
                .filter(word => word.length > 0)
                .map(word => word[0])
                .join('')
                .toUpperCase()
                .substring(0, 2);
            userAvatar.textContent = initials;
            
            // Установка имени и роли
            userName.textContent = authData.fullName;
            userRole.textContent = authData.isAdmin ? 'Администратор' : 'Учитель';
        }
    }
    
    // Инициализация выпадающих списков
    function initSelects() {
        // Загрузка классов
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        
        // Загрузка предметов
        const subjects = [
            'Русский язык', 'Математика', 'Литература', 'Иностранный язык',
            'История', 'Обществознание', 'География', 'Биология',
            'Физика', 'Химия', 'Информатика', 'Физкультура',
            'Технология', 'ИЗО', 'Музыка', 'ОБЖ'
        ].sort((a, b) => a.localeCompare(b, 'ru'));
        
        subjects.forEach(subj => {
            const option = document.createElement('option');
            option.value = subj.toLowerCase().replace(/\s+/g, '_');
            option.textContent = subj;
            subjectSelect.appendChild(option);
        });
    }
    
    // Инициализация обработчиков событий
    function initEventListeners() {
        // Навигация
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                switchSection(section);
            });
        });
        
        // Выход из системы
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                switchSection(section);
            });
        });
        
        // Фильтры журнала
        classSelect.addEventListener('change', function() {
            currentClass = this.value;
            localStorage.setItem('teacher_lastClass', currentClass);
            loadClassData();
        });
        
        subjectSelect.addEventListener('change', function() {
            currentSubject = this.value;
            loadGrades();
        });
        
        periodSelect.addEventListener('change', function() {
            currentPeriod = this.value;
            loadGrades();
        });
        
        document.getElementById('exportBtn').addEventListener('click', exportGrades);
        document.getElementById('printBtn').addEventListener('click', printGrades);
        
        // Управление оценками
        gradesTableBody.addEventListener('click', function(e) {
            const gradeCell = e.target.closest('.grade-cell');
            if (!gradeCell) return;
            
            if (e.ctrlKey) {
                deleteGrade(gradeCell);
            } else {
                openGradeModal(gradeCell);
            }
        });
        
        // Учебные материалы
        document.getElementById('addMaterialBtn').addEventListener('click', openAddMaterialModal);
        
        // Модальное окно оценок
        if (addGradeForm) {
            addGradeForm.addEventListener('submit', function(e) {
                e.preventDefault();
                saveGrade();
            });
        }
        
        if (deleteGradeBtn) {
            deleteGradeBtn.addEventListener('click', deleteGradeFromModal);
        }
        
        // Закрытие модальных окон
        document.querySelectorAll('.close-modal').forEach(btn => {
            btn.addEventListener('click', function() {
                this.closest('.modal').style.display = 'none';
            });
        });
        
        window.addEventListener('click', function(e) {
            if (e.target.classList.contains('modal')) {
                e.target.style.display = 'none';
            }
        });
        
        const activeSection = document.querySelector('.nav-item.active').getAttribute('data-section');
            switchSection(activeSection);
    }
    
    function loadInitialData() {
        const lastClass = localStorage.getItem('teacher_lastClass');
        if (lastClass) {
            classSelect.value = lastClass;
            currentClass = lastClass;
            loadClassData();
        }
        
        // Загрузка расписания
        loadSchedule();
        
        // Загрузка учебных материалов
        loadMaterials();
        
        // Загрузка классов учителя
        loadTeacherClasses();
    }
    
    function loadTeacherClasses() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        
        // Находим классы, где текущий учитель является классным руководителем
        const teacherClasses = classes.filter(cls => {
            return cls.teacherId && users.some(u => u.id == cls.teacherId && u.username === authData.username);
        });
        
        renderTeacherClasses(teacherClasses, users);
    }

    function renderTeacherClasses(classes, users) {
        const classesList = document.getElementById('classesList');
        if (!classesList) return;
        
        if (classes.length === 0) {
            classesList.innerHTML = '<div class="no-data">Вам не назначены классы</div>';
            return;
        }
        
        classesList.innerHTML = classes.map(cls => {
            // Находим учеников класса
            const students = cls.students 
                ? cls.students.map(studentId => 
                    users.find(u => u.id == studentId && u.type === 'student'))
                    .filter(Boolean)
                : [];
            
            return `
                <div class="class-card">
                    <h3>${cls.name}</h3>
                    <div class="students-list">
                        ${students.length > 0 ? `
                            <table>
                                <thead>
                                    <tr>
                                        <th>ФИО</th>
                                        <th>Логин</th>
                                        <th>Телефон</th>
                                        <th>Родители</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    ${students.map(student => `
                                        <tr>
                                            <td>${student.lastName} ${student.firstName} ${student.middleName || ''}</td>
                                            <td>${student.username}</td>
                                            <td>${student.phone || 'не указан'}</td>
                                            <td>
                                                ${formatParentsInfo(student.parents)}
                                            </td>
                                        </tr>
                                    `).join('')}
                                </tbody>
                            </table>
                        ` : '<p>В классе нет учеников</p>'}
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Вспомогательная функция для форматирования информации о родителях
    function formatParentsInfo(parents) {
        if (!parents) return 'не указаны';
        
        try {
            const parentsData = parents.split(',');
            let result = [];
            
            parentsData.forEach(p => {
                const [type, name] = p.split(':');
                if (type && name) {
                    result.push(`${type === 'mother' ? 'Мать' : 'Отец'}: ${name}`);
                }
            });
            
            return result.join('<br>');
        } catch (e) {
            return parents;
        }
    }
    
    // Переключение между разделами
    function switchSection(section) {
        // Обновляем заголовок страницы в зависимости от выбранного раздела
        const pageTitle = document.querySelector('.page-title');
        
        // Скрываем все разделы
        document.querySelector('.grades-container').style.display = 'none';
        scheduleSection.style.display = 'none';
        classesSection.style.display = 'none';
        materialsSection.style.display = 'none';
        
        // Показываем выбранный раздел и обновляем заголовок
        switch(section) {
            case 'grades':
                document.querySelector('.grades-container').style.display = 'block';
                pageTitle.innerHTML = '<i class="fas fa-book-open"></i><span>Журнал оценок</span>';
                break;
            case 'schedule':
                scheduleSection.style.display = 'block';
                pageTitle.innerHTML = '<i class="fas fa-calendar-alt"></i><span>Расписание</span>';
                break;
            case 'students':
                classesSection.style.display = 'block';
                pageTitle.innerHTML = '<i class="fas fa-users"></i><span>Мои классы</span>';
                // Загружаем данные классов при открытии раздела
                loadTeacherClasses();
                break;
            case 'materials':
                materialsSection.style.display = 'block';
                pageTitle.innerHTML = '<i class="fas fa-book"></i><span>Учебные материалы</span>';
                break;
        }
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`.nav-item[data-section="${section}"]`).classList.add('active');
    }
    
    // Выход из системы
    function logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            localStorage.removeItem('auth');
            window.location.href = 'index.html';
        }
    }
    
    // Загрузка данных класса
    function loadClassData() {
        if (!currentClass) return;
        
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const selectedClass = classes.find(c => c.id === currentClass);
        
        if (!selectedClass) {
            alert('Класс не найден');
            return;
        }
        
        loadStudents(selectedClass);
    }
    
    // Загрузка списка учеников
    function loadStudents(classData) {
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        const students = classData.students 
            ? classData.students.map(studentId => 
                users.find(u => u.id == studentId && u.type === 'student'))
                .filter(Boolean)
            : [];
        
        renderStudentsTable(students);
    }
    
    // Отображение таблицы учеников
    function renderStudentsTable(students) {
        gradesTableBody.innerHTML = '';
        datesRow.innerHTML = '';
        
        // Добавляем заголовок для средней оценки
        const averageHeader = document.createElement('div');
        averageHeader.className = 'average-col';
        averageHeader.textContent = 'Средний балл';
        document.querySelector('.table-header').appendChild(averageHeader);
    
        if (students.length === 0) {
            gradesTableBody.innerHTML = '<div class="no-data">В классе нет учеников</div>';
            return;
        }
    
        // Генерация дат (последние 14 дней)
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            
            const dateEl = document.createElement('div');
            dateEl.className = 'date-col';
            dateEl.textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            datesRow.appendChild(dateEl);
        }
    
        students.forEach(student => {
            const studentRow = document.createElement('div');
            studentRow.className = 'student-row';
            
            // Ячейка с ФИО ученика
            const nameCell = document.createElement('div');
            nameCell.className = 'student-cell';
            nameCell.textContent = `${student.lastName} ${student.firstName[0]}.${student.middleName ? student.middleName[0] + '.' : ''}`;
            studentRow.appendChild(nameCell);
    
            // Собираем все оценки ученика для расчета среднего
            let studentGrades = [];
            
            // Ячейки с оценками
            dates.forEach(date => {
                const dateStr = date.toISOString().split('T')[0];
                const gradeCell = document.createElement('div');
                gradeCell.className = 'grade-cell';
                gradeCell.dataset.studentId = student.id;
                gradeCell.dataset.date = dateStr;
                
                const grade = getGradeForStudent(student.id, dateStr);
                if (grade) {
                    gradeCell.textContent = grade.value;
                    gradeCell.classList.add(`grade-${grade.value}`);
                    if (grade.comment) {
                        gradeCell.title = grade.comment;
                    }
                    studentGrades.push(parseInt(grade.value));
                }
                
                studentRow.appendChild(gradeCell);
            });
    
            // Ячейка со средним баллом
            const averageCell = document.createElement('div');
            averageCell.className = 'average-cell';
            
            if (studentGrades.length > 0) {
                const average = calculateStudentAverage(studentGrades);
                averageCell.textContent = average.toFixed(2);
                
                // Добавляем цвет в зависимости от среднего балла
                if (average >= 4.5) {
                    averageCell.style.color = '#28a745'; // Зеленый
                } else if (average >= 3.5) {
                    averageCell.style.color = '#17a2b8'; // Голубой
                } else if (average >= 2.5) {
                    averageCell.style.color = '#ffc107'; // Желтый
                } else {
                    averageCell.style.color = '#dc3545'; // Красный
                }
            } else {
                averageCell.textContent = '-';
            }
            
            studentRow.appendChild(averageCell);
            gradesTableBody.appendChild(studentRow);
        });
    
        calculateStatistics(students);
    }
    
    // Новая функция для расчета среднего балла ученика
    function calculateStudentAverage(grades) {
        if (!grades || grades.length === 0) return 0;
        const sum = grades.reduce((total, grade) => total + grade, 0);
        return sum / grades.length;
    }
    
    // Получение оценки для ученика на определенную дату
    function getGradeForStudent(studentId, dateStr) {
        if (!gradesData[currentClass] || 
            !gradesData[currentClass][currentSubject] || 
            !gradesData[currentClass][currentSubject][studentId]) {
            return null;
        }
        
        return gradesData[currentClass][currentSubject][studentId].find(
            g => g.date === dateStr
        );
    }
    
    // Загрузка оценок
    function loadGrades() {
        if (!currentClass || !currentSubject) {
            return;
        }
        
        // Здесь должна быть загрузка оценок с сервера
        // Для примера используем localStorage
        const allGrades = JSON.parse(localStorage.getItem('teacher_grades')) || {};
        
        if (allGrades[currentClass] && allGrades[currentClass][currentSubject]) {
            gradesData[currentClass][currentSubject] = allGrades[currentClass][currentSubject];
        } else {
            gradesData[currentClass] = gradesData[currentClass] || {};
            gradesData[currentClass][currentSubject] = {};
        }
        
        // Обновление таблицы
        const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
            .find(c => c.id === currentClass);
        loadStudents(selectedClass);
    }
    
    // Расчет статистики
    function calculateStatistics(students) {
        if (students.length === 0) {
            classAverageEl.textContent = '-';
            performanceEl.textContent = '-';
            knowledgeQualityEl.textContent = '-';
            return;
        }
        
        let total = 0;
        let count = 0;
        let goodGrades = 0;
        let studentAverages = [];
    
        students.forEach(student => {
            if (gradesData[currentClass] && gradesData[currentClass][currentSubject] && 
                gradesData[currentClass][currentSubject][student.id]) {
                
                const studentGrades = gradesData[currentClass][currentSubject][student.id];
                studentGrades.forEach(grade => {
                    total += parseInt(grade.value);
                    count++;
                    if (grade.value >= 4) goodGrades++;
                });
                
                // Рассчитываем средний балл для ученика
                if (studentGrades.length > 0) {
                    const sum = studentGrades.reduce((acc, grade) => acc + parseInt(grade.value), 0);
                    studentAverages.push(sum / studentGrades.length);
                }
            }
        });
        
        // Обновляем статистику класса
        if (count > 0) {
            const average = (total / count).toFixed(2);
            const performance = ((count / (students.length * 14)) * 100).toFixed(0);
            const quality = ((goodGrades / count) * 100).toFixed(0);
            
            classAverageEl.textContent = average;
            performanceEl.textContent = `${performance}%`;
            knowledgeQualityEl.textContent = `${quality}%`;
        } else {
            classAverageEl.textContent = '-';
            performanceEl.textContent = '-';
            knowledgeQualityEl.textContent = '-';
        }
    }
    
    // Открытие модального окна для оценки
    function openGradeModal(gradeCell) {
        const studentId = gradeCell.dataset.studentId;
        const date = gradeCell.dataset.date;
        
        // Заполнение данных
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        const student = users.find(u => u.id == studentId);
        
        document.getElementById('gradeStudent').value = 
            `${student.lastName} ${student.firstName}`;
        document.getElementById('gradeDate').value = date;
        
        // Если оценка уже есть, заполняем форму
        const existingGrade = getGradeForStudent(studentId, new Date(date));
        if (existingGrade) {
            document.getElementById('gradeValue').value = existingGrade.value;
            document.getElementById('gradeComment').value = existingGrade.comment || '';
        } else {
            document.getElementById('gradeValue').value = '5';
            document.getElementById('gradeComment').value = '';
        }
        
        // Сохраняем ID студента и дату в форме
        addGradeForm.dataset.studentId = studentId;
        addGradeForm.dataset.date = date;
        
        addGradeModal.style.display = 'block';
    }
    
    // Обновленная функция для сохранения оценки
function saveGrade() {
    const studentId = addGradeForm.dataset.studentId;
    const date = addGradeForm.dataset.date;
    
    const grade = {
        value: document.getElementById('gradeValue').value,
        date: date,
        comment: document.getElementById('gradeComment').value || ''
    };
    
    // Инициализация структур данных, если их нет
    if (!gradesData[currentClass]) gradesData[currentClass] = {};
    if (!gradesData[currentClass][currentSubject]) gradesData[currentClass][currentSubject] = {};
    if (!gradesData[currentClass][currentSubject][studentId]) {
        gradesData[currentClass][currentSubject][studentId] = [];
    }
    
    // Удаление старой оценки на эту дату (если есть)
    gradesData[currentClass][currentSubject][studentId] = 
        gradesData[currentClass][currentSubject][studentId].filter(
            g => g.date !== date
        );
    
    // Добавление новой оценки
    gradesData[currentClass][currentSubject][studentId].push(grade);
    
    // Сохранение в localStorage
    saveGradesToStorage();
    
    // Закрытие модального окна
    addGradeModal.style.display = 'none';
    
    // Обновление таблицы
    updateGradesTable();
}

// Новая функция для сохранения оценок в localStorage
function saveGradesToStorage() {
    try {
        localStorage.setItem('teacher_grades', JSON.stringify(gradesData));
        return true;
    } catch (error) {
        console.error('Ошибка сохранения оценок:', error);
        return false;
    }
}

// Обновленная функция загрузки оценок
function loadGrades() {
    if (!currentClass || !currentSubject) {
        return;
    }
    
    try {
        const savedGrades = localStorage.getItem('teacher_grades');
        if (savedGrades) {
            gradesData = JSON.parse(savedGrades);
        } else {
            gradesData = {};
        }
        
        // Инициализация структуры данных, если ее нет
        if (!gradesData[currentClass]) gradesData[currentClass] = {};
        if (!gradesData[currentClass][currentSubject]) {
            gradesData[currentClass][currentSubject] = {};
        }
        
        updateGradesTable();
    } catch (error) {
        console.error('Ошибка загрузки оценок:', error);
        gradesData = {};
    }
}

// Обновленная функция для обновления таблицы оценок
function updateGradesTable() {
    if (!currentClass || !currentSubject) return;
    
    const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
        .find(c => c.id === currentClass);
    if (!selectedClass) return;
    
    const users = JSON.parse(localStorage.getItem('admin_users')) || [];
    const students = selectedClass.students 
        ? selectedClass.students.map(studentId => 
            users.find(u => u.id == studentId && u.type === 'student'))
            .filter(Boolean)
        : [];
    
    renderStudentsTable(students);
}
    
    // Удаление оценки из модального окна
    function deleteGradeFromModal() {
        const studentId = addGradeForm.dataset.studentId;
        const date = addGradeForm.dataset.date;
        
        if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
            return;
        }
        
        if (!gradesData[currentClass] || !gradesData[currentClass][currentSubject] || 
            !gradesData[currentClass][currentSubject][studentId]) {
            return;
        }
        
        // Удаляем оценку
        gradesData[currentClass][currentSubject][studentId] = 
            gradesData[currentClass][currentSubject][studentId].filter(
                g => g.date !== date
            );
        
        // Сохраняем изменения
        localStorage.setItem('teacher_grades', JSON.stringify(gradesData));
        
        // Закрытие модального окна
        addGradeModal.style.display = 'none';
        
        // Обновление таблицы
        loadGrades();
    }
    
    // Удаление оценки по Ctrl+клик
    function deleteGrade(gradeCell) {
        const studentId = gradeCell.dataset.studentId;
        const date = gradeCell.dataset.date;
        
        if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
            return;
        }
        
        if (!gradesData[currentClass] || !gradesData[currentClass][currentSubject] || 
            !gradesData[currentClass][currentSubject][studentId]) {
            return;
        }
        
        // Удаляем оценку
        gradesData[currentClass][currentSubject][studentId] = 
            gradesData[currentClass][currentSubject][studentId].filter(
                g => g.date !== date
            );
        
        // Сохраняем изменения
        localStorage.setItem('teacher_grades', JSON.stringify(gradesData));
        
        // Обновление таблицы
        loadGrades();
    }
    
    // Экспорт оценок
    function exportGrades() {
        if (!currentClass || !currentSubject) {
            alert('Сначала выберите класс и предмет');
            return;
        }
        
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const selectedClass = classes.find(c => c.id === currentClass);
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        
        let csvContent = "ФИО;";
        
        // Заголовки с датами
        const dateCols = document.querySelectorAll('.date-col');
        dateCols.forEach(col => {
            csvContent += `${col.textContent};`;
        });
        csvContent += "\n";
        
        // Данные по ученикам
        document.querySelectorAll('.student-row').forEach(row => {
            const studentName = row.querySelector('.student-cell').textContent;
            csvContent += `${studentName};`;
            
            row.querySelectorAll('.grade-cell').forEach(cell => {
                csvContent += `${cell.textContent || ''};`;
            });
            
            csvContent += "\n";
        });
        
        // Создание и скачивание файла
        const blob = new Blob(["\uFEFF" + csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `Оценки_${selectedClass.name}_${currentSubject}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }
    
    // Печать журнала
    function printGrades() {
        window.print();
    }
    
    // Загрузка расписания
    function loadSchedule() {
        // Здесь должна быть загрузка с сервера
        // Для примера создаем тестовое расписание
        scheduleData = {
            '1А': {
                'monday': [
                    { time: '08:00-08:45', subject: 'Математика', room: '101' },
                    { time: '09:00-09:45', subject: 'Русский язык', room: '102' }
                ],
                'tuesday': [
                    { time: '08:00-08:45', subject: 'Литература', room: '103' }
                ]
            }
        };
        
        renderSchedule();
    }
    
    // Отображение расписания
    function renderSchedule() {
        if (!currentClass) return;
        
        const scheduleTable = document.getElementById('scheduleTable');
        scheduleTable.innerHTML = '';
        
        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
        const dayNames = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];
        
        days.forEach((day, index) => {
            const dayRow = document.createElement('div');
            dayRow.className = 'schedule-day';
            
            const dayHeader = document.createElement('div');
            dayHeader.className = 'day-header';
            dayHeader.textContent = dayNames[index];
            dayRow.appendChild(dayHeader);
            
            const lessons = scheduleData[currentClass]?.[day] || [];
            
            if (lessons.length === 0) {
                const emptyCell = document.createElement('div');
                emptyCell.className = 'lesson-empty';
                emptyCell.textContent = 'Нет уроков';
                dayRow.appendChild(emptyCell);
            } else {
                lessons.forEach(lesson => {
                    const lessonCell = document.createElement('div');
                    lessonCell.className = 'lesson-item';
                    lessonCell.innerHTML = `
                        <div class="lesson-time">${lesson.time}</div>
                        <div class="lesson-subject">${lesson.subject}</div>
                        <div class="lesson-room">Каб. ${lesson.room}</div>
                    `;
                    dayRow.appendChild(lessonCell);
                });
            }
            
            scheduleTable.appendChild(dayRow);
        });
    }
    
    // Загрузка учебных материалов
    function loadMaterials() {
        // Здесь должна быть загрузка с сервера
        // Для примера создаем тестовые данные
        materialsData = [
            {
                id: 1,
                title: 'Презентация по математике',
                subject: 'mathematics',
                class: '1А',
                file: 'math_presentation.pdf',
                date: '2023-10-15'
            },
            {
                id: 2,
                title: 'Тест по русскому языку',
                subject: 'russian',
                class: '1А',
                file: 'russian_test.docx',
                date: '2023-10-10'
            }
        ];
        
        renderMaterials();
    }
    
    // Отображение учебных материалов
    function renderMaterials() {
        materialsGrid.innerHTML = '';
        
        if (materialsData.length === 0) {
            materialsGrid.innerHTML = '<div class="no-data">Нет учебных материалов</div>';
            return;
        }
        
        materialsData.forEach(material => {
            const materialCard = document.createElement('div');
            materialCard.className = 'material-card';
            materialCard.innerHTML = `
                <div class="material-header">
                    <h3>${material.title}</h3>
                    <div class="material-meta">
                        <span class="subject-badge">${getSubjectName(material.subject)}</span>
                        <span>${material.class} класс</span>
                    </div>
                </div>
                <div class="material-footer">
                    <a href="#" class="btn btn-outline download-btn" data-file="${material.file}">
                        <i class="fas fa-download"></i> Скачать
                    </a>
                    <span class="material-date">${material.date}</span>
                </div>
            `;
            
            materialsGrid.appendChild(materialCard);
        });
    }
    
    // Получение названия предмета по ключу
    function getSubjectName(key) {
        const subjects = {
            'mathematics': 'Математика',
            'russian': 'Русский язык',
            'literature': 'Литература'
        };
        return subjects[key] || key;
    }
    
    // Открытие модального окна для добавления материала
    function openAddMaterialModal() {
        const modal = document.getElementById('addMaterialModal');
        const form = document.getElementById('addMaterialForm');
        
        // Заполнение списка предметов
        const subjectSelect = document.getElementById('materialSubject');
        subjectSelect.innerHTML = '';
        
        const subjects = [
            'Математика', 'Русский язык', 'Литература', 'Иностранный язык'
        ];
        
        subjects.forEach(subj => {
            const option = document.createElement('option');
            option.value = subj.toLowerCase().replace(/\s+/g, '_');
            option.textContent = subj;
            subjectSelect.appendChild(option);
        });
        
        // Заполнение списка классов
        const classSelect = document.getElementById('materialClass');
        classSelect.innerHTML = '';
        
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            classSelect.appendChild(option);
        });
        
        // Обработчик отправки формы
        form.onsubmit = function(e) {
            e.preventDefault();
            
            const newMaterial = {
                id: materialsData.length + 1,
                title: document.getElementById('materialTitle').value,
                subject: document.getElementById('materialSubject').value,
                class: document.getElementById('materialClass').value,
                file: document.getElementById('materialFile').files[0]?.name || 'file',
                date: new Date().toISOString().split('T')[0]
            };
            
            materialsData.push(newMaterial);
            localStorage.setItem('teacher_materials', JSON.stringify(materialsData));
            
            modal.style.display = 'none';
            renderMaterials();
        };
        
        modal.style.display = 'block';
    }
    
    // Если страница уже загружена
    if (document.readyState === 'complete') {
        initApp();
    }
});