package org.example;

import com.aliyun.oss.OSS;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
public class OssConfigTest {
    @Autowired
    private OSS ossClient;

    @Test
    void testOssConnection() {
        try {
            // 尝试列出 Bucket（需要 oss:ListBuckets 权限）
            ossClient.listBuckets();
            System.out.println("OSS 连接成功！");
        } catch (Exception e) {
            e.printStackTrace();
        }
    }
}
