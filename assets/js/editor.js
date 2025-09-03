(function($) {
    'use strict';

    $(document).ready(function() {
        const form = $('#oblivion-editor-form');
        const content = $('#content');
        const toolbar = $('.editor-toolbar');

        // 工具栏按钮事件处理
        toolbar.on('click', 'button', function(e) {
            e.preventDefault();
            const command = $(this).data('command');

            switch(command) {
                case 'createLink':
                    const url = prompt('请输入链接地址：');
                    if (url) {
                        document.execCommand('createLink', false, url);
                    }
                    break;
                case 'insertImage':
                    const imageUrl = prompt('请输入图片地址：');
                    if (imageUrl) {
                        document.execCommand('insertImage', false, imageUrl);
                    }
                    break;
                default:
                    document.execCommand(command, false, null);
            }
        });

        // 保存草稿
        $('#save-draft').on('click', function(e) {
            e.preventDefault();
            savePost('draft');
        });

        // 发布文章
        form.on('submit', function(e) {
            e.preventDefault();
            savePost('publish');
        });

        // 保存文章函数
        function savePost(status) {
            const data = {
                action: 'oblivion_save_post',
                nonce: oblivionEditor.nonce,
                post_id: $('input[name="post_id"]').val(),
                title: $('#post-title').val(),
                content: content.html(),
                status: status
            };

            $.ajax({
                url: oblivionEditor.ajaxurl,
                type: 'POST',
                data: data,
                success: function(response) {
                    if (response.success) {
                        alert('文章已保存！');
                        if (response.data.redirect) {
                            window.location.href = response.data.redirect;
                        }
                    } else {
                        alert('保存失败：' + response.data);
                    }
                },
                error: function() {
                    alert('保存失败，请重试');
                }
            });
        }

        // 自动保存
        let autoSaveTimeout;
        content.on('input', function() {
            clearTimeout(autoSaveTimeout);
            autoSaveTimeout = setTimeout(function() {
                savePost('draft');
            }, 30000); // 30秒后自动保存
        });

        // 防止意外关闭
        window.onbeforeunload = function() {
            return '您有未保存的更改，确定要离开吗？';
        };

        // 图片拖放上传
        content.on('dragover', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).addClass('drag-over');
        });

        content.on('dragleave', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');
        });

        content.on('drop', function(e) {
            e.preventDefault();
            e.stopPropagation();
            $(this).removeClass('drag-over');

            const files = e.originalEvent.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });

        function handleFileUpload(file) {
            if (!file.type.startsWith('image/')) {
                alert('只能上传图片文件');
                return;
            }

            const formData = new FormData();
            formData.append('action', 'oblivion_upload_image');
            formData.append('nonce', oblivionEditor.nonce);
            formData.append('file', file);

            $.ajax({
                url: oblivionEditor.ajaxurl,
                type: 'POST',
                data: formData,
                processData: false,
                contentType: false,
                success: function(response) {
                    if (response.success && response.data.url) {
                        document.execCommand('insertImage', false, response.data.url);
                    } else {
                        alert('图片上传失败');
                    }
                },
                error: function() {
                    alert('图片上传失败，请重试');
                }
            });
        }
    });
})(jQuery);
