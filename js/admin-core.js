/**
 * Основной модуль административной панели
 * Содержит логику работы с данными и хранилищем
 */
const AdminCore = (function() {
    // Константы для ключей localStorage
    const USERS_KEY = 'admin_users';
    const CLASSES_KEY = 'admin_classes';
    const NEWS_KEY = 'admin_news';
    const REPORTS_KEY = 'admin_reports';
    const SUBJECTS_KEY = 'teacher_subjects';

    // Стандартные предметы
    const DEFAULT_SUBJECTS = [
        "Математика", "Русский язык", "Литература", "Иностранный язык",
        "История", "Обществознание", "География", "Биология",
        "Физика", "Химия", "Информатика", "Физкультура",
        "Технология", "ИЗО", "Музыка", "ОБЖ"
    ];

    // Генерация стандартных классов (1А-11Г)
    function generateDefaultClasses() {
        const grades = Array.from({length: 11}, (_, i) => i + 1); // 1-11 классы
        const letters = ['А', 'Б', 'В', 'Г'];
        
        return grades.flatMap(grade => 
            letters.map(letter => ({
                id: `${grade}${letter}`,
                name: `${grade} "${letter}" класс`,
                teacherId: null,
                students: [],
                subjects: [...DEFAULT_SUBJECTS]
            }))
        );
    }

    // Хранилище данных приложения
    const data = {
        users: JSON.parse(localStorage.getItem(USERS_KEY)) || [],
        classes: JSON.parse(localStorage.getItem(CLASSES_KEY)) || generateDefaultClasses(),
        news: JSON.parse(localStorage.getItem(NEWS_KEY)) || [],
        reports: JSON.parse(localStorage.getItem(REPORTS_KEY)) || [],
        subjects: JSON.parse(localStorage.getItem(SUBJECTS_KEY)) || DEFAULT_SUBJECTS,
        currentClassId: null
    };

    // ========== ФУНКЦИИ ДЛЯ СОХРАНЕНИЯ ДАННЫХ ==========

    function saveUsers() {
        try {
            localStorage.setItem(USERS_KEY, JSON.stringify(data.users));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения пользователей:', error);
            return false;
        }
    }

    function saveClasses() {
        try {
            localStorage.setItem(CLASSES_KEY, JSON.stringify(data.classes));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения классов:', error);
            return false;
        }
    }

    function saveNews() {
        try {
            localStorage.setItem(NEWS_KEY, JSON.stringify(data.news));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения новостей:', error);
            return false;
        }
    }

    function saveReports() {
        try {
            localStorage.setItem(REPORTS_KEY, JSON.stringify(data.reports));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения отчетов:', error);
            return false;
        }
    }

    function saveSubjects() {
        try {
            localStorage.setItem(SUBJECTS_KEY, JSON.stringify(data.subjects));
            return true;
        } catch (error) {
            console.error('Ошибка сохранения предметов:', error);
            return false;
        }
    }

    // ========== ОСНОВНЫЕ ФУНКЦИИ ПРИЛОЖЕНИЯ ==========

    function checkAuth() {
        const authData = JSON.parse(localStorage.getItem('auth')) || {};
        if (!authData.isAdmin && !authData.isDeputy && !authData.isTeacher) {
            alert('Доступ запрещен. Требуются права администратора, завуча или учителя.');
            window.location.href = 'index.html';
            return false;
        }
        return true;
    }

    // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ОТЧЕТАМИ ==========

    function addNews(newsData) {
        try {
            const newNews = {
                id: data.news.length > 0 ? Math.max(...data.news.map(n => n.id)) + 1 : 1,
                ...newsData,
                date: new Date().toISOString()
            };
            
            data.news.push(newNews);
            return saveNews();
        } catch (error) {
            console.error('Ошибка добавления новости:', error);
            return false;
        }
    }

    function updateNews(newsId, newsData) {
        try {
            const newsIndex = data.news.findIndex(n => n.id === newsId);
            if (newsIndex === -1) return false;
            
            data.news[newsIndex] = { 
                ...data.news[newsIndex],
                ...newsData
            };
            
            return saveNews();
        } catch (error) {
            console.error('Ошибка обновления новости:', error);
            return false;
        }
    }

    function deleteNews(newsId) {
        try {
            const newsIndex = data.news.findIndex(n => n.id === newsId);
            if (newsIndex === -1) return false;
            
            data.news.splice(newsIndex, 1);
            return saveNews();
        } catch (error) {
            console.error('Ошибка удаления новости:', error);
            return false;
        }
    }

    function addReport(reportData) {
        try {
            const newReport = {
                id: data.reports.length > 0 ? Math.max(...data.reports.map(r => r.id)) + 1 : 1,
                ...reportData
            };
            
            data.reports.push(newReport);
            return saveReports();
        } catch (error) {
            console.error('Ошибка добавления отчета:', error);
            return false;
        }
    }

    function deleteReport(reportId) {
        try {
            const reportIndex = data.reports.findIndex(r => r.id === reportId);
            if (reportIndex === -1) return false;
            
            data.reports.splice(reportIndex, 1);
            return saveReports();
        } catch (error) {
            console.error('Ошибка удаления отчета:', error);
            return false;
        }
    }

    function validateReports() {
        try {
            // Удаляем невалидные отчеты (без fileUrl)
            const initialCount = data.reports.length;
            data.reports = data.reports.filter(report => report.fileUrl);
            
            if (initialCount !== data.reports.length) {
                saveReports();
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка валидации отчетов:', error);
            return false;
        }
    }

    // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ==========

    function addUser(userData) {
        try {
            const newUser = {
                id: data.users.length > 0 ? Math.max(...data.users.map(user => user.id)) + 1 : 1,
                ...userData,
                date: new Date().toISOString().split('T')[0]
            };
            
            // Проверка на уникальность логина
            if (data.users.some(u => u.username === newUser.username)) {
                alert('Пользователь с таким логином уже существует');
                return false;
            }
            
            data.users.push(newUser);
            return saveUsers();
        } catch (error) {
            console.error('Ошибка добавления пользователя:', error);
            return false;
        }
    }

    function updateUser(userId, userData) {
        try {
            const userIndex = data.users.findIndex(user => user.id === userId);
            if (userIndex === -1) return false;
            
            // Сохраняем неизменяемые поля
            const immutableFields = {
                id: data.users[userIndex].id,
                date: data.users[userIndex].date
            };
            
            data.users[userIndex] = { 
                ...data.users[userIndex], 
                ...userData,
                ...immutableFields
            };
            
            return saveUsers();
        } catch (error) {
            console.error('Ошибка обновления пользователя:', error);
            return false;
        }
    }
    
    function deleteUser(userId) {
        try {
            const userIndex = data.users.findIndex(user => user.id === userId);
            if (userIndex === -1) return false;
            
            // Удаляем ученика из всех классов
            data.classes.forEach(classItem => {
                if (classItem.students) {
                    classItem.students = classItem.students.filter(id => id !== userId);
                }
            });
            saveClasses();
            
            data.users.splice(userIndex, 1);
            return saveUsers();
        } catch (error) {
            console.error('Ошибка удаления пользователя:', error);
            return false;
        }
    }

    // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С КЛАССАМИ ==========

    function addClass(classData) {
        try {
            // Проверяем, что класс с таким ID уже существует
            if (data.classes.some(c => c.id === classData.id)) {
                alert('Класс с таким идентификатором уже существует');
                return false;
            }
            
            const newClass = {
                id: classData.id || generateClassId(),
                name: classData.name,
                teacherId: classData.teacherId || null,
                students: [],
                subjects: [...DEFAULT_SUBJECTS]
            };
            
            data.classes.push(newClass);
            return saveClasses();
        } catch (error) {
            console.error('Ошибка добавления класса:', error);
            return false;
        }
    }

    function generateClassId() {
        // Генерируем уникальный ID для нового класса (не из стандартных)
        let id;
        do {
            const randomNum = Math.floor(Math.random() * 1000);
            id = `custom_${randomNum}`;
        } while (data.classes.some(c => c.id === id));
        
        return id;
    }

    function updateClass(classId, classData) {
        try {
            const classIndex = data.classes.findIndex(c => c.id === classId);
            if (classIndex === -1) return false;
            
            data.classes[classIndex] = { 
                ...data.classes[classIndex],
                name: classData.name || data.classes[classIndex].name,
                teacherId: classData.teacherId || data.classes[classIndex].teacherId
            };
            
            return saveClasses();
        } catch (error) {
            console.error('Ошибка обновления класса:', error);
            return false;
        }
    }

    function deleteClass(classId) {
        try {
            const classIndex = data.classes.findIndex(c => c.id === classId);
            if (classIndex === -1) return false;
            
            // Проверяем, является ли класс стандартным (1А-11Г)
            const isDefaultClass = /^\d+[А-Г]$/.test(classId);
            if (isDefaultClass) {
                alert('Нельзя удалять стандартные классы (1А-11Г)');
                return false;
            }
            
            data.classes.splice(classIndex, 1);
            return saveClasses();
        } catch (error) {
            console.error('Ошибка удаления класса:', error);
            return false;
        }
    }

    function addStudentToClass(classId, studentId) {
        try {
            const classItem = data.classes.find(c => c.id === classId);
            if (!classItem) return false;
            
            if (!classItem.students) {
                classItem.students = [];
            }
            
            if (!classItem.students.includes(studentId)) {
                classItem.students.push(studentId);
                return saveClasses();
            }
            
            return true;
        } catch (error) {
            console.error('Ошибка добавления ученика в класс:', error);
            return false;
        }
    }

    function removeStudentFromClass(classId, studentId) {
        try {
            const classItem = data.classes.find(c => c.id === classId);
            if (!classItem || !classItem.students) return false;
            
            classItem.students = classItem.students.filter(id => id !== studentId);
            return saveClasses();
        } catch (error) {
            console.error('Ошибка удаления ученика из класса:', error);
            return false;
        }
    }

    // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ПРЕДМЕТАМИ ==========

    function getSubjects() {
        return [...data.subjects]; // Возвращаем копию массива
    }

    function addSubject(subjectName) {
        try {
            if (!subjectName || data.subjects.includes(subjectName)) {
                return false;
            }
            
            data.subjects.push(subjectName);
            return saveSubjects();
        } catch (error) {
            console.error('Ошибка добавления предмета:', error);
            return false;
        }
    }

    function removeSubject(subjectName) {
        try {
            const index = data.subjects.indexOf(subjectName);
            if (index === -1) return false;
            
            data.subjects.splice(index, 1);
            return saveSubjects();
        } catch (error) {
            console.error('Ошибка удаления предмета:', error);
            return false;
        }
    }

    // ========== ФУНКЦИИ ДЛЯ РАБОТЫ С ОЦЕНКАМИ ==========

    function addGrade(classId, subject, studentId, grade) {
        try {
            const key = `grades_${classId}_${subject}_${studentId}`;
            let grades = JSON.parse(localStorage.getItem(key)) || [];
            grades.push(grade);
            localStorage.setItem(key, JSON.stringify(grades));
            return true;
        } catch (error) {
            console.error('Ошибка добавления оценки:', error);
            return false;
        }
    }

    function getGrades(classId, subject, studentId) {
        try {
            const key = `grades_${classId}_${subject}_${studentId}`;
            return JSON.parse(localStorage.getItem(key)) || [];
        } catch (error) {
            console.error('Ошибка получения оценок:', error);
            return [];
        }
    }

    function clearGrades(classId, subject, studentId) {
        try {
            const key = `grades_${classId}_${subject}_${studentId}`;
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Ошибка очистки оценок:', error);
            return false;
        }
    }

    // ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========

    function truncateText(text, maxLength) {
        if (!text) return '';
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    }

    function getUserTypeName(type) {
        const types = {
            'student': 'Ученик',
            'parent': 'Родитель',
            'teacher': 'Учитель',
            'deputy': 'Завуч',
            'admin': 'Администратор'
        };
        return types[type] || type;
    }

    function formatDate(dateString) {
        try {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return new Date(dateString).toLocaleDateString('ru-RU', options);
        } catch (error) {
            console.error('Ошибка форматирования даты:', error);
            return dateString;
        }
    }

    function getInitials(fullName) {
        if (!fullName) return 'АД';
        return fullName.split(' ')
            .filter(word => word.length > 0)
            .map(word => word[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
    }

    // Экспортируем публичные методы
    return {
        // Основные функции
        checkAuth,
        data,
        
        // Пользователи
        addUser,
        updateUser,
        deleteUser,

        // Новости
        addNews,
        updateNews,
        deleteNews,
        
        // Классы
        addClass,
        updateClass,
        deleteClass,
        addStudentToClass,
        removeStudentFromClass,
        saveClasses,
        
        // Предметы
        getSubjects,
        addSubject,
        removeSubject,
        
        // Оценки
        addGrade,
        getGrades,
        clearGrades,
        
        // Вспомогательные
        truncateText,
        getUserTypeName,
        formatDate,
        getInitials,

        // Reports functions
        addReport,
        deleteReport,
        validateReports
    };
})();

// Если страница уже загружена
if (document.readyState === 'complete') {
    AdminCore.checkAuth();
}