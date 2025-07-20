// Элементы DOM
const scanButton = document.getElementById('scanButton');
const cameraView = document.getElementById('cameraView');
const photoCanvas = document.getElementById('photoCanvas');
const capturedImage = document.getElementById('capturedImage');
const confirmButtons = document.getElementById('confirmButtons');
const confirmSend = document.getElementById('confirmSend');
const retakePhoto = document.getElementById('retakePhoto');
const loading = document.getElementById('loading');
const resultDiv = document.getElementById('result');

let stream = null;
let photoData = null;

// 1. Открытие камеры
scanButton.addEventListener('click', async () => {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Используем заднюю камеру
        });
        cameraView.srcObject = stream;
        cameraView.style.display = 'block';
        scanButton.style.display = 'none';
    } catch (err) {
        alert('Ошибка доступа к камере: ' + err.message);
        console.error(err);
    }
});

// 2. Снимок при клике на видео
cameraView.addEventListener('click', () => {
    if (!stream) return;

    // Настройка canvas и сохранение фото
    photoCanvas.width = cameraView.videoWidth;
    photoCanvas.height = cameraView.videoHeight;
    const context = photoCanvas.getContext('2d');
    context.drawImage(cameraView, 0, 0, photoCanvas.width, photoCanvas.height);

    // Показ превью
    capturedImage.src = photoCanvas.toDataURL('image/jpeg');
    capturedImage.style.display = 'block';
    cameraView.style.display = 'none';

    // Остановка камеры
    stream.getTracks().forEach(track => track.stop());
    stream = null;

    // Подтверждение
    confirmButtons.style.display = 'block';
    photoData = photoCanvas.toDataURL('image/jpeg').split(',')[1]; // Base64 без префикса
});

// 3. Отправка на сервер
confirmSend.addEventListener('click', async () => {
    confirmButtons.style.display = 'none';
    loading.style.display = 'block';

    try {
        // Имитация запроса (замените на реальный API!)
        const mockResponse = await mockApiRequest(photoData);
        
        loading.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>Результат анализа:</h3>
            <p>${mockResponse.analysis}</p>
            <button onclick="window.location.reload()">Сканировать еще раз</button>
        `;
    } catch (err) {
        loading.style.display = 'none';
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `<p style="color: red;">Ошибка: ${err.message}</p>`;
    }
});

// 4. Переснять фото
retakePhoto.addEventListener('click', () => {
    capturedImage.style.display = 'none';
    confirmButtons.style.display = 'none';
    scanButton.style.display = 'block';
});

// Заглушка API (замените на реальный fetch!)
function mockApiRequest(photoBase64) {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                status: "success",
                analysis: "Найдены: консерванты (E202), красители (E129). Безопасность: средняя."
            });
        }, 3000); // Уменьшил до 3 сек для удобства тестирования
    });
}