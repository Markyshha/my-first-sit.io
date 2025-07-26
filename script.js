// Упрощенная версия для IE11/WP8.1
var canvas = document.getElementById('canvas');
var ctx = canvas.getContext('2d');
var currentColor = document.getElementById('currentColor');
var sizePicker = document.getElementById('sizePicker');
var clearBtn = document.getElementById('clearBtn');
var brushBtn = document.getElementById('brushBtn');
var eraserBtn = document.getElementById('eraserBtn');
var saveBtn = document.getElementById('saveBtn');
var loadBtn = document.getElementById('loadBtn');
var fileInput = document.getElementById('fileInput');
var colorPickerPopup = document.getElementById('colorPickerPopup');

var currentColorHex = '#000000';
var isDrawing = false;
var lastX = 0;
var lastY = 0;
var currentTool = 'brush';

// Размер холста
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 100; // Оставляем место для панели
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Показать кастомный выбор цвета
function showColorPicker() {
    colorPickerPopup.style.display = 'block';
}

// Скрыть выбор цвета
function hideColorPicker() {
    colorPickerPopup.style.display = 'none';
}

// Установить цвет
function setColor(hex) {
    currentColorHex = hex;
    currentColor.style.background = hex;
    hideColorPicker();
}

// Начало рисования
function startDrawing(e) {
    e.preventDefault();
    isDrawing = true;
    var pos = getPosition(e);
    lastX = pos[0];
    lastY = pos[1];
    
    // Рисуем точку при касании
    ctx.beginPath();
    ctx.arc(lastX, lastY, sizePicker.value/2, 0, Math.PI*2);
    ctx.fillStyle = currentTool === 'eraser' ? '#ffffff' : currentColorHex;
    ctx.fill();
}

// Рисование
function draw(e) {
    e.preventDefault();
    if (!isDrawing) return;
    
    var pos = getPosition(e);
    var x = pos[0];
    var y = pos[1];
    var size = sizePicker.value;
    
    ctx.lineWidth = size;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    
    if (currentTool === 'eraser') {
        ctx.strokeStyle = '#ffffff';
        ctx.globalCompositeOperation = 'destination-out';
    } else {
        ctx.strokeStyle = currentColorHex;
        ctx.globalCompositeOperation = 'source-over';
    }
    
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    lastX = x;
    lastY = y;
}

// Конец рисования
function stopDrawing() {
    isDrawing = false;
    ctx.globalCompositeOperation = 'source-over';
}

// Получение позиции
function getPosition(e) {
    var rect = canvas.getBoundingClientRect();
    var clientX, clientY;
    
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else if (e.pointerType === 'touch' || e.pointerType === 'pen') {
        clientX = e.clientX;
        clientY = e.clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    return [
        clientX - rect.left,
        clientY - rect.top
    ];
}

// Очистка холста
function clearCanvas() {
    if (confirm('Очистить холст?')) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
}

// Сохранение рисунка
function saveDrawing() {
    window.navigator.msSaveBlob(canvas.msToBlob(), 'рисунок.png');
}

// Загрузка фото
function loadPhoto() {
    fileInput.click();
}

fileInput.addEventListener('change', function(e) {
    var file = e.target.files[0];
    if (!file) return;
    
    var reader = new FileReader();
    reader.onload = function(event) {
        var img = new Image();
        img.onload = function() {
            var x = (canvas.width - img.width) / 2;
            var y = (canvas.height - img.height) / 2;
            ctx.drawImage(img, x, y);
        };
        img.src = event.target.result;
    };
    reader.readAsDataURL(file);
});

// События для WP8.1
canvas.addEventListener('pointerdown', startDrawing);
canvas.addEventListener('pointermove', draw);
canvas.addEventListener('pointerup', stopDrawing);
canvas.addEventListener('pointerout', stopDrawing);

// Управление инструментами
clearBtn.addEventListener('click', clearCanvas);
saveBtn.addEventListener('click', saveDrawing);
loadBtn.addEventListener('click', loadPhoto);

brushBtn.addEventListener('click', function() {
    currentTool = 'brush';
    brushBtn.className = 'active';
    eraserBtn.className = '';
});

eraserBtn.addEventListener('click', function() {
    currentTool = 'eraser';
    eraserBtn.className = 'active';
    brushBtn.className = '';
});