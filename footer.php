<footer class="site-footer">
    <div class="footer-content">
        <div class="footer-top">
            <div class="footer-brand">
                <div class="footer-logo">
                    <?php if (has_custom_logo()) : ?>
                        <?php the_custom_logo(); ?>
                    <?php else : ?>
                        <h2 class="footer-site-title"><?php bloginfo('name'); ?></h2>
                    <?php endif; ?>
                </div>
                <p class="footer-description"><?php bloginfo('description'); ?></p>
            </div>
            
            <div class="footer-social">
                <h3>关注我们</h3>
                <div class="social-links">
                    <?php
                    $social_platforms = array(
                        'weibo' => array('fab fa-weibo', '微博'),
                        'twitter' => array('fab fa-twitter', '推特'),
                        'facebook' => array('fab fa-facebook', '脸书'),
                        'github' => array('fab fa-github', 'GitHub')
                    );
                    
                    foreach ($social_platforms as $platform => $info) {
                        $url = get_theme_mod($platform . '_url');
                        if ($url) {
                            echo '<a href="' . esc_url($url) . '" target="_blank" title="' . esc_attr($info[1]) . '">';
                            echo '<i class="' . esc_attr($info[0]) . '"></i>';
                            echo '</a>';
                        }
                    }
                    ?>
                </div>
            </div>
        </div>
        
        <div class="footer-bottom">
            <div class="copyright">
                &copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. All rights reserved.
            </div>
            <div class="powered-by">
                Powered by <a href="https://wordpress.org/">WordPress</a> | Theme: Oblivion
            </div>
        </div>
    </div>
</footer>

<!-- 返回顶部按钮 -->
<button class="back-to-top">
    <i class="fas fa-chevron-up"></i>
</button>

<?php wp_footer(); ?>
</body>
</html> 