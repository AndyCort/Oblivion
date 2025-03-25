function initNavVisibility() {
    const nav = document.querySelector('.bottom-nav');
    if (!nav) return;

    // 优化性能的更新函数
    function updateNav() {
      const scrolled = window.scrollY;
      const isAtTop = scrolled <= 0;

      // 添加/移除可见类
      nav.classList.toggle('bottom-nav--visible', !isAtTop);
    }

    // 使用 requestAnimationFrame 节流
    let isUpdating = false;
    function handleScroll() {
      if (!isUpdating) {
        requestAnimationFrame(() => {
          updateNav();
          isUpdating = false;
        });
        isUpdating = true;
      }
    }

    // 事件监听
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateNav);
    
    // 初始化状态
    updateNav();
  }

  // 启动功能
  initNavVisibility();