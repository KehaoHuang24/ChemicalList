const GITHUB_TOKEN = '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'; // 替换为你的 GitHub Token
const REPO_OWNER = 'KehaoHuang24';
const REPO_NAME = 'ChemicalList';
const FILE_PATH = 'chemicals.json';
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;

let chemicals = [];

// 页面加载时初始化数据
document.addEventListener('DOMContentLoaded', async () => {
    await loadFromGitHub();
    renderTable(chemicals);
});

// 添加化学试剂
document.getElementById('addChemicalBtn').addEventListener('click', async () => {
    const newChemical = {
        chemicalName: document.getElementById('chemicalName').value,
        purity: document.getElementById('purity').value,
        size: document.getElementById('size').value,
        quantity: document.getElementById('quantity').value,
        type: document.getElementById('chemicalType').value,
        date: document.getElementById('date').value,
        recordedBy: document.getElementById('recordedBy').value,
    };

    if (!newChemical.chemicalName || !newChemical.recordedBy) {
        alert("Chemical Name and Recorded By are required!");
        return;
    }

    chemicals.push(newChemical);
    await saveToGitHub();
    renderTable(chemicals);
    clearInputs();
});

// 渲染表格
function renderTable(data) {
    const tableBody = document.getElementById('chemicalTableBody');
    tableBody.innerHTML = "";
    data.forEach((chemical, index) => {
        tableBody.innerHTML += `
            <tr>
                <td>${chemical.chemicalName}</td>
                <td>${chemical.purity}</td>
                <td>${chemical.size}</td>
                <td>${chemical.quantity}</td>
                <td>${chemical.type}</td>
                <td>${chemical.date}</td>
                <td>${chemical.recordedBy}</td>
                <td>
                    <button onclick="deleteChemical(${index})">Delete</button>
                </td>
            </tr>
        `;
    });
}

// 清空输入框
function clearInputs() {
    document.querySelectorAll('input, select').forEach(input => input.value = '');
    document.getElementById('chemicalType').value = 'solid';
}

// 删除试剂
async function deleteChemical(index) {
    chemicals.splice(index, 1);
    await saveToGitHub();
    renderTable(chemicals);
}

// 按类型过滤
function filterByType(type) {
    const filtered = chemicals.filter(c => c.type === type);
    renderTable(filtered);

    // 按钮状态更新
    document.querySelectorAll('#chemicalTypeButtons button').forEach(btn => btn.classList.remove('active'));
    document.getElementById(`btn${type.charAt(0).toUpperCase() + type.slice(1)}`).classList.add('active');
}

// 从 GitHub 加载数据
async function loadFromGitHub() {
    try {
        const response = await fetch(API_URL, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
        const data = await response.json();
        chemicals = JSON.parse(atob(data.content));
    } catch {
        chemicals = [];
    }
}

// 保存数据到 GitHub
async function saveToGitHub() {
    const content = btoa(JSON.stringify(chemicals, null, 2));
    const response = await fetch(API_URL, {
        method: 'PUT',
        headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Update chemicals', content, sha: await getSha() })
    });
}

// 获取文件SHA值
async function getSha() {
    const response = await fetch(API_URL, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    const data = await response.json();
    return data.sha;
}
