/**
 * 密码显示/隐藏功能
 */
document.addEventListener("DOMContentLoaded", function() {
    // 查找所有密码切换按钮
    var toggleButtons = document.querySelectorAll(".toggle-password");
    
    // 为每个按钮添加点击事件
    for(var i = 0; i < toggleButtons.length; i++) {
        toggleButtons[i].addEventListener("click", function(e) {
            e.preventDefault();
            e.stopPropagation();
            
            // 获取相关的密码输入框和图标
            var input = this.previousElementSibling;
            var icon = this.querySelector("i");
            
            // 切换密码可见性
            if (input.type === "password") {
                input.type = "text";
                icon.classList.remove("fa-eye");
                icon.classList.add("fa-eye-slash");
            } else {
                input.type = "password";
                icon.classList.remove("fa-eye-slash");
                icon.classList.add("fa-eye");
            }
        });
    }
    
    // 在页面加载后再次检查并绑定事件（处理动态加载的内容）
    setTimeout(function() {
        var lateToggleButtons = document.querySelectorAll(".toggle-password");
        for(var i = 0; i < lateToggleButtons.length; i++) {
            if(!lateToggleButtons[i].hasAttribute("data-initialized")) {
                lateToggleButtons[i].setAttribute("data-initialized", "true");
                lateToggleButtons[i].addEventListener("click", function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    var input = this.previousElementSibling;
                    var icon = this.querySelector("i");
                    
                    if (input.type === "password") {
                        input.type = "text";
                        icon.classList.remove("fa-eye");
                        icon.classList.add("fa-eye-slash");
                    } else {
                        input.type = "password";
                        icon.classList.remove("fa-eye-slash");
                        icon.classList.add("fa-eye");
                    }
                });
            }
        }
    }, 1000);
}); 