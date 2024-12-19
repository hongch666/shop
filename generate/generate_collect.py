from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

def generate_random_collect():
    collect = {
        'user_id': random.randint(1,20),
        'product_id': random.randint(1,20),
        'create_time': datetime.now().isoformat(),
        'update_time': datetime.now().isoformat()
    }
    return collect

insert_list=[]

# 生成多个商品
for i in range(100):
    insert_list.append(generate_random_collect())
    
# 导出为 JSON 文件
with open('collect.json', 'w') as json_file:
    json.dump(insert_list, json_file, indent=4)