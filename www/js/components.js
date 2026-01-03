// footer.js
class FooterComponent {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
    this.render();
  }

  addStyles() {
    const style = document.createElement('style');
    style.textContent = `
      .footer {
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        background-color: rgb(240, 240, 240);
        display: flex;
        justify-content: space-around;
        padding: 15px 0;
        box-shadow: 0 -2px 5px rgba(0,0,0,0.2);
        font-family: sans-serif;
        z-index: 1000;
      }

      .footer div {
        cursor: pointer;
        text-align: center;
        flex: 1;
      }

      .footer div:hover {
        color: #00aaff;
      }
    `;
    document.head.appendChild(style);
  }

  render() {
    if (!this.container) return;

    // 加入 CSS
    this.addStyles();

    const footer = document.createElement('div');
    footer.className = 'footer';

    const buttons = [
      { name: '查詢', link: 'index.html' },
      { name: '旅程清單', link: 'tripList.html' },
      { name: '設定', link: 'setting.html' }
    ];

    buttons.forEach(btn => {
      const div = document.createElement('div');
      div.textContent = btn.name;
      div.addEventListener('click', () => {
        window.location.href = btn.link;
      });
      footer.appendChild(div);
    });

    this.container.appendChild(footer);
  }
}

// 自動載入範例（假設 HTML 裡有 <div id="footer-container"></div>）
window.addEventListener('DOMContentLoaded', () => {
  new FooterComponent('footer-container');
});
