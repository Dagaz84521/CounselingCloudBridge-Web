document.addEventListener('DOMContentLoaded', async () => {
    const requiredRole = 'counselor';
    const storedRole = localStorage.getItem('userRole');

    if (storedRole !== requiredRole) {
        localStorage.clear();
        window.location.href = '/login';
    }

    // 封装 try 部分的逻辑为一个异步函数
    async function fetchData() {
        try {
            const response = await fetch('/api/counselor/home', {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'token': localStorage.getItem('authToken')
                }
            });

            const res = await response.json();
            if (response.ok) {
                const data = res.data;
                console.log(data);
                renderSessionList(data.sessionList)

            } else {
                console.log(res.message || '认证失败');
            }
        } catch (error) {
            console.log(error);
        }
    }

    // 初始立即执行一次
    fetchData();
    // 每隔 60 秒重复执行
    setInterval(fetchData, 30000);
})

function renderSessionList(sessionList) {
    var listContainer = document.getElementById('session-list')
    listContainer.innerHTML = '<span>会话列表</span>'
    sessionList.forEach(session => {
        var line = addSessionItem(session);
        listContainer.appendChild(line)
    })
}

function addSessionItem(session) {

    var itemLine = document.createElement('div');
    itemLine.className = 'user-item-container';

    var linkItem = document.createElement('a');
    linkItem.href = "/counselor/session/" + session.sessionId + "/" + session.clientId;
    linkItem.className = "user-item-content";
    linkItem.draggable = false;
    linkItem.dataset.sessionId = session.sessionId; // 对应 HTML 属性 data-session-id
    linkItem.dataset.clientId = session.clientId;   // 对应 HTML 属性 data-client-id

    var clientSpan = document.createElement('span');
    clientSpan.className = "user-item";
    clientSpan.innerHTML = session.realName;
    linkItem.appendChild(clientSpan)


    var menuItem = document.createElement('div')
    menuItem.className = 'menu-actions';

    var buttonItem = document.createElement('button')
    buttonItem.className = 'delete-btn';
    buttonItem.innerHTML = '删除';
    buttonItem.addEventListener('click', function (event) {
        handleDelete(event.currentTarget);
    });


    menuItem.appendChild(buttonItem)

    itemLine.appendChild(linkItem)
    itemLine.appendChild(menuItem)

    setupSwipeHandlers(itemLine);
    return itemLine;
}

function handleDelete(btn) {
    const container = btn.closest('.user-item-container');
    container.style.transform = 'translateX(-100%)';
    setTimeout(() => container.remove(), 300);
}


// 全局点击复位
document.addEventListener('click', (e) => {
    if (!e.target.closest('.user-item-container')) {
        document.querySelectorAll('.user-item-content').forEach(el => {
            el.style.transform = '';
        });
    }
});

function setupSwipeHandlers(container) {
    let isDragging = false;
    let startX = 0;
    let startY = 0;
    let startTime = 0;
    const CLICK_THRESHOLD = 5;
    const TIME_THRESHOLD = 200;

    const content = container.querySelector('.user-item-content');
    const link = container.querySelector('a'); // 获取链接元素
    const menuWidth = 80; // 需要与CSS中menu-actions的宽度一致

    // 移除原生的双击选中文本行为
    content.style.userSelect = 'none';

    // 双击事件处理
    link.addEventListener('dblclick', (e) => {
        e.preventDefault();
        window.location.href = link.href; // 执行跳转
        localStorage.setItem('sessionId', link.dataset.sessionId);
        localStorage.setItem('clientId', link.dataset.clientId);
    });

    // 单击延迟处理 (用于区分单击/滑动)
    link.addEventListener('click', (e) => {
        e.preventDefault();
        clickCount++;

        if (clickCount === 1) {
            clickTimer = setTimeout(() => {
                clickCount = 0; // 超时重置
            }, DOUBLE_CLICK_DELAY);
        } else if (clickCount === 2) {
            clearTimeout(clickTimer);
            clickCount = 0;
            // 双击已经在 dblclick 事件处理
        }
    });

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

        if (deltaY > CLICK_THRESHOLD) {
            resetState();
            return;
        }

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

        if (deltaX > CLICK_THRESHOLD || deltaTime > TIME_THRESHOLD) {
            handleSwipe(deltaX);
            e.preventDefault();
        } else {
            content.style.transform = '';
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
}