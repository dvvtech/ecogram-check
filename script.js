// Элементы интерфейса
const UI = {
  scanButton: document.getElementById('scanButton'),
  cameraView: document.getElementById('cameraView'),
  photoCanvas: document.getElementById('photoCanvas'),
  capturedImage: document.getElementById('capturedImage'),
  confirmButtons: document.getElementById('confirmButtons'),
  confirmSend: document.getElementById('confirmSend'),
  retakePhoto: document.getElementById('retakePhoto'),
  loading: document.getElementById('loading'),
  result: document.getElementById('result'),
  analysisResult: document.getElementById('analysisResult')
};

let cameraStream = null;
let capturedPhotoData = null;

// Инициализация приложения
function init() {
  setupEventListeners();
}

// Настройка обработчиков событий
function setupEventListeners() {
  UI.scanButton.addEventListener('click', startCamera);
  UI.cameraView.addEventListener('click', capturePhoto);
  UI.confirmSend.addEventListener('click', sendPhotoForAnalysis);
  UI.retakePhoto.addEventListener('click', resetCamera);
}

// Запуск камеры
async function startCamera() {
  try {
    // Показываем контейнер перед запуском камеры
    document.querySelector('.camera-container').style.display = 'block';
    
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: 'environment',
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });
    
    UI.cameraView.srcObject = cameraStream;
    UI.cameraView.style.display = 'block';
    UI.scanButton.style.display = 'none';
    
    // Плавное появление
    UI.cameraView.style.opacity = 0;
    setTimeout(() => UI.cameraView.style.opacity = 1, 50);
  } catch (error) {
    // В случае ошибки снова скрываем контейнер
    document.querySelector('.camera-container').style.display = 'none';
    showError('Не удалось получить доступ к камере');
    console.error('Camera error:', error);
  }
}

// Снимок фото
function capturePhoto() {
  if (!cameraStream) return;

  // Настройка canvas
  const context = UI.photoCanvas.getContext('2d');
  UI.photoCanvas.width = UI.cameraView.videoWidth;
  UI.photoCanvas.height = UI.cameraView.videoHeight;
  
  // Снимок
  context.drawImage(UI.cameraView, 0, 0, UI.photoCanvas.width, UI.photoCanvas.height);
  
  // Показ результата
  UI.capturedImage.src = UI.photoCanvas.toDataURL('image/jpeg');
  UI.capturedImage.style.display = 'block';
  UI.cameraView.style.display = 'none';
  
  // Остановка камеры
  stopCameraStream();
  
  // Показать кнопки подтверждения
  UI.confirmButtons.style.display = 'block';
  
  // Сохранить данные фото
  capturedPhotoData = UI.photoCanvas.toDataURL('image/jpeg', 0.8).split(',')[1];
}

// Отправка на сервер
async function sendPhotoForAnalysis() {
  UI.confirmButtons.style.display = 'none';
  UI.loading.style.display = 'flex';
  
  try {
    // Здесь будет реальный запрос к API
    const analysisResult = await mockApiRequest(capturedPhotoData);
    
    // Показать результат
    showAnalysisResult(analysisResult);
  } catch (error) {
    showError('Ошибка при анализе фото');
    console.error('API error:', error);
  } finally {
    UI.loading.style.display = 'none';
  }
}

// Показать результат анализа
function showAnalysisResult(data) {
  UI.analysisResult.innerHTML = `
    <p><strong>Найдено:</strong> ${data.ingredients.join(', ')}</p>
    <p><strong>Безопасность:</strong> <span style="color: ${getSafetyColor(data.safety)}">${data.safety}</span></p>
    <p><strong>Рекомендация:</strong> ${data.recommendation}</p>
  `;
  UI.result.style.display = 'block';
}

// Сброс камеры
function resetCamera() {
  stopCameraStream();
  document.querySelector('.camera-container').style.display = 'none'; // Скрываем контейнер
  UI.capturedImage.style.display = 'none';
  UI.confirmButtons.style.display = 'none';
  UI.scanButton.style.display = 'block';
}

// Остановка камеры
function stopCameraStream() {
  if (cameraStream) {
    cameraStream.getTracks().forEach(track => track.stop());
    cameraStream = null;
  }
}

// Показать ошибку
function showError(message) {
  UI.analysisResult.innerHTML = `<p style="color: var(--error)">${message}</p>`;
  UI.result.style.display = 'block';
}

// Цвет для показателя безопасности
function getSafetyColor(level) {
  const colors = {
    'высокая': 'var(--success)',
    'средняя': '#FFA000',
    'низкая': 'var(--error)'
  };
  return colors[level.toLowerCase()] || 'var(--text-primary)';
}

// Заглушка API (заменить на реальный запрос)
async function mockApiRequest(photoData) {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve({
        ingredients: ['Консервант E202', 'Краситель E129', 'Эмульгатор E322'],
        safety: 'средняя',
        recommendation: 'Умеренное потребление. Содержит искусственные добавки.'
      });
    }, 3000); // Уменьшено для демонстрации
  });
}

// Запуск приложения
document.addEventListener('DOMContentLoaded', init);