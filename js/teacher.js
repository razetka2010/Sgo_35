document.addEventListener('DOMContentLoaded', function() {
    // Подключаем модуль AdminCore
    const AdminCore = (function() {
        return window.AdminCore || {};
    })();

    // Основные переменные приложения
    let currentClass = null;
    let currentSubject = null;
    let currentPeriod = 'current';
    let gradesData = {};
    let scheduleData = {};
    let materialsData = [];
    let currentMaterial = null;

    // Проверка и получение элементов DOM
    function getElementByIdOrError(id) {
        const element = document.getElementById(id);
        if (!element) {
            console.warn(`Элемент с ID "${id}" не найден`);
            return document.createElement('div'); // Возвращаем пустой div вместо ошибки
        }
        return element;
    }

    // Получаем элементы DOM с проверкой
    const elements = {
        userAvatar: getElementByIdOrError('userAvatar'),
        userName: getElementByIdOrError('userName'),
        userRole: getElementByIdOrError('userRole'),
        classSelect: getElementByIdOrError('classSelect'),
        subjectSelect: getElementByIdOrError('subjectSelect'),
        periodSelect: getElementByIdOrError('periodSelect'),
        gradesTableBody: getElementByIdOrError('gradesTableBody'),
        datesRow: document.querySelector('.dates-row'),
        classAverageEl: getElementByIdOrError('classAverage'),
        performanceEl: getElementByIdOrError('performance'),
        knowledgeQualityEl: getElementByIdOrError('knowledgeQuality'),
        scheduleSection: getElementByIdOrError('scheduleSection'),
        classesSection: getElementByIdOrError('classesSection'),
        materialsSection: getElementByIdOrError('materialsSection'),
        addGradeModal: getElementByIdOrError('addGradeModal'),
        addGradeForm: getElementByIdOrError('addGradeForm'),
        deleteGradeBtn: getElementByIdOrError('deleteGradeBtn'),
        exportBtn: getElementByIdOrError('exportBtn'),
        printBtn: getElementByIdOrError('printBtn'),
        addMaterialBtn: getElementByIdOrError('addMaterialBtn'),
        materialsTableBody: getElementByIdOrError('materialsTableBody'),
        logoutBtn: getElementByIdOrError('logoutBtn'),
        materialsClassFilter: getElementByIdOrError('materialsClassFilter'),
        materialsSubjectFilter: getElementByIdOrError('materialsSubjectFilter'),
        materialsDateFilter: getElementByIdOrError('materialsDateFilter'),
        addMaterialModal: getElementByIdOrError('addMaterialModal'),
        addMaterialForm: getElementByIdOrError('addMaterialForm'),
        cancelMaterialBtn: getElementByIdOrError('cancelMaterialBtn'),
        materialModalTitle: getElementByIdOrError('materialModalTitle'),
        materialId: getElementByIdOrError('materialId'),
        materialDate: getElementByIdOrError('materialDate'),
        materialClass: getElementByIdOrError('materialClass'),
        materialSubject: getElementByIdOrError('materialSubject'),
        materialTopic: getElementByIdOrError('materialTopic'),
        materialHomework: getElementByIdOrError('materialHomework'),
        materialNotes: getElementByIdOrError('materialNotes'),
        materialFile: getElementByIdOrError('materialFile'),
        materialFilePreview: getElementByIdOrError('materialFilePreview')
    };

    // Инициализация приложения
    function initApp() {
        if (!checkAuth()) return;
        initUserData();
        initSelects();
        initEventListeners();
        loadInitialData();
        initMaterialsSection();
    }

    // Проверка авторизации пользователя
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
            const nameParts = authData.fullName.split(' ').filter(part => part.length > 0);
            const initials = nameParts.map(part => part[0]).join('').toUpperCase().substring(0, 2);
            elements.userAvatar.textContent = initials;
            
            // Установка имени и роли
            elements.userName.textContent = authData.fullName;
            elements.userRole.textContent = authData.isAdmin ? 'Администратор' : 'Учитель';
        }
    }

    // Инициализация выпадающих списков
    function initSelects() {
        // Очищаем существующие опции
        elements.classSelect.innerHTML = '<option value="" disabled selected>Выберите класс</option>';
        elements.subjectSelect.innerHTML = '<option value="" disabled selected>Выберите предмет</option>';

        // Загрузка классов
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        classes.forEach(classItem => {
            const option = document.createElement('option');
            option.value = classItem.id;
            option.textContent = classItem.name;
            elements.classSelect.appendChild(option);
        });
        
        // Загрузка предметов
        const defaultSubjects = [
            'Математика', 'Русский язык', 'Литература', 'Иностранный язык',
            'История', 'Обществознание', 'География', 'Биология',
            'Физика', 'Химия', 'Информатика', 'Физкультура',
            'Технология', 'ИЗО', 'Музыка', 'ОБЖ'
        ];
        
        const subjects = AdminCore.getSubjects ? 
            AdminCore.getSubjects().sort((a, b) => a.localeCompare(b, 'ru')) : 
            defaultSubjects;
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.toLowerCase().replace(/\s+/g, '_');
            option.textContent = subject;
            elements.subjectSelect.appendChild(option);
        });
    }

    // Инициализация обработчиков событий
    function initEventListeners() {
        // Навигация по разделам
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', function() {
                const section = this.getAttribute('data-section');
                switchSection(section);
            });
        });
        
        // Фильтры журнала
        elements.classSelect.addEventListener('change', function() {
            currentClass = this.value;
            if (currentClass) {
                localStorage.setItem('teacher_lastClass', currentClass);
                loadClassData();
            }
        });
        
        elements.subjectSelect.addEventListener('change', function() {
            currentSubject = this.value;
            if (currentClass && currentSubject) {
                loadGrades();
            }
        });
        
        elements.periodSelect.addEventListener('change', function() {
            currentPeriod = this.value;
            if (currentClass && currentSubject) {
                loadGrades();
            }
        });
        
        // Кнопки действий
        elements.exportBtn.addEventListener('click', exportGrades);
        elements.printBtn.addEventListener('click', printGrades);
        elements.logoutBtn.addEventListener('click', logout);
        
        // Управление оценками
        elements.gradesTableBody.addEventListener('click', function(event) {
            const gradeCell = event.target.closest('.grade-cell');
            if (!gradeCell) return;
            
            if (event.ctrlKey) {
                deleteGrade(gradeCell);
            } else {
                openGradeModal(gradeCell);
            }
        });
        
        // Модальное окно оценки
        elements.addGradeForm.addEventListener('submit', function(event) {
            event.preventDefault();
            saveGrade();
        });
        
        elements.deleteGradeBtn.addEventListener('click', deleteGradeFromModal);
    }

    // Загрузка начальных данных
    function loadInitialData() {
        const lastClass = localStorage.getItem('teacher_lastClass');
        if (lastClass) {
            elements.classSelect.value = lastClass;
            currentClass = lastClass;
            loadClassData();
        }
        
        // Загрузка расписания
        loadSchedule();
    }

    // Переключение между разделами
    function switchSection(section) {
        // Скрываем все разделы
        document.querySelector('.grades-container').style.display = 'none';
        elements.scheduleSection.style.display = 'none';
        elements.classesSection.style.display = 'none';
        elements.materialsSection.style.display = 'none';
        
        // Показываем выбранный раздел
        switch(section) {
            case 'grades':
                document.querySelector('.grades-container').style.display = 'block';
                updatePageTitle('<i class="fas fa-book-open"></i><span>Журнал оценок</span>');
                break;
            case 'schedule':
                elements.scheduleSection.style.display = 'block';
                updatePageTitle('<i class="fas fa-calendar-alt"></i><span>Расписание</span>');
                break;
            case 'students':
                elements.classesSection.style.display = 'block';
                updatePageTitle('<i class="fas fa-users"></i><span>Мои классы</span>');
                loadTeacherClasses();
                break;
            case 'materials':
                elements.materialsSection.style.display = 'block';
                updatePageTitle('<i class="fas fa-book"></i><span>Учебные материалы</span>');
                break;
        }
        
        // Обновляем активный пункт меню
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('data-section') === section) {
                item.classList.add('active');
            }
        });
    }

    function updatePageTitle(html) {
        const titleElement = document.querySelector('.page-title');
        if (titleElement) {
            titleElement.innerHTML = html;
        }
    }

    // Загрузка данных класса
    function loadClassData() {
        if (!currentClass) return;
        
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const selectedClass = classes.find(classItem => classItem.id === currentClass);
        
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
                users.find(user => user.id == studentId && user.type === 'student'))
                .filter(Boolean)
            : [];
        
        renderStudentsTable(students);
    }

    // Отображение таблицы учеников с оценками
    function renderStudentsTable(students) {
        // Очищаем таблицу
        elements.gradesTableBody.innerHTML = '';
        elements.datesRow.innerHTML = '';
        
        if (students.length === 0) {
            elements.gradesTableBody.innerHTML = '<div class="no-data">В классе нет учеников</div>';
            return;
        }
        
        // Генерация дат (последние 14 дней)
        const dates = [];
        const today = new Date();
        for (let i = 0; i < 14; i++) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            dates.push(date);
            
            // Добавляем дату в заголовок
            const dateEl = document.createElement('div');
            dateEl.className = 'date-col';
            dateEl.textContent = date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
            dateEl.dataset.date = date.toISOString().split('T')[0];
            elements.datesRow.appendChild(dateEl);
        }
        
        // Добавляем учеников в таблицу
        students.forEach(student => {
            const studentRow = document.createElement('div');
            studentRow.className = 'student-row';
            
            // Ячейка с ФИО ученика
            const nameCell = document.createElement('div');
            nameCell.className = 'student-cell';
            nameCell.textContent = `${student.lastName} ${student.firstName[0]}.${student.middleName ? student.middleName[0] + '.' : ''}`;
            studentRow.appendChild(nameCell);
            
            // Собираем все оценки ученика для расчета среднего
            let sumGrades = 0;
            let countGrades = 0;
            
            // Ячейки с оценками
            dates.forEach(date => {
                const dateStr = date.toISOString().split('T')[0];
                const gradeCell = document.createElement('div');
                gradeCell.className = 'grade-cell';
                gradeCell.dataset.studentId = student.id;
                gradeCell.dataset.date = dateStr;
                
                // Проверяем наличие оценки
                const grade = getGradeForStudent(student.id, dateStr);
                if (grade) {
                    gradeCell.textContent = grade.value;
                    gradeCell.classList.add(`grade-${grade.value}`);
                    if (grade.comment) {
                        gradeCell.title = grade.comment;
                    }
                    sumGrades += parseInt(grade.value);
                    countGrades++;
                }
                
                studentRow.appendChild(gradeCell);
            });
            
            // Ячейка со средним баллом
            const averageCell = document.createElement('div');
            averageCell.className = 'average-cell';
            
            if (countGrades > 0) {
                const average = sumGrades / countGrades;
                averageCell.textContent = average.toFixed(2);
                
                // Цвет в зависимости от среднего балла
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
            elements.gradesTableBody.appendChild(studentRow);
        });
        
        // Расчет статистики класса
        calculateStatistics(students);
    }

    // Получение оценки для ученика на определенную дату
    function getGradeForStudent(studentId, dateStr) {
        if (!gradesData[currentClass] || 
            !gradesData[currentClass][currentSubject] || 
            !gradesData[currentClass][currentSubject][studentId]) {
            return null;
        }
        
        return gradesData[currentClass][currentSubject][studentId].find(
            grade => grade.date === dateStr
        );
    }

    // Загрузка оценок
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
            
            // Инициализация структуры данных
            if (!gradesData[currentClass]) gradesData[currentClass] = {};
            if (!gradesData[currentClass][currentSubject]) {
                gradesData[currentClass][currentSubject] = {};
            }
            
            // Обновление таблицы
            const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
                .find(classItem => classItem.id === currentClass);
            if (selectedClass) {
                loadStudents(selectedClass);
            }
        } catch (error) {
            console.error('Ошибка загрузки оценок:', error);
            gradesData = {};
        }
    }

    // Расчет статистики класса
    function calculateStatistics(students) {
        if (students.length === 0) {
            elements.classAverageEl.textContent = '-';
            elements.performanceEl.textContent = '-';
            elements.knowledgeQualityEl.textContent = '-';
            return;
        }
        
        let total = 0;
        let count = 0;
        let goodGrades = 0;
        let studentAverages = [];
        
        students.forEach(student => {
            if (gradesData[currentClass] && 
                gradesData[currentClass][currentSubject] && 
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
            
            elements.classAverageEl.textContent = average;
            elements.performanceEl.textContent = `${performance}%`;
            elements.knowledgeQualityEl.textContent = `${quality}%`;
        } else {
            elements.classAverageEl.textContent = '-';
            elements.performanceEl.textContent = '-';
            elements.knowledgeQualityEl.textContent = '-';
        }
    }

    // Открытие модального окна для оценки
    function openGradeModal(gradeCell) {
        const studentId = gradeCell.dataset.studentId;
        const date = gradeCell.dataset.date;
        
        // Заполнение данных
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        const student = users.find(user => user.id == studentId);
        
        document.getElementById('gradeStudent').value = 
            `${student.lastName} ${student.firstName}`;
        document.getElementById('gradeDate').value = date;
        
        // Если оценка уже есть, заполняем форму
        const existingGrade = getGradeForStudent(studentId, date);
        if (existingGrade) {
            document.getElementById('gradeValue').value = existingGrade.value;
            document.getElementById('gradeComment').value = existingGrade.comment || '';
        } else {
            document.getElementById('gradeValue').value = '5';
            document.getElementById('gradeComment').value = '';
        }
        
        // Сохраняем ID студента и дату в форме
        elements.addGradeForm.dataset.studentId = studentId;
        elements.addGradeForm.dataset.date = date;
        
        elements.addGradeModal.style.display = 'block';
    }

    // Сохранение оценки
    function saveGrade() {
        const studentId = elements.addGradeForm.dataset.studentId;
        const date = elements.addGradeForm.dataset.date;
        
        const grade = {
            value: document.getElementById('gradeValue').value,
            date: date,
            comment: document.getElementById('gradeComment').value || ''
        };
        
        // Инициализация структур данных
        if (!gradesData[currentClass]) gradesData[currentClass] = {};
        if (!gradesData[currentClass][currentSubject]) gradesData[currentClass][currentSubject] = {};
        if (!gradesData[currentClass][currentSubject][studentId]) {
            gradesData[currentClass][currentSubject][studentId] = [];
        }
        
        // Удаление старой оценки на эту дату
        gradesData[currentClass][currentSubject][studentId] = 
            gradesData[currentClass][currentSubject][studentId].filter(
                g => g.date !== date
            );
        
        // Добавление новой оценки
        gradesData[currentClass][currentSubject][studentId].push(grade);
        
        // Сохранение в localStorage
        localStorage.setItem('teacher_grades', JSON.stringify(gradesData));
        
        // Закрытие модального окна
        elements.addGradeModal.style.display = 'none';
        
        // Обновление таблицы
        const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
            .find(classItem => classItem.id === currentClass);
        if (selectedClass) {
            loadStudents(selectedClass);
        }
    }

    // Удаление оценки из модального окна
    function deleteGradeFromModal() {
        const studentId = elements.addGradeForm.dataset.studentId;
        const date = elements.addGradeForm.dataset.date;
        
        if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
            return;
        }
        
        if (!gradesData[currentClass] || 
            !gradesData[currentClass][currentSubject] || 
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
        elements.addGradeModal.style.display = 'none';
        
        // Обновление таблицы
        const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
            .find(classItem => classItem.id === currentClass);
        if (selectedClass) {
            loadStudents(selectedClass);
        }
    }

    // Удаление оценки по Ctrl+клик
    function deleteGrade(gradeCell) {
        const studentId = gradeCell.dataset.studentId;
        const date = gradeCell.dataset.date;
        
        if (!confirm('Вы уверены, что хотите удалить эту оценку?')) {
            return;
        }
        
        if (!gradesData[currentClass] || 
            !gradesData[currentClass][currentSubject] || 
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
        const selectedClass = JSON.parse(localStorage.getItem('admin_classes'))
            .find(classItem => classItem.id === currentClass);
        if (selectedClass) {
            loadStudents(selectedClass);
        }
    }

    // Экспорт оценок
    function exportGrades() {
        if (!currentClass || !currentSubject) {
            alert('Сначала выберите класс и предмет');
            return;
        }
        
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const selectedClass = classes.find(classItem => classItem.id === currentClass);
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        
        let csvContent = "ФИО;";
        
        // Заголовки с датами
        const dateCols = document.querySelectorAll('.date-col');
        dateCols.forEach(col => {
            csvContent += `${col.textContent};`;
        });
        csvContent += "Средний балл\n";
        
        // Данные по ученикам
        document.querySelectorAll('.student-row').forEach(row => {
            const studentName = row.querySelector('.student-cell').textContent;
            csvContent += `${studentName};`;
            
            row.querySelectorAll('.grade-cell').forEach(cell => {
                csvContent += `${cell.textContent || ''};`;
            });
            
            const average = row.querySelector('.average-cell').textContent;
            csvContent += `${average}\n`;
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
        if (!scheduleTable) return;
        
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

    // Загрузка классов учителя
    function loadTeacherClasses() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        const users = JSON.parse(localStorage.getItem('admin_users')) || [];
        
        // Находим классы, где текущий учитель является классным руководителем
        const teacherClasses = classes.filter(classItem => {
            return classItem.teacherId && users.some(user => 
                user.id == classItem.teacherId && user.username === authData.username);
        });
        
        renderTeacherClasses(teacherClasses, users);
    }

    // Отображение классов учителя
    function renderTeacherClasses(classes, users) {
        const classesList = document.getElementById('classesList');
        if (!classesList) return;
        
        if (classes.length === 0) {
            classesList.innerHTML = '<div class="no-data">Вам не назначены классы</div>';
            return;
        }
        
        classesList.innerHTML = classes.map(classItem => {
            // Находим учеников класса
            const students = classItem.students 
                ? classItem.students.map(studentId => 
                    users.find(user => user.id == studentId && user.type === 'student'))
                    .filter(Boolean)
                : [];
            
            return `
                <div class="class-card">
                    <h3>${classItem.name}</h3>
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

    // Форматирование информации о родителях
    function formatParentsInfo(parents) {
        if (!parents) return 'не указаны';
        
        try {
            const parentsData = parents.split(',');
            let result = [];
            
            parentsData.forEach(parent => {
                const [type, name] = parent.split(':');
                if (type && name) {
                    result.push(`${type === 'mother' ? 'Мать' : 'Отец'}: ${name}`);
                }
            });
            
            return result.join('<br>');
        } catch (e) {
            return parents;
        }
    }

    // Инициализация раздела материалов
    function initMaterialsSection() {
        loadMaterials();
        
        // Обработчики событий
        elements.addMaterialBtn.addEventListener('click', showAddMaterialModal);
        elements.cancelMaterialBtn.addEventListener('click', closeMaterialModal);
        elements.addMaterialForm.addEventListener('submit', saveMaterial);
        
        // Инициализация фильтров
        initMaterialFilters();
        
        // Обработчики для фильтров
        elements.materialsClassFilter.addEventListener('change', renderMaterials);
        elements.materialsSubjectFilter.addEventListener('change', renderMaterials);
        elements.materialsDateFilter.addEventListener('change', renderMaterials);
    }

    // Загрузка учебных материалов
    function loadMaterials() {
        const savedMaterials = localStorage.getItem('teacher_materials');
        if (savedMaterials) {
            materialsData = JSON.parse(savedMaterials);
        } else {
            // Тестовые данные, если нет сохраненных
            materialsData = [
                {
                    id: 1,
                    date: new Date().toISOString().split('T')[0],
                    class: '1А',
                    subject: 'mathematics',
                    topic: 'Алгебраические уравнения',
                    homework: 'Стр. 45, №1-5',
                    notes: 'Для самостоятельного изучения',
                    file: 'math_presentation.pdf'
                },
                {
                    id: 2,
                    date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
                    class: '1Б',
                    subject: 'russian',
                    topic: 'Части речи',
                    homework: 'Упражнение 23',
                    notes: 'Повторить правила',
                    file: 'russian_test.docx'
                }
            ];
            localStorage.setItem('teacher_materials', JSON.stringify(materialsData));
        }
        renderMaterials();
    }

    // Инициализация фильтров материалов
    function initMaterialFilters() {
        // Очистка фильтров
        elements.materialsClassFilter.innerHTML = '<option value="">Все классы</option>';
        elements.materialsSubjectFilter.innerHTML = '<option value="">Все предметы</option>';
        
        // Заполнение классов
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            elements.materialsClassFilter.appendChild(option);
        });
        
        // Заполнение предметов
        const defaultSubjects = [
            'Математика', 'Русский язык', 'Литература', 'Иностранный язык',
            'История', 'Обществознание', 'География', 'Биология',
            'Физика', 'Химия', 'Информатика', 'Физкультура',
            'Технология', 'ИЗО', 'Музыка', 'ОБЖ'
        ];
        
        const subjects = AdminCore.getSubjects ? AdminCore.getSubjects() : defaultSubjects;
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.toLowerCase().replace(/\s+/g, '_');
            option.textContent = subject;
            elements.materialsSubjectFilter.appendChild(option);
        });
    }

    // Отображение учебных материалов
    function renderMaterials() {
        const classFilter = elements.materialsClassFilter.value;
        const subjectFilter = elements.materialsSubjectFilter.value;
        const dateFilter = elements.materialsDateFilter.value;
        
        // Фильтрация материалов
        const filteredMaterials = materialsData.filter(material => {
            if (classFilter && material.class !== classFilter) return false;
            if (subjectFilter && material.subject !== subjectFilter) return false;
            if (dateFilter && material.date !== dateFilter) return false;
            return true;
        });
        
        // Обновление таблицы
        elements.materialsTableBody.innerHTML = filteredMaterials.map(material => `
            <tr>
                <td>${formatDate(material.date)}</td>
                <td>${material.class}</td>
                <td>${getSubjectName(material.subject)}</td>
                <td>${material.topic}</td>
                <td>${material.homework || '-'}</td>
                <td>${material.notes || '-'}</td>
                <td class="action-buttons">
                    <button class="btn btn-sm btn-edit edit-material" data-id="${material.id}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger delete-material" data-id="${material.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `).join('');
        
        // Добавляем обработчики событий для кнопок
        document.querySelectorAll('.edit-material').forEach(btn => {
            btn.addEventListener('click', () => editMaterial(btn.dataset.id));
        });
        
        document.querySelectorAll('.delete-material').forEach(btn => {
            btn.addEventListener('click', () => deleteMaterial(btn.dataset.id));
        });
    }

    // Получение названия предмета по ключу
    function getSubjectName(key) {
        const subjects = {
            'mathematics': 'Математика',
            'russian': 'Русский язык',
            'literature': 'Литература',
            'foreign_language': 'Иностранный язык',
            'history': 'История',
            'social_studies': 'Обществознание',
            'geography': 'География',
            'biology': 'Биология',
            'physics': 'Физика',
            'chemistry': 'Химия',
            'informatics': 'Информатика',
            'physical_education': 'Физкультура',
            'technology': 'Технология',
            'art': 'ИЗО',
            'music': 'Музыка',
            'safety': 'ОБЖ'
        };
        return subjects[key] || key;
    }

    // Форматирование даты
    function formatDate(dateString) {
        if (!dateString) return '';
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('ru-RU', options);
    }

    // Показать модальное окно для добавления/редактирования материала
    function showAddMaterialModal() {
        currentMaterial = null;
        elements.materialModalTitle.textContent = 'Добавить учебный материал';
        elements.addMaterialForm.reset();
        elements.materialId.value = '';
        elements.materialFilePreview.innerHTML = '';
        
        // Заполняем классы
        elements.materialClass.innerHTML = '<option value="" disabled selected>Выберите класс</option>';
        const classes = JSON.parse(localStorage.getItem('admin_classes')) || [];
        classes.forEach(cls => {
            const option = document.createElement('option');
            option.value = cls.id;
            option.textContent = cls.name;
            elements.materialClass.appendChild(option);
        });
        
        // Заполняем предметы
        elements.materialSubject.innerHTML = '<option value="" disabled selected>Выберите предмет</option>';
        const defaultSubjects = [
            'Математика', 'Русский язык', 'Литература', 'Иностранный язык',
            'История', 'Обществознание', 'География', 'Биология',
            'Физика', 'Химия', 'Информатика', 'Физкультура',
            'Технология', 'ИЗО', 'Музыка', 'ОБЖ'
        ];
        
        const subjects = AdminCore.getSubjects ? 
            AdminCore.getSubjects().sort((a, b) => a.localeCompare(b, 'ru')) : 
            defaultSubjects;
        
        subjects.forEach(subject => {
            const option = document.createElement('option');
            option.value = subject.toLowerCase().replace(/\s+/g, '_');
            option.textContent = subject;
            elements.materialSubject.appendChild(option);
        });
        
        // Устанавливаем текущую дату
        elements.materialDate.value = new Date().toISOString().split('T')[0];
        
        // Показываем модальное окно
        elements.addMaterialModal.style.display = 'block';
    }

    // Редактирование материала
    function editMaterial(id) {
        currentMaterial = materialsData.find(m => m.id == id);
        if (!currentMaterial) return;
        
        elements.materialModalTitle.textContent = 'Редактировать материал';
        elements.materialId.value = currentMaterial.id;
        elements.materialDate.value = currentMaterial.date;
        elements.materialClass.value = currentMaterial.class;
        elements.materialSubject.value = currentMaterial.subject;
        elements.materialTopic.value = currentMaterial.topic;
        elements.materialHomework.value = currentMaterial.homework || '';
        elements.materialNotes.value = currentMaterial.notes || '';
        
        // Превью файла
        elements.materialFilePreview.innerHTML = '';
        if (currentMaterial.file) {
            elements.materialFilePreview.innerHTML = `
                <div class="file-preview">
                    <i class="fas fa-file"></i>
                    <span>${typeof currentMaterial.file === 'string' ? currentMaterial.file : currentMaterial.file.name}</span>
                    <button type="button" class="btn btn-sm btn-danger" onclick="removeMaterialFile()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }
        
        // Показываем модальное окно
        elements.addMaterialModal.style.display = 'block';
    }

    // Удаление файла из материала
    function removeMaterialFile() {
        if (currentMaterial) {
            currentMaterial.file = null;
        }
        elements.materialFilePreview.innerHTML = '';
    }

    // Закрытие модального окна
    function closeMaterialModal() {
        elements.addMaterialModal.style.display = 'none';
        currentMaterial = null;
    }

    // Сохранение материала
    function saveMaterial(e) {
        e.preventDefault();
        
        const id = elements.materialId.value;
        const fileInput = elements.materialFile;
        
        const materialData = {
            id: id || Date.now().toString(),
            date: elements.materialDate.value,
            class: elements.materialClass.value,
            subject: elements.materialSubject.value,
            topic: elements.materialTopic.value,
            homework: elements.materialHomework.value || null,
            notes: elements.materialNotes.value || null,
            file: null
        };
        
        // Обработка файла
        if (fileInput.files && fileInput.files[0]) {
            materialData.file = {
                name: fileInput.files[0].name,
                size: fileInput.files[0].size,
                type: fileInput.files[0].type
            };
        } else if (currentMaterial && currentMaterial.file) {
            materialData.file = currentMaterial.file;
        }
        
        // Сохранение материала
        if (id) {
            // Обновление существующего материала
            const index = materialsData.findIndex(m => m.id == id);
            if (index !== -1) {
                materialsData[index] = materialData;
            }
        } else {
            // Добавление нового материала
            materialsData.push(materialData);
        }
        
        // Сохранение в localStorage
        localStorage.setItem('teacher_materials', JSON.stringify(materialsData));
        
        // Обновление интерфейса
        renderMaterials();
        closeMaterialModal();
    }

    // Удаление материала
    function deleteMaterial(id) {
        if (!confirm('Вы уверены, что хотите удалить этот материал?')) return;
        
        materialsData = materialsData.filter(m => m.id != id);
        localStorage.setItem('teacher_materials', JSON.stringify(materialsData));
        renderMaterials();
    }

    // Выход из системы
    function logout() {
        if (confirm('Вы уверены, что хотите выйти из системы?')) {
            localStorage.removeItem('auth');
            window.location.href = 'index.html';
        }
    }

    // Запускаем приложение
    initApp();
});