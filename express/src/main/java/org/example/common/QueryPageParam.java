package org.example.common;

import lombok.Data;

@Data
public class QueryPageParam {
    // 默认
    private static int PAGE_SIZE=20;
    private static int PAGE_NUM=1;


    private int pageSize;
    private int pageNum;

}
