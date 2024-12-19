from faker import Faker
import random
import json
from datetime import datetime

# 初始化 Faker 实例
fake = Faker()

def generate_random_hitory():
    history = {
        'user_id': random.randint(1,20),
        'search_keywords': fake.word(),  # 随机价格，范围为 10 到 1000
        'search_time': datetime.now().isoformat(),
        'create_time': datetime.now().isoformat(),
        'update_time': datetime.now().isoformat()
    }
    return history

insert_list=[]

# 生成多个商品
for i in range(100000):
    insert_list.append(generate_random_hitory())
    
# 导出为 JSON 文件
with open('history.json', 'w') as json_file:
    json.dump(insert_list, json_file, indent=4)