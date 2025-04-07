document.addEventListener('DOMContentLoaded', async function () {
    try {
        const response = await fetch('/api/counselor/', {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'token': localStorage.getItem('authToken')
            },
        });

        const res = await response.json();

        if (response.ok) {
            // 解构数据结构
            datas = res.data;
            console.log(datas)

            datas.forEach(data => {
                //addTableRow(data)
            });


        } else {
            console.log(res.message || '获取咨询历史记录失败');
        }

    } catch (error) {
        console.log('网络连接异常');
    }
})