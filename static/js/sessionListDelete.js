let isDragging = false;
let startX = 0;
let startY = 0;
let startTime = 0;
const CLICK_THRESHOLD = 5;  // 横向移动阈值
const TIME_THRESHOLD = 200; // 点击时间阈值

document.querySelectorAll('.user-item-container').forEach(container => {
    const content = container.querySelector('.user-item-content');
    const link = content.querySelector('a');
    const menuWidth = 80;

    // 阻止链接默认拖拽行为
    content.addEventListener('dragstart', (e) => e.preventDefault());

    container.addEventListener('mousedown', (e) => {
        if (e.button !== 0) return;
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        startTime = Date.now();
        content.style.transition = 'none';
    });

    container.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        
        const deltaX = startX - e.clientX;
        const deltaY = Math.abs(e.clientY - startY);

        // 纵向移动超过阈值则取消操作
        if (deltaY > CLICK_THRESHOLD) {
            resetState();
            return;
        }

        // 横向滑动处理
        if (deltaX > 0) {
            const translateX = Math.min(deltaX, menuWidth);
            content.style.transform = `translateX(-${translateX}px)`;
        }
    });

    container.addEventListener('mouseup', (e) => {
        if (!isDragging) return;
        isDragging = false;
        content.style.transition = 'transform 0.3s ease';

        const deltaX = startX - e.clientX;
        const deltaTime = Date.now() - startTime;

        // 判断是否为有效滑动
        if (deltaX > CLICK_THRESHOLD || deltaTime > TIME_THRESHOLD) {
            handleSwipe(deltaX);
            e.preventDefault(); // 阻止默认点击行为
        } else {
            // 纯点击操作时恢复位置
            content.style.transform = '';
        }
    });

    // 专用点击处理（处理快速点击）
    content.addEventListener('click', (e) => {
        if (Date.now() - startTime > TIME_THRESHOLD) {
            e.preventDefault();
        }
    });

    function handleSwipe(deltaX) {
        const shouldOpen = Math.abs(deltaX) > menuWidth / 2;
        content.style.transform = shouldOpen ? 
            `translateX(-${menuWidth}px)` : '';
    }

    function resetState() {
        content.style.transform = '';
        isDragging = false;
    }
});

// 全局点击复位
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-item-container')) {
        document.querySelectorAll('.user-item-content').forEach(el => {
            el.style.transform = '';
        });
    }
});



function handleDelete(btn) {
    const container = btn.closest('.user-item-container');
    container.style.transform = 'translateX(-100%)';
    setTimeout(() => container.remove(), 300);
}