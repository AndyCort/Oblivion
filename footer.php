    <footer class="site-footer glass">
        <div class="container">
            <div class="footer-content">
                <div class="footer-info">
                    <p><i class="fas fa-copyright"></i> <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.</p>
                    <p><i class="fas fa-code"></i> Powered by <a href="https://www.github.com/andycort/oblivion">Oblivion</a></p>
                    <p><i class="fas fa-paint-brush"></i> Theme by <a href="https://www.github.com/andycort/oblivion">Oblivion</a></p>
                    <p><i class="fas fa-memory"></i> 当前已使用内存: <?php echo round(memory_get_usage() / 1024 / 1024, 2); ?> MB</p>
                    <p><i class="fas fa-network-wired"></i> 访客IP：<?php echo esc_html($_SERVER['REMOTE_ADDR']); ?></p>
                </div>
            </div>
        </div>
    </footer>
    <?php wp_footer(); ?>
</body>
</html>
