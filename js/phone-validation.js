// Валидация телефона в реальном времени
document.addEventListener('DOMContentLoaded', function() {
    const phoneInputs = document.querySelectorAll('input[type="tel"][pattern="\\+7\\s?[0-9]{3}\\s?[0-9]{3}-?[0-9]{2}-?[0-9]{2}"]');
    
    phoneInputs.forEach(input => {
        input.addEventListener('input', function(e) {
            let value = this.value.replace(/\D/g, '');
            let formattedValue = '';
            
            if (value.length > 0) {
                formattedValue = '+7';
                if (value.length > 1) {
                    formattedValue += ' ' + value.substring(1, 4);
                }
                if (value.length > 4) {
                    formattedValue += ' ' + value.substring(4, 7);
                }
                if (value.length > 7) {
                    formattedValue += '-' + value.substring(7, 9);
                }
                if (value.length > 9) {
                    formattedValue += '-' + value.substring(9, 11);
                }
            }
            
            this.value = formattedValue;
        });
    });
});